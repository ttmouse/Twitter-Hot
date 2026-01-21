// ============================================
// UTILITY FUNCTIONS
// ============================================

// Extract Twitter/X URLs from text
function extractUrls(text) {
    const regex = /https?:\/\/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/g;
    return [...new Set(text.match(regex) || [])];
}

function extractTweetId(url) {
    if (url.includes('/article/')) return null;
    const match = url.match(/\/status\/(\d+)/);
    return match ? match[1] : null;
}

// API fetch wrapper
async function apiFetch(url, options = {}) {
    return fetch(url, options);
}

// Save daily snapshot
async function saveDailySnapshot(date, urls) {
    try {
        const res = await apiFetch('/api/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, urls })
        });

        console.log('Response status:', res.status, 'OK:', res.ok);

        if (!res.ok) {
            console.error('Server returned error:', res.status);
            return { ok: false };
        }

        const data = await res.json();
        console.log('Parsed response data:', data);
        return data;
    } catch (e) {
        console.error('Save error:', e);
        return { ok: false };
    }
}

// ============================================
// THEME SYSTEM - Dark/Light Mode Toggle
// ============================================

// Initialize theme immediately to prevent flash
(function initTheme() {
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('admin-theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
})();

// Admin specific logic
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // Theme Toggle Logic
    // ============================================

    const themeToggle = document.getElementById('themeToggle');
    const themeText = document.getElementById('themeText');
    const themeIcon = document.getElementById('themeIcon');

    // Get current theme
    function getCurrentTheme() {
        return document.body.classList.contains('light-mode') ? 'light' : 'dark';
    }

    // Moon icon SVG
    const moonIcon = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;

    // Sun icon SVG
    const sunIcon = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;

    // Update UI based on current theme
    function updateThemeUI() {
        const isLight = document.body.classList.contains('light-mode');

        // Update sidebar theme toggle if present
        if (themeText && themeIcon) {
            if (isLight) {
                themeText.textContent = 'Dark Mode';
                themeIcon.innerHTML = moonIcon;
            } else {
                themeText.textContent = 'Light Mode';
                themeIcon.innerHTML = sunIcon;
            }
        }

        // Update compact theme toggle icon (top bar)
        const themeIconCompact = document.getElementById('themeIconCompact');
        if (themeIconCompact) {
            themeIconCompact.innerHTML = isLight ? moonIcon : sunIcon;
        }
    }

    // Toggle theme
    function toggleTheme() {
        const isLight = document.body.classList.contains('light-mode');

        if (isLight) {
            // Switch to dark
            document.body.classList.remove('light-mode');
            localStorage.setItem('admin-theme', 'dark');
        } else {
            // Switch to light
            document.body.classList.add('light-mode');
            localStorage.setItem('admin-theme', 'light');
        }

        updateThemeUI();
    }

    // Initialize UI
    updateThemeUI();

    // Bind toggle event
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Bind compact theme toggle (top bar)
    const themeToggleCompact = document.getElementById('themeToggleCompact');
    if (themeToggleCompact) {
        themeToggleCompact.addEventListener('click', toggleTheme);
    }

    // Make getCurrentTheme available globally
    window.getCurrentTheme = getCurrentTheme;

    // ============================================
    // Original Admin Logic
    // ============================================
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('publishDate').value = today;
    const frontLink = document.getElementById('frontLink');
    frontLink.href = 'index.html?date=' + today;

    const textarea = document.getElementById('rawContent');
    const IMPORT_CACHE_KEY = 'admin-import-content';
    const publishBtn = document.getElementById('publishBtn');
    const statusMsg = document.getElementById('statusMsg');

    // Cache flags for mode switching
    let standardLoaded = false;
    let imagesLoaded = false;

    // Restore cached content if available
    const cachedContent = localStorage.getItem(IMPORT_CACHE_KEY);
    if (cachedContent) {
        textarea.value = cachedContent;
        const cachedUrls = extractUrls(cachedContent);
        if (cachedUrls.length > 0) {
            updatePreview(cachedUrls);
            standardLoaded = true; // Mark as loaded since default mode is standard
        }
    }

    // Auto-detect links on input
    textarea.addEventListener('input', () => {
        const urls = extractUrls(textarea.value);
        updatePreview(urls);
        localStorage.setItem(IMPORT_CACHE_KEY, textarea.value);

        // Reset cache flags since content changed
        const currentMode = document.querySelector('input[name="previewMode"]:checked').value;
        if (currentMode === 'standard') {
            standardLoaded = true;
            imagesLoaded = false;
        } else {
            imagesLoaded = true;
            standardLoaded = false;
        }
    });



    // Select All logic
    document.getElementById('selectAll').addEventListener('change', (e) => {
        const checked = e.target.checked;
        document.querySelectorAll('.tweet-check-input').forEach(cb => {
            cb.checked = checked;
            toggleItemStyle(cb);
        });
    });

    document.getElementById('publishDate').addEventListener('change', () => {
        const d = document.getElementById('publishDate').value;
        if (d) frontLink.href = 'index.html?date=' + d;
    });

    // Load Data logic
    const loadDataBtn = document.getElementById('loadDataBtn');
    loadDataBtn.onclick = async () => {
        const date = document.getElementById('publishDate').value;
        if (!date) return showStatus('Please select a date first', 'error');

        const originalText = loadDataBtn.textContent;
        loadDataBtn.textContent = 'Loading...';
        loadDataBtn.disabled = true;

        try {
            const res = await apiFetch(`/api/data?date=${date}`);
            if (!res.ok) throw new Error('服务器返回异常状态');
            const data = await res.json();
            const urls = data.urls || [];

            document.getElementById('rawContent').value = urls.join('\n');
            localStorage.setItem(IMPORT_CACHE_KEY, textarea.value);
            updatePreview(urls);
            showStatus(`Loaded ${urls.length} items from server`, 'success');

            // Mark current mode as loaded
            const currentMode = document.querySelector('input[name="previewMode"]:checked').value;
            if (currentMode === 'standard') {
                standardLoaded = true;
                imagesLoaded = false;
            } else {
                imagesLoaded = true;
                standardLoaded = false;
            }
        } catch (e) {
            showStatus('Failed to load data', 'error');
            console.error(e);
        } finally {
            loadDataBtn.textContent = originalText;
            loadDataBtn.disabled = false;
        }
    };

    // Quick Delete Logic - supports URL or ID
    const quickDeleteBtn = document.getElementById('quickDeleteBtn');
    const deleteUrlInput = document.getElementById('deleteUrlInput');

    if (quickDeleteBtn && deleteUrlInput) {
        quickDeleteBtn.onclick = async () => {
            const input = deleteUrlInput.value.trim();
            if (!input) return showStatus('Please enter a URL or ID', 'error');

            const tweetId = extractTweetId(input) || (input.match(/^\d{10,}$/) ? input : null);
            if (!tweetId) return showStatus('Invalid URL or ID', 'error');

            if (!confirm(`Delete tweet ${tweetId}?`)) return;

            try {
                const res = await apiFetch('/api/delete_by_id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tweet_id: tweetId })
                });
                const data = await res.json();
                
                if (data.ok) {
                    showStatus(data.message, 'success');
                    deleteUrlInput.value = '';
                } else {
                    showStatus(data.message || 'Delete failed', 'error');
                }
            } catch (e) {
                showStatus('Delete failed: ' + e.message, 'error');
            }
        };
    }

    // Delete action
    window.deleteUrl = async (url) => {
        if (!confirm('Are you sure you want to delete this tweet?')) return;

        // Find all UI elements for this URL immediately
        const inputs = document.querySelectorAll(`input[value="${url}"]`);
        const cards = [];
        inputs.forEach(input => {
            const card = input.closest('.tweet-card-wrapper') || input.closest('.image-mode-card');
            if (card) cards.push(card);
        });

        const date = document.getElementById('publishDate').value;

        try {
            // Optimistic UI update: Fade out immediately
            cards.forEach(card => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
            });

            const res = await apiFetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, url })
            });
            const data = await res.json();

            if (data.ok) {
                showStatus('Deleted successfully', 'success');

                // Permanent UI disabled state
                inputs.forEach(input => input.checked = false);
                cards.forEach(card => {
                    card.classList.add('deleted-item');
                    card.style.opacity = '0.3';
                    card.style.filter = 'grayscale(100%)';

                    // Update delete button state
                    const btn = card.querySelector('.card-delete-btn') || card.querySelector('.delete-btn');
                    if (btn) {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                        btn.style.cursor = 'not-allowed';
                    }
                });

                // Fix: Also remove from textarea so it doesn't get re-submitted
                const textarea = document.getElementById('rawContent');
                if (textarea) {
                    const currentText = textarea.value;
                    // Replace URL with empty string, handling potential newlines
                    const newText = currentText.replace(url, '').replace(/^\s*[\r\n]/gm, '');
                    textarea.value = newText;
                }

                // Crucially: DO NOT reload data
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (e) {
            console.error('Delete error:', e);
            showStatus('Error deleting tweet: ' + e.message, 'error');

            // Revert UI on failure
            cards.forEach(card => {
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
            });
        }
    };

    publishBtn.addEventListener('click', async () => {
        console.log('=== Publish button clicked ===');
        const date = document.getElementById('publishDate').value;
        const urls = extractUrls(textarea.value);
        const d = (date || '').trim();
        const okDate = /^\d{4}-\d{2}-\d{2}$/.test(d);

        console.log('Date:', d, 'URLs count:', urls.length);

        if (!date) {
            console.log('No date provided');
            showStatus('请选择发布日期', 'error');
            return;
        }

        if (!okDate) {
            console.log('Invalid date format');
            showStatus('发布日期格式需为 YYYY-MM-DD', 'error');
            return;
        }

        if (urls.length === 0) {
            console.log('No URLs detected');
            showStatus('未检测到任何 Twitter 链接', 'error');
            return;
        }

        // Get SELECTED urls
        const selectedUrls = [];
        document.querySelectorAll('.tweet-check-input:checked').forEach(cb => {
            selectedUrls.push(cb.value);
        });

        console.log('Selected URLs count:', selectedUrls.length);

        if (selectedUrls.length === 0) {
            console.log('No URLs selected');
            showStatus('未选中任何链接进行发布', 'error');
            return;
        }

        console.log('Calling saveDailySnapshot with date:', d, 'urls:', selectedUrls.length);
        const result = await saveDailySnapshot(d, selectedUrls);
        console.log('Result from saveDailySnapshot:', result);

        if (result && result.ok) {
            let message = `✅ 已同步服务器并发布 ${d} 的内容`;

            // 如果有详细信息，显示更详细的状态
            if (result.totalUrls !== undefined) {
                message += `，共 ${result.totalUrls} 条链接`;
                if (result.newUrls !== undefined && result.newUrls < result.totalUrls) {
                    message += `（新增 ${result.newUrls} 条，${result.totalUrls - result.newUrls} 条为去重后的已存在链接）`;
                }
            } else {
                message += `，${selectedUrls.length} 条链接`;
            }

            showStatus(message, 'success');
        } else {
            showStatus(`⚠️ 已更新本地缓存，但服务器存储未生效`, 'error');
        }

        // Optional: Clear input
        // textarea.value = '';
    });

    // Mode Toggle Listener - Enhanced with caching
    document.querySelectorAll('input[name="previewMode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const listStandard = document.getElementById('linkList');
            const listImages = document.getElementById('linkListImages');
            const urls = extractUrls(textarea.value);
            const mode = document.querySelector('input[name="previewMode"]:checked').value;

            if (mode === 'images') {
                // Switch to images mode
                listStandard.style.display = 'none';
                listImages.style.display = '';

                // Only load if not already loaded
                if (!imagesLoaded && urls.length > 0) {
                    updatePreview(urls);
                    imagesLoaded = true;
                }
            } else {
                // Switch to standard mode
                listImages.style.display = 'none';
                listStandard.style.display = '';

                // Only load if not already loaded
                if (!standardLoaded && urls.length > 0) {
                    updatePreview(urls);
                    standardLoaded = true;
                }
            }
        });
    });

    // Make entire select button clickable, not just the checkbox
    document.addEventListener('click', (event) => {
        const selectBtn = event.target.closest('.card-select-btn');
        if (!selectBtn) return;

        const checkbox = selectBtn.querySelector('.tweet-check-input');
        if (!checkbox) return;

        // Let the native checkbox click behave normally
        if (event.target === checkbox) {
            return;
        }

        event.preventDefault();
        checkbox.checked = !checkbox.checked;
        toggleItemStyle(checkbox);
    });
});

