// Note: Theme module (js/theme.js) provides:
// - getCurrentTheme, setThemePreference, syncBodyThemeClass, setupThemeToggle, updateThemeToggleIcon

// Note: API module (js/api.js) provides:
// - getApiBaseUrl, setApiBaseUrl, apiFetch, buildApiUrl

// Note: Utils module (js/utils.js) provides:
// - extractTweetId, formatDate, copyToClipboard, showCopyFeedback, extractUrls

// Note: Cache module (js/cache.js) provides:
// - LRUCache, ThrottleQueue, tweetMediaCache, throttleQueue
// - openDB, saveToDB, getFromDB, extractImageUrlsFromTweetInfo

// Legacy global exports
// [Refactor] Tweet rendering logic moved to js/api.js (fetchTweetMedia) and js/renderer.js (renderContent, renderImageGallery, etc.)
// See renderer.js for TweetRenderer class.


// Note: Duplicate fetchTweetMedia removed - using the version at top of file


// Global State
let activeAuthorFilter = null;
let activeCategory = null;
let availableDates = [];
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
        // Get all Gallery cards and sort them by index to ensure correct navigation order (Left/Right)
        // because querySelectorAll returns them in column-major order (Col 1, Col 2...)
        const allGalleryItems = Array.from(document.querySelectorAll('.gallery-item'))
            .sort((a, b) => {
                const idxA = parseInt(a.dataset.tweetIndex || 0);
                const idxB = parseInt(b.dataset.tweetIndex || 0);
                return idxA - idxB;
            });

        console.log('[Gallery Modal] Found', allGalleryItems.length, 'gallery items');

        if (allGalleryItems.length === 0) {
            console.error('[Gallery Modal] No cards found');
            throw new Error('No cards to display');
        }

        // Find the clicked card index in the SORTED array
        // Prioritize matching by the unique tweetIndex assigned during rendering
        let finalIndex = allGalleryItems.findIndex(item => {
            const itemIndex = parseInt(item.dataset.tweetIndex);
            return !isNaN(itemIndex) && itemIndex === clickedIndex;
        });

        // Fallback to tweetId matching if index match fails (e.g. legacy cards)
        if (finalIndex === -1) {
            console.log('[Gallery Modal] Index match failed, falling back to tweetId matching');
            finalIndex = allGalleryItems.findIndex(item => item.dataset.tweetId === tweetId);
        }

        const indexToOpen = finalIndex >= 0 ? finalIndex : 0;
        const clickedCard = allGalleryItems[indexToOpen];

        console.log('[Gallery Modal] Final target index in DOM:', indexToOpen, 'of', allGalleryItems.length);

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

/**
 * Preload adjacent cards for smoother navigation
 * @param {Array} cards - Visible cards
 * @param {number} currentIndex - Current index
 * @param {number} range - Range to preload
 * @param {AbortSignal} signal - Abort signal
 */
function preloadAdjacentCards(cards, currentIndex, range = 6, signal = null) {
    const indices = [];

    // Preload cards before and after current card
    for (let i = 1; i <= range; i++) {
        if (currentIndex - i >= 0) indices.push(currentIndex - i);
        if (currentIndex + i < cards.length) indices.push(currentIndex + i);
    }

    // Load in background with concurrency control (max 2 concurrent)
    const MAX_CONCURRENT_PRELOADS = 2;

    const loadCard = async (index) => {
        const card = window.visibleCards[index];
        if (!card || card.dataset.tweetData || card.dataset.loading === 'finished') return;

        const itemTweetId = card.dataset.tweetId;
        if (!itemTweetId) return;

        // Use the reinforced unified fetch function
        try {
            const result = await fetchTweetMedia(itemTweetId);

            // Sync to dataset for modal components
            card.dataset.tweetData = JSON.stringify(result.fullData);
            if (result.images) card.dataset.cachedMedia = JSON.stringify(result.images);

            // Mark as finished but keep a flag to avoid re-preloade
            card.dataset.loading = 'finished';
            console.log('[Gallery Modal] Preloaded card', index, 'tweetId:', itemTweetId);

            // Notify modal to update thumbnail if it's open
            if (typeof window.updateThumbnail === 'function') {
                window.updateThumbnail(index);
            }
        } catch (error) {
            console.warn('[Gallery Modal] Failed to preload card', index, error);
            // Optionally mark as failed to avoid infinite retries
            card.dataset.loading = 'failed';
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
            <img class="viewer-image" data-src="${imgUrl}" alt="Tweet image ${index + 1}" crossOrigin="anonymous">
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
            // Enhanced visual feedback for active button
            if (document.documentElement.classList.contains('light-mode')) {
                btn.style.background = '#ffffff';
                btn.style.color = '#14171a';
                btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
            } else {
                btn.style.background = '#ffffff';
                btn.style.color = '#000000';
                btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.25)';
            }
            btn.style.fontWeight = '600';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.boxShadow = 'none';
            btn.style.fontWeight = 'normal';
        }
    });
}

