/**
 * Novacore Systems: Client logic
 * UI behaviors, theme management, and modal mechanics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStatsObserver();
  initNavbarScrollState();
  initCardGlow();
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
  if (menu) {
    const isOpen = menu.classList.toggle('is-open');
    if (btn) btn.setAttribute('aria-expanded', isOpen);
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

// Navbar elevation on scroll
function initNavbarScrollState() {
  const navPill = document.querySelector('.nav-pill');
  if (!navPill) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navPill.style.boxShadow = '0 12px 30px -5px rgba(15, 23, 42, 0.12)';
    } else {
      navPill.style.boxShadow = '0 10px 25px -5px rgba(15, 23, 42, 0.05)';
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
