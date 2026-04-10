# PromptRyt ✦

> Your AI prompt co-pilot — works where you work, no account needed.

PromptRyt is a Chrome extension that floats on AI chat sites and instantly transforms your rough idea into **3 optimized prompt variants** tailored to the specific LLM you're using.

---

## What it does

When you're typing into ChatGPT, Claude, Gemini, Copilot, DeepSeek, or Manus — click the **✦ Ryt** tab on the right edge of the page. PromptRyt reads your draft and generates:

| Variant | What it's for |
|---|---|
| ⚡ **Direct** | Short, sharp, imperative. Gets straight to the point with zero fluff. |
| ✦ **Well-Rounded** | Adds role, context, and output format. LLM-specific structure (XML tags for Claude, chain-of-thought for DeepSeek, headers for Gemini). |
| 🔬 **Technical** | Full scaffolding — task breakdown, dimension coverage, thinking process, and a precise output spec. Maximum reproducibility. |

Click **"Use this →"** to insert your chosen variant directly into the chat.

---

## Smart features

### Abbreviation expansion
`roi` → `return on investment`, `diff` → `difference`, `kpi` → `key performance indicators`, and 40+ more. Your shorthand becomes unambiguous before it ever reaches the LLM.

### Proper noun fixing (120+ entries)
`kcl` → `KCL`, `edinburgh` → `Edinburgh`, `github` → `GitHub`, `python` → `Python`, `openai` → `OpenAI`. Covers universities, AI labs, big tech, frameworks, cloud platforms, databases, business acronyms, medical terms, legal abbreviations, and geography. Pattern-based detection also handles all-caps acronyms not in the dictionary.

### Two-layer dimension injection — the core engine
This is what separates PromptRyt from simple prompt templates.

**Layer 1 — Intent detection:** PromptRyt identifies what you're trying to do (coding, analysis, planning, writing, debugging, explanation, ideation, comparison, summarization, transformation). Each intent has 4–6 universal dimensions that always matter — for example, a planning request always benefits from surfacing constraints, success criteria, and sequencing.

**Layer 2 — Domain detection:** Simultaneously, PromptRyt detects your professional context from keywords. 14 domains are supported:

| Domain | Example triggers |
|---|---|
| Finance | invest, portfolio, valuation, cash flow, ARR, CAC |
| Health & Medical | patient, diagnosis, clinical, NHS, ICU, dosage |
| Legal | contract, compliance, GDPR, jurisdiction, tort |
| Data & Analytics | dataset, SQL, A/B test, regression, dashboard |
| Technology | architecture, API, DevOps, microservice, cloud |
| Marketing | campaign, conversion, SEO, persona, funnel |
| Education | curriculum, learning outcome, assessment, pedagogy |
| Research & Academic | hypothesis, peer review, methodology, p-value |
| Business Strategy | go-to-market, competitive, SWOT, pivot, OKR |
| Creative & Design | typography, Figma, wireframe, brand identity |
| HR & Career | resume, interview, salary negotiation, recruiter |
| Product Management | roadmap, sprint, PRD, user story, NPS |
| Operations & Logistics | supply chain, lead time, lean, SLA, ERP |
| Culinary | recipe, ingredients, dietary, technique, allergen |

**Dimension budget:** 4 from intent + 2 from primary domain + 2 from secondary domain = up to 8 focused dimensions, deduplicated. A medical student asking for a study plan gets different dimensions to a product manager asking for a study plan.

### LLM-aware structure
Claude gets XML `<task>` and `<output_format>` tags. DeepSeek gets chain-of-thought framing. Gemini gets markdown headers. ChatGPT and Copilot get clean role + task + format blocks.

### Token estimator
Colour-coded token count on every variant (green → amber → red) so you can see immediately whether a variant fits within context limits.

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
│   ├── po-optimizers.js       # Two-layer dimension engine + 3-variant generator
│   ├── po-ui.js               # Shadow DOM panel: bottom-right drawer, card UI
│   └── po-main.js             # Entry point + enable/disable logic
├── options/                   # Settings page (site toggles, how-it-works, privacy)
├── popup/                     # Toolbar popup (active site indicator, quick toggle)
└── icons/                     # PNG icons (16, 32, 48, 128px) + SVG source
```

---

## Good to know

**It works on rough, unpolished text.** PromptRyt is built for the moment before you clean up — the half-formed thought, the note-to-self, the brain dump. Don't polish before using it; that defeats the point.

**Domain detection is keyword-based, not AI.** If your prompt doesn't include domain-specific language, PromptRyt will fall back to intent-only dimensions. Adding one or two domain words (e.g. "patient", "sprint", "portfolio") activates the relevant specialist layer.

**The three variants are intentionally different tools, not quality tiers.** Direct is not a worse version of Technical — it's a different use case. Use Direct for quick lookups and simple tasks. Use Well-Rounded for nuanced requests where framing matters. Use Technical when you need reproducible, structured output.

**The PLACEHOLDER fields in Technical prompts are intentional.** They mark context you should fill in before sending — audience, tone, constraints. PromptRyt can't know your specific situation; the PLACEHOLDER cues prompt you to add it. Think of Technical as a structured interview you finish yourself.

**"Use this →" inserts directly into the text box.** The extension handles React controlled inputs (ChatGPT), ProseMirror editors (Claude), and standard textareas — you don't need to copy-paste.

**No account, no API key, no data leaves your browser.** All processing happens locally in JavaScript. PromptRyt reads only the text you type into supported AI chat pages, and only when you click the Ryt tab.

**Per-site enable/disable from the toolbar popup.** If you only want PromptRyt active on Claude but not ChatGPT, you can toggle sites independently in the popup.

**Dimension injection scales with prompt complexity.** Short prompts (< ~20 words) tend to get fewer injected dimensions because there's less signal to detect intent and domain from. More context in your draft = better results.

---

## Privacy

- **100% local** — all prompt processing happens in your browser
- **No account, no API key** — works out of the box
- **No tracking** — no analytics, no telemetry, nothing leaves your device
- **Minimal permissions** — only `storage` (for per-site toggles) and `activeTab`

---

## Roadmap

- [ ] Chrome Web Store listing
- [ ] Firefox / Edge support
- [ ] Custom prompt templates per site
- [ ] Prompt history (local only)
- [ ] Dark mode panel
- [ ] More sites: Perplexity, Grok, Le Chat
- [ ] User-defined domain keywords
- [ ] Inline diff view comparing original vs optimized prompt

---

## Contributing

PRs welcome. Open an issue first for anything beyond a bug fix.

---

## License

MIT
