/**
 * po-optimizers.js
 * Generates 3 prompt variants: Direct / Well-Rounded / Technical
 * With smart abbreviation expansion + concept chain completion.
 * No API key required.
 */

window.PO = window.PO || {};

// ─── Abbreviation Expander ────────────────────────────────────────────────
// Expands shorthand so the prompt is unambiguous to the LLM

const ABBREVIATIONS = {
  'roi':    'return on investment',
  'kpi':    'key performance indicators',
  'kpis':   'key performance indicators',
  'mvp':    'minimum viable product',
  'poc':    'proof of concept',
  'ux':     'user experience',
  'ui':     'user interface',
  'api':    'API (application programming interface)',
  'diff':   'difference',
  'diffs':  'differences',
  'info':   'information',
  'doc':    'documentation',
  'docs':   'documentation',
  'repo':   'repository',
  'cfg':    'configuration',
  'config': 'configuration',
  'db':     'database',
  'auth':   'authentication',
  'pls':    'please',
  'plz':    'please',
  'thx':    'thanks',
  'btw':    'by the way',
  'fyi':    'for your information',
  'asap':   'as soon as possible',
  'imo':    'in my opinion',
  'tldr':   'summary',
  'aka':    'also known as',
  'vs':     'versus',
  'lol':    '',  // strip
  'eg':     'for example',
  'ie':     'that is',
  'etc':    'and so on',
  'hr':     'human resources',
  'b2b':    'business-to-business',
  'b2c':    'business-to-consumer',
  'saas':   'software-as-a-service',
  'ai':     'AI',
  'ml':     'machine learning',
  'llm':    'large language model',
  'cv':     'curriculum vitae (resume)',
  'gpa':    'grade point average',
  'cs':     'computer science',
  'eng':    'engineering',
  'biz':    'business',
  'mgmt':   'management',
  'fin':    'finance',
  'mkt':    'marketing',
  'hr':     'human resources',
};

function expandAbbreviations(text) {
  return text.replace(/\b([a-z]{2,6})\b/gi, (match) => {
    const lower = match.toLowerCase();
    return ABBREVIATIONS[lower] !== undefined
      ? (ABBREVIATIONS[lower] || '')  // empty string = strip
      : match;
  }).replace(/\s{2,}/g, ' ').trim();
}

// ─── Concept Chain Expander ────────────────────────────────────────────────
// When key concepts are detected, adds relevant dimensions the user likely
// forgot to mention — completing their chain of thought.

const CONCEPT_CHAINS = [
  // Education / Career ROI
  {
    triggers: [/\broi\b/i, /return on investment/i],
    context: [/student|college|degree|course|major|university|education|career|job/i],
    additions: [
      'short-term ROI (0–1 year): internship opportunities and starting salary',
      'mid-term ROI (1–3 years): career growth trajectory and promotions',
      'long-term ROI (3–5+ years): industry earning potential and seniority ceiling',
      'non-financial ROI: skill development, network building, work-life balance',
      'job market demand: top hiring sectors and geographic demand',
      'opportunity cost: what is given up by choosing this path',
    ],
    label: 'career ROI analysis',
  },
  // Internship / Job hunting
  {
    triggers: [/\binternship\b/i, /\bjob search\b/i, /\bjob hunt\b/i],
    context: [/student|graduate|fresher|entry.?level/i],
    additions: [
      'top sectors and companies actively hiring in this field',
      'required skills vs. skills gap analysis',
      'typical stipend or salary range for entry-level roles',
      'remote vs. on-site availability',
      'application timeline and recruitment cycles',
      'portfolio or project requirements to stand out',
    ],
    label: 'job/internship research',
  },
  // Business strategy
  {
    triggers: [/\bstrategy\b/i, /\bbusiness plan\b/i, /\bgo.?to.?market\b/i],
    context: [/.*/],
    additions: [
      'target customer segment and market size (TAM/SAM/SOM)',
      'competitive landscape and differentiation',
      'pricing model and revenue streams',
      'key metrics and milestones (KPIs)',
      'resource requirements and budget',
      'risks and mitigation strategies',
    ],
    label: 'business strategy framework',
  },
  // Product / Feature decisions
  {
    triggers: [/\bfeature\b/i, /\bproduct\b/i],
    context: [/build|launch|prioritize|decide|choose|add/i],
    additions: [
      'user impact: who benefits and how many users are affected',
      'effort estimate: development complexity and time',
      'success metrics: how to measure if this feature works',
      'alternatives considered',
      'potential risks or trade-offs',
    ],
    label: 'product decision framework',
  },
  // Learning a skill
  {
    triggers: [/\blearn\b/i, /\bstudy\b/i],
    context: [/how|best|fastest|roadmap|path|way to/i],
    additions: [
      'prerequisite knowledge needed',
      'recommended learning resources (free and paid)',
      'realistic time investment to reach proficiency',
      'practical projects to build as you learn',
      'common mistakes beginners make',
      'how to validate skill acquisition',
    ],
    label: 'learning roadmap',
  },
  // Comparison / Decision making
  {
    triggers: [/\bvs\.?\b/i, /\bversus\b/i, /\bcompare\b/i, /\bbetter\b/i],
    context: [/.*/],
    additions: [
      'key criteria for comparison (performance, cost, ease of use, scalability)',
      'use-case fit: which scenarios favor each option',
      'long-term considerations: support, community, future-proofing',
      'recommendation based on the stated context',
    ],
    label: 'structured comparison',
  },
  // Email / Communication
  {
    triggers: [/\bemail\b/i, /\bletter\b/i, /\bmessage\b/i],
    context: [/write|draft|compose|send|formal|professional/i],
    additions: [
      'desired tone: formal, semi-formal, or assertive',
      'key ask or call-to-action (what the reader should do)',
      'deadline or urgency level',
      'relevant context the recipient needs',
    ],
    label: 'communication brief',
  },
];

