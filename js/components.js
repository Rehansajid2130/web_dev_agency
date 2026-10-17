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
 * Architectural case study dataset.
 * @type {Record<string, {title: string, subtitle: string, problem: string, architecture: string, result: string}>}
 */
export const caseStudyData = {
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

/**
 * Open the native case study <dialog> and populate data.
 * @param {string} type - Case study identifier key ('web' | 'mobile' | 'erp').
 * @returns {void}
 */
export function openCaseStudy(type) {
  const dialog = /** @type {HTMLDialogElement|null} */ (document.getElementById('caseStudyDialog'));
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

/**
 * Close the native case study dialog.
 * @returns {void}
 */
export function closeCaseStudy() {
  const dialog = /** @type {HTMLDialogElement|null} */ (document.getElementById('caseStudyDialog'));
  if (dialog) dialog.close();
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
  applyProjectFilters();
}

/**
 * Search projects by text query.
 * @param {string} query - Search term.
 * @returns {void}
 */
export function searchProjects(query) {
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
  applyProjectFilters();
}


// ==================== 5. MULTI-STEP INTAKE CONTROLLER ====================

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
    summaryScope.textContent = contactScopeLabels[contactSelectedScope] || 'Custom Architecture';
  }
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
    if (form) form.style.display = 'none';
    if (stepper) stepper.style.display = 'none';
    if (notice) notice.style.display = 'block';
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
