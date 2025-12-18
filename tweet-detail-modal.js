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
    if (typeof updateThumbnail === 'function') {
        updateThumbnail(index);
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
            case 'c':
            case 'C':
                e.preventDefault();
                copyCurrentTweetLink();
                break;
            case 'Enter':
                e.preventDefault();
                openCurrentTweet();
                break;
        }
    };

    document.addEventListener('keydown', window.modalKeyboardHandler);

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
 * Generate all thumbnails
 * @param {number} startIndex - Optional start index for incremental update (only add new thumbnails after this index)
 */
function generateThumbnails(startIndex = 0) {
    const thumbnailStrip = document.getElementById('thumbnailStrip');

    // If startIndex is 0, clear and rebuild everything (initial load)
    // Otherwise, keep existing thumbnails and only add new ones
    if (startIndex === 0) {
        thumbnailStrip.innerHTML = '';
    } else {
        console.log('[Thumbnails] Incremental update from index', startIndex);
    }

    // Generate thumbnails starting from startIndex
    for (let index = startIndex; index < window.visibleCards.length; index++) {
        const card = window.visibleCards[index];
        if (!card) continue;

        const isCurrent = index === window.currentModalIndex;
        const checkbox = card.querySelector('.tweet-check-input');
        const isSelected = checkbox && checkbox.checked;

        // Create thumbnail element
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = `thumbnail-item${isCurrent ? ' active' : ''}${!isSelected ? ' unselected' : ''}`;
        thumbnailItem.dataset.index = index;

        let thumbnailContent = '';

        // Priority 1: Check if full tweet data is loaded
        if (card.dataset.tweetData) {
            try {
                const cardData = JSON.parse(card.dataset.tweetData);

                // Get first image as thumbnail
                if (cardData.media_extended && cardData.media_extended.length > 0) {
                    const firstMedia = cardData.media_extended[0];
                    if (firstMedia.type === 'image') {
                        thumbnailContent = `<img src="${firstMedia.url}" alt="Tweet thumbnail">`;
                    } else if (firstMedia.type === 'video' && firstMedia.thumbnail_url) {
                        thumbnailContent = `<img src="${firstMedia.thumbnail_url}" alt="Video thumbnail">`;
                    } else {
                        thumbnailContent = `<div class="thumbnail-item-placeholder">Video</div>`;
                    }
                } else if (cardData.mediaURLs && cardData.mediaURLs.length > 0) {
                    thumbnailContent = `<img src="${cardData.mediaURLs[0]}" alt="Tweet thumbnail">`;
                } else {
                    // No images, show text preview
                    const textPreview = (cardData.text || 'No content').substring(0, 20);
                    thumbnailContent = `<div class="thumbnail-item-placeholder">${textPreview}</div>`;
                }
            } catch (err) {
                console.error('Failed to parse thumbnail data:', err);
                thumbnailContent = `<div class="thumbnail-item-placeholder">Error</div>`;
            }
        }
        // Priority 2: Check if cached media data is available (from Gallery)
        else if (card.dataset.cachedMedia) {
            try {
                const cachedMedia = JSON.parse(card.dataset.cachedMedia);
                if (cachedMedia && cachedMedia.length > 0) {
                    const firstMedia = cachedMedia[0];
                    const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia.url;
                    const mediaType = typeof firstMedia === 'object' ? firstMedia.type : 'image';

                    if (mediaType === 'video') {
                        thumbnailContent = `<img src="${mediaUrl}" alt="Video thumbnail">`;
                    } else {
                        thumbnailContent = `<img src="${mediaUrl}" alt="Tweet thumbnail">`;
                    }
                } else {
                    thumbnailContent = `<div class="thumbnail-item-placeholder">No media</div>`;
                }
            } catch (err) {
                console.error('Failed to parse cached media:', err);
                thumbnailContent = `<div class="thumbnail-item-placeholder">?</div>`;
            }
        }
        // Priority 3: Check global cache if data exists but not yet on dataset
        else if (card.dataset.loading === 'true' && typeof window.tweetMediaCache !== 'undefined') {
            const cached = window.tweetMediaCache.get(card.dataset.tweetId);
            if (cached && cached.data) {
                try {
                    const cardData = cached.data;
                    card.dataset.tweetData = JSON.stringify(cardData);
                    delete card.dataset.loading;

                    if (cardData.media_extended && cardData.media_extended.length > 0) {
                        const firstMedia = cardData.media_extended[0];
                        thumbnailContent = `<img src="${firstMedia.url || firstMedia.thumbnail_url}" alt="Tweet thumbnail">`;
                    } else if (cardData.mediaURLs && cardData.mediaURLs.length > 0) {
                        thumbnailContent = `<img src="${cardData.mediaURLs[0]}" alt="Tweet thumbnail">`;
                    } else {
                        thumbnailContent = `<div class="thumbnail-item-placeholder">${(cardData.text || '').substring(0, 20)}</div>`;
                    }
                } catch (err) {
                    thumbnailContent = `<div class="thumbnail-item-placeholder"><div class="loading-spinner small"></div></div>`;
                }
            } else {
                thumbnailContent = `<div class="thumbnail-item-placeholder"><div class="loading-spinner small"></div></div>`;
            }
        }
        // Priority 4: Loading marker
        else if (card.dataset.loading === 'true') {
            thumbnailContent = `<div class="thumbnail-item-placeholder"><div class="loading-spinner small"></div></div>`;
        }
        // Priority 5: Error state
        else {
            thumbnailContent = `<div class="thumbnail-item-placeholder">?</div>`;
        }

        thumbnailItem.innerHTML = `
            ${thumbnailContent}
            <div class="thumbnail-item-number">${index + 1}</div>
            ${isSelected ? `<div class="thumbnail-item-selected">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>` : ''}
        `;

        // Click thumbnail to switch
        thumbnailItem.addEventListener('click', () => {
            navigateToIndex(index);
        });

        thumbnailStrip.appendChild(thumbnailItem);
    }

    // Scroll to current thumbnail
    scrollToActiveThumbnail();
}

