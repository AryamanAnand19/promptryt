/**
 * popup.js — Toolbar popup logic
 */

const SITE_META = {
  chatgpt:  { icon: '🤖', name: 'ChatGPT' },
  claude:   { icon: '✦',  name: 'Claude' },
  gemini:   { icon: '💎', name: 'Gemini' },
  copilot:  { icon: '🪟', name: 'Copilot' },
  deepseek: { icon: '🔵', name: 'DeepSeek' },
  manus:    { icon: '🤝', name: 'Manus' }
};

function detectSiteFromUrl(url) {
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
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const siteId = detectSiteFromUrl(tab?.url);
  const meta = siteId ? SITE_META[siteId] : null;

  // Site status
  const siteIcon = document.getElementById('site-icon');
  const siteName = document.getElementById('site-name');
  const siteBadge = document.getElementById('site-badge');
  const statusDot = document.getElementById('status-dot');

  if (meta) {
    siteIcon.textContent = meta.icon;
    siteName.textContent = meta.name;
    siteBadge.textContent = 'Active';
    siteBadge.className = 'badge badge-active';
    statusDot.className = 'status-dot active';
  } else {
    siteIcon.textContent = '🌐';
    siteName.textContent = 'Not supported';
    siteBadge.textContent = 'Inactive';
    siteBadge.className = 'badge badge-inactive';
    statusDot.className = 'status-dot inactive';
  }

  // Mode badge
  const modeBadge = document.getElementById('mode-badge');
  const [prefs, swStatus] = await Promise.all([
    new Promise(r => chrome.storage.sync.get('optimizationMode', r)),
    new Promise(r => chrome.runtime.sendMessage({ type: 'GET_API_KEY_STATUS' }, r))
  ]);

  const hasKey = swStatus?.hasKey;
  const mode = prefs.optimizationMode || (hasKey ? 'ai' : 'rule-based');

  if (mode === 'ai' && hasKey) {
    modeBadge.textContent = 'AI-Powered';
    modeBadge.className = 'badge badge-ai';
  } else {
    modeBadge.textContent = 'Rule-based';
    modeBadge.className = 'badge badge-rule';
  }

  // Toggle button state
  const toggleBtn = document.getElementById('toggle-btn');
  const toggleIcon = document.getElementById('toggle-icon');
  const toggleLabel = document.getElementById('toggle-label');

  if (!siteId) {
    toggleBtn.disabled = true;
    toggleBtn.style.opacity = '0.4';
    toggleBtn.style.cursor = 'not-allowed';
  } else {
    const sitePrefs = await new Promise(r => chrome.storage.sync.get(`enabled_${siteId}`, r));
    const isEnabled = sitePrefs[`enabled_${siteId}`] !== false;

    updateToggleBtn(isEnabled);

    toggleBtn.addEventListener('click', async () => {
      const current = await new Promise(r => chrome.storage.sync.get(`enabled_${siteId}`, r));
      const wasEnabled = current[`enabled_${siteId}`] !== false;
      await new Promise(r => chrome.storage.sync.set({ [`enabled_${siteId}`]: !wasEnabled }, r));
      updateToggleBtn(!wasEnabled);
    });
  }

  function updateToggleBtn(enabled) {
    if (enabled) {
      toggleBtn.className = 'btn btn-toggle btn-enabled';
      toggleIcon.textContent = '⏸';
      toggleLabel.textContent = 'Disable on this site';
    } else {
      toggleBtn.className = 'btn btn-toggle btn-disabled';
      toggleIcon.textContent = '▶';
      toggleLabel.textContent = 'Enable on this site';
    }
  }

  // Settings button
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

init();
