/**
 * po-main.js — Entry point. Initializes PromptRyt on the current AI site.
 */

(function () {
  'use strict';

  // Prevent double-injection
  if (window.__PROMPT_RYT_LOADED__) return;
  window.__PROMPT_RYT_LOADED__ = true;

  function init() {
    const detector = window.PO.getDetector();
    if (!detector) return; // Not on a supported site

    // Check if extension is enabled for this site
    chrome.storage.sync.get(['enabled', `enabled_${detector.siteId}`], (prefs) => {
      const globalEnabled = prefs.enabled !== false; // default: true
      const siteEnabled = prefs[`enabled_${detector.siteId}`] !== false; // default: true

      if (!globalEnabled || !siteEnabled) return;

      const ui = new window.PO.PromptRytUI(detector);
      ui.mount();

      // Store reference for cleanup
      window.__PROMPT_RYT_UI__ = ui;
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // SPA: give the framework a moment to render
    setTimeout(init, 800);
  }

  // Listen for settings changes from options page
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled || changes.optimizationMode) {
      // Reload if global enable state changed
      if (changes.enabled) {
        if (changes.enabled.newValue === false) {
          window.__PROMPT_RYT_UI__?.destroy();
          window.__PROMPT_RYT_LOADED__ = false;
        }
      }
    }
  });

})();
