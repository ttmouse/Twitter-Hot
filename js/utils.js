/**
 * Utils Module - 工具函数
 * 从 app-core.js 拆解出来的独立模块
 */

// Extract tweet ID from URL or Object
function extractTweetId(url) {
    if (!url) return null;
    if (typeof url === 'object' && url.id) return url.id;
    const urlStr = typeof url === 'string' ? url : (url.url || '');
    const match = urlStr.match(/status\/(\d+)/);
    return match ? match[1] : null;
}

// Helper: Format Date to YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// Copy text to clipboard with fallback
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successful) {
                resolve();
            } else {
                reject(new Error('Copy command failed'));
            }
        } catch (err) {
            document.body.removeChild(textarea);
            reject(err);
        }
    });
}

// Show visual feedback for copy action
function showCopyFeedback(button, success) {
    if (!button) return;

    const baseLabel = button.dataset.label || 'Copy tweet link';
    const message = success ? 'Link copied' : 'Copy failed';

    button.classList.remove('copied', 'copy-failed');
    button.classList.add(success ? 'copied' : 'copy-failed');
    button.setAttribute('aria-label', message);
    button.title = message;

    clearTimeout(button._copyTimeout);
    button._copyTimeout = setTimeout(() => {
        button.classList.remove('copied', 'copy-failed');
        button.setAttribute('aria-label', baseLabel);
        button.title = baseLabel;
    }, 1500);
}

// Extract URLs from text
function extractUrls(text) {
    const urlPattern = /https?:\/\/(?:twitter\.com|x\.com)\/\S+\/status\/\d+/g;
    return text.match(urlPattern) || [];
}

// Expose to global scope for compatibility
window.extractTweetId = extractTweetId;
window.formatDate = formatDate;
window.copyToClipboard = copyToClipboard;
window.showCopyFeedback = showCopyFeedback;
window.extractUrls = extractUrls;
