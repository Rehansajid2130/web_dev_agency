/**
 * @fileoverview Dynamic Theme & Palette Engine for bit3labs
 * Manages Dark/Light mode synchronization and 8-accent runtime color palettes.
 * @module theme
 */

/**
 * Valid theme color palette names.
 * @typedef {'violet'|'black'|'green'|'emerald'|'cyan'|'amber'|'rose'|'blue'} ThemeColor
 */

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
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon();
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
 * Initialize dynamic color theme palette from localStorage or default to 'violet'.
 * @returns {void}
 */
export function initColorTheme() {
  const savedColor = /** @type {ThemeColor} */ (localStorage.getItem('bit3labs_theme_color') || 'violet');
  setColorTheme(savedColor, false);
  renderColorThemePicker();
}

/**
 * Set the active accent color palette.
 * @param {string} colorName - The name of the color palette to activate.
 * @param {boolean} [save=true] - Whether to persist the selection to localStorage.
 * @returns {void}
 */
export function setColorTheme(colorName, save = true) {
  document.documentElement.setAttribute('data-theme-color', colorName);
  if (document.body) {
    document.body.setAttribute('data-theme-color', colorName);
  }
  if (save) {
    localStorage.setItem('bit3labs_theme_color', colorName);
  }
  document.querySelectorAll('.theme-color-swatch').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-color') === colorName);
  });
}

/**
 * Render the interactive theme palette dock widget into the DOM if not already present.
 * @returns {void}
 */
export function renderColorThemePicker() {
  if (document.getElementById('themePaletteDock')) return;

  const dock = document.createElement('aside');
  dock.id = 'themePaletteDock';
  dock.className = 'theme-palette-dock';
  dock.setAttribute('aria-label', 'Theme Color Palette Switcher');

  const currentColor = localStorage.getItem('bit3labs_theme_color') || 'violet';

  dock.innerHTML = `
    <span class="theme-palette-label">Theme</span>
    <div class="theme-palette-swatches">
      <button class="theme-color-swatch swatch-violet ${currentColor === 'violet' ? 'active' : ''}" data-color="violet" onclick="setColorTheme('violet')" title="Electric Violet (Linear / Raycast)" aria-label="Electric Violet Theme"></button>
      <button class="theme-color-swatch swatch-black ${currentColor === 'black' ? 'active' : ''}" data-color="black" onclick="setColorTheme('black')" title="Stealth Onyx / Titanium Black (Apple Pro / Monochrome)" aria-label="Stealth Onyx Black Theme"></button>
      <button class="theme-color-swatch swatch-green ${currentColor === 'green' ? 'active' : ''}" data-color="green" onclick="setColorTheme('green')" title="Nordic Pine / Forest Green (Deep Tech)" aria-label="Nordic Pine Green Theme"></button>
      <button class="theme-color-swatch swatch-emerald ${currentColor === 'emerald' ? 'active' : ''}" data-color="emerald" onclick="setColorTheme('emerald')" title="Obsidian Emerald (Supabase / Jade)" aria-label="Obsidian Emerald Theme"></button>
      <button class="theme-color-swatch swatch-cyan ${currentColor === 'cyan' ? 'active' : ''}" data-color="cyan" onclick="setColorTheme('cyan')" title="Quantum Cyan (Deep Cloud Teal)" aria-label="Quantum Cyan Theme"></button>
      <button class="theme-color-swatch swatch-amber ${currentColor === 'amber' ? 'active' : ''}" data-color="amber" onclick="setColorTheme('amber')" title="Solar Amber (Luxury Bronze)" aria-label="Solar Amber Theme"></button>
      <button class="theme-color-swatch swatch-rose ${currentColor === 'rose' ? 'active' : ''}" data-color="rose" onclick="setColorTheme('rose')" title="Champagne Ruby (Luxury Hardware)" aria-label="Champagne Ruby Theme"></button>
      <button class="theme-color-swatch swatch-blue ${currentColor === 'blue' ? 'active' : ''}" data-color="blue" onclick="setColorTheme('blue')" title="Royal Cobalt (Blueprint Classic)" aria-label="Royal Cobalt Theme"></button>
    </div>
  `;

  document.body.appendChild(dock);
}
