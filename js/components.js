/**
 * @fileoverview UI Components, Modals, Forms & Page Controllers for bit3labs
 * Handles the multi-step consultation wizard, native case study dialogs,
 * process phase tabs, and portfolio category filters.
 * @module components
 */

// ==================== 1. MODAL CONSULTATION DRAWER ====================

/**
 * Open the quick consultation modal drawer or navigate to contact.html.
 * @param {string} [prefillNote=''] - Optional note prefill.
 * @returns {void}
 */
export function openContactModal(prefillNote = '') {
  const target = prefillNote ? `contact.html?note=${encodeURIComponent(prefillNote)}` : 'contact.html';
  if (typeof window.navigateTo === 'function') {
    window.navigateTo(target);
  } else {
    window.location.href = target;
  }
}

/**
 * Close the interactive contact modal drawer.
 * @returns {void}
 */
export function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

/**
 * Handle backdrop clicks on modal overlays.
 * @param {MouseEvent} event - Click event.
 * @returns {void}
 */
export function handleOverlayClick(event) {
  const target = /** @type {HTMLElement} */ (event.target);
  if (target && target.id === 'contactModal') {
    closeContactModal();
  }
}

/**
 * Handle consultation modal form submission with feedback animation.
 * @param {Event} event - Submit event.
 * @returns {void}
 */
export function handleFormSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('projectForm');
  const successState = document.getElementById('formSuccessMessage');
  const submitBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById('submitBtn'));

  if (submitBtn) {
    submitBtn.innerHTML = '<span>Transmitting...</span>';
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    if (form && successState) {
      form.style.display = 'none';
      successState.style.display = 'block';
    }
  }, 600);
}

// Global Escape listener for accessible dialog closing
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeContactModal();
    const caseModal = /** @type {HTMLDialogElement|null} */ (document.getElementById('caseStudyDialog'));
    if (caseModal && caseModal.open) caseModal.close();
  }
});


// ==================== 2. CASE STUDY DIALOG ====================

/**
 * Architectural case study dataset with complete stack blueprints and metrics.
 * @type {Record<string, {
 *   title: string,
 *   subtitle: string,
 *   problem: string,
 *   architecture: string,
 *   result: string,
 *   stack: string[],
 *   metrics: { p99: string, throughput: string, efficiency: string },
 *   dataPattern: string
 * }>}
 */
