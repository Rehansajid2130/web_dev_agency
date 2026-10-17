/**
 * @fileoverview Telemetry and Interactive System Simulation for bit3labs
 * Manages stats counter animations and real-time dashboard API stream mockups.
 * @module telemetry
 */

/**
 * Initialize IntersectionObserver to trigger stats count-up animation when visible.
 * @returns {void}
 */
export function initStatsObserver() {
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

/**
 * Animate a numeric DOM element smoothly from start to end with optional affix strings.
 * @param {string} elementId - Target DOM element ID.
 * @param {number} start - Starting number value.
 * @param {number} end - Target final number value.
 * @param {string} [prefix=''] - Text to precede the number.
 * @param {string} [suffix=''] - Text to append after the number.
 * @param {number} [duration=1400] - Total animation duration in milliseconds.
 * @returns {void}
 */
export function animateNumber(elementId, start, end, prefix = '', suffix = '', duration = 1400) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const frameRate = 30;
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

/**
 * Switch active tabs in the hero telemetry console.
 * @param {string} tabName - Active view tab identifier ('telemetry' | 'api' | 'architecture').
 * @returns {void}
 */
export function switchDashboardTab(tabName) {
  document.querySelectorAll('.dash-tab-btn').forEach(el => {
    const btn = /** @type {HTMLElement} */ (el);
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.dashboard-view').forEach(el => {
    const view = /** @type {HTMLElement} */ (el);
    view.classList.toggle('active', view.dataset.view === tabName);
  });

  if (tabName === 'api') {
    startApiStreamSimulation();
  }
}

/** @type {NodeJS.Timeout|number|null} */
let apiInterval = null;

/**
 * Start mock API streaming log entries when the API telemetry tab is active.
 * @returns {void}
 */
export function startApiStreamSimulation() {
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

/**
 * Toggle high-throughput load test simulation on the hero topology diagram.
 * @returns {boolean} Whether simulated high load is currently active.
 */
export function toggleTelemetryDemo() {
  isHighLoad = !isHighLoad;
  const statusPill = document.querySelector('.dashboard-status-pill span:last-child');
  const flowNodes = document.querySelectorAll('.flow-node');
  
  if (isHighLoad) {
    if (statusPill) statusPill.textContent = 'Simulated Load: 45,000 req/s';
    flowNodes.forEach(el => {
      const node = /** @type {HTMLElement} */ (el);
      node.style.boxShadow = '0 0 16px rgba(37, 99, 235, 0.35)';
      node.style.borderColor = '#3b82f6';
    });
  } else {
    if (statusPill) statusPill.textContent = 'System Health: 99.99%';
    flowNodes.forEach(el => {
      const node = /** @type {HTMLElement} */ (el);
      node.style.boxShadow = '';
      node.style.borderColor = '';
    });
  }

  return isHighLoad;
}
