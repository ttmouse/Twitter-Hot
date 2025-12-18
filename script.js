// Extract tweet ID from URL
function extractTweetId(url) {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
}

const urlParams = new URLSearchParams(window.location.search);

let apiBaseUrl = '';

function normalizeApiBase(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';
    try {
        const parsed = new URL(trimmed);
        return parsed.origin;
    } catch (e) {
        console.warn('Invalid API base provided, falling back to same origin.');
        return '';
    }
}

(function initializeApiBase() {
    const queryValue = urlParams.get('apiBase');
    if (queryValue !== null) {
        const normalized = normalizeApiBase(queryValue);
        if (normalized) {
            localStorage.setItem('apiBaseUrl', normalized);
            apiBaseUrl = normalized;
        } else {
            localStorage.removeItem('apiBaseUrl');
            apiBaseUrl = '';
        }
    } else {
        apiBaseUrl = localStorage.getItem('apiBaseUrl') || '';
    }
})();

function setApiBaseUrl(value) {
    const normalized = normalizeApiBase(value);
    if (normalized) {
        localStorage.setItem('apiBaseUrl', normalized);
        apiBaseUrl = normalized;
    } else {
        localStorage.removeItem('apiBaseUrl');
        apiBaseUrl = '';
    }
    return apiBaseUrl;
}

function getApiBaseUrl() {
    return apiBaseUrl;
}

function buildApiUrl(path) {
    if (!apiBaseUrl || path.startsWith('http')) {
        return path;
    }
    const base = apiBaseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
}

function apiFetch(path, options) {
    return fetch(buildApiUrl(path), options);
}

window.getApiBaseUrl = getApiBaseUrl;
window.setApiBaseUrl = setApiBaseUrl;
window.apiFetch = apiFetch;
window.buildApiUrl = buildApiUrl;
window.fetchTweetMedia = fetchTweetMedia; // Expose for modal deduplication

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successful) {
                resolve();
            } else {
                reject(new Error('Copy command failed'));
            }
        } catch (err) {
            document.body.removeChild(textarea);
            reject(err);
        }
    });
}

function showCopyFeedback(button, success) {
    if (!button) return;

    const baseLabel = button.dataset.label || 'Copy tweet link';
    const message = success ? 'Link copied' : 'Copy failed';

    button.classList.remove('copied', 'copy-failed');
    button.classList.add(success ? 'copied' : 'copy-failed');
    button.setAttribute('aria-label', message);
    button.title = message;

    clearTimeout(button._copyTimeout);
    button._copyTimeout = setTimeout(() => {
        button.classList.remove('copied', 'copy-failed');
        button.setAttribute('aria-label', baseLabel);
        button.title = baseLabel;
    }, 1500);
}

// Render content based on current view mode
function renderContent(append = false) {
    const contentList = document.getElementById('contentList');
    if (!contentList) return;

    const currentView = localStorage.getItem('viewMode') || 'list';
    updateViewToggleUI(currentView);

    if (!append) {
        contentList.innerHTML = '';
        contentList.className = 'content-list';
    }

    if (currentView === 'gallery') {
        renderImageGallery(contentList, append);
    } else {
        renderTweetList(contentList, append);
    }
}

// Render Standard Tweet List (Masonry) - Optimized for fast rendering
function renderTweetList(container, append = false, startIndex = 0, dateLabel = null) {
    // Create new masonry grid for each day if appending
    let masonryContainer;

    if (append && dateLabel) {
        // Create wrapper for the day section
        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        container.appendChild(daySection);

        // Add date separator to wrapper
        const separator = createDateSeparator(dateLabel);
        daySection.appendChild(separator);

        // Create new masonry grid for this day
        masonryContainer = document.createElement('div');
        masonryContainer.className = 'masonry-grid';
        daySection.appendChild(masonryContainer);
    } else if (append) {
        // Continue with existing masonry grid
        masonryContainer = container.querySelector('.masonry-grid:last-child');

        // Fallback if no grid exists
        if (!masonryContainer) {
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            container.appendChild(daySection);

            masonryContainer = document.createElement('div');
            masonryContainer.className = 'masonry-grid';
            daySection.appendChild(masonryContainer);
        }
    } else {
        // Initial load: clear and create first grid
        container.innerHTML = '';

        // Use the current date if available (usually the first date)
        const dateStr = (typeof currentDate !== 'undefined' && currentDate) ? currentDate : null;

        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        container.appendChild(daySection);

        // Only add separator if we have a date
        if (dateStr) {
            const separator = createDateSeparator(dateStr);
            daySection.appendChild(separator);
        }

        masonryContainer = document.createElement('div');
        masonryContainer.className = 'masonry-grid';
        daySection.appendChild(masonryContainer);
    }

    // Calculate the starting tweet index for this render
    const tweetsToRender = tweetUrls.slice(startIndex);

    // 首屏优先策略：立即渲染前8个，其余用requestIdleCallback
    const visibleCount = 8;
    const visibleTweets = tweetsToRender.slice(0, visibleCount);
    const remainingTweets = tweetsToRender.slice(visibleCount);

    // 立即渲染首屏内容（前8个）
    visibleTweets.forEach((url, index) => {
        const actualIndex = startIndex + index;
        // 只给前3个保留微小延迟增加动画感
        const delay = index < 3 ? index * 15 : 0;

        setTimeout(() => {
            renderTweetCard(url, actualIndex, masonryContainer);
        }, delay);
    });

    // 使用requestIdleCallback渲染剩余内容（或降级到setTimeout）
    const renderRemaining = () => {
        remainingTweets.forEach((url, index) => {
            const actualIndex = startIndex + visibleCount + index;
            renderTweetCard(url, actualIndex, masonryContainer);
        });
    };

    if (remainingTweets.length > 0) {
        if (window.requestIdleCallback) {
            requestIdleCallback(renderRemaining, { timeout: 1000 });
        } else {
            setTimeout(renderRemaining, 100);
        }
    }
}

// 提取渲染单个tweet卡片的逻辑
function renderTweetCard(url, actualIndex, masonryContainer) {
    const contentItem = document.createElement('div');
    contentItem.className = 'masonry-item';
    contentItem.style.opacity = '0';

    contentItem.innerHTML = `
        <div class="tweet-embed-container" id="tweet-container-${actualIndex}" data-tweet-url="${url}" data-tweet-index="${actualIndex}">
            <div class="tweet-loading">
                <div class="loading-spinner"></div>
                <span>Loading...</span>
            </div>
            <div id="tweet-target-${actualIndex}"></div>
        </div>
    `;
    masonryContainer.appendChild(contentItem);

    // Trigger fade-in animation
    requestAnimationFrame(() => {
        contentItem.style.transition = 'opacity 0.3s ease-out';
        requestAnimationFrame(() => {
            contentItem.style.opacity = '1';
        });
    });

    // Setup observer for this specific card
    setupLazyLoadingForTweet(contentItem.querySelector('.tweet-embed-container'));
}

// Create date separator element
function createDateSeparator(dateStr) {
    const separator = document.createElement('div');
    separator.className = 'date-separator';

    // Format date for display
    const date = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    separator.innerHTML = `
        <div class="date-separator-line"></div>
        <div class="date-separator-text">${formattedDate}</div>
        <button class="copy-day-btn" title="Download this day's content as image" aria-label="Download as image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        </button>
        <div class="date-separator-line"></div>
    `;

    const copyBtn = separator.querySelector('.copy-day-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            // Find the parent section which contains both the separator and the content grid
            const targetContainer = separator.closest('.day-section');
            if (targetContainer) {
                downloadDayAsImage(copyBtn, targetContainer, formattedDate);
            } else {
                // Fallback for unexpected structure
                const nextSibling = separator.nextElementSibling;
                if (nextSibling && (nextSibling.classList.contains('masonry-grid') || nextSibling.classList.contains('image-gallery-grid'))) {
                    downloadDayAsImage(copyBtn, nextSibling, formattedDate);
                }
            }
        });
    }

    return separator;
}

