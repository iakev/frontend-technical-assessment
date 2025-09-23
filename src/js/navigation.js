export class Navigation {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.links = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('main section');
        this.navToggle = document.getElementById('nav-toggle');
        this.navList = document.getElementById('nav-list');
        this.navHeight = this.nav.offsetHeight;

        this.bindEvents();
        this.handleScroll();
        window.addEventListener('scroll', () => this.handleScroll());
    }

    bindEvents() {
        // Smooth scroll on link click
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                if (!target) return;

                const targetPosition = target.offsetTop - this.navHeight + 1;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close nav on mobile after click
                if (this.navList.classList.contains('open')) {
                    this.navToggle.classList.remove('active');
                    this.navList.classList.remove('open');
                }
            });
        });

        // Hamburger menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.navToggle.classList.toggle('active');
                this.navList.classList.toggle('open');
            });
        }
    }

    handleScroll() {
        const scrollPosition = window.scrollY + this.navHeight + 5;
        let currentSectionId = '';

        this.sections.forEach(section => {
            if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                currentSectionId = section.id;
            }
        });

        this.links.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
}
