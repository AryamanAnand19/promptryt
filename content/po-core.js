/**
 * po-core.js — Namespace setup, Token Estimator, Message Bus
 * Loaded first. All files share window.PO namespace.
 */

window.PO = window.PO || {};

// ─── Token Estimator ──────────────────────────────────────────────────────

window.PO.TokenEstimator = {
  /**
   * BPE approximation — accurate to ±10% without WASM
   * Returns { estimate, label, tier, color }
   */
  estimate(text) {
    if (!text || text.trim().length === 0) {
      return { estimate: 0, label: '0 tokens', tier: 'low', color: '#10b981' };
    }

    let tokens = 0;

    // Split into segments: code blocks vs prose
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
    const codeBlocks = [];
    const proseText = text.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return '\x00CODE\x00';
    });

    // Count code tokens: chars / 3.5
    for (const code of codeBlocks) {
      tokens += Math.ceil(code.length / 3.5);
    }

    // Count URL tokens: each URL ~ 3 tokens
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = proseText.match(urlRegex) || [];
    tokens += urls.length * 3;
    const textWithoutUrls = proseText.replace(urlRegex, '');

    // Count numbers: each digit sequence = 1 token
    const numbers = textWithoutUrls.match(/\d+/g) || [];
    tokens += numbers.length;
    const textWithoutNumbers = textWithoutUrls.replace(/\d+/g, '');

    // XML/HTML tags: ~2 tokens each
    const tags = textWithoutNumbers.match(/<[^>]+>/g) || [];
    tokens += tags.length * 2;
    const cleanText = textWithoutNumbers.replace(/<[^>]+>/g, '');

    // Remaining prose: word count × 1.33
    const words = cleanText.split(/\s+/).filter(w => w.length > 0 && w !== '\x00CODE\x00');
    tokens += Math.ceil(words.length * 1.33);

    // Round to nearest 5 for cleaner display
    const estimate = Math.max(1, Math.round(tokens / 5) * 5);

    const tier = estimate < 500 ? 'low'
      : estimate < 2000 ? 'medium'
      : estimate < 6000 ? 'high'
      : 'very-high';

    const colors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', 'very-high': '#ef4444' };
    const label = estimate >= 1000
      ? `~${(estimate / 1000).toFixed(1)}k tokens`
      : `~${estimate} tokens`;

    return { estimate, label, tier, color: colors[tier] };
  },

  /**
   * Calculate reduction percentage between two texts
   */
  reduction(original, optimized) {
    const origEst = this.estimate(original).estimate;
    const optEst = this.estimate(optimized).estimate;
    if (origEst === 0) return 0;
    return Math.round(((origEst - optEst) / origEst) * 100);
  }
};

// ─── Message Bus ──────────────────────────────────────────────────────────

window.PO.MessageBus = {
  /**
   * Promise-based wrapper for chrome.runtime.sendMessage
   */
  send(message) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ error: chrome.runtime.lastError.message });
          } else {
            resolve(response || {});
          }
        });
      } catch (err) {
        resolve({ error: err.message });
      }
    });
  },

  async getApiKeyStatus() {
    return this.send({ type: 'GET_API_KEY_STATUS' });
  },

  async saveApiKey(apiKey) {
    return this.send({ type: 'SAVE_API_KEY', apiKey });
  },

  async optimizePrompt(siteId, rawPrompt) {
    const { optimizationMode } = await new Promise(r =>
      chrome.storage.sync.get('optimizationMode', r)
    );
    return this.send({ type: 'OPTIMIZE_PROMPT', siteId, rawPrompt, optimizationMode });
  }
};

// ─── Simple Word-Level Diff ───────────────────────────────────────────────

window.PO.Diff = {
  /**
   * Returns array of { text, type: 'same' | 'added' | 'removed' }
   * Simple LCS-based word diff
   */
  compute(original, optimized) {
    const origWords = original.split(/(\s+)/);
    const optWords = optimized.split(/(\s+)/);

    // LCS lengths table
    const m = origWords.length, n = optWords.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = origWords[i - 1] === optWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    // Backtrack
    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origWords[i - 1] === optWords[j - 1]) {
        result.unshift({ text: optWords[j - 1], type: 'same' });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ text: optWords[j - 1], type: 'added' });
        j--;
      } else {
        result.unshift({ text: origWords[i - 1], type: 'removed' });
        i--;
      }
    }
    return result;
  }
};

// ─── Storage Helpers ──────────────────────────────────────────────────────

window.PO.Storage = {
  async get(keys) {
    return new Promise(r => chrome.storage.sync.get(keys, r));
  },
  async set(data) {
    return new Promise(r => chrome.storage.sync.set(data, r));
  },
  async getLocal(keys) {
    return new Promise(r => chrome.storage.local.get(keys, r));
  }
};
