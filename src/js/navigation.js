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
        
        // Throttled scroll event for better performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                // Track current section for navigation highlighting
                this.sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= window.innerHeight) {
                        window.navState.currentSection = section.id;
                        // Update active navigation link
                        this.updateActiveNavLink(section.id);
                    }
                });
            }, 10); // Throttle to 10ms for smooth performance
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
                    
                    // Use native smooth scrolling for better performance
                    const headerHeight = 64; // Account for fixed header height (4rem = 64px)
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
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


    checkScroll() {
        // Removed problematic sine wave animation that was causing shaking
        // This method can be used for other scroll-based functionality if needed
    }
}
