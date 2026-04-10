/**
 * po-optimizers.js
 * Generates 3 prompt variants: Direct / Well-Rounded / Technical
 * Two-layer dimension injection: intent-based + domain-based.
 * Generalized for any user (medical, legal, tech, creative, business…)
 * No API key required — 100% local rule-based.
 */

window.PO = window.PO || {};

// ─── Proper Noun Dictionary ──────────────────────────────────────────────────
// Structured by category for easy maintenance. 120+ entries.

const PROPER_NOUN_DICT = {
  // Universities & Academic Institutions
  'kcl': 'KCL', "king's college london": "King's College London",
  'ucl': 'UCL', 'imperial': 'Imperial College London',
  'lse': 'LSE', 'oxford': 'Oxford', 'cambridge': 'Cambridge',
  'mit': 'MIT', 'stanford': 'Stanford', 'harvard': 'Harvard',
  'yale': 'Yale', 'princeton': 'Princeton', 'columbia': 'Columbia',
  'caltech': 'Caltech', 'nyu': 'NYU', 'usc': 'USC', 'ucla': 'UCLA',
  'uc berkeley': 'UC Berkeley', 'michigan': 'University of Michigan',
  'iit': 'IIT', 'iim': 'IIM', 'nit': 'NIT', 'bits': 'BITS',
  'nus': 'NUS', 'ntu': 'NTU', 'eth zurich': 'ETH Zurich',
  'edinburgh': 'Edinburgh', 'manchester': 'Manchester',

  // AI Companies & Labs
  'openai': 'OpenAI', 'anthropic': 'Anthropic', 'deepmind': 'DeepMind',
  'google deepmind': 'Google DeepMind', 'mistral ai': 'Mistral AI',
  'hugging face': 'Hugging Face', 'cohere': 'Cohere', 'stability ai': 'Stability AI',
  'meta ai': 'Meta AI', 'xai': 'xAI',

  // Big Tech & Major Companies
  'google': 'Google', 'microsoft': 'Microsoft', 'apple': 'Apple',
  'amazon': 'Amazon', 'meta': 'Meta', 'netflix': 'Netflix',
  'nvidia': 'NVIDIA', 'amd': 'AMD', 'intel': 'Intel',
  'salesforce': 'Salesforce', 'oracle': 'Oracle', 'ibm': 'IBM',
  'adobe': 'Adobe', 'shopify': 'Shopify', 'stripe': 'Stripe',
  'twilio': 'Twilio', 'atlassian': 'Atlassian', 'slack': 'Slack',
  'zoom': 'Zoom', 'dropbox': 'Dropbox', 'spotify': 'Spotify',
  'uber': 'Uber', 'airbnb': 'Airbnb', 'lyft': 'Lyft',

  // AI Models & Chatbots
  'chatgpt': 'ChatGPT', 'claude': 'Claude', 'gemini': 'Gemini',
  'gpt-4': 'GPT-4', 'gpt4': 'GPT-4', 'gpt-3': 'GPT-3',
  'llama': 'LLaMA', 'mistral': 'Mistral', 'copilot': 'Microsoft Copilot',
  'grok': 'Grok', 'perplexity': 'Perplexity',

  // Programming Languages
  'javascript': 'JavaScript', 'typescript': 'TypeScript',
  'python': 'Python', 'java': 'Java', 'golang': 'Go', 'rust': 'Rust',
  'swift': 'Swift', 'kotlin': 'Kotlin', 'ruby': 'Ruby', 'php': 'PHP',
  'csharp': 'C#', 'cplusplus': 'C++', 'scala': 'Scala', 'haskell': 'Haskell',
  'r language': 'R', 'matlab': 'MATLAB', 'fortran': 'Fortran',

  // Frameworks & Libraries
  'react': 'React', 'nextjs': 'Next.js', 'vuejs': 'Vue.js', 'angular': 'Angular',
  'svelte': 'Svelte', 'nodejs': 'Node.js', 'express': 'Express',
  'django': 'Django', 'flask': 'Flask', 'fastapi': 'FastAPI',
  'spring': 'Spring', 'laravel': 'Laravel', 'rails': 'Ruby on Rails',
  'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch', 'keras': 'Keras',
  'scikit-learn': 'scikit-learn', 'pandas': 'pandas', 'numpy': 'NumPy',

  // Cloud & DevOps
  'aws': 'AWS', 'gcp': 'GCP', 'azure': 'Azure',
  'kubernetes': 'Kubernetes', 'docker': 'Docker', 'terraform': 'Terraform',
  'jenkins': 'Jenkins', 'github actions': 'GitHub Actions',
  'circleci': 'CircleCI', 'vercel': 'Vercel', 'netlify': 'Netlify',
  'heroku': 'Heroku', 'cloudflare': 'Cloudflare',

  // Developer Platforms
  'github': 'GitHub', 'gitlab': 'GitLab', 'bitbucket': 'Bitbucket',
  'jira': 'Jira', 'confluence': 'Confluence', 'notion': 'Notion',
  'figma': 'Figma', 'postman': 'Postman', 'vscode': 'VS Code',
  'intellij': 'IntelliJ IDEA', 'xcode': 'Xcode',

  // Databases
  'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL', 'mysql': 'MySQL',
  'mongodb': 'MongoDB', 'redis': 'Redis', 'elasticsearch': 'Elasticsearch',
  'dynamodb': 'DynamoDB', 'firebase': 'Firebase', 'supabase': 'Supabase',
  'snowflake': 'Snowflake', 'bigquery': 'BigQuery',

  // OS & Platforms
  'ios': 'iOS', 'macos': 'macOS', 'linux': 'Linux', 'windows': 'Windows',
  'android': 'Android', 'ubuntu': 'Ubuntu', 'debian': 'Debian',

  // Business Acronyms
  'roi': 'ROI', 'kpi': 'KPI', 'okr': 'OKR', 'mvp': 'MVP',
  'saas': 'SaaS', 'paas': 'PaaS', 'iaas': 'IaaS',
  'b2b': 'B2B', 'b2c': 'B2C', 'd2c': 'D2C', 'smb': 'SMB',
  'ceo': 'CEO', 'cto': 'CTO', 'coo': 'COO', 'cfo': 'CFO', 'cmo': 'CMO',
  'gtm': 'GTM', 'cac': 'CAC', 'ltv': 'LTV', 'arr': 'ARR', 'mrr': 'MRR',
  'tam': 'TAM', 'sam': 'SAM', 'som': 'SOM',
  'nda': 'NDA', 'mou': 'MoU', 'rfi': 'RFI', 'rfp': 'RFP', 'sow': 'SOW',

  // Tech Acronyms
  'api': 'API', 'sdk': 'SDK', 'ui': 'UI', 'ux': 'UX',
  'ai': 'AI', 'ml': 'ML', 'nlp': 'NLP', 'llm': 'LLM',
  'sql': 'SQL', 'nosql': 'NoSQL', 'rest': 'REST', 'graphql': 'GraphQL',
  'ci': 'CI', 'cd': 'CD', 'devops': 'DevOps', 'mlops': 'MLOps',
  'vpn': 'VPN', 'cdn': 'CDN', 'dns': 'DNS', 'ssl': 'SSL', 'tls': 'TLS',
  'seo': 'SEO', 'sem': 'SEM', 'crm': 'CRM', 'erp': 'ERP',

  // Medical Acronyms
  'ehr': 'EHR', 'emr': 'EMR', 'icu': 'ICU', 'er': 'ER',
  'cbt': 'CBT', 'dbt': 'DBT', 'adhd': 'ADHD', 'ptsd': 'PTSD',
  'gp': 'GP', 'nhs': 'NHS', 'fda': 'FDA', 'who': 'WHO',
  'hiv': 'HIV', 'aids': 'AIDS', 'bmi': 'BMI', 'bp': 'BP',
  'mrsa': 'MRSA', 'copd': 'COPD', 'ibd': 'IBD', 'ibs': 'IBS',

  // Academic Acronyms
  'msc': 'MSc', 'bsc': 'BSc', 'mba': 'MBA', 'phd': 'PhD',
  'pgce': 'PGCE', 'gre': 'GRE', 'gmat': 'GMAT', 'sat': 'SAT', 'act': 'ACT',
  'ielts': 'IELTS', 'toefl': 'TOEFL', 'gpa': 'GPA',

  // Legal
  'gdpr': 'GDPR', 'hipaa': 'HIPAA', 'ccpa': 'CCPA', 'sox': 'SOX',
  'iso': 'ISO', 'ipo': 'IPO', 'sec': 'SEC', 'ftc': 'FTC',
  'ip': 'IP', 'llc': 'LLC', 'ltd': 'Ltd', 'plc': 'PLC',

  // Social Platforms
  'linkedin': 'LinkedIn', 'twitter': 'Twitter', 'instagram': 'Instagram',
  'tiktok': 'TikTok', 'youtube': 'YouTube', 'reddit': 'Reddit',
  'pinterest': 'Pinterest', 'facebook': 'Facebook',

  // Geography
  'uk': 'UK', 'us': 'US', 'usa': 'USA', 'eu': 'EU',
  'india': 'India', 'china': 'China', 'germany': 'Germany',
  'france': 'France', 'japan': 'Japan', 'australia': 'Australia',
  'canada': 'Canada', 'singapore': 'Singapore',
};

