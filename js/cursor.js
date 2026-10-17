/**
 * @fileoverview Custom Cursor, Glow Physics, and Navigation Interactions for bit3labs
 * Provides smooth Figma-style pointer interpolation and card spotlight effects.
 * @module cursor
 */

/**
 * Initialize high-precision Figma canvas cursor with snap-on-entry and state delegation.
 * @returns {void}
 */
export function initCustomCursor() {
  if (window.__bit3labsCursorInitialized) return;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.__bit3labsCursorInitialized = true;

  let cursor = document.getElementById('customCursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'customCursor';
    cursor.className = 'custom-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = `
      <svg class="figma-cursor-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 2.5L20.5 9.5L13.5 13.5L9.5 20.5L3.5 2.5Z" fill="#000000" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    document.body.appendChild(cursor);
  }

  const savedX = parseFloat(sessionStorage.getItem('bit3labs_cursor_x') || '');
  const savedY = parseFloat(sessionStorage.getItem('bit3labs_cursor_y') || '');
  const hasSaved = Number.isFinite(savedX) && Number.isFinite(savedY) && savedX > 0 && savedY > 0;

  let mouseX = hasSaved ? savedX : -500;
  let mouseY = hasSaved ? savedY : -500;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isVisible = false;
  let hasSnapped = hasSaved;

  if (hasSaved) {
    cursor.style.transform = `translate3d(${cursorX - 3.5}px, ${cursorY - 2.5}px, 0)`;
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    sessionStorage.setItem('bit3labs_cursor_x', String(mouseX));
    sessionStorage.setItem('bit3labs_cursor_y', String(mouseY));

    if (!hasSnapped) {
      cursorX = mouseX;
      cursorY = mouseY;
      cursor.style.transform = `translate3d(${cursorX - 3.5}px, ${cursorY - 2.5}px, 0)`;
      hasSnapped = true;
    }

    if (!isVisible) {
      isVisible = true;
      cursor.classList.add('is-visible');
    }
  }, { passive: true });

  window.addEventListener('mousedown', () => {
    cursor.classList.add('is-clicking');
  });

  window.addEventListener('mouseup', () => {
    cursor.classList.remove('is-clicking');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('is-visible');
    isVisible = false;
  });

  document.addEventListener('mouseenter', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorX = mouseX;
    cursorY = mouseY;
    cursor.style.transform = `translate3d(${cursorX - 3.5}px, ${cursorY - 2.5}px, 0)`;
    cursor.classList.add('is-visible');
    isVisible = true;
    hasSnapped = true;
  });

  // Interactive hover states delegation
  document.addEventListener('mouseover', (e) => {
    const target = /** @type {HTMLElement|null} */ (e.target);
    if (!target) return;

    if (target.closest('a, button, [role="button"], .nav-link, .btn, .theme-toggle-btn, .mobile-toggle-btn, .phase-tab-item, .dash-tab-btn, .pill-btn, .filter-pill, .stepper-node, .framer-phase-card, .footer-bottom-links a, .scope-card, .framer-tab-btn')) {
      cursor.classList.add('is-hover');
    } else {
      cursor.classList.remove('is-hover');
    }

    if (target.closest('input[type="text"], input[type="email"], textarea, select')) {
      cursor.classList.add('is-text');
    } else {
      cursor.classList.remove('is-text');
    }
  }, { passive: true });

  const lerp = (start, end, amt) => start + (end - start) * amt;

  function loop() {
    if (hasSnapped) {
      cursorX = lerp(cursorX, mouseX, 0.28);
      cursorY = lerp(cursorY, mouseY, 0.28);
      cursor.style.transform = `translate3d(${cursorX - 3.5}px, ${cursorY - 2.5}px, 0)`;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
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
