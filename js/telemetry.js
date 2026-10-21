/**
 * @fileoverview Telemetry and Interactive System Simulation for bit3labs
 * Manages stats counter animations and real-time dashboard API stream mockups.
 * @module telemetry
 */

/**
 * Ease-out exponential deceleration curve for precision metrics.
 * @param {number} t - Progress between 0 and 1.
 * @returns {number}
 */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animate a numeric DOM element smoothly with easing and formatting.
 * @param {string} elementId - Target DOM element ID.
 * @param {number} start - Starting number value.
 * @param {number} end - Target final number value.
 * @param {string} [prefix=''] - Text to precede the number.
 * @param {string} [suffix=''] - Text to append after the number.
 * @param {number} [decimals=0] - Decimal places to display.
 * @param {number} [duration=1600] - Total animation duration in milliseconds.
 * @returns {void}
 */
export function animateNumber(elementId, start, end, prefix = '', suffix = '', decimals = 0, duration = 1600) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const currentVal = start + (end - start) * easedProgress;

    let formatted;
    if (decimals > 0) {
      formatted = currentVal.toFixed(decimals);
    } else {
      formatted = Math.floor(currentVal).toLocaleString();
    }

    el.textContent = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      const finalFormatted = decimals > 0 ? end.toFixed(decimals) : Math.floor(end).toLocaleString();
      el.textContent = `${prefix}${finalFormatted}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Initialize IntersectionObserver to trigger stats count-up animation when visible.
 * @returns {void}
 */
export function initStatsObserver() {
  // 1. Homepage Gradient Stats Banner
  const statsBanner = document.querySelector('.gradient-stats-banner');
  if (statsBanner && !statsBanner.dataset.observed) {
    statsBanner.dataset.observed = 'true';
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateNumber('stat-1', 0, 20, '+', 'K', 0, 1600);
          animateNumber('stat-2', 0, 3200, '+', '', 0, 1800);
          animateNumber('stat-3', 0, 100, '+', 'K', 0, 1600);
          animateNumber('stat-4', 0, 10, '+', '', 0, 1400);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(statsBanner);
  }

  // 2. About Page Track Record Stats
  const trackGrid = document.querySelector('.track-record-grid');
  if (trackGrid && !trackGrid.dataset.observed) {
    trackGrid.dataset.observed = 'true';
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateNumber('track-1', 0, 850, '$', 'M+', 0, 1600);
          animateNumber('track-2', 0, 100, '', '%', 0, 1400);
          animateNumber('track-3', 0, 99.99, '', '%', 2, 1800);
          animateNumber('track-4', 0, 0, '$', '', 0, 1000);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(trackGrid);
  }
}

/**
 * Switch active tabs in the hero telemetry console (if present).
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
