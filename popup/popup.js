/**
 * popup.js — Toolbar popup: shows active site + enable/disable toggle
 */

const SITE_META = {
  chatgpt:  { icon: '🤖', name: 'ChatGPT' },
  claude:   { icon: '✦',  name: 'Claude' },
  gemini:   { icon: '💎', name: 'Gemini' },
  copilot:  { icon: '🪟', name: 'Copilot' },
  deepseek: { icon: '🔵', name: 'DeepSeek' },
  manus:    { icon: '🤝', name: 'Manus' },
};

function detectSite(url) {
  if (!url) return null;
  if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'chatgpt';
  if (url.includes('claude.ai')) return 'claude';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('copilot.microsoft.com')) return 'copilot';
  if (url.includes('chat.deepseek.com')) return 'deepseek';
  if (url.includes('manus.im')) return 'manus';
  return null;
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const siteId = detectSite(tab?.url);
  const meta = siteId ? SITE_META[siteId] : null;

  // Site status row
  document.getElementById('site-icon').textContent = meta ? meta.icon : '🌐';
  document.getElementById('site-name').textContent = meta ? meta.name : 'Not supported';

  const siteBadge = document.getElementById('site-badge');
  const statusDot = document.getElementById('status-dot');

  if (meta) {
    siteBadge.textContent = 'Active';
    siteBadge.className = 'badge badge-active';
    statusDot.className = 'status-dot active';
  } else {
    siteBadge.textContent = 'Inactive';
    siteBadge.className = 'badge badge-inactive';
    statusDot.className = 'status-dot inactive';
  }

  // Mode badge — always offline
  const modeBadge = document.getElementById('mode-badge');
  modeBadge.textContent = '100% Local';
  modeBadge.className = 'badge badge-local';

  // Toggle button
  const toggleBtn = document.getElementById('toggle-btn');
  const toggleIcon = document.getElementById('toggle-icon');
  const toggleLabel = document.getElementById('toggle-label');

  if (!siteId) {
    toggleBtn.disabled = true;
    toggleBtn.style.opacity = '0.4';
    toggleBtn.style.cursor = 'not-allowed';
  } else {
    const prefs = await new Promise(r => chrome.storage.sync.get(`enabled_${siteId}`, r));
    let enabled = prefs[`enabled_${siteId}`] !== false;
    render(enabled);

    toggleBtn.addEventListener('click', async () => {
      enabled = !enabled;
      await new Promise(r => chrome.storage.sync.set({ [`enabled_${siteId}`]: enabled }, r));
      render(enabled);
    });
  }

  function render(enabled) {
    if (enabled) {
      toggleBtn.className = 'btn btn-toggle btn-enabled';
      toggleIcon.textContent = '⏸';
      toggleLabel.textContent = `Disable on this site`;
    } else {
      toggleBtn.className = 'btn btn-toggle btn-disabled';
      toggleIcon.textContent = '▶';
      toggleLabel.textContent = `Enable on this site`;
    }
  }

  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

init();
