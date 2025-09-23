/**
 * Blog List Component (partial implementation)
 * Candidates must complete: sorting, filtering, search, robust error handling, and caching.
 */
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
        this.page = 1;
        this.perPage = 10;

        // Current filter states
        this.currentSort = '';
        this.currentFilter = '';
        this.currentSearch = '';

        // Bind handlers
        this.onSortChange = this.onSortChange.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onSearchInput = this.onSearchInput.bind(this);
    }

    async init() {
        try {
            this.showLoading();
            await this.fetchData();
            this.setupEventListeners();
            this.applyFilters();
        } catch (err) {
            this.showError(err);
        } finally {
            this.hideLoading();
        }
    }

    async fetchData() {
        // TODO (candidate): add basic caching and retry logic
        const res = await fetch(this.apiUrl);
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Unexpected API response');
        this.items = data;
        this.filteredItems = [...data];
    }

    setupEventListeners() {
        this.sortSelect?.addEventListener('change', this.onSortChange);
        this.filterSelect?.addEventListener('change', this.onFilterChange);
        let t;
        this.searchInput?.addEventListener('input', (e) => {
            clearTimeout(t);
            t = setTimeout(() => this.onSearchInput(e), 250);
        });
    }

    render() {
        // Show filtered/sorted results, limiting to 10 items
        const slice = this.filteredItems.slice(0, 10);
        this.listContainer.innerHTML = slice.map(item => `
            <article class=\"blog-item\">\n                <img src=\"${item.image}\" alt=\"\" class=\"blog-image\" />\n                <div class=\"blog-content\">\n                    <h3 class=\"blog-title\">${item.title}</h3>\n                    <div class=\"blog-meta\">\n                        <span class=\"blog-author\">${item.author}</span>\n                        <time class=\"blog-date\">${new Date(item.published_date).toLocaleDateString()}</time>\n                        <span class=\"blog-reading-time\">${item.reading_time}</span>\n                    </div>\n                    <p class=\"blog-excerpt\">${item.content}</p>\n                    <div class=\"blog-tags\">${(item.tags || []).map(t => `<span class=\"tag\">${t}</span>`).join('')}</div>\n                </div>\n            </article>
        `).join('');

        if (slice.length === 0) {
            this.listContainer.innerHTML = '<p class="no-results">No blogs found</p>';
        }
    }

    // TODO (candidate): implement sorting
    onSortChange(e) {
        this.currentSort = e.target.value;
        this.applyFilters();
    }

    // TODO (candidate): implement filtering
    onFilterChange(e) {
        this.currentFilter = e.target.value;
        this.applyFilters();
    }

    // TODO (candidate): implement search by title
    onSearchInput(e) {
        this.currentSearch = e.target.value;
        this.applyFilters();
    }

    applyFilters() {
        // Start with all items
        let filtered = [...this.items];

        // Apply search filter
        if (this.currentSearch) {
            const searchTerm = this.currentSearch.toLowerCase();
            filtered = filtered.filter(item => {
                return item.title.toLowerCase().includes(searchTerm) ||
                       item.content.toLowerCase().includes(searchTerm) ||
                       item.author.toLowerCase().includes(searchTerm);
            });
        }

        // Apply category filter
        if (this.currentFilter) {
            filtered = filtered.filter(item => {
                return item.category === this.currentFilter || 
                       (item.tags && item.tags.includes(this.currentFilter)) ||
                       item.author === this.currentFilter;
            });
        }

        // Apply sorting
        if (this.currentSort) {
            filtered.sort((a, b) => {
                switch (this.currentSort) {
                    case 'date':
                        return new Date(b.published_date) - new Date(a.published_date);
                    case 'reading_time':
                        return parseInt(a.reading_time) - parseInt(b.reading_time);
                    case 'category':
                        return (a.category || '').localeCompare(b.category || '');
                    default:
                        return 0;
                }
            });
        }

        this.filteredItems = filtered;
        this.page = 1;
        this.render();
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
        this.errorContainer.textContent = `Error: ${err.message}`;
    }
}