// Setup lazy loading for a single tweet
// [Refactor] Lazy loading logic moved to js/renderer.js




// Global State
let currentDate = null; // Will be set to latest date in loadAvailableDates
const tweetUrls = [];
// Category Filter State
// Category Filter State
// activeCategory declared at top

function getFilteredTweets() {
    if (!activeCategory) return tweetUrls;
    return tweetUrls.filter(t => {
        if (!t.hierarchical) return false;
        // Check if any top-level key matches activeCategory
        // hierarchical structure: { "Category": ["Subcat"], "Tag": [] }
        // We match keys.
        return Object.keys(t.hierarchical).includes(activeCategory);
    });
}

// availableDates declared at top

// Note: LRUCache, tweetMediaCache, openDB, saveToDB, getFromDB moved to js/cache.js

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


// Global Stream State
// Shared State
let currentMode = 'stream'; // Unified mode

// Legacy vars preserved to prevent crashes if referenced, but unused
let currentDateIndex = 0;
let loadedDates = new Set();
window.preloadSessionId = 0;
window.currentPreloadController = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    syncBodyThemeClass();
    setupThemeToggle();

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
        window.tweetLoader = new TweetStreamLoader();
        renderCategories();
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
// Infinite scroll handled by TweetLoader

/**
 * Load next date's content
 * @param {number} lookaheadCount - How many additional days to load sequentially (default 1)
 * @param {number} sessionId - Current background load session ID
 */
// Deprecated loadNextDate logic removed for Stream Mode
function loadNextDate() {
    console.warn('loadNextDate is deprecated. Use loadStreamBatch.');
}

/**
 * Kick off background preloading of upcoming dates without additional user scroll.
 * @param {number} startIndex - Index of the date that finished loading
 * @param {number} daysToLoad - How many future dates to fetch sequentially
 */
function preloadNextDates(startIndex, daysToLoad = 1) {
    if (!Array.isArray(availableDates) || availableDates.length === 0 || !hasMoreDates) {
        return;
    }

    let normalizedIndex = Number.isFinite(startIndex) ? startIndex : currentDateIndex;
    if (normalizedIndex < 0) normalizedIndex = 0;
    if (normalizedIndex >= availableDates.length - 1) {
        hasMoreDates = false;
        return;
    }

    if (currentDateIndex !== normalizedIndex) {
        currentDateIndex = normalizedIndex;
    }

    const sessionId = window.preloadSessionId || Date.now();
    if (!window.preloadSessionId) {
        window.preloadSessionId = sessionId;
    }

    const safeCount = Math.max(1, daysToLoad);
    console.log('[Preload] Starting background load from index', currentDateIndex + 1, 'for', safeCount, 'day(s)');
    loadNextDate(safeCount, sessionId);
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
        const currentView = 'gallery'; // Forced gallery mode
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
    const currentView = 'gallery'; // Forced gallery mode
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

            // SSOT: Manage AbortController for preloading
            window.preloadSessionId = Date.now();
            if (window.currentPreloadController) window.currentPreloadController.abort();
            window.currentPreloadController = new AbortController();

            const currentSession = window.preloadSessionId;
            const signal = window.currentPreloadController.signal;

            selectDateTab(date);
            loadContentForDate(date, false, () => {
                if (window.preloadSessionId === currentSession) {
                    loadNextDate(availableDates.length, currentSession);
                }
            }, signal);

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

    // Simplified Date Loading
    const fetchDates = (retryCount = 0) => {
        apiFetch('/api/dates')
            .then(r => r.ok ? r.json() : Promise.reject('API Error'))
            .then(data => {
                availableDates = data.dates || [];

                // Initialize infinite scroll vars
                currentDateIndex = 0;
                hasMoreStream = true;

                window.availableDates = availableDates; // Ensure global syncing
                renderDateTabs();
                // Always start from latest - Stream Mode
                if (Array.isArray(window.availableDates) && window.availableDates.length > 0) currentDate = window.availableDates[0].date;
                if (window.tweetLoader) window.tweetLoader.reset();
            })
            .catch(error => {
                console.error('Error loading dates:', error);

                // Retry logic
                if (retryCount < 2) {
                    setTimeout(() => fetchDates(retryCount + 1), 1000);
                } else {
                    // FINAL FALLBACK: Use hardcoded dates to ensure UI never breaks
                    console.warn('API Failed. Using Fallback Dates.');
                    const fallbackDates = [
                        { date: '2026-01-14' },
                        { date: '2026-01-13' },
                        { date: '2026-01-12' },
                        { date: '2026-01-11' }
                    ];
                    availableDates = fallbackDates;
                    window.availableDates = availableDates;
                    renderDateTabs();

                    // Set current date to latest
                    if (!currentDate && availableDates.length > 0) {
                        currentDate = availableDates[0].date;
                    }

                    // Show error toast but keep UI functional
                    const dateTabsContainer = document.getElementById('dateTabs');
                    // Ensure we don't overwrite if renderDateTabs handled it, but usually renderDateTabs clears it
                    // Actually renderDateTabs will check window.availableDates.
                }
            });
    };

    fetchDates();
}


