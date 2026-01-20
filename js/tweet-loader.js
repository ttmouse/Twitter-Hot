/**
 * js/tweet-loader.js
 * Handles data fetching and infinite scroll logic for Tweet Stream
 */

class TweetStreamLoader {
    constructor() {
        this.streamOffset = 0;
        this.isStreamLoading = false;
        this.hasMoreStream = true;
        this.streamStartDate = null;
        this.activeGlobalCategory = null;
        this.activeAuthor = null;
        this.activeTag = null;
        this.lastRenderedDateStr = null;

        this.scrollTimeout = null;
        this.initScrollListener();
    }

    /**
     * Initialize infinite scroll listener
     */
    initScrollListener() {
        window.addEventListener('scroll', () => {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;

                // Load more when within 2500px of bottom
                if (scrollHeight - (scrollTop + clientHeight) < 2500) {
                    this.loadNextBatch();
                }
            }, 100);
        });
    }

    /**
     * Load next batch of tweets
     */
    async loadNextBatch() {
        if (this.isStreamLoading || !this.hasMoreStream) return;
        this.isStreamLoading = true;

        if (window.showLoadingIndicator) window.showLoadingIndicator();

        try {
            // Build URL
            let urlPath = '/api/tweets';
            // Assuming buildApiUrl is available globally from api.js
            let url = (window.buildApiUrl ? window.buildApiUrl(urlPath) : urlPath)
                + `?mode=stream&offset=${this.streamOffset}`;

            if (this.streamStartDate) url += `&date=${this.streamStartDate}`;
            if (this.activeGlobalCategory) url += `&category=${encodeURIComponent(this.activeGlobalCategory)}`;
            if (this.activeAuthor) url += `&author=${encodeURIComponent(this.activeAuthor)}`;
            if (this.activeTag) url += `&tag=${encodeURIComponent(this.activeTag)}`;

            console.log('[Stream] Loading:', url);

            const res = await fetch(url);

            // FALLBACK FOR 500 / OFFLINE MODE
            if (!res.ok) {
                console.warn(`API Error ${res.status}. Switching to Offline MOCK Mode.`);

                // Generate Mock Data for visualization
                const mockDate = this.streamStartDate || "2026-01-14";
                const mockTweets = Array.from({ length: 10 }).map((_, i) => ({
                    id: `mock-${Date.now()}-${i}`,
                    content: `[Offline Mode] Mock tweet for date ${mockDate}. Verify layout and z-index. #${i}`,
                    media_urls: [`https://picsum.photos/400/${300 + (i * 50)}`], // Random heights
                    author: {
                        name: "System Offline",
                        screen_name: "admin",
                        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                    },
                    publish_date: mockDate,
                    tags: ["mock", "test"],
                    hierarchical: {},
                    flat_tags: {}
                }));

                // Simulate network delay
                await new Promise(r => setTimeout(r, 500));

                this.processAndRenderTweets(mockTweets);

                // Stop further loading to avoid infinite mock loops
                this.hasMoreStream = false;
                if (window.showToast) window.showToast('Server error. Showing mock data.', 'warning');
                return;
            }

            const tweets = await res.json();

            if (tweets.length === 0) {
                this.hasMoreStream = false;
                if (window.showEndOfContentMessage) window.showEndOfContentMessage();
            } else {
                this.processAndRenderTweets(tweets);
                this.streamOffset += tweets.length;
            }

        } catch (e) {
            console.error('Stream Error:', e);
            if (window.showToast) window.showToast('Loading failed', 'error');
        } finally {
            this.isStreamLoading = false;
            if (window.hideLoadingIndicator) window.hideLoadingIndicator();
        }
    }

    /**
     * Process and Render Fetched Tweets
     * @param {Array} tweets 
     */
    processAndRenderTweets(tweets) {
        const contentList = document.getElementById('contentList');
        if (!contentList) return;

        // Ensure Main Grid Exists
        let mainGrid = document.getElementById('main-stream-grid');
        if (!mainGrid) {
            const container = document.createElement('div');
            container.className = 'day-section';
            container.style.border = 'none';

            mainGrid = document.createElement('div');
            mainGrid.id = 'main-stream-grid';
            mainGrid.className = 'image-gallery-grid'; // Masonry target

            container.appendChild(mainGrid);
            contentList.appendChild(container);
        }

        // Prepare Tweets (Date Anchors)
        const preparedTweets = tweets.map(tweet => {
            const pDate = tweet.publish_date;
            if (pDate && pDate !== this.lastRenderedDateStr) {
                this.lastRenderedDateStr = pDate;
                tweet._isParamsAnchor = true;
                tweet._anchorId = `date-anchor-${pDate}`;
            }
            return tweet;
        });

        // Delegate Rendering to Global Renderer
        if (window.renderer && typeof window.renderer.renderImageGallery === 'function') {
            const container = mainGrid.parentElement;
            // container, isAppend, offset, groupDate(null), items
            window.renderer.renderImageGallery(container, true, this.streamOffset, null, preparedTweets);
        } else {
            console.error('Renderer not found! Ensure renderer.js is loaded.');
        }
    }

    /**
     * Reset Stream (Filter Change)
     */
    reset(startDate = null, category = null, author = null, tag = null) {
        this.streamOffset = 0;
        this.streamStartDate = startDate;
        this.activeGlobalCategory = category;
        this.activeAuthor = author;
        this.activeTag = tag;
        this.lastRenderedDateStr = null;
        this.hasMoreStream = true;
        this.isStreamLoading = false;

        const contentList = document.getElementById('contentList');
        if (contentList) contentList.innerHTML = '';

        const endMsg = document.getElementById('endOfContentMessage');
        if (endMsg) endMsg.style.display = 'none';

        if (window.hideLoadingIndicator) window.hideLoadingIndicator();

        this.loadNextBatch();
    }
}

// Export instance or class
window.TweetStreamLoader = TweetStreamLoader;
