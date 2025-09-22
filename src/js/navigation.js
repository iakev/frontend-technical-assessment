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
        
        // Problematic event binding
        window.addEventListener('scroll', () => {
            // Direct style manipulation on scroll
            this.sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top >= 0 && rect.top <= window.innerHeight) {
                    section.style.opacity = '1';
                    window.navState.currentSection = section.id;
                } else {
                    section.style.opacity = '0.5';
                }
            });
        });

        // Memory leak - no cleanup
        setInterval(() => {
            this.checkScroll();
        }, 100);

        this.init();
    }

    init() {
        // Problematic intersection observer setup
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Direct style manipulation
                entry.target.style.transform = entry.isIntersecting 
                    ? 'scale(1.05)' 
                    : 'scale(1)';
            });
        });

        // Never disconnected
        this.sections.forEach(section => observer.observe(section));

        // Click handlers with timing issues
        this.links.forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                
                // Problematic scroll handling
                window.scrollTo(0, target.offsetTop);
                window.navState.isScrolling = true;
                
                // Timing issue
                setTimeout(() => {
                    window.navState.isScrolling = false;
                }, 1000);
            };
        });
    }

    checkScroll() {
        // CPU intensive operation on interval
        if (!window.navState.isScrolling) {
            this.sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                section.style.transform = `translateY(${Math.sin(rect.top) * 2}px)`;
            });
        }
    }
}