// Render Image Gallery - Optimized for fast rendering
function renderImageGallery(container, append = false, startIndex = 0, dateLabel = null) {
    // Cleanup old gallery observer if not appending
    if (!append && galleryObserverInstance) {
        galleryObserverInstance.disconnect();
        galleryObserverInstance = null;
        console.log('[Gallery] Cleaned up old observer');
    }

    // Create new gallery grid for each day if appending
    let galleryContainer;

    if (append && dateLabel) {
        // Create wrapper for the day section
        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        container.appendChild(daySection);

        // Add date separator
        const separator = createDateSeparator(dateLabel);
        daySection.appendChild(separator);

        // Create new gallery grid for this day
        galleryContainer = document.createElement('div');
        galleryContainer.className = 'image-gallery-grid';
        daySection.appendChild(galleryContainer);
    } else if (append) {
        // Continue with existing gallery grid
        galleryContainer = container.querySelector('.image-gallery-grid:last-child');

        // Fallback if no grid exists
        if (!galleryContainer) {
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            container.appendChild(daySection);

            galleryContainer = document.createElement('div');
            galleryContainer.className = 'image-gallery-grid';
            daySection.appendChild(galleryContainer);
        }
    } else {
        // Initial load: clear and create first grid
        container.innerHTML = '';

        // Use the current date if available (usually the first date)
        const dateStr = (typeof currentDate !== 'undefined' && currentDate) ? currentDate : null;

        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        container.appendChild(daySection);

        // Only add separator if we have a date
        if (dateStr) {
            const separator = createDateSeparator(dateStr);
            daySection.appendChild(separator);
        }

        galleryContainer = document.createElement('div');
        galleryContainer.className = 'image-gallery-grid';
        daySection.appendChild(galleryContainer);
    }

    galleryObserverInstance = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const wrapper = entry.target;
            galleryObserverInstance.unobserve(wrapper);

            const tweetId = wrapper.dataset.tweetId;
            if (!tweetId) return;

            const placeholder = wrapper.querySelector('.gallery-thumb-placeholder');
            const indicator = wrapper.querySelector('.gallery-multi-indicator');

            fetchTweetMedia(tweetId)
                .then(result => {
                    if (!placeholder) return;

                    // Extract images from result (supports both old array format and new object format)
                    const images = result?.images || result || [];

                    if (!images || images.length === 0) {
                        placeholder.innerHTML = '<div class="gallery-empty">No images found</div>';
                        return;
                    }

                    // 简单纵向显示所有图片，添加淡入动画
                    const imagesHTML = images.map((mediaItem, i) => {
                        const imgUrl = typeof mediaItem === 'string' ? mediaItem : mediaItem.url;
                        const mediaType = typeof mediaItem === 'object' ? mediaItem.type : 'image';

                        if (mediaType === 'video') {
                            return `
                                <div class="gallery-video-wrapper" style="position:relative;">
                                    <img src="${imgUrl}" alt="Video thumbnail ${i + 1}" class="gallery-simple-img" style="opacity: 0;">
                                    <div class="gallery-video-indicator" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;background:rgba(0,0,0,0.7);border-radius:50%;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);pointer-events:none;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                </div>
                            `;
                        }

                        return `<img src="${imgUrl}" alt="Tweet image ${i + 1}" class="gallery-simple-img" style="opacity: 0;">`;
                    }).join('');

                    placeholder.innerHTML = imagesHTML;

                    // Sync data to dataset so modal can use it instantly without re-fetching
                    if (result && result.fullData) {
                        wrapper.dataset.tweetData = JSON.stringify(result.fullData);
                        wrapper.dataset.cachedMedia = JSON.stringify(images);
                        delete wrapper.dataset.loading;
                        console.log('[Gallery] Data synced to wrapper for tweetId:', tweetId);
                    }

                    // 为每张图片添加加载完成后的淡入动画
                    const imgElements = placeholder.querySelectorAll('img');
                    imgElements.forEach((img, i) => {
                        const handleLoad = () => {
                            setTimeout(() => {
                                img.style.transition = 'opacity 0.4s ease-out';
                                img.style.opacity = '1';
                            }, i * 50);
                        };

                        img.onload = handleLoad;
                        img.onerror = () => {
                            img.style.opacity = '0.3';
                        };

                        if (img.complete && img.naturalWidth > 0) {
                            handleLoad();
                        }
                    });

                    // 显示总数指示器
                    if (indicator && images.length > 1) {
                        indicator.textContent = `${images.length}`;
                        indicator.removeAttribute('hidden');
                    }
                })
                .catch(() => {
                    if (placeholder) {
                        placeholder.innerHTML = '<div class="gallery-empty">Failed to load</div>';
                    }
                });
        });
    }, { rootMargin: '200px' });

    // 首屏优先策略：立即渲染前12个
    const tweetsToRender = tweetUrls.slice(startIndex);
    const visibleCount = 12;
    const visibleItems = tweetsToRender.slice(0, visibleCount);
    const remainingItems = tweetsToRender.slice(visibleCount);

    // 渲染单个gallery item的函数
    const renderGalleryItem = (url, tweetIndex, delay = 0) => {
        setTimeout(() => {
            const wrapper = document.createElement('div');
            wrapper.className = 'gallery-item';
            wrapper.style.opacity = '0';

            const tweetId = extractTweetId(url);
            if (tweetId) {
                wrapper.dataset.tweetId = tweetId;
                wrapper.dataset.tweetIndex = tweetIndex;
                wrapper.dataset.tweetUrl = url; // Store URL for modal navigation
                wrapper.dataset.loading = 'true'; // Mark for modal loading logic

                // Check for cached media to speed up modal thumbnails
                const cached = tweetMediaCache.get(tweetId);
                if (cached && (cached.images || cached.data)) {
                    if (cached.images) {
                        wrapper.dataset.cachedMedia = JSON.stringify(cached.images);
                    }
                    if (cached.data) {
                        wrapper.dataset.tweetData = JSON.stringify(cached.data);
                        delete wrapper.dataset.loading;
                    }
                }
            }

            wrapper.innerHTML = `
                <button type="button" class="gallery-thumb">
                    <div class="gallery-multi-indicator" hidden></div>
                    <div class="gallery-thumb-placeholder">
                        <div class="loading-spinner small"></div>
                    </div>
                </button>
                <div class="gallery-icon-group">
                    <button type="button"
                        class="gallery-icon-button gallery-copy-icon"
                        aria-label="Copy tweet link"
                        title="Copy tweet link"
                        data-label="Copy tweet link"
                        data-url="${url}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 1H6a3 3 0 0 0-3 3v11h2V4a1 1 0 0 1 1-1h10V1zm4 4H10a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm1 15a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v12z"/>
                        </svg>
                    </button>
                    <a href="${url}"
                        target="_blank"
                        rel="noopener"
                        class="gallery-icon-button gallery-link-icon"
                        aria-label="Open tweet"
                        title="Open tweet">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                </div>
            `;
            galleryContainer.appendChild(wrapper);

            // Fade in animation
            requestAnimationFrame(() => {
                wrapper.style.transition = 'opacity 0.3s ease-out';
                requestAnimationFrame(() => {
                    wrapper.style.opacity = '1';
                });
            });

            const thumb = wrapper.querySelector('.gallery-thumb');
            if (thumb) {
                thumb.addEventListener('click', () => {
                    console.log('[Gallery Click] Clicked on gallery item, tweetId:', tweetId, 'tweetIndex:', tweetIndex);
                    if (tweetId && typeof openTweetDetail === 'function') {
                        console.log('[Gallery Click] Opening gallery tweet detail...');
                        openGalleryTweetDetail(tweetId, url, tweetIndex);
                    } else if (tweetId) {
                        console.log('[Gallery Click] Fallback to image viewer');
                        openImageViewer(tweetId, url, tweetIndex);
                    } else {
                        console.log('[Gallery Click] Opening in new tab');
                        window.open(url, '_blank');
                    }
                });
            }

            const copyBtn = wrapper.querySelector('.gallery-copy-icon');
            if (copyBtn) {
                copyBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const linkToCopy = copyBtn.dataset.url || url;
                    copyToClipboard(linkToCopy)
                        .then(() => showCopyFeedback(copyBtn, true))
                        .catch(() => showCopyFeedback(copyBtn, false));
                });
            }

            if (tweetId) {
                galleryObserverInstance.observe(wrapper);
            } else {
                const placeholder = wrapper.querySelector('.gallery-thumb-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = '<div class="gallery-empty">Preview unavailable</div>';
                }
            }
        }, delay);
    };

    // 立即渲染首屏
    visibleItems.forEach((url, index) => {
        const tweetIndex = startIndex + index;
        const delay = index < 4 ? index * 10 : 0; // 前4个有小延迟
        renderGalleryItem(url, tweetIndex, delay);
    });

    // 剩余部分用requestIdleCallback
    if (remainingItems.length > 0) {
        const renderRemaining = () => {
            remainingItems.forEach((url, index) => {
                const tweetIndex = startIndex + visibleCount + index;
                renderGalleryItem(url, tweetIndex, 0);
            });
        };

        if (window.requestIdleCallback) {
            requestIdleCallback(renderRemaining, { timeout: 1000 });
        } else {
            setTimeout(renderRemaining, 100);
        }
    }
}

