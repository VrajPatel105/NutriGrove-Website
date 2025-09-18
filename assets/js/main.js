// Main JavaScript for NutriGrove Website
// Modern ES6+ with performance optimizations

'use strict';

// Global configuration
const CONFIG = {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 150,
    TYPEWRITER_SPEED: 100,
    INTERSECTION_THRESHOLD: 0.1,
    SCROLL_THRESHOLD: 100,
    PARTICLE_COUNT: 50,
    BREAKPOINTS: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
    }
};

// Utility functions
const utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Get viewport dimensions
    getViewport() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    },

    // Check if element is in viewport
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const viewport = this.getViewport();

        return (
            rect.top < viewport.height * (1 + threshold) &&
            rect.bottom > viewport.height * -threshold &&
            rect.left < viewport.width * (1 + threshold) &&
            rect.right > viewport.width * -threshold
        );
    },

    // Smooth scroll to element
    smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const targetPosition = element.offsetTop - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Generate random number
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Create element with attributes
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    }
};

// Loading screen manager
class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.querySelector('.progress-bar');
        this.loadingText = document.querySelector('.loading-text');
        this.isLoaded = false;

        this.init();
    }

    init() {
        this.preloadCriticalResources();
        this.startLoadingAnimation();

        // Minimum loading time for UX
        const minLoadTime = 2000;
        const startTime = Date.now();

        window.addEventListener('load', () => {
            const loadTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadTime - loadTime);

            setTimeout(() => {
                this.hideLoadingScreen();
            }, remainingTime);
        });
    }

    preloadCriticalResources() {
        const criticalResources = [
            'assets/images/logo.svg',
            'assets/images/app-screenshot-1.jpg',
            'assets/videos/hero-bg.mp4'
        ];

        criticalResources.forEach(src => {
            if (src.endsWith('.mp4')) {
                const video = document.createElement('video');
                video.src = src;
                video.preload = 'metadata';
            } else {
                const img = new Image();
                img.src = src;
            }
        });
    }

    startLoadingAnimation() {
        // Animate progress bar
        if (this.progressBar) {
            this.progressBar.style.animation = 'loading-progress 3s ease-in-out infinite';
        }

        // Animate loading text letters
        const letters = this.loadingText?.querySelectorAll('.loading-letter');
        if (letters) {
            letters.forEach((letter, index) => {
                letter.style.animationDelay = `${index * 0.1}s`;
            });
        }
    }

    hideLoadingScreen() {
        if (!this.loadingScreen || this.isLoaded) return;

        this.isLoaded = true;
        this.loadingScreen.classList.add('fade-out');

        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            document.body.classList.remove('loading');

            // Trigger entrance animations
            this.triggerEntranceAnimations();
        }, 500);
    }

    triggerEntranceAnimations() {
        // Start particles animation
        if (window.particleSystem) {
            window.particleSystem.start();
        }

        // Start typewriter effect
        if (window.typewriterEffect) {
            setTimeout(() => {
                window.typewriterEffect.start();
            }, 500);
        }

        // Start counter animations
        setTimeout(() => {
            this.animateCounters();
        }, 1000);
    }

    animateCounters() {
        const counters = document.querySelectorAll('[data-target]');

        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            updateCounter();
        });
    }
}