export const caseStudyData = {
  erp: {
    title: 'OmniFlow Global ERP',
    subtitle: 'Custom enterprise ERP & multi-warehouse inventory engine',
    problem: 'The client was spending $350K/year in legacy commercial ERP seat fees while suffering warehouse stock desynchronization and 4-second query delays across 14 international fulfillment hubs.',
    architecture: 'Custom ERP core in Go and React 19, distributed transaction sagas for inventory reservation, automated double-entry general ledger, and multi-currency billing.',
    result: 'Reduced order reconciliation from 18 minutes to 4 seconds, eliminated recurring seat fees permanently, and unified 14 international fulfillment hubs.',
    stack: ['Go (Golang)', 'PostgreSQL 16', 'React 19', 'Redis Cluster', 'Docker / K8s', 'gRPC'],
    metrics: { p99: '84ms P99', throughput: '18,500 req/s', efficiency: '-$350K/yr Seats' },
    dataPattern: 'Distributed transaction sagas with idempotent ledger entries, write-ahead logs, and read-replicas per geographic zone.'
  },
  mobile: {
    title: 'FieldOps Mobile Suite',
    subtitle: 'Offline-first native mobile application for iOS & Android',
    problem: 'Over 4,000 field technicians experienced lost work orders and application freezing when servicing equipment in remote subterranean basements without cellular service.',
    architecture: 'React Native with native Swift & Kotlin hardware bridges, local encrypted SQLite databases, CRDT conflict reconciliation, and background sync queues.',
    result: 'Eliminated 100% of field data loss incidents and decreased service ticket turnaround time by 38% across both iOS and Android fleets.',
    stack: ['Swift', 'Kotlin', 'SQLite / SQLCipher', 'CRDTs', 'Node.js', 'WebSockets'],
    metrics: { p99: '0s Data Loss', throughput: '60 FPS Native', efficiency: '+38% Field Velocity' },
    dataPattern: 'Local-first encrypted SQLite database utilizing Conflict-free Replicated Data Types (CRDTs) with deterministic state vector merges.'
  },
  web: {
    title: 'HealthSync Exchange Portal',
    subtitle: 'Zero-trust HIPAA-compliant medical web application & client portal',
    problem: 'The client faced severe latency and security risks synchronizing electronic health records across 40 diagnostic clinical facilities.',
    architecture: 'Next.js 15 App Router with Edge SSR, cryptographic audit trails, OAuth 2.0 / SAML SSO, and partitioned PostgreSQL schemas.',
    result: 'Achieved 100% HIPAA compliance audit score and reduced clinical record retrieval latency to under 85ms.',
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL (RLS)', 'Redis Cache', 'OAuth 2.0 / SAML', 'Tailwind'],
    metrics: { p99: '42ms P99', throughput: '12,500 req/s', efficiency: '100% HIPAA Score' },
    dataPattern: 'PostgreSQL Row-Level Security (RLS) with AES-256 GCM encrypted field storage and append-only cryptographic audit logs.'
  },
  apex: {
    title: 'ApexLedger Manufacturing ERP',
    subtitle: 'Shop-floor automated machine scheduling & double-entry accounting',
    problem: 'High-cost SAP licenses with 2-minute batch inventory sync delays causing assembly line work stoppages.',
    architecture: 'Event-driven Rust microservices, Apache Kafka event streams, and real-time WebSockets telemetry to shop-floor tablets.',
    result: 'Eliminated $420,000 in recurring annual SAP seat fees and cut bill-of-materials recalculation from 120s to 1.2s.',
    stack: ['Rust', 'Apache Kafka', 'PostgreSQL', 'WebSockets', 'Tailwind', 'Docker'],
    metrics: { p99: '18ms P99', throughput: '35,000 events/s', efficiency: '-$420K SAP Fees' },
    dataPattern: 'Event-sourced ledger architecture using Kafka topic partitions with zero-downtime schema evolution.'
  },
  swiftpay: {
    title: 'SwiftPay Consumer Wallet',
    subtitle: 'Fintech mobile application with Secure Enclave biometrics',
    problem: 'High fraudulent chargeback rates and 2.4-second peer-to-peer transfer lag during peak shopping volumes.',
    architecture: 'Native iOS (Swift) & Android (Kotlin) app with Apple Secure Enclave & Android Keystore hardware biometric signature verification.',
    result: 'Achieved sub-0.8s cold app launch, zero credential theft vulnerabilities, and 4.9★ rating across 250,000 active users.',
    stack: ['Swift', 'Kotlin', 'Go API Gateway', 'PostgreSQL', 'Redis', 'Apple Pay API'],
    metrics: { p99: '0.8s Cold Launch', throughput: '250K Users', efficiency: '99.999% Settlement' },
    dataPattern: 'Hardware-backed asymmetric key cryptography with mutual TLS (mTLS) token-bound API sessions.'
  },
  quantpulse: {
    title: 'QuantPulse Trading Terminal',
    subtitle: 'Institutional algorithmic trading terminal & market streaming web portal',
    problem: 'Browser tab memory leaks and 300ms WebSocket rendering lag causing missed financial arbitrage opportunities.',
    architecture: 'High-performance Canvas & WebGL rendering pipeline with Rust WebAssembly data decoder and multiplexed binary WebSockets.',
    result: 'Reduced order execution and order book depth streaming latency to under 15ms with $850M+ daily transacted volume.',
    stack: ['Rust (Wasm)', 'WebGL / Canvas', 'TypeScript', 'Binary WebSockets', 'ClickHouse', 'Redis'],
    metrics: { p99: '12ms Latency', throughput: '$850M+ Daily', efficiency: '60 FPS at 100K updates' },
    dataPattern: 'Columnar ClickHouse time-series storage with ring-buffer memory pools and Protobuf binary packet streaming.'
  },
  // Backward compatibility aliases
  software: {
    title: 'OmniFlow Global ERP',
    subtitle: 'Custom enterprise ERP & multi-warehouse inventory engine',
    problem: 'Legacy ERP seat fees and inventory race conditions across multiple warehouse locations.',
    architecture: 'Custom ERP core in Go and React 19 with distributed transaction sagas and automated general ledger.',
    result: 'Eliminated recurring seat licenses permanently and brought stock reconciliation to under 4 seconds.',
    stack: ['Go', 'PostgreSQL 16', 'React 19', 'Redis Cluster'],
    metrics: { p99: '84ms P99', throughput: '18,500 req/s', efficiency: '-$350K/yr Seats' },
    dataPattern: 'Distributed transaction sagas with write-ahead logs and regional read-replicas.'
  },
  cloud: {
    title: 'FieldOps Mobile Suite',
    subtitle: 'Offline-first native mobile application for iOS & Android',
    problem: 'Data loss when field technicians operated in low-connectivity industrial zones.',
    architecture: 'Local encrypted SQLite, CRDT synchronization, and background sync pipelines.',
    result: 'Eliminated 100% of field data loss across 4,000 active devices.',
    stack: ['Swift', 'Kotlin', 'SQLite / SQLCipher', 'CRDTs'],
    metrics: { p99: '0s Data Loss', throughput: '60 FPS Native', efficiency: '+38% Field Velocity' },
    dataPattern: 'Conflict-free Replicated Data Types (CRDTs) with state vector reconciliation.'
  }
};