// Pattern-based detection for proper nouns not in the dictionary
const PROPER_NOUN_PATTERNS = [
  // All-caps 2-5 letter sequences are likely acronyms — preserve their case
  { pattern: /\b([A-Z]{2,5})\b/g, replace: (m) => m },
  // Words ending in common institution suffixes
  { pattern: /\b([A-Z][a-z]+(ity|ege|ool|ute|eum|ary|eum))\b/g, replace: (m) => m },
];

function capitalizeProperNouns(text) {
  let result = text;
  // Apply dictionary replacements (longest matches first to avoid partial overlaps)
  const entries = Object.entries(PROPER_NOUN_DICT).sort((a, b) => b[0].length - a[0].length);
  for (const [lower, correct] of entries) {
    const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'gi');
    result = result.replace(regex, correct);
  }
  return result;
}

// ─── Abbreviation Expander ───────────────────────────────────────────────────

const ABBREVIATIONS = {
  'roi': 'return on investment', 'kpi': 'key performance indicators',
  'kpis': 'key performance indicators', 'mvp': 'minimum viable product',
  'poc': 'proof of concept', 'ux': 'user experience', 'ui': 'user interface',
  'api': 'API (application programming interface)',
  'diff': 'difference', 'diffs': 'differences',
  'info': 'information', 'doc': 'documentation', 'docs': 'documentation',
  'repo': 'repository', 'cfg': 'configuration', 'config': 'configuration',
  'db': 'database', 'auth': 'authentication',
  'pls': 'please', 'plz': 'please', 'thx': 'thanks',
  'btw': 'by the way', 'fyi': 'for your information',
  'asap': 'as soon as possible', 'imo': 'in my opinion',
  'tldr': 'summary', 'aka': 'also known as', 'vs': 'versus',
  'lol': '', 'eg': 'for example', 'ie': 'that is', 'etc': 'and so on',
  'b2b': 'business-to-business', 'b2c': 'business-to-consumer',
  'saas': 'software-as-a-service', 'ai': 'AI', 'ml': 'machine learning',
  'llm': 'large language model', 'cv': 'curriculum vitae',
  'gpa': 'grade point average', 'cs': 'computer science',
  'eng': 'engineering', 'biz': 'business', 'mgmt': 'management',
  'fin': 'finance', 'mkt': 'marketing', 'hr': 'human resources',
};

