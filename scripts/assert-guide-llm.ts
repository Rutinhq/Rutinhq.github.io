import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  classifyIntentWithPolicy,
  ensureCalendlyCta,
  isSchedulingTurn,
  recommendSkuWithPolicy,
  resolveFallbackKey,
  schedulingGuideReply,
  type ClassifyPolicy,
} from '../src/guide/classify-core.ts'
import { localGuideReply } from '../src/guide/fallback.ts'
import {
  callGuideLlmDetailed,
  composeGuideSystemPrompt,
  extractFinishReason,
  extractLlmText,
  coerceGuideLlmReply,
  capGuideReplyWords,
  applyGuideEsTypoFixes,
  GUIDE_ES_CATALOG_FACTS,
  selectGuideKnowledge,
  countGuideWords,
  extractFirstJsonObject,
  extractWorkersAiText,
  formatGuideAiErrorReason,
  stripGuideMarkdownFences,
  trimIncompleteGuideReply,
  polishGuideLlmReply,
  appendGuideCalendlyCta,
  guideCalendlyCta,
  guideDegradedReasonFromLlm,
  guideLlmAttemptMs,
  guideLlmFailureLog,
  guideLlmHasRetryBudget,
  guideLlmModelCandidates,
  guideLlmOnProviderError,
  isUnusableGuideReply,
  normalizeGuideLlmBaseUrl,
  normalizeGuideLlmModel,
  redactGuideLlmSnippet,
  resolveGuideLlmBaseUrl,
  resolveGuideLlmModel,
  resolveGuideLlmProvider,
  DEFAULT_WORKERS_AI_MODEL,
  GUIDE_LLM_BUDGET_MS,
  GUIDE_LLM_CANDIDATE_CAP,
  GUIDE_LLM_MIN_ATTEMPT_MS,
  GUIDE_LLM_PRIMARY_ATTEMPT_MS,
  GUIDE_LLM_RATE_LIMIT_BACKOFF_MS,
  GUIDE_LLM_RETRY_ATTEMPT_MS,
  GUIDE_MANDATE,
  GUIDE_LLM_REPLY_MAX_WORDS,
  GUIDE_WORKERS_AI_MAX_TOKENS,
} from '../src/guide/llm.ts'
import { isGuidePreviewHost } from '../src/guide/preview-host.ts'

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
  resolveGuideLlmModel(undefined, 'AQ.FakeStudioKeyForShapeOnly') === 'gemini-3.1-flash-lite',
  'AQ.-shaped key must default to gemini-3.1-flash-lite (non-thinking)',
)
assert(
  resolveGuideLlmModel('gemini-3.1-flash-lite', 'AQ.FakeStudioKeyForShapeOnly') ===
    'gemini-3.1-flash-lite',
  'GUIDE_LLM_MODEL is the single primary',
)
assert(resolveGuideLlmProvider('workers-ai') === 'workers-ai', 'explicit workers-ai provider')
assert(
  resolveGuideLlmProvider('openai-compat') === 'openai-compat',
  'openai-compat keeps Gemini/OpenAI path',
)
assert(resolveGuideLlmProvider('gemini') === 'openai-compat', 'gemini alias is openai-compat')
assert(resolveGuideLlmProvider() === 'workers-ai', 'unset provider defaults to workers-ai')
assert(
  resolveGuideLlmModel(undefined, undefined, 'workers-ai') === DEFAULT_WORKERS_AI_MODEL,
  'workers-ai default is the fast 8B fp8 model',
)
assert(
  normalizeGuideLlmModel('@cf/meta/llama-3.1-8b-instruct-fast') === DEFAULT_WORKERS_AI_MODEL,
  'retired -fast id aliases to fp8-fast',
)
assert(
  guideLlmModelCandidates(DEFAULT_WORKERS_AI_MODEL, 'workers-ai')[0] === DEFAULT_WORKERS_AI_MODEL,
  'workers-ai candidates start with the pinned 8B',
)
assert(
  guideLlmModelCandidates(DEFAULT_WORKERS_AI_MODEL, 'workers-ai').includes(
    '@cf/meta/llama-3.1-8b-instruct',
  ),
  'workers-ai 404 fallback is the non-fast 8B, not 70B',
)
assert(
  !guideLlmModelCandidates(DEFAULT_WORKERS_AI_MODEL, 'workers-ai').some((id) =>
    id.includes('70b'),
  ),
  'workers-ai default must not cascade onto 70B',
)
assert(
  GUIDE_WORKERS_AI_MAX_TOKENS === 450,
  'workers-ai max_tokens is 450 so the verbose 8B can finish a short reply',
)
assert(
  resolveGuideLlmBaseUrl(undefined, 'sk-openai-shape').includes('api.openai.com'),
  'non-Gemini key keeps OpenAI default',
)

