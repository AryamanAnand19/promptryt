/**
 * PromptRyt Service Worker (MV3)
 * Handles: API key storage, Anthropic API calls, token counting
 * All API calls go through here — never in content scripts (CORS + security)
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_COUNT_URL = 'https://api.anthropic.com/v1/messages/count_tokens';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

// ─── Message Router ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SAVE_API_KEY':
      handleSaveApiKey(message.apiKey, sendResponse);
      return true;

    case 'GET_API_KEY_STATUS':
      handleGetApiKeyStatus(sendResponse);
      return true;

    case 'OPTIMIZE_PROMPT':
      handleOptimizePrompt(message, sendResponse);
      return true;

    case 'COUNT_TOKENS':
      handleCountTokens(message.text, sendResponse);
      return true;

    case 'CLEAR_API_KEY':
      chrome.storage.local.remove('apiKey', () => sendResponse({ success: true }));
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// ─── Handlers ──────────────────────────────────────────────────────────────

async function handleSaveApiKey(apiKey, sendResponse) {
  try {
    // Basic format validation
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      sendResponse({ success: false, error: 'Invalid API key format. Expected sk-ant-...' });
      return;
    }
    await chrome.storage.local.set({ apiKey });
    sendResponse({ success: true });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

async function handleGetApiKeyStatus(sendResponse) {
  try {
    const { apiKey } = await chrome.storage.local.get('apiKey');
    sendResponse({ hasKey: !!apiKey });
  } catch (err) {
    sendResponse({ hasKey: false });
  }
}

async function handleOptimizePrompt({ siteId, rawPrompt, optimizationMode }, sendResponse) {
  try {
    const { apiKey } = await chrome.storage.local.get('apiKey');

    if (!apiKey || optimizationMode === 'rule-based') {
      // Signal content script to use local rule-based optimizer
      sendResponse({ useLocalOptimizer: true });
      return;
    }

    const systemPrompt = buildSystemPrompt(siteId);
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Here is the user's rough prompt:\n\n<raw_prompt>\n${rawPrompt}\n</raw_prompt>\n\nOptimize it for ${siteId}.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      // Rate limit or auth error — fall back to rule-based
      sendResponse({
        useLocalOptimizer: true,
        apiError: errBody.error?.message || `HTTP ${response.status}`
      });
      return;
    }

    const data = await response.json();
    const rawContent = data.content?.[0]?.text || '';

    // Parse JSON response from Claude
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      sendResponse({ useLocalOptimizer: true, apiError: 'Could not parse API response' });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    sendResponse({
      useLocalOptimizer: false,
      optimizedPrompt: parsed.optimizedPrompt || rawPrompt,
      changes: parsed.changes || [],
      clarifyingQuestions: parsed.clarifyingQuestions || [],
      tokenDelta: parsed.tokenDelta || 0
    });

  } catch (err) {
    sendResponse({ useLocalOptimizer: true, apiError: err.message });
  }
}

async function handleCountTokens(text, sendResponse) {
  try {
    const { apiKey } = await chrome.storage.local.get('apiKey');
    if (!apiKey) {
      sendResponse({ count: null, estimated: true });
      return;
    }

    const response = await fetch(ANTHROPIC_COUNT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        messages: [{ role: 'user', content: text }]
      })
    });

    if (!response.ok) {
      sendResponse({ count: null, estimated: true });
      return;
    }

    const data = await response.json();
    sendResponse({ count: data.input_tokens, estimated: false });
  } catch (err) {
    sendResponse({ count: null, estimated: true });
  }
}

// ─── Meta-Prompt Builder ───────────────────────────────────────────────────

function buildSystemPrompt(siteId) {
  const llmProfiles = {
    chatgpt: `Target LLM: ChatGPT (GPT-4o / GPT-4)
Best practices:
- Use role prompting: "You are a [role] with expertise in [domain]..."
- Use ### or --- delimiters to separate sections
- Number steps when ordering matters
- Add explicit "Do not..." negative constraints when precision matters
- For complex tasks: provide context → task → format → constraints`,

    claude: `Target LLM: Claude (Anthropic)
Best practices:
- Use XML structural tags: <context>, <task>, <constraints>, <output_format>, <examples>
- Place role/context BEFORE the task
- Be explicit about output format and length
- For analysis: use <thinking> tag guidance
- Claude handles long context well — add full context before query`,

    gemini: `Target LLM: Gemini (Google)
Best practices:
- Use clear markdown headers (##, ###) to structure sections
- Specify output format explicitly (table, bullet list, prose)
- For multimodal tasks: describe what visual output is expected
- Add "Based on current best practices..." for factual grounding
- Gemini benefits from step-by-step reasoning requests`,

    copilot: `Target LLM: Microsoft Copilot
Best practices:
- Emphasize grounding: "Use only verified, current information"
- Request citations: "Provide sources for factual claims"
- For Microsoft 365 tasks: be explicit about which app/feature
- Use structured business writing format
- Specify scope: "Focus on [specific aspect], not [what to exclude]"`,

    deepseek: `Target LLM: DeepSeek (DeepSeek-R1 / V3)
Best practices:
- DeepSeek R1 excels at chain-of-thought — prompt it explicitly: "Think step by step"
- For code: specify language, expected input/output, edge cases, and test cases
- Use: "First analyze the problem, then design the solution, then implement"
- Budget-aware: specify desired output length to reduce padding
- For reasoning tasks: "Show your reasoning before giving the final answer"`,

    manus: `Target LLM: Manus (Agent)
Best practices:
- Frame as agent tasks: decompose into clear sub-tasks
- Specify available tools and when to use them
- Add explicit success criteria: "Task is complete when..."
- Use numbered steps for sequential actions
- Specify output artifacts: "Create a file named X containing Y"`
  };

  const profile = llmProfiles[siteId] || llmProfiles.chatgpt;

  return `You are a world-class prompt engineering expert. Your job is to optimize a user's rough, unstructured prompt for maximum clarity and token efficiency on a specific AI platform.

${profile}

Rules for optimization:
1. NEVER change the user's core intent — only improve structure and clarity
2. Remove redundancy and padding without losing meaning
3. Add [PLACEHOLDER] markers where the user needs to fill in missing details
4. Apply the LLM-specific best practices above
5. Aim for 20-40% token reduction where possible without losing quality
6. If the prompt is too vague, generate clarifying questions instead of guessing

Respond ONLY with valid JSON in this exact format:
{
  "optimizedPrompt": "the full optimized prompt text",
  "changes": ["change 1", "change 2"],
  "clarifyingQuestions": ["question 1 if needed", "question 2 if needed"],
  "tokenDelta": -25
}

If no clarifying questions are needed, return an empty array. tokenDelta is negative when tokens are reduced.`;
}
