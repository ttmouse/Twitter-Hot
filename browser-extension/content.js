// Twitter Hot Content Quick Add - Content Script
// Injects "Add to Hot" buttons on Twitter/X pages

(function () {
    'use strict';

    // Configuration
    const DEFAULT_API_ENDPOINT = 'https://ttmouse.com/api/update';
    let API_ENDPOINT = DEFAULT_API_ENDPOINT;
    const BUTTON_ID_PREFIX = 'hot-content-btn-';
    const addedTweets = new Set(); // Track already added tweets

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

        try {
            // Get current date in local timezone (YYYY-MM-DD format)
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            console.log('[Hot Content] Adding tweet:', {
                date: today,
                localTime: now.toLocaleString(),
                url: tweetUrl
            });

            const response = await fetch(API_ENDPOINT || DEFAULT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: today,
                    urls: [tweetUrl]
                })
            });

            console.log('[Hot Content] API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Hot Content] API Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[Hot Content] API Success:', data);

            // Mark as added
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

    // Inject menu item into Twitter's dropdown menu
    function injectMenuOption(tweetElement) {
        const tweetId = getTweetId(tweetElement);
        if (!tweetId) {
            console.log('[Hot Content] No tweet ID found');
            return;
        }

        const username = getUsername(tweetElement);
        if (!username) {
            console.log('[Hot Content] No username found for tweet', tweetId);
            return;
        }

        const tweetUrl = getTweetUrl(tweetId, username);

        // Find the "more" button (three dots)
        const moreButton = tweetElement.querySelector('[data-testid="caret"]');
        if (!moreButton) {
            console.log('[Hot Content] No more button found for tweet', tweetId);
            return;
        }

        // Mark this tweet as processed
        if (moreButton.hasAttribute('data-hot-content-processed')) return;
        moreButton.setAttribute('data-hot-content-processed', 'true');

        console.log('[Hot Content] Attached listener to tweet', tweetId);

        // Listen for menu opening
        moreButton.addEventListener('click', () => {
            console.log('[Hot Content] More button clicked for tweet', tweetId);
            // Wait for menu to appear
            setTimeout(() => {
                injectIntoMenu(tweetId, tweetUrl);
            }, 100);
        });
    }

    // Inject our option into the opened menu
    function injectIntoMenu(tweetId, tweetUrl) {
        console.log('[Hot Content] Attempting to inject menu for tweet', tweetId);

        // Find the dropdown menu
        const menu = document.querySelector('[role="menu"]');
        if (!menu) {
            console.log('[Hot Content] No menu found!');
            return;
        }

        console.log('[Hot Content] Menu found:', menu);

        // Check if our option already exists
        if (menu.querySelector('.hot-content-menu-item')) {
            console.log('[Hot Content] Menu item already exists');
            return;
        }

        // Find the dropdown container
        const dropdown = menu.querySelector('[data-testid="Dropdown"]');
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
