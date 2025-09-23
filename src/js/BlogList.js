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
        this.isLoading = false;

        // Bind handlers to the class instance
        this.onSortChange = this.onSortChange.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onSearchInput = this.onSearchInput.bind(this);
    }

    async init() {
        if (this.isLoading) return;
        this.isLoading = true;
        try {
            this.showLoading();
            await this.fetchData();
            this.setupEventListeners();
            this.render();
        } catch (err) {
            this.showError(err);
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }

    async fetchData() {
        if (this.items.length > 0) {
            return; // Data is already cached in memory
        }

        const res = await fetch(this.apiUrl);
        if (!res.ok) {
            throw new Error(`Failed to fetch blogs: ${res.statusText}`);
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
            throw new Error('Unexpected API response format. Expected an array.');
        }

        this.items = data;
        this.filteredItems = [...data]; // Initialize filteredItems with all blogs
    }

    setupEventListeners() {
        this.sortSelect?.addEventListener('change', this.onSortChange);
        this.filterSelect?.addEventListener('change', this.onFilterChange);

        // Debounce the search input to prevent excessive renders
        let searchTimeout;
        this.searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.onSearchInput(e), 250);
        });
    }

    render() {
        const blogsToRender = this.filteredItems.slice(0, this.perPage);

        if (blogsToRender.length === 0 && this.items.length > 0) {
            this.listContainer.innerHTML = '<p class="no-results">No blogs match your criteria.</p>';
            return;
        } else if (this.items.length === 0) {
            this.listContainer.innerHTML = ''; // Clear content if no blogs are fetched
            return;
        }

        this.listContainer.innerHTML = blogsToRender.map(item => `
            <article class="blog-item">
                <img src="${item.image}" alt="" class="blog-image" />
                <div class="blog-content">
                    <h3 class="blog-title">${item.title}</h3>
                    <div class="blog-meta">
                        <span class="blog-author">${item.author}</span>
                        <time class="blog-date">${new Date(item.published_date).toLocaleDateString('en-US')}</time>
                        <span class="blog-reading-time">${item.reading_time}</span>
                    </div>
                    <p class="blog-excerpt">${item.content}</p>
                    <div class="blog-tags">
                        ${(item.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');
    }

    onSortChange(e) {
        const by = e.target.value;
        if (by === 'date') {
            this.filteredItems.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));
        } else if (by === 'reading_time') {
            this.filteredItems.sort((a, b) => {
                const timeA = parseInt(a.reading_time);
                const timeB = parseInt(b.reading_time);
                return timeA - timeB;
            });
        } else if (by === 'category') {
            this.filteredItems.sort((a, b) => {
                const categoryA = (a.tags && a.tags.length > 0) ? a.tags[0] : '';
                const categoryB = (b.tags && b.tags.length > 0) ? b.tags[0] : '';
                return categoryA.localeCompare(categoryB);
            });
        }
        this.page = 1;
        this.render();
    }

    onFilterChange(e) {
        const val = e.target.value;
        this.filteredItems = this.items.filter(item => {
            if (!val) {
                return true;
            }
            return item.tags && item.tags.includes(val);
        });
        this.page = 1;
        this.render();
    }

    onSearchInput(e) {
        const q = (e.target.value || '').toLowerCase();
        this.filteredItems = this.items.filter(item => {
            return item.title.toLowerCase().includes(q);
        });
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
        this.listContainer.innerHTML = '';
    }
}