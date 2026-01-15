// Twitter Hot Content Quick Add - Content Script
// Injects "Add to Hot" buttons on Twitter/X pages

(function () {
    'use strict';

    // Configuration
    const DEFAULT_API_ENDPOINT = 'https://ttmouse.com/api/update';
    let API_ENDPOINT = DEFAULT_API_ENDPOINT;
    const BUTTON_ID_PREFIX = 'hot-content-btn-';
    const addedTweets = new Set(); // Track already added tweets
    const MORE_BUTTON_SELECTOR = [
        '[data-testid="caret"]',
        '[data-testid="tweetActionButton"]',
        '[aria-label*="More"]',
        '[aria-label*="more"]',
        '[aria-label*="更多"]'
    ].join(', ');
    const QUICK_ADD_SELECTOR = '[data-x-quick-add-button="true"] button, [data-x-quick-add-button="true"]';
    const BOOKMARK_SELECTOR = '[data-testid="bookmark"], [aria-label*="Bookmark"], [aria-label*="收藏"]';

    // Load API endpoint from storage
    chrome.storage.sync.get(['apiEndpoint'], (result) => {
        // Migration: Force update if it matches old Vercel endpoint
        if (result.apiEndpoint && result.apiEndpoint.includes('twitterhot.vercel.app')) {
            console.log('[Hot Content] Migrating API endpoint to new server...');
            API_ENDPOINT = DEFAULT_API_ENDPOINT;
            chrome.storage.sync.set({ apiEndpoint: DEFAULT_API_ENDPOINT });
        } else if (result.apiEndpoint) {
            API_ENDPOINT = result.apiEndpoint;
        }
    });

    // Extract tweet ID from URL or element
    function getTweetId(element) {
        // Try to find the link to the tweet
        const link = element.querySelector('a[href*="/status/"]');
        if (!link) return null;

        const match = link.href.match(/\/status\/(\d+)/);
        return match ? match[1] : null;
    }

    // Get tweet URL from tweet ID
    function getTweetUrl(tweetId, username) {
        // Use x.com as the canonical URL
        return `https://x.com/${username}/status/${tweetId}`;
    }

    // Extract username from tweet element
    function getUsername(element) {
        const usernameLink = element.querySelector('a[href^="/"][href*="/status/"]');
        if (!usernameLink) return null;

        const match = usernameLink.href.match(/\.com\/([^/]+)\//);
        return match ? match[1] : null;
    }

    // Add tweet to hot content via API
    async function addToHotContent(tweetUrl, menuItem, tweetId) {
        if (addedTweets.has(tweetId)) {
            showNotification('Already added to collection', 'info');
            return;
        }

        if (menuItem.classList.contains('loading') || menuItem.classList.contains('added')) {
            return;
        }

        const labelElement = menuItem.querySelector('.hot-content-menu-label');
        const originalLabel = labelElement ? labelElement.textContent : menuItem.textContent;

        menuItem.classList.add('loading');
        menuItem.setAttribute('aria-disabled', 'true');

        if (labelElement) {
            labelElement.textContent = 'Adding...';
        } else {
            menuItem.textContent = 'Adding...';
        }

        const sendUpdate = async (endpoint, date, url) => {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date,
                    urls: [url]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            return response.json();
        };

        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const primaryEndpoint = API_ENDPOINT || DEFAULT_API_ENDPOINT;
            let data = null;
            let endpointUsed = primaryEndpoint;

            try {
                data = await sendUpdate(primaryEndpoint, today, tweetUrl);
            } catch (primaryError) {
                if (primaryEndpoint !== DEFAULT_API_ENDPOINT) {
                    data = await sendUpdate(DEFAULT_API_ENDPOINT, today, tweetUrl);
                    endpointUsed = DEFAULT_API_ENDPOINT;
                    API_ENDPOINT = DEFAULT_API_ENDPOINT;
                    chrome.storage.sync.set({ apiEndpoint: DEFAULT_API_ENDPOINT }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('[Hot Content] Failed to persist endpoint:', chrome.runtime.lastError);
                        }
                    });
                } else {
                    throw primaryError;
                }
            }

            if (endpointUsed !== primaryEndpoint) {
                console.log('[Hot Content] Fallback endpoint used:', endpointUsed);
            }

            addedTweets.add(tweetId);
            menuItem.classList.remove('loading');
            menuItem.classList.add('added');

            if (labelElement) {
                labelElement.textContent = '✓ Added to Hot Content';
            } else {
                menuItem.textContent = '✓ Added to Hot Content';
            }

            showNotification('✓ Added to hot content!', 'success');

        } catch (error) {
            console.error('Error adding to hot content:', error);
            menuItem.classList.remove('loading');
            menuItem.removeAttribute('aria-disabled');

            if (labelElement) {
                labelElement.textContent = originalLabel;
            } else {
                menuItem.textContent = originalLabel;
            }

            showNotification('✗ Failed to add. Please try again.', 'error');
        }
    }

    // Show notification toast
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.hot-content-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `hot-content-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function findMoreButton(tweetElement) {
        return tweetElement.querySelector(MORE_BUTTON_SELECTOR);
    }

    function getActiveMenu() {
        const menus = Array.from(document.querySelectorAll('[role="menu"]'));
        if (menus.length === 0) return null;
        const visibleMenus = menus.filter(menu => {
            const rect = menu.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
        return visibleMenus[visibleMenus.length - 1] || menus[menus.length - 1];
    }

    function waitForMenu(timeout = 1500) {
        return new Promise((resolve) => {
            const existing = getActiveMenu();
            if (existing) {
                resolve(existing);
                return;
            }

            let resolved = false;
            const observer = new MutationObserver(() => {
                const menu = getActiveMenu();
                if (menu && !resolved) {
                    resolved = true;
                    observer.disconnect();
                    resolve(menu);
                }
            });

            observer.observe(document.body, { subtree: true, childList: true });

            setTimeout(() => {
                if (!resolved) {
                    observer.disconnect();
                    resolve(getActiveMenu());
                }
            }, timeout);
        });
    }

    function findTweetElementFromEvent(target) {
        if (!target || !target.closest) return null;
        const direct = target.closest('article[data-testid="tweet"]');
        if (direct) return direct;
        if (typeof target.composedPath === 'function') {
            const path = target.composedPath();
            const article = path.find(node => node && node.closest && node.closest('article[data-testid="tweet"]'));
            return article ? article.closest('article[data-testid="tweet"]') : null;
        }
        return null;
    }

    function handleMenuTriggerClick(event) {
        const target = event.target;
        if (!target || !target.closest) return;

        const quickAdd = target.closest(QUICK_ADD_SELECTOR);
        const bookmark = target.closest(BOOKMARK_SELECTOR);
        if (quickAdd || bookmark) {
            const actionButton = quickAdd || bookmark;
            const tryHandle = () => {
                const tweetElement = findTweetElementFromEvent(actionButton);
                if (!tweetElement) return false;
                const tweetId = getTweetId(tweetElement);
                if (!tweetId) return false;
                const username = getUsername(tweetElement);
                if (!username) return false;
                const tweetUrl = getTweetUrl(tweetId, username);
                addToHotContent(tweetUrl, actionButton, tweetId);
                return true;
            };

            if (!tryHandle()) {
                setTimeout(() => {
                    tryHandle();
                }, 200);
            }
            return;
        }

        const trigger = target.closest(MORE_BUTTON_SELECTOR);
        if (!trigger) return;

        const tweetElement = trigger.closest('article[data-testid="tweet"]');
        if (!tweetElement) return;

        const tweetId = getTweetId(tweetElement);
        if (!tweetId) return;

        const username = getUsername(tweetElement);
        if (!username) return;

        const tweetUrl = getTweetUrl(tweetId, username);

        waitForMenu().then(menu => {
            if (menu) {
                injectIntoMenu(menu, tweetId, tweetUrl);
            } else {
                console.log('[Hot Content] No menu found after click');
            }
        });
    }

    // Inject menu item into Twitter's dropdown menu
    function injectMenuOption(tweetElement) {
        const tweetId = getTweetId(tweetElement);
        if (!tweetId) {
            console.log('[Hot Content] No tweet ID found');
            return;
        }

        const moreButton = findMoreButton(tweetElement);
        if (!moreButton) {
            console.log('[Hot Content] No more button found for tweet', tweetId);
        }
    }

    // Inject our option into the opened menu
    function injectIntoMenu(menu, tweetId, tweetUrl) {
        console.log('[Hot Content] Attempting to inject menu for tweet', tweetId);

        if (!menu) {
            console.log('[Hot Content] No menu found!');
            return;
        }

        console.log('[Hot Content] Menu found:', menu);

        if (menu.querySelector('.hot-content-menu-item')) {
            console.log('[Hot Content] Menu item already exists');
            return;
        }

        const dropdown = menu.querySelector('[data-testid="Dropdown"]') || menu;
        if (!dropdown) {
            console.log('[Hot Content] No dropdown container found!');
            return;
        }

        console.log('[Hot Content] Dropdown container found, injecting menu item...');

        // Create our menu item
        const menuItem = document.createElement('div');
        menuItem.className = 'hot-content-menu-item';
        menuItem.setAttribute('role', 'menuitem');
        menuItem.setAttribute('tabindex', '0');

        const isAdded = addedTweets.has(tweetId);

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'hot-content-menu-icon';
        iconWrapper.setAttribute('aria-hidden', 'true');
        iconWrapper.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"></path>
            </svg>
        `;

        const textWrapper = document.createElement('div');
        textWrapper.className = 'hot-content-menu-text';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'hot-content-menu-label';
        labelSpan.textContent = isAdded ? '✓ Added to Hot Content' : 'Add to Hot Content';
        textWrapper.appendChild(labelSpan);

        menuItem.appendChild(iconWrapper);
        menuItem.appendChild(textWrapper);

        if (isAdded) {
            menuItem.classList.add('added');
            menuItem.setAttribute('aria-disabled', 'true');
        }

        // Add click handler
        menuItem.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (menuItem.classList.contains('loading') || menuItem.classList.contains('added')) {
                return;
            }

            // Close the menu by clicking outside
            document.body.click();

            await addToHotContent(tweetUrl, menuItem, tweetId);
        });

        // Add hover effect
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = 'rgba(231, 233, 234, 0.1)';
        });
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = '';
        });

        // Insert at the top of the dropdown
        const firstItem = dropdown.querySelector('[role="menuitem"]');
        if (firstItem) {
            dropdown.insertBefore(menuItem, firstItem);
            console.log('[Hot Content] Menu item inserted successfully!');
        } else {
            dropdown.appendChild(menuItem);
            console.log('[Hot Content] Menu item appended to dropdown');
        }
    }

    // Process all tweets on the page
    function processAllTweets() {
        // Twitter/X uses article elements for tweets
        const tweets = document.querySelectorAll('article[data-testid="tweet"]');
        tweets.forEach(tweet => {
            injectMenuOption(tweet);
        });
    }

    // Observe DOM changes to catch dynamically loaded tweets
    const observer = new MutationObserver((mutations) => {
        processAllTweets();
    });

    // Start observing when DOM is ready
    function init() {
        processAllTweets();
        document.addEventListener('click', handleMenuTriggerClick, true);

        // Observe the main timeline for new tweets
        const timeline = document.querySelector('main');
        if (timeline) {
            observer.observe(timeline, {
                childList: true,
                subtree: true
            });
        }
    }

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-process on navigation (Twitter is a SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(processAllTweets, 1000);
        }
    }).observe(document, { subtree: true, childList: true });

})();
