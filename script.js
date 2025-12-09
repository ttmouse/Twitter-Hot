// Extract tweet ID from URL
function extractTweetId(url) {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
}

// Render content items in masonry layout with lazy loading
function renderContent() {
    const contentList = document.getElementById('contentList');
    if (!contentList) {
        // Not on the main page, so don't proceed
        return;
    }

    // Clear any existing content (including loading text)
    contentList.innerHTML = '';
    contentList.className = 'masonry-grid';

    tweetUrls.forEach((url, index) => {
        const contentItem = document.createElement('div');
        contentItem.className = 'masonry-item';
        contentItem.style.animationDelay = `${index * 0.05}s`;

        contentItem.innerHTML = `
            <div class="tweet-embed-container" id="tweet-container-${index}" data-tweet-url="${url}" data-tweet-index="${index}">
                <div class="tweet-loading">
                    <div class="loading-spinner"></div>
                    <span>准备加载...</span>
                </div>
                <div id="tweet-target-${index}"></div>
            </div>
        `;

        contentList.appendChild(contentItem);
    });

    // Setup lazy loading for tweets
    setupLazyLoadingForTweets();
}

// Setup lazy loading for tweets using IntersectionObserver
function setupLazyLoadingForTweets() {
    // IntersectionObserver options
    const observerOptions = {
        root: null, // viewport
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01
    };

    // Create observer
    const tweetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Only load when entering viewport and not already loaded
            if (entry.isIntersecting && !entry.target.classList.contains('loaded') && !entry.target.classList.contains('loading')) {
                const container = entry.target;
                const url = container.getAttribute('data-tweet-url');
                const index = parseInt(container.getAttribute('data-tweet-index'));

                // Mark as loading to prevent duplicate loads
                container.classList.add('loading');

                // Update loading text
                const loadingSpan = container.querySelector('.tweet-loading span');
                if (loadingSpan) {
                    loadingSpan.textContent = 'Loading tweet...';
                }

                // Load the tweet
                loadTweet(url, container, index);

                // Stop observing this container
                tweetObserver.unobserve(container);
            }
        });
    }, observerOptions);

    // Observe all tweet containers
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
const params = new URLSearchParams(window.location.search);
const paramDate = params.get('date');
let currentDate = (paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate)) ? paramDate : null; // Will be set to latest date if null
const tweetUrls = [];
let availableDates = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the main page (index.html)
    if (document.getElementById('contentList')) {
        setupDateTabsNavigation();
        loadAvailableDates();
        // Only load content if currentDate is already set (from URL parameter)
        // Otherwise, loadAvailableDates will set it to the latest date and load content
        if (currentDate) {
            loadContentForDate(currentDate);
        }
        addEntranceAnimation();
        setupMobileStickyNav();
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
        fetch('/api/dates')
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

                // If no date is set (no URL parameter), default to the latest available date
                if (!currentDate && availableDates.length > 0) {
                    currentDate = availableDates[0].date; // Dates are sorted newest first

                    // Update URL parameter to reflect the selected date
                    const url = new URL(window.location);
                    url.searchParams.set('date', currentDate);
                    window.history.replaceState({}, '', url);
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

// Load content for specific date
function loadContentForDate(date) {
    // First check if we're on the main page
    const contentList = document.getElementById('contentList');
    const emptyState = document.getElementById('emptyState');

    if (!contentList) {
        // Not on the main page, so don't proceed
        return;
    }

    try {
        fetch('/api/pv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date }),
            keepalive: true
        });
    } catch (e) { }

    // Define storage key for this date
    const storageKey = `tweets_${date}`;

    // Show loading state
    contentList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading content...</div>';
    emptyState.style.display = 'none';
    tweetUrls.length = 0;

    const url = `/api/data?date=${encodeURIComponent(date)}`;

    fetch(url)
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
                tweetUrls.push(...urls);
                renderContent();
                emptyState.style.display = 'none';
                localStorage.setItem(storageKey, JSON.stringify(urls));

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
                        tweetUrls.push(...u);
                        renderContent();
                        emptyState.style.display = 'none';

                        // Update date tab selection
                        selectDateTab(date);
                        return;
                    }
                } catch (e) { }
            }

            // Show empty state
            contentList.innerHTML = '';
            emptyState.style.display = 'block';

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
                        tweetUrls.push(...u);
                        renderContent();
                        emptyState.style.display = 'none';

                        // Update date tab selection
                        selectDateTab(date);
                        return;
                    }
                } catch (e) { }
            }

            // Show error state
            contentList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Failed to load. Please refresh.</div>';
            emptyState.style.display = 'none';

            // Still update the selected tab even if no content
            selectDateTab(date);
        });
}

// Save daily snapshot (Called by Admin)
function saveDailySnapshot(date, urls) {
    const storageKey = `tweets_${date}`;
    const body = JSON.stringify({ date, urls });
    return fetch('/api/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
        .then(r => {
            if (!r.ok) return Promise.reject();
            return r.json();
        })
        .then(responseData => {
            // 获取最新的URL列表，确保本地缓存与服务器同步
            // 这里我们重新获取数据，因为合并后的完整URL列表只在服务器端
            return fetch(`/api/data?date=${encodeURIComponent(date)}`)
                .then(r => r.ok ? r.json() : Promise.reject())
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

// Add entrance animation
function addEntranceAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .content-item {
            animation: slideInUp 0.5s ease-out backwards;
        }
    `;
    document.head.appendChild(style);
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