assert(normalizeGuideLlmModel('models/gemini-3.1-flash-lite') === 'gemini-3.1-flash-lite', 'strip models/')
assert(
  guideLlmModelCandidates('gemini-3.1-flash-lite')[0] === 'gemini-3.1-flash-lite',
  'candidates must start with the configured primary',
)
assert(
  normalizeGuideLlmModel('gemini-3-flash') === 'gemini-3-flash-preview',
  'bare gemini-3-flash aliases to the official gemini-3-flash-preview id',
)
assert(
  guideLlmModelCandidates('gemini-3.1-flash-lite').includes('gemini-3-flash-preview'),
  'gemini-3.1-flash-lite 404 fallback is official gemini-3-flash-preview',
)
assert(
  !guideLlmModelCandidates('gemini-3.1-flash-lite').includes('gemini-3-flash'),
  'must not spend the 9s budget 404ing a non-existent gemini-3-flash id',
)
assert(
  !guideLlmModelCandidates('gemini-3.1-flash-lite').some((id) => id.includes('gemini-2.0')),
  'fallbacks must not include zero-quota 2.0 models',
)
assert(
  !guideLlmModelCandidates('gemini-3.1-flash-lite').includes('gemini-2.5-flash-lite') &&
    !guideLlmModelCandidates('gemini-3.1-flash-lite').includes('gemini-2.5-flash') &&
    !guideLlmModelCandidates('gemini-3.1-flash-lite').includes('gemini-3.6-flash'),
  'must never cascade onto thinking 2.5/3.6 models',
)
assert(
  !guideLlmModelCandidates('gemini-2.0-flash').some(
    (id) => id.startsWith('gemini-2.0') && id !== 'gemini-2.0-flash',
  ),
  'a leftover 2.0 primary must not hop to other 2.0 aliases',
)
assert(
  guideLlmModelCandidates('gemini-3.1-flash-lite').length <= GUIDE_LLM_CANDIDATE_CAP,
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
  /≤80 words/.test(GUIDE_MANDATE) &&
    /2–4 short sentences/.test(GUIDE_MANDATE) &&
    /Never invent acronym expansions/.test(GUIDE_MANDATE) &&
    /Always end with the Calendly CTA/.test(GUIDE_MANDATE) &&
    /sistemas que usted posee/.test(GUIDE_MANDATE) &&
    /nunca tú/.test(GUIDE_MANDATE) &&
    /ICP = perfil de cliente ideal/.test(GUIDE_MANDATE) &&
    /tiendas de comercio electrónico/.test(GUIDE_MANDATE) &&
    /Estrategia → Social → Ads/.test(GUIDE_MANDATE) &&
    /prospección en frío/.test(GUIDE_MANDATE) &&
    /iguala mensual/.test(GUIDE_MANDATE) &&
    /Zero English/.test(GUIDE_MANDATE) &&
    /STORE OS \(auditoría y configuración del panel de Shopify para marcas que venden directo al consumidor\)/.test(
      GUIDE_MANDATE,
    ) &&
    /nada se publica ni se gasta sin aprobación explícita/.test(GUIDE_MANDATE) &&
    /un sistema de marketing agéntico/.test(GUIDE_MANDATE),
  'mandate asks for short catalog-only usted replies that finish',
)
assert(GUIDE_LLM_REPLY_MAX_WORDS === 80, 'hard word cap is 80')
assert(GUIDE_LLM_BUDGET_MS === 20_000, 'LLM budget is 20s so Workers AI cold start can finish')
assert(
  GUIDE_LLM_BUDGET_MS < 28_000,
  'client fetch (28s in config.ts) must sit above the LLM budget so Pages logs still see /api/guide',
)
assert(
  GUIDE_LLM_PRIMARY_ATTEMPT_MS < GUIDE_LLM_BUDGET_MS,
  'primary attempt must leave room inside the overall budget',
)
assert(
  GUIDE_LLM_PRIMARY_ATTEMPT_MS + GUIDE_LLM_RATE_LIMIT_BACKOFF_MS + GUIDE_LLM_RETRY_ATTEMPT_MS <=
    GUIDE_LLM_BUDGET_MS + 500,
  'one primary + one 429 retry must fit the ~9s budget (no cascade)',
)
assert(
  guideLlmAttemptMs({ isRetry: false, remainingMs: GUIDE_LLM_BUDGET_MS }) ===
    GUIDE_LLM_PRIMARY_ATTEMPT_MS,
  'first attempt is capped below the overall budget',
)
assert(
  guideLlmAttemptMs({ isRetry: true, remainingMs: 2_500 }) === GUIDE_LLM_RETRY_ATTEMPT_MS,
  '429 retry attempt is capped',
)
assert(guideLlmAttemptMs({ isRetry: true, remainingMs: 300 }) === 300, 'retry uses leftover budget')
assert(guideLlmAttemptMs({ isRetry: false, remainingMs: 0 }) === 0, 'zero remaining is zero attempt')
assert(guideLlmHasRetryBudget(GUIDE_LLM_BUDGET_MS), 'fresh budget can retry primary once')
assert(
  !guideLlmHasRetryBudget(GUIDE_LLM_MIN_ATTEMPT_MS + GUIDE_LLM_RATE_LIMIT_BACKOFF_MS - 1),
  'do not start a 429 retry when leftover time is too small',
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
assert(
  trimIncompleteGuideReply(
    'GTM OS es el sistema de outbound B2B que instalamos. No es un SDR rentado ni agencia de',
    'length',
  ) === 'GTM OS es el sistema de outbound B2B que instalamos.',
  'finish_reason=length trims back to the last complete sentence',
)
assert(
  trimIncompleteGuideReply(
    'STORE OS es auditoría de Shopify Admin. Variants, peso y envío para que la tienda',
  ) === 'STORE OS es auditoría de Shopify Admin.',
  'missing terminal punctuation trims back to the last complete sentence',
)
assert(
  trimIncompleteGuideReply(
    'NEXUS OS es Strategy → Social → Ads. Agenda https://calendly.com/rutinhq/30min.',
    'stop',
  ) === 'NEXUS OS es Strategy → Social → Ads. Agenda https://calendly.com/rutinhq/30min.',
  'complete reply is left intact',
)
assert(
  trimIncompleteGuideReply('Agenda https://calendly.com/rutinhq/30min', 'stop') ===
    'Agenda https://calendly.com/rutinhq/30min',
  'URL-ending reply counts as complete',
)
assert(
  trimIncompleteGuideReply('GTM OS es outbound B2B que instalamos', 'length') ===
    'GTM OS es outbound B2B que instalamos',
  'length cut with no prior sentence keeps the fragment',
)
{
  const long =
    'RutinHQ instala GTM OS para outbound B2B. STORE OS es auditoría de Shopify Admin. NEXUS OS es marketing agéntico. ' +
    Array.from({ length: 70 }, () => 'detalle').join(' ') +
    '.'
  assert(countGuideWords(long) > 80, 'fixture exceeds the word cap')
  const capped = capGuideReplyWords(long)
  assert(capped !== null && countGuideWords(capped) <= 80, 'word cap stays at or under 80')
  assert(/RutinHQ instala GTM OS/.test(capped || ''), 'word cap keeps the first complete sentence')
  assert(
    !/detalle detalle/.test(capped || ''),
    'word cap drops the overflowing filler sentence',
  )
  const polished = polishGuideLlmReply(
    'RutinHQ instala sistemas que usted posee, sin retainers. GTM OS es outbound B2B y además ' +
      Array.from({ length: 90 }, () => 'palabra').join(' '),
    'length',
  )
  assert(
    polished === 'RutinHQ instala sistemas que usted posee, sin retainers.',
    'polish trims the cut sentence then applies the word cap',
  )
}
{
  const missing = 'GTM OS es prospección en frío B2B. STORE OS es Shopify Admin para tiendas DTC.'
  const esCta = appendGuideCalendlyCta(missing, 'es')
  assert(/calendly\.com\/rutinhq\/30min/.test(esCta), 'ES reply without Calendly gets the CTA')
  assert(/Si encaja, agende 30 min:/.test(esCta), 'ES CTA is usted agende')
  assert(!/agenda 30 min/.test(esCta), 'ES CTA must not use tú agenda')
  const already =
    'NEXUS OS es un sistema de marketing agéntico: Estrategia → Social → Ads. Si encaja, agende 30 min: https://calendly.com/rutinhq/30min.'
  assert(
    appendGuideCalendlyCta(already, 'es') === already,
    'reply that already has Calendly is left intact',
  )
  const filler = Array.from({ length: 12 }, () => 'NEXUS OS rota pilares cada semana.').join(' ')
  const long = `GTM OS es prospección en frío B2B. STORE OS es Shopify Admin para tiendas DTC. ${filler}`
  assert(countGuideWords(long) > 80, 'calendly-cap fixture exceeds 80 words')
  const cappedCta = appendGuideCalendlyCta(long, 'es')
  assert(countGuideWords(cappedCta) <= 80, 'appended CTA stays within the 80-word cap')
  assert(/calendly\.com\/rutinhq\/30min/.test(cappedCta), 'CTA survives the word cap')
  assert(/GTM OS es prospección en frío B2B/.test(cappedCta), 'cap trims later sentences, not the lead')
  const longWithCta = `${long} Si encaja, agende 30 min: https://calendly.com/rutinhq/30min.`
  const cappedExisting = appendGuideCalendlyCta(longWithCta, 'es')
  assert(countGuideWords(cappedExisting) <= 80, 'existing CTA still fits the word cap')
  assert(/calendly\.com\/rutinhq\/30min/.test(cappedExisting), 'existing CTA is not trimmed away')
  const enCta = appendGuideCalendlyCta('GTM OS is B2B cold outbound the team keeps.', 'en')
  assert(
    enCta === `GTM OS is B2B cold outbound the team keeps. ${guideCalendlyCta('en')}`,
    'EN reply without Calendly gets the EN CTA',
  )
  assert(
    applyGuideEsTypoFixes('Puede agender una llamada de 30 minutos aquí.') ===
      'Puede agendar una llamada de 30 minutos aquí.',
    'agender is rewritten to agendar',
  )
  assert(
    applyGuideEsTypoFixes('Sistemas que usted propietar. Un llamada. marketing agente.') ===
      'Sistemas que usted poseer. Una llamada. marketing agéntico.',
    'propietar / un llamada / marketing agente are rewritten',
  )
  assert(
    polishGuideLlmReply(
      'Puede agender una llamada. Si encaja, agende 30 min: https://calendly.com/rutinhq/30min.',
      null,
      'es',
    ) === 'Puede agendar una llamada. Si encaja, agende 30 min: https://calendly.com/rutinhq/30min.',
    'polish applies ES typo fixes',
  )
  assert(
    applyGuideEsTypoFixes(
      'No, GTM OS no es para tiendas ecommerce. STORE OS, que es un sistema para Shopify Admin audit + config.',
    ) ===
      'No, GTM OS no es para tiendas de comercio electrónico. STORE OS, que es un sistema para auditoría y configuración del panel de Shopify.',
    'ecommerce and Shopify Admin audit + config are rewritten',
  )
  assert(
    applyGuideEsTypoFixes('Founder / CEO o lead de ops en B2B con pipeline repetible y leads.') ===
      'Fundador / director general o responsable de operaciones en B2B con flujo de ventas repetible y prospectos.',
    'Founder/CEO/ops/pipeline/leads glossary',
  )
  assert(
    applyGuideEsTypoFixes('Encaja en tiendas DTC y marcas DTC en Shopify.') ===
      'Encaja en marcas que venden directo al consumidor y marcas que venden directo al consumidor en Shopify.',
    'tiendas DTC / marcas DTC become marcas que venden directo al consumidor',
  )
  assert(
    applyGuideEsTypoFixes('outbound B2B con ICP.') === 'prospección en frío B2B con ICP.',
    'outbound becomes prospección en frío; B2B stays',
  )
  assert(
    polishGuideLlmReply('GTM OS is B2B outbound for the team.', 'stop', 'en') ===
      'GTM OS is B2B outbound for the team.',
    'EN polish must not apply the ES glossary',
  )
}
assert(isUnusableGuideReply(null), 'empty completion is unusable')
assert(isUnusableGuideReply('GTM OS es el sistema de outbound'), 'sub-80 mid-cut is unusable')
assert(isUnusableGuideReply('x'.repeat(90), 'length'), 'finish_reason=length is unusable')
assert(
  isUnusableGuideReply(
    'GTM OS is the B2B outbound system we install in your team — cold, ICP-filtered, milestone-gated.',
  ) === false,
  'complete multi-clause reply is usable',
)

assert(
  !redactGuideLlmSnippet('auth AIzaSyFakeKeyForShapeOnly extra').includes('AIza'),
  'snippets must redact AIza-shaped keys',
)
assert(
  !redactGuideLlmSnippet('Bearer AQ.FakeStudioKeyForShapeOnly').includes('AQ.'),
  'snippets must redact Bearer / AQ. keys',
)
assert(redactGuideLlmSnippet('x'.repeat(500)).length === 200, 'snippets cap at 200 chars')
{
  const line = guideLlmFailureLog({
    provider: 'openai-compat',
    model: 'gemini-3.1-flash-lite',
    status: 400,
    errorSnippet: 'API key AIzaSyFakeKeyForShapeOnly invalid',
    elapsedMs: 120,
    modelsTried: ['gemini-3.1-flash-lite'],
  })
  const parsed = JSON.parse(line) as {
    msg: string
    provider: string
    model: string
    status: number
    errorSnippet: string
    elapsedMs: number
    modelsTried: string[]
  }
  assert(parsed.msg === 'guide_llm_failed', 'failure log msg')
  assert(parsed.provider === 'openai-compat', 'failure log provider')
  assert(parsed.model === 'gemini-3.1-flash-lite', 'failure log model')
  assert(parsed.status === 400, 'failure log status')
  assert(parsed.elapsedMs === 120, 'failure log elapsedMs')
  assert(parsed.modelsTried[0] === 'gemini-3.1-flash-lite', 'failure log modelsTried')
  assert(!line.includes('AIza'), 'failure log must not contain the raw key')
  assert(!/authorization|x-goog-api-key/i.test(line), 'failure log must not dump headers')
}
assert(extractWorkersAiText({ response: '  hola equipo  ' }) === 'hola equipo', 'Workers AI response')
assert(
  extractWorkersAiText({ result: { response: 'desde result' } }) === 'desde result',
  'Workers AI nested result.response',
)
assert(
  extractWorkersAiText({
    choices: [{ message: { content: 'OpenAI-compat binding shape' } }],
  }) === 'OpenAI-compat binding shape',
  'Workers AI OpenAI-compat choices',
)
{
  const chatCompletion = {
    id: 'chatcmpl-q1',
    object: 'chat.completion',
    model: '@cf/meta/llama-3.1-8b-fast-v2',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content:
            'RutinHQ instala GTM OS, STORE OS y NEXUS OS en el equipo. Agenda https://calendly.com/rutinhq/30min.',
        },
        finish_reason: 'stop',
      },
    ],
  }
  assert(
    extractWorkersAiText(chatCompletion) ===
      'RutinHQ instala GTM OS, STORE OS y NEXUS OS en el equipo. Agenda https://calendly.com/rutinhq/30min.',
    'chat.completion choices[0].message.content',
  )
  assert(
    extractWorkersAiText({ response: chatCompletion }) ===
      'RutinHQ instala GTM OS, STORE OS y NEXUS OS en el equipo. Agenda https://calendly.com/rutinhq/30min.',
    'nested {response: chat.completion}',
  )
  assert(
    extractWorkersAiText({
      choices: [
        {
          message: {
            role: 'assistant',
            content: [{ type: 'text', text: 'Parte A. ' }, { text: 'Parte B.' }],
          },
        },
      ],
    }) === 'Parte A. Parte B.',
    'choices content as parts array',
  )
  assert(
    extractWorkersAiText({ response: { response: 'objeto anidado' } }) === 'objeto anidado',
    '{response: object} with nested string',
  )
  assert(
    extractWorkersAiText({ response: { text: 'objeto con text' } }) === 'objeto con text',
    '{response: object} with text field',
  )
  assert(
    extractWorkersAiText({ response: 'string response' }) === 'string response',
    '{response: string}',
  )
  assert(
    extractWorkersAiText({ result: { response: chatCompletion } }) ===
      'RutinHQ instala GTM OS, STORE OS y NEXUS OS en el equipo. Agenda https://calendly.com/rutinhq/30min.',
    '{result:{response: chat.completion}}',
  )
  assert(
    stripGuideMarkdownFences('```json\n{"reply":"hola"}\n```') === '{"reply":"hola"}',
    'strip json fences',
  )
  assert(extractFirstJsonObject('pre {"reply":"x"} post') === '{"reply":"x"}', 'first balanced object')
  assert(
    coerceGuideLlmReply('```json\n{"reply":"RutinHQ hace GTM OS para outbound B2B."}\n```') ===
      'RutinHQ hace GTM OS para outbound B2B.',
    'fenced JSON reply field',
  )
  assert(
    coerceGuideLlmReply('RutinHQ hace GTM OS y STORE OS. {esto no es json') ===
      'RutinHQ hace GTM OS y STORE OS. {esto no es json',
    'plain text survives failed JSON',
  )
  assert(
    coerceGuideLlmReply('¿Qué hace RutinHQ? GTM OS, STORE OS y NEXUS OS.') ===
      '¿Qué hace RutinHQ? GTM OS, STORE OS y NEXUS OS.',
    'short plain text is kept',
  )
}
assert(guideDegradedReasonFromLlm({ lastError: 'timeout', lastStatus: null, lastErrorSnippet: null }) === 'budget_timeout', 'timeout → budget_timeout')
assert(guideDegradedReasonFromLlm({ lastError: 'missing_binding', lastStatus: null, lastErrorSnippet: null }) === 'missing_binding', 'missing_binding')
assert(guideDegradedReasonFromLlm({ lastError: 'empty_content', lastStatus: 200, lastErrorSnippet: '{}' }) === 'parse_error', 'empty → parse_error')
assert(
  formatGuideAiErrorReason(403, 'The Gemini API free tier is not available').startsWith('ai_error:403/'),
  'ai_error includes status',
)
assert(isGuidePreviewHost('8645d940.rutinhq-web.pages.dev'), 'commit preview is preview host')
assert(isGuidePreviewHost('cursor-guide-turnstile-open.rutinhq-web.pages.dev'), 'branch preview is preview host')
assert(!isGuidePreviewHost('rutinhq-web.pages.dev'), 'Pages production alias is not preview')
assert(!isGuidePreviewHost('www.rutinhq.com'), 'www.rutinhq.com is never preview')
assert(!isGuidePreviewHost('rutinhq.com'), 'rutinhq.com is never preview')
{
  const esPrompt = composeGuideSystemPrompt('policy-block', 'es', 'Allowlisted knowledge body')
  const enPrompt = composeGuideSystemPrompt('policy-block', 'en', 'Allowlisted knowledge body')
  assert(/LANGUAGE LOCK: Visitor locale is es\. Reply 100% in Spanish/.test(esPrompt), 'es lock')
  assert(/LANGUAGE LOCK: Visitor locale is en\. Reply 100% in English/.test(enPrompt), 'en lock')
  assert(/LENGTH LOCK: ≤80 words/.test(esPrompt), 'length lock in prompt')
  assert(/USTED LOCK: Formal usted only/.test(esPrompt), 'es usted lock')
  assert(/sistemas que usted posee, sin iguala mensual/.test(esPrompt), 'es glossary example')
  assert(/ICP = perfil de cliente ideal/.test(esPrompt), 'es ICP glossary')
  assert(/SDR = representante de desarrollo de ventas \(externo\)/.test(esPrompt), 'es SDR glossary')
  assert(
    /tiendas de comercio electrónico/.test(esPrompt) &&
      /marcas que venden directo al consumidor/.test(esPrompt),
    'es audience glossary',
  )
  assert(
    /NEXUS OS is always "un sistema de marketing agéntico: Estrategia → Social → Ads"/.test(esPrompt),
    'es NEXUS phrasing',
  )
  assert(/nada se publica ni se gasta sin aprobación explícita/.test(esPrompt), 'es NEXUS gate')
  assert(/never "papel"/.test(esPrompt), 'es bans papel')
  assert(/never "publicidad social y publicidad"/.test(esPrompt), 'es bans redundant NEXUS ads')
  assert(
    /GTM OS \(prospección en frío B2B\), STORE OS \(auditoría y configuración del panel de Shopify para marcas que venden directo al consumidor\) y NEXUS OS \(Estrategia → Social → Ads\)/.test(
      esPrompt,
    ),
    'es RutinHQ one-liner names all three SKUs',
  )
  assert(
    /No es para tiendas de comercio electrónico ni para quien solo quiere anuncios/.test(esPrompt),
    'es GTM not-for',
  )
  assert(/nunca abra con "No,"/.test(esPrompt) || /never open with "No,"/.test(esPrompt), 'es STORE lead-with')
  assert(esPrompt.includes(GUIDE_ES_CATALOG_FACTS), 'es prompt includes Spanish catalog facts')
  assert(
    /fundador, director general o responsable de operaciones en empresas B2B/.test(esPrompt),
    'es GTM for-whom',
  )
  assert(/outbound → prospección en frío/.test(esPrompt), 'es outbound glossary')
  assert(/Zero English except product names/.test(esPrompt), 'es zero-english lock')
  assert(/never "ecommerceros"/.test(esPrompt), 'es bans ecommerceros')
  assert(!/USTED LOCK/.test(enPrompt), 'en prompt must not carry the Spanish usted lock')
  assert(
    esPrompt.lastIndexOf('LANGUAGE LOCK') > esPrompt.lastIndexOf('Allowlisted knowledge'),
    'locale lock must follow knowledge so Llama answers in Spanish',
  )
  assert(
    esPrompt.lastIndexOf('LANGUAGE LOCK') > esPrompt.lastIndexOf('LENGTH LOCK'),
    'locale lock stays last',
  )
  const ranked = selectGuideKnowledge(
    [
      { title: 'EN STORE', url: 'https://www.rutinhq.com/store-os', text: 'Shopify Admin audit + config' },
      { title: 'ES STORE', url: 'https://www.rutinhq.com/es/store-os', text: 'auditoría y configuración del panel de Shopify' },
    ],
    'es',
    400,
  )
  assert(
    ranked.indexOf('ES STORE') < ranked.indexOf('EN STORE'),
    'ES locale knowledge prefers /es/ catalog URLs',
  )
}
{
  const missing = await callGuideLlmDetailed({
    provider: 'workers-ai',
    system: 'sys',
    messages: [{ role: 'user', content: 'hola' }],
    maxTokens: 1024,
  })
  assert(missing.lastError === 'missing_binding', 'workers-ai without env.AI is missing_binding')
  assert(missing.provider === 'workers-ai', 'missing_binding keeps workers-ai provider')
  const noKey = await callGuideLlmDetailed({
    provider: 'openai-compat',
    apiKey: '',
    system: 'sys',
    messages: [{ role: 'user', content: 'hi' }],
    maxTokens: 1024,
  })
  assert(noKey.lastError === 'missing_key', 'openai-compat still requires a key')
  let sawMaxTokens = 0
  const usable =
    'GTM OS es el sistema de outbound B2B que instalamos en tu equipo. Agenda https://calendly.com/rutinhq/30min para ver el fit. STORE OS y NEXUS OS no aplican a leads fríos.'
  const result = await callGuideLlmDetailed({
    provider: 'workers-ai',
    workersAi: {
      run: async (_model, input) => {
        sawMaxTokens = Number((input as { max_tokens?: unknown }).max_tokens || 0)
        const msgs = (input as { messages?: { role: string; content: string }[] }).messages || []
        assert(msgs[0]?.role === 'system', 'workers-ai sends a system message')
        assert(/LANGUAGE LOCK: Visitor locale is es/.test(msgs[0]?.content || ''), 'es lock reaches model')
        return { response: usable }
      },
    },
    system: composeGuideSystemPrompt('policy', 'es', 'kb'),
    messages: [{ role: 'user', content: 'necesito leads' }],
    maxTokens: 1024,
  })
  assert(result.provider === 'workers-ai', 'mock run is workers-ai')
  assert(result.host === 'workers-ai', 'workers-ai host label')
  assert(result.text === usable, 'workers-ai usable completion')
  assert(sawMaxTokens === GUIDE_WORKERS_AI_MAX_TOKENS, 'workers-ai caps max_tokens below 1024')
  const fromChat = await callGuideLlmDetailed({
    provider: 'workers-ai',
    workersAi: {
      run: async () => ({
        id: 'chatcmpl-q1',
        object: 'chat.completion',
        model: '@cf/meta/llama-3.1-8b-fast-v2',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'RutinHQ instala GTM OS para outbound. Agenda https://calendly.com/rutinhq/30min.',
            },
            finish_reason: 'stop',
          },
        ],
      }),
    },
    system: 'sys',
    messages: [{ role: 'user', content: '¿Qué hace RutinHQ?' }],
    maxTokens: 256,
  })
  assert(
    fromChat.text ===
      'RutinHQ instala GTM OS para outbound. Agenda https://calendly.com/rutinhq/30min.',
    'chat.completion payload becomes the reply instead of parse_error',
  )
  const fromFence = await callGuideLlmDetailed({
    provider: 'workers-ai',
    workersAi: {
      run: async () => ({
        response:
          '```json\n{"reply":"RutinHQ hace GTM OS, STORE OS y NEXUS OS. Agenda la llamada de 30 min."}\n```',
      }),
    },
    system: 'sys',
    messages: [{ role: 'user', content: 'hola' }],
    maxTokens: 256,
  })
  assert(
    fromFence.text === 'RutinHQ hace GTM OS, STORE OS y NEXUS OS. Agenda la llamada de 30 min.',
    'fenced JSON reply is unwrapped',
  )
  const fromCut = await callGuideLlmDetailed({
    provider: 'workers-ai',
    workersAi: {
      run: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content:
                'GTM OS es outbound B2B que instalamos en tu equipo. No es un SDR rentado ni agencia de',
            },
            finish_reason: 'length',
          },
        ],
      }),
    },
    system: 'sys',
    messages: [{ role: 'user', content: '¿Qué es GTM OS?' }],
    maxTokens: 450,
  })
  assert(
    fromCut.text === 'GTM OS es outbound B2B que instalamos en tu equipo.',
    'workers-ai length cut is trimmed to the last complete sentence',
  )
}