function fetchTweetMedia(tweetId) {
    if (!tweetId) return Promise.resolve({ images: [], fullData: null });

    const cached = tweetMediaCache.get(tweetId);
    if (cached) {
        if (cached.data) {
            // Return both full data and images
            return Promise.resolve({
                images: cached.images,
                fullData: cached.data
            });
        }
        if (cached.promise) {
            return cached.promise;
        }
    }

    const promise = apiFetch(`/api/tweet_info?id=${tweetId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch tweet info');
            }
            return res.json();
        })
        .then(data => {
            const images = extractImageUrlsFromTweetInfo(data);
            // Only update cache if our promise is still the current one (avoid race condition)
            const currentCache = tweetMediaCache.get(tweetId);
            if (currentCache && currentCache.promise === promise) {
                tweetMediaCache.set(tweetId, { images, data });
            }
            return {
                images,
                fullData: data
            };
        })
        .catch(error => {
            console.error('Error fetching tweet media:', error);
            // Only delete if our promise is still the current one (avoid race condition)
            const currentCache = tweetMediaCache.get(tweetId);
            if (currentCache && currentCache.promise === promise) {
                tweetMediaCache.delete(tweetId);
            }
            throw error;
        });

    tweetMediaCache.set(tweetId, { promise });
    return promise;
}

function extractImageUrlsFromTweetInfo(data) {
    const images = [];
    if (data && Array.isArray(data.media_extended)) {
        data.media_extended.forEach(media => {
            if (media) {
                // 处理图片
                if (media.type === 'image' && media.url) {
                    images.push({
                        url: media.url,
                        type: 'image'
                    });
                }
                // 处理视频 - 提取缩略图
                else if (media.type === 'video') {
                    const thumbnailUrl = media.thumbnail_url || media.url;
                    if (thumbnailUrl) {
                        images.push({
                            url: thumbnailUrl,
                            type: 'video'
                        });
                    }
                }
            }
        });
    }

    if (images.length === 0 && Array.isArray(data && data.mediaURLs)) {
        data.mediaURLs.forEach(url => {
            if (typeof url === 'string') {
                images.push({
                    url: url,
                    type: 'image' // 降级方案默认为图片
                });
            }
        });
    }

    return images;
}

function ensureImageViewer() {
    if (imageViewerEl) return imageViewerEl;

    imageViewerEl = document.createElement('div');
    imageViewerEl.id = 'imageViewer';
    imageViewerEl.className = 'image-viewer';
    imageViewerEl.setAttribute('aria-hidden', 'true');
    imageViewerEl.innerHTML = `
        <div class="image-viewer-dialog" role="dialog" aria-modal="true">
            <button class="viewer-close" aria-label="Close viewer">&times;</button>
            <div class="viewer-stage">
                <button class="viewer-nav prev" aria-label="Scroll left">&#10094;</button>
                <div class="viewer-scroll-container">
                    <div class="viewer-placeholder">
                        <div class="loading-spinner small"></div>
                        <span class="viewer-placeholder-text">Loading images...</span>
                    </div>
                    <div class="viewer-images-track"></div>
                </div>
                <button class="viewer-nav next" aria-label="Scroll right">&#10095;</button>
            </div>
            <div class="viewer-meta">
                <span class="viewer-counter">0 images</span>
                <a href="#" target="_blank" rel="noopener" class="viewer-link">Open Tweet</a>
            </div>
        </div>
    `;

    document.body.appendChild(imageViewerEl);

    const closeBtn = imageViewerEl.querySelector('.viewer-close');
    const prevBtn = imageViewerEl.querySelector('.viewer-nav.prev');
    const nextBtn = imageViewerEl.querySelector('.viewer-nav.next');
    const scrollContainer = imageViewerEl.querySelector('.viewer-scroll-container');

    closeBtn.addEventListener('click', closeImageViewer);
    imageViewerEl.addEventListener('click', (event) => {
        if (event.target === imageViewerEl) {
            closeImageViewer();
        }
    });

    // 横向滚动控制
    prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -scrollContainer.offsetWidth * 0.8, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: scrollContainer.offsetWidth * 0.8, behavior: 'smooth' });
    });

    // 更新导航按钮状态
    scrollContainer.addEventListener('scroll', () => updateScrollNavButtons());

    document.addEventListener('keydown', handleViewerKeydown);

    return imageViewerEl;
}

// ============================================
// Gallery Tweet Detail Modal (使用新的模态框组件)
// ============================================

// 为 Gallery 模式提供 toggleItemStyle 的存根函数
// 在 Gallery 视图中，我们不需要真正的样式切换，因为所有卡片始终选中
window.toggleItemStyle = function (checkbox) {
    // Gallery 模式下的空实现 - 所有卡片始终选中
    console.log('[Gallery] toggleItemStyle called for:', checkbox?.value);
};

async function openGalleryTweetDetail(tweetId, url, clickedIndex) {
    console.log('[Gallery Modal] Opening detail for tweetId:', tweetId, 'index:', clickedIndex);

    try {
        // Get all Gallery cards
        const allGalleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        console.log('[Gallery Modal] Found', allGalleryItems.length, 'gallery items');

        if (allGalleryItems.length === 0) {
            console.error('[Gallery Modal] No cards found');
            throw new Error('No cards to display');
        }

        // Find the clicked card index (using tweetIndex dataset or matching tweetId)
        const finalIndex = allGalleryItems.findIndex(item =>
            item.dataset.tweetId === tweetId || parseInt(item.dataset.tweetIndex) === clickedIndex
        );

        const indexToOpen = finalIndex >= 0 ? finalIndex : 0;
        const clickedCard = allGalleryItems[indexToOpen];

        // Ensure we have some initial data for the display
        let initialData = { user_name: 'Loading...' };
        if (clickedCard.dataset.tweetData) {
            try {
                initialData = JSON.parse(clickedCard.dataset.tweetData);
            } catch (e) { }
        } else {
            // Check cache
            const cached = tweetMediaCache.get(tweetId);
            if (cached && cached.data) {
                initialData = cached.data;
                clickedCard.dataset.tweetData = JSON.stringify(cached.data);
            }
        }

        console.log('[Gallery Modal] Calling openTweetDetail directly with index:', indexToOpen);

        // Directly call openTweetDetail (now globally available)
        if (typeof openTweetDetail === 'function') {
            openTweetDetail(initialData, url, indexToOpen, allGalleryItems);
        } else {
            console.error('[Gallery Modal] openTweetDetail not found!');
            throw new Error('Modal component missing');
        }

        // Preload adjacent cards in background
        preloadAdjacentCards(allGalleryItems, indexToOpen);

    } catch (error) {
        console.error('[Gallery Modal] Error opening detail:', error);
        showToast('Failed to load tweet details. Using fallback...', 'warning');
        openImageViewer(tweetId, url, clickedIndex);
    }
}

// Preload adjacent cards for smoother navigation
function preloadAdjacentCards(cards, currentIndex, range = 3) {
    const indices = [];

    // Preload cards before and after current card
    for (let i = 1; i <= range; i++) {
        if (currentIndex - i >= 0) indices.push(currentIndex - i);
        if (currentIndex + i < cards.length) indices.push(currentIndex + i);
    }

    // Load in background with concurrency control (max 2 concurrent)
    const MAX_CONCURRENT_PRELOADS = 2;

    const loadCard = async (index) => {
        const card = cards[index];
        // Skip if already loaded or no loading flag
        if (!card || !card.dataset.loading) return;

        const itemTweetId = card.dataset.tweetId;

        // Check cache first
        const cachedData = tweetMediaCache.get(itemTweetId);
        if (cachedData && cachedData.data) {
            // Use cached data
            card.dataset.tweetData = JSON.stringify(cachedData.data);
            delete card.dataset.loading;
            console.log('[Gallery Modal] Preloaded card', index, 'from cache, tweetId:', itemTweetId);
            return;
        }

        // Load from API if not cached using apiFetch
        try {
            const response = await apiFetch(`/api/tweet_info?id=${itemTweetId}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const tweetData = await response.json();

            card.dataset.tweetData = JSON.stringify(tweetData);
            delete card.dataset.loading;
            // Update cache
            tweetMediaCache.set(itemTweetId, {
                images: extractImageUrlsFromTweetInfo(tweetData),
                data: tweetData
            });
            console.log('[Gallery Modal] Preloaded card', index, 'from API, tweetId:', itemTweetId);

            // Notify modal to update thumbnail if it's open
            if (typeof window.updateThumbnail === 'function') {
                window.updateThumbnail(index);
            }
        } catch (error) {
            console.warn('[Gallery Modal] Failed to preload card', index, error);
        }
    };

    // Process in batches to limit concurrency
    (async () => {
        for (let i = 0; i < indices.length; i += MAX_CONCURRENT_PRELOADS) {
            const batch = indices.slice(i, i + MAX_CONCURRENT_PRELOADS);
            await Promise.allSettled(batch.map(loadCard));
        }
    })();
}