/**
 * Toggle expanding/collapsing a project case study card with smooth physics and automatic scroll adjustment.
 * @param {string} cardId - Case study identifier ('erp' | 'mobile' | 'web' | 'apex' | 'swiftpay' | 'quantpulse').
 * @param {Event} [event] - Triggering click or keyboard event.
 * @returns {void}
 */
export function toggleCaseStudyCard(cardId, event) {
  if (event) {
    const target = /** @type {HTMLElement|null} */ (event.target);
    // If the click is on an outbound link or inside an action button, do not toggle
    if (target && target.closest('a')) return;
    event.stopPropagation();
  }

  const targetCard = document.getElementById(`project-card-${cardId}`);
  if (!targetCard) return;

  const isCurrentlyExpanded = targetCard.classList.contains('is-expanded');

  // Collapse any other open card for clean accordion physics
  document.querySelectorAll('.project-card.is-expanded').forEach(card => {
    if (card !== targetCard) {
      card.classList.remove('is-expanded');
      card.setAttribute('aria-expanded', 'false');
      const text = card.querySelector('.expand-text');
      if (text) text.textContent = 'Explore Specs';
    }
  });

  if (isCurrentlyExpanded) {
    targetCard.classList.remove('is-expanded');
    targetCard.setAttribute('aria-expanded', 'false');
    const text = targetCard.querySelector('.expand-text');
    if (text) text.textContent = 'Explore Specs';
  } else {
    targetCard.classList.add('is-expanded');
    targetCard.setAttribute('aria-expanded', 'true');
    const text = targetCard.querySelector('.expand-text');
    if (text) text.textContent = 'Collapse';

    // Smooth physics scroll to ensure top of expanded card is in clean reading view
    setTimeout(() => {
      const navOffset = 90;
      const targetPos = targetCard.getBoundingClientRect().top + window.scrollY - navOffset;
      if (window.lenis) {
        window.lenis.scrollTo(targetPos, { duration: 1.2 });
      } else {
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    }, 180);
  }
}

/**
 * Open/expand a specific project case study card.
 * @param {string} cardId - Project key identifier.
 * @returns {void}
 */
export function openCaseStudy(cardId) {
  const targetCard = document.getElementById(`project-card-${cardId}`);
  if (targetCard && !targetCard.classList.contains('is-expanded')) {
    toggleCaseStudyCard(cardId);
  }
}

/**
 * Collapse all expanded project cards.
 * @returns {void}
 */
export function closeCaseStudy() {
  document.querySelectorAll('.project-card.is-expanded').forEach(card => {
    card.classList.remove('is-expanded');
    card.setAttribute('aria-expanded', 'false');
    const text = card.querySelector('.expand-text');
    if (text) text.textContent = 'Explore Specs';
  });
}


// ==================== 2B. ARCHITECTURE CONFIGURATOR COMPATIBILITY ====================

/**
 * Presets mapping for dynamic architecture generation.
 */
const blueprintPresets = {
  web: {
    name: 'Custom High-Throughput Web Platform',
    runtime: 'Go (Golang) / Next.js 15 Edge SSR',
    db: 'PostgreSQL 16 (Partitioned Schemas)',
    cache: 'Redis 7.2 Cluster (Sub-1ms Latency)',
    sync: 'HTTP/2 Server-Sent Events (SSE)',
    security: 'OAuth 2.0 / SAML SSO + RBAC',
    latencyTarget: 'Sub-45ms P99',
    nodes: [
      { icon: '🌐', label: 'Cloudflare Edge', spec: 'Global Anycast' },
      { icon: '⚡', label: 'Go Ingress', spec: 'API Gateway' },
      { icon: '🧩', label: 'App Cluster', spec: 'Next.js 15 SSR' },
      { icon: '🔥', label: 'Redis Cache', spec: 'Sub-1ms Bus' },
      { icon: '🗄️', label: 'Postgres 16', spec: 'Partitioned' }
    ]
  },
  mobile: {
    name: 'Offline-First Native Mobile Architecture',
    runtime: 'Swift 6 (iOS) & Kotlin (Android)',
    db: 'Local SQLCipher (Encrypted SQLite)',
    cache: 'State-Vector CRDT Engine',
    sync: 'Multiplexed WebSockets + Background Queue',
    security: 'Hardware Secure Enclave / Keystore Biometrics',
    latencyTarget: 'Zero Offline Latency (60 FPS)',
    nodes: [
      { icon: '📱', label: 'Native Fleet', spec: 'iOS & Android' },
      { icon: '🔒', label: 'Local SQLite', spec: 'AES-256 Cipher' },
      { icon: '🧬', label: 'CRDT Sync', spec: 'Deterministic' },
      { icon: '⚡', label: 'Ingress Queue', spec: 'Background FIFO' },
      { icon: '🗄️', label: 'Postgres Cloud', spec: 'Event Sourced' }
    ]
  },
  erp: {
    name: 'Distributed Enterprise ERP Hub',
    runtime: 'Go Microservices & React 19 Core',
    db: 'PostgreSQL 16 + TimescaleDB (Time-series)',
    cache: 'Apache Kafka Event Bus + Redis',
    sync: 'Distributed Sagas & Idempotent Ledger',
    security: 'Zero-Trust Multi-Tenant Row-Level Security',
    latencyTarget: 'Sub-100ms Operations & Billing',
    nodes: [
      { icon: '🏭', label: 'Global Hubs', spec: '14 Fulfillment Nodes' },
      { icon: '⚙️', label: 'Go Sagas Core', spec: 'Distributed Ops' },
      { icon: '📬', label: 'Kafka Bus', spec: 'Event Streaming' },
      { icon: '📒', label: 'General Ledger', spec: 'Double-Entry' },
      { icon: '🗄️', label: 'Postgres DB', spec: 'TimescaleDB' }
    ]
  }
};

/**
 * Set platform selection in configurator.
 * @param {'web'|'mobile'|'erp'} platformKey - Selected platform.
 * @returns {void}
 */
export function setArchPlatform(platformKey) {
  archConfigState.platform = platformKey;
  document.querySelectorAll('.arch-platform-btn').forEach(el => {
    const btn = /** @type {HTMLElement} */ (el);
    btn.classList.toggle('active', btn.dataset.val === platformKey);
  });
  renderArchBlueprint();
}

/**
 * Set scale parameter in configurator.
 * @param {'growth'|'scaleup'|'enterprise'} scaleKey - Selected scale tier.
 * @returns {void}
 */
export function setArchScale(scaleKey) {
  archConfigState.scale = scaleKey;
  document.querySelectorAll('.arch-scale-btn').forEach(el => {
    const btn = /** @type {HTMLElement} */ (el);
    btn.classList.toggle('active', btn.dataset.val === scaleKey);
  });
  renderArchBlueprint();
}

/**
 * Toggle an architectural primitive checkbox.
 * @param {string} primitiveKey - Selected capability primitive.
 * @returns {void}
 */
export function toggleArchPrimitive(primitiveKey) {
  if (archConfigState.primitives.has(primitiveKey)) {
    archConfigState.primitives.delete(primitiveKey);
  } else {
    archConfigState.primitives.add(primitiveKey);
  }
  renderArchBlueprint();
}

/**
 * Re-render the live architecture blueprint output.
 * @returns {void}
 */
export function renderArchBlueprint() {
  const preset = blueprintPresets[archConfigState.platform] || blueprintPresets['web'];
  
  // Calculate scale dynamic modifiers
  let scaleNote = '10K - 100K DAU (Scaleup Tier)';
  let latencyStr = preset.latencyTarget;
  if (archConfigState.scale === 'growth') {
    scaleNote = '< 10K DAU (Lean Scalable Foundation)';
    latencyStr = 'Sub-60ms P99';
  } else if (archConfigState.scale === 'enterprise') {
    scaleNote = '1M+ Daily Events (Multi-Region Active-Active)';
    latencyStr = 'Sub-25ms P99 SLA';
  }

  // Update elements
  const titleEl = document.getElementById('blueprintTitle');
  const scaleEl = document.getElementById('blueprintScale');
  const latencyEl = document.getElementById('blueprintLatency');
  const runtimeEl = document.getElementById('blueprintRuntime');
  const dbEl = document.getElementById('blueprintDb');
  const cacheEl = document.getElementById('blueprintCache');
  const securityEl = document.getElementById('blueprintSecurity');

  if (titleEl) titleEl.textContent = preset.name;
  if (scaleEl) scaleEl.textContent = scaleNote;
  if (latencyEl) latencyEl.textContent = latencyStr;
  if (runtimeEl) runtimeEl.textContent = preset.runtime;
  if (dbEl) dbEl.textContent = preset.db;
  if (cacheEl) cacheEl.textContent = preset.cache;
  if (securityEl) securityEl.textContent = preset.security;

  // Render topology nodes
  const nodesRow = document.getElementById('topologyNodesRow');
  if (nodesRow && Array.isArray(preset.nodes)) {
    nodesRow.innerHTML = preset.nodes.map((node, i) => `
      <div class="topology-node">
        <div class="topology-node-icon">${node.icon}</div>
        <strong class="topology-node-label">${node.label}</strong>
        <span class="topology-node-spec">${node.spec}</span>
      </div>
      ${i < preset.nodes.length - 1 ? '<span class="topology-arrow">&rarr;</span>' : ''}
    `).join('');
  }
}

/**
 * Export configured architecture specifications to the consultation intake page.
 * @returns {void}
 */
export function exportArchBlueprint() {
  const preset = blueprintPresets[archConfigState.platform] || blueprintPresets['web'];
  const prims = Array.from(archConfigState.primitives).join(', ');
  const note = `[Engineered Architecture Specification]\n• Target Platform: ${preset.name}\n• Scale Tier: ${archConfigState.scale.toUpperCase()}\n• Core Runtime: ${preset.runtime}\n• Persistence Tier: ${preset.db}\n• Architectural Primitives: ${prims || 'Standard High-Throughput'}`;
  
  const platformScopeMap = {
    web: 'custom-web',
    mobile: 'mobile-app',
    erp: 'custom-erp',
    hft: 'custom-web'
  };
  const scope = platformScopeMap[archConfigState.platform] || 'custom-web';
  const targetUrl = `contact.html?scope=${encodeURIComponent(scope)}&note=${encodeURIComponent(note)}`;
  if (typeof window.navigateTo === 'function') {
    window.navigateTo(targetUrl);
  } else {
    window.location.href = targetUrl;
  }
}



// ==================== 3. PROCESS PAGE PHASE CONTROLLER ====================

/**
 * Set active phase tab and reveal corresponding showcase pane.
 * @param {number} phaseNum - Phase number (1 through 5).
 * @returns {void}
 */
export function setPhaseTab(phaseNum) {
  const tabs = document.querySelectorAll('.framer-tab-btn');
  const panes = document.querySelectorAll('.framer-showcase-pane');

  tabs.forEach(el => {
    const tab = /** @type {HTMLElement} */ (el);
    const isTarget = parseInt(tab.getAttribute('data-phase') || '0', 10) === phaseNum;
    tab.classList.toggle('active', isTarget);
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  panes.forEach(el => {
    const pane = /** @type {HTMLElement} */ (el);
    const isTarget = parseInt(pane.getAttribute('data-pane') || '0', 10) === phaseNum;
    pane.classList.toggle('active', isTarget);
  });
}

/**
 * Initialize accessible keyboard navigation across phase tabs.
 * @returns {void}
 */
export function initProcessPage() {
  const tabs = document.querySelectorAll('.framer-tab-btn');
  tabs.forEach((el, index) => {
    const tab = /** @type {HTMLElement} */ (el);
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
        const nextTab = /** @type {HTMLElement} */ (tabs[nextIndex]);
        nextTab.focus();
        setPhaseTab(nextIndex + 1);
      }
    });
  });
}