assert(/RutinHQ Guide/.test(GUIDE_MANDATE), 'mandate names public UI')
assert(/GTM OS/.test(GUIDE_MANDATE) && /STORE OS/.test(GUIDE_MANDATE) && /NEXUS OS/.test(GUIDE_MANDATE), 'mandate SKUs')
assert(
  /calendly.com\/rutinhq\/30min/.test(GUIDE_MANDATE) && /strategy@rutinhq.com/.test(GUIDE_MANDATE),
  'mandate CTAs',
)
assert(!/capo|fuzzyflags|\bfzf\b/i.test(GUIDE_MANDATE), 'mandate must stay public-safe')

const guidePolicy = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/guide/policy.json', import.meta.url)), 'utf8'),
) as ClassifyPolicy
const poisonStore =
  'STORE OS es auditoría + config de Shopify Admin (variantes, precio, peso, envío). Agenda 30 min.'
const storeThen = (follow: string) => [
  { role: 'user' as const, content: 'que es STORE OS?' },
  { role: 'assistant' as const, content: poisonStore },
  { role: 'user' as const, content: follow },
]

const leadsAlone = [{ role: 'user' as const, content: 'leads' }]
assert(
  classifyIntentWithPolicy(leadsAlone, guidePolicy) === 'gtm-os',
  'single-turn leads must be GTM OS, not generic fit',
)
assert(recommendSkuWithPolicy(leadsAlone, guidePolicy) === 'gtm-os', 'leads recommends GTM OS')
assert(
  resolveFallbackKey(
    classifyIntentWithPolicy(leadsAlone, guidePolicy),
    recommendSkuWithPolicy(leadsAlone, guidePolicy),
  ) === 'gtm-os',
  'degraded leads key must be gtm-os',
)
const leadsReply = localGuideReply(leadsAlone, 'es')
assert(/GTM OS/.test(leadsReply), 'leads reply must name GTM OS')
assert(/outbound|ICP/i.test(leadsReply), 'leads reply must name outbound / ICP-filtered')
assert(/calendly.com\/rutinhq\/30min/i.test(leadsReply), 'leads reply must include Calendly')
assert(
  !/^El siguiente paso es una llamada/i.test(leadsReply),
  'leads must not be a generic fit-only Calendly with no GTM SKU',
)

