/**
 * js/search.js
 * Global Search - supports categories, tags, authors
 */

(function() {
    let searchOverlay, searchInput, searchResults, searchBtn, closeBtn;
    let categoriesCache = null;
    let authorsCache = null;
    let tagsCache = null;
    let debounceTimer = null;
    let isInitialized = false;

    function init() {
        if (isInitialized) return;
        
        searchOverlay = document.getElementById('globalSearchOverlay');
        searchInput = document.getElementById('globalSearchInput');
        searchResults = document.getElementById('globalSearchResults');
        searchBtn = document.getElementById('globalSearchBtn');
        closeBtn = document.getElementById('searchCloseBtn');

        if (!searchBtn) return;

        isInitialized = true;

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openSearch();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeSearch();
            });
        }
        
        if (searchOverlay) {
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) closeSearch();
            });
        }

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape' && searchOverlay?.classList.contains('active')) {
                closeSearch();
            }
        });

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => performSearch(searchInput.value), 150);
            });
        }
    }

    function openSearch() {
        if (!searchOverlay) searchOverlay = document.getElementById('globalSearchOverlay');
        if (!searchInput) searchInput = document.getElementById('globalSearchInput');
        if (!searchResults) searchResults = document.getElementById('globalSearchResults');
        
        if (searchOverlay) {
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => searchInput?.focus(), 100);
            
            if (!categoriesCache || !authorsCache || !tagsCache) {
                preloadData();
            }
        }
    }

    function closeSearch() {
        if (searchOverlay) searchOverlay.classList.remove('active');
        if (searchInput) searchInput.value = '';
        if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('has-results');
        }
        document.body.style.overflow = '';
    }

    async function preloadData() {
        if (!window.apiFetch) return;

        try {
            const [catRes, authRes, tagRes] = await Promise.all([
                window.apiFetch('/api/categories'),
                window.apiFetch('/api/stats'),
                window.apiFetch('/api/tags')
            ]);

            if (catRes.ok) categoriesCache = await catRes.json();
            if (authRes.ok) {
                const data = await authRes.json();
                authorsCache = data.authors || [];
            }
            if (tagRes.ok) {
                const data = await tagRes.json();
                tagsCache = data.tags || [];
            }
        } catch (e) {
            console.warn('[Search] Failed to preload:', e);
        }
    }

    function performSearch(query) {
        if (!searchResults) searchResults = document.getElementById('globalSearchResults');
        
        if (!query || query.length < 1) {
            if (searchResults) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('has-results');
            }
            return;
        }

        const q = query.toLowerCase();
        let html = '';

        // 1. Search categories (parent + children)
        if (categoriesCache) {
            const matches = [];
            for (const [parent, data] of Object.entries(categoriesCache)) {
                if (parent.toLowerCase().includes(q)) {
                    matches.push({ name: parent, count: data.count, type: 'parent' });
                }
                if (data.children) {
                    for (const [child, count] of Object.entries(data.children)) {
                        if (child.toLowerCase().includes(q)) {
                            matches.push({ name: child, count, parent, type: 'child' });
                        }
                    }
                }
            }

            if (matches.length > 0) {
                html += '<div class="search-result-group"><div class="search-result-group-title">分类</div>';
                matches.slice(0, 5).forEach(cat => {
                    const safeName = cat.name.replace(/'/g, "\\'");
                    const subtitle = cat.type === 'child' ? cat.parent + ' › ' + cat.count + ' tweets' : cat.count + ' tweets';
                    html += '<div class="search-result-item" onclick="window.globalSearch.selectCategory(\'' + safeName + '\')">';
                    html += '<div class="result-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></div>';
                    html += '<div class="result-content"><div class="result-title">' + escapeHtml(cat.name) + '</div>';
                    html += '<div class="result-subtitle">' + subtitle + '</div></div></div>';
                });
                html += '</div>';
            }
        }

        // 2. Search tags
        if (tagsCache && tagsCache.length > 0) {
            const matches = tagsCache.filter(t => t.name && t.name.toLowerCase().includes(q));

            if (matches.length > 0) {
                html += '<div class="search-result-group"><div class="search-result-group-title">标签</div>';
                matches.slice(0, 5).forEach(tag => {
                    const safeName = tag.name.replace(/'/g, "\\'");
                    html += '<div class="search-result-item" onclick="window.globalSearch.selectTag(\'' + safeName + '\')">';
                    html += '<div class="result-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg></div>';
                    html += '<div class="result-content"><div class="result-title">' + escapeHtml(tag.name) + '</div>';
                    html += '<div class="result-subtitle">' + tag.count + ' tweets</div></div></div>';
                });
                html += '</div>';
            }
        }

        // 3. Search authors
        if (authorsCache && authorsCache.length > 0) {
            const matches = authorsCache.filter(a => a.name && a.name.toLowerCase().includes(q));

            if (matches.length > 0) {
                html += '<div class="search-result-group"><div class="search-result-group-title">作者</div>';
                matches.slice(0, 5).forEach(author => {
                    const safeName = author.name.replace(/'/g, "\\'");
                    html += '<div class="search-result-item" onclick="window.globalSearch.selectAuthor(\'' + safeName + '\')">';
                    html += '<div class="result-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                    html += '<div class="result-content"><div class="result-title">@' + escapeHtml(author.name) + '</div>';
                    html += '<div class="result-subtitle">' + author.count + ' tweets</div></div></div>';
                });
                html += '</div>';
            }
        }

        if (!html) {
            html = '<div class="search-no-results">没有找到 "' + escapeHtml(query) + '" 相关结果</div>';
        }

        searchResults.innerHTML = html;
        searchResults.classList.add('has-results');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    window.globalSearch = {
        open: openSearch,
        close: closeSearch,
        selectCategory: (cat) => {
            closeSearch();
            if (window.selectCategory) window.selectCategory(cat);
        },
        selectTag: (tag) => {
            closeSearch();
            if (window.selectTag) window.selectTag(tag);
        },
        selectAuthor: (author) => {
            closeSearch();
            if (window.selectAuthor) window.selectAuthor(author);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
