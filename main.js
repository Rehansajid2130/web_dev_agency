/**
 * @fileoverview bit3labs: Master Client Orchestrator
 * High-performance, zero-dependency client architecture.
 * Coordinates Theme, Cursor Physics, Telemetry Simulation, SPA Router, and Components.
 * @module main
 */

import { initTheme, toggleTheme, updateThemeIcon, initColorTheme, setColorTheme, renderColorThemePicker } from './js/theme.js';
import { initCustomCursor, initCardGlow, initNavbarScrollState, toggleMobileMenu, initNavSlidingPill, syncNavSlidingPill } from './js/cursor.js';
import { initStatsObserver, animateNumber, switchDashboardTab, startApiStreamSimulation, toggleTelemetryDemo } from './js/telemetry.js';
import { initRouter, navigateTo, prefetchPage, normalizeUrl, reinitPageComponents } from './js/router.js';
import { 
  openContactModal, closeContactModal, handleOverlayClick, handleFormSubmit,
  caseStudyData, openCaseStudy, closeCaseStudy, toggleCaseStudyCard,
  setPhaseTab, initProcessPage,
  filterProjects, searchProjects, applyProjectFilters, initProjectsPage,
  selectProjectType, appendSpecTag, updateLiveContactSummary, validateContactStep,
  updateStepperUI, nextStep, prevStep, jumpToStep, handleContactSubmit, copyEmail, initContactPage,
  clearProjectReferral,
  selectDiscoveryDate, selectDiscoverySlot, handleTimezoneChange, submitAsyncWithoutScheduling, downloadIcsFile,
  setArchPlatform, setArchScale, toggleArchPrimitive, renderArchBlueprint, exportArchBlueprint
} from './js/components.js';
import { initTypewriter, stopTypewriter } from './js/typewriter.js';

// ==================== GLOBAL COMPATIBILITY REGISTRATION ====================
// Expose all public interactive handlers to window for inline HTML onclick attributes
Object.assign(window, {
  toggleCaseStudyCard,
  clearProjectReferral,
  selectDiscoveryDate,
  selectDiscoverySlot,
  handleTimezoneChange,
  submitAsyncWithoutScheduling,
  downloadIcsFile,
  // Architecture Configurator
  setArchPlatform,
  setArchScale,
  toggleArchPrimitive,
  renderArchBlueprint,
  exportArchBlueprint,
  // Theme Engine
  initTheme,
  toggleTheme,
  updateThemeIcon,
  initColorTheme,
  setColorTheme,
  renderColorThemePicker,

  // Interactions & Cursor
  initCustomCursor,
  initCardGlow,
  initNavbarScrollState,
  toggleMobileMenu,
  initNavSlidingPill,
  syncNavSlidingPill,

  // Telemetry & Stats
  initStatsObserver,
  animateNumber,
  switchDashboardTab,
  startApiStreamSimulation,
  toggleTelemetryDemo,

  // Router
  initRouter,
  navigateTo,
  navigateToUrl: navigateTo,
  prefetchPage,
  normalizeUrl,
  reinitPageComponents,

  // Components & Dialogs
  openContactModal,
  closeContactModal,
  handleOverlayClick,
  handleFormSubmit,
  caseStudyData,
  openCaseStudy,
  closeCaseStudy,
  setPhaseTab,
  initProcessPage,
  filterProjects,
  searchProjects,
  applyProjectFilters,
  initProjectsPage,
  selectProjectType,
  appendSpecTag,
  updateLiveContactSummary,
  validateContactStep,
  updateStepperUI,
  nextStep,
  prevStep,
  jumpToStep,
  handleContactSubmit,
  copyEmail,
  initContactPage,
  initTypewriter,
  stopTypewriter
});

// ==================== BOOTSTRAP ON DOM READY ====================
function bootstrapApp() {
  initTheme();
  initColorTheme();
  initStatsObserver();
  initNavbarScrollState();
  initNavSlidingPill();
  initCardGlow();
  initCustomCursor();
  initRouter();

  // Page-specific initializers on direct load
  if (document.querySelector('.framer-tab-btn')) {
    initProcessPage();
  }
  if (document.querySelector('.project-card') || document.getElementById('archPlatformSelect')) {
    initProjectsPage();
  }
  if (document.getElementById('contactPageForm')) {
    initContactPage();
  }
  if (document.getElementById('typewriterText')) {
    initTypewriter();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}

export {
  bootstrapApp,
  initTheme,
  toggleTheme,
  setColorTheme,
  navigateTo,
  openCaseStudy,
  selectProjectType,
  initTypewriter,
  stopTypewriter
};