/**
 * Update a specific thumbnail content
 * @param {number} index - The index of the thumbnail to update
 */
function updateThumbnail(index) {
    const thumbnailStrip = document.getElementById('thumbnailStrip');
    const thumbnailItem = thumbnailStrip.querySelector(`.thumbnail-item[data-index="${index}"]`);
    if (!thumbnailItem) return;

    const card = window.visibleCards[index];
    if (!card) return;

    const checkbox = card.querySelector('.tweet-check-input');
    const isSelected = checkbox && checkbox.checked;

    let thumbnailContent = '';

    // Same logic as generateThumbnails
    if (card.dataset.tweetData) {
        try {
            const cardData = JSON.parse(card.dataset.tweetData);
            if (cardData.media_extended && cardData.media_extended.length > 0) {
                const firstMedia = cardData.media_extended[0];
                if (firstMedia.type === 'image') {
                    thumbnailContent = `<img src="${firstMedia.url}" alt="Tweet thumbnail">`;
                } else if (firstMedia.type === 'video' && firstMedia.thumbnail_url) {
                    thumbnailContent = `<img src="${firstMedia.thumbnail_url}" alt="Video thumbnail">`;
                } else {
                    thumbnailContent = `<div class="thumbnail-item-placeholder">Video</div>`;
                }
            } else if (cardData.mediaURLs && cardData.mediaURLs.length > 0) {
                thumbnailContent = `<img src="${cardData.mediaURLs[0]}" alt="Tweet thumbnail">`;
            } else {
                const textPreview = (cardData.text || 'No content').substring(0, 20);
                thumbnailContent = `<div class="thumbnail-item-placeholder">${textPreview}</div>`;
            }
        } catch (err) {
            thumbnailContent = `<div class="thumbnail-item-placeholder">Error</div>`;
        }
    } else if (card.dataset.cachedMedia) {
        try {
            const cachedMedia = JSON.parse(card.dataset.cachedMedia);
            if (cachedMedia && cachedMedia.length > 0) {
                const firstMedia = cachedMedia[0];
                const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia.url;
                const mediaType = typeof firstMedia === 'object' ? firstMedia.type : 'image';
                thumbnailContent = `<img src="${mediaUrl}" alt="${mediaType === 'video' ? 'Video' : 'Tweet'} thumbnail">`;
            } else {
                thumbnailContent = `<div class="thumbnail-item-placeholder">No media</div>`;
            }
        } catch (err) {
            thumbnailContent = `<div class="thumbnail-item-placeholder">?</div>`;
        }
    } else if (card.dataset.loading === 'true') {
        thumbnailContent = `<div class="thumbnail-item-placeholder"><div class="loading-spinner small"></div></div>`;
    } else {
        thumbnailContent = `<div class="thumbnail-item-placeholder">?</div>`;
    }

    // Update innerHTML while preserving the number and selection indicator
    thumbnailItem.innerHTML = `
        ${thumbnailContent}
        <div class="thumbnail-item-number">${index + 1}</div>
        ${isSelected ? `<div class="thumbnail-item-selected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>` : ''}
    `;

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

    // Check if card data is already available in the dataset
    if (card.dataset.tweetData) {
        console.log('[Modal] Using existing dataset for index:', index);
        updateCardDisplay(index);
        return;
    }

    // Check if card data needs to be loaded
    if (card.dataset.loading === 'true' || !card.dataset.tweetData) {
        const itemTweetId = card.dataset.tweetId;
        const checkbox = card.querySelector('.tweet-check-input');
        const cardUrl = card.dataset.tweetUrl || (checkbox ? checkbox.value : '');

        console.log('[Modal] Card data missing, checking cache...');

        // Check global cache first to avoid re-fetching
        if (typeof window.tweetMediaCache !== 'undefined') {
            const cached = window.tweetMediaCache.get(itemTweetId);
            if (cached && cached.data) {
                console.log('[Modal] Using memory cache for tweetId:', itemTweetId);
                card.dataset.tweetData = JSON.stringify(cached.data);
                if (cached.images) {
                    card.dataset.cachedMedia = JSON.stringify(cached.images);
                }
                delete card.dataset.loading;
                updateCardDisplay(index);
                // Also update thumbnail to remove spinner
                updateThumbnail(index);
                return;
            }
        }

        // Show loading state only if data is not available anywhere
        showCardLoading();

        try {
            let tweetData;

            // Priority 1: Use window.fetchTweetMedia for deduplication and caching
            if (typeof window.fetchTweetMedia === 'function') {
                const result = await window.fetchTweetMedia(itemTweetId);
                tweetData = result.fullData;
                if (result.images) {
                    card.dataset.cachedMedia = JSON.stringify(result.images);
                }
            } else {
                // Fallback to direct fetch
                const fetchFn = typeof window.apiFetch === 'function' ? window.apiFetch : fetch;
                const response = await fetchFn(`/api/tweet_info?id=${itemTweetId}`);
                if (!response.ok) throw new Error('Failed to fetch');
                tweetData = await response.json();
            }

            card.dataset.tweetData = JSON.stringify(tweetData);
            delete card.dataset.loading;
            console.log('[Modal] Card data loaded for tweetId:', itemTweetId);

            // Update global cache if available
            if (typeof window.tweetMediaCache !== 'undefined' && typeof window.extractImageUrlsFromTweetInfo === 'function') {
                const images = window.extractImageUrlsFromTweetInfo(tweetData);
                window.tweetMediaCache.set(itemTweetId, {
                    images,
                    data: tweetData
                });
                console.log('[Modal] Updated cache for tweetId:', itemTweetId);
            }

            // Now update the display with loaded data
            updateCardDisplay(index);
            // Also update thumbnail to remove spinner
            updateThumbnail(index);
        } catch (error) {
            console.error('[Modal] Failed to load card data:', error);
            showCardError();
        }
        return;
    }

    // Data already loaded, update display directly
    if (!card.dataset.tweetData) {
        console.warn('[Modal] Card has no data and no loading flag');
        return;
    }

    updateCardDisplay(index);
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
    imagesContainer.innerHTML = '<div style="color: var(--text-muted); padding: 2rem; text-align: center;">Failed to load</div>';
}

/**
 * Update card display with loaded data
 * @param {number} index - Card index
 */
function updateCardDisplay(index) {
    const card = window.visibleCards[index];
    if (!card || !card.dataset.tweetData) return;

    // Update the corresponding thumbnail in the strip
    updateThumbnail(index);

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

        const renderItems = (items, isMediaExtended = false) => {
            const mediaElements = [];
            items.forEach((item, idx) => {
                const isVideo = isMediaExtended ? item.type === 'video' : false;
                const url = isMediaExtended ? item.url : item;
                const thumbUrl = isMediaExtended ? item.thumbnail_url : null;

                if (!isVideo) {
                    const imgEl = document.createElement('img');
                    // Add smooth load transition
                    imgEl.onload = () => {
                        imgEl.style.opacity = '1';
                        // After first image loads, decide layout
                        if (idx === 0) {
                            const aspectRatio = imgEl.naturalHeight / imgEl.naturalWidth;
                            updateLayout(aspectRatio, items.length);
                        }
                    };
                    imgEl.src = url;
                    imgEl.alt = 'Tweet image';
                    // If cached, show immediately
                    if (imgEl.complete) {
                        imgEl.style.opacity = '1';
                    }
                    mediaElements.push(imgEl);
                    imagesContainer.appendChild(imgEl);
                } else {
                    const videoEl = document.createElement('video');
                    videoEl.controls = true;
                    videoEl.preload = 'metadata';
                    videoEl.className = 'loaded'; // Videos don't flicker the same way
                    videoEl.style.width = '100%';
                    videoEl.style.height = 'auto';
                    videoEl.style.display = 'block';
                    videoEl.style.backgroundColor = '#000';
                    videoEl.tabIndex = -1;
                    if (thumbUrl) videoEl.poster = thumbUrl;
                    videoEl.src = url;
                    videoEl.addEventListener('keydown', (e) => {
                        if (['ArrowLeft', 'ArrowRight', ' ', 'Enter', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                            e.preventDefault();
                        }
                    });
                    mediaElements.push(videoEl);
                    imagesContainer.appendChild(videoEl);
                    if (idx === 0) updateLayout(0.56, items.length); // Default 16:9 for video
                }
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
            renderItems(cardData.media_extended.filter(m => m.type === 'image' || m.type === 'video'), true);
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

    // Clean up click event listeners
    if (modal._clickHandler) {
        modal.removeEventListener('click', modal._clickHandler);
        modal._clickHandler = null;
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
