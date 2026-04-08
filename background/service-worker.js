/**
 * PromptRyt Service Worker (MV3)
 * Minimal — all prompt optimization is done in content scripts (no API needed).
 * Only handles: options page open, install events.
 */

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Set all sites enabled by default on first install
    const defaults = {};
    ['chatgpt', 'claude', 'gemini', 'copilot', 'deepseek', 'manus'].forEach(site => {
      defaults[`enabled_${site}`] = true;
    });
    chrome.storage.sync.set(defaults);
  }
});

// Open options page when user clicks the extension icon (no popup fallback needed)
// The popup handles this — service worker is just a lifecycle hook.