function expandAbbreviations(text) {
  return text.replace(/\b([a-z]{2,6})\b/gi, (match) => {
    const lower = match.toLowerCase();
    return ABBREVIATIONS[lower] !== undefined ? (ABBREVIATIONS[lower] || '') : match;
  }).replace(/\s{2,}/g, ' ').trim();
}

// ─── Domain Detection ────────────────────────────────────────────────────────
// 14 professional domains — each matches on keywords in the user's prompt

const DOMAIN_PATTERNS = {
  finance: /\b(invest|stock|equity|portfolio|fund|bond|dividend|valuation|financial model|budget|cash flow|revenue|profit|margin|balance sheet|p&l|venture|ipo|startup fund|hedge|forex|crypto|trading|asset)\b/i,
  health_medical: /\b(patient|diagnosis|symptom|treatment|medication|dose|clinical|hospital|surgery|therapy|mental health|psychiatry|psychology|nursing|pharma|drug|disease|condition|wellness|healthcare|gp|nhs|icu|radiology|pathology|anatomy)\b/i,
  legal: /\b(contract|clause|litigation|lawsuit|compliance|regulation|gdpr|hipaa|ip|intellectual property|patent|trademark|copyright|nda|tort|liability|jurisdiction|statute|counsel|attorney|solicitor|barrister|court|verdict|arbitration)\b/i,
  data_analytics: /\b(dataset|data analysis|visualization|dashboard|metric|query|sql|pandas|r language|tableau|power bi|looker|a\/b test|experiment|regression|correlation|clustering|model performance|accuracy|precision|recall|f1|confusion matrix)\b/i,
  technology: /\b(software|code|engineer|developer|architecture|backend|frontend|full.?stack|microservice|api|sdk|devops|ci\/cd|deployment|infrastructure|cloud|server|database|algorithm|system design)\b/i,
  marketing: /\b(campaign|brand|audience|persona|funnel|conversion|ctr|cpm|cpc|seo|sem|social media|content strategy|growth hack|email marketing|retention|churn|engagement|reach|impression|lead gen|affiliate|influencer)\b/i,
  education: /\b(student|course|curriculum|lesson plan|assessment|exam|grading|lecture|tutorial|learning outcome|pedagogy|e-learning|lms|classroom|university|school|teacher|professor|dissertation|thesis|academic)\b/i,
  research_academic: /\b(hypothesis|methodology|literature review|peer.?review|citation|abstract|journal|publication|experiment|survey|qualitative|quantitative|statistical significance|p.value|sample size|cohort|longitudinal)\b/i,
  business_strategy: /\b(strategy|go.?to.?market|competitive|positioning|value proposition|market entry|pivot|acquisition|partnership|expansion|diversification|vertical integration|porter|swot|pestle|bcg|okr|north star)\b/i,
  creative_design: /\b(design|visual|typography|colour|layout|wireframe|prototype|figma|sketch|illustrator|photoshop|brand identity|logo|ui design|ux design|user journey|design system|creative brief|copywriting|storytelling)\b/i,
  hr_career: /\b(resume|cv|cover letter|interview|job search|career|recruiter|talent|onboarding|performance review|promotion|salary negotiation|workplace|culture|diversity|inclusion|benefits|compensation|hiring|linkedin profile)\b/i,
  product_management: /\b(product roadmap|feature|user story|backlog|sprint|agile|scrum|kanban|stakeholder|prioritiz|prd|requirement|product spec|release|launch|feedback|nps|retention|dau|mau|product.?market fit)\b/i,
  operations_logistics: /\b(supply chain|logistics|inventory|warehouse|procurement|vendor|lead time|throughput|bottleneck|process improvement|lean|six sigma|kpi|sla|fulfilment|shipping|last.?mile|demand forecast|capacity)\b/i,
  culinary: /\b(recipe|ingredient|cook|bake|cuisine|dish|menu|flavour|technique|restaurant|chef|nutrition|dietary|vegan|gluten|allergen|meal plan|food science|ferment|season|portion)\b/i,
};

