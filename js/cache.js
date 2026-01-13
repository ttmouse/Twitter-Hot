/**
 * Cache Module - 缓存系统
 * 从 app-core.js 拆解出来的独立模块
 */

// LRU Cache implementation for tweet media
class LRUCache {
    constructor(maxSize = 150) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return undefined;
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key, value) {
        // Delete if exists (to re-insert at end)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Check size and evict oldest if needed
        else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            console.log('[LRU Cache] Evicted oldest entry:', firstKey);
        }
        this.cache.set(key, value);
    }

    has(key) {
        return this.cache.has(key);
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    get size() {
        return this.cache.size;
    }
}

// Global Throttle Queue for API rate limiting
class ThrottleQueue {
    constructor(concurrency = 1, delay = 500) {
        this.concurrency = concurrency;
        this.delay = delay;
        this.queue = [];
        this.activeCount = 0;
        this.lastRequestTime = 0;
    }

    add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }

    process() {
        if (this.activeCount >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        const waitTime = Math.max(0, this.delay - timeSinceLast);

        setTimeout(() => {
            this.activeCount++;
            const { fn, resolve, reject } = this.queue.shift();
            this.lastRequestTime = Date.now();

            fn().then(resolve)
                .catch(reject)
                .finally(() => {
                    this.activeCount--;
                    this.process();
                });
        }, waitTime);
    }
}

// --- IndexedDB for Persistent Metadata Storage ---
const DB_NAME = 'BananaHotDB';
const DB_VERSION = 1;
const STORE_NAME = 'tweetMedia';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveToDB(id, data) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id, ...data });
        return tx.complete;
    } catch (e) {
        console.error('[DB] Save failed:', e);
    }
}

async function getFromDB(id) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        return new Promise((resolve) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    } catch (e) {
        console.error('[DB] Get failed:', e);
        return null;
    }
}

// Extract image URLs from tweet info object
function extractImageUrlsFromTweetInfo(data) {
    const images = [];
    if (data && Array.isArray(data.media_extended)) {
        data.media_extended.forEach(media => {
            if (media) {
                const url = media.url || media.media_url_https || media.thumbnail_url;
                if (!url) return;

                // 处理图片
                if (media.type === 'image') {
                    images.push({ url, type: 'image' });
                }
                // 处理视频或 GIF - 提取缩略图
                else if (media.type === 'video' || media.type === 'animated_gif') {
                    const thumb = media.thumbnail_url || media.url || media.media_url_https;
                    if (thumb) {
                        images.push({ url: thumb, type: media.type });
                    }
                }
            }
        });
    }

    // Fallback to mediaURLs if media_extended failed
    if (images.length === 0 && data) {
        const urls = data.mediaURLs || data.media_urls || [];
        if (Array.isArray(urls)) {
            urls.forEach(url => {
                if (typeof url === 'string') {
                    images.push({ url: url, type: 'image' });
                }
            });
        }
    }

    return images;
}

// Create and export instances
const tweetMediaCache = new LRUCache(150);
// 1 concurrent request, 800ms delay between starts to vary gently
const throttleQueue = new ThrottleQueue(1, 800);

// Expose to global scope for compatibility
window.LRUCache = LRUCache;
window.ThrottleQueue = ThrottleQueue;
window.tweetMediaCache = tweetMediaCache;
window.throttleQueue = throttleQueue;
window.openDB = openDB;
window.saveToDB = saveToDB;
window.getFromDB = getFromDB;
window.extractImageUrlsFromTweetInfo = extractImageUrlsFromTweetInfo;