// ==================== 4. PROJECTS SHOWCASE CONTROLLER ====================

let activeProjectCategory = 'all';

/**
 * Filter project showcase cards by category.
 * @param {string} category - Target category ('all' | 'custom-web' | 'mobile-app' | 'custom-erp').
 * @param {HTMLElement|null} [btn=null] - Triggering button element.
 * @returns {void}
 */
export function filterProjects(category, btn = null) {
  document.querySelectorAll('.filter-pill').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');
  activeProjectCategory = category;
  closeCaseStudy();
  applyProjectFilters();
}

/**
 * Search projects by text query.
 * @param {string} query - Search term.
 * @returns {void}
 */
export function searchProjects(query) {
  closeCaseStudy();
  applyProjectFilters(query.toLowerCase().trim());
}

/**
 * Filter project cards based on active category and search input.
 * @param {string} [searchQuery] - Search filter string.
 * @returns {void}
 */
export function applyProjectFilters(searchQuery) {
  const query = searchQuery !== undefined ? searchQuery : (/** @type {HTMLInputElement|null} */ (document.getElementById('projectSearch'))?.value.toLowerCase().trim() || '');
  document.querySelectorAll('.project-card').forEach(el => {
    const card = /** @type {HTMLElement} */ (el);
    const matchesCategory = (activeProjectCategory === 'all' || card.dataset.category === activeProjectCategory);
    const matchesSearch = !query || (card.textContent?.toLowerCase().includes(query) ?? false);
    card.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
  });
}