function detectDomains(text) {
  const matched = [];
  for (const [domain, pattern] of Object.entries(DOMAIN_PATTERNS)) {
    if (pattern.test(text)) matched.push(domain);
  }
  return matched;
}

// ─── Intent Dimensions ───────────────────────────────────────────────────────
// Layer 1: Intent-based dimensions — universal, apply to any domain

const INTENT_DIMENSIONS = {
  coding: [
    'language and runtime environment constraints',
    'edge case handling and input validation',
    'time complexity and performance requirements',
    'readability, naming conventions, and code style',
    'testing approach: unit vs integration vs e2e',
    'error handling and logging strategy',
  ],
  writing: [
    'intended audience and their prior knowledge',
    'desired tone: formal / casual / persuasive / authoritative',
    'primary goal: inform, persuade, convert, or entertain',
    'key message or single takeaway',
    'approximate length and format (email, article, report)',
    'call-to-action or next step for the reader',
  ],
  debugging: [
    'exact error message and reproduction steps',
    'environment details: OS, runtime version, dependencies',
    'most recent code change before the issue appeared',
    'what has already been attempted to fix it',
    'impact severity: blocking, degraded, cosmetic',
    'expected vs actual behaviour',
  ],
  explanation: [
    'target audience expertise level: beginner / intermediate / expert',
    'concrete real-world analogy or worked example',
    'common misconceptions to address proactively',
    'comparison to a related concept the audience already knows',
    'key takeaway in one sentence',
  ],
  analysis: [
    'specific angle or hypothesis to evaluate',
    'what data or evidence is available',
    'key criteria for evaluation',
    'trade-offs and tensions to highlight',
    'who the audience for the analysis is',
    'what decision this analysis supports',
  ],
  planning: [
    'current state vs desired end state',
    'constraints: time, budget, team size, dependencies',
    'success criteria and measurable milestones',
    'top risks and contingency plans',
    'sequencing: what must happen before what',
  ],
  summarization: [
    'target length: bullet points, executive brief, or one paragraph',
    'most critical ideas to preserve',
    'audience: expert, generalist, or decision-maker',
    'what action or decision this summary should enable',
  ],
  ideation: [
    'evaluation criteria: feasibility, novelty, impact',
    'constraints: what is off-limits or already tried',
    'desired number and diversity of ideas',
    'how to assess and shortlist the best options',
    'what output format is needed: list, ranked, grouped by theme',
  ],
  transformation: [
    'source format and target format',
    'key elements to preserve vs elements to change',
    'tone shift if applicable',
    'audience for the transformed output',
  ],
  comparison: [
    'key evaluation criteria (cost, performance, ease of use, scalability)',
    'specific use-case context for the comparison',
    'long-term considerations: support, community, future-proofing',
    'what decision this comparison will drive',
    'recommendation framing: absolute or conditional',
  ],
  general: [
    'background context the AI needs to give a useful answer',
    'constraints or requirements',
    'expected format and length of the response',
    'level of detail needed',
  ],
};

// ─── Domain Dimensions ───────────────────────────────────────────────────────
// Layer 2: Domain-specific dimensions — professional context overlay

