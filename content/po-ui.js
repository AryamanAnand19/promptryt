/**
 * po-ui.js — PromptRyt Shadow DOM UI
 * FAB: right-edge vertical tab (never overlaps send buttons)
 * Panel: 3 variant cards (Direct / Well-Rounded / Technical)
 */

window.PO = window.PO || {};

// ─── CSS ──────────────────────────────────────────────────────────────────

const PO_STYLES = `
  :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── FAB Tab (right-edge, never overlaps controls) ── */
  .po-fab {
    position: fixed;
    right: 0;
    top: 42%;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 14px 6px;
    background: linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 10px 0 0 10px;
    cursor: pointer;
    box-shadow: -3px 0 16px rgba(99,102,241,0.35);
    opacity: 0;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease, box-shadow 0.2s ease;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .po-fab.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .po-fab:hover {
    box-shadow: -5px 0 22px rgba(99,102,241,0.55);
    background: linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%);
  }

  .po-fab:active { transform: translateX(2px); }

  .po-fab-icon {
    font-size: 14px;
    color: white;
    writing-mode: horizontal-tb;
    line-height: 1;
  }

  .po-fab-label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.92);
    letter-spacing: 0.06em;
    line-height: 1;
  }

  /* ── Panel ── */
  .po-panel {
    position: fixed;
    top: 50%;
    right: 24px;
    transform: translateY(-50%) translateX(calc(100% + 30px));
    z-index: 2147483646;
    width: 420px;
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .po-panel.open {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
    pointer-events: all;
  }

  /* ── Header ── */
  .po-header {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 13px 14px 11px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    flex-shrink: 0;
  }

  .po-header-logo {
    font-size: 15px;
    color: white;
    background: rgba(255,255,255,0.18);
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .po-header-title {
    font-size: 13.5px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.01em;
    flex: 1;
  }

  .po-header-site {
    font-size: 10.5px;
    background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.95);
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 600;
  }

  .po-intent-badge {
    font-size: 10px;
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.85);
    padding: 2px 6px;
    border-radius: 20px;
    text-transform: capitalize;
  }

  .po-btn-close {
    background: rgba(255,255,255,0.15);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    padding: 0;
    flex-shrink: 0;
  }

  .po-btn-close:hover { background: rgba(255,255,255,0.3); }

  /* ── Scroll area ── */
  .po-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    scroll-behavior: smooth;
  }

  .po-body::-webkit-scrollbar { width: 4px; }
  .po-body::-webkit-scrollbar-track { background: transparent; }
  .po-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

  /* ── Expansion notice (shows what was auto-expanded) ── */
  .po-expansion-notice {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 7px 10px;
    background: linear-gradient(135deg, #eef2ff, #f5f3ff);
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    font-size: 11.5px;
    color: #4338ca;
    line-height: 1.4;
  }

  /* ── Variant Card ── */
  .po-card {
    border: 1.5px solid #e8ecf0;
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
    background: #fafafa;
  }

  .po-card:hover { border-color: #c7d2fe; box-shadow: 0 2px 12px rgba(99,102,241,0.08); }

  .po-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px 8px;
    background: white;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    user-select: none;
  }

  .po-card-type-icon {
    font-size: 15px;
    width: 26px;
    text-align: center;
    flex-shrink: 0;
  }

  .po-card-type-name {
    font-size: 12.5px;
    font-weight: 700;
    color: #1e293b;
    flex: 1;
  }

  .po-card-type-desc {
    font-size: 11px;
    color: #94a3b8;
  }

  .po-card-chevron {
    font-size: 10px;
    color: #94a3b8;
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  .po-card.expanded .po-card-chevron { transform: rotate(180deg); }

  .po-card-preview {
    padding: 8px 12px;
    font-size: 12px;
    color: #475569;
    line-height: 1.55;
    /* Show first 3 lines */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .po-card-full {
    padding: 8px 12px 4px;
    font-size: 12px;
    color: #1e293b;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 220px;
    overflow-y: auto;
    background: #fafafa;
    display: none;
    border-top: 1px solid #f1f5f9;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 11.5px;
  }

  .po-card-full::-webkit-scrollbar { width: 3px; }
  .po-card-full::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

  .po-card.expanded .po-card-preview { display: none; }
  .po-card.expanded .po-card-full { display: block; }

  .po-card-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px 9px;
    border-top: 1px solid #f1f5f9;
    background: white;
  }

  .po-token-pill {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #64748b;
    flex: 1;
  }

  .po-token-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .po-btn-use {
    border: none;
    border-radius: 7px;
    padding: 6px 13px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.12s, box-shadow 0.12s;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    box-shadow: 0 2px 6px rgba(99,102,241,0.25);
    white-space: nowrap;
  }

  .po-btn-use:hover { box-shadow: 0 3px 10px rgba(99,102,241,0.4); }
  .po-btn-use:active { transform: scale(0.97); }

  .po-btn-copy {
    border: 1.5px solid #e2e8f0;
    border-radius: 7px;
    padding: 5px 10px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    background: white;
    color: #64748b;
    transition: border-color 0.12s, color 0.12s;
    white-space: nowrap;
  }

  .po-btn-copy:hover { border-color: #6366f1; color: #6366f1; }

  /* ── Clarifying questions ── */
  .po-clarify {
    border: 1.5px solid #e0e7ff;
    border-radius: 10px;
    overflow: hidden;
  }

  .po-clarify-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    background: #eef2ff;
    font-size: 12px;
    font-weight: 600;
    color: #4338ca;
    cursor: pointer;
    user-select: none;
  }

  .po-clarify-toggle { margin-left: auto; font-size: 10px; color: #6366f1; }

  .po-clarify-body { padding: 8px 10px; background: white; display: none; }
  .po-clarify-body.open { display: block; }

  .po-question-item {
    display: flex;
    gap: 8px;
    padding: 5px 0;
    font-size: 12px;
    color: #374151;
    border-bottom: 1px solid #f8fafc;
    line-height: 1.45;
  }
  .po-question-item:last-child { border-bottom: none; }

  .po-q-num {
    background: #e0e7ff;
    color: #4338ca;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Loading ── */
  .po-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px 16px;
    color: #64748b;
    font-size: 13px;
  }

  @keyframes po-spin { to { transform: rotate(360deg); } }
  .po-spinner {
    width: 26px;
    height: 26px;
    border: 2.5px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: po-spin 0.7s linear infinite;
  }

  /* ── Empty ── */
  .po-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px 20px;
    text-align: center;
  }
  .po-empty-icon { font-size: 28px; }
  .po-empty-title { font-size: 14px; font-weight: 700; color: #1e293b; }
  .po-empty-desc { font-size: 12.5px; color: #64748b; line-height: 1.5; }

  /* Pulse on first appearance */
  @keyframes po-pulse {
    0%,100% { box-shadow: -3px 0 16px rgba(99,102,241,0.35); }
    50% { box-shadow: -6px 0 24px rgba(99,102,241,0.65), -3px 0 0 4px rgba(99,102,241,0.12); }
  }
  .po-fab.pulse { animation: po-pulse 1.4s ease 3; }

  /* Copied feedback */
  @keyframes po-flash { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .flashing { animation: po-flash 0.35s ease; }
`;