assert(
  classifyIntentWithPolicy([{ role: 'user', content: 'quiero cita' }], guidePolicy) === 'fit',
  'single-turn cita without SKU is fit+Calendly',
)
assert(
  isSchedulingTurn([{ role: 'user', content: '¿Cómo agendo una llamada?' }]),
  'Q5 how-to-book is a scheduling turn',
)
assert(
  isSchedulingTurn([{ role: 'user', content: 'quiero cita' }]),
  'cita is scheduling',
)
assert(
  !isSchedulingTurn([{ role: 'user', content: '¿Qué es GTM OS?' }]),
  'SKU questions must still call the LLM',
)
assert(
  !isSchedulingTurn([{ role: 'user', content: 'qué más' }]),
  'qué más stays on the LLM, not the scheduling one-liner',
)
assert(
  schedulingGuideReply('es') ===
    'Puede agendar una llamada de 30 minutos aquí: https://calendly.com/rutinhq/30min.',
  'scheduling ES reply is the fixed one-liner',
)
assert(
  localGuideReply([{ role: 'user', content: '¿Cómo agendo una llamada?' }], 'es') ===
    schedulingGuideReply('es'),
  'local Q5 returns the scheduling one-liner without catalog fallback',
)

for (const follow of ['cita', 'agenda', 'schedule', 'Calendly', 'fit', 'qué más', 'quiero cita']) {
  const thread = storeThen(follow)
  const intent = classifyIntentWithPolicy(thread, guidePolicy)
  const sku = recommendSkuWithPolicy(thread, guidePolicy)
  assert(intent !== 'pricing', `cita≠pricing: STORE OS + "${follow}" must not be pricing (got ${intent})`)
  assert(intent !== 'store-os', `STORE OS + "${follow}" must not stick on STORE (got ${intent})`)
  assert(intent === 'fit', `STORE OS + "${follow}" should be fit+Calendly, got ${intent}`)
  assert(sku === 'unclear', `STORE OS + "${follow}" must not inherit store-os`)
  assert(
    resolveFallbackKey(intent, sku) === 'fit',
    `degraded key for "${follow}" must be fit, not STORE copy`,
  )
  const reply = localGuideReply(thread, 'es')
  assert(/calendly.com\/rutinhq\/30min/i.test(reply), `"${follow}" must keep Calendly`)
  assert(
    !/STORE OS es auditoría/i.test(reply),
    `STORE OS + "${follow}" must not return STORE reply body`,
  )
}