// Render date tabs
// [Refactor] Date tabs logic moved to js/renderer.js


// Highlight the active date tab
// Highlight the active date tab with Anchor Logic
function selectDateTab(date) {
    // 1. Check if we can just scroll to an existing anchor
    const anchor = document.getElementById(`date-anchor-${date}`);
    if (anchor) {
        // Anchor exists, scroll to it
        // Offset for sticky header (approx 120px)
        const offset = 120;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = anchor.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        updateDateTabUI(date);
        return true;
    }

    // 2. Fallback: Load content (Jump/Reset)
    currentDate = date;

    // Update URL parameter
    // URL update removed per user request
    // current state: clean URL
    // const url = new URL(window.location);
    // url.searchParams.set('date', date);
    // window.history.replaceState({}, '', url);

    // Update UI
    updateDateTabUI(date);
    syncMobileNavSelection(date);

    // Reset infinite scroll state
    isLoadingMore = false;

    // Clear and load (Reset Mode)
    // We pass append=false to clear existing content
    loadContentForDate(date, false);
    return true;
}

// Setup ScrollSpy
// Setup ScrollSpy (Advanced ElementFromPoint Strategy for Continuous Stream)
function setupScrollSpy() {
    let ticking = false;
    let lastDate = null;

    const checkScrollPosition = () => {
        ticking = false;

        // Sampling point: Center of screen horizontal, 150px from top (below header)
        const x = window.innerWidth / 2;
        const y = 150;

        const el = document.elementFromPoint(x, y);
        if (el) {
            const item = el.closest('[data-date]');
            if (item) {
                const date = item.getAttribute('data-date');
                if (date && date !== lastDate) {
                    lastDate = date;
                    updateDateTabUI(date);
                    if (window.syncMobileNavSelection) syncMobileNavSelection(date);
                }
            }
        }
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(checkScrollPosition);
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    setTimeout(checkScrollPosition, 1000);
}

// Helper to update UI classes only
function updateDateTabUI(date) {
    const tabs = document.querySelectorAll('.date-tab, .mobile-date-item');
    if (tabs.length === 0) return;

    let soundPlayed = false;

    tabs.forEach(tab => {
        const isTarget = tab.getAttribute('data-date') === date || tab.dataset.date === date;
        const wasActive = tab.classList.contains('active');

        if (isTarget) {
            tab.classList.add('active');
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

            // Play sound if it WAS NOT active before (change detected)
            if (!wasActive && !soundPlayed) {
                if (window.playDateTick) window.playDateTick();
                soundPlayed = true; // Ensure only plays once per update
            }
        } else {
            tab.classList.remove('active');
        }
    });
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

/**
 * Load content for specific date
 * @param {string} date - Date string
 * @param {boolean} append - Whether to append or clear
 * @param {Function} callback - Success callback
 * @param {AbortSignal} signal - Abort signal (Linus Mode: for request cancellation)
 */
/**
 * Core Stream Loader
 * Replaces Date-Based Loading with Quantity-Based Loading (Limit 50)
 */
// Adapter: Date Selection
window.selectDateTab = function (date) {
    const anchor = document.getElementById(`date-anchor-${date}`);
    if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth' });
        updateDateTabUI(date);
    } else {
        console.log('[Stream] Jumping to date:', date);
        if (window.tweetLoader) window.tweetLoader.reset(date, window.tweetLoader?.activeGlobalCategory);
    }
}

// Accordion: Toggle Category Group (Expand/Collapse)
window.toggleCategoryGroup = function (parentName, forceExpand = false) {
    const group = parentName ? document.querySelector(`.category-group[data-parent="${parentName}"]`) : null;
    const children = group?.querySelector('.category-children');
    const toggle = group?.querySelector('.category-toggle');

    // Collapse all other expanded groups
    document.querySelectorAll('.category-children.expanded').forEach(el => {
        if (el !== children) {
            el.classList.remove('expanded');
            el.parentElement.querySelector('.category-toggle')?.classList.remove('expanded');
        }
    });

    // If no target group, just collapse all (used when selecting "All")
    if (!children) return;

    const shouldExpand = forceExpand || !children.classList.contains('expanded');
    children.classList.toggle('expanded', shouldExpand);
    toggle?.classList.toggle('expanded', shouldExpand);
};

window.selectCategory = function (cat) {
    if (!window.tweetLoader) return;

    const clearBtn = document.getElementById('clearCategoryFilter');

    if (!cat) {
        window.tweetLoader.reset(null, null);
        window.toggleCategoryGroup(null);
        if (clearBtn) clearBtn.style.display = 'none';
    } else {
        window.tweetLoader.reset(null, cat);
        const isParent = document.querySelector(`.category-group[data-parent="${cat}"]`);
        if (isParent) {
            window.toggleCategoryGroup(cat, true);
        } else {
            const activeChild = document.querySelector('.category-item.child.active') 
                || Array.from(document.querySelectorAll('.category-item.child')).find(el => el.textContent.includes(cat));
            const parentName = activeChild?.closest('.category-group')?.dataset.parent;
            if (parentName) window.toggleCategoryGroup(parentName, true);
        }
        if (clearBtn) clearBtn.style.display = 'flex';
    }
    updateSidebarActiveState();
}

window.selectTag = function (tag) {
    if (!window.tweetLoader) return;
    window.tweetLoader.reset(null, null, null, tag);
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
}

window.selectAuthor = function (author) {
    if (!window.tweetLoader) return;
    console.log('[Stream] Selecting Author:', author);

    const clearBtn = document.getElementById('clearAuthorFilter');

    // Mutual Exclusion: Clear Category when selecting Author
    if (activeAuthorFilter === author) {
        // Toggle OFF (if clicking already active)
        activeAuthorFilter = null;
        window.tweetLoader.reset(null, null, null);
        if (clearBtn) clearBtn.style.display = 'none';
    } else {
        activeAuthorFilter = author;
        window.tweetLoader.reset(null, null, author);
        if (clearBtn) clearBtn.style.display = 'flex';
    }

    // Update UI
    document.querySelectorAll('.author-item').forEach(el => {
        const nameEl = el.querySelector('.author-name');
        if (nameEl && nameEl.textContent === `@${author}`) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    // Clear Category UI
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    // Select "All" in categories if we are clearing category
    const allBtn = document.getElementById('cat-item-all');
    if (allBtn) allBtn.classList.add('active');
}

// Clear Author Filter
window.clearAuthorFilter = function () {
    if (!window.tweetLoader) return;
    
    activeAuthorFilter = null;
    window.tweetLoader.reset(null, null, null);
    
    // Hide clear button
    const clearBtn = document.getElementById('clearAuthorFilter');
    if (clearBtn) clearBtn.style.display = 'none';
    
    // Clear active state from all author items
    document.querySelectorAll('.author-item').forEach(el => el.classList.remove('active'));
    
    // Reset category to "All"
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    const allBtn = document.getElementById('cat-item-all');
    if (allBtn) allBtn.classList.add('active');
};

// Deprecated function stubs
function loadContentForDate() { console.warn('Deprecated'); return Promise.resolve(0); }


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
async function waitForLibraries(timeout = 10000) {
    const startTime = Date.now();

    // 首先检查库是否已经加载
    if (typeof html2canvas !== 'undefined' && typeof JSZip !== 'undefined') {
        return true;
    }

    // 监听库加载完成的自定义事件
    return new Promise(resolve => {
        let resolved = false;

        const librariesLoadedHandler = () => {
            if (!resolved) {
                resolved = true;
                document.removeEventListener('librariesLoaded', librariesLoadedHandler);
                resolve(true);
            }
        };

        document.addEventListener('librariesLoaded', librariesLoadedHandler);

        // 同时轮询检查全局变量（双重保险）
        const checkInterval = setInterval(() => {
            if (!resolved && typeof html2canvas !== 'undefined' && typeof JSZip !== 'undefined') {
                resolved = true;
                clearInterval(checkInterval);
                document.removeEventListener('librariesLoaded', librariesLoadedHandler);
                resolve(true);
            }
        }, 200);

        // 设置超时，以防事件永远不会触发
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                clearInterval(checkInterval);
                document.removeEventListener('librariesLoaded', librariesLoadedHandler);
                resolve(false);
            }
        }, timeout);
    });
}

