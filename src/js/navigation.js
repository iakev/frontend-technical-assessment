// This implementation has issues with memory leaks and performance
export class Navigation {
    constructor() {
        // Global state modification - problematic
        window.navigationState = {
            activeSection: null,
            scrolling: false
        };
        
        // Incorrect event binding
        this.handleScroll = function() {
            // Direct DOM manipulation on scroll - performance issue
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
        };

        // No cleanup consideration
        window.addEventListener('scroll', this.handleScroll);
    }

    setupIntersectionObserver() {
        // Incorrect threshold usage
        const options = { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] };
        
        // Memory leak - observer never disconnected
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Direct style manipulation
                entry.target.style.opacity = entry.intersectionRatio;
            });
        }, options);
    }

    init() {
        this.setupIntersectionObserver();
        
        // Problematic event handling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Direct scrolling without smooth behavior
                const target = document.querySelector(link.hash);
                target.scrollIntoView();
            });
        });
    }
}