// Update Preview (Main Logic) - Enhanced for mode switching with caching
async function updatePreview(urls) {
    const count = document.getElementById('linkCount');
    count.textContent = urls.length;

    // Get current mode
    const mode = document.querySelector('input[name="previewMode"]:checked').value;

    // Select correct container based on mode
    const list = mode === 'images' ? document.getElementById('linkListImages') : document.getElementById('linkList');

    // Clear current container only
    list.innerHTML = '';

    if (urls.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 4rem; color: var(--muted-foreground); font-family: var(--font-mono); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em;">No links detected yet</div>';
        return;
    }

    if (mode === 'images') {
        // Image Only Mode
        renderImagePreview(urls, list);
    } else {
        // Standard Mode - render tweet embeds with lazy loading
        urls.forEach((url, i) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'tweet-card-wrapper';
            wrapper.innerHTML = `
                    <div class="tweet-card-actions">
                        <div class="card-select-btn">
                            <input type="checkbox" class="tweet-check-input" value="${url}" checked onchange="toggleItemStyle(this)">
                            <span class="card-select-indicator" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </span>
                        </div>
                        <button class="card-delete-btn" onclick="window.deleteUrl('${url}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="tweet-embed-container" id="preview-tweet-${i}" data-tweet-url="${url}" data-tweet-index="${i}"></div>
                `;
            list.appendChild(wrapper);
        });

        // Initialize lazy loading for tweets
        initializeTweetLazyLoading();
    }
}

