/**
 * Blog List Component - Complete implementation with sorting, filtering, search, and caching
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

    // Caching
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // Current filters
    this.currentSort = "";
    this.currentFilter = "";
    this.currentSearch = "";

    // Bind handlers
    this.onSortChange = this.onSortChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onSearchInput = this.onSearchInput.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
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
    const cacheKey = this.apiUrl;
    const cached = this.cache.get(cacheKey);

    // Check cache validity
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.items = cached.data;
      this.filteredItems = [...cached.data];
      return;
    }

    // Fetch with retry logic
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch(this.apiUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response format");
        }

        // Cache the data
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
        });

        this.items = data;
        this.filteredItems = [...data];
        return;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw new Error(
            `Failed to fetch blogs after ${maxRetries} attempts: ${error.message}`
          );
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retries) * 1000)
        );
      }
    }
  }

  setupEventListeners() {
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", this.onSortChange);
    }

    if (this.filterSelect) {
      this.filterSelect.addEventListener("change", this.onFilterChange);
    }

    if (this.searchInput) {
      let searchTimeout;
      this.searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.onSearchInput(e), 300);
      });
    }

    // Infinite scroll
    window.addEventListener("scroll", this.handleScroll);
  }

  render() {
    if (!this.listContainer) return;

    const start = 0;
    const end = this.page * this.perPage;
    const slice = this.filteredItems.slice(start, end);

    if (slice.length === 0) {
      this.listContainer.innerHTML =
        '<p class="no-results">No blogs found matching your criteria.</p>';
      return;
    }

    this.listContainer.innerHTML = slice
      .map((item) => this.renderBlogItem(item))
      .join("");
  }

  renderBlogItem(item) {
    const publishedDate = this.formatDate(item.published_date);
    const readingTime = this.formatReadingTime(item.reading_time);
    const tags = this.renderTags(item.tags || []);
    const excerpt = this.truncateText(item.content || "", 150);

    return `
            <article class="blog-item" role="article">
                <img src="${this.sanitizeImageUrl(item.image)}" 
                     alt="${this.escapeHtml(item.title)}" 
                     class="blog-image"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNmMGYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk1YTVhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='" />
                <div class="blog-content">
                    <h3 class="blog-title">${this.escapeHtml(item.title)}</h3>
                    <div class="blog-meta">
                        <span class="blog-author">By ${this.escapeHtml(
                          item.author || "Unknown"
                        )}</span>
                        <time class="blog-date" datetime="${
                          item.published_date
                        }">${publishedDate}</time>
                        <span class="blog-reading-time">${readingTime}</span>
                    </div>
                    <p class="blog-excerpt">${this.escapeHtml(excerpt)}</p>
                    <div class="blog-tags" role="list">${tags}</div>
                </div>
            </article>
        `;
  }

  renderTags(tags) {
    return tags
      .slice(0, 5)
      .map(
        (tag) =>
          `<span class="tag" role="listitem">${this.escapeHtml(tag)}</span>`
      )
      .join("");
  }

  // Sorting implementation
  onSortChange(e) {
    const sortBy = e.target.value;
    this.currentSort = sortBy;

    if (!sortBy) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems.sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(b.published_date) - new Date(a.published_date);
          case "reading_time":
            return (
              this.parseReadingTime(a.reading_time) -
              this.parseReadingTime(b.reading_time)
            );
          case "category":
            const categoryA = (a.category || "").toLowerCase();
            const categoryB = (b.category || "").toLowerCase();
            return categoryA.localeCompare(categoryB);
          default:
            return 0;
        }
      });
    }

    this.applyFilters();
    this.page = 1;
    this.render();
    this.announceChange(`Blogs sorted by ${sortBy || "default order"}`);
  }

  // Filtering implementation
  onFilterChange(e) {
    const filterValue = e.target.value;
    this.currentFilter = filterValue;

    this.applyFilters();
    this.page = 1;
    this.render();
    this.announceChange(`Blogs filtered by ${filterValue || "all categories"}`);
  }

  // Search implementation
  onSearchInput(e) {
    const query = (e.target.value || "").trim().toLowerCase();
    this.currentSearch = query;

    this.applyFilters();
    this.page = 1;
    this.render();
    this.announceChange(`Search results for "${query}"`);
  }

  applyFilters() {
    let filtered = [...this.items];

    // Apply category filter
    if (this.currentFilter) {
      filtered = filtered.filter((item) => {
        const category = (item.category || "").toLowerCase();
        const tags = (item.tags || []).map((tag) => tag.toLowerCase());
        const filterLower = this.currentFilter.toLowerCase();

        return category === filterLower || tags.includes(filterLower);
      });
    }

    // Apply search filter
    if (this.currentSearch) {
      filtered = filtered.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const content = (item.content || "").toLowerCase();
        const author = (item.author || "").toLowerCase();

        return (
          title.includes(this.currentSearch) ||
          content.includes(this.currentSearch) ||
          author.includes(this.currentSearch)
        );
      });
    }

    // Apply sorting
    if (this.currentSort) {
      filtered.sort((a, b) => {
        switch (this.currentSort) {
          case "date":
            return new Date(b.published_date) - new Date(a.published_date);
          case "reading_time":
            return (
              this.parseReadingTime(a.reading_time) -
              this.parseReadingTime(b.reading_time)
            );
          case "category":
            const categoryA = (a.category || "").toLowerCase();
            const categoryB = (b.category || "").toLowerCase();
            return categoryA.localeCompare(categoryB);
          default:
            return 0;
        }
      });
    }

    this.filteredItems = filtered;
  }

  // Infinite scroll handler
  handleScroll() {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 1000
    ) {
      this.loadMore();
    }
  }

  loadMore() {
    const currentShown = this.page * this.perPage;
    if (currentShown < this.filteredItems.length) {
      this.page++;
      this.render();
    }
  }

  // Utility methods
  parseReadingTime(readingTime) {
    if (!readingTime) return 0;
    const match = readingTime.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }

  formatReadingTime(readingTime) {
    if (!readingTime) return "Unknown";
    return readingTime.toString().includes("min")
      ? readingTime
      : `${readingTime} min read`;
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }

  sanitizeImageUrl(url) {
    if (!url || typeof url !== "string") return "";
    try {
      new URL(url);
      return url;
    } catch {
      return "";
    }
  }

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  announceChange(message) {
    // Screen reader announcement
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Loading and error states
  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.remove("hidden");
    }
  }

  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add("hidden");
    }
  }

  showError(err) {
    if (!this.errorContainer) return;
    this.errorContainer.classList.remove("hidden");
    this.errorContainer.textContent = `Error: ${err.message}`;
    this.errorContainer.setAttribute("role", "alert");
  }

  hideError() {
    if (this.errorContainer) {
      this.errorContainer.classList.add("hidden");
    }
  }

  // Cleanup method
  destroy() {
    if (this.sortSelect) {
      this.sortSelect.removeEventListener("change", this.onSortChange);
    }
    if (this.filterSelect) {
      this.filterSelect.removeEventListener("change", this.onFilterChange);
    }
    if (this.searchInput) {
      this.searchInput.removeEventListener("input", this.onSearchInput);
    }
    window.removeEventListener("scroll", this.handleScroll);

    this.cache.clear();
  }
}
