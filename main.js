/**
 * Novacore Systems: Client logic
 * UI behaviors, theme management, and modal mechanics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStatsObserver();
  initNavbarScrollState();
  initCardGlow();
  initCustomCursor();
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

// Modal and contact drawer controls
function openContactModal(prefillNote = '') {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    if (prefillNote) {
      const msgField = document.getElementById('projectDetails');
      if (msgField) msgField.value = prefillNote;
    }

    setTimeout(() => {
      const firstInput = document.getElementById('clientName');
      if (firstInput) firstInput.focus();
    }, 100);
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
    { m: 'gRPC', ep: 'Novacore.DataService.SyncState', lat: '2ms' },
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
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
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

  document.addEventListener('mouseenter', () => {
    cursor.classList.add('is-visible');
    isVisible = true;
  });

  // Interactive hover states delegation
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    if (target.closest('a, button, [role="button"], .nav-link, .btn, .theme-toggle-btn, .mobile-toggle-btn, .phase-tab-item, .dash-tab-btn, .pill-btn, .filter-pill, .stepper-node, .framer-phase-card, .footer-bottom-links a')) {
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
    cursorX = lerp(cursorX, mouseX, 0.24);
    cursorY = lerp(cursorY, mouseY, 0.24);
    cursor.style.transform = `translate3d(${cursorX - 3.5}px, ${cursorY - 2.5}px, 0)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}



