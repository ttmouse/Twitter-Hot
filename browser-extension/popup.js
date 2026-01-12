// Twitter Hot Content Quick Add - Popup Script

const DEFAULT_API_ENDPOINT = 'https://ttmouse.com/api/update';

function getApiEndpoint() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['apiEndpoint'], (result) => {
            if (result.apiEndpoint) {
                resolve(result.apiEndpoint);
            } else {
                chrome.storage.sync.set({ apiEndpoint: DEFAULT_API_ENDPOINT }, () => {
                    resolve(DEFAULT_API_ENDPOINT);
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const manualUrlInput = document.getElementById('manualUrl');
    const quickAddBtn = document.getElementById('quickAdd');
    const addStatus = document.getElementById('addStatus');

    // Ensure default API endpoint stored
    chrome.storage.sync.get(['apiEndpoint'], (result) => {
        if (!result.apiEndpoint) {
            chrome.storage.sync.set({ apiEndpoint: DEFAULT_API_ENDPOINT });
        }
    });

    // Helper function to extract all Twitter/X URLs from text
    function extractTwitterUrls(text) {
        if (!text) return [];
        const regex = /https?:\/\/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/gi;
        const matches = text.match(regex) || [];
        // Remove duplicates and normalize to x.com
        return [...new Set(matches.map(url => url.replace('twitter.com', 'x.com')))];
    }

    // Helper function to highlight the button when URL is detected
    function highlightButton(source, urlCount) {
        quickAddBtn.style.background = 'linear-gradient(135deg, #1d9bf0 0%, #0c7abf 100%)';
        quickAddBtn.style.boxShadow = '0 4px 12px rgba(29, 155, 240, 0.4)';

        if (urlCount > 1) {
            quickAddBtn.textContent = `⭐ Add ${urlCount} Tweets`;
        } else {
            quickAddBtn.textContent = '⭐ Add This Tweet';
        }

        const existingHint = document.querySelector('.url-detected-hint');
        if (existingHint) existingHint.remove();

        const hint = document.createElement('div');
        hint.className = 'url-detected-hint';
        hint.style.cssText = 'text-align: center; color: #1d9bf0; font-size: 12px; margin-top: 8px; font-weight: 600;';

        if (urlCount > 1) {
            hint.textContent = source === 'clipboard'
                ? `✓ ${urlCount} URLs from clipboard! Click to add all`
                : `✓ ${urlCount} Tweets detected! Click to add all`;
        } else {
            hint.textContent = source === 'clipboard'
                ? '✓ URL from clipboard! Click to add'
                : '✓ Tweet detected! Click to add';
        }

        quickAddBtn.parentElement.appendChild(hint);
    }

    let urlDetectedFromPage = false;
    let detectedUrls = []; // Store detected URLs

    // Check if current tab is a tweet detail page
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && (tab.url.includes('twitter.com') || tab.url.includes('x.com'))) {
            const tweetUrlMatch = tab.url.match(/\/(twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
            if (tweetUrlMatch) {
                // This is a tweet detail page!
                const tweetUrl = tab.url.split('?')[0]; // Remove query params
                detectedUrls = [tweetUrl];
                manualUrlInput.value = tweetUrl;
                urlDetectedFromPage = true;
                highlightButton('page', 1);

                // Auto-submit if on tweet page
                setTimeout(() => {
                    quickAddBtn.click();
                }, 300); // Small delay to show the UI update
            }
        }
    } catch (error) {
        console.error('Error detecting tweet page:', error);
    }

    // If no URL from current page, try to read from clipboard
    if (!urlDetectedFromPage) {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const twitterUrls = extractTwitterUrls(clipboardText);
            if (twitterUrls.length > 0) {
                detectedUrls = twitterUrls;
                // Show all URLs in textarea (one per line)
                manualUrlInput.value = twitterUrls.join('\n');
                highlightButton('clipboard', twitterUrls.length);

                // Auto-submit if clipboard contains Twitter URLs
                setTimeout(() => {
                    quickAddBtn.click();
                }, 300); // Small delay to show the UI update
            }
        } catch (error) {
            // Clipboard access may be denied, silently ignore
            console.log('Clipboard access not available:', error.message);
        }
    }

    // Quick add manual URL(s)
    quickAddBtn.addEventListener('click', async () => {
        const inputText = manualUrlInput.value.trim();

        if (!inputText) {
            showStatus(addStatus, 'Please enter tweet URL(s)', 'error');
            return;
        }

        // Extract all URLs from input
        const urls = extractTwitterUrls(inputText);

        if (urls.length === 0) {
            showStatus(addStatus, 'No valid Twitter/X URLs found', 'error');
            return;
        }

        quickAddBtn.disabled = true;
        quickAddBtn.textContent = urls.length > 1 ? `Adding ${urls.length} tweets...` : 'Adding...';

        try {
            const endpoint = await getApiEndpoint();

            // Get current date in local timezone (YYYY-MM-DD format)
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: today,
                    urls: urls // Send all URLs
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const message = urls.length > 1
                ? `✓ Added ${urls.length} tweets to collection!`
                : '✓ Added to collection!';
            showStatus(addStatus, message, 'success');
            manualUrlInput.value = '';
            detectedUrls = [];

        } catch (error) {
            console.error('Error adding URL(s):', error);
            showStatus(addStatus, '✗ Failed to add. Check your API endpoint.', 'error');
        } finally {
            quickAddBtn.disabled = false;
            quickAddBtn.textContent = 'Add to Collection';
            // Reset button style
            quickAddBtn.style.background = '';
            quickAddBtn.style.boxShadow = '';
            const hint = document.querySelector('.url-detected-hint');
            if (hint) hint.remove();
        }
    });

    // Helper function to show status messages
    function showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status ${type}`;
        element.style.display = 'block';

        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }

    // Allow Ctrl/Cmd+Enter to submit (Enter alone for line breaks)
    manualUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            quickAddBtn.click();
        }
    });

    // Quick Links buttons
    document.getElementById('openWebsite').addEventListener('click', async () => {
        chrome.tabs.create({ url: 'https://ttmouse.com' });
    });

    document.getElementById('openAdmin').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://ttmouse.com/admin.html' });
    });
});