// Test library loading function - can be called from console
window.testLibraries = function () {
    const html2canvasStatus = typeof html2canvas !== 'undefined' ?
        '✓ 已加载 (版本: ' + (html2canvas.version || '未知') + ')' :
        '✗ 未加载';

    const jszipStatus = typeof JSZip !== 'undefined' ?
        '✓ 已加载 (版本: ' + (JSZip.version || '未知') + ')' :
        '✗ 未加载';

    console.log('=== 库加载状态检查 ===');
    console.log('html2canvas:', html2canvasStatus);
    console.log('JSZip:', jszipStatus);
    console.log('window.librariesReady:', window.librariesReady ? '✓ 已就绪' : '✗ 未就绪');

    return {
        html2canvas: typeof html2canvas !== 'undefined',
        jszip: typeof JSZip !== 'undefined',
        librariesReady: window.librariesReady || false
    };
};

// Debug button removed per request

// Generate image from container and download content as ZIP
// [Refactor] moved to renderer.js and custom-tweet-card.js


// Sticky Date Indicator Logic (Horizontal Line Follower)
// Sticky Date Indicator Logic (Vertical Line & Fixed Label)
function initFloatingDateIndicator() {
    // Create Label
    // Label removed per request
    // const indicator = document.createElement('div'); ...

    // Create Line
    const line = document.createElement('div');
    line.className = 'sticky-date-line';
    document.body.appendChild(line);

    // Audio removed (moved to global scope)

    let currentVisibleDate = '';
    let isVisible = false;
    let containerRect = null;
    let ticking = false;
    let lastX = 0;
    let lastY = 0;

    // Update container bounds (throttled)
    const updateContainerBounds = () => {
        const container = document.querySelector('.content-list') || document.querySelector('.container');
        if (container) {
            containerRect = container.getBoundingClientRect();
            // User requested position in the "red box" to the left of content (Gutter).
            // We place it to the left of the container. 
            // Assuming label width ~80-100px.
            // Ensure it's at least 10px from screen edge.
            // indicator.style.left = ... (Label removed)
        }
    };

    window.addEventListener('resize', updateContainerBounds);
    window.addEventListener('scroll', updateContainerBounds, { passive: true });
    setTimeout(updateContainerBounds, 1000);

    // Core Animation Loop (Performance Optimization)
    const updateFrame = () => {
        ticking = false;

        // 1. ALWAYS Visible Strategy (User request: "Anytime needs to be visible")
        // We do not hide based on horizontal bounds.

        // 2. Find Date
        // Strategy: 
        // A. Check element directly under mouse.
        // B. If not found (e.g. mouse in sidebar), probe the CENTER of the container at this Y level.

        let foundDate = null;
        let probeX = lastX;

        // Try direct hit first
        let el = document.elementFromPoint(probeX, lastY);
        if (el) {
            const item = el.closest('[data-date]');
            if (item) {
                foundDate = item.getAttribute('data-date');
            }
        }

        // If direct hit failed, and we have a container, probe the middle of the container
        if (!foundDate && containerRect) {
            // Probe Center: Left + Width / 2
            const backupX = containerRect.left + (containerRect.width / 2);
            // Only probe if backupX is different significantly from lastX to avoid redundant check
            if (Math.abs(backupX - lastX) > 50) {
                el = document.elementFromPoint(backupX, lastY);
                if (el) {
                    const item = el.closest('[data-date]');
                    if (item) {
                        foundDate = item.getAttribute('data-date');
                    }
                }
            }
        }

        // 3. Render
        if (foundDate) {
            // Update Text
            if (foundDate !== currentVisibleDate) {
                currentVisibleDate = foundDate;
                try {
                    const d = new Date(foundDate);
                    const month = d.getMonth() + 1;
                    const day = d.getDate();
                    const mStr = month < 10 ? '0' + month : month;
                    const dStr = day < 10 ? '0' + day : day;
                    // indicator.textContent = `${d.getFullYear()}-${mStr}-${dStr}`;

                    // Play Tick Sound
                    // Sound removed from here (moved to updateDateTabUI)
                } catch (e) {
                    // indicator.textContent = foundDate;
                }
            }
        }

        // Always update position (Vertical Follow)
        line.style.top = `${lastY}px`;
        // indicator.style.top = `${lastY}px`;

        // Always Show (if we have a currentVisibleDate context at all, or just always?)
        // User said "Anytime visible". 
        // We will show it if we have at least one valid date string to show, 
        // or if we just want the line? 
        // Let's assume we show it if we have a date. 
        if (currentVisibleDate) {
            if (!isVisible) {
                // indicator.classList.add('visible');
                line.classList.add('visible');
                isVisible = true;
            }
        }
    };

    // Input Handler
    window.addEventListener('mousemove', (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (!ticking) {
            requestAnimationFrame(updateFrame);
            ticking = true;
        }
    }, { passive: true });
}



// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingDateIndicator);
} else {
    initFloatingDateIndicator();
}

// Scroll to Top Logic
function initScrollToTop() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Desktop Header
    const desktopTitle = document.querySelector('.top-bar-logo');
    if (desktopTitle) {
        desktopTitle.addEventListener('click', scrollToTop);
    }

    // Mobile Header
    const mobileTitle = document.querySelector('.mobile-nav-title');
    if (mobileTitle) {
        mobileTitle.addEventListener('click', scrollToTop);
    }
}

// Init Scroll To Top
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollToTop);
} else {
    initScrollToTop();
}

// ==========================================
// Author Stats & Filtering Logic
// ==========================================

// Author Stats Logic
// activeAuthorFilter moved to top of file
// let activeAuthorFilter = null;

async function initAuthorStats() {
    const listContainer = document.getElementById('authorList');

    if (!listContainer) return;

    // Reset interaction removed


    try {
        // Fetch stats
        const res = await apiFetch('/api/stats');
        if (!res.ok) throw new Error('Status ' + res.status);

        const response = await res.json();

        if (!response || !response.authors) {
            listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary)">No stats</div>';
            return;
        }

        const authors = response.authors.filter(a => a.name && a.name.toLowerCase() !== 'unknown'); // [{name, count}]

        listContainer.innerHTML = '';

        authors.forEach(author => {
            const item = document.createElement('div');
            item.className = 'author-item';
            // Simple rendering: Name only
            item.innerHTML = `
                <span class="author-name">@${author.name}</span>
                <span class="author-count">${author.count}</span>
            `;

            // Click behavior: Filter by Author
            item.addEventListener('click', () => {
                window.selectAuthor(author.name);
            });

            listContainer.appendChild(item);
        });

    } catch (e) {
        console.error('Failed to load author stats', e);
        listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary)">Error loading stats</div>';
    }
}

