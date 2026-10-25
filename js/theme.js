/**
 * @fileoverview Theme Engine for bit3labs
 * Manages Dark/Light mode synchronization with native system preferences.
 * @module theme
 */

// ponytail: removed multi-theme palette engine in favor of the single original blueprint blue theme.

/**
 * Valid mode types.
 * @typedef {'dark'|'light'} ThemeMode
 */

/**
 * Initialize dark/light mode based on localStorage or OS prefers-color-scheme.
 * @returns {void}
 */
export function initTheme() {
  const saved = localStorage.getItem('theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  updateThemeIcon();
}

/**
 * Toggle between Dark and Light mode.
 * @returns {ThemeMode} The new active mode.
 */
export function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  if (next === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('theme', next);
  updateThemeIcon();

  if (typeof window.playToggleSound === 'function') {
    window.playToggleSound(next === 'dark');
  }
  if (typeof window.triggerHaptic === 'function') {
    window.triggerHaptic(12);
  }

  return next;
}

/**
 * Synchronize all theme toggle icon buttons in the DOM.
 * @returns {void}
 */
export function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = isDark ? '☀️' : '🌙';
  });
}

/**
 * Clean up legacy color theme keys and reset to base blue theme.
 * @returns {void}
 */
export function initColorTheme() {
  // ponytail: ensure legacy theme-color attribute and storage are purged
  try {
    localStorage.removeItem('bit3labs_theme_color');
    document.documentElement.removeAttribute('data-theme-color');
    if (document.body) {
      document.body.removeAttribute('data-theme-color');
    }
    const dock = document.getElementById('themePaletteDock');
    if (dock) dock.remove();
  } catch (_) {}
}

/**
 * Stub kept for backward compatibility; enforces the standard blue theme.
 * @param {string} [colorName]
 * @param {boolean} [save]
 * @returns {void}
 */
export function setColorTheme(colorName, save) {
  // ponytail: no-op since only original blue theme is kept
  initColorTheme();
}

/**
 * Stub kept for backward compatibility; removes any existing picker dock.
 * @returns {void}
 */
export function renderColorThemePicker() {
  // ponytail: no-op; dock is removed
  const dock = document.getElementById('themePaletteDock');
  if (dock) dock.remove();
}
