/**
 * NOVACORE SYSTEMS — JAVASCRIPT LOGIC
 * Interactive UI behaviors, telemetry simulation, and modal mechanics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initStatsObserver();
  initNavbarScrollState();
});

// --- 1. MODAL / CONTACT DRAWER CONTROLS ---
function openContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
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

// --- 2. STATS NUMBER COUNT-UP ON SCROLL ---
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

// --- 3. NAVBAR GLASS BLUR EFFECT ON SCROLL ---
function initNavbarScrollState() {
  const navPill = document.querySelector('.nav-pill');
  if (!navPill) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navPill.style.boxShadow = '0 12px 30px -5px rgba(15, 23, 42, 0.12)';
      navPill.style.background = 'rgba(255, 255, 255, 0.96)';
    } else {
      navPill.style.boxShadow = '0 10px 25px -5px rgba(15, 23, 42, 0.05)';
      navPill.style.background = 'rgba(255, 255, 255, 0.92)';
    }
  });
}

// --- 4. INTERACTIVE HERO TELEMETRY SIMULATION ---
let isHighLoad = false;
function toggleTelemetryDemo() {
  isHighLoad = !isHighLoad;
  const statusPill = document.querySelector('.dashboard-status-pill span:last-child');
  const flowNodes = document.querySelectorAll('.flow-node');
  
  if (isHighLoad) {
    if (statusPill) statusPill.textContent = 'Simulated Load: 45,000 req/s';
    flowNodes.forEach(node => {
      node.style.boxShadow = '0 0 16px rgba(37, 99, 235, 0.3)';
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
