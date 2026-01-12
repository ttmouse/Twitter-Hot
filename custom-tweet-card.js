/**
 * Custom Tweet Card Component
 * Alternative to Twitter Widget for reliable tweet display
 */

class CustomTweetCard {
    constructor(tweetId, container) {
        this.tweetId = tweetId;
        this.container = container;
        this.data = null;
        this.loading = false;
    }

    async load() {
        if (this.loading) return;
        this.loading = true;

        this.container.innerHTML = `
            <div class="custom-tweet-card loading">
                <div class="loading-spinner"></div>
                <span>Loading tweet...</span>
            </div>
        `;

        try {
            // Use our API to get tweet data
            const response = await fetch(`/api/tweet_info?id=${this.tweetId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch tweet: ${response.status}`);
            }

            this.data = await response.json();
            this.render();
        } catch (error) {
            console.error('Failed to load tweet:', error);
            this.renderError(error.message);
        } finally {
            this.loading = false;
        }
    }

    render() {
        if (!this.data) return;

        const tweetDate = new Date(this.data.date || Date.now());
        const formattedDate = tweetDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const mediaHTML = this.renderMedia();
        const theme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';

        this.container.innerHTML = `
            <div class="custom-tweet-card ${theme}">
                <div class="tweet-header">
                    <img class="tweet-avatar" src="${this.data.user_profile_image_url || '/default-avatar.png'}" alt="Avatar" crossOrigin="anonymous">
                    <div class="tweet-user-info">
                        <div class="tweet-name">${this.data.user_name || 'Unknown'}</div>
                        <div class="tweet-username">@${this.data.user_screen_name || 'unknown'}</div>
                    </div>
                    <div class="tweet-date">${formattedDate}</div>
                </div>
                <div class="tweet-content">
                    <div class="tweet-text">${this.formatTweetText(this.data.text || '')}</div>
                    ${mediaHTML}
                </div>
                <div class="tweet-footer">
                    <div class="tweet-stats">
                        <div class="tweet-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            <span>${this.formatNumber(this.data.replies || 0)}</span>
                        </div>
                        <div class="tweet-stat">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.77 15.67a.749.749 0 0 0-1.06 0l-2.22 2.22V7.65a3.755 3.755 0 0 0-3.75-3.75h-5.85a.75.75 0 0 0 0 1.5h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22a.749.749 0 1 0-1.06 1.06l3.5 3.5a.747.747 0 0 0 1.06 0l3.5-3.5a.749.749 0 0 0 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22a.752.752 0 0 0 1.062 0 .749.749 0 0 0 0-1.06l-3.5-3.5a.747.747 0 0 0-1.06 0l-3.5 3.5a.749.749 0 1 0 1.06 1.06l2.22-2.22V16.7a3.755 3.755 0 0 0 3.75 3.75h5.85a.75.75 0 0 0 0-1.5z"></path>
                            </svg>
                            <span>${this.formatNumber(this.data.retweets || 0)}</span>
                        </div>
                        <div class="tweet-stat">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span>${this.formatNumber(this.data.likes || 0)}</span>
                        </div>
                    </div>
                    <div class="tweet-actions">
                        <a href="https://twitter.com/${this.data.user_screen_name || 'unknown'}/status/${this.tweetId}" 
                           target="_blank" 
                           rel="noopener"
                           class="tweet-action-btn view-on-twitter">
                            View on X
                        </a>
                        <a href="https://unimage.vercel.app/?url=https://x.com/${this.data.user_screen_name || 'unknown'}/status/${this.tweetId}" 
                           target="_blank" 
                           rel="noopener"
                           class="tweet-action-btn">
                            Unimage
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    renderMedia() {
        if (!this.data.media_extended || this.data.media_extended.length === 0) {
            return '';
        }

        const images = this.data.media_extended.filter(m => m.type === 'image');
        const videos = this.data.media_extended.filter(m => m.type === 'video' || m.type === 'animated_gif');

        let mediaHTML = '<div class="tweet-media">';

        if (images.length > 0) {
            const gridClass = images.length === 1 ? 'single-image' :
                images.length === 2 ? 'two-images' : 'multiple-images';

            mediaHTML += `<div class="tweet-images ${gridClass}">`;
            images.forEach((img, i) => {
                mediaHTML += `<img src="${img.url}" alt="Tweet image ${i + 1}" class="tweet-image" crossOrigin="anonymous">`;
            });
            mediaHTML += '</div>';
        }

        if (videos.length > 0) {
            videos.forEach((video, i) => {
                mediaHTML += `
                    <div class="tweet-video">
                        <video controls preload="metadata" poster="${video.thumbnail_url || ''}">
                            <source src="${video.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            });
        }

        mediaHTML += '</div>';
        return mediaHTML;
    }

    renderError(errorMessage) {
        this.container.innerHTML = `
            <div class="custom-tweet-card error">
                <div class="error-message">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                    <p>Failed to load tweet</p>
                    <p class="error-detail">${errorMessage}</p>
                    <a href="https://twitter.com/status/${this.tweetId}" 
                       target="_blank" 
                       rel="noopener"
                       class="tweet-action-btn view-on-twitter">
                        View on X
                    </a>
                </div>
            </div>
        `;
    }

    formatTweetText(text) {
        // Convert URLs to links
        let formattedText = text.replace(
            /https?:\/\/[^\s]+/g,
            url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
        );

        // Convert mentions to links
        formattedText = formattedText.replace(
            /@(\w+)/g,
            mention => `<a href="https://twitter.com/${mention.substring(1)}" target="_blank" rel="noopener">${mention}</a>`
        );

        // Convert hashtags to links
        formattedText = formattedText.replace(
            /#(\w+)/g,
            hashtag => `<a href="https://twitter.com/hashtag/${hashtag.substring(1)}" target="_blank" rel="noopener">${hashtag}</a>`
        );

        return formattedText;
    }

    formatNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        return (num / 1000000).toFixed(1) + 'M';
    }
}

// Export for global use
window.CustomTweetCard = CustomTweetCard;