// ============================================
// Image Viewer (Original simple image viewer)
// ============================================

function openImageViewer(tweetId, tweetUrl, tweetIndex = -1) {
    const viewer = ensureImageViewer();
    const placeholder = viewer.querySelector('.viewer-placeholder');
    const placeholderText = viewer.querySelector('.viewer-placeholder-text');
    const spinner = viewer.querySelector('.viewer-placeholder .loading-spinner');
    const imagesTrack = viewer.querySelector('.viewer-images-track');
    const counterEl = viewer.querySelector('.viewer-counter');
    const linkEl = viewer.querySelector('.viewer-link');

    imageViewerState.tweetId = tweetId;
    imageViewerState.tweetUrl = tweetUrl;
    imageViewerState.tweetIndex = tweetIndex;
    imageViewerState.images = [];
    imageViewerState.index = 0;

    linkEl.href = tweetUrl;
    placeholder.classList.remove('error');
    placeholder.style.display = 'flex';
    placeholderText.textContent = 'Loading images...';
    if (spinner) spinner.style.display = 'block';
    imagesTrack.innerHTML = '';
    imagesTrack.style.display = 'none';
    counterEl.textContent = '0 images';
    viewer.querySelectorAll('.viewer-nav').forEach(btn => btn.disabled = true);

    viewer.classList.add('visible');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('viewer-open');

    fetchTweetMedia(tweetId)
        .then(result => {
            // Extract images from result (supports both old array format and new object format)
            const images = result?.images || result || [];
            imageViewerState.images = images;
            if (!imageViewerEl || !imageViewerEl.classList.contains('visible')) {
                return;
            }
            if (!images || images.length === 0) {
                placeholder.classList.add('error');
                placeholderText.textContent = 'No images available';
                if (spinner) spinner.style.display = 'none';
                return;
            }
            updateImageViewer();
        })
        .catch(() => {
            if (!imageViewerEl || !imageViewerEl.classList.contains('visible')) {
                return;
            }
            placeholder.classList.add('error');
            placeholderText.textContent = 'Failed to load images';
            if (spinner) spinner.style.display = 'none';
        });
}

function closeImageViewer() {
    if (!imageViewerEl) return;
    imageViewerEl.classList.remove('visible');
    imageViewerEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('viewer-open');
}

function updateImageViewer() {
    if (!imageViewerEl || !imageViewerEl.classList.contains('visible')) return;

    const imagesTrack = imageViewerEl.querySelector('.viewer-images-track');
    const placeholder = imageViewerEl.querySelector('.viewer-placeholder');
    const placeholderText = imageViewerEl.querySelector('.viewer-placeholder-text');
    const spinner = imageViewerEl.querySelector('.viewer-placeholder .loading-spinner');
    const counterEl = imageViewerEl.querySelector('.viewer-counter');

    const total = imageViewerState.images.length;

    if (!total) {
        placeholder.classList.add('error');
        placeholder.style.display = 'flex';
        placeholderText.textContent = 'No images available';
        if (spinner) spinner.style.display = 'none';
        imagesTrack.style.display = 'none';
        counterEl.textContent = '0 images';
        return;
    }

    placeholder.style.display = 'none';
    if (spinner) spinner.style.display = 'none';
    imagesTrack.style.display = 'flex';
    counterEl.textContent = `${total} image${total > 1 ? 's' : ''}`;

    // 创建所有图片容器
    imagesTrack.innerHTML = imageViewerState.images.map((mediaItem, index) => {
        const imgUrl = typeof mediaItem === 'string' ? mediaItem : mediaItem.url;
        return `
        <div class="viewer-image-item" data-index="${index}">
            <div class="viewer-image-loading">
                <div class="loading-spinner small"></div>
            </div>
            <img class="viewer-image" data-src="${imgUrl}" alt="Tweet image ${index + 1}">
        </div>
        `;
    }).join('');

    // 设置懒加载观察器
    setupImageLazyLoading();
    updateScrollNavButtons();

    // 确保滚动到第一张图片的位置 - 使用 requestAnimationFrame 确保 DOM 更新完成
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const scrollContainer = imageViewerEl.querySelector('.viewer-scroll-container');
            if (scrollContainer) {
                scrollContainer.scrollLeft = 0;
                scrollContainer.scrollTo({ left: 0, behavior: 'instant' });
            }
        });
    });
}

// 图片懒加载
function setupImageLazyLoading() {
    const scrollContainer = imageViewerEl.querySelector('.viewer-scroll-container');
    const imageItems = imageViewerEl.querySelectorAll('.viewer-image-item');

    // 立即加载第一张图片
    if (imageItems.length > 0) {
        const firstItem = imageItems[0];
        const firstImg = firstItem.querySelector('.viewer-image');
        const firstLoading = firstItem.querySelector('.viewer-image-loading');
        const firstSrc = firstImg.dataset.src;

        if (firstSrc) {
            firstImg.onload = () => {
                firstImg.style.transition = 'opacity 0.5s ease-out';
                firstImg.style.opacity = '0';
                firstImg.style.display = 'block';
                if (firstLoading) firstLoading.style.display = 'none';
                // Trigger fade-in
                requestAnimationFrame(() => {
                    firstImg.style.opacity = '1';
                });
            };
            firstImg.onerror = () => {
                if (firstLoading) {
                    firstLoading.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">Failed to load</span>';
                }
            };
            firstImg.src = firstSrc;
        }
    }

    // 其余图片使用懒加载
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const imgItem = entry.target;
                const img = imgItem.querySelector('.viewer-image');
                const loadingSpinner = imgItem.querySelector('.viewer-image-loading');
                const src = img.dataset.src;

                if (src && !img.src) {
                    img.onload = () => {
                        img.style.transition = 'opacity 0.5s ease-out';
                        img.style.opacity = '0';
                        img.style.display = 'block';
                        if (loadingSpinner) loadingSpinner.style.display = 'none';
                        // Trigger fade-in
                        requestAnimationFrame(() => {
                            img.style.opacity = '1';
                        });
                    };
                    img.onerror = () => {
                        if (loadingSpinner) {
                            loadingSpinner.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">Failed to load</span>';
                        }
                    };
                    img.src = src;
                }
                imageObserver.unobserve(imgItem);
            }
        });
    }, {
        root: scrollContainer,
        rootMargin: '200px' // 提前200px开始加载
    });

    // 从第二张图片开始观察（索引1开始）
    imageItems.forEach((item, index) => {
        if (index > 0) {
            imageObserver.observe(item);
        }
    });
}

// 更新滚动导航按钮状态
function updateScrollNavButtons() {
    if (!imageViewerEl) return;

    const scrollContainer = imageViewerEl.querySelector('.viewer-scroll-container');
    const prevBtn = imageViewerEl.querySelector('.viewer-nav.prev');
    const nextBtn = imageViewerEl.querySelector('.viewer-nav.next');

    if (!scrollContainer || !prevBtn || !nextBtn) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

    prevBtn.disabled = scrollLeft <= 0;
    nextBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
}

function handleViewerKeydown(event) {
    if (!imageViewerEl || !imageViewerEl.classList.contains('visible')) return;
    const scrollContainer = imageViewerEl.querySelector('.viewer-scroll-container');

    if (event.key === 'Escape') {
        event.preventDefault();
        closeImageViewer();
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollContainer.scrollBy({ left: scrollContainer.offsetWidth * 0.8, behavior: 'smooth' });
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollContainer.scrollBy({ left: -scrollContainer.offsetWidth * 0.8, behavior: 'smooth' });
    } else if (event.key === 'ArrowUp') {
        // 上键：切换到上一条推文
        event.preventDefault();
        navigateToAdjacentTweet(-1);
    } else if (event.key === 'ArrowDown') {
        // 下键：切换到下一条推文
        event.preventDefault();
        navigateToAdjacentTweet(1);
    }
}

