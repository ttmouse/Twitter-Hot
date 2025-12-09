// Twitter Hot Content Quick Add - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const manualUrlInput = document.getElementById('manualUrl');
    const quickAddBtn = document.getElementById('quickAdd');
    const addStatus = document.getElementById('addStatus');

    // Set default API endpoint (hidden from user)
    const defaultEndpoint = 'https://twitterhot.vercel.app/api/update';
    chrome.storage.sync.get(['apiEndpoint'], (result) => {
        if (!result.apiEndpoint) {
            chrome.storage.sync.set({ apiEndpoint: defaultEndpoint });
        }
    });

    // Helper function to check if text contains a Twitter/X URL
    function extractTwitterUrl(text) {
        if (!text) return null;
        const match = text.match(/https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/);
        return match ? match[0] : null;
    }

    // Helper function to highlight the button when URL is detected
    function highlightButton(source) {
        quickAddBtn.style.background = 'linear-gradient(135deg, #1d9bf0 0%, #0c7abf 100%)';
        quickAddBtn.style.boxShadow = '0 4px 12px rgba(29, 155, 240, 0.4)';
        quickAddBtn.textContent = '⭐ Add This Tweet';

        const existingHint = document.querySelector('.url-detected-hint');
        if (existingHint) existingHint.remove();

        const hint = document.createElement('div');
        hint.className = 'url-detected-hint';
        hint.style.cssText = 'text-align: center; color: #1d9bf0; font-size: 12px; margin-top: 8px; font-weight: 600;';
        hint.textContent = source === 'clipboard' ? '✓ URL from clipboard! Click to add' : '✓ Tweet detected! Click to add';
        quickAddBtn.parentElement.appendChild(hint);
    }

    let urlDetectedFromPage = false;

    // Check if current tab is a tweet detail page
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && (tab.url.includes('twitter.com') || tab.url.includes('x.com'))) {
            const tweetUrlMatch = tab.url.match(/\/(twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
            if (tweetUrlMatch) {
                // This is a tweet detail page!
                const tweetUrl = tab.url.split('?')[0]; // Remove query params
                manualUrlInput.value = tweetUrl;
                urlDetectedFromPage = true;
                highlightButton('page');

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
            const twitterUrl = extractTwitterUrl(clipboardText);
            if (twitterUrl) {
                manualUrlInput.value = twitterUrl;
                highlightButton('clipboard');

                // Auto-submit if clipboard contains Twitter URL
                setTimeout(() => {
                    quickAddBtn.click();
                }, 300); // Small delay to show the UI update
            }
        } catch (error) {
            // Clipboard access may be denied, silently ignore
            console.log('Clipboard access not available:', error.message);
        }
    }

    // Quick add manual URL
    quickAddBtn.addEventListener('click', async () => {
        const url = manualUrlInput.value.trim();

        if (!url) {
            showStatus(addStatus, 'Please enter a tweet URL', 'error');
            return;
        }

        // Validate Twitter/X URL
        if (!url.match(/^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/)) {
            showStatus(addStatus, 'Invalid Twitter/X URL', 'error');
            return;
        }

        quickAddBtn.disabled = true;
        quickAddBtn.textContent = 'Adding...';

        try {
            const endpoint = defaultEndpoint;

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
                    urls: [url]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            showStatus(addStatus, '✓ Added to collection!', 'success');
            manualUrlInput.value = '';

        } catch (error) {
            console.error('Error adding URL:', error);
            showStatus(addStatus, '✗ Failed to add. Check your API endpoint.', 'error');
        } finally {
            quickAddBtn.disabled = false;
            quickAddBtn.textContent = 'Add to Collection';
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

    // Allow Enter key to submit
    manualUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            quickAddBtn.click();
        }
    });

    // Quick Links buttons
    document.getElementById('openWebsite').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://twitterhot.vercel.app' });
    });

    document.getElementById('openAdmin').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://twitterhot.vercel.app/admin.html' });
    });
});
