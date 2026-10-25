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

// ==================== SYNTHETIC WEB AUDIO & HAPTICS ENGINE ====================
let audioCtx = null;
let soundEnabled = typeof window !== 'undefined' ? localStorage.getItem('bit3labs_sound') === 'true' : false;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function toggleSoundEffect() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('bit3labs_sound', soundEnabled ? 'true' : 'false');
  updateSoundUI();
  if (soundEnabled) {
    playTapSound(640);
  }
  return soundEnabled;
}

export function updateSoundUI() {
  const icon = document.getElementById('mobileSoundIcon');
  const text = document.getElementById('mobileSoundText');
  if (icon && text) {
    icon.textContent = soundEnabled ? '🔊' : '🔇';
    text.textContent = soundEnabled ? 'Studio Sound: ON' : 'Studio Sound: OFF';
  }
}

export function triggerHaptic(duration = 8) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (_) {}
  }
}

export function playTapSound(freq = 520) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch (_) {}
}

export function playToggleSound(isOn) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    const baseFreq = isOn ? 380 : 540;
    const nextFreq = isOn ? 580 : 360;

    osc1.frequency.setValueAtTime(baseFreq, now);
    osc2.frequency.setValueAtTime(nextFreq, now + 0.02);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.03);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.06);
  } catch (_) {}
}

export function playDrawerSound(isOpen) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = isOpen ? 320 : 580;
    const endFreq = isOpen ? 620 : 280;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  } catch (_) {}
}

// ==================== MOBILE DRAWER CONTROLLER ====================

export function ensureMobileNavBackdrop() {
  let backdrop = document.getElementById('mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-nav-backdrop';
    backdrop.className = 'mobile-nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', closeMobileMenu);
    document.body.appendChild(backdrop);
  }
  return backdrop;
}

export function closeMobileMenu() {
  const menu = document.getElementById('nav-menu');
  const btn = document.querySelector('.mobile-toggle-btn');
  const header = document.getElementById('site-header');
  const backdrop = document.getElementById('mobile-nav-backdrop');

  if (menu && menu.classList.contains('is-open')) {
    menu.classList.remove('is-open');
    if (btn) {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'false');
    }
    if (header) header.classList.remove('nav-menu-open');
    if (backdrop) backdrop.classList.remove('is-active');
    document.body.classList.remove('nav-drawer-locked');
    playDrawerSound(false);
  }
}

function enrichMobileDrawer(menu) {
  if (!menu.querySelector('.mobile-drawer-header')) {
    const hdr = document.createElement('div');
    hdr.className = 'mobile-drawer-header';
    hdr.innerHTML = `
      <span class="mobile-drawer-tag">Navigation</span>
      <span class="mobile-drawer-status">
        <span class="mobile-drawer-status-dot"></span>
        Booking Q4/Q1
      </span>
    `;
    menu.prepend(hdr);
  }

  if (!menu.querySelector('.mobile-drawer-footer')) {
    const ftr = document.createElement('div');
    ftr.className = 'mobile-drawer-footer';
    ftr.innerHTML = `
      <a href="contact.html" class="btn btn-primary mobile-drawer-cta">
        <span>Start a Consultation</span>
        <span>&rarr;</span>
      </a>
      <button type="button" class="mobile-drawer-sound-btn" onclick="toggleSoundEffect()" aria-label="Toggle studio sound effects">
        <span id="mobileSoundIcon">${soundEnabled ? '🔊' : '🔇'}</span>
        <span id="mobileSoundText">${soundEnabled ? 'Studio Sound: ON' : 'Studio Sound: OFF'}</span>
      </button>
    `;
    menu.appendChild(ftr);
  }
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

  ensureMobileNavBackdrop();

  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) {
      closeMobileMenu();
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // Close drawer when any nav-link or drawer cta is clicked
  const menu = document.getElementById('nav-menu');
  if (menu) {
    menu.addEventListener('click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (target.closest('.nav-link') || target.closest('.mobile-drawer-cta')) {
        closeMobileMenu();
      }
    });
  }
}

/**
 * Toggle the mobile navigation drawer menu.
 * @returns {void}
 */
export function toggleMobileMenu() {
  const menu = document.getElementById('nav-menu');
  const btn = document.querySelector('.mobile-toggle-btn');
  const header = document.getElementById('site-header');
  const backdrop = ensureMobileNavBackdrop();

  if (!menu) return;

  const isOpen = menu.classList.toggle('is-open');
  if (btn) {
    btn.classList.toggle('is-active', isOpen);
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  if (header) {
    header.classList.toggle('nav-menu-open', isOpen);
  }
  if (backdrop) {
    backdrop.classList.toggle('is-active', isOpen);
  }
  document.body.classList.toggle('nav-drawer-locked', isOpen);

  triggerHaptic(8);
  playDrawerSound(isOpen);

  if (isOpen) {
    enrichMobileDrawer(menu);
  }
}

/**
 * Magnetic button hover effect for primary CTAs and interactive buttons.
 * @returns {void}
 */
export function initMagneticButtons() {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const buttons = document.querySelectorAll('.btn-primary, #nav-cta-btn, .btn-magnetic');

  buttons.forEach(el => {
    const btn = /** @type {HTMLElement} */ (el);
    if (btn.dataset.magneticInit === 'true') return;
    btn.dataset.magneticInit = 'true';
    btn.classList.add('btn-magnetic');

    let rafId = null;

    btn.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.22;
        const deltaY = (e.clientY - centerY) * 0.22;

        btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
    });

    btn.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      btn.style.transform = 'translate(0px, 0px)';
      setTimeout(() => {
        if (!btn.matches(':hover')) {
          btn.style.transition = '';
        }
      }, 400);
    });
  });
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