const DOMAIN_DIMENSIONS = {
  finance: [
    'time horizon: short-term (0–1yr), mid-term (1–3yr), long-term (3–5yr+)',
    'risk profile: conservative, moderate, or aggressive',
    'relevant financial metrics: IRR, NPV, WACC, EBITDA as appropriate',
    'regulatory or compliance constraints in this jurisdiction',
    'market conditions and macro factors to account for',
  ],
  health_medical: [
    'patient population or demographic context',
    'clinical evidence base and guideline alignment',
    'contraindications, interactions, or safety considerations',
    'relevant regulatory body standards (NICE, FDA, WHO)',
    'ethical considerations and patient consent context',
  ],
  legal: [
    'jurisdiction and applicable legal system (common law, civil law, specific country)',
    'relevant statute or case law to reference',
    'standard of proof or contractual thresholds',
    'risk exposure and liability framing',
    'professional regulatory constraints (SRA, bar associations)',
  ],
  data_analytics: [
    'data source, format, and quality assumptions',
    'statistical methodology and validity considerations',
    'target audience for the output: technical or non-technical',
    'visualisation or reporting format required',
    'privacy and data governance constraints',
  ],
  technology: [
    'system architecture constraints and non-functional requirements',
    'scale and performance targets (throughput, latency, uptime)',
    'security and access control requirements',
    'integration points with existing systems',
    'team technical context: size, seniority, existing stack',
  ],
  marketing: [
    'target customer persona and segment',
    'stage of the funnel: awareness, consideration, conversion, retention',
    'channel mix and platform-specific constraints',
    'key performance metrics: CTR, conversion rate, CAC, ROAS',
    'brand voice and messaging guidelines',
  ],
  education: [
    'learner profile: age group, prior knowledge, learning style',
    'desired learning outcomes and measurable competencies',
    'assessment method: formative, summative, or project-based',
    'instructional format: lecture, workshop, self-paced, blended',
    'accessibility and differentiation requirements',
  ],
  research_academic: [
    'research paradigm: qualitative, quantitative, or mixed methods',
    'sampling strategy and sample size justification',
    'validity and reliability considerations',
    'ethical approval and participant consent requirements',
    'target publication venue or academic context',
  ],
  business_strategy: [
    'competitive landscape and key differentiators',
    'target customer segment and market size (TAM/SAM/SOM)',
    'revenue model and unit economics',
    'key risks and mitigation strategies',
    'strategic timeframe and key milestones',
  ],
  creative_design: [
    'brand guidelines: colours, typography, tone of voice',
    'target user and their context of use',
    'platform and medium constraints',
    'accessibility requirements (WCAG level, contrast ratios)',
    'design system or component library in use',
  ],
  hr_career: [
    'industry and role level (entry, mid, senior, executive)',
    'target company type: startup, SMB, enterprise, public sector',
    'key strengths and differentiating experience to highlight',
    'geographic location and remote/hybrid preferences',
    'timeline and urgency of the career move',
  ],
  product_management: [
    'user persona and the job-to-be-done',
    'business objective this product decision supports',
    'success metrics: engagement, retention, revenue impact',
    'technical feasibility and engineering effort estimate',
    'stakeholder alignment and sign-off requirements',
  ],
  operations_logistics: [
    'process scope: end-to-end supply chain or specific segment',
    'key efficiency metrics: throughput, lead time, defect rate',
    'technology systems involved (ERP, WMS, TMS)',
    'compliance and safety standards applicable',
    'trade-offs between cost, speed, and resilience',
  ],
  culinary: [
    'dietary requirements and allergen constraints',
    'available equipment, skill level, and prep time',
    'cuisine tradition or fusion context',
    'serving size and occasion (everyday, special, commercial)',
    'flavour profile goals: balance, contrast, or regional authenticity',
  ],
};

// ─── Dimension Composer ──────────────────────────────────────────────────────
// Budget: 4 from intent + 2 from primary domain + 2 from secondary domain
// Deduplicates across layers

function composeDimensions(intentId, domainIds) {
  const intentDims = (INTENT_DIMENSIONS[intentId] || INTENT_DIMENSIONS.general).slice(0, 4);
  const seen = new Set(intentDims.map(d => d.toLowerCase()));
  const composed = [...intentDims];

  const addFromDomain = (domainId, max) => {
    const dims = DOMAIN_DIMENSIONS[domainId] || [];
    let added = 0;
    for (const dim of dims) {
      if (added >= max) break;
      if (!seen.has(dim.toLowerCase())) {
        composed.push(dim);
        seen.add(dim.toLowerCase());
        added++;
      }
    }
  };

  if (domainIds[0]) addFromDomain(domainIds[0], 2);
  if (domainIds[1]) addFromDomain(domainIds[1], 2);

  return composed.slice(0, 8);
}

// ─── Intent Detection ────────────────────────────────────────────────────────

function detectIntent(text) {
  const t = text.toLowerCase();
  if (/\b(fix|debug|error|bug|crash|broken|exception|not working|fail(s|ed|ing)?|traceback)\b/.test(t)) return 'debugging';
  if (/\b(write|draft|compose|create|generate)\b.{0,25}\b(email|letter|message|report|blog|essay|post|article|copy|content|story|script|cover letter)\b/.test(t)) return 'writing';
  if (/\b(code|function|class|script|implement|build|program|algorithm|sql|query|regex|endpoint|refactor)\b/.test(t)) return 'coding';
  if (/\bvs\.?\b|\bversus\b|\bcompare\b|\bwhich is better\b|\bdifference between\b/.test(t)) return 'comparison';
  if (/\b(explain|what is|what are|how does|how do|why does|why is|describe|define|clarify)\b/.test(t)) return 'explanation';
  if (/\b(analyze|review|evaluate|assess|audit|critique|feedback on|assess)\b/.test(t)) return 'analysis';
  if (/\b(plan|strategy|roadmap|steps to|how to|guide to|approach to|framework|playbook)\b/.test(t)) return 'planning';
  if (/\b(summarize|summary|tldr|brief|overview|key points|main points|condense)\b/.test(t)) return 'summarization';
  if (/\b(brainstorm|ideas?|suggest|alternatives?|options? for|possibilities|come up with)\b/.test(t)) return 'ideation';
  if (/\b(translate|convert|rewrite|rephrase|paraphrase|transform|restructure)\b/.test(t)) return 'transformation';
  return 'general';
}

