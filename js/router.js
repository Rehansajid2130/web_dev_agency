/**
 * @fileoverview High-Performance Client-Side SPA / PJAX Router for bit3labs
 * Provides instant page transitions with mouse hover prefetching, dynamic stylesheet
 * synchronization, and zero-latency route swaps.
 * @module router
 */

import { renderColorThemePicker } from './theme.js';
import { initNavbarScrollState, initCardGlow, syncNavSlidingPill } from './cursor.js';
import { initStatsObserver } from './telemetry.js';
import { initProcessPage, initProjectsPage, initContactPage } from './components.js';
import { initTypewriter, stopTypewriter } from './typewriter.js';

/** @type {Map<string, string>} */
const pageCache = new Map();

/**
 * Initialize the client-side router, click delegation, and hover prefetcher.
 * @returns {void}
 */
export function initRouter() {
  if (window.__bit3labsRouterInitialized) return;
  window.__bit3labsRouterInitialized = true;

  let progressBar = document.getElementById('routeProgressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'routeProgressBar';
    progressBar.className = 'route-progress-bar';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
  }

  const initialUrl = normalizeUrl(window.location.href);
  pageCache.set(initialUrl, document.documentElement.outerHTML);

  document.addEventListener('click', (e) => {
    const target = /** @type {HTMLElement|null} */ (e.target);
    const link = target?.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (
      link.target ||
      link.hasAttribute('download') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
    ) {
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(link.href, window.location.href);
    } catch (_) {
      return;
    }

    const currentUrl = new URL(window.location.href);

    if (targetUrl.origin !== currentUrl.origin) return;

    if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
      if (targetUrl.hash) {
        const targetEl = document.querySelector(targetUrl.hash);
        if (targetEl) {
          e.preventDefault();
          if (window.lenis) {
            window.lenis.scrollTo(targetEl, { offset: -80 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
          history.pushState(null, '', targetUrl.hash);
        }
      }
      return;
    }

    e.preventDefault();
    navigateTo(targetUrl.href);
  });

  document.addEventListener('mouseover', (e) => {
    const target = /** @type {HTMLElement|null} */ (e.target);
    const link = target?.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin) {
        prefetchPage(url.href);
      }
    } catch (_) {}
  }, { passive: true });

  window.addEventListener('popstate', () => {
    navigateTo(window.location.href, false);
  });
  syncNavSlidingPill();
}

/**
 * Prefetch and cache the full HTML string for a route.
 * @param {string} url - Target URL to prefetch.
 * @returns {Promise<string|null>} The HTML content or null.
 */
export async function prefetchPage(url) {
  const cleanUrl = normalizeUrl(url);
  if (pageCache.has(cleanUrl)) return pageCache.get(cleanUrl) || null;
  try {
    const res = await fetch(cleanUrl, { credentials: 'same-origin' });
    if (res.ok) {
      const html = await res.text();
      pageCache.set(cleanUrl, html);
      return html;
    }
  } catch (_) {}
  return null;
}

/**
 * Navigate to a specific URL using the client-side swap engine.
 * @param {string} url - Destination route.
 * @param {boolean} [push=true] - Whether to push state to history.
 * @returns {Promise<void>}
 */