/**
 * Initialize project showcase filters.
 * @returns {void}
 */
export function initProjectsPage() {
  activeProjectCategory = 'all';
  closeCaseStudy();
  applyProjectFilters();
}


// ==================== 5. MULTI-STEP INTAKE CONTROLLER ====================

let contactCurrentStep = 1;
let contactMaxStep = 1;
let contactSelectedScope = 'custom-web';
let currentProjectBenchmark = '';

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

/**
 * Select project type in Step 2.
 * @param {string} val - Project type identifier.
 * @returns {void}
 */
export function selectProjectType(val) {
  contactSelectedScope = val;
  const hiddenSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('contactSystemType'));
  if (hiddenSelect) hiddenSelect.value = val;

  document.querySelectorAll('.scope-card').forEach(el => {
    const card = /** @type {HTMLElement} */ (el);
    card.classList.toggle('selected', card.getAttribute('data-val') === val);
  });

  const typeErr = document.getElementById('typeError');
  if (typeErr) typeErr.style.display = 'none';

  updateLiveContactSummary();
}

/**
 * Append suggested architectural prompt tag to specifications textarea.
 * @param {string} tagText - Architecture keyword snippet.
 * @returns {void}
 */
export function appendSpecTag(tagText) {
  const textarea = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('contactProjectSpecs'));
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

