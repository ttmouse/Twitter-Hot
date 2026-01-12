/**
 * Tweet Detail Modal Component
 * Reusable modal component with keyboard navigation and thumbnail preview
 */

// Modal navigation global variables - attached to window to avoid redeclaration and maintain state
window.currentModalIndex = window.currentModalIndex ?? -1;
window.visibleCards = window.visibleCards ?? [];
window.modalKeyboardHandler = window.modalKeyboardHandler ?? null;
window.isPreloading = window.isPreloading ?? false;

// Expose updateThumbnail globally for script.js preloading access
window.updateThumbnail = (index) => {
    if (typeof updateThumbnailUI === 'function') {
        updateThumbnailUI(index);
    }
};

/**
 * Open Tweet Detail Modal
 * @param {Object} data - Tweet data
 * @param {string} url - Tweet URL
 * @param {number} index - Current card index
 * @param {Array} cards - All visible cards array
 */
function openTweetDetail(data, url, index, cards) {
    console.log('[Modal] openTweetDetail called, index:', index, 'cards:', cards.length);
    const modal = document.getElementById('tweetDetailModal');

    if (!modal) {
        console.error('[Modal] Modal element not found!');
        return;
    }

    // Save current state
    window.currentModalIndex = index;
    window.visibleCards = cards;

    // Optimistically update card dataset with passed data if it appears to be valid tweet data
    const card = cards[index];
    if (card && data && (data.text || data.user_name) && data.user_name !== 'Loading...') {
        console.log('[Modal] Pre-populating card dataset with passed data');
        card.dataset.tweetData = JSON.stringify(data);
        delete card.dataset.loading;

        // Linus Mode: SSOT - Sync passed data to global cache immediately
        if (typeof window.tweetMediaCache !== 'undefined' && typeof window.extractImageUrlsFromTweetInfo === 'function') {
            const tweetId = card.dataset.tweetId;
            const images = window.extractImageUrlsFromTweetInfo(data);
            window.tweetMediaCache.set(tweetId, { images, data });
            console.log('[Modal SSOT] Synced passed data to global cache for tweetId:', tweetId);
        }
    }

    // Generate all thumbnails
    generateThumbnails();

    // Update main card content
    updateMainCard(window.currentModalIndex);

    // Show Modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    console.log('[Modal] Modal displayed');

    // Remove old keyboard event listener
    if (window.modalKeyboardHandler) {
        document.removeEventListener('keydown', window.modalKeyboardHandler);
    }

    // Add keyboard event listener
    window.modalKeyboardHandler = (e) => {
        // Ignore keypresses in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case 'Escape':
                closeTweetDetail();
                break;
            case ' ':
                e.preventDefault();
                toggleCurrentTweetSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                scrollModalContent(-100);
                break;
            case 'ArrowDown':
                e.preventDefault();
                scrollModalContent(100);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                navigateToTweet(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateToTweet(1);
                break;
            case 'Enter':
                e.preventDefault();
                openCurrentTweet();
                break;
        }
    };

    document.addEventListener('keydown', window.modalKeyboardHandler);

    // Add wheel event listener for scrolling navigation
    window.modalWheelHandler = (e) => {
        const SCROLL_COOLDOWN = 500; // ms
        const now = Date.now();
        if (now - window.lastScrollTime < SCROLL_COOLDOWN) {
            return;
        }

        // Determine scroll direction
        const delta = e.deltaY;
        if (Math.abs(delta) < 10) return; // Ignore small movements

        const direction = delta > 0 ? 1 : -1;

        // Check if we are over a scrollable element (specifically the text body)
        const scrollable = e.target.closest('.tweet-detail-body');

        if (scrollable) {
            // Check if scrollable
            const isScrollable = scrollable.scrollHeight > scrollable.clientHeight;

            if (isScrollable) {
                // If scrolling down
                if (direction > 0) {
                    // Allow scroll if not at bottom (with small buffer)
                    if (scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 1) {
                        return; // Let default scroll happen
                    }
                }
                // If scrolling up
                else {
                    // Allow scroll if not at top
                    if (scrollable.scrollTop > 1) {
                        return; // Let default scroll happen
                    }
                }
            }
        }

        // Navigate
        window.lastScrollTime = now;
        navigateToTweet(direction);
    };

    // Use passive: false to allow preventDefault if needed (though we don't preventDefault here yet)
    // Attaching to modal ensures we capture it
    modal.addEventListener('wheel', window.modalWheelHandler, { passive: true });

    // Click background to close - using one-time event listener to avoid accumulation
    const handleModalClick = (e) => {
        if (e.target === modal) {
            closeTweetDetail();
        }
    };

    // Remove old listener (if exists)
    if (modal._clickHandler) {
        modal.removeEventListener('click', modal._clickHandler);
    }
    modal._clickHandler = handleModalClick;
    modal.addEventListener('click', handleModalClick);

    // Main card doesn't trigger close
    const mainCard = document.getElementById('mainCard');
    const handleMainCardClick = (e) => {
        e.stopPropagation();
    };

    if (mainCard._clickHandler) {
        mainCard.removeEventListener('click', mainCard._clickHandler);
    }
    mainCard._clickHandler = handleMainCardClick;
    mainCard.addEventListener('click', handleMainCardClick);

    // Selected indicator click event
    const indicator = document.getElementById('modalSelectedIndicator');
    const handleIndicatorClick = (e) => {
        e.stopPropagation();
        toggleCurrentTweetSelection();
    };

    if (indicator._clickHandler) {
        indicator.removeEventListener('click', indicator._clickHandler);
    }
    indicator._clickHandler = handleIndicatorClick;
    indicator.addEventListener('click', handleIndicatorClick);

    console.log('[Modal] All event listeners attached');
}

/**
 * Get Tweet Data from various sources (SSOT Helper)
 * @param {number} index - Card index
 * @returns {Object|null} - Tweet data
 */
function getTweetDataForIndex(index) {
    const card = window.visibleCards[index];
    if (!card) return null;
    const tweetId = card.dataset.tweetId;

    // Priority 1: Global Memory Cache (The Authority)
    if (typeof window.tweetMediaCache !== 'undefined') {
        const cached = window.tweetMediaCache.get(tweetId);
        if (cached && cached.data) return cached.data;
    }

    // Priority 2: DOM Dataset (The Local Cache)
    if (card.dataset.tweetData) {
        try {
            return JSON.parse(card.dataset.tweetData);
        } catch (e) {
            console.error('[Modal] Failed to parse dataset data:', e);
        }
    }

    return null;
}