// Render Image Preview Logic
async function renderImagePreview(urls, container) {
    // Render placeholders first
    urls.forEach((url, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-mode-card selected';
        wrapper.id = `img-card-${i}`;
        wrapper.innerHTML = `
                <input type="checkbox" class="tweet-check-input image-card-checkbox" value="${url}" checked>
                <div class="image-card-check-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="image-card-actions">
                    <a href="${url}" target="_blank" class="card-link-btn" onclick="event.stopPropagation()" title="Open on X">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                        </svg>
                    </a>
                    <button class="card-delete-btn" onclick="event.stopPropagation(); window.deleteUrl('${url}')" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <div class="loading-placeholder" id="img-load-${i}">
                    <div class="loading-spinner" style="width: 20px; height: 20px;"></div>
                    <span style="font-size: 0.8rem;">Loading Info...</span>
                </div>
            `;

        // Make card clickable to toggle checkbox
        wrapper.addEventListener('click', (e) => {
            if (e.target.closest('button')) return; // Don't toggle if clicking delete button
            const checkbox = wrapper.querySelector('.tweet-check-input');
            checkbox.checked = !checkbox.checked;
            toggleItemStyle(checkbox);
        });

        container.appendChild(wrapper);

        // Fetch data
        const id = extractTweetId(url);
        if (id) {
            apiFetch(`/api/tweet_info?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    const placeholder = document.getElementById(`img-load-${i}`);
                    if (!placeholder) return;

                    const findFirstImage = () => {
                        if (Array.isArray(data.media_extended)) {
                            const imgMedia = data.media_extended.find(m => m.type === 'image' && m.url);
                            if (imgMedia) return imgMedia.url;
                        }
                        if (Array.isArray(data.mediaURLs) && data.mediaURLs.length > 0) {
                            return data.mediaURLs[0];
                        }
                        return null;
                    };

                    const firstImage = findFirstImage();

                    if (firstImage) {
                        placeholder.outerHTML = `<img src="${firstImage}" loading="lazy" alt="Tweet Image">`;
                    } else {
                        placeholder.outerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">No Images Found</div>`;
                    }
                })
                .catch(err => {
                    console.error(err);
                    const placeholder = document.getElementById(`img-load-${i}`);
                    if (placeholder) placeholder.innerHTML = '<span style="color: var(--text-primary); font-size: 0.8rem;">Failed to load info</span>';
                });
        }
    });
}