/**
 * Synchronize live summary badge strip in Step 3.
 * @returns {void}
 */
export function updateLiveContactSummary() {
  const nameInput = /** @type {HTMLInputElement|null} */ (document.getElementById('contactFullName'));
  const emailInput = /** @type {HTMLInputElement|null} */ (document.getElementById('contactWorkEmail'));
  const companyInput = /** @type {HTMLInputElement|null} */ (document.getElementById('contactCompany'));

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
    const baseScope = contactScopeLabels[contactSelectedScope] || 'Custom Architecture';
    summaryScope.textContent = currentProjectBenchmark ? `${baseScope} (Benchmark: ${currentProjectBenchmark})` : baseScope;
  }
}

/**
 * Clear the project benchmark referral from the contact intake form.
 * @returns {void}
 */
export function clearProjectReferral() {
  currentProjectBenchmark = '';
  const hiddenRef = /** @type {HTMLInputElement|null} */ (document.getElementById('contactReferencedProject'));
  if (hiddenRef) hiddenRef.value = '';

  const banner = document.getElementById('projectReferralBanner');
  if (banner) banner.style.display = 'none';

  const specsEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('contactProjectSpecs'));
  if (specsEl && specsEl.value.includes('[Project Benchmark Target:')) {
    specsEl.value = '';
  }

  updateLiveContactSummary();
}

