/**
 * @fileoverview Typewriter Hero Headline Animation with Blinking Cursor for bit3labs
 * Cycles through service domains with natural human typing, pausing, and deleting cadence.
 * Fully accessible with prefers-reduced-motion support and clean timer teardown.
 * @module typewriter
 */

const PHRASES = [
  'Custom Web, Mobile & ERP Systems',
  'Custom Web Applications',
  'Native Mobile Apps',
  'Enterprise ERP Systems'
];

// Cadence timings in milliseconds
const TYPE_SPEED = 70;         // Speed of typing each char
const DELETE_SPEED = 35;       // Speed of deleting each char
const HOLD_FULL_DELAY = 2200;  // Pause when phrase is fully typed out
const HOLD_EMPTY_DELAY = 450;  // Pause before typing next phrase
const INITIAL_PAUSE = 2200;    // Pause on initial page load before deleting

let activeTimeoutId = null;
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isRunning = false;

/**
 * Initialize or restart the typewriter effect.
 * Safe to call multiple times (e.g. on direct load or SPA route swap).
 * @returns {void}
 */
export function initTypewriter() {
  stopTypewriter();

  const textEl = document.getElementById('typewriterText');
  const cursorEl = document.getElementById('typewriterCursor');

  if (!textEl) return;

  // Respect user preference for reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    textEl.textContent = PHRASES[0];
    if (cursorEl) cursorEl.style.display = 'none';
    return;
  }

  // Set initial state from the complete phrase already in DOM
  phraseIndex = 0;
  charIndex = PHRASES[0].length;
  textEl.textContent = PHRASES[0];
  isDeleting = true;
  isRunning = true;

  if (cursorEl) {
    cursorEl.classList.remove('is-typing');
  }

  activeTimeoutId = setTimeout(() => {
    tick();
  }, INITIAL_PAUSE);
}

/**
 * Stop any active typewriter loops and reset state.
 * @returns {void}
 */
export function stopTypewriter() {
  if (activeTimeoutId) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
  isRunning = false;
}

/**
 * Single step of the typewriter state machine.
 */
function tick() {
  if (!isRunning) return;

  const textEl = document.getElementById('typewriterText');
  const cursorEl = document.getElementById('typewriterCursor');

  if (!textEl) {
    stopTypewriter();
    return;
  }

  const currentPhrase = PHRASES[phraseIndex];

  if (isDeleting) {
    if (cursorEl) cursorEl.classList.add('is-typing');

    charIndex = Math.max(0, charIndex - 1);
    textEl.textContent = currentPhrase.substring(0, charIndex);

    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % PHRASES.length;
      if (cursorEl) cursorEl.classList.remove('is-typing');
      activeTimeoutId = setTimeout(tick, HOLD_EMPTY_DELAY);
      return;
    }

    // Natural variation during deletion
    const delay = DELETE_SPEED + (Math.random() * 12);
    activeTimeoutId = setTimeout(tick, delay);
  } else {
    if (cursorEl) cursorEl.classList.add('is-typing');

    charIndex = Math.min(currentPhrase.length, charIndex + 1);
    textEl.textContent = currentPhrase.substring(0, charIndex);

    if (charIndex === currentPhrase.length) {
      isDeleting = true;
      if (cursorEl) cursorEl.classList.remove('is-typing');
      activeTimeoutId = setTimeout(tick, HOLD_FULL_DELAY);
      return;
    }

    // Natural typing rhythm with micro-delays for spaces and punctuation
    const currentChar = currentPhrase[charIndex - 1];
    let delay = TYPE_SPEED + (Math.random() * 30 - 15);
    if (currentChar === ' ' || currentChar === '&' || currentChar === ',') {
      delay += 45;
    }

    activeTimeoutId = setTimeout(tick, delay);
  }
}
