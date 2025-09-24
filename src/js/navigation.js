export class Navigation {
  constructor() {
    this.navLinks = [];
    this.sections = [];
    this.navToggle = null;
    this.navMenu = null;
    this.activeSection = null;
    this.isScrolling = false;
    this.observer = null;

    this.boundHandlers = {
      handleClick: this.handleNavClick.bind(this),
      handleToggle: this.handleToggleClick.bind(this),
      handleKeyDown: this.handleKeyDown.bind(this),
      handleResize: this.debounce(this.handleResize.bind(this), 250),
      handleScroll: this.throttle(this.updateActiveSection.bind(this), 100),
    };
  }

  init() {
    try {
      this.cacheElements();
      this.setupEventListeners();
      this.setupIntersectionObserver();
      this.updateActiveSection();
      this.setupKeyboardNavigation();
    } catch (error) {
      console.error("Error initializing Navigation:", error);
    }
  }

  cacheElements() {
    this.navLinks = Array.from(document.querySelectorAll(".nav-link"));
    this.sections = Array.from(document.querySelectorAll(".content-section"));
    this.navToggle = document.querySelector(".nav-toggle");
    this.navMenu = document.querySelector(".nav-menu");

    if (!this.navLinks.length) {
      throw new Error("No nav links found");
    }
    // sections can be empty safely
  }

  setupEventListeners() {
    // Navigation link clicks
    this.navLinks.forEach((link) => {
      link.addEventListener("click", this.boundHandlers.handleClick);
      link.addEventListener("keydown", this.boundHandlers.handleKeyDown);
    });

    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener("click", this.boundHandlers.handleToggle);
      this.navToggle.addEventListener(
        "keydown",
        this.boundHandlers.handleKeyDown
      );
    }

    // Window events
    window.addEventListener("resize", this.boundHandlers.handleResize);
    window.addEventListener("scroll", this.boundHandlers.handleScroll, {
      passive: true,
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.navMenu &&
        this.navMenu.classList.contains("active") &&
        !this.navMenu.contains(e.target) &&
        !this.navToggle.contains(e.target)
      ) {
        this.closeMobileMenu();
      }
    });
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.setActiveSection(entry.target.id);
        }
      });
    }, options);

    this.sections.forEach((section) => {
      this.observer.observe(section);
    });
  }

  handleNavClick(e) {
    e.preventDefault();

    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const targetId = href.substring(1);
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
      console.warn(`Section with id "${targetId}" not found`);
      return;
    }

    this.smoothScrollToSection(targetSection);
    this.setActiveSection(targetId);
    this.closeMobileMenu();

    // Update URL without triggering scroll
    if (history.pushState) {
      history.pushState(null, null, href);
    }
  }

  smoothScrollToSection(section) {
    this.isScrolling = true;

    const headerHeight = document.querySelector(".main-nav")?.offsetHeight || 0;
    const targetPosition = section.offsetTop - headerHeight - 20;

    // Use modern smooth scroll API if available
    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        this.isScrolling = false;
      }, 1000);
    } else {
      // Fallback for older browsers
      this.smoothScrollFallback(targetPosition);
    }
  }

  smoothScrollFallback(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.easeInOutQuad(
        timeElapsed,
        startPosition,
        distance,
        duration
      );

      window.scrollTo(0, run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        this.isScrolling = false;
      }
    };

    requestAnimationFrame(animation);
  }

  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  setActiveSection(sectionId) {
    if (this.isScrolling) return;

    this.activeSection = sectionId;

    this.navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === `#${sectionId}`;

      link.classList.toggle("active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  updateActiveSection() {
    if (this.isScrolling) return;

    const scrollPosition = window.pageYOffset;
    const headerHeight = document.querySelector(".main-nav")?.offsetHeight || 0;

    let activeSection = null;

    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop - headerHeight - 50;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        activeSection = section.id;
      }
    });

    if (activeSection && activeSection !== this.activeSection) {
      this.setActiveSection(activeSection);
    }
  }

  handleToggleClick(e) {
    e.preventDefault();
    this.toggleMobileMenu();
  }

  toggleMobileMenu() {
    if (!this.navMenu || !this.navToggle) return;

    const isActive = this.navMenu.classList.toggle("active");
    this.navToggle.classList.toggle("active", isActive);

    // Update ARIA attributes
    this.navToggle.setAttribute("aria-expanded", isActive.toString());

    // Manage focus
    if (isActive) {
      this.trapFocusInMenu();
    } else {
      this.releaseFocusTrap();
    }

    // Prevent body scroll when menu is open
    document.body.style.overflow = isActive ? "hidden" : "";
  }

  closeMobileMenu() {
    if (!this.navMenu || !this.navToggle) return;

    this.navMenu.classList.remove("active");
    this.navToggle.classList.remove("active");
    this.navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    this.releaseFocusTrap();
  }

  setupKeyboardNavigation() {
    // Make navigation keyboard accessible
    this.navLinks.forEach((link, index) => {
      link.setAttribute("tabindex", "0");
      link.setAttribute("role", "menuitem");
    });

    if (this.navMenu) {
      this.navMenu.setAttribute("role", "menu");
    }
  }

  handleKeyDown(e) {
    // Handle Escape key to close mobile menu
    if (e.key === "Escape" && this.navMenu?.classList.contains("active")) {
      this.closeMobileMenu();
      this.navToggle?.focus();
      return;
    }

    // Handle Enter/Space for navigation toggle
    if ((e.key === "Enter" || e.key === " ") && e.target === this.navToggle) {
      e.preventDefault();
      this.toggleMobileMenu();
      return;
    }

    // Arrow key navigation in menu
    if (this.navMenu?.classList.contains("active")) {
      this.handleArrowNavigation(e);
    }
  }

  handleArrowNavigation(e) {
    const focusableLinks = this.navLinks.filter(
      (link) => link.offsetParent !== null
    );
    const currentIndex = focusableLinks.indexOf(document.activeElement);

    let nextIndex;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : focusableLinks.length - 1;
        focusableLinks[nextIndex].focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        nextIndex =
          currentIndex < focusableLinks.length - 1 ? currentIndex + 1 : 0;
        focusableLinks[nextIndex].focus();
        break;
      case "Home":
        e.preventDefault();
        focusableLinks[0].focus();
        break;
      case "End":
        e.preventDefault();
        focusableLinks[focusableLinks.length - 1].focus();
        break;
    }
  }

  trapFocusInMenu() {
    const focusableElements = this.navMenu.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    this.focusTrapHandler = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", this.focusTrapHandler);
    firstElement.focus();
  }

  releaseFocusTrap() {
    if (this.focusTrapHandler) {
      document.removeEventListener("keydown", this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }

  handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && this.navMenu?.classList.contains("active")) {
      this.closeMobileMenu();
    }
  }

  // Utility functions
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Cleanup method
  destroy() {
    // Remove event listeners
    this.navLinks.forEach((link) => {
      link.removeEventListener("click", this.boundHandlers.handleClick);
      link.removeEventListener("keydown", this.boundHandlers.handleKeyDown);
    });

    if (this.navToggle) {
      this.navToggle.removeEventListener(
        "click",
        this.boundHandlers.handleToggle
      );
      this.navToggle.removeEventListener(
        "keydown",
        this.boundHandlers.handleKeyDown
      );
    }

    window.removeEventListener("resize", this.boundHandlers.handleResize);
    window.removeEventListener("scroll", this.boundHandlers.handleScroll);

    // Disconnect intersection observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Release focus trap
    this.releaseFocusTrap();

    // Reset body overflow
    document.body.style.overflow = "";
  }
}