/**
 * Validate a specific step of the intake wizard.
 * @param {number} step - Step index (1, 2, or 3).
 * @returns {boolean} Whether the step passes validation.
 */
export function validateContactStep(step) {
  let isValid = true;

  if (step === 1) {
    const nameInput = /** @type {HTMLInputElement|null} */ (document.getElementById('contactFullName'));
    const nameErr = document.getElementById('nameError');
    const emailInput = /** @type {HTMLInputElement|null} */ (document.getElementById('contactWorkEmail'));
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
    const specsTextarea = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('contactProjectSpecs'));
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

/**
 * Update the visual stepper navigation bar.
 * @param {number} step - Step index.
 * @returns {void}
 */
export function updateStepperUI(step) {
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
      circle.textContent = String(i);
    } else if (i < step) {
      node.classList.add('completed');
      circle.textContent = '✓';
    } else {
      circle.textContent = String(i);
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

/**
 * Advance to next step in the intake wizard.
 * @param {number} fromStep - Origin step index.
 * @returns {void}
 */
export function nextStep(fromStep) {
  if (!validateContactStep(fromStep)) return;
  contactCurrentStep = fromStep + 1;
  if (contactCurrentStep > contactMaxStep) contactMaxStep = contactCurrentStep;
  updateStepperUI(contactCurrentStep);
}

/**
 * Return to previous step in the intake wizard.
 * @param {number} fromStep - Origin step index.
 * @returns {void}
 */
export function prevStep(fromStep) {
  if (fromStep <= 1) return;
  contactCurrentStep = fromStep - 1;
  updateStepperUI(contactCurrentStep);
}

/**
 * Jump directly to a step if previous steps are valid.
 * @param {number} target - Destination step index.
 * @returns {void}
 */
export function jumpToStep(target) {
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

/**
 * Handle submission of the multi-step intake form.
 * @param {Event} [e] - Form submit event.
 * @returns {void}
 */
export function handleContactSubmit(e) {
  if (e) e.preventDefault();
  if (!validateContactStep(3)) return;

  const btn = /** @type {HTMLButtonElement|null} */ (document.getElementById('contactSubmitBtn'));
  if (btn) {
    btn.innerHTML = '<span>Scheduling Lead Architect...</span>';
    btn.disabled = true;
  }

  setTimeout(() => {
    const form = document.getElementById('contactPageForm');
    const stepper = document.querySelector('.form-stepper-wrap');
    const notice = document.getElementById('contactSuccessNotice');
    const refBanner = document.getElementById('projectReferralBanner');
    const noticeBody = document.getElementById('successNoticeBody');

    if (refBanner) refBanner.style.display = 'none';
    if (form) form.style.display = 'none';
    if (stepper) stepper.style.display = 'none';
    if (notice) notice.style.display = 'block';

    if (noticeBody && currentProjectBenchmark) {
      noticeBody.textContent = `Our lead software architect has received your specifications for a system modeled on ${currentProjectBenchmark}. We will review your target architecture requirements and send an introductory agenda within 24 hours.`;
    }
  }, 600);
}

/**
 * Copy email address to clipboard with feedback tooltip.
 * @param {HTMLElement} btn - Button element clicked.
 * @returns {void}
 */
export function copyEmail(btn) {
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

/**
 * Initialize contact page form listeners.
 * @returns {void}
 */
export function initContactPage() {
  contactCurrentStep = 1;
  contactMaxStep = 1;
  contactSelectedScope = 'custom-web';
  currentProjectBenchmark = '';
  updateStepperUI(1);

  // Check query parameters for project benchmark referral or prefilled architecture blueprint
  try {
    const params = new URLSearchParams(window.location.search);
    const projectParam = params.get('project');
    const refParam = params.get('ref');
    const scopeParam = params.get('scope');
    const noteParam = params.get('note');

    // Handle Project Benchmark Referral from "Consult on Similar System"
    if (projectParam || refParam) {
      const projectKey = (projectParam || '').toLowerCase();
      const projectObj = caseStudyData[projectKey];
      const projectTitle = refParam || projectObj?.title || 'Custom Engineering System';
      currentProjectBenchmark = projectTitle;

      // Determine target scope
      let targetScope = scopeParam;
      if (!targetScope || !contactScopeLabels[targetScope]) {
        if (['erp', 'apex', 'software'].includes(projectKey)) {
          targetScope = 'custom-erp';
        } else if (['mobile', 'swiftpay', 'cloud'].includes(projectKey)) {
          targetScope = 'mobile-app';
        } else {
          targetScope = 'custom-web';
        }
      }

      if (targetScope && contactScopeLabels[targetScope]) {
        selectProjectType(targetScope);
      }

      // Populate hidden input for form submission
      const hiddenRef = /** @type {HTMLInputElement|null} */ (document.getElementById('contactReferencedProject'));
      if (hiddenRef) {
        hiddenRef.value = projectTitle;
      }

      // Configure and reveal the Project Benchmark banner
      const refBanner = document.getElementById('projectReferralBanner');
      const bannerTitle = document.getElementById('referralBannerTitle');
      const bannerScope = document.getElementById('referralBannerScope');
      const bannerDesc = document.getElementById('referralBannerDesc');

      if (bannerTitle) bannerTitle.textContent = projectTitle;
      if (bannerScope) bannerScope.textContent = contactScopeLabels[targetScope] || 'Custom Architecture';
      if (bannerDesc) {
        const stackList = projectObj?.stack ? projectObj.stack.slice(0, 4).join(', ') : '';
        const stackText = stackList ? ` (${stackList})` : '';
        bannerDesc.innerHTML = `You requested consultation on building a system similar to <strong>${projectTitle}</strong>${stackText}. We have pre-configured your project scope and pre-populated architectural specifications below.`;
      }
      if (refBanner) {
        refBanner.style.display = 'block';
      }

      // Pre-fill technical specifications with structured benchmark requirements
      const specsEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('contactProjectSpecs'));
      if (specsEl && !specsEl.value.trim()) {
        const stackDetails = projectObj?.stack ? projectObj.stack.join(', ') : 'High-performance stack';
        const archDetails = projectObj?.architecture ? `• Reference Architecture: ${projectObj.architecture}\n` : '';
        const dataDetails = projectObj?.dataPattern ? `• Data & Transaction Pattern: ${projectObj.dataPattern}\n` : '';

        specsEl.value = `[Project Benchmark Target: ${projectTitle}]\n` +
          `• Core Technology Stack: ${stackDetails}\n` +
          archDetails +
          dataDetails +
          `• Primary Scope: Engineer an enterprise-grade system modeled on ${projectTitle}, tailored to our organization's specific operational workflows.`;
        specsEl.classList.remove('is-invalid');
      }
    } else if (scopeParam && contactScopeLabels[scopeParam]) {
      selectProjectType(scopeParam);
    }

    if (noteParam) {
      const specsEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('contactProjectSpecs'));
      if (specsEl) {
        specsEl.value = noteParam;
        specsEl.classList.remove('is-invalid');
      }
      const banner = document.getElementById('blueprintImportBanner');
      if (banner) {
        banner.style.display = 'flex';
      }
    }
  } catch (_) {}

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
