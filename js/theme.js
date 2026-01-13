/**
 * Theme Module - 主题管理
 * 从 app-core.js 拆解出来的独立模块
 */

const SITE_THEME_STORAGE_KEY = 'site-theme';

const SUN_ICON = `
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

const MOON_ICON = `
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
`;

// IIFE: Ensure stored theme is applied immediately on script load
(function ensureStoredThemeApplied() {
    try {
        const savedTheme = localStorage.getItem(SITE_THEME_STORAGE_KEY);
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else if (savedTheme === 'dark') {
            document.documentElement.classList.remove('light-mode');
        }
    } catch (error) {
        // Storage access failed, keep default theme.
    }
})();

function isLightThemeActive() {
    return document.documentElement.classList.contains('light-mode');
}

function syncBodyThemeClass() {
    if (!document.body) return;
    document.body.classList.toggle('light-mode', isLightThemeActive());
}

function getCurrentTheme() {
    return isLightThemeActive() ? 'light' : 'dark';
}

function setThemePreference(theme, options = {}) {
    const { persist = true, reloadTweets = false } = options;
    const isLight = theme === 'light';

    document.documentElement.classList.toggle('light-mode', isLight);

    if (persist) {
        try {
            localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.warn('Unable to persist theme preference:', error);
        }
    }

    syncBodyThemeClass();
    updateThemeToggleIcon();

    if (reloadTweets && typeof reloadAllTweetEmbeds === 'function') {
        reloadAllTweetEmbeds();
    }
}

function updateThemeToggleIcon() {
    const icon = document.getElementById('themeToggleIcon');
    if (!icon) return;
    icon.innerHTML = isLightThemeActive() ? MOON_ICON : SUN_ICON;
}

function setupThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const nextTheme = isLightThemeActive() ? 'dark' : 'light';
        setThemePreference(nextTheme, { reloadTweets: true });
    });

    updateThemeToggleIcon();
    syncBodyThemeClass();
}

// Expose to global scope for compatibility
window.getCurrentTheme = getCurrentTheme;
window.setThemePreference = setThemePreference;
window.syncBodyThemeClass = syncBodyThemeClass;
window.setupThemeToggle = setupThemeToggle;
window.updateThemeToggleIcon = updateThemeToggleIcon;
