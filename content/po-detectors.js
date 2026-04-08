/**
 * po-detectors.js — Site-specific textarea detectors
 * Each detector knows how to: find textarea, read content, write content, anchor the button
 */

window.PO = window.PO || {};

// ─── Base Detector ────────────────────────────────────────────────────────

class BaseDetector {
  constructor(siteId, displayName) {
    this.siteId = siteId;
    this.displayName = displayName;
    this._observer = null;
  }

  /** Return the active textarea element or null */
  getTextareaElement() { return null; }

  /** Read text from the textarea */
  getTextareaContent() {
    const el = this.getTextareaElement();
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return el.value;
    return el.innerText || el.textContent || '';
  }

  /** Write optimized text back into the textarea */
  setTextareaContent(text) {
    const el = this.getTextareaElement();
    if (!el) return false;

    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      // React synthetic event trick
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // contenteditable — select all then insertText
      el.focus();
      // Select all existing content
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
      // Insert new text (works with ProseMirror, Draft.js, Quill)
      document.execCommand('insertText', false, text);
    }
    el.focus();
    return true;
  }

  /** Return the element near which the floating button should appear */
  getAnchorElement() {
    return this.getTextareaElement()?.closest('form, [role="region"]') || this.getTextareaElement();
  }

  /** Watch for the textarea to appear (SPA lazy render) */
  observeForElement(callback) {
    if (this._observer) this._observer.disconnect();
    this._observer = new MutationObserver(() => {
      const el = this.getTextareaElement();
      if (el) {
        this._observer.disconnect();
        callback(el);
      }
    });
    this._observer.observe(document.body, { childList: true, subtree: true });

    // Also try immediately
    const el = this.getTextareaElement();
    if (el) callback(el);
  }

  stopObserving() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}

// ─── ChatGPT Detector ─────────────────────────────────────────────────────

class ChatGPTDetector extends BaseDetector {
  constructor() { super('chatgpt', 'ChatGPT'); }

  getTextareaElement() {
    // Primary: contenteditable div with id prompt-textarea
    return document.querySelector('#prompt-textarea')
      || document.querySelector('div[contenteditable="true"][data-id]')
      || document.querySelector('textarea[placeholder*="message"]')
      || document.querySelector('div[contenteditable="true"]');
  }

  getAnchorElement() {
    return document.querySelector('div[data-testid="composer-background"]')
      || document.querySelector('form[class*="stretch"]')
      || this.getTextareaElement()?.closest('form')
      || this.getTextareaElement();
  }
}

// ─── Claude Detector ──────────────────────────────────────────────────────

class ClaudeDetector extends BaseDetector {
  constructor() { super('claude', 'Claude'); }

  getTextareaElement() {
    // Claude uses ProseMirror
    return document.querySelector('div[contenteditable="true"].ProseMirror')
      || document.querySelector('[contenteditable="true"][class*="ProseMirror"]')
      || document.querySelector('div[contenteditable="true"][translate="no"]')
      || document.querySelector('fieldset div[contenteditable="true"]');
  }

  getAnchorElement() {
    return document.querySelector('fieldset')
      || document.querySelector('[class*="inputContainer"]')
      || this.getTextareaElement()?.closest('[class*="input"]')
      || this.getTextareaElement();
  }

  setTextareaContent(text) {
    const el = this.getTextareaElement();
    if (!el) return false;

    // ProseMirror requires execCommand approach
    el.focus();
    // Select all
    document.execCommand('selectAll', false, null);
    // Insert
    document.execCommand('insertText', false, text);
    // Fire input event for React
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    return true;
  }
}

// ─── Gemini Detector ──────────────────────────────────────────────────────

class GeminiDetector extends BaseDetector {
  constructor() { super('gemini', 'Gemini'); }

  getTextareaElement() {
    // Gemini uses a custom web component with nested contenteditable
    return document.querySelector('rich-textarea div[contenteditable="true"]')
      || document.querySelector('.ql-editor[contenteditable="true"]')
      || document.querySelector('div[contenteditable="true"][aria-multiline="true"]')
      || document.querySelector('textarea[aria-label*="message" i]');
  }

  getAnchorElement() {
    return document.querySelector('.text-input-field_textarea-wrapper')
      || document.querySelector('rich-textarea')
      || document.querySelector('[class*="inputAreaContainer"]')
      || this.getTextareaElement()?.closest('[class*="input"]')
      || this.getTextareaElement();
  }
}

// ─── Copilot Detector ─────────────────────────────────────────────────────

class CopilotDetector extends BaseDetector {
  constructor() { super('copilot', 'Copilot'); }

  getTextareaElement() {
    return document.querySelector('#userInput')
      || document.querySelector('textarea[data-testid*="input" i]')
      || document.querySelector('textarea[placeholder*="message" i]')
      || document.querySelector('textarea[aria-label*="chat" i]')
      || document.querySelector('div[contenteditable="true"][aria-label*="chat" i]');
  }

  getAnchorElement() {
    return document.querySelector('div.input-row')
      || document.querySelector('[class*="inputContainer"]')
      || this.getTextareaElement()?.closest('form')
      || this.getTextareaElement();
  }
}

// ─── DeepSeek Detector ────────────────────────────────────────────────────

class DeepSeekDetector extends BaseDetector {
  constructor() { super('deepseek', 'DeepSeek'); }

  getTextareaElement() {
    return document.querySelector('textarea#chat-input')
      || document.querySelector('textarea[placeholder*="message" i]')
      || document.querySelector('textarea[class*="chat"]')
      || document.querySelector('textarea');
  }

  getAnchorElement() {
    return document.querySelector('[class*="chat-input-container"]')
      || document.querySelector('[class*="inputContainer"]')
      || this.getTextareaElement()?.closest('form')
      || this.getTextareaElement()?.parentElement;
  }
}

// ─── Manus Detector ───────────────────────────────────────────────────────

class ManusDetector extends BaseDetector {
  constructor() { super('manus', 'Manus'); }

  getTextareaElement() {
    return document.querySelector('textarea[placeholder]')
      || document.querySelector('[class*="input-box"] textarea')
      || document.querySelector('textarea');
  }

  getAnchorElement() {
    return document.querySelector('[class*="input-box"]')
      || this.getTextareaElement()?.closest('form')
      || this.getTextareaElement()?.parentElement;
  }
}

// ─── Detector Factory ────────────────────────────────────────────────────

window.PO.getDetector = function () {
  const host = window.location.hostname;

  if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) {
    return new ChatGPTDetector();
  }
  if (host.includes('claude.ai')) {
    return new ClaudeDetector();
  }
  if (host.includes('gemini.google.com')) {
    return new GeminiDetector();
  }
  if (host.includes('copilot.microsoft.com')) {
    return new CopilotDetector();
  }
  if (host.includes('chat.deepseek.com')) {
    return new DeepSeekDetector();
  }
  if (host.includes('manus.im')) {
    return new ManusDetector();
  }

  return null;
};