// 切换到相邻推文
function navigateToAdjacentTweet(direction) {
    const currentIndex = imageViewerState.tweetIndex;
    if (currentIndex === -1 || tweetUrls.length === 0) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= tweetUrls.length) return; // 已经是第一条或最后一条

    const nextUrl = tweetUrls[nextIndex];
    const nextTweetId = extractTweetId(nextUrl);

    if (nextTweetId) {
        openImageViewer(nextTweetId, nextUrl, nextIndex);
    }
}

// Update Toggle UI
function updateViewToggleUI(view) {
    document.querySelectorAll('.view-btn').forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
            btn.style.background = 'var(--bg-card)';
            btn.style.color = 'var(--text-primary)';
            btn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.boxShadow = 'none';
        }
    });
}

// Setup lazy loading for a single tweet
function setupLazyLoadingForTweet(container) {
    if (!container) return;

    const observerOptions = {
        root: null,
        rootMargin: '200px',
        threshold: 0.01
    };

    const tweetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('loaded') && !entry.target.classList.contains('loading')) {
                const container = entry.target;
                const url = container.getAttribute('data-tweet-url');
                const index = parseInt(container.getAttribute('data-tweet-index'));

                container.classList.add('loading');

                const loadingSpan = container.querySelector('.tweet-loading span');
                if (loadingSpan) {
                    loadingSpan.textContent = 'Loading tweet...';
                }

                loadTweet(url, container, index);
                tweetObserver.unobserve(container);
            }
        });
    }, observerOptions);

    tweetObserver.observe(container);
}

// Legacy function for backward compatibility
function setupLazyLoadingForTweets() {
    const observerOptions = {
        root: null,
        rootMargin: '200px',
        threshold: 0.01
    };

    const tweetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('loaded') && !entry.target.classList.contains('loading')) {
                const container = entry.target;
                const url = container.getAttribute('data-tweet-url');
                const index = parseInt(container.getAttribute('data-tweet-index'));

                container.classList.add('loading');

                const loadingSpan = container.querySelector('.tweet-loading span');
                if (loadingSpan) {
                    loadingSpan.textContent = 'Loading tweet...';
                }

                loadTweet(url, container, index);
                tweetObserver.unobserve(container);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.tweet-embed-container').forEach(container => {
        tweetObserver.observe(container);
    });
}

// Load embedded tweet using Twitter's widget
function loadTweet(url, container, index) {
    const tweetId = extractTweetId(url);

    if (!tweetId) {
        container.innerHTML = '<p class="tweet-error">Failed to load tweet, please refresh</p>';
        container.classList.add('loaded');
        container.classList.remove('loading');
        return;
    }

    const target = document.getElementById(`tweet-target-${index}`);
    const loading = container.querySelector('.tweet-loading');

    // Check if Twitter script failed to load (e.g. blocked by ad blocker)
    if (window.twitterScriptFailed) {
        container.innerHTML = `
            <div class="tweet-error" style="padding: 20px; text-align: center; color: var(--text-secondary);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 8px; opacity: 0.7;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <p>Tweet blocked by content blocker</p>
                <p style="font-size: 0.8rem; margin-top: 4px;">Please disable AdBlock to view tweets</p>
            </div>
        `;
        container.classList.add('loaded');
        container.classList.remove('loading');
        return;
    }

    const renderTweet = () => {
        window.twttr.widgets.createTweet(
            tweetId,
            target,
            {
                theme: 'dark',
                dnt: true,
                conversation: 'none',
                cards: 'visible',
                align: 'center',
                width: '100%'
            }
        ).then(function (el) {
            // Remove loading spinner after tweet loads
            if (loading) {
                loading.remove();
            }
            if (el) {
                container.classList.add('loaded');
                container.classList.remove('loading');
                // Ensure proper alignment after loading
                container.parentElement.style.alignSelf = 'flex-start';
            } else {
                container.innerHTML = '<p class="tweet-error">Failed to load tweet, please refresh</p>';
                container.classList.add('loaded');
                container.classList.remove('loading');
            }
        });
    };

    // Load the tweet using Twitter's widget
    if (window.twttr && window.twttr.widgets) {
        renderTweet();
    } else {
        // Wait for Twitter widget to load
        const checkTwitter = setInterval(() => {
            if (window.twttr && window.twttr.widgets) {
                clearInterval(checkTwitter);
                renderTweet();
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkTwitter);
            if (!container.classList.contains('loaded') && container.querySelector('.tweet-loading')) {
                container.innerHTML = '<p class="tweet-error">Load timeout, please refresh</p>';
                container.classList.add('loaded');
                container.classList.remove('loading');
            }
        }, 10000);
    }
}

// Global State
const paramDate = urlParams.get('date');
let currentDate = (paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate)) ? paramDate : null; // Will be set to latest date if null
const tweetUrls = [];
let availableDates = [];

// LRU Cache implementation for tweet media
class LRUCache {
    constructor(maxSize = 150) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return undefined;
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key, value) {
        // Delete if exists (to re-insert at end)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Check size and evict oldest if needed
        else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            console.log('[LRU Cache] Evicted oldest entry:', firstKey);
        }
        this.cache.set(key, value);
    }

    has(key) {
        return this.cache.has(key);
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    get size() {
        return this.cache.size;
    }
}

const tweetMediaCache = new LRUCache(150);

// Gallery observer instance for cleanup
let galleryObserverInstance = null;

let imageViewerEl = null;
const imageViewerState = {
    tweetId: null,
    tweetUrl: '',
    tweetIndex: -1, // 当前推文在 tweetUrls 中的索引
    images: [],
    index: 0
};

// Expose cache and utility function to window for modal access
window.tweetMediaCache = tweetMediaCache;
window.extractImageUrlsFromTweetInfo = extractImageUrlsFromTweetInfo;

// Infinite scroll state
let currentDateIndex = 0; // Index in availableDates array
let isLoadingMore = false;
let hasMoreDates = true;
let loadedDates = new Set(); // Track loaded dates to avoid duplicates
window.preloadSessionId = 0; // Control background loading chain

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the main page (index.html)
    if (document.getElementById('contentList')) {
        // Setup view toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                localStorage.setItem('viewMode', view);
                renderContent();
            });
        });

        setupDateTabsNavigation();
        // loadAvailableDates will handle loading content for the current/latest date
        loadAvailableDates();
        setupMobileStickyNav();
        setupInfiniteScroll();
    }

    // Check if we are on the admin page (admin.html)
    if (document.getElementById('publishBtn')) {
        // Admin page initialization is handled inline in admin.html
        // No additional initialization needed here
    }
});

// Setup Mobile Sticky Navigation
function setupMobileStickyNav() {
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileNav) return;

    let lastScroll = 0;
    const scrollThreshold = 200; // Show nav after scrolling 200px

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > scrollThreshold) {
            mobileNav.classList.add('visible');
            document.body.classList.add('nav-visible');
        } else {
            mobileNav.classList.remove('visible');
            document.body.classList.remove('nav-visible');
        }

        lastScroll = currentScroll;
    });
}

// Setup infinite scroll
function setupInfiniteScroll() {
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        // Clear previous timeout
        clearTimeout(scrollTimeout);

        // Debounce scroll events
        scrollTimeout = setTimeout(() => {
            // Check if user scrolled near bottom
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            // Load more when within 2500px of bottom (提前预加载，避免用户等待)
            if (scrollHeight - (scrollTop + clientHeight) < 2500) {
                // Preload up to 3 days ahead to satisfy user expectation of smooth browsing
                loadNextDate(3);
            }
        }, 150); // 减少debounce时间，更快响应
    });
}

/**
 * Load next date's content
 * @param {number} lookaheadCount - How many additional days to load sequentially (default 1)
 * @param {number} sessionId - Current background load session ID
 */
