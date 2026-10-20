/**
 * @fileoverview Custom Cursor, Glow Physics, and Navigation Interactions for bit3labs
 * Provides smooth Figma-style pointer interpolation and card spotlight effects.
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
