/**
 * NOVACORE SYSTEMS — JAVASCRIPT LOGIC
 * Interactive UI behaviors, telemetry simulation, theme management, scope estimator, and modal mechanics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStatsObserver();
  initNavbarScrollState();
  initCardGlow();
  initScopeEstimator();
});

// --- 1. THEME ENGINE (DARK / LIGHT BLUEPRINT) ---
// ponytail: 12-line native theme switcher with localStorage & OS preference detection
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

// --- 2. MOBILE MENU DRAWER ---
// ponytail: native 4-line drawer toggle
function toggleMobileMenu() {
  const menu = document.getElementById('nav-menu');
  const btn = document.querySelector('.mobile-toggle-btn');
  if (menu) {
    const isOpen = menu.classList.toggle('is-open');
    if (btn) btn.setAttribute('aria-expanded', isOpen);
  }
}

// --- 3. MODAL / CONTACT DRAWER CONTROLS ---
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

// --- 4. STATS NUMBER COUNT-UP ON SCROLL ---
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

// --- 5. NAVBAR GLASS BLUR EFFECT ON SCROLL ---
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

// --- 6. HERO DASHBOARD TABS & SIMULATION ---
function switchDashboardTab(tabName) {
  // Update Tab Buttons
  document.querySelectorAll('.dash-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  // Update Views
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

// --- 7. INTERACTIVE ARCHITECTURE SCOPE ESTIMATOR ---
// ponytail: reactive pricing & spec calculation with 0 dependencies
const estimatorState = {
  type: 'web',
  scale: 2, // 1: MVP, 2: Growth, 3: Enterprise
  cloud: 'edge'
};

const scopeSpecs = {
  web: {
    title: 'Custom Web Application',
    time: ['2-3 Weeks', '4-6 Weeks', '8-12 Weeks'],
    stack: [
      'Next.js 15 + Supabase + Tailwind + Edge CDN',
      'React 19 + Node.js Microservices + PostgreSQL + Redis',
      'Micro-frontend Architecture + Multi-region Go APIs + CockroachDB'
    ],
    team: ['1 Fullstack Architect', '1 Architect + 2 Fullstack Devs', 'Dedicated 4-Engineer System Pod']
  },
  software: {
    title: 'Enterprise Software Engine',
    time: ['3-4 Weeks', '6-8 Weeks', '10-14 Weeks'],
    stack: [
      'FastAPI + Postgres Core + Docker Compose',
      'Distributed Python/Go Core + Kafka Event Bus + PostgreSQL',
      'Event-Sourced Event Engine + K8s Mesh + Multi-Zone Cluster'
    ],
    team: ['1 Backend Architect', '1 Principal + 2 Backend Specialists', 'Full Distributed Systems Pod']
  },
  cloud: {
    title: 'Automated Cloud Platform',
    time: ['2-3 Weeks', '4-5 Weeks', '6-8 Weeks'],
    stack: [
      'AWS Lambda Serverless + Terraform + GitHub Actions CI/CD',
      'AWS EKS / GCP GKE + ArgoCD + Datadog + Automated Scaling',
      'Zero-Trust Multi-Cloud Mesh + Cloudflare Workers + Distributed DB'
    ],
    team: ['1 Cloud Engineer', '1 DevOps Architect + 1 Systems Dev', 'Dedicated SRE & Infra Pod']
  }
};

function initScopeEstimator() {
  const container = document.getElementById('estimatorSection');
  if (!container) return;
  updateEstimatorView();
}

function setEstimatorType(type, btn) {
  estimatorState.type = type;
  document.querySelectorAll('[data-est-type]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateEstimatorView();
}

function setEstimatorScale(val) {
  estimatorState.scale = parseInt(val, 10);
  updateEstimatorView();
}

function setEstimatorCloud(cloud, btn) {
  estimatorState.cloud = cloud;
  document.querySelectorAll('[data-est-cloud]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateEstimatorView();
}

function updateEstimatorView() {
  const current = scopeSpecs[estimatorState.type];
  if (!current) return;
  const idx = estimatorState.scale - 1;

  const timeEl = document.getElementById('estTimeVal');
  const stackEl = document.getElementById('estStackVal');
  const teamEl = document.getElementById('estTeamVal');

  if (timeEl) timeEl.textContent = current.time[idx];
  if (stackEl) stackEl.textContent = current.stack[idx];
  if (teamEl) teamEl.textContent = current.team[idx];
}

function transferEstimatorToModal() {
  const current = scopeSpecs[estimatorState.type];
  const idx = estimatorState.scale - 1;
  const scaleName = idx === 0 ? 'MVP Launch' : (idx === 1 ? 'Growth Scale' : 'Global Enterprise');
  const note = `[Scope Estimator Blueprint]\n- Solution Domain: ${current.title}\n- Target Scale: ${scaleName}\n- Estimated Sprint: ${current.time[idx]}\n- Recommended Stack: ${current.stack[idx]}\n\nPlease review our technical architecture roadmap.`;
  openContactModal(note);
}

// --- 8. SUBTLE CARD SPOTLIGHT HOVER EFFECT ---
// ponytail: native pointermove updating CSS variables for spotlight borders
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

// --- 9. CASE STUDY MODAL FOR PROJECTS.HTML ---
// ponytail: HTML5 <dialog> gives native backdrop, ESC-key dismiss, and focus trap with zero library
const caseStudyData = {
  web: {
    title: 'OmniFlow Global ERP',
    subtitle: 'Custom administrative web portal & multi-currency billing engine',
    problem: 'The client faced crippling latency (>3.5s page loads) and inventory race conditions across 14 European distribution warehouses.',
    architecture: 'Next.js 15 App Router with Edge SSR, optimistic cache invalidation, and automated PostgreSQL horizontal partitioning.',
    result: 'Reduced global latency to under 85ms and eliminated stock desynchronization.'
  },
  software: {
    title: 'ApexTelemetry Event Engine',
    subtitle: 'High-throughput distributed backend processing 45k ops/sec',
    problem: 'Out-of-the-box message brokers dropped critical telemetry frames under peak traffic spikes.',
    architecture: 'Custom async FastAPI / Python core integrated with Redis Pub/Sub buffer and partitioned time-series storage.',
    result: '100% telemetry capture rate with sub-15ms write confirmation at 45,000 events/second.'
  },
  cloud: {
    title: 'StrataCloud Autoscaler',
    subtitle: 'Autonomous serverless cloud orchestration infrastructure',
    problem: 'Over-provisioned idle compute was draining monthly infrastructure budgets by over $18,000.',
    architecture: 'Custom predictive autoscaler deployed on AWS EKS with event-driven KEDA workers and Terraform state automation.',
    result: 'Decreased month-over-month cloud spend by 42% while improving SLA uptime to 99.99%.'
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