for (const follow of ['leads', 'outbound', 'prospecting', 'necesito leads']) {
  const thread = storeThen(follow)
  const intent = classifyIntentWithPolicy(thread, guidePolicy)
  const sku = recommendSkuWithPolicy(thread, guidePolicy)
  assert(intent === 'gtm-os', `STORE OS + "${follow}" must be GTM OS, got ${intent}`)
  assert(sku === 'gtm-os', `STORE OS + "${follow}" recommends GTM OS`)
  assert(resolveFallbackKey(intent, sku) === 'gtm-os', `degraded key for "${follow}" must be gtm-os`)
  const reply = localGuideReply(thread, 'es')
  assert(/GTM OS/.test(reply) && /ICP|outbound/i.test(reply), `"${follow}" after STORE must be GTM copy`)
  assert(/calendly.com\/rutinhq\/30min/i.test(reply), `"${follow}" must keep Calendly`)
  assert(!/STORE OS es auditoría/i.test(reply), `STORE OS + "${follow}" must not return STORE reply body`)
}

assert(
  classifyIntentWithPolicy(storeThen('quiero cita para shopify'), guidePolicy) === 'store-os',
  'cita that names Shopify on the last turn may keep STORE + Calendly',
)
assert(
  classifyIntentWithPolicy(storeThen('GTM-fit'), guidePolicy) === 'gtm-os',
  'GTM-fit on the last turn is GTM OS + Calendly',
)
assert(
  classifyIntentWithPolicy([{ role: 'user', content: 'how much does GTM OS cost?' }], guidePolicy) ===
    'pricing',
  'explicit pricing still refuses',
)
const degradedSku = ensureCalendlyCta(
  'STORE OS is Shopify Admin audit + config. GTM OS and NEXUS OS stay out of Admin.',
  'en',
)
assert(
  /calendly.com\/rutinhq\/30min/.test(degradedSku) && /STORE OS/.test(degradedSku),
  'degraded SKU copy must keep STORE OS + Calendly URL',
)

console.log('guide LLM client + mandate checks passed')
