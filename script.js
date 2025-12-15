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

// Render Standard Tweet List (Masonry) - Progressive rendering
function renderTweetList(container, append = false, startIndex = 0, dateLabel = null) {
    // Create new masonry grid for each day if appending
    let masonryContainer;

    if (append && dateLabel) {
        // Add date separator
        const separator = createDateSeparator(dateLabel);
        container.appendChild(separator);

        // Create new masonry grid for this day
        masonryContainer = document.createElement('div');
        masonryContainer.className = 'masonry-grid';
        container.appendChild(masonryContainer);
    } else if (append) {
        // Continue with existing masonry grid
        masonryContainer = container.querySelector('.masonry-grid:last-child');
    } else {
        // Initial load: clear and create first grid
        container.innerHTML = '';
        masonryContainer = document.createElement('div');
        masonryContainer.className = 'masonry-grid';
        container.appendChild(masonryContainer);
    }

    // Calculate the starting tweet index for this render
    const tweetsToRender = tweetUrls.slice(startIndex);

    // Render cards progressively
    tweetsToRender.forEach((url, index) => {
        const actualIndex = startIndex + index;
        // Delay rendering each card
        setTimeout(() => {
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
                contentItem.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                contentItem.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    contentItem.style.opacity = '1';
                    contentItem.style.transform = 'translateY(0)';
                });
            });

            // Setup observer for this specific card
            setupLazyLoadingForTweet(contentItem.querySelector('.tweet-embed-container'));
        }, index * 50); // 50ms delay between each card
    });
}

