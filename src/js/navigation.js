// Global state - bad practice that will conflict with proper implementation
window.navState = {
    currentSection: null,
    isScrolling: false
};

/**
 * Navigation implementation with several issues:
 * - Global state usage
 * - No cleanup
 * - Direct DOM manipulation
 * - Memory leaks
 */
export class Navigation {
    constructor() {
        this.sections = document.querySelectorAll("section");
        this.links = document.querySelectorAll(".nav-link");
        this.navToggle = document.querySelector(".nav-toggle");
        this.navList = document.querySelector(".nav-list");

        this.observer = null;

        this.init();
    }

    init() {
        // Mobile toggle
        if (this.navToggle) {
            this.navToggle.addEventListener("click", () => {
                this.navList.classList.toggle("show");
            });
        }

        // Smooth scroll on click
        this.links.forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const targetId = link.getAttribute("href").slice(1);
                const target = document.getElementById(targetId);

                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 60, // adjust for sticky header
                        behavior: "smooth"
                    });
                }

                // Close mobile menu
                this.navList.classList.remove("show");
            });
        });

        // IntersectionObserver for active link
        this.observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.links.forEach(link =>
                            link.classList.toggle(
                                "active",
                                link.getAttribute("href").slice(1) === entry.target.id
                            )
                        );
                    }
                });
            },
            { threshold: 0.6 } // section 60% visible = active
        );

        this.sections.forEach(section => this.observer.observe(section));
    }

    // Call when tearing down to avoid leaks
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.links.forEach(link => {
            link.replaceWith(link.cloneNode(true)); // remove listeners
        });
    }
}