/**
 * Generate thumbnail HTML content
 * @param {Object} cardData - Tweet data (can be null)
 * @param {HTMLElement} card - The card element (optional, for accessing dataset)
 * @returns {string} - HTML content
 */
function getThumbnailHtml(cardData, card = null) {
    // 0. Priority: Try to use existing DOM image from the card (Most stable, avoids reload)
    if (card) {
        const existingImg = card.querySelector('img');
        if (existingImg && existingImg.src && existingImg.complete && existingImg.naturalWidth > 0) {
            // Essential: Maintain crossOrigin attribute to ensure browser cache hit
            // (Chrome isolates cache by CORS mode, so missing this causes re-download)
            const crossOriginAttr = existingImg.crossOrigin ? ` crossOrigin="${existingImg.crossOrigin}"` : ' crossOrigin="anonymous"';
            return `<img src="${existingImg.src}" alt="Thumbnail" loading="lazy"${crossOriginAttr}>`;
        }
    }

    // 1. Try to use full card data first - The most accurate source
    if (cardData) {
        if (cardData.media_extended && cardData.media_extended.length > 0) {
            const firstMedia = cardData.media_extended[0];

            // For videos/GIFs, we specifically want the thumbnail_url if available
            // standard 'url' usually points to the mp4 which is fine for <video> but n/a for <img>
            let thumbUrl = firstMedia.url;
            if (firstMedia.type === 'video' || firstMedia.type === 'animated_gif') {
                thumbUrl = firstMedia.thumbnail_url || firstMedia.url || firstMedia.media_url_https;
            } else {
                thumbUrl = firstMedia.url || firstMedia.media_url_https;
            }

            return `<img src="${thumbUrl}" alt="Thumbnail" loading="lazy" crossOrigin="anonymous">`;
        } else if (cardData.mediaURLs && cardData.mediaURLs.length > 0) {
            return `<img src="${cardData.mediaURLs[0]}" alt="Thumbnail" loading="lazy" crossOrigin="anonymous">`;
        } else {
            return `<div class="thumbnail-item-placeholder">${(cardData.text || '').substring(0, 20)}</div>`;
        }
    }

    // 2. Try to use cached media from dataset (Preloading state or cached)
    if (card && card.dataset.cachedMedia) {
        try {
            const cachedMedia = JSON.parse(card.dataset.cachedMedia);
            if (cachedMedia && cachedMedia.length > 0) {
                const firstMedia = cachedMedia[0];
                // In cachedMedia (from script.js), video objects already have key 'url' set to thumbnail
                const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia.url;
                return `<img src="${mediaUrl}" alt="Thumbnail" crossOrigin="anonymous">`;
            } else {
                return `<div class="thumbnail-item-placeholder">No media</div>`;
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    // 3. Handle loading states
    const loadingState = card ? card.dataset.loading : null;

    if (loadingState === 'true' || loadingState === 'loading') {
        return `<div class="thumbnail-item-placeholder"><div class="loading-spinner small"></div></div>`;
    }

    if (loadingState === 'failed') {
        return `<div class="thumbnail-item-placeholder">!</div>`;
    }

    // 4. Default fallback
    return `<div class="thumbnail-item-placeholder">?</div>`;
}

/**
 * Generate all thumbnails
 * @param {number} startIndex - Optional start index for incremental update (only add new thumbnails after this index)
 */
function generateThumbnails(startIndex = 0) {
    const thumbnailStrip = document.getElementById('thumbnailStrip');

    // Optimization: Reuse existing elements if possible instead of clearing
    // This prevents flickering when re-opening modal
    if (startIndex === 0 && thumbnailStrip.children.length !== window.visibleCards.length) {
        thumbnailStrip.innerHTML = '';
    }

    for (let index = startIndex; index < window.visibleCards.length; index++) {
        // Skip if element already exists and matches (for incremental updates or re-runs)
        if (thumbnailStrip.children[index] && thumbnailStrip.children[index].dataset.index == index) {
            // Just update selection state instead of recreating
            const item = thumbnailStrip.children[index];
            const isCurrent = index === window.currentModalIndex;
            const card = window.visibleCards[index];
            const checkbox = card ? card.querySelector('.tweet-check-input') : null;
            const isSelected = checkbox && checkbox.checked;

            if (isCurrent) item.classList.add('active');
            else item.classList.remove('active');

            if (isSelected) item.classList.remove('unselected');
            else item.classList.add('unselected');

            continue;
        }

        const card = window.visibleCards[index];
        if (!card) continue;

        const isCurrent = index === window.currentModalIndex;
        const checkbox = card.querySelector('.tweet-check-input');
        const isSelected = checkbox && checkbox.checked;

        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = `thumbnail-item${isCurrent ? ' active' : ''}${!isSelected ? ' unselected' : ''}`;
        thumbnailItem.dataset.index = index;

        const cardData = getTweetDataForIndex(index);
        const thumbnailContent = getThumbnailHtml(cardData, card);

        thumbnailItem.innerHTML = `
            ${thumbnailContent}
            <div class="thumbnail-item-number">${index + 1}</div>
            ${isSelected ? `<div class="thumbnail-item-selected">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>` : ''}
        `;

        thumbnailItem.addEventListener('click', () => navigateToIndex(index));
        thumbnailStrip.appendChild(thumbnailItem);
    }
    scrollToActiveThumbnail();
}

/**
 * Update a specific thumbnail content
 * @param {number} index - The index of the thumbnail to update
 */
function updateThumbnailUI(index) {
    const thumbnailStrip = document.getElementById('thumbnailStrip');
    const thumbnailItem = thumbnailStrip.querySelector(`.thumbnail-item[data-index="${index}"]`);
    if (!thumbnailItem) return;

    const card = window.visibleCards[index];
    if (!card) return;

    const checkbox = card.querySelector('.tweet-check-input');
    const isSelected = checkbox && checkbox.checked;

    const cardData = getTweetDataForIndex(index);
    const newContentHtml = getThumbnailHtml(cardData, card);

    // Smart update: Check if content actually changed to avoid image reload flicker
    const existingImg = thumbnailItem.querySelector('img');
    let contentChanged = true;

    if (existingImg) {
        // Create a temporary element to parse the new HTML safely
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContentHtml;
        const newImg = tempDiv.querySelector('img');

        // Compare src attributes if both are images
        if (newImg && newImg.src === existingImg.src) {
            contentChanged = false;
        }
    }

    if (contentChanged) {
        // Update innerHTML while preserving the number and selection indicator
        thumbnailItem.innerHTML = `
            ${newContentHtml}
            <div class="thumbnail-item-number">${index + 1}</div>
            ${isSelected ? `<div class="thumbnail-item-selected">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>` : ''}
        `;
    } else {
        // Content hasn't changed, only update selection overlay
        const existingSelection = thumbnailItem.querySelector('.thumbnail-item-selected');

        if (isSelected && !existingSelection) {
            const selDiv = document.createElement('div');
            selDiv.className = 'thumbnail-item-selected';
            selDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            thumbnailItem.appendChild(selDiv);
        } else if (!isSelected && existingSelection) {
            existingSelection.remove();
        }
    }

    // Also update selection state class
    if (isSelected) {
        thumbnailItem.classList.remove('unselected');
    } else {
        thumbnailItem.classList.add('unselected');
    }
}

/**
 * Scroll to the currently active thumbnail
 */
function scrollToActiveThumbnail() {
    const thumbnailStrip = document.getElementById('thumbnailStrip');
    const activeThumbnail = thumbnailStrip.querySelector('.thumbnail-item.active');

    if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}

/**
 * Scroll modal images horizontally (Keyboard Navigation)
 * @param {number} direction - 1 for right (next), -1 for left (prev)
 */
function scrollModalImages(direction) {
    const imagesContainer = document.getElementById('modalImages');
    if (!imagesContainer) return;

    // Check if scrollable
    if (imagesContainer.scrollWidth <= imagesContainer.clientWidth) return;

    // Scroll by one page width
    const scrollAmount = imagesContainer.clientWidth;

    imagesContainer.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

/**
 * Scroll modal card content
 * @param {number} delta - Scroll distance (positive for down, negative for up)
 */
function scrollModalContent(delta) {
    const modalBody = document.querySelector('.tweet-detail-body');
    if (modalBody) {
        modalBody.scrollBy({
            top: delta,
            behavior: 'smooth'
        });
    }
}

/**
 * Navigate to specified index
 * @param {number} index - Target index
 */
function navigateToIndex(index) {
    if (index < 0 || index >= window.visibleCards.length || index === window.currentModalIndex) {
        return;
    }

    window.currentModalIndex = index;

    // Update thumbnail active state
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });

    // Scroll to current thumbnail
    scrollToActiveThumbnail();

    // Update main card
    updateMainCard(index);
}

/**
 * Update main card content
 * @param {number} index - Card index
 */
async function updateMainCard(index) {
    const card = window.visibleCards[index];
    if (!card) return;

    const itemTweetId = card.dataset.tweetId;

    // Linus Mode: Single Source of Truth - Prioritize Global Cache
    if (typeof window.tweetMediaCache !== 'undefined') {
        const cached = window.tweetMediaCache.get(itemTweetId);
        if (cached && cached.data) {
            console.log('[Modal SSOT] Using global cache for index:', index);
            // Sync to dataset for legacy components
            card.dataset.tweetData = JSON.stringify(cached.data);
            if (cached.images) card.dataset.cachedMedia = JSON.stringify(cached.images);
            card.dataset.loading = 'finished';

            updateCardDisplay(index);
            updateThumbnailUI(index);
            return;
        }
    }

    // Fallback: Check dataset if cache missed but dataset has it
    if (card.dataset.tweetData) {
        console.log('[Modal] Using existing dataset for index:', index);
        updateCardDisplay(index);
        return;
    }

    // Load data if missing
    showCardLoading();

    try {
        let tweetData;

        // Use centralized fetch function if available
        if (typeof window.fetchTweetMedia === 'function') {
            const result = await window.fetchTweetMedia(itemTweetId);
            tweetData = result.fullData;
            if (result.images) {
                card.dataset.cachedMedia = JSON.stringify(result.images);
            }
        } else {
            // Direct fetch fallback
            const fetchFn = typeof window.apiFetch === 'function' ? window.apiFetch : fetch;
            const response = await fetchFn(`/api/tweet_info?id=${itemTweetId}`);
            if (!response.ok) throw new Error('Failed to fetch');
            tweetData = await response.json();
        }

        card.dataset.tweetData = JSON.stringify(tweetData);
        card.dataset.loading = 'finished';

        // Ensure cache is updated if possible
        if (typeof window.tweetMediaCache !== 'undefined' && typeof window.extractImageUrlsFromTweetInfo === 'function') {
            const images = window.extractImageUrlsFromTweetInfo(tweetData);
            window.tweetMediaCache.set(itemTweetId, {
                images,
                data: tweetData
            });
        }

        updateCardDisplay(index);
        updateThumbnailUI(index);
    } catch (error) {
        console.error('[Modal] Failed to load card data:', error);
        showCardError();
    }
}

/**
 * Show loading state in modal
 */
function showCardLoading() {
    document.getElementById('modalAvatar').src = '';
    document.getElementById('modalName').textContent = 'Loading...';
    document.getElementById('modalUsername').textContent = '';
    document.getElementById('modalText').textContent = 'Loading tweet details...';

    const imagesContainer = document.getElementById('modalImages');
    imagesContainer.innerHTML = '<div class="loading-spinner"></div>';

    document.getElementById('modalLikes').textContent = '0';
    document.getElementById('modalRetweets').textContent = '0';
    document.getElementById('modalReplies').textContent = '0';
    document.getElementById('modalTime').textContent = '';
}

/**
 * Show error state in modal
 */
function showCardError() {
    document.getElementById('modalName').textContent = 'Loading Failed';
    document.getElementById('modalUsername').textContent = '';
    document.getElementById('modalText').textContent = 'Unable to connect to the API. Please ensure the backend server is running (e.g., on Port 4310) and apiBaseUrl is correctly configured.';

    const imagesContainer = document.getElementById('modalImages');
    // Use margin: auto to center the error message
    imagesContainer.innerHTML = '<div style="color: var(--text-muted); padding: 2rem; text-align: center; margin: auto;">Failed to load</div>';
}

/**
 * Helper: Find a reusable image element from the DOM (List View or Thumbnail Strip)
 * to use for seamless transitions.
 * @param {number} index - The index of the tweet in visibleCards
 * @param {string} targetUrl - The URL of the image we are trying to display
 * @returns {HTMLImageElement|null} - The found image element or null
 */
function findReusableImage(index, targetUrl) {
    if (!targetUrl) return null;

    // 1. Get the card from visibleCards
    const listCard = window.visibleCards[index];

    // 2. Identify candidate images
    let candidates = [];

    // A. From List Card (Check all images inside)
    if (listCard) {
        const imgs = listCard.querySelectorAll('img');
        candidates.push(...Array.from(imgs));
    }

    // B. From Thumbnail Strip
    const thumbnailStrip = document.getElementById('thumbnailStrip');
    if (thumbnailStrip) {
        const thumbItem = thumbnailStrip.querySelector(`.thumbnail-item[data-index="${index}"] img`);
        if (thumbItem) candidates.push(thumbItem);
    }

    // 3. Normalize target URL for comparison
    // Create a temporary anchor to resolve relative URLs and normalize
    const targetAnchor = document.createElement('a');
    targetAnchor.href = targetUrl;
    const absTargetUrl = targetAnchor.href;

    // 4. Find match with loose criteria
    for (const img of candidates) {
        // Skip incomplete or broken images
        if (!img.complete || img.naturalWidth === 0) continue;

        // A. Exact match
        if (img.src === absTargetUrl) return img;

        // B. Loose match (ignore protocol http vs https)
        if (img.src.replace(/^https?:/, '') === absTargetUrl.replace(/^https?:/, '')) return img;

        // C. Decoded match (handle %20 etc)
        try {
            if (decodeURIComponent(img.src) === decodeURIComponent(absTargetUrl)) return img;
        } catch (e) { }

        // C2. Base URL match (ignore query params) - Strict than filename, looser than exact
        try {
            if (img.src.split('?')[0] === absTargetUrl.split('?')[0]) return img;
        } catch (e) { }

        // D. Filename match (Last resort: if filenames match and are long enough to be unique)
        // This handles cases where CDN params might differ slightly
        try {
            const imgFile = img.src.split('/').pop().split('?')[0];
            const targetFile = absTargetUrl.split('/').pop().split('?')[0];
            if (imgFile && targetFile && imgFile === targetFile && imgFile.length > 5) {
                // console.log('[Modal] Matched image by filename:', imgFile);
                return img;
            }
        } catch (e) { }
    }

    return null;
}

/**
 * Update card display with loaded data
 * @param {number} index - Card index
 */
function updateCardDisplay(index) {
    const card = window.visibleCards[index];
    if (!card || !card.dataset.tweetData) return;

    // Update the corresponding thumbnail in the strip
    updateThumbnailUI(index);

    try {
        const cardData = JSON.parse(card.dataset.tweetData);
        const checkbox = card.querySelector('.tweet-check-input');
        const cardUrl = card.dataset.tweetUrl || (checkbox ? checkbox.value : '');
        const isSelected = checkbox ? checkbox.checked : true; // Default to selected if no checkbox

        // Update main card selection state style
        const mainCard = document.getElementById('mainCard');
        if (isSelected) {
            mainCard.classList.remove('unselected');
        } else {
            mainCard.classList.add('unselected');
        }

        // Fill user info
        document.getElementById('modalAvatar').src = cardData.user_profile_image_url || '';
        document.getElementById('modalName').textContent = cardData.user_name || 'Unknown';
        document.getElementById('modalUsername').textContent = `@${cardData.user_screen_name || 'unknown'}`;

        // Update position indicator
        document.getElementById('modalPosition').textContent = `${index + 1} / ${window.visibleCards.length}`;

        // Update selection state
        const indicator = document.getElementById('modalSelectedIndicator');
        if (checkbox && checkbox.checked) {
            indicator.classList.add('selected');
        } else {
            indicator.classList.remove('selected');
        }

        // Fill tweet text
        document.getElementById('modalText').textContent = cardData.text || '';

        // Fill media (full version)
        const imagesContainer = document.getElementById('modalImages');
        imagesContainer.innerHTML = '';
        imagesContainer.className = 'tweet-detail-images';

        // Create wrapper for alignment control (Center if fits, Left if overflows)
        const imagesWrapper = document.createElement('div');
        imagesWrapper.className = 'images-wrapper';
        imagesContainer.appendChild(imagesWrapper);

        const renderItems = (items, isMediaExtended = false) => {
            items.forEach((item, idx) => {
                const isVideo = isMediaExtended ? (item.type === 'video' || item.type === 'animated_gif') : false;
                const url = isMediaExtended ? item.url : item;
                // For video, try to find a thumbnail URL to use as poster/placeholder
                const thumbUrl = isMediaExtended ? (item.thumbnail_url || item.media_url_https) : null;

                const mediaWrapper = document.createElement('div');
                mediaWrapper.className = 'media-wrapper';
                mediaWrapper.style.position = 'relative';
                // Remove fixed width/height 100% to allow flex sizing in wrapper
                // mediaWrapper.style.width = '100%'; 
                // mediaWrapper.style.height = '100%';
                // Instead, let CSS handle it or set reasonable defaults
                mediaWrapper.style.height = '100%';
                mediaWrapper.style.display = 'flex';
                mediaWrapper.style.alignItems = 'center';
                mediaWrapper.style.justifyContent = 'center';

                if (!isVideo) {
                    let imgEl;

                    // Optimization: Try to clone the image from multiple sources
                    let reusableImg = findReusableImage(index, url);

                    // Force Placeholder Strategy:
                    // For the first image (idx === 0), if we can't find an exact match,
                    // we FORCEFULLY grab the first image from the list card as a placeholder.
                    // This ensures there is ALWAYS something shown immediately, preventing the "blank -> fade in" flash.
                    if (idx === 0 && !reusableImg) {
                        const listCard = window.visibleCards[index];
                        if (listCard) {
                            const fallbackImg = listCard.querySelector('img');
                            if (fallbackImg && fallbackImg.complete && fallbackImg.naturalWidth > 0) {
                                console.log('[Modal] Forced placeholder from list card');
                                reusableImg = fallbackImg;

                                // If the URLs don't match, we need to treat this as a temporary placeholder
                                // and still load the real high-res image in the background.
                                // We handle this by setting a flag or logic below.
                            }
                        }
                    }

                    if (reusableImg) {
                        // Clone the node to retain cached/decoded state
                        imgEl = reusableImg.cloneNode(true);

                        // Reset styles
                        imgEl.className = '';
                        imgEl.style.opacity = '1';
                        imgEl.style.transition = 'none';
                        imgEl.style.display = 'block';
                        imgEl.style.width = '';
                        imgEl.style.height = '';
                        imgEl.style.objectFit = 'contain';

                        // If we forced a placeholder that might be low-res or different, 
                        // we should check if we need to upgrade it to the high-res 'url'
                        // However, directly changing src might trigger flicker if cache misses.
                        // So we only change src if the URLs are significantly different (e.g. not just params)
                        // OR if we want to ensure high-res.

                        // Let's compare the source.
                        // Create anchors for normalization
                        const currentSrc = imgEl.src;
                        const targetSrc = url;

                        // Simple check: if they are different, we might want to upgrade
                        if (currentSrc !== targetSrc) {
                            // But upgrading src on an existing img element causes it to go blank until load.
                            // So we should Create a NEW img for the high res, and swap them.
                            // OR, we just leave the low-res one if it's "Good Enough" (maybe not).

                            // Better approach:
                            // If it's a forced placeholder (URLs differ), we use it as a background/underlay,
                            // and create a NEW img on top that fades in.
                            // But `reusableImg` logic assumes we return the Final Element.

                            // Let's refine: If reusableImg URL matches target (loosely), we assume it's good.
                            // If it was forced (URLs differ wildly), we should probably use it BUT trigger a silent upgrade.

                            const isLooseMatch = (
                                currentSrc === targetSrc ||
                                currentSrc.split('?')[0] === targetSrc.split('?')[0] ||
                                decodeURIComponent(currentSrc) === decodeURIComponent(targetSrc)
                            );

                            if (!isLooseMatch) {
                                console.log('[Modal] Placeholder used, upgrading to high-res in background');
                                // It's a placeholder. We want to show it, but also load the real one.
                                // Strategy: Keep this imgEl visible. Create a new Image for high-res.
                                // When high-res loads, replace src.
                                const highResImg = new Image();
                                highResImg.src = targetSrc;
                                highResImg.onload = () => {
                                    imgEl.src = targetSrc; // This might still flicker?
                                    // No, if highResImg is loaded, browser cache should make this instant.
                                    // But to be safe, we can just replace the node.
                                    // Actually, if we just change src, it should be fine if preloaded.
                                    console.log('[Modal] Upgraded to high-res');
                                };
                            }
                        }

                        console.log('[Modal] Cloned existing image for seamless transition');
                    } else {
                        // Standard creation (Fallback)
                        imgEl = document.createElement('img');
                        imgEl.crossOrigin = 'anonymous';

                        // Track start time to detect cache hits
                        const startTime = Date.now();

                        // Set src AFTER listeners to be safe, though for cache sync checking src first is better
                        imgEl.src = url;

                        // Fade in logic for new images
                        if (idx === 0) {
                            // Check immediately if it's already done (synchronous cache hit)
                            if (imgEl.complete && imgEl.naturalWidth > 0) {
                                imgEl.style.opacity = '1';
                                imgEl.style.transition = 'none';
                            } else {
                                // Not ready yet, prepare for fade in
                                imgEl.style.opacity = '0';
                                imgEl.style.transition = 'opacity 0.4s ease-out';

                                // Optimization: If it loads very quickly (e.g. < 50ms), it's likely a memory/disk cache hit
                                // that just missed the synchronous check. Skip animation for these.
                                const originalOnLoad = imgEl.onload;
                                imgEl.onload = (e) => {
                                    const loadTime = Date.now() - startTime;
                                    if (loadTime < 300) {
                                        // Fast load - show instantly
                                        imgEl.style.transition = 'none';
                                        imgEl.style.opacity = '1';
                                        console.log('[Modal] Fast load detected (Cache hit), skipping animation');
                                    } else {
                                        // Slow load - allow fade in
                                        if (imgEl.style.opacity === '0') {
                                            imgEl.style.opacity = '1';
                                        }
                                    }

                                    // Chain original logic
                                    if (idx === 0) {
                                        const aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
                                        updateLayout(aspectRatio, items.length);
                                    }
                                };
                            }
                        } else {
                            imgEl.style.opacity = '0';
                            imgEl.style.transition = 'opacity 0.4s ease-out';
                        }
                    }

                    // Attach onload if not already handled by the optimization above
                    if (!imgEl.onload) {
                        imgEl.onload = () => {
                            if (imgEl.style.opacity === '0') {
                                imgEl.style.opacity = '1';
                            }
                            if (idx === 0) {
                                const aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
                                updateLayout(aspectRatio, items.length);
                            }
                        };
                    }

                    imgEl.alt = 'Tweet image';
                    mediaWrapper.appendChild(imgEl);
                } else {
                    // Video Handling with seamless transition
                    const videoEl = document.createElement('video');
                    // IMPORTANT: Start properly mute/unmuted based on preference? Default unmuted but user needs to interact
                    videoEl.controls = false; // Disable controls initially so our overlay can handle the first click
                    videoEl.preload = 'metadata';
                    videoEl.className = 'loaded';
                    videoEl.style.width = '100%';
                    videoEl.style.height = '100%';
                    videoEl.style.display = 'block';
                    videoEl.style.backgroundColor = '#000';
                    videoEl.style.objectFit = 'contain';

                    // Critical: CSS logic for flex child to prevent collapse
                    // Check if we can get intrinsic size or default
                    mediaWrapper.style.flex = '0 0 auto'; // Don't shrink, auto width based on content
                    mediaWrapper.style.minWidth = '300px'; // Minimum touch target size
                    mediaWrapper.style.maxWidth = '100%';

                    if (thumbUrl) videoEl.poster = thumbUrl;
                    videoEl.src = url;

                    // Append video FIRST so it's behind the overlay
                    mediaWrapper.appendChild(videoEl);

                    // Optimization: Try to show a placeholder image (thumbnail) over the video
                    // until the video is ready to play. This prevents the "black box" flash.
                    const placeholderUrl = thumbUrl || url;
                    const reusableImg = findReusableImage(index, placeholderUrl);

                    if (reusableImg || thumbUrl) {
                        const placeholderWrapper = document.createElement('div');
                        placeholderWrapper.className = 'video-placeholder-wrapper';
                        placeholderWrapper.style.position = 'absolute';
                        placeholderWrapper.style.inset = '0';
                        placeholderWrapper.style.zIndex = '10';
                        placeholderWrapper.style.display = 'flex';
                        placeholderWrapper.style.alignItems = 'center';
                        placeholderWrapper.style.justifyContent = 'center';
                        placeholderWrapper.style.cursor = 'pointer';
                        placeholderWrapper.style.background = 'transparent'; // Ensure transparent bg

                        const placeholderImg = reusableImg ? reusableImg.cloneNode(true) : document.createElement('img');
                        if (!reusableImg) {
                            placeholderImg.src = thumbUrl;
                            placeholderImg.crossOrigin = 'anonymous';
                        }

                        placeholderImg.className = 'video-placeholder-img';
                        placeholderImg.style.position = 'absolute';
                        placeholderImg.style.top = '0';
                        placeholderImg.style.left = '0';
                        placeholderImg.style.width = '100%';
                        placeholderImg.style.height = '100%';
                        placeholderImg.style.objectFit = 'contain';
                        // IMPORTANT: Allow pointer events so we can click to play
                        placeholderImg.style.pointerEvents = 'none'; // Let clicks pass through to wrapper/button
                        placeholderImg.style.transition = 'opacity 0.3s ease-out';

                        // Create big play button
                        const playBtn = document.createElement('div');
                        playBtn.className = 'video-play-btn';
                        playBtn.innerHTML = `
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 64px; height: 64px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); pointer-events: none;">
                                <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.6)" stroke="white" stroke-width="1.5"></circle>
                                <path d="M10 8l6 4-6 4V8z" fill="white"></path>
                            </svg>
                        `;
                        playBtn.style.position = 'relative';
                        playBtn.style.zIndex = '11';
                        playBtn.style.opacity = '1';
                        playBtn.style.transition = 'transform 0.2s ease';
                        playBtn.style.pointerEvents = 'none'; // Click-through to wrapper for easier handling

                        placeholderWrapper.appendChild(placeholderImg);
                        placeholderWrapper.appendChild(playBtn);
                        mediaWrapper.appendChild(placeholderWrapper);

                        mediaWrapper.style.pointerEvents = 'auto'; // Ensure wrapper allows clicks
                        mediaWrapper.style.zIndex = '5'; // Ensure it's above other elements if any

                        // Click to play logic
                        const startPlayback = (e) => {
                            // Do NO preventDefault() to allow other necessary browser behaviors, but stop prop
                            e.stopPropagation();
                            console.log('[Video] Play clicked');

                            // Enable controls first
                            videoEl.controls = true;

                            // Hide placeholder immediately for responsiveness
                            placeholderWrapper.style.opacity = '0';
                            placeholderWrapper.style.pointerEvents = 'none';

                            // Start video
                            const playPromise = videoEl.play();

                            if (playPromise !== undefined) {
                                playPromise.then(() => {
                                    console.log('[Video] Play started successfully');
                                    setTimeout(() => {
                                        if (placeholderWrapper.parentNode) placeholderWrapper.parentNode.removeChild(placeholderWrapper);
                                    }, 300);
                                }).catch(err => {
                                    console.error('[Video] Play failed (likely perms):', err);
                                    // If play fails, we still want the user to see controls to try manually
                                    if (placeholderWrapper.parentNode) placeholderWrapper.parentNode.removeChild(placeholderWrapper);
                                    videoEl.controls = true;
                                });
                            }
                        };

                        placeholderWrapper.addEventListener('click', startPlayback);
                        // Redundant check: if play button somehow gets clicked despite pointer-events: none (safe fallback)
                        playBtn.addEventListener('click', startPlayback);

                        // Also hide if the video starts playing by other means
                        const hidePlaceholder = () => {
                            if (placeholderWrapper.parentNode) {
                                placeholderWrapper.style.opacity = '0';
                                setTimeout(() => {
                                    if (placeholderWrapper.parentNode) placeholderWrapper.parentNode.removeChild(placeholderWrapper);
                                }, 300);
                            }
                        };

                        videoEl.addEventListener('play', hidePlaceholder);
                    } else {
                        // No placeholder? Just ensure controls are on.
                        videoEl.controls = true;
                    }

                    if (idx === 0) updateLayout(0.56, items.length);
                }

                imagesWrapper.appendChild(mediaWrapper);
            });

            if (items.length === 1) {
                imagesContainer.classList.add('single');
            }
        };

        const updateLayout = (aspectRatio, count) => {
            imagesContainer.classList.remove('single', 'double', 'multiple');
            if (count === 1) {
                imagesContainer.classList.add('single');
            } else if (aspectRatio < 0.8) {
                imagesContainer.classList.add('single');
            } else if (count === 2) {
                imagesContainer.classList.add('double');
            } else {
                imagesContainer.classList.add('multiple');
            }
        };

        if (cardData.media_extended && cardData.media_extended.length > 0) {
            renderItems(cardData.media_extended.filter(m => m.type === 'image' || m.type === 'video' || m.type === 'animated_gif'), true);
        } else if (cardData.mediaURLs && cardData.mediaURLs.length > 0) {
            renderItems(cardData.mediaURLs, false);
        }

        // Fill interaction data
        document.getElementById('modalLikes').textContent = cardData.likes || 0;
        document.getElementById('modalRetweets').textContent = cardData.retweets || 0;
        document.getElementById('modalReplies').textContent = cardData.replies || 0;

        // Fill time
        if (cardData.date) {
            const date = new Date(cardData.date);
            const timeStr = date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('modalTime').textContent = timeStr;
        }

        // Set action buttons
        document.getElementById('modalOpenBtn').href = cardUrl;
        document.getElementById('modalCopyBtn').onclick = async () => {
            try {
                await navigator.clipboard.writeText(cardUrl);
                const btn = document.getElementById('modalCopyBtn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        };
    } catch (err) {
        console.error('Failed to update main card:', err);
    }
}

async function navigateToTweet(direction) {
    const newIndex = window.currentModalIndex + direction;

    // Check boundaries
    if (newIndex < 0) {
        console.log('[Modal Navigation] Already at first card');
        return;
    }

    if (newIndex >= window.visibleCards.length) {
        // Reached end, try to load next date
        console.log('[Modal Navigation] Reached end, trying to load next date...');

        // Check if loadNextDateForModal is available
        if (typeof window.loadNextDateForModal !== 'function') {
            console.log('[Modal Navigation] loadNextDateForModal not available');
            return;
        }

        // Save the current count for incremental thumbnail update
        const oldCardCount = window.visibleCards.length;

        try {
            // Load next date and get new cards
            const allCards = await window.loadNextDateForModal();
            console.log('[Modal Navigation] Got', allCards.length, 'cards after loading');

            if (allCards.length > oldCardCount) {
                // Update visible cards with the full set including newly loaded ones
                window.visibleCards = allCards;
                console.log('[Modal Navigation] Updated visibleCards from', oldCardCount, 'to', window.visibleCards.length, 'cards');

                // Use incremental update - only add new thumbnails starting from oldCardCount
                generateThumbnails(oldCardCount);

                // Trigger data fetch for the new cards so thumbnails show up
                prefetchDataForCards(oldCardCount);

                // Navigate to the first card of the newly loaded content
                navigateToIndex(newIndex);
            } else {
                console.log('[Modal Navigation] No new cards loaded');
            }
        } catch (error) {
            console.log('[Modal Navigation] Failed to load next date:', error.message);
            // Optionally show a toast message to the user
            // showToast('Already at the last day\'s content');
        }
        return;
    }

    // Preload next date when user is near the end (last 5 cards)
    const distanceFromEnd = window.visibleCards.length - newIndex;

    // Preload adjacent images for smoother navigation (Current +/- 2)
    const adjacentRange = 2;
    for (let i = 1; i <= adjacentRange; i++) {
        // Next
        const nextIdx = newIndex + i;
        if (nextIdx < window.visibleCards.length) {
            preloadImageForIndex(nextIdx);
        }
        // Prev
        const prevIdx = newIndex - i;
        if (prevIdx >= 0) {
            preloadImageForIndex(prevIdx);
        }
    }

    if (direction > 0 && distanceFromEnd <= 5 && !window.isPreloading) {
        console.log('[Modal Navigation] Near end, preloading next date...');
        window.isPreloading = true;

        // Save the current count for incremental thumbnail update
        const oldCardCount = window.visibleCards.length;

        // Check if loadNextDateForModal is available
        if (typeof window.loadNextDateForModal === 'function') {
            window.loadNextDateForModal()
                .then(allCards => {
                    console.log('[Modal Navigation] Preload complete, got', allCards.length, 'cards');

                    if (allCards.length > oldCardCount) {
                        // Update visible cards with the full set including newly loaded ones
                        window.visibleCards = allCards;
                        console.log('[Modal Navigation] Updated visibleCards from', oldCardCount, 'to', window.visibleCards.length, 'cards');

                        // Use incremental update - only add new thumbnails starting from oldCardCount
                        generateThumbnails(oldCardCount);

                        // Trigger data fetch for the new cards so thumbnails show up
                        prefetchDataForCards(oldCardCount);
                    }

                    window.isPreloading = false;
                })
                .catch(error => {
                    console.log('[Modal Navigation] Preload failed:', error.message);
                    window.isPreloading = false;
                });
        }
    }

    navigateToIndex(newIndex);
}

/**
 * Prefetch data for a range of cards to ensure thumbnails are displayed
 * @param {number} startIndex - Start index
 */
function prefetchDataForCards(startIndex) {
    const cards = window.visibleCards;
    if (!cards || startIndex >= cards.length) return;

    console.log('[Modal] Prefetching data for cards starting at', startIndex);

    // Process in batches to avoid network congestion
    const BATCH_SIZE = 3;
    let currentBatchStart = startIndex;

    const processBatch = () => {
        if (currentBatchStart >= cards.length) return;

        const batchEnd = Math.min(currentBatchStart + BATCH_SIZE, cards.length);
        const promises = [];

        for (let i = currentBatchStart; i < batchEnd; i++) {
            const card = cards[i];
            if (!card) continue;

            // Skip if already has data
            if (card.dataset.tweetData || card.dataset.loading === 'finished') continue;

            const tweetId = card.dataset.tweetId;
            if (tweetId && typeof window.fetchTweetMedia === 'function') {
                // Fetch and update
                const p = window.fetchTweetMedia(tweetId).then(result => {
                    if (result.fullData) {
                        card.dataset.tweetData = JSON.stringify(result.fullData);
                        if (result.images) card.dataset.cachedMedia = JSON.stringify(result.images);
                        card.dataset.loading = 'finished';
                        // Update UI
                        updateThumbnailUI(i);
                    }
                }).catch(e => console.warn('Prefetch failed for', tweetId));
                promises.push(p);
            }
        }

        // Next batch after this one completes (or with small delay)
        currentBatchStart += BATCH_SIZE;
        if (promises.length > 0) {
            Promise.allSettled(promises).then(() => {
                setTimeout(processBatch, 100);
            });
        } else {
            // If no requests were made (all cached), move fast
            processBatch();
        }
    };

    processBatch();
}

/**
 * Preload image for a specific index
 */
async function preloadImageForIndex(index) {
    let cardData = getTweetDataForIndex(index);

    // If data is missing, try to fetch it first
    if (!cardData) {
        const card = window.visibleCards[index];
        if (card && card.dataset.tweetId && typeof window.fetchTweetMedia === 'function') {
            try {
                // console.log('[Modal] Preloading data for index:', index);
                const result = await window.fetchTweetMedia(card.dataset.tweetId);
                cardData = result.fullData;

                // Update DOM state so future lookups work
                card.dataset.tweetData = JSON.stringify(result.fullData);
                if (result.images) card.dataset.cachedMedia = JSON.stringify(result.images);
                card.dataset.loading = 'finished';

                // Also update thumbnail since we have data now
                updateThumbnailUI(index);
            } catch (e) {
                // console.warn('[Modal] Failed to preload data for index:', index);
                return;
            }
        } else {
            return;
        }
    }

    let urlToPreload = null;

    // Logic must match getThumbnailHtml and updateCardDisplay
    if (cardData.media_extended && cardData.media_extended.length > 0) {
        const firstMedia = cardData.media_extended[0];

        if (firstMedia.type === 'image') {
            urlToPreload = firstMedia.url || firstMedia.media_url_https;
        } else if (firstMedia.type === 'video' || firstMedia.type === 'animated_gif') {
            // For videos, preload the thumbnail/poster
            urlToPreload = firstMedia.thumbnail_url || firstMedia.url || firstMedia.media_url_https;
        }
    } else if (cardData.mediaURLs && cardData.mediaURLs.length > 0) {
        urlToPreload = cardData.mediaURLs[0];
    }

    if (urlToPreload) {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Ensure consistent CORS mode for cache hits
        img.src = urlToPreload;
    }
}

/**
 * Toggle current tweet selection status
 * Requires external toggleItemStyle function
 */
function toggleCurrentTweetSelection() {
    const currentCard = window.visibleCards[window.currentModalIndex];
    if (!currentCard) return;

    const checkbox = currentCard.querySelector('.tweet-check-input');
    if (!checkbox) {
        console.log('[Modal] No checkbox found on current card, cannot toggle selection');
        return;
    }
    if (!checkbox) return;

    checkbox.checked = !checkbox.checked;

    // Call external toggleItemStyle function (if exists)
    if (typeof toggleItemStyle === 'function') {
        toggleItemStyle(checkbox);
    }

    // Update selection status indicator in modal
    const indicator = document.getElementById('modalSelectedIndicator');
    if (checkbox.checked) {
        indicator.classList.add('selected');
    } else {
        indicator.classList.remove('selected');
    }

    // Update main card gray effect
    const mainCard = document.getElementById('mainCard');
    if (checkbox.checked) {
        mainCard.classList.remove('unselected');
    } else {
        mainCard.classList.add('unselected');
    }

    // Update selection mark and gray effect on thumbnail
    const thumbnailItem = document.querySelector(`.thumbnail-item[data-index="${window.currentModalIndex}"]`);
    if (thumbnailItem) {
        if (checkbox.checked) {
            // Remove gray effect
            thumbnailItem.classList.remove('unselected');
            // Add selection mark
            if (!thumbnailItem.querySelector('.thumbnail-item-selected')) {
                const selectedMark = document.createElement('div');
                selectedMark.className = 'thumbnail-item-selected';
                selectedMark.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                thumbnailItem.appendChild(selectedMark);
            }
        } else {
            // Add gray effect
            thumbnailItem.classList.add('unselected');
            // Remove selection mark
            const selectedMark = thumbnailItem.querySelector('.thumbnail-item-selected');
            if (selectedMark) {
                selectedMark.remove();
            }
        }
    }
}

/**
 * Copy current tweet link
 */
async function copyCurrentTweetLink() {
    const currentCard = window.visibleCards[window.currentModalIndex];
    if (!currentCard) return;

    const checkbox = currentCard.querySelector('.tweet-check-input');
    const cardUrl = currentCard.dataset.tweetUrl || (checkbox ? checkbox.value : '');

    if (!cardUrl) {
        // Assuming showToast is defined elsewhere or needs to be added
        // For now, just log an error if showToast is not available
        if (typeof showToast === 'function') {
            showToast('No URL available to copy', 'error');
        } else {
            console.error('No URL available to copy and showToast function is not defined.');
        }
        return;
    }

    const url = cardUrl; // Use the safely determined cardUrl

    try {
        await navigator.clipboard.writeText(url);

        // Show temporary toast in modal
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--accent);
            color: var(--accent-foreground);
            padding: 1rem 2rem;
            border-radius: 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.9rem;
            z-index: 10000;
            box-shadow: var(--shadow-accent);
            animation: fadeIn 0.2s ease;
        `;
        toast.textContent = '✓ Link copied';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    } catch (err) {
        console.error('Copy failed:', err);
    }
}

/**
 * Open current tweet
 */
function openCurrentTweet() {
    const currentCard = window.visibleCards[window.currentModalIndex];
    if (!currentCard) return;

    const checkbox = currentCard.querySelector('.tweet-check-input');
    const cardUrl = currentCard.dataset.tweetUrl || (checkbox ? checkbox.value : '');

    if (cardUrl) {
        window.open(cardUrl, '_blank', 'noopener'); // Re-added 'noopener' for security best practice
    }
}

/**
 * Close tweet detail modal
 */
function closeTweetDetail() {
    console.log('[Modal] closeTweetDetail called');
    const modal = document.getElementById('tweetDetailModal');

    if (!modal) {
        console.error('[Modal] Modal element not found when closing!');
        return;
    }

    modal.classList.remove('show');
    document.body.style.overflow = '';

    // Remove keyboard event listener
    if (window.modalKeyboardHandler) {
        document.removeEventListener('keydown', window.modalKeyboardHandler);
        window.modalKeyboardHandler = null;
    }

    // Remove wheel event listener
    if (window.modalWheelHandler) {
        modal.removeEventListener('wheel', window.modalWheelHandler);
        window.modalWheelHandler = null;
    }

    // Clean up click event listeners
    if (modal._clickHandler) {
        modal.removeEventListener('click', modal._clickHandler);
        modal._clickHandler = null;
    }

    // Clean up image scroll handler
    const imagesContainer = document.getElementById('modalImages');
    if (imagesContainer && imagesContainer._wheelHandler) {
        imagesContainer.removeEventListener('wheel', imagesContainer._wheelHandler);
        imagesContainer._wheelHandler = null;
    }

    const mainCard = document.getElementById('mainCard');
    if (mainCard && mainCard._clickHandler) {
        mainCard.removeEventListener('click', mainCard._clickHandler);
        mainCard._clickHandler = null;
    }

    const indicator = document.getElementById('modalSelectedIndicator');
    if (indicator && indicator._clickHandler) {
        indicator.removeEventListener('click', indicator._clickHandler);
        indicator._clickHandler = null;
    }

    // Clean up state
    currentModalIndex = -1;
    visibleCards = [];

    console.log('[Modal] Modal closed and cleaned up');
}