// Navigation manager
class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileToggle = document.getElementById('mobile-menu-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.sections = document.querySelectorAll('section[id]');

        this.currentSection = 'home';
        this.isScrolling = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.handleScroll();
        this.updateActiveSection();
    }

    bindEvents() {
        // Scroll event with throttling
        window.addEventListener('scroll', utils.throttle(() => {
            this.handleScroll();
            this.updateActiveSection();
        }, 16));

        // Navigation link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);

                // Close mobile menu if open
                if (this.navMenu.classList.contains('active')) {
                    this.toggleMobileMenu();
                }
            });
        });

        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        });

        // Handle resize events
        window.addEventListener('resize', utils.debounce(() => {
            if (window.innerWidth > CONFIG.BREAKPOINTS.mobile && this.navMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        }, CONFIG.DEBOUNCE_DELAY));
    }

    handleScroll() {
        const scrollY = window.scrollY;

        // Update navbar appearance
        if (scrollY > CONFIG.SCROLL_THRESHOLD) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Show/hide back to top button
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            if (scrollY > CONFIG.SCROLL_THRESHOLD * 5) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    updateActiveSection() {
        if (this.isScrolling) return;

        const scrollY = window.scrollY + 100; // Offset for navbar height
        let currentSection = 'home';

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        if (currentSection !== this.currentSection) {
            this.setActiveSection(currentSection);
            this.currentSection = currentSection;
        }
    }

    setActiveSection(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        this.isScrolling = true;

        utils.smoothScrollTo(section, 80); // Offset for navbar

        setTimeout(() => {
            this.isScrolling = false;
            this.setActiveSection(sectionId);
            this.currentSection = sectionId;
        }, 1000);
    }

    toggleMobileMenu() {
        this.mobileToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (this.navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

// Particle system for background effects
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles-background');
        this.particles = [];
        this.isRunning = false;

        if (!this.container) return;

        this.init();
    }

    init() {
        this.createParticles();
        this.bindEvents();
    }

    createParticles() {
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const particle = this.createParticle();
            this.particles.push(particle);
            this.container.appendChild(particle.element);
        }
    }

    createParticle() {
        const element = document.createElement('div');
        element.className = 'particle';

        const size = utils.random(2, 6);
        const x = utils.random(0, 100);
        const y = utils.random(0, 100);
        const duration = utils.random(4, 8);
        const delay = utils.random(0, 4);

        element.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        return {
            element,
            x, y, size, duration, delay
        };
    }

    start() {
        this.isRunning = true;
        this.particles.forEach(particle => {
            particle.element.style.animationPlayState = 'running';
        });
    }

    stop() {
        this.isRunning = false;
        this.particles.forEach(particle => {
            particle.element.style.animationPlayState = 'paused';
        });
    }

    bindEvents() {
        // Pause particles when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else if (this.isRunning) {
                this.start();
            }
        });
    }
}

// Typewriter effect for hero title
class TypewriterEffect {
    constructor() {
        this.element = document.querySelector('.typewriter');
        this.texts = [];
        this.currentIndex = 0;
        this.isDeleting = false;
        this.currentText = '';
        this.typeSpeed = 100;
        this.deleteSpeed = 50;
        this.pauseTime = 2000;

        if (!this.element) return;

        this.init();
    }

    init() {
        const dataText = this.element.dataset.text;
        if (dataText) {
            this.texts = dataText.split(',');
            this.currentText = this.texts[0];
            this.element.textContent = this.currentText;
        }
    }

    start() {
        if (this.texts.length <= 1) return;

        this.type();
    }

    type() {
        const fullText = this.texts[this.currentIndex];

        if (this.isDeleting) {
            this.currentText = fullText.substring(0, this.currentText.length - 1);
        } else {
            this.currentText = fullText.substring(0, this.currentText.length + 1);
        }

        this.element.textContent = this.currentText;

        let typeSpeed = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

        if (!this.isDeleting && this.currentText === fullText) {
            typeSpeed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentText === '') {
            this.isDeleting = false;
            this.currentIndex = (this.currentIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Intersection Observer for animations
class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: CONFIG.INTERSECTION_THRESHOLD,
            rootMargin: '0px 0px -100px 0px'
        };

        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.observerOptions
        );

        this.init();
    }

