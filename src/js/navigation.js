/**
 * Navigation Component
 * Implements sticky header, smooth scrolling, dynamic highlighting (Intersection Observer),
 * and mobile responsiveness with accessibility features.
 * @exports Navigation
 */
export class Navigation {
    /**
     * @param {HTMLElement} header - The main <header> element.
     */
    constructor(header) {
        this.header = header;
        this.navToggle = header.querySelector('.nav-toggle');
        this.navList = header.querySelector('#nav-list');
        this.navLinks = header.querySelectorAll('.nav-link');
        // Select all sections that have an ID (the scroll targets)
        this.sections = document.querySelectorAll('main section[id]');

        this.setupMobileToggle();
        if (this.sections.length > 0) {
            this.setupScrollAndHighlighting();
        }
    }

    /** Sets up mobile menu toggle and accessibility */
    setupMobileToggle() {
        if (this.navToggle && this.navList) {
            this.navToggle.addEventListener('click', () => {
                const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
                this.navList.classList.toggle('is-open');
                this.navToggle.setAttribute('aria-expanded', !isExpanded);
            });

            // Close menu when a link is clicked
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.navList.classList.contains('is-open')) {
                        this.navList.classList.remove('is-open');
                        this.navToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
    }

    /** Sets up smooth scrolling and calls the observer setup */
    setupScrollAndHighlighting() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetElement = document.querySelector(link.getAttribute('href'));

                if (targetElement) {
                    // Smooth Scroll: Adjust scroll position by the height of the sticky header
                    window.scrollTo({
                        top: targetElement.offsetTop - this.header.offsetHeight,
                        behavior: 'smooth'
                    });

                    // Accessibility: Return focus to the section after scroll
                    targetElement.focus({ preventScroll: true });
                }
            });
        });
        this.setupIntersectionObserver();
    }

    /** Sets up the Intersection Observer for dynamic link highlighting */
    setupIntersectionObserver() {
        // rootMargin is CRITICAL: it creates an offset equal to the sticky header height
        // so the section highlights when it hits the bottom edge of the header.
        const observerOptions = {
            root: null,
            rootMargin: `-${this.header.offsetHeight + 1}px 0px 0px 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            let activeId = null;
            // Iterate in reverse to prioritize sections higher up the viewport
            for (let i = entries.length - 1; i >= 0; i--) {
                const entry = entries[i];
                if (entry.isIntersecting) {
                    activeId = `#${entry.target.id}`;
                    break;
                }
            }

            // Apply 'active' class and ARIA attributes
            this.navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === activeId;
                link.classList.toggle('active', isActive);
                link.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        }, observerOptions);

        this.sections.forEach(section => observer.observe(section));
    }
}