// Simplified: No longer actively filtering, just navigating
async function handleAuthorClick(handle, element) {
    // Deprecated in favor of direct window.open in listener above
}

// Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthorStats);
} else {
    initAuthorStats();
}

// Render Global Category Sidebar (Fetched from Backend)
// [Refactor] Category sidebar logic moved to js/renderer.js




// Init ScrollSpy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupScrollSpy);
} else {
    setupScrollSpy();
}

// ==========================================
// Global Audio (Date Ticks)
// ==========================================
const globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();

// Watch/Clock Tick Sound (Crisp Quartz/Mechanical)
window.playDateTick = () => {
    try {
        if (globalAudioContext.state === 'suspended') globalAudioContext.resume();
        const oscillator = globalAudioContext.createOscillator();
        const gainNode = globalAudioContext.createGain();

        // High frequency sine impulse
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, globalAudioContext.currentTime);

        // Very sharp envelope
        gainNode.gain.setValueAtTime(0, globalAudioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, globalAudioContext.currentTime + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, globalAudioContext.currentTime + 0.03);

        oscillator.connect(gainNode);
        gainNode.connect(globalAudioContext.destination);

        oscillator.start();
        oscillator.stop(globalAudioContext.currentTime + 0.05);
    } catch (e) {
        console.warn('Audio play failed', e);
    }
};