function getConceptExpansions(text, intent) {
  const expansions = [];
  for (const chain of CONCEPT_CHAINS) {
    const triggerMatch = chain.triggers.some(t => t.test(text));
    const contextMatch = chain.context.some(c => c.test(text));
    if (triggerMatch && contextMatch) {
      expansions.push({ label: chain.label, items: chain.additions });
    }
  }
  return expansions;
}

// ─── Intent Detection ────────────────────────────────────────────────────

function detectIntent(text) {
  const t = text.toLowerCase();
  if (/\b(fix|debug|error|bug|crash|broken|exception|not working|fails?)\b/.test(t)) return 'debugging';
  if (/\b(write|draft|compose|create|generate)\b.{0,25}\b(email|letter|message|report|blog|essay|post|article|copy|content|story)\b/.test(t)) return 'writing';
  if (/\b(code|function|class|script|implement|build|program|algorithm|sql|query|regex|endpoint)\b/.test(t)) return 'coding';
  if (/\b(explain|what is|what are|how does|how do|why does|why is|describe|difference between|compare|vs\.?|versus)\b/.test(t)) return 'explanation';
  if (/\b(analyze|review|evaluate|assess|audit|critique|feedback on)\b/.test(t)) return 'analysis';
  if (/\b(plan|strategy|roadmap|steps to|how to|guide to|approach to|framework)\b/.test(t)) return 'planning';
  if (/\b(summarize|summary|tldr|brief|overview|key points|main points)\b/.test(t)) return 'summarization';
  if (/\b(brainstorm|ideas?|suggest|alternatives?|options? for|possibilities)\b/.test(t)) return 'ideation';
  if (/\b(translate|convert|rewrite|rephrase|paraphrase|transform)\b/.test(t)) return 'transformation';
  return 'general';
}