function detectLanguage(text) {
  const t = text.toLowerCase();
  if (/\bpython\b|\.py\b/.test(t)) return 'Python';
  if (/\btypescript\b|\.tsx?\b/.test(t)) return 'TypeScript';
  if (/\bjavascript\b|\bjs\b|\bnode\.?js\b/.test(t)) return 'JavaScript';
  if (/\bjava\b(?! script)/.test(t)) return 'Java';
  if (/\bc#\b|csharp/.test(t)) return 'C#';
  if (/\bgolang\b|\bgo\b(?= lang| program| code| function)/.test(t)) return 'Go';
  if (/\brust\b/.test(t)) return 'Rust';
  if (/\bsql\b/.test(t)) return 'SQL';
  if (/\bswift\b/.test(t)) return 'Swift';
  if (/\bkotlin\b/.test(t)) return 'Kotlin';
  if (/\bruby\b/.test(t)) return 'Ruby';
  if (/\bphp\b/.test(t)) return 'PHP';
  return null;
}

function extractCore(text) {
  return text.trim()
    .replace(/^(please\s+|can you\s+|could you please?\s+|i (want|need|would like|wanna) (you to\s+)?|help me (to\s+)?|i'm looking (for|to)\s+|tell me\s+)/i, '')
    .replace(/\s+/g, ' ').trim();
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function dot(s) { const t = s.trim(); return /[.!?]$/.test(t) ? t : t + '.'; }

// ─── Variant 1: Direct ───────────────────────────────────────────────────────

function generateDirect(core, intent, lang) {
  const suffixMap = {
    writing:        'Return only the final text, formatted and ready to use.',
    coding:         `Return working ${lang || 'code'} only. Add a brief inline usage comment.`,
    debugging:      'State the root cause first, then the minimal fix.',
    explanation:    'Be concise. Use one concrete example.',
    analysis:       'Return key findings and one clear recommendation.',
    planning:       'Return a numbered action plan, max 7 steps.',
    summarization:  'Return 3–5 bullet points. Lead with the most important insight.',
    ideation:       'List 6 distinct options, one line each.',
    transformation: 'Return only the transformed result.',
    comparison:     'State a clear recommendation first, then list 3 key reasons.',
    general:        '',
  };
  const suffix = suffixMap[intent] || '';
  return `${dot(cap(core))}${suffix ? '\n\n' + suffix : ''}`;
}

// ─── Variant 2: Well-Rounded ─────────────────────────────────────────────────

function generateBalanced(core, intent, lang, siteId, dimensions) {
  const roleMap = {
    coding:         `You are an expert ${lang || 'software'} engineer.`,
    writing:        'You are a skilled professional writer and editor.',
    debugging:      'You are a senior engineer who specializes in systematic debugging.',
    explanation:    'You are a knowledgeable teacher who makes complex ideas accessible.',
    analysis:       'You are a senior analyst with deep expertise in this domain.',
    planning:       'You are a strategic planner and execution expert.',
    summarization:  'You are a precise summarizer who captures the essence without losing nuance.',
    ideation:       'You are a creative strategist known for generating distinctive, practical ideas.',
    comparison:     'You are an objective expert who delivers clear, evidence-backed comparisons.',
    transformation: 'You are a skilled specialist in translating and adapting content across formats.',
    general:        'You are a knowledgeable, helpful assistant.',
  };

  const formatMap = {
    coding:         `Include: (1) working, commented ${lang || ''} code, (2) brief explanation of approach, (3) a usage example.`,
    writing:        'Provide the final polished text. Match the appropriate tone for the audience.',
    debugging:      'Structure: Root Cause → Fix → How to prevent this class of bug.',
    explanation:    'Structure: Simple overview → Key concept with example → Key takeaway.',
    analysis:       'Structure: Executive summary → Key findings (bullets) → Recommendations.',
    planning:       'Provide a numbered, sequenced action plan with clear outcomes per step.',
    summarization:  'Format: Core insight (1 sentence) → Key points (3–5 bullets) → Action item.',
    ideation:       'List 6 options. For each: name → one-line description → key advantage.',
    comparison:     'Format: Recommendation first → Comparison table → Contextual guidance.',
    transformation: 'Return the transformed output only, with a one-line note on key changes made.',
    general:        'Format your response with appropriate structure for easy reading.',
  };

  const role = roleMap[intent] || roleMap.general;
  const format = formatMap[intent] || formatMap.general;
  const task = dot(cap(core));

  let dimensionContext = '';
  if (dimensions.length > 0) {
    const items = dimensions.slice(0, 4).map(d => `- ${d}`).join('\n');
    dimensionContext = `\n\nEnsure your response addresses:\n${items}`;
  }

  if (siteId === 'claude') {
    return `${role}\n\n<task>\n${task}${dimensionContext}\n</task>\n\n<output_format>\n${format}\n</output_format>`;
  }
  if (siteId === 'deepseek') {
    return `${role}\n\nLet's think step by step.\n\n${task}${dimensionContext}\n\n${format}`;
  }
  if (siteId === 'gemini') {
    return `${role}\n\n## Task\n${task}${dimensionContext}\n\n## Output Format\n${format}`;
  }

  return `${role}\n\n${task}${dimensionContext}\n\n${format}`;
}

// ─── Variant 3: Technical ────────────────────────────────────────────────────

function generateTechnical(core, intent, lang, siteId, dimensions) {
  const task = dot(cap(core));
  const l = lang || '[LANGUAGE]';

  let dimensionSection = '';
  if (dimensions.length > 0) {
    dimensionSection = `\n\n## Dimensions to Address\n${dimensions.map(d => `- ${d}`).join('\n')}`;
  }

  const templates = {
    coding: () =>
      `## Task\n${task}\n\n## Requirements\n- Language: ${l}\n- Handle edge cases and invalid inputs gracefully\n- Write clean, readable code with inline comments\n- Follow ${l === '[LANGUAGE]' ? 'language' : l} best practices${dimensionSection}\n\n## Thinking Process\n1. Clarify the problem and constraints\n2. Design the algorithm or architecture\n3. Identify edge cases upfront\n4. Implement, then review\n\n## Output Format\n\`\`\`${l.toLowerCase().replace('[language]', '')}\n// Implementation here\n\`\`\`\n\n**Approach:** [explain design decisions]\n\n**Test Cases:**\n| Input | Expected Output | Notes |\n|-------|----------------|-------|\n| ...   | ...            | ...   |`,

    writing: () =>
      `## Writing Task\n${task}${dimensionSection}\n\n## Brief\n- **Audience:** [who reads this?]\n- **Tone:** [formal / persuasive / warm / authoritative]\n- **Length:** [approximate word count]\n- **Goal:** [what should the reader feel or do?]\n- **Key message:** [the one thing that must land]\n\n## Structure\n1. Opening hook\n2. Core body\n3. Closing with call-to-action\n\n## Output\nReturn the final, polished text only.`,

    debugging: () =>
      `## Problem\n${task}${dimensionSection}\n\n## Debugging Protocol\n1. **Reproduce** — confirm exact conditions\n2. **Isolate** — narrow to the smallest failing case\n3. **Hypothesize** — list 2–3 most likely root causes\n4. **Test** — eliminate hypotheses systematically\n5. **Fix** — implement the confirmed solution\n6. **Verify** — confirm fix works and doesn't regress\n\n## Output\n- **Root Cause:** [precise explanation]\n- **Fix:** [corrected code or configuration]\n- **Why it works:** [explain the fix]\n- **Prevention:** [how to avoid this class of bug]`,

    explanation: () =>
      `## Explanation Request\n${task}${dimensionSection}\n\n## Depth\n[beginner / intermediate / expert]\n\n## Teaching Framework\n1. **Hook** — why does this matter?\n2. **Core concept** — plain-language definition\n3. **Mental model** — analogy or visual metaphor\n4. **Worked example** — step-by-step\n5. **Common misconceptions** — what people get wrong\n6. **Key takeaway** — one sentence to remember\n\n## Output\n**Definition:** [1 sentence]\n**How it works:** [clear explanation]\n**Example:** [worked through]\n**Misconception:** [common wrong belief]\n**Remember:** [the takeaway]`,

    analysis: () =>
      `## Analysis Task\n${task}${dimensionSection}\n\n## Analytical Framework\n1. Define scope — what is being evaluated and why\n2. Gather evidence — what data or context is relevant\n3. Identify insights — what is non-obvious\n4. Evaluate trade-offs — tensions and risks\n5. Conclude — evidence-backed recommendation\n\n## Output Format\n### Executive Summary\n[2–3 sentence answer to the core question]\n\n### Key Findings\n| Finding | Evidence | Implication |\n|---------|----------|-------------|\n| ...     | ...      | ...         |\n\n### Recommendation\n[Prioritized, specific, actionable]`,

    planning: () =>
      `## Planning Request\n${task}${dimensionSection}\n\n## Context\n- Current state: [describe now]\n- Goal: [describe desired end state]\n- Constraints: [time, resources, dependencies]\n- Success criteria: [measurable outcomes]\n\n## Planning Framework\n1. Clarify objective and success metrics\n2. Map dependencies and blockers\n3. Break into phases with milestones\n4. Prioritize and sequence tasks\n5. Identify risks and mitigations\n\n## Output Format\n### Phase 1: [Name]\n- [ ] Step 1: [action] — [outcome]\n- [ ] Step 2: [action] — [outcome]\n\n### Risks & Mitigations\n| Risk | Likelihood | Mitigation |\n|------|-----------|------------|\n| ...  | ...       | ...        |`,

    ideation: () =>
      `## Ideation Task\n${task}${dimensionSection}\n\n## Constraints\n- [requirements]\n- [what to avoid]\n- [what's been tried]\n\n## Process\n1. Generate 8–10 raw ideas without filtering\n2. Evaluate for feasibility, impact, novelty\n3. Select the 6 most distinct and promising\n\n## Output Format\n| # | Idea | Core Advantage | Challenge |\n|---|------|---------------|----------|\n| 1 | ...  | ...           | ...      |`,

    comparison: () =>
      `## Comparison Request\n${task}${dimensionSection}\n\n## Evaluation Criteria\n[list the dimensions to compare across — cost, performance, ease, scalability, etc.]\n\n## Process\n1. Define criteria weights based on use-case\n2. Evaluate each option against each criterion\n3. Identify where each option excels or falls short\n4. Consider long-term and context-specific factors\n\n## Output Format\n### Recommendation\n[Clear recommendation with conditions]\n\n### Comparison Table\n| Criterion | Option A | Option B | Winner |\n|-----------|---------|---------|--------|\n| ...       | ...     | ...     | ...    |\n\n### When to choose each\n- **Option A:** [ideal context]\n- **Option B:** [ideal context]`,

    summarization: () =>
      `## Summarization Task\n${task}${dimensionSection}\n\n## Parameters\n- Audience: [expert / generalist / decision-maker]\n- Target length: [3 bullets / 1 paragraph / executive brief]\n- Preserve: most critical ideas\n\n## Output Format\n**Core thesis:** [1 sentence]\n\n**Key points:**\n1. [Most important]\n2. [Second most important]\n3. [Third]\n\n**So what:** [what the reader should do or know]`,

    general: () =>
      `## Request\n${task}${dimensionSection}\n\n## Context\n[add relevant background]\n\n## Constraints\n- [requirements or limitations]\n\n## Thinking Process\n1. Confirm understanding of the request\n2. Consider multiple approaches\n3. Choose best approach with reasoning\n4. Deliver well-structured response\n\n## Output Format\nUse headers and bullets where they improve readability.`,
  };

  return (templates[intent] || templates.general)();
}

// ─── Clarifying Questions (Domain-Aware) ─────────────────────────────────────

function generateClarifyingQuestions(text, intent, domains) {
  const q = [];
  const t = text.toLowerCase();

  // Intent-based
  if (intent === 'writing' && !/tone|formal|casual|professional/.test(t))
    q.push('What tone should this have? (formal, casual, persuasive, authoritative?)');
  if (intent === 'writing' && !/audience|reader|for (a|an|the)/.test(t))
    q.push('Who is the intended reader?');
  if (intent === 'coding' && !detectLanguage(text))
    q.push('Which programming language should be used?');
  if (intent === 'analysis' && !/focus|criteria|angle/.test(t))
    q.push('What specific angle should the analysis take?');
  if (intent === 'planning' && !/deadline|timeline|constraint/.test(t))
    q.push('What constraints exist? (deadline, team size, budget?)');
  if (intent === 'comparison' && !/criteria|compare on|versus|based on/.test(t))
    q.push('What criteria matter most for this comparison? (cost, speed, ease of use?)');

  // Domain-specific
  if (domains.includes('finance') && !/timeline|horizon|risk/.test(t))
    q.push('What time horizon and risk tolerance should this consider?');
  if (domains.includes('health_medical') && !/patient|population|demographic/.test(t))
    q.push('What patient population or clinical context is this for?');
  if (domains.includes('legal') && !/jurisdiction|country|state/.test(t))
    q.push('Which jurisdiction or legal system applies here?');
  if (domains.includes('marketing') && !/audience|persona|segment/.test(t))
    q.push('Who is the target customer or audience segment?');
  if (domains.includes('education') && !/grade|age|level|learner/.test(t))
    q.push('What is the learner\'s level and age group?');

  return q.slice(0, 2);
}

// ─── Main Export ──────────────────────────────────────────────────────────────

window.PO.generateVariants = function (rawPrompt, siteId) {
  if (!rawPrompt || rawPrompt.trim().length < 4) return null;

  // Step 1: Expand abbreviations + fix proper noun casing
  const expanded = capitalizeProperNouns(expandAbbreviations(rawPrompt));

  // Step 2: Detect intent, domains, and language
  const intent  = detectIntent(expanded);
  const domains = detectDomains(expanded);
  const lang    = detectLanguage(expanded);

  // Step 3: Extract core request
  const core = extractCore(expanded);

  // Step 4: Compose dimensions (intent layer + up to 2 domain layers)
  const dimensions = composeDimensions(intent, domains);

  // Step 5: Build legacy expansions shape (for UI compatibility)
  const expansions = dimensions.length > 0
    ? [{ label: domains.length > 0 ? domains.map(d => d.replace(/_/g, ' ')).join(' + ') + ' context' : intent + ' context', items: dimensions }]
    : [];

  // Step 6: Generate 3 variants
  const direct    = generateDirect(core, intent, lang);
  const balanced  = generateBalanced(core, intent, lang, siteId, dimensions);
  const technical = generateTechnical(core, intent, lang, siteId, dimensions);

  // Step 7: Domain-aware clarifying questions
  const clarifyingQuestions = generateClarifyingQuestions(rawPrompt, intent, domains);

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
