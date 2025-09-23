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
        this.links = document.querySelectorAll('.nav-link');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navList = document.querySelector('.nav-list');
        this.currentFocusIndex = 0;
        this.isMenuOpen = false;
        
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
        this.setupKeyboardNavigation();
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
                link.setAttribute('aria-current', 'true');
            } else {
                link.classList.remove('active');
                link.setAttribute('aria-current', 'false');
            }
        });
    }

    setupKeyboardNavigation() {
        // Add keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Add focus management for mobile menu
        this.navToggle.addEventListener('keydown', (e) => this.handleToggleKeyDown(e));
        
        // Add keyboard navigation for menu items
        this.links.forEach((link, index) => {
            link.addEventListener('keydown', (e) => this.handleLinkKeyDown(e, index));
        });
    }

    handleKeyDown(e) {
        // Handle Escape key to close mobile menu
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.closeMobileMenu();
            this.navToggle.focus();
        }
    }

    handleToggleKeyDown(e) {
        // Handle Enter and Space keys for toggle button
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleMobileMenu();
        }
    }

    handleLinkKeyDown(e, index) {
        const isMenuOpen = this.navList.classList.contains('active');
        
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                this.focusNextLink(index);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                this.focusPreviousLink(index);
                break;
            case 'Home':
                e.preventDefault();
                this.focusFirstLink();
                break;
            case 'End':
                e.preventDefault();
                this.focusLastLink();
                break;
            case 'Escape':
                if (isMenuOpen) {
                    e.preventDefault();
                    this.closeMobileMenu();
                    this.navToggle.focus();
                }
                break;
        }
    }

    focusNextLink(currentIndex) {
        const nextIndex = (currentIndex + 1) % this.links.length;
        this.links[nextIndex].focus();
        this.currentFocusIndex = nextIndex;
    }

    focusPreviousLink(currentIndex) {
        const prevIndex = currentIndex === 0 ? this.links.length - 1 : currentIndex - 1;
        this.links[prevIndex].focus();
        this.currentFocusIndex = prevIndex;
    }

    focusFirstLink() {
        this.links[0].focus();
        this.currentFocusIndex = 0;
    }

    focusLastLink() {
        const lastIndex = this.links.length - 1;
        this.links[lastIndex].focus();
        this.currentFocusIndex = lastIndex;
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
            this.isMenuOpen = !this.isMenuOpen;
            this.navList.classList.toggle('active');
            this.navToggle.setAttribute('aria-expanded', this.isMenuOpen.toString());
            
            // Announce menu state to screen readers
            this.announceToScreenReader(this.isMenuOpen ? 'Navigation menu opened' : 'Navigation menu closed');
            
            // Focus management
            if (this.isMenuOpen) {
                // Focus first menu item when opening
                setTimeout(() => {
                    this.links[0].focus();
                }, 100);
            }
        }
    }

    closeMobileMenu() {
        if (this.navList) {
            this.isMenuOpen = false;
            this.navList.classList.remove('active');
            this.navToggle.setAttribute('aria-expanded', 'false');
            this.announceToScreenReader('Navigation menu closed');
        }
    }

    announceToScreenReader(message) {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = message;
    }


    checkScroll() {
        // Removed problematic sine wave animation that was causing shaking
        // This method can be used for other scroll-based functionality if needed
    }
}
