/**
 * options.js — Settings page logic
 */

const SITES = ['chatgpt', 'claude', 'gemini', 'copilot', 'deepseek', 'manus'];

async function sendToSW(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) resolve({ error: chrome.runtime.lastError.message });
      else resolve(response || {});
    });
  });
}

// ── Load saved settings ──────────────────────────────────────────────────

async function loadSettings() {
  // Check API key status
  const { hasKey } = await sendToSW({ type: 'GET_API_KEY_STATUS' });
  const keyStatus = document.getElementById('key-status');
  if (hasKey) {
    keyStatus.textContent = '✓ API key saved';
    keyStatus.className = 'key-status success';
  } else {
    keyStatus.textContent = 'No API key saved — using rule-based mode';
    keyStatus.className = 'key-status info';
  }

  // Load sync settings
  const prefs = await new Promise(r =>
    chrome.storage.sync.get(['optimizationMode', 'enabled', ...SITES.map(s => `enabled_${s}`)], r)
  );

  // Optimization mode
  const mode = prefs.optimizationMode || (hasKey ? 'ai' : 'rule-based');
  const modeInput = document.querySelector(`input[name="mode"][value="${mode}"]`);
  if (modeInput) modeInput.checked = true;

  // Site toggles (default: all enabled)
  SITES.forEach(site => {
    const checkbox = document.getElementById(`site-${site}`);
    if (checkbox) {
      checkbox.checked = prefs[`enabled_${site}`] !== false;
    }
  });
}

// ── Save API key ─────────────────────────────────────────────────────────

document.getElementById('save-key').addEventListener('click', async () => {
  const keyInput = document.getElementById('api-key');
  const keyStatus = document.getElementById('key-status');
  const key = keyInput.value.trim();

  if (!key) {
    // Clear key
    await sendToSW({ type: 'CLEAR_API_KEY' });
    keyStatus.textContent = 'API key cleared';
    keyStatus.className = 'key-status info';
    keyInput.value = '';
    return;
  }

  keyStatus.textContent = 'Saving...';
  keyStatus.className = 'key-status info';

  const result = await sendToSW({ type: 'SAVE_API_KEY', apiKey: key });

  if (result.success) {
    keyStatus.textContent = '✓ API key saved successfully';
    keyStatus.className = 'key-status success';
    keyInput.value = '';
    // Auto-switch to AI mode
    const aiMode = document.getElementById('mode-ai');
    if (aiMode) aiMode.checked = true;
    saveMode('ai');
  } else {
    keyStatus.textContent = `Error: ${result.error || 'Failed to save'}`;
    keyStatus.className = 'key-status error';
  }
});

// Allow Enter key to save
document.getElementById('api-key').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('save-key').click();
});

// ── Save optimization mode ────────────────────────────────────────────────

function saveMode(value) {
  chrome.storage.sync.set({ optimizationMode: value });
}

document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) saveMode(radio.value);
  });
});

// ── Site toggles ──────────────────────────────────────────────────────────

SITES.forEach(site => {
  const checkbox = document.getElementById(`site-${site}`);
  if (!checkbox) return;
  checkbox.addEventListener('change', () => {
    chrome.storage.sync.set({ [`enabled_${site}`]: checkbox.checked });
  });
});

// ── Init ──────────────────────────────────────────────────────────────────

loadSettings();