function loadNextDate(lookaheadCount = 1, sessionId = null) {
    // If sessionId is provided, ONLY continue if it matches current global ID
    if (sessionId !== null && sessionId !== window.preloadSessionId) {
        console.log('[Background Load] Session expired, stopping chain');
        return;
    }

    // Check if already loading or no more dates
    if (isLoadingMore || !hasMoreDates) {
        // If we are already loading but still have lookahead budget, we'll be triggered again by loadContentForDate's completion
        return;
    }

    // Find next date that hasn't been loaded
    currentDateIndex++;

    if (currentDateIndex >= availableDates.length) {
        hasMoreDates = false;
        console.log('[Infinite Scroll] No more dates available');
        showEndOfContentMessage();
        return;
    }

    const nextDate = availableDates[currentDateIndex].date;
    console.log('[Infinite Scroll] Loading next date:', nextDate, 'index:', currentDateIndex, '/', availableDates.length, 'Lookahead remaining:', lookaheadCount - 1);

    // Check if already loaded
    if (loadedDates.has(nextDate)) {
        console.log('[Infinite Scroll] Date already loaded, trying next...');
        // Try next date, preserving lookahead count
        loadNextDate(lookaheadCount);
        return;
    }

    isLoadingMore = true;
    loadedDates.add(nextDate);

    // Show loading indicator
    showLoadingIndicator();

    // Load content for next date
    loadContentForDate(nextDate, true, () => {
        // Callback after date content is loaded and elements are created
        if (lookaheadCount > 1 && hasMoreDates) {
            // Sequential preload: delay slightly to avoid UI stutter
            setTimeout(() => {
                loadNextDate(lookaheadCount - 1, sessionId);
            }, 500);
        }
    });
}

// Load next date for modal navigation - returns a Promise with new cards
let currentModalLoadPromise = null;

window.loadNextDateForModal = function () {
    // Return existing promise if already loading
    if (currentModalLoadPromise) {
        console.log('[Modal Navigation] Already loading, joining existing request');
        return currentModalLoadPromise;
    }

    currentModalLoadPromise = new Promise((resolve, reject) => {
        console.log('[Modal Navigation] Attempting to load next date...');

        // Check if we can load more
        if (isLoadingMore) {
            // This happens if infinite scroll triggered it but we don't have the promise handle
            // We'll trust the infinite scroll logic to eventually populate the DOM
            // and we act as a secondary listener
            console.log('[Modal Navigation] Infinite scroll already loading, attaching observer');
        } else if (!hasMoreDates) {
            console.log('[Modal Navigation] No more dates available');
            reject(new Error('No more dates'));
            currentModalLoadPromise = null;
            return;
        } else {
            // Check next date index
            const nextIndex = currentDateIndex + 1;
            if (nextIndex >= availableDates.length) {
                hasMoreDates = false;
                console.log('[Modal Navigation] Reached end of available dates');
                reject(new Error('No more dates'));
                currentModalLoadPromise = null;
                return;
            }

            const nextDate = availableDates[nextIndex].date;

            // Check if already loaded
            if (loadedDates.has(nextDate)) {
                console.log('[Modal Navigation] Date already loaded, collecting new cards');
                const newCards = collectNewCards();
                resolve(newCards);
                currentModalLoadPromise = null;
                return;
            }

            // Trigger the load
            currentDateIndex = nextIndex;
            isLoadingMore = true;
            loadedDates.add(nextDate);
            console.log('[Modal Navigation] Loading new date:', nextDate);
            loadContentForDate(nextDate, true);
        }

        // Set up observer to watch for new cards
        const contentList = document.getElementById('contentList');
        if (!contentList) {
            reject(new Error('Content list not found'));
            currentModalLoadPromise = null;
            return;
        }

        // Count current cards before loading
        const currentView = localStorage.getItem('viewMode') || 'list';
        const cardSelector = currentView === 'gallery' ? '.gallery-item' : '.masonry-item';
        const currentCardCount = contentList.querySelectorAll(cardSelector).length;

        console.log('[Modal Navigation] Current card count:', currentCardCount);

        // Set up mutation observer to detect new cards
        const observer = new MutationObserver((mutations) => {
            const newCardCount = contentList.querySelectorAll(cardSelector).length;

            if (newCardCount > currentCardCount) {
                console.log('[Modal Navigation] New cards detected (Count:', newCardCount, '), collecting...');
                observer.disconnect();

                // Small delay to ensure DOM is stable, but removed the 2s artificial delay
                // The modal will handle data fetching individually
                requestAnimationFrame(() => {
                    const newCards = collectNewCards();
                    console.log('[Modal Navigation] Collected', newCards.length, 'new cards');
                    resolve(newCards);
                    currentModalLoadPromise = null;
                });
            }
        });

        observer.observe(contentList, {
            childList: true,
            subtree: true
        });

        // Set a timeout to prevent hanging
        setTimeout(() => {
            if (currentModalLoadPromise) { // Only if still pending
                observer.disconnect();
                console.log('[Modal Navigation] Timeout waiting for new cards');
                // Try to resolve anyway, maybe cards appeared but observer missed (unlikely) or just slow
                const newCards = collectNewCards();
                if (newCards.length > currentCardCount) {
                    resolve(newCards);
                } else {
                    reject(new Error('Timeout loading new cards'));
                }
                currentModalLoadPromise = null;
            }
        }, 10000);
    });

    return currentModalLoadPromise;
};

// Helper function to collect new gallery cards that weren't in the original set
function collectNewCards() {
    const currentView = localStorage.getItem('viewMode') || 'list';
    if (currentView === 'gallery') {
        return Array.from(document.querySelectorAll('.gallery-item'));
    } else {
        // For list view, we need to create virtual cards like openGalleryTweetDetail does
        // For now, return empty array as list view doesn't support this feature yet
        return [];
    }
}

// Show loading indicator at bottom
function showLoadingIndicator() {
    let indicator = document.getElementById('loadingIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'loadingIndicator';
        indicator.style.cssText = `
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary, #cccccc);
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        `;
        indicator.innerHTML = `
            <div style="
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-top-color: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            "></div>
            <span>Loading more content...</span>
        `;

        // Add animation keyframes if not already present
        if (!document.getElementById('spinKeyframes')) {
            const style = document.createElement('style');
            style.id = 'spinKeyframes';
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        const contentList = document.getElementById('contentList');
        if (contentList) {
            contentList.parentElement.appendChild(indicator);
        }
    }
    indicator.style.display = 'flex';
}

// Hide loading indicator
function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Show end of content message
function showEndOfContentMessage() {
    let message = document.getElementById('endOfContentMessage');
    if (!message) {
        message = document.createElement('div');
        message.id = 'endOfContentMessage';
        message.style.cssText = `
            text-align: center;
            padding: 2rem;
            color: var(--text-muted, #999999);
            font-size: 0.85rem;
            border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            margin-top: 2rem;
        `;
        message.innerHTML = `
            <svg style="width: 32px; height: 32px; margin: 0 auto 0.75rem; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>All content loaded</div>
        `;

        const contentList = document.getElementById('contentList');
        if (contentList) {
            contentList.parentElement.appendChild(message);
        }
    }
    message.style.display = 'block';
    hideLoadingIndicator();
}

// Sync date tabs to mobile navigation
function syncMobileNavDates() {
    const mobileNavDates = document.getElementById('mobileNavDates');
    const mainDateTabs = document.getElementById('dateTabs');

    if (!mobileNavDates || !mainDateTabs) return;

    // Clone the date tabs to mobile nav
    mobileNavDates.innerHTML = mainDateTabs.innerHTML;

    // Add click event listeners to mobile nav tabs
    mobileNavDates.querySelectorAll('.date-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const date = tab.getAttribute('data-date');
            currentDate = date;
            selectDateTab(date);
            loadContentForDate(date);

            // Update URL parameter
            const url = new URL(window.location);
            url.searchParams.set('date', date);
            window.history.replaceState({}, '', url);

            // Sync selection in mobile nav
            syncMobileNavSelection(date);
        });
    });

    // Sync initial selection
    syncMobileNavSelection(currentDate);
}

// Sync selected date in mobile nav
function syncMobileNavSelection(date) {
    const mobileNavDates = document.getElementById('mobileNavDates');
    if (!mobileNavDates) return;

    mobileNavDates.querySelectorAll('.date-tab').forEach(tab => {
        if (tab.getAttribute('data-date') === date) {
            tab.classList.add('active');
            // Scroll tab into view
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
            tab.classList.remove('active');
        }
    });
}

