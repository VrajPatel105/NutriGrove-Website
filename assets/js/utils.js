// Utility functions for NutriGrove website
// Supporting functions for animations, interactions, and performance

'use strict';

// Animation utilities
const AnimationUtils = {
    // Intersection Observer for scroll animations
    createScrollObserver(callback, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observerOptions = { ...defaultOptions, ...options };

        return new IntersectionObserver(callback, observerOptions);
    },

    // Smooth scroll with easing
    smoothScroll(target, duration = 800, offset = 0) {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    },

    // CSS animation promise
    animateCSS(element, animationName, speed = 'faster') {
        const node = typeof element === 'string' ? document.querySelector(element) : element;
        if (!node) return Promise.resolve();

        return new Promise((resolve) => {
            const animationClasses = [`animate__${animationName}`, `animate__${speed}`];

            node.classList.add('animate__animated', ...animationClasses);

            function handleAnimationEnd(event) {
                event.stopPropagation();
                node.classList.remove('animate__animated', ...animationClasses);
                resolve('Animation ended');
            }

            node.addEventListener('animationend', handleAnimationEnd, { once: true });
        });
    },

    // Stagger animations for multiple elements
    staggerAnimation(elements, animationName, delay = 100) {
        const nodeList = typeof elements === 'string' ? document.querySelectorAll(elements) : elements;

        Array.from(nodeList).forEach((element, index) => {
            setTimeout(() => {
                this.animateCSS(element, animationName);
            }, index * delay);
        });
    }
};

// DOM utilities
const DOMUtils = {
    // Create element with attributes and children
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });

        return element;
    },

    // Get elements with caching
    cache: new Map(),

    $(selector, useCache = true) {
        if (useCache && this.cache.has(selector)) {
            return this.cache.get(selector);
        }

        const element = document.querySelector(selector);
        if (useCache && element) {
            this.cache.set(selector, element);
        }

        return element;
    },

    $$(selector, useCache = false) {
        if (useCache && this.cache.has(selector)) {
            return this.cache.get(selector);
        }

        const elements = document.querySelectorAll(selector);
        if (useCache && elements.length > 0) {
            this.cache.set(selector, elements);
        }

        return elements;
    },

    // Clear cache
    clearCache() {
        this.cache.clear();
    },

    // Check if element is in viewport
    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;

        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= windowHeight + threshold &&
            rect.right <= windowWidth + threshold
        );
    },

    // Get element position relative to document
    getPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
            width: rect.width,
            height: rect.height
        };
    },

    // Safe event listener with automatic cleanup
    addSafeEventListener(element, event, handler, options = {}) {
        const controller = new AbortController();
        const safeOptions = { ...options, signal: controller.signal };

        element.addEventListener(event, handler, safeOptions);

        return () => controller.abort();
    }
};

// Performance utilities
const PerformanceUtils = {
    // Debounce function
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // RAF throttle for smooth animations
    rafThrottle(func) {
        let rafId = null;
        return function(...args) {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    func.apply(this, args);
                    rafId = null;
                });
            }
        };
    },

    // Idle callback wrapper
    whenIdle(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            return requestIdleCallback(callback, options);
        } else {
            return setTimeout(callback, 0);
        }
    },

    // Performance measurement
    measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();

        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    },

    // Memory usage (if available)
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        return null;
    }
};

// Data utilities
const DataUtils = {
    // Format numbers
    formatNumber(num, options = {}) {
        const defaults = { notation: 'standard', maximumFractionDigits: 0 };
        const config = { ...defaults, ...options };

        return new Intl.NumberFormat('en-US', config).format(num);
    },

    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format dates
    formatDate(date, options = {}) {
        const defaults = { year: 'numeric', month: 'long', day: 'numeric' };
        const config = { ...defaults, ...options };

        return new Intl.DateTimeFormat('en-US', config).format(new Date(date));
    },

    // Format relative time
    formatRelativeTime(date) {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const now = new Date();
        const past = new Date(date);
        const diffTime = past - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (Math.abs(diffDays) < 1) {
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            if (Math.abs(diffHours) < 1) {
                const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                return rtf.format(diffMinutes, 'minute');
            }
            return rtf.format(diffHours, 'hour');
        }

        return rtf.format(diffDays, 'day');
    },

    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    // Merge objects deeply
    deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    },

    // Check if value is object
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    // Generate unique ID
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};

// Device and browser utilities
const DeviceUtils = {
    // Detect device type
    getDeviceType() {
        const userAgent = navigator.userAgent;

        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            return 'tablet';
        }
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            return 'mobile';
        }
        return 'desktop';
    },

    // Get viewport dimensions
    getViewport() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        };
    },

    // Check if touch device
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Check for reduced motion preference
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Check for dark mode preference
    prefersDarkMode() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    // Get browser info
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';

        if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
        else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
        else if (userAgent.indexOf('Opera') > -1) browser = 'Opera';

        return {
            name: browser,
            userAgent: userAgent,
            language: navigator.language,
            platform: navigator.platform
        };
    }
};

// Storage utilities
const StorageUtils = {
    // Local storage with JSON support
    setLocal(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    },

    getLocal(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    removeLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
            return false;
        }
    },

    // Session storage with JSON support
    setSession(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Failed to save to sessionStorage:', error);
            return false;
        }
    },

    getSession(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read from sessionStorage:', error);
            return defaultValue;
        }
    },

    // Clear all storage
    clearAll() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            return true;
        } catch (error) {
            console.warn('Failed to clear storage:', error);
            return false;
        }
    }
};

// Validation utilities
const ValidationUtils = {
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Phone validation
    isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    // URL validation
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Password strength
    getPasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[^A-Za-z0-9]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score] || 'Very Weak';

        return { score, strength, checks };
    },

    // Sanitize HTML
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
};

// Math utilities
const MathUtils = {
    // Random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Clamp number between min and max
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    // Linear interpolation
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Map value from one range to another
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    // Calculate distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // Round to specified decimal places
    round(num, decimals = 0) {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
};

// Color utilities
const ColorUtils = {
    // Convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Convert RGB to hex
    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    },

    // Get contrast ratio
    getContrastRatio(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);

        if (!rgb1 || !rgb2) return 1;

        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);

        const brightest = Math.max(l1, l2);
        const darkest = Math.min(l1, l2);

        return (brightest + 0.05) / (darkest + 0.05);
    },

    // Get luminance
    getLuminance(rgb) {
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;

        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
};

// Export utilities for use in other modules
if (typeof window !== 'undefined') {
    window.Utils = {
        Animation: AnimationUtils,
        DOM: DOMUtils,
        Performance: PerformanceUtils,
        Data: DataUtils,
        Device: DeviceUtils,
        Storage: StorageUtils,
        Validation: ValidationUtils,
        Math: MathUtils,
        Color: ColorUtils
    };
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationUtils,
        DOMUtils,
        PerformanceUtils,
        DataUtils,
        DeviceUtils,
        StorageUtils,
        ValidationUtils,
        MathUtils,
        ColorUtils
    };
}