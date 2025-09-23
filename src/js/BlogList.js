// src/js/BlogList.js
export class BlogList {
    constructor(container) {
        this.container = container;
        this.listContainer = container.querySelector('.blog-list-content');
        this.loadingIndicator = container.querySelector('.loading-indicator');
        this.errorContainer = container.querySelector('.error-container');

        this.sortSelect = container.querySelector('.sort-select');
        this.filterSelect = container.querySelector('.filter-select');
        this.searchInput = container.querySelector('.search-input');

        this.apiUrl = 'https://frontend-blog-lyart.vercel.app/blogsData.json';
        this.items = [];
        this.filteredItems = [];
        this.perPage = 10;

        // handlers
        this.onSortChange = this.onSortChange.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onSearchInput = this.onSearchInput.bind(this);
    }

    async init() {
        try {
            this.showLoading();
            await this.fetchDataWithCache();
            this.setupEventListeners();
            this.applyFiltersAndRender();
        } catch (err) {
            this.showError(err);
        } finally {
            this.hideLoading();
        }
    }

    async fetchDataWithCache(retries = 2) {
        const cacheKey = 'blogs_cache_v1';
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.items = parsed;
                    return;
                }
            }
        } catch (_) {
            // ignore corrupt cache
            sessionStorage.removeItem(cacheKey);
        }

        // fetch with simple retry
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const res = await fetch(this.apiUrl, {cache: 'no-store'});
                if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error('Unexpected API response');
                this.items = data;
                // cache for session
                try { sessionStorage.setItem(cacheKey, JSON.stringify(this.items)); } catch (e) {}
                return;
            } catch (err) {
                if (attempt === retries) throw err;
                // small delay before retry
                await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
            }
        }
    }

    setupEventListeners() {
        this.sortSelect?.addEventListener('change', this.onSortChange);
        this.filterSelect?.addEventListener('change', this.onFilterChange);

        // debounce search
        let t = null;
        this.searchInput?.addEventListener('input', (e) => {
            clearTimeout(t);
            t = setTimeout(() => this.onSearchInput(e), 250);
        });
    }

    applyFiltersAndRender() {
        // Start from original items
        const searchQ = (this.searchInput?.value || '').trim().toLowerCase();
        const filterVal = (this.filterSelect?.value || '').trim();
        const sortVal = (this.sortSelect?.value || '').trim();

        let results = this.items.slice();

        // Filter by category (search tags & category fields if exist)
        if (filterVal) {
            results = results.filter(item => {
                const tags = (item.tags || []).map(t => t.toLowerCase());
                const cat = (item.category || '').toLowerCase();
                return tags.includes(filterVal.toLowerCase()) || cat === filterVal.toLowerCase();
            });
        }

        // Search by title (and optionally content)
        if (searchQ) {
            results = results.filter(item => {
                const title = (item.title || '').toLowerCase();
                const content = (item.content || '').toLowerCase();
                return title.includes(searchQ) || content.includes(searchQ);
            });
        }

        // Sort
        if (sortVal) {
            results.sort((a, b) => {
                if (sortVal === 'date') {
                    const da = new Date(a.published_date || a.date || 0).getTime();
                    const db = new Date(b.published_date || b.date || 0).getTime();
                    return db - da; // newest first
                }
                if (sortVal === 'reading_time') {
                    // reading_time may be "5 min" or number; extract number
                    const ra = parseInt(String(a.reading_time || '').replace(/\D/g, ''), 10) || 0;
                    const rb = parseInt(String(b.reading_time || '').replace(/\D/g, ''), 10) || 0;
                    return ra - rb; // shortest first
                }
                if (sortVal === 'category') {
                    const ca = ((a.tags && a.tags[0]) || a.category || '').toString().toLowerCase();
                    const cb = ((b.tags && b.tags[0]) || b.category || '').toString().toLowerCase();
                    return ca.localeCompare(cb);
                }
                return 0;
            });
        }

        this.filteredItems = results;
        this.render();
    }

    render() {
        // Ensure up to 10 items are shown
        const slice = this.filteredItems.slice(0, this.perPage);
        if (!slice || slice.length === 0) {
            this.listContainer.innerHTML = '<p class="no-results">No blogs found</p>';
            return;
        }

        this.listContainer.innerHTML = slice.map(item => {
            const img = item.image ? `<img src="${item.image}" alt="${this.escape(item.title)}" class="blog-image" />` : '';
            const title = this.escape(item.title || '');
            const author = this.escape(item.author || '');
            const date = item.published_date ? new Date(item.published_date).toLocaleDateString() : '';
            const reading = this.escape(item.reading_time || '');
            const excerpt = this.escape((item.content || '').slice(0, 140));
            const tags = (item.tags || []).map(t => `<span class="tag">${this.escape(t)}</span>`).join('');
            return `
                <article class="blog-item">
                    ${img}
                    <div class="blog-content">
                        <h3 class="blog-title">${title}</h3>
                        <div class="blog-meta">
                            <span class="blog-author">${author}</span>
                            <time class="blog-date">${date}</time>
                            <span class="blog-reading-time">${reading}</span>
                        </div>
                        <p class="blog-excerpt">${excerpt}</p>
                        <div class="blog-tags">${tags}</div>
                    </div>
                </article>
            `;
        }).join('');
    }

    // Handlers wired to selects/inputs
    onSortChange() {
        this.applyFiltersAndRender();
    }

    onFilterChange() {
        this.applyFiltersAndRender();
    }

    onSearchInput() {
        this.applyFiltersAndRender();
    }

    showLoading() {
        this.loadingIndicator?.classList.remove('hidden');
    }
    hideLoading() {
        this.loadingIndicator?.classList.add('hidden');
    }
    showError(err) {
        if (!this.errorContainer) return;
        this.errorContainer.classList.remove('hidden');
        this.errorContainer.textContent = `Error: ${err.message || err}`;
    }

    // small utility to sanitize text for insertion
    escape(str = '') {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}