// Load all available dates from server
function loadAvailableDates() {
    // First check if we're on the main page
    const dateTabsContainer = document.getElementById('dateTabs');
    if (!dateTabsContainer) {
        // Not on the main page, so don't proceed
        return;
    }

    dateTabsContainer.innerHTML = '<div class="loading-dates">Loading dates...</div>';

    // Add retry mechanism
    const fetchDates = (retryCount = 0) => {
        apiFetch('/api/dates')
            .then(r => {
                if (!r.ok) {
                    throw new Error(`HTTP error! status: ${r.status}`);
                }
                // Check if response is JSON
                const contentType = r.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return r.json();
                } else {
                    throw new Error('Response is not JSON');
                }
            })
            .then(data => {
                availableDates = data.dates || [];

                // Initialize infinite scroll state
                currentDateIndex = 0;
                loadedDates.clear();
                hasMoreDates = availableDates.length > 1;

                // If no date is set (no URL parameter), default to the latest available date
                if (!currentDate && availableDates.length > 0) {
                    currentDate = availableDates[0].date; // Dates are sorted newest first

                    // Update URL parameter to reflect the selected date
                    const url = new URL(window.location);
                    url.searchParams.set('date', currentDate);
                    window.history.replaceState({}, '', url);
                }

                // Mark initial date as loaded
                if (currentDate) {
                    loadedDates.add(currentDate);
                }

                renderDateTabs();
                selectDateTab(currentDate);

                // Find correctly current index in available dates
                if (currentDate) {
                    const idx = availableDates.findIndex(d => d.date === currentDate);
                    if (idx !== -1) {
                        currentDateIndex = idx;
                        console.log('[Init] Current date index set to:', currentDateIndex);
                    }
                }

                // Load content for the current date
                if (currentDate) {
                    window.preloadSessionId = Date.now();
                    const currentSession = window.preloadSessionId;

                    loadContentForDate(currentDate, false, () => {
                        // After initial date is loaded, start loading everything else in background
                        console.log('[Init] Initial content loaded, starting sequential background preloading...');
                        setTimeout(() => {
                            if (hasMoreDates) {
                                loadNextDate(availableDates.length, currentSession);
                            }
                        }, 2000); // Wait 2s to ensure initial rendering is smooth
                    });
                }
            })
            .catch(error => {
                console.error('Error loading dates:', error);
                if (retryCount < 2) {
                    // Retry after 1 second
                    setTimeout(() => fetchDates(retryCount + 1), 1000);
                } else {
                    dateTabsContainer.innerHTML = '<div class="no-dates">Failed to load dates. Please refresh.</div>';
                }
            });
    };

    fetchDates();
}

// Render date tabs
function renderDateTabs() {
    const dateTabsContainer = document.getElementById('dateTabs');

    if (availableDates.length === 0) {
        dateTabsContainer.innerHTML = '<div class="no-dates">No dates available</div>';
        return;
    }

    dateTabsContainer.innerHTML = availableDates.map(dateInfo => {
        // Format date for display (e.g., 12/05)
        const date = new Date(dateInfo.date);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

        return `
            <div class="date-tab" data-date="${dateInfo.date}">
                <div>${formattedDate}</div>
            </div>
        `;
    }).join('');

    // Add click event listeners to tabs
    document.querySelectorAll('.date-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const date = tab.getAttribute('data-date');
            currentDate = date;

            // Cancel previous background loads and start a new one from new date
            window.preloadSessionId = Date.now();
            const currentSession = window.preloadSessionId;

            // Sync current index
            const idx = availableDates.findIndex(d => d.date === date);
            if (idx !== -1) {
                currentDateIndex = idx;
                console.log('[Tabs] Current date index updated to:', currentDateIndex);
            }

            selectDateTab(date);
            loadContentForDate(date, false, () => {
                // Restart sequential preloading from new position
                setTimeout(() => {
                    if (currentSession === window.preloadSessionId) { // Verify session still active
                        loadNextDate(availableDates.length, currentSession);
                    }
                }, 2000);
            });

            // Update URL parameter
            const url = new URL(window.location);
            url.searchParams.set('date', date);
            window.history.replaceState({}, '', url);

            // Sync mobile nav selection
            syncMobileNavSelection(date);
        });
    });

    // Sync date tabs to mobile navigation
    syncMobileNavDates();
}

// Highlight the active date tab
function selectDateTab(date) {
    let foundTab = false;

    // First check if date tabs exist on the current page
    const dateTabs = document.querySelectorAll('.date-tab');
    if (dateTabs.length === 0) {
        return false;
    }

    dateTabs.forEach(tab => {
        if (tab.getAttribute('data-date') === date) {
            tab.classList.add('active');
            // Scroll tab into view if needed
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            foundTab = true;
        } else {
            tab.classList.remove('active');
        }
    });

    // If no tab found for the date, it might be a date with no content
    // In this case, don't throw an error, just continue
    return foundTab;
}

// Setup Date Navigation
function setupDateTabsNavigation() {
    // This function is now handled by the date tabs themselves
    // Keeping for compatibility
}

// Show data source toast
function showSourceToast(source) {
    let toast = document.getElementById('source-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'source-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0,0,0,0.7)';
        toast.style.color = 'white';
        toast.style.padding = '8px 16px';
        toast.style.borderRadius = '20px';
        toast.style.fontSize = '12px';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
    }

    toast.textContent = source === 'cloud' ? '☁️ Data loaded from Cloud' : '📂 Data loaded from Local Cache';
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Show general toast message
function showToast(message, type = 'info', duration = 3000) {
    let toast = document.getElementById('general-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'general-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.fontSize = '14px';
        toast.style.zIndex = '10000';
        toast.style.transition = 'opacity 0.3s';
        toast.style.maxWidth = '80vw';
        toast.style.textAlign = 'center';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        document.body.appendChild(toast);
    }

    // Set background color based on type
    const colors = {
        info: 'rgba(0, 122, 255, 0.9)',
        error: 'rgba(255, 59, 48, 0.9)',
        warning: 'rgba(255, 149, 0, 0.9)',
        success: 'rgba(52, 199, 89, 0.9)'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    toast.textContent = message;
    toast.style.opacity = '1';

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.opacity = '0';
    }, duration);
}

// Load content for specific date
function loadContentForDate(date, append = false, callback = null) {
    // First check if we're on the main page
    const contentList = document.getElementById('contentList');
    const emptyState = document.getElementById('emptyState');

    if (!contentList) {
        // Not on the main page, so don't proceed
        return Promise.resolve(0);
    }

    // Define storage key for this date
    const storageKey = `tweets_${date}`;

    if (!append) {
        // Show loading state only for initial load
        contentList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading content...</div>';
        emptyState.style.display = 'none';
        tweetUrls.length = 0;
        tweetMediaCache.clear();
    }

    const url = `/api/data?date=${encodeURIComponent(date)}`;
    const startIndex = tweetUrls.length; // Save current length for append

    return apiFetch(url)
        .then(r => {
            if (!r.ok) {
                throw new Error(`HTTP error! status: ${r.status}`);
            }
            // Check if response is JSON
            const contentType = r.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return r.json();
            } else {
                throw new Error('Response is not JSON');
            }
        })
        .then(data => {
            const urls = Array.isArray(data && data.urls) ? data.urls : [];
            if (urls.length > 0) {
                // Reverse array to show newest content first
                const reversedUrls = urls.reverse();
                tweetUrls.push(...reversedUrls);

                if (append) {
                    // Append mode: render only new content
                    const currentView = localStorage.getItem('viewMode') || 'list';
                    if (currentView === 'gallery') {
                        renderImageGallery(contentList, true, startIndex, date);
                    } else {
                        renderTweetList(contentList, true, startIndex, date);
                    }
                    isLoadingMore = false;
                    hideLoadingIndicator();
                    console.log('[Infinite Scroll] Content loaded successfully for', date);

                    // Execute callback for sequential preloading
                    if (typeof callback === 'function') {
                        callback();
                    }
                } else {
                    // Initial mode: render all content
                    renderContent(false);
                    emptyState.style.display = 'none';

                    // Execute callback for sequential preloading even on initial load
                    if (typeof callback === 'function') {
                        callback();
                    }
                }

                localStorage.setItem(storageKey, JSON.stringify(urls));
                showSourceToast('cloud');

                // Update date tab selection only when not in append mode
                if (!append) {
                    selectDateTab(date);
                }
                return reversedUrls.length;
            }

            // Try to load from localStorage as fallback
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                try {
                    const u = JSON.parse(savedData);
                    if (Array.isArray(u) && u.length > 0) {
                        // Reverse array to show newest content first
                        const reversedUrls = u.reverse();
                        tweetUrls.push(...reversedUrls);

                        if (append) {
                            // Append mode: render only new content
                            const currentView = localStorage.getItem('viewMode') || 'list';
                            if (currentView === 'gallery') {
                                renderImageGallery(contentList, true, startIndex, date);
                            } else {
                                renderTweetList(contentList, true, startIndex, date);
                            }
                            isLoadingMore = false;
                            hideLoadingIndicator();
                            console.log('[Infinite Scroll] Content loaded from cache (fallback 1) for', date);

                            // Execute callback for sequential preloading
                            if (typeof callback === 'function') {
                                callback();
                            }
                        } else {
                            // Initial mode: render all content
                            renderContent(false);
                            emptyState.style.display = 'none';
                        }

                        showSourceToast('cache');

                        // Update date tab selection only when not in append mode
                        if (!append) {
                            selectDateTab(date);
                        }
                        return reversedUrls.length;
                    }
                } catch (e) { }
            }

            if (!append) {
                // Show empty state only for initial load
                contentList.innerHTML = '';
                emptyState.style.display = 'block';
            } else {
                isLoadingMore = false;
                hideLoadingIndicator();
                console.log('[Infinite Scroll] No data available for', date);
            }

            // Still update the selected tab even if no content (only when not appending)
            if (!append) {
                selectDateTab(date);
            }
            return 0;
        })
        .catch(error => {
            console.error('Error loading content for date:', date, error);

            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                try {
                    const u = JSON.parse(savedData);
                    if (Array.isArray(u) && u.length > 0) {
                        // Reverse array to show newest content first
                        const reversedUrls = u.reverse();
                        tweetUrls.push(...reversedUrls);

                        if (append) {
                            // Append mode: render only new content
                            const currentView = localStorage.getItem('viewMode') || 'list';
                            if (currentView === 'gallery') {
                                renderImageGallery(contentList, true, startIndex, date);
                            } else {
                                renderTweetList(contentList, true, startIndex, date);
                            }
                            isLoadingMore = false;
                            hideLoadingIndicator();
                            console.log('[Infinite Scroll] Content loaded from cache (error fallback) for', date);
                        } else {
                            // Initial mode: render all content
                            renderContent(false);
                            emptyState.style.display = 'none';
                        }

                        showSourceToast('cache');

                        // Update date tab selection only when not in append mode
                        if (!append) {
                            selectDateTab(date);
                        }
                        return reversedUrls.length;
                    }
                } catch (e) { }
            }

            if (!append) {
                // Show error state only for initial load
                contentList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Failed to load. Please refresh.</div>';
                emptyState.style.display = 'none';
            } else {
                isLoadingMore = false;
                hideLoadingIndicator();
                console.log('[Infinite Scroll] Failed to load content for', date);
            }

            // Still update the selected tab even if no content (only when not appending)
            if (!append) {
                selectDateTab(date);
            }
            return 0;
        });
}