function detectLanguage(text) {
  const t = text.toLowerCase();
  if (/\bpython\b|\.py\b/.test(t)) return 'Python';
  if (/\btypescript\b|\.tsx?\b/.test(t)) return 'TypeScript';
  if (/\bjavascript\b|\bjs\b|\bnode\.?js\b/.test(t)) return 'JavaScript';
  if (/\bjava\b/.test(t)) return 'Java';
  if (/\bc#\b|csharp/.test(t)) return 'C#';
  if (/\bgo\b|\bgolang\b/.test(t)) return 'Go';
  if (/\brust\b/.test(t)) return 'Rust';
  if (/\bsql\b/.test(t)) return 'SQL';
  if (/\bswift\b/.test(t)) return 'Swift';
  return null;
}

function extractCore(text) {
  return text.trim()
    .replace(/^(please\s+|can you\s+|could you please?\s+|i (want|need|would like|wanna) (you to\s+)?|help me (to\s+)?|i'm looking (for|to)\s+|tell me\s+)/i, '')
    .replace(/\s+/g, ' ').trim();
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function dot(s) { const t = s.trim(); return /[.!?]$/.test(t) ? t : t + '.'; }

// ─── Variant 1: Direct ───────────────────────────────────────────────────
// One clean imperative. No scaffolding. Fast.

function generateDirect(core, expandedCore, intent, lang) {
  const suffixMap = {
    writing:        'Return only the final text, formatted and ready to use.',
    coding:         `Return working ${lang || 'code'} only. Add a brief usage comment.`,
    debugging:      'State the root cause, then the fix.',
    explanation:    'Be concise. Use one concrete example.',
    analysis:       'Return key findings and one clear recommendation.',
    planning:       'Return a numbered action plan, max 7 steps.',
    summarization:  'Return 3–5 bullet points. Lead with the most important.',
    ideation:       'List 6 distinct options, one line each.',
    transformation: 'Return only the transformed result.',
    general:        '',
  };
  const suffix = suffixMap[intent] || '';
  return `${dot(cap(expandedCore))}${suffix ? '\n\n' + suffix : ''}`;
}

// ─── Variant 2: Well-Rounded ─────────────────────────────────────────────
// Role + context + clear task + output format. LLM-specific structure.

function generateBalanced(core, expandedCore, intent, lang, siteId, expansions) {
  const roleMap = {
    coding:        `You are an expert ${lang || 'software'} engineer.`,
    writing:       'You are a skilled professional writer and editor.',
    debugging:     'You are a senior engineer who specializes in systematic debugging.',
    explanation:   'You are a knowledgeable teacher who makes complex ideas accessible.',
    analysis:      'You are a senior analyst with deep expertise in this domain.',
    planning:      'You are a strategic planner and execution expert.',
    summarization: 'You are a precise summarizer who captures the essence without losing nuance.',
    ideation:      'You are a creative strategist known for generating distinctive, practical ideas.',
    general:       'You are a knowledgeable, helpful assistant.',
  };

  const formatMap = {
    coding:        `Include: (1) working, commented ${lang || ''} code, (2) brief explanation of approach, (3) a usage example.`,
    writing:       'Provide the final polished text. Match the appropriate tone for the audience.',
    debugging:     'Structure: Root Cause → Fix → How to prevent this class of bug.',
    explanation:   'Structure: Simple overview (1 paragraph) → Key concepts (with examples) → Key takeaway.',
    analysis:      'Structure: Executive summary → Key findings (bullets) → Recommendations.',
    planning:      'Provide a numbered, sequenced action plan with clear outcomes per step.',
    summarization: 'Format: Core insight (1 sentence) → Key points (3–5 bullets) → Action item.',
    ideation:      'List 6 options. For each: name → one-line description → key advantage.',
    general:       'Format your response with appropriate structure for easy reading.',
  };

  const role = roleMap[intent] || roleMap.general;
  const format = formatMap[intent] || formatMap.general;
  const task = dot(cap(expandedCore));

  // Add concept expansions as context if any were found
  let expansionContext = '';
  if (expansions.length > 0) {
    const items = expansions[0].items.slice(0, 4).map(i => `- ${i}`).join('\n');
    expansionContext = `\n\nMake sure to address these dimensions:\n${items}`;
  }

  if (siteId === 'claude') {
    return `${role}\n\n<task>\n${task}${expansionContext}\n</task>\n\n<output_format>\n${format}\n</output_format>`;
  }

  return `${role}\n\n${task}${expansionContext}\n\n${format}`;
}

// ─── Variant 3: Technical ────────────────────────────────────────────────
// Full chain-of-thought scaffolding, all dimensions, maximum reproducibility.

function generateTechnical(core, expandedCore, intent, lang, siteId, expansions) {
  const task = dot(cap(expandedCore));
  const l = lang || '[LANGUAGE]';

  // Build expansion section if concepts were detected
  let expansionSection = '';
  if (expansions.length > 0) {
    const allItems = expansions.flatMap(e => e.items);
    expansionSection = `\n## Dimensions to Cover\nAddress ALL of the following:\n${allItems.map(i => `- ${i}`).join('\n')}\n`;
  }

  const templates = {
    coding: () =>
      `## Task\n${task}\n\n## Requirements\n- Language: ${l}\n- Handle edge cases and invalid inputs gracefully\n- Write clean, readable code with inline comments\n- Follow ${l === '[LANGUAGE]' ? 'language' : l} best practices\n\n## Thinking Process\n1. Clarify the problem and constraints\n2. Design the algorithm or architecture\n3. Identify edge cases upfront\n4. Implement, then review\n\n## Output Format\n\`\`\`${l.toLowerCase().replace('[language]','')}\n// Implementation here\n\`\`\`\n\n**Approach:** [explain your design decisions]\n\n**Test Cases:**\n| Input | Expected Output | Notes |\n|-------|----------------|-------|\n| ...   | ...            | ...   |`,

    writing: () =>
      `## Writing Task\n${task}\n\n## Brief\n- **Audience:** [PLACEHOLDER — who reads this?]\n- **Tone:** [PLACEHOLDER — formal / persuasive / warm / authoritative]\n- **Length:** [PLACEHOLDER — approximate word count]\n- **Goal:** [PLACEHOLDER — what should the reader feel or do after reading?]\n- **Key message:** [PLACEHOLDER — the one thing that must land]\n\n## Structure\nPlan before writing:\n1. Opening hook (capture attention)\n2. Core body (deliver the value)\n3. Closing (clear call-to-action or memorable ending)\n\n## Output\nReturn the final, polished text only.`,

    debugging: () =>
      `## Problem\n${task}\n\n## Debugging Protocol\n1. **Reproduce** — confirm the exact conditions that trigger the issue\n2. **Isolate** — narrow down to the smallest failing case\n3. **Hypothesize** — list the 2–3 most likely root causes\n4. **Test** — eliminate hypotheses systematically\n5. **Fix** — implement the confirmed solution\n6. **Verify** — confirm fix works and doesn't regress\n\n## Output Format\n- **Root Cause:** [precise explanation]\n- **Fix:** [corrected code or configuration]\n- **Why it works:** [explain the fix]\n- **Prevention:** [how to avoid this class of bug]`,

    explanation: () =>
      `## Explanation Request\n${task}\n\n## Depth\n[PLACEHOLDER — beginner / intermediate / expert]\n\n## Teaching Framework\n1. **Hook** — why does this matter in the real world?\n2. **Core concept** — plain-language definition\n3. **Mental model** — analogy or visual metaphor\n4. **Worked example** — concrete, step-by-step\n5. **Common misconceptions** — what people often get wrong\n6. **Key takeaway** — the one sentence to remember\n\n## Output Format\n**Simple definition:** [1 sentence]\n**How it works:** [clear explanation]\n**Example:** [worked through]\n**Misconception to avoid:** [common wrong belief]\n**Remember:** [the takeaway]`,

    analysis: () =>
      `## Analysis Task\n${task}${expansionSection}\n\n## Analytical Framework\n1. Define scope — what exactly is being evaluated and why it matters\n2. Gather evidence — what data, patterns, or context is relevant\n3. Identify insights — what is non-obvious or counterintuitive\n4. Evaluate tradeoffs — what are the tensions or risks\n5. Conclude — clear, evidence-backed recommendation\n\n## Output Format\n### Executive Summary\n[2–3 sentence answer to the core question]\n\n### Key Findings\n| Finding | Evidence | Implication |\n|---------|----------|-------------|\n| ...     | ...      | ...         |\n\n### Recommendation\n[Prioritized, specific, actionable]`,

    planning: () =>
      `## Planning Request\n${task}${expansionSection}\n\n## Context\n- Current state: [PLACEHOLDER]\n- Goal: [PLACEHOLDER]\n- Constraints: [PLACEHOLDER — time, resources, dependencies]\n- Success criteria: [PLACEHOLDER — how will you know it worked?]\n\n## Planning Framework\n1. Clarify the objective and success metrics\n2. Map dependencies and potential blockers\n3. Break into phases with clear milestones\n4. Prioritize and sequence tasks\n5. Identify top risks and mitigations\n\n## Output Format\n### Phase 1: [Name]\n- [ ] Step 1: [action] — [outcome]\n- [ ] Step 2: [action] — [outcome]\n\n### Phase 2: [Name]\n...\n\n### Risks & Mitigations\n| Risk | Likelihood | Mitigation |\n|------|-----------|------------|\n| ...  | ...       | ...        |`,

    ideation: () =>
      `## Ideation Task\n${task}${expansionSection}\n\n## Constraints\n- [PLACEHOLDER — any requirements]\n- [PLACEHOLDER — what to avoid]\n- [PLACEHOLDER — what's already been tried]\n\n## Process\n1. Generate 8–10 raw ideas without filtering\n2. Evaluate for feasibility, impact, and novelty\n3. Select the 6 most distinct and promising\n4. For each: state the idea, its core advantage, and one challenge\n\n## Output Format\n| # | Idea | Core Advantage | Challenge |\n|---|------|---------------|----------|\n| 1 | ...  | ...           | ...      |`,

    summarization: () =>
      `## Summarization Task\n${task}\n\n## Parameters\n- Audience: [PLACEHOLDER]\n- Target length: [PLACEHOLDER — 3 bullets / 1 paragraph / executive brief]\n- Priority: preserve the most critical ideas, omit repetition and filler\n\n## Output Format\n**Core thesis:** [1 sentence — what is this fundamentally about?]\n\n**Key points:**\n1. [Most important]\n2. [Second most important]\n3. [Third most important]\n\n**So what:** [what should the reader do or know based on this?]`,

    general: () =>
      `## Request\n${task}${expansionSection}\n\n## Context\n[PLACEHOLDER — add any relevant background the AI needs]\n\n## Constraints\n- [PLACEHOLDER — requirements or limitations]\n\n## Thinking Process\n1. Confirm understanding of the request\n2. Consider multiple approaches\n3. Choose the best approach with clear reasoning\n4. Deliver a well-structured response\n\n## Output Format\nUse clear headers and bullet points where they improve readability.`,
  };

  return (templates[intent] || templates.general)();
}

// ─── Main Export ──────────────────────────────────────────────────────────

window.PO.generateVariants = function (rawPrompt, siteId) {
  if (!rawPrompt || rawPrompt.trim().length < 4) return null;

  // Step 1: Expand abbreviations
  const expanded = expandAbbreviations(rawPrompt);

  // Step 2: Detect intent and language
  const intent = detectIntent(expanded);
  const lang = detectLanguage(expanded);

  // Step 3: Extract core request
  const core = extractCore(expanded);

  // Step 4: Find concept chain expansions
  const expansions = getConceptExpansions(expanded, intent);

  // Step 5: Generate 3 variants
  const direct   = generateDirect(core, core, intent, lang);
  const balanced = generateBalanced(core, core, intent, lang, siteId, expansions);
  const technical = generateTechnical(core, core, intent, lang, siteId, expansions);

  // Step 6: Clarifying questions
  const clarifyingQuestions = generateClarifyingQuestions(rawPrompt, intent, expansions);

  return {
    direct,
    balanced,
    technical,
    intent,
    expansions,
    clarifyingQuestions,
    expandedFrom: expanded !== rawPrompt ? expanded : null,
  };
};

function generateClarifyingQuestions(text, intent, expansions) {
  const q = [];
  const t = text.toLowerCase();

  if (intent === 'writing' && !/tone|formal|casual|professional/.test(t))
    q.push('What tone should this have? (formal, casual, persuasive?)');
  if (intent === 'writing' && !/audience|reader|for (a|an|the)/.test(t))
    q.push('Who is the intended reader or audience?');
  if (intent === 'coding' && !detectLanguage(text))
    q.push('Which programming language should be used?');
  if (intent === 'analysis' && !/focus|criteria|angle/.test(t))
    q.push('What specific angle should the analysis take?');
  if (intent === 'planning' && !/deadline|timeline|constraint/.test(t))
    q.push('What constraints exist? (deadline, team size, budget?)');

  return q.slice(0, 2);
}
