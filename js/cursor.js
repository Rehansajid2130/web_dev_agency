/**
 * @fileoverview Custom Cursor, Glow Physics, and Navigation Interactions for bit3labs
 * Provides smooth Figma-style pointer interpolation, card spotlight effects,
 * and P16 sliding nav tab indicator from transitions.dev.
 * @module cursor
 */

/**
 * Custom cursor removed to restore native OS browser cursor.
 * Cleans up any existing cursor element if present.
 * @returns {void}
 */
export function initCustomCursor() {
  const existing = document.getElementById('customCursor');
  if (existing) {
    existing.remove();
  }
}

/**
 * Initialize spotlight mouse hover glow on technical cards.
 * @returns {void}
 */
export function initCardGlow() {
  document.querySelectorAll('.glow-card, .process-card, .capability-highlight-card, .schematic-card').forEach(el => {
    const card = /** @type {HTMLElement} */ (el);
    card.classList.add('glow-card');
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/**
 * Handle navbar scroll elevation and mobile menu auto-closing.
 * @returns {void}
 */
export function initNavbarScrollState() {
  const navPill = document.querySelector('.nav-pill');
  if (!navPill) return;

  function updateNavbar() {
    if (window.scrollY > 20) {
      navPill.classList.add('scrolled');
    } else {
      navPill.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) {
      const menu = document.getElementById('nav-menu');
      const btn = document.querySelector('.mobile-toggle-btn');
      if (menu && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        if (btn) {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-expanded', 'false');
        }
      }
    }
  }, { passive: true });

  document.addEventListener('click', (e) => {
    const nav = document.querySelector('.nav-pill');
    const menu = document.getElementById('nav-menu');
    const btn = document.querySelector('.mobile-toggle-btn');
    const target = /** @type {Node} */ (e.target);
    if (menu && menu.classList.contains('is-open') && nav && !nav.contains(target)) {
      menu.classList.remove('is-open');
      if (btn) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

/**
 * Toggle the mobile navigation drawer menu.
 * @returns {void}
 */
export function toggleMobileMenu() {
  const menu = document.getElementById('nav-menu');
  const btn = document.querySelector('.mobile-toggle-btn');
  const header = document.getElementById('site-header');
  if (menu) {
    const isOpen = menu.classList.toggle('is-open');
    if (btn) {
      btn.classList.toggle('is-active', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    if (header) {
      header.classList.toggle('nav-menu-open', isOpen);
    }
  }
}

/**
 * P16 Sliding Active Tab Indicator from transitions.dev
 * Smoothly translates and stretches an elastic pill behind hovered/active nav links.
 * @returns {void}
 */
export function initNavSlidingPill() {
  const menu = document.getElementById('nav-menu');
  if (!menu) return;

  let pill = menu.querySelector('.nav-sliding-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'nav-sliding-pill';
    pill.setAttribute('aria-hidden', 'true');
    menu.prepend(pill);
  }

  function movePillTo(targetEl, immediate = false) {
    if (!targetEl || window.innerWidth <= 880) {
      pill.style.opacity = '0';
      return;
    }
    const menuRect = menu.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const left = targetRect.left - menuRect.left;
    const width = targetRect.width;

    if (width <= 0) return;

    if (immediate) {
      pill.style.transition = 'none';
    }

    pill.style.transform = `translateX(${left}px)`;
    pill.style.width = `${width}px`;
    pill.style.opacity = '1';

    if (immediate) {
      requestAnimationFrame(() => {
        pill.style.transition = '';
      });
    }
  }

  function getActiveLink() {
    return menu.querySelector('.nav-link.active') || menu.querySelector('.nav-link');
  }

  requestAnimationFrame(() => {
    movePillTo(getActiveLink(), true);
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      movePillTo(link, false);
    });
  });

  menu.addEventListener('mouseleave', () => {
    movePillTo(getActiveLink(), false);
  });

  window.addEventListener('resize', () => {
    movePillTo(getActiveLink(), true);
  }, { passive: true });
}

/**
 * Sync the sliding pill to the currently active link (e.g. after SPA route change).
 * @returns {void}
 */
export function syncNavSlidingPill() {
  const menu = document.getElementById('nav-menu');
  if (!menu) return;
  const pill = menu.querySelector('.nav-sliding-pill');
  const activeLink = menu.querySelector('.nav-link.active') || menu.querySelector('.nav-link');
  if (!pill || !activeLink || window.innerWidth <= 880) return;

  requestAnimationFrame(() => {
    const menuRect = menu.getBoundingClientRect();
    const targetRect = activeLink.getBoundingClientRect();
    const left = targetRect.left - menuRect.left;
    const width = targetRect.width;
    if (width > 0) {
      pill.style.transform = `translateX(${left}px)`;
      pill.style.width = `${width}px`;
      pill.style.opacity = '1';
    }
  });
}

/**
 * P19: 3D Micro Perspective Tilt from transitions.dev
 * Subtly tilts cards in 3D space tracking mouse position on pointermove,
 * with elastic spring damping reset on pointerleave.
 * @returns {void}
 */
export function initCard3DTilt() {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const selector = '.story-card, .process-card, .capability-highlight-card';
  const cards = document.querySelectorAll(selector);

  cards.forEach(el => {
    const card = /** @type {HTMLElement} */ (el);
    if (card.dataset.tiltInitialized === 'true') return;
    card.dataset.tiltInitialized = 'true';

    let rafId = null;

    card.addEventListener('pointerenter', () => {
      card.style.transition = 'transform 0.12s ease-out, box-shadow 0.25s ease';
      card.style.willChange = 'transform';
    });

    card.addEventListener('pointermove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        // Subtle, elegant ~3.5 deg maximum tilt
        const rotX = (-normY * 5).toFixed(2);
        const rotY = (normX * 5).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
      });
    });

    card.addEventListener('pointerleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      setTimeout(() => {
        if (!card.matches(':hover')) {
          card.style.willChange = '';
          card.style.transform = '';
          card.style.transition = '';
        }
      }, 500);
    });
  });
}

/**
 * Scroll-driven Text Fade-in from transitions.dev
 * Smoothly reveals section headlines, subtitles, and paragraphs as they scroll into view.
 * @returns {void}
 */
export function initScrollTextReveal() {
  if (typeof window === 'undefined') return;

  const textSelectors = [
    '.section-heading',
    '.section-subtext',
    '.eyebrow-text',
    '.partners-title',
    '.story-card-title',
    '.story-card-text',
    '.process-card-title',
    '.process-card-desc',
    '.capability-title',
    '.cta-title',
    '.cta-subtitle',
    '.principle-title',
    '.principle-desc',
    '.scroll-reveal-text'
  ].join(', ');

  const elements = document.querySelectorAll(textSelectors);
  if (!elements.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  });

  elements.forEach(el => {
    const element = /** @type {HTMLElement} */ (el);
    if (element.classList.contains('is-revealed')) return;

    // Never obscure hero entrance, header, or modals
    if (element.closest('.hero-section') || element.closest('header') || element.closest('#contactModal')) {
      element.classList.add('is-revealed');
      return;
    }

    element.classList.add('scroll-fade-text');

    // Immediately reveal elements already inside initial viewport
    const rect = element.getBoundingClientRect();
    if (prefersReduced || (rect.top < window.innerHeight - 30 && rect.bottom > 0)) {
      element.classList.add('is-revealed');
    } else {
      observer.observe(element);
    }
  });
}