// ─── Variant config ───────────────────────────────────────────────────────

const VARIANTS = [
  {
    key: 'direct',
    icon: '⚡',
    name: 'Direct',
    desc: 'Concise & clear',
    color: '#f59e0b',
  },
  {
    key: 'balanced',
    icon: '✦',
    name: 'Well-Rounded',
    desc: 'Context + format',
    color: '#6366f1',
  },
  {
    key: 'technical',
    icon: '🔬',
    name: 'Technical',
    desc: 'Full scaffolding',
    color: '#10b981',
  },
];

// ─── PromptRytUI ──────────────────────────────────────────────────────────

window.PO.PromptRytUI = class PromptRytUI {
  constructor(detector) {
    this.detector = detector;
    this.siteId = detector.siteId;
    this.displayName = detector.displayName;

    this._host = null;
    this._shadow = null;
    this._fab = null;
    this._panelEl = null;
    this._panelOpen = false;
    this._lastResult = null;
    this._loading = false;
    this._positionRAF = null;
  }

  mount() {
    if (document.getElementById('prompt-ryt-host')) return;

    this._host = document.createElement('div');
    this._host.id = 'prompt-ryt-host';
    document.body.appendChild(this._host);

    this._shadow = this._host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = PO_STYLES;
    this._shadow.appendChild(style);

    // FAB — right-edge vertical pill
    this._fab = document.createElement('button');
    this._fab.className = 'po-fab';
    this._fab.setAttribute('aria-label', 'PromptRyt — Optimize prompt');
    this._fab.innerHTML = `<span class="po-fab-icon">✦</span><span class="po-fab-label">Ryt</span>`;
    this._fab.addEventListener('click', () => this._togglePanel());
    this._shadow.appendChild(this._fab);

    // Panel
    this._panelEl = document.createElement('div');
    this._panelEl.className = 'po-panel';
    this._panelEl.innerHTML = this._renderShell();
    this._shadow.appendChild(this._panelEl);

    this._bindPanelEvents();
    this._watchTextarea();
  }

  _renderShell() {
    return `
      <div class="po-header">
        <div class="po-header-logo">✦</div>
        <div class="po-header-title">PromptRyt</div>
        <span class="po-header-site" id="po-site">${this.displayName}</span>
        <span class="po-intent-badge" id="po-intent" style="display:none"></span>
        <button class="po-btn-close" id="po-close">✕</button>
      </div>
      <div class="po-body" id="po-body">
        ${this._renderEmpty()}
      </div>
    `;
  }

  _renderEmpty() {
    return `
      <div class="po-empty">
        <div class="po-empty-icon">✦</div>
        <div class="po-empty-title">Start typing your prompt</div>
        <div class="po-empty-desc">PromptRyt will instantly generate 3 optimized versions — Direct, Well-Rounded, and Technical — tailored for ${this.displayName}.</div>
      </div>
    `;
  }

  _renderLoading() {
    return `<div class="po-loading"><div class="po-spinner"></div><span>Building your prompts…</span></div>`;
  }

  _bindPanelEvents() {
    const s = this._shadow;
    s.getElementById('po-close')?.addEventListener('click', () => this._closePanel());

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this._panelOpen && !this._host.contains(e.target)) this._closePanel();
    }, true);
  }

  _watchTextarea() {
    const check = () => {
      const el = this.detector.getTextareaElement();
      if (el) {
        this._attachTextareaListener(el);
        this._showFab();
      }
    };
    this.detector.observeForElement(check);
  }

  _attachTextareaListener(el) {
    let timer;
    const onInput = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const text = this.detector.getTextareaContent().trim();
        if (text.length > 5) this._showFab();
        else this._hideFab();
      }, 400);
    };
    el.addEventListener('input', onInput, { passive: true });
    el.addEventListener('keyup', onInput, { passive: true });

    // Watch for SPA re-renders replacing the element
    const mo = new MutationObserver(() => {
      if (!document.contains(el)) { mo.disconnect(); this._watchTextarea(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  _showFab() {
    if (!this._fab) return;
    this._fab.classList.add('visible');
    if (!this._fab._pulsed) {
      this._fab._pulsed = true;
      this._fab.classList.add('pulse');
      setTimeout(() => this._fab?.classList.remove('pulse'), 4200);
    }
  }

  _hideFab() {
    this._fab?.classList.remove('visible');
    if (this._panelOpen) this._closePanel();
  }

  _togglePanel() {
    this._panelOpen ? this._closePanel() : this._openPanel();
  }

  _openPanel() {
    this._panelOpen = true;
    this._panelEl.classList.add('open');
    const raw = this.detector.getTextareaContent().trim();
    if (raw.length > 5) this._runOptimization(raw);
    else this._setBody(this._renderEmpty());
  }

  _closePanel() {
    this._panelOpen = false;
    this._panelEl.classList.remove('open');
  }

  _setBody(html) {
    const body = this._shadow.getElementById('po-body');
    if (body) body.innerHTML = html;
  }

  async _runOptimization(rawPrompt) {
    this._setBody(this._renderLoading());

    // Small delay so spinner renders
    await new Promise(r => setTimeout(r, 60));

    const result = window.PO.generateVariants(rawPrompt, this.siteId);
    this._lastResult = result;

    if (!result) {
      this._setBody(this._renderEmpty());
      return;
    }

    // Show intent badge
    const intentBadge = this._shadow.getElementById('po-intent');
    if (intentBadge && result.intent) {
      intentBadge.textContent = result.intent;
      intentBadge.style.display = '';
    }

    this._setBody(this._renderVariants(result, rawPrompt));
    this._bindVariantEvents(result);
  }

  _renderVariants(result, rawPrompt) {
    const expansionHtml = result.expansions?.length
      ? `<div class="po-expansion-notice">🧠 Expanded your prompt with ${result.expansions.map(e => e.label).join(' + ')} context</div>`
      : '';

    const cards = VARIANTS.map(v => this._renderCard(v, result[v.key])).join('');

    const questions = result.clarifyingQuestions?.length
      ? `<div class="po-clarify">
           <div class="po-clarify-header" id="po-clarify-hdr">
             💡 Strengthen your prompt
             <span class="po-clarify-toggle" id="po-clarify-tog">▼</span>
           </div>
           <div class="po-clarify-body" id="po-clarify-body">
             ${result.clarifyingQuestions.map((q, i) => `
               <div class="po-question-item">
                 <span class="po-q-num">${i + 1}</span>
                 <span>${q}</span>
               </div>`).join('')}
           </div>
         </div>`
      : '';

    return expansionHtml + cards + questions;
  }

  _renderCard(variant, promptText) {
    const tokens = window.PO.TokenEstimator.estimate(promptText);
    const preview = promptText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fullHtml = promptText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `
      <div class="po-card" data-variant="${variant.key}">
        <div class="po-card-header" data-expand="${variant.key}">
          <span class="po-card-type-icon">${variant.icon}</span>
          <div style="flex:1;min-width:0">
            <div class="po-card-type-name">${variant.name}</div>
          </div>
          <span class="po-card-type-desc">${variant.desc}</span>
          <span class="po-card-chevron">▼</span>
        </div>
        <div class="po-card-preview">${preview}</div>
        <div class="po-card-full">${fullHtml}</div>
        <div class="po-card-footer">
          <div class="po-token-pill">
            <span class="po-token-dot" style="background:${tokens.color}"></span>
            <span>${tokens.label}</span>
          </div>
          <button class="po-btn-copy" data-copy="${variant.key}">Copy</button>
          <button class="po-btn-use" data-insert="${variant.key}">Use this →</button>
        </div>
      </div>
    `;
  }

  _bindVariantEvents(result) {
    const s = this._shadow;

    // Card expand/collapse
    s.querySelectorAll('[data-expand]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.po-card');
        card.classList.toggle('expanded');
      });
    });

    // Copy buttons
    s.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.dataset.copy;
        const text = result[key];
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = '✓';
          btn.classList.add('flashing');
          setTimeout(() => { btn.textContent = orig; btn.classList.remove('flashing'); }, 1400);
        });
      });
    });

    // Insert buttons
    s.querySelectorAll('[data-insert]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.dataset.insert;
        const text = result[key];
        const ok = this.detector.setTextareaContent(text);
        if (ok) {
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Inserted';
          btn.style.background = '#10b981';
          setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 1600);
          setTimeout(() => this._closePanel(), 1700);
        }
      });
    });

    // Clarifying questions toggle
    const clarifyHdr = s.getElementById('po-clarify-hdr');
    if (clarifyHdr) {
      clarifyHdr.addEventListener('click', () => {
        const body = s.getElementById('po-clarify-body');
        const tog = s.getElementById('po-clarify-tog');
        body?.classList.toggle('open');
        if (tog) tog.textContent = body?.classList.contains('open') ? '▲' : '▼';
      });
    }
  }

  destroy() {
    this.detector.stopObserving();
    this._host?.remove();
    this._host = null;
  }
};
