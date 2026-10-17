/**
 * bit3labs: Client logic
 * UI behaviors, theme management, and modal mechanics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStatsObserver();
  initNavbarScrollState();
  initCardGlow();
  initCustomCursor();
  initRouter();
});

// Theme management with localStorage and system preference detection
function initTheme() {
  const saved = localStorage.getItem('theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = isDark ? '☀️' : '🌙';
  });
}

// Mobile navigation drawer toggle
function toggleMobileMenu() {
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

// Direct contact page navigation
function openContactModal(prefillNote = '') {
  const target = prefillNote ? `contact.html?note=${encodeURIComponent(prefillNote)}` : 'contact.html';
  if (typeof window.navigateTo === 'function') {
    window.navigateTo(target);
  } else {
    window.location.href = target;
  }
}

function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function handleOverlayClick(event) {
  if (event.target.id === 'contactModal') {
    closeContactModal();
  }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeContactModal();
    const caseModal = document.getElementById('caseStudyDialog');
    if (caseModal && caseModal.open) caseModal.close();
  }
});

// Form Submission with Feedback
function handleFormSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('projectForm');
  const successState = document.getElementById('formSuccessMessage');
  const submitBtn = document.getElementById('submitBtn');

  if (submitBtn) {
    submitBtn.innerHTML = '<span>Transmitting...</span>';
    submitBtn.disabled = true;
  }

  // Simulate network dispatch
  setTimeout(() => {
    if (form && successState) {
      form.style.display = 'none';
      successState.style.display = 'block';
    }
  }, 600);
}

// Stats counter on scroll
function initStatsObserver() {
  const statsBanner = document.querySelector('.gradient-stats-banner');
  if (!statsBanner) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateNumber('stat-1', 0, 20, '+', 'K');
        animateNumber('stat-2', 0, 3200, '+', '');
        animateNumber('stat-3', 0, 100, '+', 'K');
        animateNumber('stat-4', 0, 10, '+', '');
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsBanner);
}

function animateNumber(elementId, start, end, prefix = '', suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const duration = 1400; // ms
  const frameRate = 30; // ms
  const totalSteps = duration / frameRate;
  const stepIncrement = (end - start) / totalSteps;
  let currentVal = start;

  const timer = setInterval(() => {
    currentVal += stepIncrement;
    if (currentVal >= end) {
      currentVal = end;
      clearInterval(timer);
    }
    const formatted = end >= 1000 ? Math.floor(currentVal).toLocaleString() : Math.floor(currentVal);
    el.textContent = `${prefix}${formatted}${suffix}`;
  }, frameRate);
}

// Navbar elevation on scroll (Framer Emeth pill dock state)
function initNavbarScrollState() {
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

  // Close mobile menu on resize to desktop
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

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const nav = document.querySelector('.nav-pill');
    const menu = document.getElementById('nav-menu');
    const btn = document.querySelector('.mobile-toggle-btn');
    if (menu && menu.classList.contains('is-open') && nav && !nav.contains(e.target)) {
      menu.classList.remove('is-open');
      if (btn) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

// Hero dashboard tab switching
function switchDashboardTab(tabName) {
  document.querySelectorAll('.dash-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.dashboard-view').forEach(view => {
    view.classList.toggle('active', view.dataset.view === tabName);
  });

  if (tabName === 'api') {
    startApiStreamSimulation();
  }
}

let apiInterval = null;
function startApiStreamSimulation() {
  if (apiInterval) return;
  const stream = document.getElementById('apiLogStream');
  if (!stream) return;

  const sampleEndpoints = [
    { m: 'GET', ep: '/v1/clusters/eu-central-1/metrics', lat: '4ms' },
    { m: 'POST', ep: '/v1/events/dispatch-stream', lat: '12ms' },
    { m: 'gRPC', ep: 'bit3labs.DataService.SyncState', lat: '2ms' },
    { m: 'GET', ep: '/v1/telemetry/nodes/health', lat: '8ms' },
    { m: 'POST', ep: '/v1/auth/exchange-token', lat: '16ms' }
  ];

  apiInterval = setInterval(() => {
    if (!document.querySelector('.dashboard-view[data-view="api"].active')) return;
    const item = sampleEndpoints[Math.floor(Math.random() * sampleEndpoints.length)];
    const row = document.createElement('div');
    row.className = 'api-log-row';
    const methodClass = item.m === 'GET' ? 'method-get' : (item.m === 'POST' ? 'method-post' : 'method-grpc');
    row.innerHTML = `
      <span class="api-badge-method ${methodClass}">${item.m}</span>
      <span class="api-endpoint-text">${item.ep}</span>
      <span class="api-latency">${item.lat}</span>
    `;
    stream.prepend(row);
    if (stream.children.length > 5) stream.removeChild(stream.lastChild);
  }, 1600);
}

let isHighLoad = false;
function toggleTelemetryDemo() {
  isHighLoad = !isHighLoad;
  const statusPill = document.querySelector('.dashboard-status-pill span:last-child');
  const flowNodes = document.querySelectorAll('.flow-node');
  
  if (isHighLoad) {
    if (statusPill) statusPill.textContent = 'Simulated Load: 45,000 req/s';
    flowNodes.forEach(node => {
      node.style.boxShadow = '0 0 16px rgba(37, 99, 235, 0.35)';
      node.style.borderColor = '#3b82f6';
    });
  } else {
    if (statusPill) statusPill.textContent = 'System Health: 99.99%';
    flowNodes.forEach(node => {
      node.style.boxShadow = '';
      node.style.borderColor = '';
    });
  }
}


// Card spotlight hover effect
function initCardGlow() {
  document.querySelectorAll('.glow-card, .process-card, .capability-highlight-card, .schematic-card').forEach(card => {
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

// Case study dialog
const caseStudyData = {
  web: {
    title: 'HealthSync Exchange Portal',
    subtitle: 'Zero-trust HIPAA-compliant medical web application & client portal',
    problem: 'The client faced severe latency and security risks synchronizing electronic health records across 40 diagnostic clinical facilities.',
    architecture: 'Next.js 15 App Router with Edge SSR, cryptographic audit trails, OAuth 2.0 / SAML SSO, and partitioned PostgreSQL schemas.',
    result: 'Achieved 100% HIPAA compliance audit score and reduced clinical record retrieval latency to under 85ms.'
  },
  mobile: {
    title: 'FieldOps Mobile Suite',
    subtitle: 'Offline-first native mobile application for iOS & Android',
    problem: 'Over 4,000 field technicians experienced lost work orders and application freezing when servicing equipment in remote subterranean basements.',
    architecture: 'React Native with native Swift & Kotlin hardware bridges, local encrypted SQLite databases, CRDT conflict reconciliation, and background sync queues.',
    result: 'Eliminated 100% of field data loss incidents and decreased service ticket turnaround time by 38% across both iOS and Android fleets.'
  },
  erp: {
    title: 'OmniFlow Global ERP',
    subtitle: 'Custom enterprise ERP & multi-warehouse inventory engine',
    problem: 'The client was spending $350K/year in legacy commercial ERP seat fees while suffering warehouse stock desynchronization and 4-second query delays.',
    architecture: 'Custom ERP core in Go and React 19, distributed transaction sagas for inventory reservation, automated double-entry general ledger, and multi-currency billing.',
    result: 'Reduced order reconciliation from 18 minutes to 4 seconds, eliminated recurring seat fees permanently, and unified 14 international fulfillment hubs.'
  },
  // Backward compatibility aliases
  software: {
    title: 'OmniFlow Global ERP',
    subtitle: 'Custom enterprise ERP & multi-warehouse inventory engine',
    problem: 'Legacy ERP seat fees and inventory race conditions across multiple warehouse locations.',
    architecture: 'Custom ERP core in Go and React 19 with distributed transaction sagas and automated general ledger.',
    result: 'Eliminated recurring seat licenses permanently and brought stock reconciliation to under 4 seconds.'
  },
  cloud: {
    title: 'FieldOps Mobile Suite',
    subtitle: 'Offline-first native mobile application for iOS & Android',
    problem: 'Data loss when field technicians operated in low-connectivity industrial zones.',
    architecture: 'Local encrypted SQLite, CRDT synchronization, and background sync pipelines.',
    result: 'Eliminated 100% of field data loss across 4,000 active devices.'
  }
};

function openCaseStudy(type) {
  const dialog = document.getElementById('caseStudyDialog');
  const data = caseStudyData[type] || caseStudyData['web'];
  if (!dialog) return;

  const titleEl = document.getElementById('caseTitle');
  const subEl = document.getElementById('caseSubtitle');
  const probEl = document.getElementById('caseProblem');
  const archEl = document.getElementById('caseArch');
  const resEl = document.getElementById('caseResult');

  if (titleEl) titleEl.textContent = data.title;
  if (subEl) subEl.textContent = data.subtitle;
  if (probEl) probEl.textContent = data.problem;
  if (archEl) archEl.textContent = data.architecture;
  if (resEl) resEl.textContent = data.result;

  dialog.showModal();
}

function closeCaseStudy() {
  const dialog = document.getElementById('caseStudyDialog');
  if (dialog) dialog.close();
}

// Simple and smooth Figma cursor (black border, white center)
function initCustomCursor() {
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

  // Restore cursor coordinates from session if available to avoid any jump
  const savedX = parseFloat(sessionStorage.getItem('bit3labs_cursor_x'));
  const savedY = parseFloat(sessionStorage.getItem('bit3labs_cursor_y'));
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
    sessionStorage.setItem('bit3labs_cursor_x', mouseX);
    sessionStorage.setItem('bit3labs_cursor_y', mouseY);

    // CRITICAL: On the first movement, snap immediately to mouse pointer
    // so it NEVER lerps or flies in from the top of the screen!
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
    const target = e.target;
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

  // Smooth lerp loop (arrow tip is at 3.5px, 2.5px)
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

// ==================== PRODUCTION CLIENT-SIDE ROUTER (SPA / PJAX) ====================
function initRouter() {
  if (window.__bit3labsRouterInitialized) return;
  window.__bit3labsRouterInitialized = true;

  // Cache for instant page transitions
  const pageCache = new Map();

  // Create sleek top loading progress bar
  let progressBar = document.getElementById('routeProgressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'routeProgressBar';
    progressBar.className = 'route-progress-bar';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
  }

  // Pre-cache current page
  const initialUrl = normalizeUrl(window.location.href);
  pageCache.set(initialUrl, document.documentElement.outerHTML);

  // Link click delegation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip special links, downloads, external, or modifier keys
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

    // Cross-origin links
    if (targetUrl.origin !== currentUrl.origin) return;

    // Anchor hash link on current page
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

    // Smooth client-side navigation
    e.preventDefault();
    navigateTo(targetUrl.href);
  });

  // Prefetch pages on mouseover for 0ms latency
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a');
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

  // Handle browser Back / Forward buttons
  window.addEventListener('popstate', () => {
    navigateTo(window.location.href, false);
  });

  async function prefetchPage(url) {
    const cleanUrl = normalizeUrl(url);
    if (pageCache.has(cleanUrl)) return pageCache.get(cleanUrl);
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

  async function navigateTo(url, push = true) {
    const cleanUrl = normalizeUrl(url);

    // Start progress bar
    if (progressBar) {
      progressBar.classList.add('is-loading');
      progressBar.style.width = '35%';
    }

    // Close mobile drawer if open
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

    // Smoothly fade out current main content
    const currentMain = document.querySelector('main');
    if (currentMain) {
      currentMain.classList.add('route-transition-out');
    }

    try {
      if (progressBar) progressBar.style.width = '65%';

      let html = pageCache.get(cleanUrl);
      if (!html) {
        html = await prefetchPage(cleanUrl);
      }

      if (!html) {
        window.location.href = url;
        return;
      }

      if (progressBar) progressBar.style.width = '90%';

      // Parse incoming page
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      const newMain = newDoc.querySelector('main');

      if (!newMain) {
        window.location.href = url;
        return;
      }

      // Sync stylesheets into <head> before swapping
      syncHeadStyles(newDoc);

      // Brief transition pause
      await new Promise(resolve => setTimeout(resolve, 80));

      // Swap main content
      if (currentMain) {
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.className = newMain.className;
        currentMain.id = newMain.id;
      }

      // Update page title and description
      document.title = newDoc.title;
      const newDesc = newDoc.querySelector('meta[name="description"]');
      const curDesc = document.querySelector('meta[name="description"]');
      if (newDesc && curDesc) {
        curDesc.setAttribute('content', newDesc.getAttribute('content'));
      }

      // Update browser history
      if (push) {
        window.history.pushState({ url: cleanUrl }, '', url);
      }

      // Update active nav-pill link
      updateActiveNavLinks(cleanUrl);

      // Reset scroll position immediately
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      // Execute scripts from newly injected page if present
      runPageScripts(currentMain);

      // Re-initialize all page-specific features and interactive listeners
      reinitPageComponents(cleanUrl);

      // Reveal main with smooth fade-in
      if (currentMain) {
        currentMain.classList.remove('route-transition-out');
        currentMain.classList.add('route-transition-in');
        setTimeout(() => currentMain.classList.remove('route-transition-in'), 300);
      }

      // Finish progress bar
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

  function normalizeUrl(url) {
    try {
      const u = new URL(url, window.location.href);
      return u.origin + u.pathname;
    } catch (_) {
      return url;
    }
  }

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

  function updateActiveNavLinks(currentUrl) {
    const pathname = new URL(currentUrl, window.location.href).pathname;
    const pageName = pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-menu .nav-link').forEach((link) => {
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

  function runPageScripts(container) {
    if (!container) return;
    const scripts = container.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  window.navigateTo = navigateTo;
  window.navigateToUrl = navigateTo;
}

// Global component re-initializers for client-side transitions
function reinitPageComponents(url) {
  initNavbarScrollState();
  initCardGlow();
  initStatsObserver();

  // If on process page, activate phase tabs
  if (document.querySelector('.framer-tab-btn')) {
    initProcessPage();
  }

  // If on projects page, activate filters
  if (document.querySelector('.project-card')) {
    initProjectsPage();
  }

  // If on contact page, activate multi-step form
  if (document.getElementById('contactPageForm')) {
    initContactPage();
  }
}

// Process page phase tabs controller
function setPhaseTab(phaseNum) {
  const tabs = document.querySelectorAll('.framer-tab-btn');
  const panes = document.querySelectorAll('.framer-showcase-pane');

  tabs.forEach(tab => {
    const isTarget = parseInt(tab.getAttribute('data-phase'), 10) === phaseNum;
    tab.classList.toggle('active', isTarget);
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  panes.forEach(pane => {
    const isTarget = parseInt(pane.getAttribute('data-pane'), 10) === phaseNum;
    pane.classList.toggle('active', isTarget);
  });
}
window.setPhaseTab = setPhaseTab;

function initProcessPage() {
  const tabs = document.querySelectorAll('.framer-tab-btn');
  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (e) => {
      let nextIndex = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      }
      if (nextIndex !== null) {
        tabs[nextIndex].focus();
        setPhaseTab(nextIndex + 1);
      }
    });
  });
}

// Projects page category filter controller
let activeProjectCategory = 'all';
function filterProjects(category, btn) {
  document.querySelectorAll('.filter-pill').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');
  activeProjectCategory = category;
  applyProjectFilters();
}
window.filterProjects = filterProjects;

function searchProjects(query) {
  applyProjectFilters(query.toLowerCase().trim());
}
window.searchProjects = searchProjects;

function applyProjectFilters(searchQuery = document.getElementById('projectSearch')?.value.toLowerCase().trim() || '') {
  document.querySelectorAll('.project-card').forEach(card => {
    const matchesCategory = (activeProjectCategory === 'all' || card.dataset.category === activeProjectCategory);
    const matchesSearch = !searchQuery || card.textContent.toLowerCase().includes(searchQuery);
    card.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
  });
}
window.applyProjectFilters = applyProjectFilters;

function initProjectsPage() {
  activeProjectCategory = 'all';
  applyProjectFilters();
}

// Contact page multi-step form controller
let contactCurrentStep = 1;
let contactMaxStep = 1;
let contactSelectedScope = 'custom-web';

const contactStepMeta = {
  1: { title: 'Contact Details', percent: '0%', pill: 'Step 1 of 3', width: '0%' },
  2: { title: 'Organization & Scope', percent: '50%', pill: 'Step 2 of 3', width: '50%' },
  3: { title: 'Architecture Specs', percent: '100%', pill: 'Step 3 of 3', width: '100%' }
};

const contactScopeLabels = {
  'custom-web': 'Web Applications',
  'mobile-app': 'Mobile Apps (iOS & Android)',
  'custom-erp': 'Custom ERP Systems',
  'full-suite': 'Integrated Suite (Web, Mobile & ERP)'
};

function selectProjectType(val) {
  contactSelectedScope = val;
  const hiddenSelect = document.getElementById('contactSystemType');
  if (hiddenSelect) hiddenSelect.value = val;

  document.querySelectorAll('.scope-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-val') === val);
  });

  const typeErr = document.getElementById('typeError');
  if (typeErr) typeErr.style.display = 'none';

  updateLiveContactSummary();
}
window.selectProjectType = selectProjectType;

function appendSpecTag(tagText) {
  const textarea = document.getElementById('contactProjectSpecs');
  if (!textarea) return;

  const currentVal = textarea.value.trim();
  if (!currentVal) {
    textarea.value = `• ${tagText}`;
  } else if (!currentVal.includes(tagText)) {
    textarea.value = `${currentVal}\n• ${tagText}`;
  }
  textarea.focus();

  const specsErr = document.getElementById('specsError');
  if (specsErr) specsErr.style.display = 'none';
  textarea.classList.remove('is-invalid');
}
window.appendSpecTag = appendSpecTag;

function updateLiveContactSummary() {
  const nameInput = document.getElementById('contactFullName');
  const emailInput = document.getElementById('contactWorkEmail');
  const companyInput = document.getElementById('contactCompany');

  const nameVal = nameInput ? nameInput.value.trim() : '';
  const emailVal = emailInput ? emailInput.value.trim() : '';
  const compVal = companyInput ? companyInput.value.trim() : '';

  const summaryClient = document.getElementById('summaryClientName');
  const summaryEmail = document.getElementById('summaryClientEmail');
  const summaryScope = document.getElementById('summaryClientScope');

  if (summaryClient) {
    summaryClient.textContent = nameVal ? (compVal ? `${nameVal} (${compVal})` : nameVal) : 'Independent Founder';
  }
  if (summaryEmail) {
    summaryEmail.textContent = emailVal || '—';
  }
  if (summaryScope) {
    summaryScope.textContent = contactScopeLabels[contactSelectedScope] || 'Custom Architecture';
  }
}

function validateContactStep(step) {
  let isValid = true;

  if (step === 1) {
    const nameInput = document.getElementById('contactFullName');
    const nameErr = document.getElementById('nameError');
    const emailInput = document.getElementById('contactWorkEmail');
    const emailErr = document.getElementById('emailError');

    if (nameInput && !nameInput.value.trim()) {
      nameInput.classList.add('is-invalid');
      if (nameErr) nameErr.style.display = 'block';
      isValid = false;
      nameInput.focus();
    } else if (nameInput) {
      nameInput.classList.remove('is-invalid');
      if (nameErr) nameErr.style.display = 'none';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim()))) {
      emailInput.classList.add('is-invalid');
      if (emailErr) emailErr.style.display = 'block';
      if (isValid && emailInput) emailInput.focus();
      isValid = false;
    } else if (emailInput) {
      emailInput.classList.remove('is-invalid');
      if (emailErr) emailErr.style.display = 'none';
    }
  }

  if (step === 2) {
    const typeErr = document.getElementById('typeError');
    if (!contactSelectedScope) {
      if (typeErr) typeErr.style.display = 'block';
      isValid = false;
    } else if (typeErr) {
      typeErr.style.display = 'none';
    }
  }

  if (step === 3) {
    const specsTextarea = document.getElementById('contactProjectSpecs');
    const specsErr = document.getElementById('specsError');
    if (specsTextarea && (!specsTextarea.value.trim() || specsTextarea.value.trim().length < 5)) {
      specsTextarea.classList.add('is-invalid');
      if (specsErr) specsErr.style.display = 'block';
      specsTextarea.focus();
      isValid = false;
    } else if (specsTextarea) {
      specsTextarea.classList.remove('is-invalid');
      if (specsErr) specsErr.style.display = 'none';
    }
  }

  return isValid;
}

function updateStepperUI(step) {
  const meta = contactStepMeta[step];
  if (!meta) return;

  const pill = document.getElementById('stepPill');
  const title = document.getElementById('stepTitleText');
  const percent = document.getElementById('stepPercent');
  const progressFill = document.getElementById('progressBarFill');

  if (pill) pill.textContent = meta.pill;
  if (title) title.textContent = meta.title;
  if (percent) percent.textContent = meta.percent;
  if (progressFill) progressFill.style.width = meta.width;

  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`stepNode${i}`);
    const circle = document.getElementById(`nodeCircle${i}`);
    if (!node || !circle) continue;

    node.classList.remove('active', 'completed');
    if (i === step) {
      node.classList.add('active');
      circle.textContent = i;
    } else if (i < step) {
      node.classList.add('completed');
      circle.textContent = '✓';
    } else {
      circle.textContent = i;
    }
  }

  const line1 = document.getElementById('stepLine1');
  const line2 = document.getElementById('stepLine2');
  if (line1) line1.classList.toggle('completed', step >= 2);
  if (line2) line2.classList.toggle('completed', step >= 3);

  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`formStep${i}`);
    if (stepEl) {
      stepEl.classList.toggle('active', i === step);
    }
  }

  if (step === 3) {
    updateLiveContactSummary();
  }
}

function nextStep(fromStep) {
  if (!validateContactStep(fromStep)) return;
  contactCurrentStep = fromStep + 1;
  if (contactCurrentStep > contactMaxStep) contactMaxStep = contactCurrentStep;
  updateStepperUI(contactCurrentStep);
}
window.nextStep = nextStep;

function prevStep(fromStep) {
  if (fromStep <= 1) return;
  contactCurrentStep = fromStep - 1;
  updateStepperUI(contactCurrentStep);
}
window.prevStep = prevStep;

function jumpToStep(target) {
  if (target === contactCurrentStep) return;
  if (target > contactCurrentStep) {
    for (let s = contactCurrentStep; s < target; s++) {
      if (!validateContactStep(s)) return;
    }
  }
  contactCurrentStep = target;
  if (contactCurrentStep > contactMaxStep) contactMaxStep = contactCurrentStep;
  updateStepperUI(contactCurrentStep);
}
window.jumpToStep = jumpToStep;

function handleContactSubmit(e) {
  if (e) e.preventDefault();
  if (!validateContactStep(3)) return;

  const btn = document.getElementById('contactSubmitBtn');
  if (btn) {
    btn.innerHTML = '<span>Scheduling Lead Architect...</span>';
    btn.disabled = true;
  }

  setTimeout(() => {
    const form = document.getElementById('contactPageForm');
    const stepper = document.querySelector('.form-stepper-wrap');
    const notice = document.getElementById('contactSuccessNotice');
    if (form) form.style.display = 'none';
    if (stepper) stepper.style.display = 'none';
    if (notice) notice.style.display = 'block';
  }, 600);
}
window.handleContactSubmit = handleContactSubmit;

function copyEmail(btn) {
  navigator.clipboard.writeText('hello@bit3labs.com').then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = '#10b981';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = '';
    }, 2000);
  });
}
window.copyEmail = copyEmail;

function initContactPage() {
  contactCurrentStep = 1;
  contactMaxStep = 1;
  contactSelectedScope = 'custom-web';
  updateStepperUI(1);

  const nameInput = document.getElementById('contactFullName');
  const emailInput = document.getElementById('contactWorkEmail');
  const specsTextarea = document.getElementById('contactProjectSpecs');

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.classList.remove('is-invalid');
      const err = document.getElementById('nameError');
      if (err) err.style.display = 'none';
      updateLiveContactSummary();
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('is-invalid');
      const err = document.getElementById('emailError');
      if (err) err.style.display = 'none';
      updateLiveContactSummary();
    });
  }

  if (specsTextarea) {
    specsTextarea.addEventListener('input', () => {
      specsTextarea.classList.remove('is-invalid');
      const err = document.getElementById('specsError');
      if (err) err.style.display = 'none';
    });
  }
}