// Create date separator element
function createDateSeparator(dateStr) {
    const separator = document.createElement('div');
    separator.className = 'date-separator';

    // Format date for display
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}年${month}月${day}日`;

    separator.innerHTML = `
        <div class="date-separator-line"></div>
        <div class="date-separator-text">${formattedDate}</div>
        <div class="date-separator-line"></div>
    `;

    return separator;
}

// Render Image Gallery (New Feature) - Progressive rendering
function renderImageGallery(container, append = false, startIndex = 0, dateLabel = null) {
    // Create new gallery grid for each day if appending
    let galleryContainer;

    if (append && dateLabel) {
        // Add date separator
        const separator = createDateSeparator(dateLabel);
        container.appendChild(separator);

        // Create new gallery grid for this day
        galleryContainer = document.createElement('div');
        galleryContainer.className = 'image-gallery-grid';
        container.appendChild(galleryContainer);
    } else if (append) {
        // Continue with existing gallery grid
        galleryContainer = container.querySelector('.image-gallery-grid:last-child');
    } else {
        // Initial load: clear and create first grid
        container.innerHTML = '';
        galleryContainer = document.createElement('div');
        galleryContainer.className = 'image-gallery-grid';
        container.appendChild(galleryContainer);
    }

    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const wrapper = entry.target;
            galleryObserver.unobserve(wrapper);

            const tweetId = wrapper.dataset.tweetId;
            if (!tweetId) return;

            const placeholder = wrapper.querySelector('.gallery-thumb-placeholder');
            const indicator = wrapper.querySelector('.gallery-multi-indicator');

            fetchTweetMedia(tweetId)
                .then(images => {
                    if (!placeholder) return;

                    if (!images || images.length === 0) {
                        placeholder.innerHTML = '<div class="gallery-empty">No images found</div>';
                        return;
                    }

                    // 简单纵向显示所有图片，添加淡入动画
                    const imagesHTML = images.map((img, i) =>
                        `<img src="${img}" alt="Tweet image ${i+1}" class="gallery-simple-img" style="opacity: 0;">`
                    ).join('');

                    placeholder.innerHTML = imagesHTML;

                    // 为每张图片添加加载完成后的淡入动画
                    const imgElements = placeholder.querySelectorAll('img');
                    imgElements.forEach((img, i) => {
                        const handleLoad = () => {
                            setTimeout(() => {
                                img.style.transition = 'opacity 0.5s ease-out';
                                img.style.opacity = '1';
                            }, i * 100);
                        };

                        img.onload = handleLoad;
                        img.onerror = () => {
                            // 如果图片加载失败，也显示出来（可能是占位图）
                            img.style.opacity = '0.3';
                        };

                        // 如果图片已经缓存或加载完成，立即显示
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

    // Progressively render gallery items
    const tweetsToRender = tweetUrls.slice(startIndex);
    tweetsToRender.forEach((url, index) => {
        const tweetIndex = startIndex + index;
        setTimeout(() => {
            const wrapper = document.createElement('div');
            wrapper.className = 'gallery-item';
            wrapper.style.opacity = '0';

            const tweetId = extractTweetId(url);
            if (tweetId) {
                wrapper.dataset.tweetId = tweetId;
                wrapper.dataset.tweetIndex = tweetIndex; // 保存索引
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
                wrapper.style.transition = 'opacity 0.4s ease-out';
                requestAnimationFrame(() => {
                    wrapper.style.opacity = '1';
                });
            });

            const thumb = wrapper.querySelector('.gallery-thumb');
            if (thumb) {
                thumb.addEventListener('click', () => {
                    if (tweetId) {
                        openImageViewer(tweetId, url, tweetIndex);
                    } else {
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
                galleryObserver.observe(wrapper);
            } else {
                const placeholder = wrapper.querySelector('.gallery-thumb-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = '<div class="gallery-empty">Preview unavailable</div>';
                }
            }
        }, index * 30); // 30ms delay between each item
    });
}

function fetchTweetMedia(tweetId) {
    if (!tweetId) return Promise.resolve([]);

    const cached = tweetMediaCache.get(tweetId);
    if (cached) {
        if (cached.images) {
            return Promise.resolve(cached.images);
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
            tweetMediaCache.set(tweetId, { images });
            return images;
        })
        .catch(error => {
            console.error('Error fetching tweet media:', error);
            tweetMediaCache.delete(tweetId);
            throw error;
        });

    tweetMediaCache.set(tweetId, { promise });
    return promise;
}

function extractImageUrlsFromTweetInfo(data) {
    const images = [];
    if (data && Array.isArray(data.media_extended)) {
        data.media_extended.forEach(media => {
            if (media && media.type === 'image' && media.url) {
                images.push(media.url);
            }
        });
    }

    if (images.length === 0 && Array.isArray(data && data.mediaURLs)) {
        data.mediaURLs.forEach(url => {
            if (typeof url === 'string') {
                images.push(url);
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
        .then(images => {
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
    imagesTrack.innerHTML = imageViewerState.images.map((imgSrc, index) => `
        <div class="viewer-image-item" data-index="${index}">
            <div class="viewer-image-loading">
                <div class="loading-spinner small"></div>
            </div>
            <img class="viewer-image" data-src="${imgSrc}" alt="Tweet image ${index + 1}">
        </div>
    `).join('');

    // 设置懒加载观察器
    setupImageLazyLoading();
    updateScrollNavButtons();
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
        container.innerHTML = '<p class="tweet-error">推文加载失败，刷新页面试试</p>';
        container.classList.add('loaded');
        container.classList.remove('loading');
        return;
    }

    const target = document.getElementById(`tweet-target-${index}`);
    const loading = container.querySelector('.tweet-loading');

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
                container.innerHTML = '<p class="tweet-error">推文加载失败，刷新页面试试</p>';
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
                container.innerHTML = '<p class="tweet-error">加载超时，刷新页面试试</p>';
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
const tweetMediaCache = new Map();
let imageViewerEl = null;
const imageViewerState = {
    tweetId: null,
    tweetUrl: '',
    tweetIndex: -1, // 当前推文在 tweetUrls 中的索引
    images: [],
    index: 0
};

// Infinite scroll state
let currentDateIndex = 0; // Index in availableDates array
let isLoadingMore = false;
let hasMoreDates = true;
let loadedDates = new Set(); // Track loaded dates to avoid duplicates

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

            // Load more when within 1000px of bottom
            if (scrollHeight - (scrollTop + clientHeight) < 1000) {
                loadNextDate();
            }
        }, 200);
    });
}

// Load next date's content
function loadNextDate() {
    // Check if already loading or no more dates
    if (isLoadingMore || !hasMoreDates) return;

    // Find next date that hasn't been loaded
    currentDateIndex++;

    if (currentDateIndex >= availableDates.length) {
        hasMoreDates = false;
        return;
    }

    const nextDate = availableDates[currentDateIndex].date;

    // Check if already loaded
    if (loadedDates.has(nextDate)) {
        // Try next date
        loadNextDate();
        return;
    }

    isLoadingMore = true;
    loadedDates.add(nextDate);

    // Load content for next date
    loadContentForDate(nextDate, true); // true = append mode
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

                // Load content for the current date (which is now the latest if it was null)
                if (currentDate) {
                    loadContentForDate(currentDate);
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
            selectDateTab(date);
            loadContentForDate(date);

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

// Load content for specific date
function loadContentForDate(date, append = false) {
    // First check if we're on the main page
    const contentList = document.getElementById('contentList');
    const emptyState = document.getElementById('emptyState');

    if (!contentList) {
        // Not on the main page, so don't proceed
        return;
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

    apiFetch(url)
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
                } else {
                    // Initial mode: render all content
                    renderContent(false);
                    emptyState.style.display = 'none';
                }

                localStorage.setItem(storageKey, JSON.stringify(urls));
                showSourceToast('cloud');

                // Update date tab selection
                selectDateTab(date);
                return;
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
                        } else {
                            // Initial mode: render all content
                            renderContent(false);
                            emptyState.style.display = 'none';
                        }

                        showSourceToast('cache');

                        // Update date tab selection
                        selectDateTab(date);
                        return;
                    }
                } catch (e) { }
            }

            if (!append) {
                // Show empty state only for initial load
                contentList.innerHTML = '';
                emptyState.style.display = 'block';
            } else {
                isLoadingMore = false;
            }

            // Still update the selected tab even if no content
            selectDateTab(date);
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
                        } else {
                            // Initial mode: render all content
                            renderContent(false);
                            emptyState.style.display = 'none';
                        }

                        showSourceToast('cache');

                        // Update date tab selection
                        selectDateTab(date);
                        return;
                    }
                } catch (e) { }
            }

            if (!append) {
                // Show error state only for initial load
                contentList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Failed to load. Please refresh.</div>';
                emptyState.style.display = 'none';
            } else {
                isLoadingMore = false;
            }

            // Still update the selected tab even if no content
            selectDateTab(date);
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
