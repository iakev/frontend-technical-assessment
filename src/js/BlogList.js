/**
 * Blog List Component (partial implementation)
 * Candidates must complete: sorting, filtering, search, robust error handling, and caching.
 */
export class BlogList {
  constructor(container) {
    this.container = container;
    this.listContainer = container.querySelector(".blog-list-content");
    this.loadingIndicator = container.querySelector(".loading-indicator");
    this.errorContainer = container.querySelector(".error-container");

    this.sortSelect = container.querySelector(".sort-select");
    this.filterSelect = container.querySelector(".filter-select");
    this.searchInput = container.querySelector(".search-input");

    this.apiUrl = "https://frontend-blog-lyart.vercel.app/blogsData.json";
    this.items = [];
    this.filteredItems = [];
    this.page = 1;
    this.perPage = 10;

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
      this.render();
    } catch (err) {
      this.showError(err);
    } finally {
      this.hideLoading();
    }
  }

  async fetchData() {
    const cacheKey = "blogListCache";
    const cacheTTL = 5 * 60 * 1000; // 5 minutes

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheTTL && Array.isArray(data)) {
          this.items = data;
          this.filteredItems = [...data];
          return;
        }
      } catch (e) {
        // Ignore cache parse errors, proceed to fetch
      }
    }

    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    while (attempts < maxAttempts) {
      try {
        const res = await fetch(this.apiUrl);
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected API response");
        this.items = data;
        this.filteredItems = [...data];
        // Save to cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data, timestamp: Date.now() })
        );
        return;
      } catch (err) {
        lastError = err;
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
        }
      }
    }
    throw lastError || new Error("Failed to fetch blogs after retries");
  }

  setupEventListeners() {
    this.sortSelect?.addEventListener("change", this.onSortChange);
    this.filterSelect?.addEventListener("change", this.onFilterChange);
    let t;
    this.searchInput?.addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => this.onSearchInput(e), 250);
    });
  }

  render() {
    const end = this.page * this.perPage;
    const slice = this.filteredItems.slice(0, end);
    this.listContainer.innerHTML = slice
      .map(
        (item) => `
            <article class=\"blog-item\">\n                <img src=\"${
              item.image
            }\" alt=\"\" class=\"blog-image\" />\n                <div class=\"blog-content\">\n                    <h3 class=\"blog-title\">${
          item.title
        }</h3>\n                    <div class=\"blog-meta\">\n                        <span class=\"blog-author\">${
          item.author
        }</span>\n                        <time class=\"blog-date\">${new Date(
          item.published_date
        ).toLocaleDateString()}</time>\n                        <span class=\"blog-reading-time\">${
          item.reading_time
        }</span>\n                    </div>\n                    <p class=\"blog-excerpt\">${
          item.content
        }</p>\n                    <div class=\"blog-tags\">${(item.tags || [])
          .map((t) => `<span class=\"tag\">${t}</span>`)
          .join("")}</div>\n                </div>\n            </article>
        `
      )
      .join("");

    if (slice.length === 0) {
      this.listContainer.innerHTML = '<p class="no-results">No blogs found</p>';
    }
  }

  onSortChange(e) {
    const by = e.target.value;
    if (!by) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = [...this.filteredItems].sort((a, b) => {
        if (by === "date") {
          return new Date(b.published_date) - new Date(a.published_date);
        }
        if (by === "reading_time") {
          const getMinutes = (val) => {
            if (typeof val === "number") return val;
            const m = String(val).match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
          };
          return getMinutes(a.reading_time) - getMinutes(b.reading_time);
        }
        if (by === "category") {
          return (a.category || "").localeCompare(b.category || "");
        }
        return 0;
      });
    }
    this.page = 1;
    this.render();
  }

  onFilterChange(e) {
    const val = e.target.value;
    if (!val) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(
        (item) =>
          (item.category && item.category === val) ||
          (Array.isArray(item.tags) && item.tags.includes(val))
      );
    }
    this.page = 1;
    this.render();
  }

  onSearchInput(e) {
    const q = (e.target.value || "").toLowerCase();
    if (!q) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(
        (item) => item.title && item.title.toLowerCase().includes(q)
      );
    }
    this.page = 1;
    this.render();
  }

  showLoading() {
    this.loadingIndicator?.classList.remove("hidden");
  }
  hideLoading() {
    this.loadingIndicator?.classList.add("hidden");
  }
  showError(err) {
    if (!this.errorContainer) return;
    this.errorContainer.classList.remove("hidden");
    this.errorContainer.textContent = `Error: ${err.message}`;
  }
}