// Save daily snapshot (Called by Admin)
function saveDailySnapshot(date, urls) {
    const storageKey = `tweets_${date}`;
    const body = JSON.stringify({ date, urls });
    return apiFetch('/api/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
        .then(r => {
            if (!r.ok) return Promise.reject(new Error('Update failed'));
            return r.json();
        })
        .then(responseData => {
            // 获取最新的URL列表，确保本地缓存与服务器同步
            // 这里我们重新获取数据，因为合并后的完整URL列表只在服务器端
            return apiFetch(`/api/data?date=${encodeURIComponent(date)}`)
                .then(r => {
                    if (!r.ok) {
                        throw new Error(`HTTP error! status: ${r.status}`);
                    }
                    // Check if response is JSON
                    const contentType = r.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return r.json();
                    } else {
                        throw new Error('Response is not JSON');
                    }
                })
                .then(data => {
                    const finalUrls = Array.isArray(data && data.urls) ? data.urls : urls;

                    // 更新本地缓存
                    localStorage.setItem(storageKey, JSON.stringify(finalUrls));

                    return {
                        remoteSaved: true,
                        totalUrls: responseData.totalUrls,
                        newUrls: responseData.newUrls
                    };
                });
        })
        .catch(() => {
            // 降级处理：只保存本次提交的URL
            localStorage.setItem(storageKey, JSON.stringify(urls));
            return { remoteSaved: false };
        });
}

// Extract URLs from text (Shared utility)
function extractUrls(text) {
    const regex = /https?:\/\/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/g;
    return [...new Set(text.match(regex) || [])];
}

// Optional: Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Wait for libraries to load
async function waitForLibraries(timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (typeof html2canvas !== 'undefined' && typeof JSZip !== 'undefined') {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
}

// Generate image from container and download content as ZIP
async function downloadDayAsImage(button, container, dateLabel) {
    if (button.classList.contains('generating')) return;

    // UI Feedback Helper
    const originalIcon = button.innerHTML;
    const updateStatus = (text) => {
        console.log(`[Download] ${text}`);
    };

    button.classList.add('generating');

    // Wait for libraries to load
    updateStatus('Checking libraries...');
    const librariesLoaded = await waitForLibraries();

    if (!librariesLoaded) {
        console.error('Required libraries (html2canvas or JSZip) not loaded');
        button.classList.remove('generating');
        button.classList.add('error');

        // Show user-friendly error message
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 1.5rem 2rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
        `;
        errorMsg.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Download Failed</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">
                Required libraries could not be loaded. Please check your internet connection and try again.
            </div>
        `;
        document.body.appendChild(errorMsg);

        setTimeout(() => {
            errorMsg.remove();
            button.classList.remove('error');
        }, 3000);
        return;
    }

    try {
        const zip = new JSZip();
        // Create a folder for this date
        // Note: Windows folders don't like colons/slashes in names, dateLabel usually safe (202x年x月x日)
        const folderName = `NanoBanana-${dateLabel}`;
        const folder = zip.folder(folderName);

        // --- Step 1: Capture Full Screenshot ---
        updateStatus('Capturing screenshot...');
        const canvas = await html2canvas(container, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            scale: 2,
            logging: false,
            onclone: (clonedDoc) => {
                const clonedContainer = clonedDoc.querySelector(`.${container.className.split(' ')[0]}`);
                if (clonedContainer) {
                    clonedContainer.style.transform = 'none';
                    clonedContainer.style.margin = '20px';
                }
            }
        });

        // Add screenshot to ZIP
        const screenshotBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (screenshotBlob) {
            folder.file(`${folderName}-Overview.png`, screenshotBlob);
        }

        // --- Step 2: Download Individual Images ---
        updateStatus('Fetching individual images...');

        // Find all tweet identifiers in this container
        // Support both Masonry (.tweet-embed-container) and Gallery (.gallery-item)
        const items = container.querySelectorAll('.tweet-embed-container, .gallery-item');
        const uniqueTweetIds = new Set();

        items.forEach(item => {
            const url = item.dataset.tweetUrl || (item.querySelector('.gallery-link-icon')?.href);
            if (url) {
                const id = extractTweetId(url);
                if (id) uniqueTweetIds.add(id);
            }
        });

        // Process images (limit concurrency if needed, but for now linear or parallel batch)
        const tweetIds = Array.from(uniqueTweetIds);
        let imageCount = 0;

        const downloadPromises = tweetIds.map(async (tweetId) => {
            try {
                // Fetch tweet media info (using cache if available from previous logic)
                const result = await fetchTweetMedia(tweetId);
                const mediaItems = result?.images || [];

                if (!mediaItems || mediaItems.length === 0) return;

                // Download each media item
                await Promise.all(mediaItems.map(async (media, index) => {
                    if (media.type === 'video') return; // Skip videos for now, or fetch thumbnail

                    const imageUrl = media.url;
                    try {
                        // Fetch image blob
                        const response = await fetch(imageUrl);
                        if (!response.ok) throw new Error('Fetch failed');
                        const blob = await response.blob();

                        // Determine extension
                        const ext = imageUrl.split('.').pop().split('?')[0] || 'jpg';
                        const filename = `tweet_${tweetId}_${index + 1}.${ext}`;

                        folder.file(filename, blob);
                        imageCount++;
                    } catch (e) {
                        // Fallback: If CORS fails (likely), we might need a proxy or skip
                        console.warn(`Failed to download image: ${imageUrl}`, e);
                        // Try fetching via internal proxy if your architecture supports it?
                        // For now, allow failing silently for specific images
                    }
                }));

            } catch (err) {
                console.warn(`Error processing tweet ${tweetId}:`, err);
            }
        });

        await Promise.all(downloadPromises);

        // --- Step 3: Generate ZIP and Download ---
        updateStatus('Zipping...');

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Trigger download
        const downloadUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.download = `${folderName}.zip`;
        link.href = downloadUrl;
        link.click();

        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        handleSuccess();

    } catch (err) {
        console.error('Download workflow failed:', err);
        button.classList.remove('generating');
        button.classList.add('error');
        setTimeout(() => button.classList.remove('error'), 2000);
    }

    function handleSuccess() {
        button.classList.remove('generating');
        button.classList.add('success');
        button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
            button.classList.remove('success');
            button.innerHTML = originalIcon;
        }, 2000);
    }
}