function toggleItemStyle(checkbox) {
    // Find parent wrapper
    const wrapper = checkbox.closest('.tweet-card-wrapper') || checkbox.closest('.image-mode-card');
    if (!wrapper) return;

    if (checkbox.checked) {
        wrapper.classList.remove('unchecked');
        wrapper.classList.add('selected');
    } else {
        wrapper.classList.add('unchecked');
        wrapper.classList.remove('selected');
    }

    // Update Select All state
    const all = document.querySelectorAll('.tweet-check-input');
    const checked = document.querySelectorAll('.tweet-check-input:checked');
    document.getElementById('selectAll').checked = all.length > 0 && all.length === checked.length;
}

function showStatus(msg, type) {
    const el = document.getElementById('statusMsg');
    el.textContent = msg;
    el.style.display = 'flex';
    el.className = 'status-message ' + (type === 'success' ? 'status-success' : 'status-error');
}

// ============================================
// LAZY LOADING - Intersection Observer
// ============================================

let tweetObserver = null;
const loadingQueue = new Set(); // Track tweets currently loading
const MAX_CONCURRENT_LOADS = 6; // Maximum simultaneous loads

function initializeTweetLazyLoading() {
    // Clean up existing observer
    if (tweetObserver) {
        tweetObserver.disconnect();
    }

    const tweetContainers = document.querySelectorAll('.tweet-embed-container:not(.loaded)');

    // Create Intersection Observer for lazy loading
    tweetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;

                // Check if already loaded or loading
                if (container.classList.contains('loaded') ||
                    container.classList.contains('loading') ||
                    loadingQueue.has(container.id)) {
                    return;
                }

                // Only load if under concurrent limit
                if (loadingQueue.size < MAX_CONCURRENT_LOADS) {
                    // Mark as loading
                    container.classList.add('loading');
                    loadingQueue.add(container.id);

                    // Load the tweet
                    loadTweetEmbed(container);

                    // Stop observing this element
                    tweetObserver.unobserve(container);
                }
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '1200px', // Increased to 1200px for even earlier loading
        threshold: 0.01
    });

    // Observe all tweet containers
    tweetContainers.forEach(container => {
        tweetObserver.observe(container);
    });

    // Start auto-loading immediately with larger batch
    setTimeout(() => {
        fillLoadingQueue();
    }, 100);
}

