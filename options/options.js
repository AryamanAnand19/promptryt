/**
 * options.js — Settings: site toggles only. No API key.
 */

const SITES = ['chatgpt', 'claude', 'gemini', 'copilot', 'deepseek', 'manus'];

async function loadSettings() {
  const keys = SITES.map(s => `enabled_${s}`);
  const prefs = await new Promise(r => chrome.storage.sync.get(keys, r));
  SITES.forEach(site => {
    const cb = document.getElementById(`site-${site}`);
    if (cb) cb.checked = prefs[`enabled_${site}`] !== false; // default on
  });
}

SITES.forEach(site => {
  const cb = document.getElementById(`site-${site}`);
  if (!cb) return;
  cb.addEventListener('change', () => {
    chrome.storage.sync.set({ [`enabled_${site}`]: cb.checked });
  });
});

loadSettings();
