/**
 * po-ui.js — PromptRyt UI
 *
 * Design principles:
 * - Panel is a bottom-right drawer, never covering the input or conversation center
 * - Each variant card is fully readable with smooth internal scroll
 * - One card expanded at a time — clear focus
 * - No monospace fonts in prompt content
 * - The FAB is a slim right-edge tab, never overlapping send buttons
 */

window.PO = window.PO || {};

const PO_STYLES = `
  :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ─── FAB: slim right-edge vertical pill ─── */
  .po-fab {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%) translateX(100%);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 28px;
    padding: 14px 0;
    background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    box-shadow: -2px 0 12px rgba(99,102,241,0.4);
    opacity: 0;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
  }
  .po-fab.visible {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
  .po-fab:hover { background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%); }
  .po-fab:active { transform: translateY(-50%) translateX(1px); }

  .po-fab-spark {
    font-size: 13px;
    color: white;
    line-height: 1;
  }
  .po-fab-text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.88);
    text-transform: uppercase;
    line-height: 1;
  }

  @keyframes po-pulse {
    0%,100% { box-shadow: -2px 0 12px rgba(99,102,241,0.4); }
    50% { box-shadow: -4px 0 20px rgba(99,102,241,0.7), -1px 0 0 3px rgba(99,102,241,0.15); }
  }
  .po-fab.pulse { animation: po-pulse 1.4s ease 3; }

  /* ─── Panel: bottom-right drawer ─── */
  .po-panel {
    position: fixed;
    bottom: 16px;
    right: 34px;           /* clear the FAB */
    width: 380px;
    max-height: calc(100vh - 80px);
    z-index: 2147483646;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.07);
    opacity: 0;
    transform: translateX(24px) scale(0.97);
    pointer-events: none;
    transition: opacity 0.22s ease, transform 0.25s cubic-bezier(0.34,1.4,0.64,1);
    overflow: hidden;
  }
  .po-panel.open {
    opacity: 1;
    transform: translateX(0) scale(1);
    pointer-events: all;
  }

  /* ─── Header ─── */
  .po-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 13px 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    flex-shrink: 0;
  }
  .po-logo {
    font-size: 13px;
    color: white;
    background: rgba(255,255,255,0.2);
    width: 26px; height: 26px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .po-title { font-size: 13px; font-weight: 700; color: white; letter-spacing: -0.01em; flex: 1; }
  .po-site-badge {
    font-size: 10px; font-weight: 600;
    background: rgba(255,255,255,0.2); color: white;
    padding: 2px 7px; border-radius: 20px;
  }
  .po-intent-badge {
    font-size: 9.5px; font-weight: 600;
    background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.85);
    padding: 2px 6px; border-radius: 20px; text-transform: capitalize;
  }
  .po-close {
    background: rgba(255,255,255,0.15); border: none; color: white;
    width: 22px; height: 22px; border-radius: 5px; cursor: pointer;
    font-size: 13px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.15s; padding: 0;
  }
  .po-close:hover { background: rgba(255,255,255,0.3); }

  /* ─── Expansion notice ─── */
  .po-expanded-notice {
    padding: 7px 12px;
    background: #eef2ff;
    border-bottom: 1px solid #e0e7ff;
    font-size: 11px;
    color: #4338ca;
    line-height: 1.4;
    flex-shrink: 0;
  }

  /* ─── Scrollable card area ─── */
  .po-cards {
    flex: 1;
    overflow-y: auto;
    padding: 10px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-height: 0;         /* critical for flex scroll */
  }
  .po-cards::-webkit-scrollbar { width: 5px; }
  .po-cards::-webkit-scrollbar-track { background: #f8fafc; border-radius: 3px; }
  .po-cards::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .po-cards::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  /* ─── Variant Card ─── */
  .po-card {
    border: 1.5px solid #e8ecf0;
    border-radius: 11px;
    overflow: hidden;
    background: white;
    transition: border-color 0.15s;
    flex-shrink: 0;
  }
  .po-card.active { border-color: #818cf8; box-shadow: 0 2px 10px rgba(99,102,241,0.1); }

  /* Card header — always visible, click to expand */
  .po-card-hdr {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 12px;
    cursor: pointer;
    user-select: none;
    background: #fafafa;
    transition: background 0.12s;
  }
  .po-card-hdr:hover { background: #f1f5f9; }
  .po-card.active .po-card-hdr { background: #f5f3ff; }

  .po-card-icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
  .po-card-meta { flex: 1; min-width: 0; }
  .po-card-name { font-size: 12.5px; font-weight: 700; color: #1e293b; }
  .po-card-desc { font-size: 10.5px; color: #94a3b8; margin-top: 1px; }

  .po-card-token {
    display: flex; align-items: center; gap: 4px;
    font-size: 10.5px; color: #64748b;
    background: #f1f5f9; padding: 2px 7px; border-radius: 20px;
    flex-shrink: 0;
  }
  .po-token-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  .po-chevron {
    font-size: 10px; color: #94a3b8; flex-shrink: 0;
    transition: transform 0.2s;
  }
  .po-card.active .po-chevron { transform: rotate(180deg); }

  /* Card body — collapsed by default, expands with smooth animation */
  .po-card-body {
    display: none;
    flex-direction: column;
    border-top: 1px solid #f1f5f9;
  }
  .po-card.active .po-card-body { display: flex; }

  /* Prompt text — readable, not monospace */
  .po-prompt-text {
    padding: 12px 13px;
    font-size: 12.5px;
    line-height: 1.7;
    color: #1e293b;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 260px;
    overflow-y: auto;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .po-prompt-text::-webkit-scrollbar { width: 4px; }
  .po-prompt-text::-webkit-scrollbar-track { background: #f8fafc; }
  .po-prompt-text::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

  /* Scroll hint gradient when content overflows */
  .po-prompt-wrap {
    position: relative;
    overflow: hidden;
  }
  .po-prompt-wrap::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 32px;
    background: linear-gradient(transparent, white);
    pointer-events: none;
  }
  .po-prompt-wrap.scrolled-to-bottom::after { display: none; }

  /* Card actions */
  .po-card-actions {
    display: flex;
    gap: 7px;
    padding: 8px 12px 10px;
    background: #fafafa;
    border-top: 1px solid #f1f5f9;
    flex-shrink: 0;
  }

  .po-btn-insert {
    flex: 1;
    padding: 8px 0;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(99,102,241,0.3);
    transition: box-shadow 0.15s, transform 0.1s;
  }
  .po-btn-insert:hover { box-shadow: 0 4px 12px rgba(99,102,241,0.45); }
  .po-btn-insert:active { transform: scale(0.98); }

  .po-btn-copy {
    padding: 8px 13px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #475569;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .po-btn-copy:hover { border-color: #6366f1; color: #6366f1; }

  /* ─── Clarifying questions ─── */
  .po-clarify {
    margin: 0 10px 10px;
    border: 1.5px solid #e0e7ff;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .po-clarify-hdr {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 11px;
    background: #eef2ff;
    font-size: 11.5px; font-weight: 600; color: #4338ca;
    cursor: pointer; user-select: none;
  }
  .po-clarify-tog { margin-left: auto; font-size: 10px; color: #6366f1; }
  .po-clarify-body { display: none; padding: 8px 11px; background: white; }
  .po-clarify-body.open { display: block; }
  .po-q {
    display: flex; gap: 8px; padding: 5px 0;
    font-size: 12px; color: #374151; line-height: 1.5;
    border-bottom: 1px solid #f8fafc;
  }
  .po-q:last-child { border-bottom: none; }
  .po-q-n {
    background: #e0e7ff; color: #4338ca;
    width: 17px; height: 17px; border-radius: 50%;
    font-size: 9.5px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
  }

  /* ─── States: loading / empty ─── */
  .po-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
    padding: 36px 16px; color: #64748b; font-size: 13px;
  }
  @keyframes po-spin { to { transform: rotate(360deg); } }
  .po-spinner {
    width: 24px; height: 24px;
    border: 2.5px solid #e2e8f0; border-top-color: #6366f1;
    border-radius: 50%; animation: po-spin 0.7s linear infinite;
  }
  .po-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 32px 20px; text-align: center;
  }
  .po-empty-icon { font-size: 28px; }
  .po-empty-title { font-size: 14px; font-weight: 700; color: #1e293b; }
  .po-empty-desc { font-size: 12px; color: #64748b; line-height: 1.55; }

  @keyframes po-flash { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .flashing { animation: po-flash 0.35s ease; }
`;

