export class Navigation {
    constructor() {
        this.links = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('main section');
        this.navHeight = document.querySelector('.nav').offsetHeight;

        this.bindEvents();
        this.handleScroll();
        window.addEventListener('scroll', () => this.handleScroll());
    }

    bindEvents() {
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
            });
        });
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