// Maintain optimal loading queue size
function fillLoadingQueue() {
    const unloadedContainers = Array.from(
        document.querySelectorAll('.tweet-embed-container:not(.loaded):not(.loading)')
    ).filter(container => !loadingQueue.has(container.id));

    if (unloadedContainers.length === 0) {
        return; // All tweets are loaded or loading
    }

    // Calculate how many more we can load
    const slotsAvailable = MAX_CONCURRENT_LOADS - loadingQueue.size;

    if (slotsAvailable <= 0) {
        return; // Queue is full
    }

    // Load up to available slots
    const batch = unloadedContainers.slice(0, slotsAvailable);
    batch.forEach(container => {
        container.classList.add('loading');
        loadingQueue.add(container.id);
        loadTweetEmbed(container);

        // Stop observing since we're manually triggering load
        if (tweetObserver) {
            tweetObserver.unobserve(container);
        }
    });
}

// Auto-load next batch of tweets (legacy - now using fillLoadingQueue)
function autoLoadNext(batchSize = 3) {
    fillLoadingQueue();
}

function loadTweetEmbed(container, isRetry = false) {
    const url = container.dataset.tweetUrl;
    const tweetId = extractTweetId(url);

    if (!tweetId || !window.twttr || !window.twttr.widgets) {
        showRetryButton(container, 'Twitter SDK not loaded');
        container.classList.add('loaded');
        container.classList.remove('loading');
        loadingQueue.delete(container.id);
        autoLoadNext();
        return;
    }

    // If retry, clear the container and reset states
    if (isRetry) {
        container.innerHTML = '';
        container.classList.remove('loaded', 'error');
        container.classList.add('loading');
        loadingQueue.add(container.id);
    }

    // Get current theme
    const currentTheme = window.getCurrentTheme ? window.getCurrentTheme() : 'dark';

    // Load tweet with video support
    window.twttr.widgets.createTweet(
        tweetId,
        container,
        {
            theme: currentTheme,
            dnt: true,
            conversation: 'none',
            cards: 'visible',  // Required for videos
            align: 'center',
            width: 550,  // Recommended width for better video display
            linkColor: '#ffffff',
            // Add extra options for better video support
            chrome: 'nofooter'  // Hide footer to make videos more prominent
        }
    ).then(el => {
        container.classList.remove('loading');
        loadingQueue.delete(container.id);

        if (el) {
            // Success
            container.classList.add('loaded');
            console.log('✅ Tweet loaded successfully:', tweetId, url);
        } else {
            // Failed - tweet not found or deleted
            console.warn('❌ Tweet failed to load (returned null):', tweetId, url);
            showRetryButton(container, 'Tweet not found or unavailable<br><small style="opacity: 0.7;">可能原因：推文已删除、账号被封禁、或视频有地区限制</small>');
            container.classList.add('loaded', 'error');
        }

        // Auto-load next batch after this one completes
        autoLoadNext();
    }).catch(err => {
        console.error('❌ Error loading tweet:', tweetId, url, err);
        container.classList.remove('loading');
        container.classList.add('loaded', 'error');
        loadingQueue.delete(container.id);

        // Show retry button with error message
        showRetryButton(container, 'Failed to load tweet<br><small style="opacity: 0.7;">网络错误或Twitter API问题</small>');

        // Auto-load next batch even on error
        autoLoadNext();
    });
}

// Show retry button for failed tweets
function showRetryButton(container, message) {
    container.innerHTML = `
        <div style="padding: 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; min-height: 200px; justify-content: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="1.5" style="opacity: 0.5;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div style="color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.6; max-width: 350px;">${message}</div>
            <button onclick="retryLoadTweet('${container.id}')" class="primary-btn" style="padding: 0.625rem 1.5rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <span>重试加载</span>
            </button>
            <a href="${container.dataset.tweetUrl}" target="_blank" style="color: var(--muted-foreground); font-size: 0.8125rem; text-decoration: none; opacity: 0.7; transition: opacity 0.2s;">
                在 Twitter 上查看 →
            </a>
        </div>
    `;
}

// Global retry function
window.retryLoadTweet = function (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        loadTweetEmbed(container, true);
    }
};
