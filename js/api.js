/**
 * API Module - API 基础设施
 * 从 app-core.js 拆解出来的独立模块
 */

const urlParams = new URLSearchParams(window.location.search);

let apiBaseUrl = '';

function normalizeApiBase(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';
    try {
        const parsed = new URL(trimmed);
        return parsed.origin;
    } catch (e) {
        console.warn('Invalid API base provided, falling back to same origin.');
        return '';
    }
}

// IIFE: Initialize API base URL from query params or localStorage
(function initializeApiBase() {
    const queryValue = urlParams.get('apiBase');
    if (queryValue !== null) {
        const normalized = normalizeApiBase(queryValue);
        if (normalized) {
            localStorage.setItem('apiBaseUrl', normalized);
            apiBaseUrl = normalized;
        } else {
            localStorage.removeItem('apiBaseUrl');
            apiBaseUrl = '';
        }
    } else {
        apiBaseUrl = localStorage.getItem('apiBaseUrl') || '';
    }
})();

function setApiBaseUrl(value) {
    const normalized = normalizeApiBase(value);
    if (normalized) {
        localStorage.setItem('apiBaseUrl', normalized);
        apiBaseUrl = normalized;
    } else {
        localStorage.removeItem('apiBaseUrl');
        apiBaseUrl = '';
    }
    return apiBaseUrl;
}

function getApiBaseUrl() {
    return apiBaseUrl;
}

function buildApiUrl(path) {
    if (!apiBaseUrl) {
        // Hybrid Mode: If we are on Vercel (or any non-local, non-VPS domain), default to VPS API
        const host = window.location.hostname;
        if (!host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('ttmouse.com')) {
            // EXCEPTION: Keep tweet_info on Vercel to use distributed Serverless IPs (avoid 429)
            if (path.includes('tweet_info')) {
                return path;
            }
            console.log('Hybrid Mode detected: Defaulting API to https://ttmouse.com');
            return `https://ttmouse.com/${path.replace(/^\/+/, '')}`;
        }
        return path;
    }

    // CRITICAL FIX: Force relative paths (HTTPS) for production domain
    if (window.location.hostname === 'ttmouse.com' || window.location.hostname.endsWith('.ttmouse.com')) {
        apiBaseUrl = '';
        try { localStorage.removeItem('apiBaseUrl'); } catch (e) { }
        return path;
    }

    // Auto-upgrade insecure API base if we are on HTTPS
    if (window.location.protocol === 'https:') {
        // Fix 1: If we are valid domain, DO NOT use IP address for API
        if (window.location.hostname.includes('ttmouse.com')) {
            if (apiBaseUrl && (apiBaseUrl.includes('38.55.192.139') || apiBaseUrl.includes('localhost'))) {
                console.log('Correcting API Base URL to domain...');
                apiBaseUrl = ''; // Use relative paths
                localStorage.removeItem('apiBaseUrl');
            }
        }

        // Fix 2: Upgrade HTTP to HTTPS
        if (apiBaseUrl && apiBaseUrl.startsWith('http:')) {
            apiBaseUrl = apiBaseUrl.replace('http:', 'https:');
            localStorage.setItem('apiBaseUrl', apiBaseUrl);
        }
    }

    if (path.startsWith('http')) {
        // Fix mixed content for absolute paths in arguments
        if (window.location.protocol === 'https:' && path.startsWith('http:')) {
            // If absolute path is IP based, swap to domain to avoid SSL error
            if (path.includes('38.55.192.139')) {
                return path.replace('http:', 'https:').replace('38.55.192.139', 'ttmouse.com');
            }
            return path.replace('http:', 'https:');
        }
        return path;
    }

    const base = apiBaseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
}

function apiFetch(path, options) {
    return fetch(buildApiUrl(path), options);
}

// Expose to global scope for compatibility
window.getApiBaseUrl = getApiBaseUrl;
window.setApiBaseUrl = setApiBaseUrl;
window.apiFetch = apiFetch;
window.buildApiUrl = buildApiUrl;