const VARIANTS = [
  { key: 'direct',    icon: '⚡', name: 'Direct',       desc: 'Short & sharp' },
  { key: 'balanced',  icon: '✦',  name: 'Well-Rounded', desc: 'Context + structure' },
  { key: 'technical', icon: '🔬', name: 'Technical',    desc: 'Full scaffolding' },
];

// ─── PromptRytUI ──────────────────────────────────────────────────────────

window.PO.PromptRytUI = class {
  constructor(detector) {
    this.detector = detector;
    this.siteId = detector.siteId;
    this.displayName = detector.displayName;
    this._host = null;
    this._shadow = null;
    this._fab = null;
    this._panelEl = null;
    this._panelOpen = false;
    this._activeCard = null; // key of expanded card
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

    // FAB
    this._fab = document.createElement('button');
    this._fab.className = 'po-fab';
    this._fab.setAttribute('aria-label', 'PromptRyt');
    this._fab.innerHTML = `<span class="po-fab-spark">✦</span><span class="po-fab-text">Ryt</span>`;
    this._fab.addEventListener('click', () => this._toggle());
    this._shadow.appendChild(this._fab);

    // Panel
    this._panelEl = document.createElement('div');
    this._panelEl.className = 'po-panel';
    this._panelEl.innerHTML = this._shellHTML();
    this._shadow.appendChild(this._panelEl);

    this._shadow.getElementById('po-close').addEventListener('click', () => this._close());
    document.addEventListener('click', (e) => {
      if (this._panelOpen && !this._host.contains(e.target)) this._close();
    }, true);

    this._watchTextarea();
  }

  _shellHTML() {
    return `
      <div class="po-header">
        <div class="po-logo">✦</div>
        <div class="po-title">PromptRyt</div>
        <span class="po-site-badge">${this.displayName}</span>
        <span class="po-intent-badge" id="po-intent" style="display:none"></span>
        <button class="po-close" id="po-close">✕</button>
      </div>
      <div id="po-slot" style="flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden">
        ${this._emptyHTML()}
      </div>
    `;
  }

  _emptyHTML() {
    return `<div class="po-loading">
      <div class="po-empty-icon">✦</div>
      <div class="po-empty-title">Start typing to activate</div>
      <div class="po-empty-desc">Type your idea into ${this.displayName} then click the ✦ tab to get 3 optimized prompt versions instantly.</div>
    </div>`;
  }

  _loadingHTML() {
    return `<div class="po-loading"><div class="po-spinner"></div><span>Building your prompts…</span></div>`;
  }

  _watchTextarea() {
    const check = () => {
      const el = this.detector.getTextareaElement();
      if (el) { this._attachInput(el); this._showFab(); }
    };
    this.detector.observeForElement(check);
  }

  _attachInput(el) {
    let t;
    const handler = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const txt = this.detector.getTextareaContent().trim();
        txt.length > 5 ? this._showFab() : this._hideFab();
      }, 400);
    };
    el.addEventListener('input', handler, { passive: true });
    el.addEventListener('keyup', handler, { passive: true });

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
    if (this._panelOpen) this._close();
  }

  _toggle() { this._panelOpen ? this._close() : this._open(); }

  _open() {
    this._panelOpen = true;
    this._panelEl.classList.add('open');
    const raw = this.detector.getTextareaContent().trim();
    if (raw.length > 5) this._run(raw);
  }

  _close() {
    this._panelOpen = false;
    this._panelEl.classList.remove('open');
  }

  _setSlot(html) {
    const slot = this._shadow.getElementById('po-slot');
    if (slot) slot.innerHTML = html;
  }

  async _run(raw) {
    this._setSlot(this._loadingHTML());
    await new Promise(r => setTimeout(r, 50)); // let spinner paint

    const result = window.PO.generateVariants(raw, this.siteId);
    if (!result) { this._setSlot(this._emptyHTML()); return; }

    // Intent badge
    const ib = this._shadow.getElementById('po-intent');
    if (ib) { ib.textContent = result.intent; ib.style.display = ''; }

    this._setSlot(this._resultsHTML(result));
    this._activeCard = 'direct'; // open first card by default
    this._bindCards(result);
    this._expandCard('direct');
  }

  _resultsHTML(result) {
    const notice = result.expansions?.length
      ? `<div class="po-expanded-notice">🧠 Auto-expanded with: ${result.expansions.map(e => e.label).join(', ')}</div>`
      : '';

    const cards = VARIANTS.map(v => {
      const tok = window.PO.TokenEstimator.estimate(result[v.key]);
      return `
        <div class="po-card" data-key="${v.key}">
          <div class="po-card-hdr" data-expand="${v.key}">
            <span class="po-card-icon">${v.icon}</span>
            <div class="po-card-meta">
              <div class="po-card-name">${v.name}</div>
              <div class="po-card-desc">${v.desc}</div>
            </div>
            <div class="po-card-token">
              <span class="po-token-dot" style="background:${tok.color}"></span>
              ${tok.label}
            </div>
            <span class="po-chevron">▼</span>
          </div>
          <div class="po-card-body">
            <div class="po-prompt-wrap" data-wrap="${v.key}">
              <div class="po-prompt-text" data-text="${v.key}">${this._safeText(result[v.key])}</div>
            </div>
            <div class="po-card-actions">
              <button class="po-btn-copy" data-copy="${v.key}">Copy</button>
              <button class="po-btn-insert" data-insert="${v.key}">Use this →</button>
            </div>
          </div>
        </div>`;
    }).join('');

    const clarify = result.clarifyingQuestions?.length
      ? `<div class="po-clarify">
           <div class="po-clarify-hdr" id="po-cq-hdr">💡 Strengthen your prompt<span class="po-clarify-tog" id="po-cq-tog">▼</span></div>
           <div class="po-clarify-body" id="po-cq-body">
             ${result.clarifyingQuestions.map((q,i) =>
               `<div class="po-q"><span class="po-q-n">${i+1}</span><span>${q}</span></div>`
             ).join('')}
           </div>
         </div>`
      : '';

    return `
      ${notice}
      <div class="po-cards" id="po-cards">${cards}</div>
      ${clarify}
    `;
  }

  _safeText(t) {
    return (t || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  _bindCards(result) {
    const s = this._shadow;

    // Expand on header click
    s.querySelectorAll('[data-expand]').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const key = hdr.dataset.expand;
        // Toggle: click same card collapses it
        this._activeCard = (this._activeCard === key) ? null : key;
        VARIANTS.forEach(v => {
          const card = s.querySelector(`.po-card[data-key="${v.key}"]`);
          if (!card) return;
          card.classList.toggle('active', this._activeCard === v.key);
        });
      });
    });

    // Scroll fade — remove gradient when scrolled to bottom
    s.querySelectorAll('[data-wrap]').forEach(wrap => {
      const key = wrap.dataset.wrap;
      const text = s.querySelector(`[data-text="${key}"]`);
      if (!text) return;
      text.addEventListener('scroll', () => {
        const atBottom = text.scrollHeight - text.scrollTop <= text.clientHeight + 4;
        wrap.classList.toggle('scrolled-to-bottom', atBottom);
      }, { passive: true });
    });

    // Copy
    s.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(result[btn.dataset.copy]).then(() => {
          const orig = btn.textContent;
          btn.textContent = '✓ Copied';
          btn.classList.add('flashing');
          setTimeout(() => { btn.textContent = orig; btn.classList.remove('flashing'); }, 1500);
        });
      });
    });

    // Insert
    s.querySelectorAll('[data-insert]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ok = this.detector.setTextareaContent(result[btn.dataset.insert]);
        if (ok) {
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Inserted!';
          btn.style.background = '#10b981';
          setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; this._close(); }, 1400);
        }
      });
    });

    // Clarify toggle
    s.getElementById('po-cq-hdr')?.addEventListener('click', () => {
      const body = s.getElementById('po-cq-body');
      const tog = s.getElementById('po-cq-tog');
      body?.classList.toggle('open');
      if (tog) tog.textContent = body?.classList.contains('open') ? '▲' : '▼';
    });
  }

  _expandCard(key) {
    const s = this._shadow;
    const card = s.querySelector(`.po-card[data-key="${key}"]`);
    if (card) card.classList.add('active');
  }

  destroy() {
    this.detector.stopObserving();
    this._host?.remove();
    this._host = null;
  }
};
