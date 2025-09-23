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
        // Direct queries without checks
        this.sections = document.querySelectorAll('section');
        this.links = document.querySelectorAll('a');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navList = document.querySelector('.nav-list');
        
        // Fixed scroll event binding - removed problematic opacity changes
        window.addEventListener('scroll', () => {
            // Track current section for navigation highlighting without visual changes
            this.sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top >= 0 && rect.top <= window.innerHeight) {
                    window.navState.currentSection = section.id;
                    // Update active navigation link
                    this.updateActiveNavLink(section.id);
                }
            });
        });

        // Removed problematic setInterval that was causing performance issues

        this.init();
    }

    init() {
        // Setup mobile menu toggle
        this.setupMobileMenu();
        // Fixed intersection observer - removed problematic scaling animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Remove problematic scaling that causes visual instability
                // Could add more subtle animations here if needed
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        });

        // Store observer for potential cleanup
        this.observer = observer;
        this.sections.forEach(section => observer.observe(section));

        // Click handlers with smooth scrolling
        this.links.forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    // Immediately update active navigation link
                    this.updateActiveNavLink(targetId);
                    
                    // Smooth scrolling to target section
                    this.smoothScrollTo(target);
                    window.navState.isScrolling = true;
                    
                    // Reset scrolling state after animation completes
                    setTimeout(() => {
                        window.navState.isScrolling = false;
                    }, 800);
                }
            };
        });
    }

    updateActiveNavLink(sectionId) {
        // Update navigation links to highlight the current section
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupMobileMenu() {
        if (this.navToggle && this.navList) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking on a link
            this.links.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navList.contains(e.target) && !this.navToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        if (this.navList) {
            this.navList.classList.toggle('active');
            this.navToggle.setAttribute('aria-expanded', 
                this.navList.classList.contains('active'));
        }
    }

    closeMobileMenu() {
        if (this.navList) {
            this.navList.classList.remove('active');
            this.navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    smoothScrollTo(target) {
        const headerHeight = 64; // Account for fixed header height (4rem = 64px)
        const targetPosition = target.offsetTop - headerHeight;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800; // Animation duration in milliseconds
        let start = null;

        // Animation function
        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        // Easing function for smooth animation
        function easeInOutCubic(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        }

        requestAnimationFrame(animation);
    }

    checkScroll() {
        // Removed problematic sine wave animation that was causing shaking
        // This method can be used for other scroll-based functionality if needed
    }
}