export async function navigateTo(url, push = true) {
  const cleanUrl = normalizeUrl(url);
  const progressBar = document.getElementById('routeProgressBar');

  if (progressBar) {
    progressBar.classList.add('is-loading');
    progressBar.style.width = '35%';
  }

  const menu = document.getElementById('nav-menu');
  const mobileBtn = document.querySelector('.mobile-toggle-btn');
  const header = document.getElementById('site-header');
  if (menu && menu.classList.contains('is-open')) {
    menu.classList.remove('is-open');
    if (mobileBtn) {
      mobileBtn.classList.remove('is-active');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }
    if (header) header.classList.remove('nav-menu-open');
  }

  const currentMain = document.querySelector('main');
  if (currentMain) {
    currentMain.classList.add('route-transition-out');
  }

  try {
    if (progressBar) progressBar.style.width = '65%';

    let html = pageCache.get(cleanUrl);
    if (!html) {
      html = await prefetchPage(cleanUrl) || undefined;
    }

    if (!html) {
      window.location.href = url;
      return;
    }

    if (progressBar) progressBar.style.width = '90%';

    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');
    const newMain = newDoc.querySelector('main');

    if (!newMain) {
      window.location.href = url;
      return;
    }

    syncHeadStyles(newDoc);

    await new Promise(resolve => setTimeout(resolve, 80));

    if (currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
      currentMain.className = newMain.className;
      currentMain.id = newMain.id;
    }

    if (newDoc.body) {
      document.body.className = newDoc.body.className;
      // ponytail: single blue theme; ensure no legacy theme-color attribute
      document.body.removeAttribute('data-theme-color');
    }

    document.title = newDoc.title;
    const newDesc = newDoc.querySelector('meta[name="description"]');
    const curDesc = document.querySelector('meta[name="description"]');
    if (newDesc && curDesc) {
      curDesc.setAttribute('content', newDesc.getAttribute('content') || '');
    }

    if (push) {
      window.history.pushState({ url: cleanUrl }, '', url);
    }

    updateActiveNavLinks(cleanUrl);

    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    runPageScripts(currentMain);
    reinitPageComponents(cleanUrl);

    if (currentMain) {
      currentMain.classList.remove('route-transition-out');
      currentMain.classList.add('route-transition-in');
      setTimeout(() => currentMain.classList.remove('route-transition-in'), 300);
    }

    if (progressBar) {
      progressBar.style.width = '100%';
      setTimeout(() => {
        progressBar.classList.remove('is-loading');
        progressBar.style.width = '0%';
      }, 200);
    }

  } catch (err) {
    console.error('Navigation error, falling back to standard load:', err);
    window.location.href = url;
  }
}

/**
 * Strip query parameters and hashes for canonical URL caching.
 * @param {string} url - Target URL.
 * @returns {string} Normalized URL.
 */
export function normalizeUrl(url) {
  try {
    const u = new URL(url, window.location.href);
    return u.origin + u.pathname;
  } catch (_) {
    return url;
  }
}

/**
 * Synchronize <link rel="stylesheet"> elements from newly loaded document to head.
 * @param {Document} newDoc - Parsed incoming document.
 * @returns {void}
 */
function syncHeadStyles(newDoc) {
  const links = newDoc.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = href;
      document.head.appendChild(newLink);
    }
  });
}

/**
 * Highlight active link in the top navigation pill.
 * @param {string} currentUrl - Active route URL.
 * @returns {void}
 */
function updateActiveNavLinks(currentUrl) {
  const pathname = new URL(currentUrl, window.location.href).pathname;
  const pageName = pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-menu .nav-link').forEach((el) => {
    const link = /** @type {HTMLElement} */ (el);
    const linkHref = link.getAttribute('href');
    const linkPage = linkHref ? linkHref.split('#')[0].split('/').pop() : '';
    const isMatch = linkPage === pageName || (pageName === '' && linkPage === 'index.html') || (pageName === 'index.html' && linkPage === 'index.html');
    
    link.classList.toggle('active', isMatch);
    if (isMatch) {
      link.style.color = 'var(--color-primary)';
      link.style.fontWeight = '700';
    } else {
      link.style.color = '';
      link.style.fontWeight = '';
    }
  });
}

/**
 * Execute inline scripts inside swapped container.
 * @param {HTMLElement|null} container - Main container.
 * @returns {void}
 */
function runPageScripts(container) {
  if (!container) return;
  const scripts = container.querySelectorAll('script');
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });
    newScript.textContent = oldScript.textContent;
    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });
}

/**
 * Re-initialize dynamic components on page swap.
 * @param {string} url - Active route URL.
 * @returns {void}
 */
export function reinitPageComponents(url) {
  initNavbarScrollState();
  initCardGlow();
  initStatsObserver();

  if (document.querySelector('.framer-tab-btn')) {
    initProcessPage();
  }

  if (document.querySelector('.project-card')) {
    initProjectsPage();
  }

  if (document.getElementById('contactPageForm')) {
    initContactPage();
  }

  if (document.getElementById('typewriterText')) {
    initTypewriter();
  } else {
    stopTypewriter();
  }
}
