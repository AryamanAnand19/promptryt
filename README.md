# PromptRyt ✦

> Your AI prompt co-pilot — works where you work, no account needed.

PromptRyt is a Chrome extension that floats on AI chat sites and instantly transforms your rough idea into **3 optimized prompt variants** tailored to the specific LLM you're using.

![PromptRyt in action](https://github.com/AryamanAnand19/promptryt/raw/main/icons/icon128.png)

---

## What it does

When you're typing into ChatGPT, Claude, Gemini, Copilot, DeepSeek, or Manus — click the **✦ Ryt** tab on the right edge of the page. PromptRyt reads your draft and generates:

| Variant | What it's for |
|---|---|
| ⚡ **Direct** | Short, sharp, imperative. Gets straight to the point with zero fluff. |
| ✦ **Well-Rounded** | Adds role, context, and output format. LLM-specific structure (XML tags for Claude, role prompting for ChatGPT, chain-of-thought for DeepSeek). |
| 🔬 **Technical** | Full scaffolding — task breakdown, constraints, thinking process, and a precise output spec. Maximum reproducibility. |

Click **"Use this →"** to insert your chosen variant directly into the chat.

---

## Smart features

- **Abbreviation expansion** — `roi` → `return on investment`, `diff` → `difference`, `kpi` → `key performance indicators`, and 40+ more
- **Concept chain completion** — mention ROI and it auto-adds 1yr/3yr/5yr horizon, internship scope, job sectors; mention a strategy and it adds market sizing, risk analysis, KPIs
- **Proper noun fixing** — `kcl` → `KCL`, `edinburgh` → `Edinburgh`, `github` → `GitHub`, `python` → `Python`
- **Token estimator** — colour-coded token count on every variant (green → amber → red)
- **LLM-aware structure** — Claude gets XML tags, DeepSeek gets reasoning chains, Gemini gets markdown headers

---

## Supported sites

- [x] ChatGPT (chatgpt.com)
- [x] Claude (claude.ai)
- [x] Gemini (gemini.google.com)
- [x] Microsoft Copilot (copilot.microsoft.com)
- [x] DeepSeek (chat.deepseek.com)
- [x] Manus (manus.im)

---

## Install (Chrome — unpacked)

Until the Chrome Web Store listing is live, load it manually:

1. Clone or download this repo
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `promptryt` folder
5. Open any supported AI site — the **✦ Ryt** tab appears on the right edge

---

## Project structure

```
promptryt/
├── manifest.json              # MV3 config — 6 AI sites, minimal permissions
├── background/
│   └── service-worker.js      # Lightweight lifecycle hooks (no API calls)
├── content/
│   ├── po-core.js             # Token estimator, word diff, storage helpers
│   ├── po-detectors.js        # Per-site textarea finders (SPA-aware, MutationObserver)
│   ├── po-optimizers.js       # 3-variant generator + abbreviation expander + concept chains
│   ├── po-ui.js               # Shadow DOM panel: bottom-right drawer, card UI
│   └── po-main.js             # Entry point + enable/disable logic
├── options/                   # Settings page (site toggles, how-it-works, privacy)
├── popup/                     # Toolbar popup (active site indicator, quick toggle)
└── icons/                     # PNG icons (16, 32, 48, 128px) + SVG source
```

---

## Privacy

- **100% local** — all prompt processing happens in your browser
- **No account, no API key** — works out of the box
- **No tracking** — no analytics, no telemetry, nothing leaves your device

---

## Roadmap

- [ ] Chrome Web Store listing
- [ ] Firefox / Edge support
- [ ] Custom prompt templates per site
- [ ] Prompt history (local only)
- [ ] Dark mode panel
- [ ] More sites: Perplexity, Grok, Le Chat

---

## Contributing

PRs welcome. Open an issue first for anything beyond a bug fix.

---

## License

MIT