    init() {
        // Elements to animate on scroll
        const animatedElements = document.querySelectorAll(`
            .fade-in-up,
            .timeline-item,
            .feature-card,
            .testimonial-card,
            .team-card,
            .stat-item
        `);

        animatedElements.forEach(element => {
            this.observer.observe(element);
        });

        // Special handling for timeline items
        this.initTimelineAnimations();
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                // Add visible class for CSS animations
                element.classList.add('visible');

                // Special animations for specific elements
                if (element.classList.contains('stat-item')) {
                    this.animateCounter(element);
                }

                if (element.classList.contains('feature-card')) {
                    this.animateFeatureCard(element);
                }

                // Stop observing once animated
                this.observer.unobserve(element);
            }
        });
    }

    initTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');

        timelineItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.2}s`;
        });
    }

    animateCounter(element) {
        const counter = element.querySelector('[data-target]');
        if (!counter) return;

        const target = parseInt(counter.dataset.target);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    }

    animateFeatureCard(element) {
        const icon = element.querySelector('.feature-icon');
        if (icon) {
            setTimeout(() => {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }, 300);
            }, 200);
        }
    }
}

// Theme manager for dark/light mode
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        if (this.themeToggle) {
            if (theme === 'dark') {
                this.themeToggle.classList.add('active');
            } else {
                this.themeToggle.classList.remove('active');
            }
        }

        this.currentTheme = theme;
    }
}

// Testimonial carousel
class TestimonialCarousel {
    constructor() {
        this.track = document.getElementById('testimonial-track');
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('testimonial-prev');
        this.nextBtn = document.getElementById('testimonial-next');

        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.isAutoplay = true;

        if (!this.track || this.cards.length === 0) return;

        this.init();
    }

    init() {
        this.bindEvents();
        this.showSlide(0);
        this.startAutoplay();
    }

    bindEvents() {
        // Previous button
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.previousSlide();
                this.pauseAutoplay();
            });
        }

        // Next button
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.pauseAutoplay();
            });
        }

        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.showSlide(index);
                this.pauseAutoplay();
            });
        });

        // Pause on hover
        this.track.addEventListener('mouseenter', () => {
            this.pauseAutoplay();
        });

        this.track.addEventListener('mouseleave', () => {
            if (this.isAutoplay) {
                this.startAutoplay();
            }
        });

        // Touch/swipe support
        this.addTouchSupport();
    }

    showSlide(index) {
        // Hide all cards
        this.cards.forEach(card => {
            card.classList.remove('active');
        });

        // Update dots
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show current card
        if (this.cards[index]) {
            this.cards[index].classList.add('active');
        }

        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }

        this.currentIndex = index;
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.cards.length;
        this.showSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.showSlide(prevIndex);
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    addTouchSupport() {
        let startX = 0;
        let endX = 0;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
                this.pauseAutoplay();
            }
        });
    }
}

// Demo interaction manager
class DemoManager {
    constructor() {
        this.demoInterface = document.getElementById('demo-interface');
        this.hotspots = document.querySelectorAll('.demo-hotspot');
        this.screens = document.querySelectorAll('.demo-screen');
        this.startDemoBtn = document.getElementById('start-demo');

        this.currentScreen = 'home';
        this.demoSequence = ['home', 'scan', 'results'];
        this.currentStep = 0;
        this.isPlaying = false;

        if (!this.demoInterface) return;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Start demo button
        if (this.startDemoBtn) {
            this.startDemoBtn.addEventListener('click', () => {
                this.startDemo();
            });
        }

        // Hotspot interactions
        this.hotspots.forEach(hotspot => {
            hotspot.addEventListener('click', () => {
                const targetScreen = hotspot.dataset.hotspot;
                this.showScreen(targetScreen);
            });
        });

        // Auto-play demo when in viewport
        if (this.demoInterface && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isPlaying) {
                        setTimeout(() => {
                            this.startAutoDemo();
                        }, 1000);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(this.demoInterface);
        }
    }

    startDemo() {
        this.isPlaying = true;
        this.currentStep = 0;
        this.playSequence();
    }

    startAutoDemo() {
        if (!this.isPlaying) {
            this.startDemo();
        }
    }

    playSequence() {
        if (this.currentStep >= this.demoSequence.length) {
            // Reset to beginning
            this.currentStep = 0;
            setTimeout(() => {
                this.playSequence();
            }, 2000);
            return;
        }

        const screenId = this.demoSequence[this.currentStep];
        this.showScreen(screenId);

        this.currentStep++;

        // Continue to next screen after delay
        setTimeout(() => {
            this.playSequence();
        }, 3000);
    }

    showScreen(screenId) {
        // Hide all screens
        this.screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.querySelector(`[data-screen="${screenId}"]`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        // Add special effects for certain screens
        if (screenId === 'scan') {
            this.animateScannerEffect();
        }
    }

    animateScannerEffect() {
        const scannerFrame = document.querySelector('.scanner-frame');
        if (scannerFrame) {
            scannerFrame.style.animation = 'scanner-pulse 2s ease-in-out';
            setTimeout(() => {
                scannerFrame.style.animation = '';
            }, 2000);
        }
    }
}

// Form validation and submission
class FormManager {
    constructor() {
        this.contactForm = document.getElementById('contact-form');
        this.formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
        this.submitBtn = document.querySelector('.submit-btn');
        this.successMessage = document.getElementById('form-success');

        if (!this.contactForm) return;

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupValidation();
    }

    bindEvents() {
        // Form submission
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        this.formInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearError(input);
            });
        });
    }

    setupValidation() {
        const validators = {
            name: (value) => {
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return null;
            },

            email: (value) => {
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
                return null;
            },

            subject: (value) => {
                if (!value) return 'Please select a subject';
                return null;
            },

            message: (value) => {
                if (!value.trim()) return 'Message is required';
                if (value.trim().length < 10) return 'Message must be at least 10 characters';
                return null;
            },

            privacy: (checked) => {
                if (!checked) return 'You must agree to the privacy policy';
                return null;
            }
        };

        this.validators = validators;
    }

    validateField(field) {
        const name = field.name;
        const value = field.type === 'checkbox' ? field.checked : field.value;
        const validator = this.validators[name];

        if (!validator) return true;

        const error = validator(value);

        if (error) {
            this.showError(field, error);
            return false;
        } else {
            this.clearError(field);
            return true;
        }
    }

    validateForm() {
        let isValid = true;

        this.formInputs.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        field.classList.add('error');
    }

    clearError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        field.classList.remove('error');
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            this.showToast('Please fix the errors above', 'error');
            return;
        }

        // Show loading state
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success
            this.showSuccess();
            this.resetForm();

        } catch (error) {
            this.showToast('Something went wrong. Please try again.', 'error');
        } finally {
            // Hide loading state
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }

    showSuccess() {
        this.successMessage.classList.add('active');
        this.contactForm.style.display = 'none';

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            this.hideSuccess();
        }, 5000);
    }

    hideSuccess() {
        this.successMessage.classList.remove('active');
        this.contactForm.style.display = 'block';
    }

    resetForm() {
        this.contactForm.reset();

        // Clear all errors
        this.formInputs.forEach(field => {
            this.clearError(field);
        });
    }

    showToast(message, type = 'info') {
        if (window.toastManager) {
            window.toastManager.show(message, type);
        }
    }
}

// Toast notification system
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = [];

        if (!this.container) {
            this.createContainer();
        }
    }

    createContainer() {
        this.container = utils.createElement('div', {
            id: 'toast-container',
            className: 'toast-container'
        });

        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto-remove toast
        setTimeout(() => {
            this.hide(toast);
        }, duration);

        return toast;
    }

    createToast(message, type) {
        const toast = utils.createElement('div', {
            className: `toast ${type}`,
            innerHTML: message
        });

        // Add close button
        const closeBtn = utils.createElement('button', {
            className: 'toast-close',
            innerHTML: '×',
            'aria-label': 'Close notification'
        });

        closeBtn.addEventListener('click', () => {
            this.hide(toast);
        });

        toast.appendChild(closeBtn);

        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }

            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    clear() {
        this.toasts.forEach(toast => {
            this.hide(toast);
        });
    }
}

// Modal system
class ModalManager {
    constructor() {
        this.container = document.getElementById('modal-container');
        this.backdrop = document.getElementById('modal-backdrop');
        this.content = document.getElementById('modal-content');
        this.activeModal = null;

        if (!this.container) {
            this.createContainer();
        }

        this.init();
    }

    createContainer() {
        const container = utils.createElement('div', {
            id: 'modal-container',
            className: 'modal-container'
        });

        const backdrop = utils.createElement('div', {
            id: 'modal-backdrop',
            className: 'modal-backdrop'
        });

        const content = utils.createElement('div', {
            id: 'modal-content',
            className: 'modal-content'
        });

        container.appendChild(backdrop);
        container.appendChild(content);
        document.body.appendChild(container);

        this.container = container;
        this.backdrop = backdrop;
        this.content = content;
    }

    init() {
        // Close modal on backdrop click
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => {
                this.close();
            });
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close();
            }
        });
    }

    open(content, options = {}) {
        this.content.innerHTML = content;
        this.container.classList.add('active');
        this.activeModal = content;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus management
        if (options.focusElement) {
            setTimeout(() => {
                const element = this.content.querySelector(options.focusElement);
                if (element) element.focus();
            }, 100);
        }
    }

    close() {
        this.container.classList.remove('active');
        this.activeModal = null;

        // Restore body scroll
        document.body.style.overflow = '';

        // Clear content after animation
        setTimeout(() => {
            this.content.innerHTML = '';
        }, 300);
    }
}

// Back to top functionality
class BackToTopManager {
    constructor() {
        this.button = document.getElementById('back-to-top');

        if (!this.button) {
            this.createButton();
        }

        this.init();
    }

    createButton() {
        this.button = utils.createElement('button', {
            id: 'back-to-top',
            className: 'back-to-top',
            'aria-label': 'Back to top',
            innerHTML: `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                </svg>
            `
        });

        document.body.appendChild(this.button);
    }

    init() {
        this.button.addEventListener('click', () => {
            utils.smoothScrollTo(document.body);
        });
    }
}

// Performance monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.observers = [];

        this.init();
    }

    init() {
        // Monitor Core Web Vitals
        this.observeCLS();
        this.observeFID();
        this.observeLCP();

        // Monitor custom metrics
        this.monitorLoadTime();
        this.monitorMemory();
    }

    observeCLS() {
        if ('LayoutShift' in window) {
            const observer = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.cls = clsValue;
            });

            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(observer);
        }
    }

    observeFID() {
        if ('PerformanceEventTiming' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-input') {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                        observer.disconnect();
                        break;
                    }
                }
            });

            observer.observe({ entryTypes: ['first-input'] });
            this.observers.push(observer);
        }
    }

    observeLCP() {
        if ('LargestContentfulPaint' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(observer);
        }
    }

    monitorLoadTime() {
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            this.metrics.loadTime = perfData.loadEventEnd - perfData.navigationStart;
            this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        });
    }

    monitorMemory() {
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
            }, 30000); // Check every 30 seconds
        }
    }

    getMetrics() {
        return this.metrics;
    }

    disconnect() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core systems
    const loadingManager = new LoadingManager();
    const navigationManager = new NavigationManager();
    const themeManager = new ThemeManager();
    const animationManager = new AnimationManager();

    // Initialize interactive components
    const testimonialCarousel = new TestimonialCarousel();
    const demoManager = new DemoManager();
    const formManager = new FormManager();

    // Initialize utility systems
    const toastManager = new ToastManager();
    const modalManager = new ModalManager();
    const backToTopManager = new BackToTopManager();

    // Initialize particle system and typewriter effect
    window.particleSystem = new ParticleSystem();
    window.typewriterEffect = new TypewriterEffect();

    // Initialize performance monitoring
    const performanceMonitor = new PerformanceMonitor();

    // Make managers globally available
    window.toastManager = toastManager;
    window.modalManager = modalManager;

    // Log initialization complete
    console.log('✅ NutriGrove website initialized successfully');

    // Performance logging in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            const metrics = performanceMonitor.getMetrics();
            console.log('📊 Performance Metrics:', metrics);
        }, 5000);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations and reduce CPU usage
        if (window.particleSystem) {
            window.particleSystem.stop();
        }
    } else {
        // Resume animations
        if (window.particleSystem) {
            window.particleSystem.start();
        }
    }
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error);

    // Log to analytics in production
    if (window.gtag) {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);

    // Log to analytics in production
    if (window.gtag) {
        gtag('event', 'exception', {
            description: event.reason,
            fatal: false
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        utils,
        LoadingManager,
        NavigationManager,
        ParticleSystem,
        TypewriterEffect,
        AnimationManager,
        ThemeManager,
        TestimonialCarousel,
        DemoManager,
        FormManager,
        ToastManager,
        ModalManager,
        BackToTopManager,
        PerformanceMonitor
    };
}