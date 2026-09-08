import {
  extractFinishReason,
  extractLlmText,
  guideLlmModelCandidates,
  guideLlmOnProviderError,
  isUnusableGuideReply,
  normalizeGuideLlmBaseUrl,
  normalizeGuideLlmModel,
  resolveGuideLlmBaseUrl,
  resolveGuideLlmModel,
  GUIDE_LLM_CANDIDATE_CAP,
  GUIDE_MANDATE,
} from '../src/guide/llm.ts'

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error(msg)
    process.exit(1)
  }
}

assert(
  normalizeGuideLlmBaseUrl('https://generativelanguage.googleapis.com/v1beta/openai/') ===
    'https://generativelanguage.googleapis.com/v1beta/openai',
  'Gemini base URL must strip trailing slash',
)
assert(
  normalizeGuideLlmBaseUrl(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  ) === 'https://generativelanguage.googleapis.com/v1beta/openai',
  'Gemini base URL must strip /chat/completions',
)
assert(
  normalizeGuideLlmBaseUrl('https://generativelanguage.googleapis.com/v1beta/openai/v1') ===
    'https://generativelanguage.googleapis.com/v1beta/openai',
  'Gemini base URL must strip mistaken /openai/v1',
)
assert(
  normalizeGuideLlmBaseUrl('https://generativelanguage.googleapis.com/v1beta') ===
    'https://generativelanguage.googleapis.com/v1beta/openai',
  'Gemini /v1beta must gain /openai',
)
assert(
  normalizeGuideLlmBaseUrl('https://api.openai.com/v1/') === 'https://api.openai.com/v1',
  'OpenAI base URL must strip trailing slash',
)

assert(
  resolveGuideLlmBaseUrl(undefined, 'AIzaSyFakeKeyForShapeOnly').includes('generativelanguage.googleapis.com'),
  'AIza-shaped key must default to Gemini OpenAI-compat base',
)
assert(
  resolveGuideLlmBaseUrl(undefined, 'AQ.FakeStudioKeyForShapeOnly').includes('generativelanguage.googleapis.com'),
  'AQ.-shaped AI Studio key must default to Gemini OpenAI-compat base',
)
assert(
  resolveGuideLlmModel(undefined, 'AQ.FakeStudioKeyForShapeOnly') === 'gemini-2.0-flash',
  'AQ.-shaped key must default to gemini-2.0-flash (non-thinking)',
)
assert(
  resolveGuideLlmModel('gemini-2.0-flash', 'AQ.FakeStudioKeyForShapeOnly') === 'gemini-2.0-flash',
  'GUIDE_LLM_MODEL is the single primary',
)
assert(
  resolveGuideLlmBaseUrl(undefined, 'sk-openai-shape').includes('api.openai.com'),
  'non-Gemini key keeps OpenAI default',
)

assert(normalizeGuideLlmModel('models/gemini-2.0-flash') === 'gemini-2.0-flash', 'strip models/')
assert(
  guideLlmModelCandidates('gemini-2.0-flash')[0] === 'gemini-2.0-flash',
  'candidates must start with the configured primary',
)
assert(
  guideLlmModelCandidates('gemini-2.0-flash').includes('gemini-2.0-flash-001') ||
    guideLlmModelCandidates('gemini-2.0-flash').includes('gemini-flash-latest'),
  'gemini-2.0-flash 404 fallbacks stay on the 2.0 family',
)
assert(
  !guideLlmModelCandidates('gemini-2.0-flash').includes('gemini-2.5-flash') &&
    !guideLlmModelCandidates('gemini-2.0-flash').includes('gemini-3.6-flash'),
  'must never cascade onto thinking 2.5/3.6 models',
)
assert(
  guideLlmModelCandidates('gemini-2.0-flash').length <= GUIDE_LLM_CANDIDATE_CAP,
  'must not cascade 5 models',
)
assert(
  guideLlmModelCandidates('gemini-3.6-flash').length === 1,
  'thinking primary has no extra thinking fallbacks',
)
assert(
  guideLlmOnProviderError(429, 'rate_limit', true, false) === 'retry',
  '429 on primary retries once',
)
assert(
  guideLlmOnProviderError(429, 'rate_limit', true, true) === 'fail',
  '429 after one retry fails fast — no 5-model walk',
)
assert(
  guideLlmOnProviderError(503, 'overload', true, true) === 'fail',
  '503 after one retry fails fast',
)
assert(
  guideLlmOnProviderError(429, 'rate_limit', false, false) === 'fail',
  '429 on a fallback model must not continue the cascade',
)
assert(
  guideLlmOnProviderError(404, 'not found', true, false) === 'fallback',
  '404 may walk the short model-missing list',
)
assert(
  /4–8 short sentences/.test(GUIDE_MANDATE) && /Do not stop mid-sentence/.test(GUIDE_MANDATE),
  'mandate asks for multi-sentence replies that finish',
)

assert(
  extractLlmText({ choices: [{ message: { content: '  hello  ' } }] }) === 'hello',
  'OpenAI string content',
)
assert(
  extractLlmText({
    choices: [{ message: { content: [{ type: 'text', text: 'part-a' }, { text: 'part-b' }] } }],
  }) === 'part-apart-b',
  'Gemini parts-array content',
)
assert(
  extractLlmText({ candidates: [{ content: { parts: [{ text: 'native' }] } }] }) === 'native',
  'Gemini native candidates',
)
assert(
  extractFinishReason({ choices: [{ finish_reason: 'length' }] }) === 'length',
  'OpenAI finish_reason',
)
assert(isUnusableGuideReply(null), 'empty completion is unusable')
assert(isUnusableGuideReply('GTM OS es el sistema de outbound'), 'sub-80 mid-cut is unusable')
assert(isUnusableGuideReply('x'.repeat(90), 'length'), 'finish_reason=length is unusable')
assert(
  isUnusableGuideReply(
    'GTM OS is the B2B outbound system we install in your team — cold, ICP-filtered, milestone-gated.',
  ) === false,
  'complete multi-clause reply is usable',
)

assert(/RutinHQ Guide/.test(GUIDE_MANDATE), 'mandate names public UI')
assert(/GTM OS/.test(GUIDE_MANDATE) && /STORE OS/.test(GUIDE_MANDATE) && /NEXUS OS/.test(GUIDE_MANDATE), 'mandate SKUs')
assert(
  /calendly.com\/rutinhq\/30min/.test(GUIDE_MANDATE) && /strategy@rutinhq.com/.test(GUIDE_MANDATE),
  'mandate CTAs',
)
assert(!/capo|fuzzyflags|\bfzf\b/i.test(GUIDE_MANDATE), 'mandate must stay public-safe')

console.log('guide LLM client + mandate checks passed')
