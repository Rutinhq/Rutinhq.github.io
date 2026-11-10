/**
 * Shared Guide LLM client (Pages Function + Vite middleware).
 * Default provider: Cloudflare Workers AI (`env.AI.run`).
 * Optional: OpenAI-compat (Gemini / OpenAI) when GUIDE_LLM_PROVIDER=openai-compat.
 */

export type GuideLlmMode = 'llm' | 'degraded'

export type GuideLlmProviderId = 'workers-ai' | 'openai-compat'

export type GuideLlmMessage = { role: 'user' | 'assistant' | 'system'; content: string }

/** Minimal Pages `env.AI` surface — avoids a workers-types dependency. */
export type GuideWorkersAi = {
  run: (
    model: string,
    input: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>
}

/** Public-safe GEMINI ENGINE mandate. Do not name internal operators. */
export const GUIDE_MANDATE = `You are GEMINI ENGINE operating as RutinHQ Guide on www.rutinhq.com — not a generic assistant.
Public catalog only: GTM OS, STORE OS, NEXUS OS, plus public docs curriculum at docs.rutinhq.com/catalog/.
Never invent prices, retainers, legal terms, SLAs, credentials, bank data, or private operations.
Primary CTA: https://calendly.com/rutinhq/30min. Secondary: strategy@rutinhq.com.
Reply 100% in the visitor locale (English or Spanish). Keep SKU names in English: GTM OS, STORE OS, NEXUS OS.
Reply in 4–8 short sentences unless the visitor asks for less. Do not stop mid-sentence.
If unsure, say so and offer the 30-min fit call. Refuse security probes in one sentence + Calendly — do not pitch a SKU.
Public UI name is RutinHQ Guide only.`

const GEMINI_HOST = 'generativelanguage.googleapis.com'
const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite'

/** Thinking Gemini IDs burn max_tokens on thoughts → finish_reason=length mid-sentence.
 * gemini-3.1-flash-lite defaults to thinking_level=minimal and stays off this list
 * so the current OpenAI-compat body (model/temperature/max_tokens/messages) is valid. */
const THINKING_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.6-flash',
])

/** Official Gemini API ids (ai.google.dev/gemini-api/docs/models, Nov 2026):
 *   Gemini 3.1 Flash-Lite → gemini-3.1-flash-lite (stable; -preview shut down May 2026)
 *   Gemini 3 Flash        → gemini-3-flash-preview (no unsuffixed gemini-3-flash id)
 * 404 / model-not-found only. Never used on 429/503. Never hop to thinking models.
 * Do not include gemini-2.0-* (zero free-tier quota). gemini-2.5-flash-lite stays
 * out: it thinks unless reasoning_effort=none, which this request shape does not send. */
const MODEL_FALLBACKS: Record<string, string[]> = {
  'gemini-3.1-flash-lite': ['gemini-3-flash-preview'],
  'gemini-3-flash-preview': ['gemini-3.1-flash-lite'],
  'gemini-2.0-flash': ['gemini-3.1-flash-lite', 'gemini-3-flash-preview'],
  'gemini-2.0-flash-exp': ['gemini-3.1-flash-lite', 'gemini-3-flash-preview'],
  'gemini-2.0-flash-001': ['gemini-3.1-flash-lite', 'gemini-3-flash-preview'],
  'gemini-flash-latest': ['gemini-3.1-flash-lite', 'gemini-3-flash-preview'],
}

/** Bare "gemini-3-flash" is not an API id — OpenAI-compat 404s it. */
const GEMINI_MODEL_ALIASES: Record<string, string> = {
  'gemini-3-flash': 'gemini-3-flash-preview',
}

/** Current fast 8B in the Workers AI pricing table. The older
 * `@cf/meta/llama-3.1-8b-instruct-fast` catalog id 404s. 70B is opt-in only
 * (`GUIDE_LLM_MODEL`) — it risks the 9s budget and the 10k neuron/day cap. */
export const DEFAULT_WORKERS_AI_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast'

const WORKERS_AI_ALIASES: Record<string, string> = {
  '@cf/meta/llama-3.1-8b-instruct-fast': DEFAULT_WORKERS_AI_MODEL,
}

const WORKERS_AI_FALLBACKS: Record<string, string[]> = {
  [DEFAULT_WORKERS_AI_MODEL]: ['@cf/meta/llama-3.1-8b-instruct'],
  '@cf/meta/llama-3.1-8b-instruct-fast': [DEFAULT_WORKERS_AI_MODEL, '@cf/meta/llama-3.1-8b-instruct'],
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast': [DEFAULT_WORKERS_AI_MODEL],
  '@cf/meta/llama-3.1-70b-instruct-fp8-fast': [DEFAULT_WORKERS_AI_MODEL],
}

/** Cap completions so 4–8 short sentences stay inside the free neuron allocation. */
export const GUIDE_WORKERS_AI_MAX_TOKENS = 256

export const GUIDE_LLM_CANDIDATE_CAP = 3
export const GUIDE_LLM_MIN_REPLY_CHARS = 80
export const GUIDE_LLM_RATE_LIMIT_BACKOFF_MS = 600
/** Wall budget for env.AI.run / openai-compat. Cap is 20s (Pages Function + widget). */
export const GUIDE_LLM_BUDGET_MS = 20_000
/** First attempt. Leaves room for one 429 retry inside GUIDE_LLM_BUDGET_MS. */
export const GUIDE_LLM_PRIMARY_ATTEMPT_MS = 17_000
/** Single primary retry after 429/503. Timeouts never retry. */
export const GUIDE_LLM_RETRY_ATTEMPT_MS = 2_000
export const GUIDE_LLM_MIN_ATTEMPT_MS = 400
export const GUIDE_DEGRADED_REASON_MAX = 120

/** Per-attempt wall time so a hung primary cannot eat the 429 retry window. */
export function guideLlmAttemptMs(opts: { isRetry: boolean; remainingMs: number }): number {
  const cap = opts.isRetry ? GUIDE_LLM_RETRY_ATTEMPT_MS : GUIDE_LLM_PRIMARY_ATTEMPT_MS
  return Math.max(0, Math.min(cap, opts.remainingMs))
}

/** 429/503 retry only when leftover time can finish the backoff + a short attempt. */
export function guideLlmHasRetryBudget(remainingMs: number): boolean {
  return (
    guideLlmAttemptMs({
      isRetry: true,
      remainingMs: remainingMs - GUIDE_LLM_RATE_LIMIT_BACKOFF_MS,
    }) >= GUIDE_LLM_MIN_ATTEMPT_MS
  )
}

function looksLikeGeminiKey(apiKey?: string): boolean {
  const key = apiKey?.trim() || ''
  // Legacy Google API keys are AIza…; current AI Studio / Gemini keys are AQ.…
  return key.startsWith('AIza') || key.startsWith('AQ.')
}

export function resolveGuideLlmProvider(
  raw?: string,
  hints?: { hasWorkersAi?: boolean; hasApiKey?: boolean },
): GuideLlmProviderId {
  const v = (raw || '').trim().toLowerCase()
  if (v === 'openai-compat' || v === 'openai' || v === 'gemini') return 'openai-compat'
  if (v === 'workers-ai' || v === 'workersai' || v === 'workers_ai' || v === 'cf') {
    return 'workers-ai'
  }
  if (hints?.hasWorkersAi) return 'workers-ai'
  if (hints?.hasApiKey) return 'openai-compat'
  return 'workers-ai'
}

export function resolveGuideLlmBaseUrl(raw?: string, apiKey?: string, model?: string): string {
  const explicit = raw?.trim()
  if (explicit) return normalizeGuideLlmBaseUrl(explicit)
  const modelId = (model || '').toLowerCase()
  if (looksLikeGeminiKey(apiKey) || modelId.includes('gemini')) {
    return normalizeGuideLlmBaseUrl('https://generativelanguage.googleapis.com/v1beta/openai')
  }
  return normalizeGuideLlmBaseUrl('https://api.openai.com/v1')
}

export function resolveGuideLlmModel(
  raw?: string,
  apiKey?: string,
  provider?: string,
): string {
  const explicit = raw?.trim()
  if (explicit) return normalizeGuideLlmModel(explicit)
  if (resolveGuideLlmProvider(provider, { hasApiKey: Boolean(apiKey) }) === 'workers-ai') {
    return DEFAULT_WORKERS_AI_MODEL
  }
  if (looksLikeGeminiKey(apiKey)) return DEFAULT_GEMINI_MODEL
  return 'gpt-4o-mini'
}

export function normalizeGuideLlmBaseUrl(raw?: string): string {
  let base = (raw || 'https://api.openai.com/v1').trim()
  base = base.replace(/\/+$/, '')
  base = base.replace(/\/chat\/completions$/i, '')
  try {
    const url = new URL(base)
    if (url.hostname === GEMINI_HOST) {
      url.pathname = url.pathname.replace(/\/+$/, '')
      if (url.pathname === '' || url.pathname === '/') url.pathname = '/v1beta/openai'
      if (url.pathname === '/v1beta') url.pathname = '/v1beta/openai'
      if (url.pathname.endsWith('/openai/v1')) {
        url.pathname = url.pathname.replace(/\/v1$/, '')
      }
      return url.origin + url.pathname.replace(/\/+$/, '')
    }
  } catch {
    /* keep stripped base */
  }
  return base
}

export function normalizeGuideLlmModel(raw?: string): string {
  const model = (raw || 'gpt-4o-mini').trim().replace(/^models\//, '')
  return WORKERS_AI_ALIASES[model] || GEMINI_MODEL_ALIASES[model] || model
}

/** First 200 chars of a provider body with key-like strings stripped. Never log headers. */
export function redactGuideLlmSnippet(raw: string): string {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(
      /AIza[0-9A-Za-z_-]{8,}|AQ\.[0-9A-Za-z._-]{8,}|sk-[A-Za-z0-9_-]{8,}|ya29\.[A-Za-z0-9._-]+|Bearer\s+\S+/gi,
      '[redacted]',
    )
    .replace(
      /(["']?(?:api[_-]?key|authorization|secret|token|password|credential)["']?\s*[=:]\s*["']?)[^"'&\s,}]{6,}/gi,
      '$1[redacted]',
    )
    .slice(0, 200)
}

export function guideLlmFailureLog(opts: {
  provider?: string | null
  model: string | null
  status: number | null
  errorSnippet: string
  elapsedMs: number
  modelsTried: string[]
}): string {
  return JSON.stringify({
    msg: 'guide_llm_failed',
    provider: opts.provider || null,
    model: opts.model,
    status: opts.status,
    errorSnippet: redactGuideLlmSnippet(opts.errorSnippet),
    elapsedMs: opts.elapsedMs,
    modelsTried: opts.modelsTried,
  })
}

export function logGuideLlmFailure(opts: {
  provider?: string | null
  model: string | null
  status: number | null
  errorSnippet: string
  elapsedMs: number
  modelsTried: string[]
}): void {
  console.error(guideLlmFailureLog(opts))
}

/** Preview-only diagnostic. Never include keys; cap at GUIDE_DEGRADED_REASON_MAX. */
export function formatGuideAiErrorReason(
  status: number | null,
  message: string,
): string {
  const statusBit = status != null && Number.isFinite(status) ? String(status) : 'error'
  const msg = redactGuideLlmSnippet(message).slice(0, 80)
  const body = msg ? `${statusBit}/${msg}` : statusBit
  return `ai_error:${body}`.slice(0, GUIDE_DEGRADED_REASON_MAX)
}

export function guideDegradedReasonFromLlm(opts: {
  lastError: string | null
  lastStatus: number | null
  lastErrorSnippet: string | null
}): string {
  const err = (opts.lastError || '').trim()
  if (err === 'missing_binding') return 'missing_binding'
  if (err === 'timeout') return 'budget_timeout'
  if (
    err === 'truncated' ||
    err === 'empty_content' ||
    err.endsWith(':empty_content') ||
    err.endsWith(':invalid_json') ||
    err === 'invalid_json'
  ) {
    return 'parse_error'
  }
  if (!err) return 'parse_error'
  return formatGuideAiErrorReason(opts.lastStatus, opts.lastErrorSnippet || err)
}

export function guideLlmModelCandidates(raw?: string, provider?: string): string[] {
  const primary = normalizeGuideLlmModel(raw)
  const explicit = (provider || '').trim()
  const workers =
    (Boolean(explicit) && resolveGuideLlmProvider(explicit) === 'workers-ai') ||
    primary.startsWith('@cf/')
  if (workers) {
    const extra = WORKERS_AI_FALLBACKS[primary] || []
    return [primary, ...extra]
      .filter((id, i, all) => id && all.indexOf(id) === i)
      .slice(0, GUIDE_LLM_CANDIDATE_CAP)
  }
  const extra = (MODEL_FALLBACKS[primary] || []).filter((id) => !THINKING_MODELS.has(id))
  return [primary, ...extra]
    .filter((id, i, all) => id && all.indexOf(id) === i)
    .slice(0, GUIDE_LLM_CANDIDATE_CAP)
}

export function modelMissing(status: number, body: string): boolean {
  if (status === 429 || status === 503) return false
  if (status === 404) return true
  if (status !== 400) return false
  return /not found|does not exist|invalid model|model.*not/i.test(body)
}

/** 429/503: retry primary once, then fail. 404: walk short fallbacks. Else fail. */
export function guideLlmOnProviderError(
  status: number,
  body: string,
  isPrimary: boolean,
  retriedPrimary: boolean,
): 'retry' | 'fallback' | 'fail' {
  if (status === 429 || status === 503) {
    if (isPrimary && !retriedPrimary) return 'retry'
    return 'fail'
  }
  if (modelMissing(status, body)) return 'fallback'
  return 'fail'
}

function textFromUnknown(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object') {
          const rec = part as { text?: unknown; content?: unknown }
          if (typeof rec.text === 'string') return rec.text
          if (typeof rec.content === 'string') return rec.content
        }
        return ''
      })
      .join('')
  }
  if (value && typeof value === 'object') {
    const rec = value as { text?: unknown; content?: unknown }
    if (typeof rec.text === 'string') return rec.text
    if (typeof rec.content === 'string') return rec.content
  }
  return ''
}

/** Workers AI `env.AI.run` shapes (`{ response }` or OpenAI-compat `choices`). */
export function extractWorkersAiText(data: unknown): string | null {
  if (typeof data === 'string') return data.trim() || null
  if (!data || typeof data !== 'object') return null
  const rec = data as {
    response?: unknown
    result?: { response?: unknown }
    output?: unknown
  }
  const fromResponse = textFromUnknown(rec.response)
  if (fromResponse.trim()) return fromResponse.trim()
  const fromResult = textFromUnknown(rec.result?.response)
  if (fromResult.trim()) return fromResult.trim()
  const fromOutput = textFromUnknown(rec.output)
  if (fromOutput.trim()) return fromOutput.trim()
  return extractLlmText(data)
}

/** OpenAI-compat + Gemini-native shapes. Never log the payload (may echo secrets). */
export function extractLlmText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const rec = data as {
    choices?: {
      message?: { content?: unknown }
      text?: unknown
      delta?: { content?: unknown }
    }[]
    candidates?: { content?: { parts?: { text?: string }[] }; output?: unknown }[]
  }
  const choice = rec.choices?.[0]
  const fromChoice =
    textFromUnknown(choice?.message?.content) ||
    textFromUnknown(choice?.text) ||
    textFromUnknown(choice?.delta?.content)
  if (fromChoice.trim()) return fromChoice.trim()

  const candidate = rec.candidates?.[0]
  const fromParts = (candidate?.content?.parts || []).map((p) => p.text || '').join('')
  const fromCandidate = fromParts || textFromUnknown(candidate?.output)
  return fromCandidate.trim() || null
}

export function extractFinishReason(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const rec = data as {
    choices?: { finish_reason?: unknown; finishReason?: unknown }[]
    candidates?: { finishReason?: unknown; finish_reason?: unknown }[]
  }
  const raw =
    rec.choices?.[0]?.finish_reason ??
    rec.choices?.[0]?.finishReason ??
    rec.candidates?.[0]?.finishReason ??
    rec.candidates?.[0]?.finish_reason
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null
}

/** Empty, <~80 chars, finish_reason=length, or mid-sentence cut → do not ship as mode=llm. */
export function isUnusableGuideReply(text: string | null, finishReason?: string | null): boolean {
  if (!text || !text.trim()) return true
  const t = text.trim()
  const reason = (finishReason || '').toLowerCase().replace(/[\s_-]/g, '')
  if (reason === 'length' || reason === 'maxtokens') return true
  if (t.length < GUIDE_LLM_MIN_REPLY_CHARS) return true
  if (/[,:;–—\-]$/.test(t)) return true
  if (/https?:\/\/\S+$/i.test(t) || /\S+@\S+\.\S+$/.test(t)) return false
  if (/[a-záéíóúüñ]$/i.test(t) && !/[.!?…)]$/.test(t)) return true
  return false
}

function isGeminiHost(base: string): boolean {
  try {
    return new URL(base).hostname === GEMINI_HOST
  } catch {
    return base.includes(GEMINI_HOST)
  }
}

export type GuideLlmCallResult = {
  provider: GuideLlmProviderId
  text: string | null
  host: string
  modelsTried: string[]
  lastStatus: number | null
  lastError: string | null
  lastFinishReason: string | null
  /** Redacted provider body snippet for server logs only — never echo to clients. */
  lastErrorSnippet: string | null
}

function sanitizeProviderError(status: number, body: string): string {
  if (status === 401 || status === 403) return `${status}:auth`
  if (status === 404) return `${status}:not_found`
  if (status === 429) return `${status}:rate_limit`
  if (status === 503) return `${status}:unavailable`
  if (/model|not found|does not exist/i.test(body)) return `${status}:model`
  return `${status}:provider`
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
      return
    }
    const timer = setTimeout(resolve, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** Child abort: per-attempt cap, still cancelled if the overall budget fires. */
function abortAfter(
  ms: number,
  parent: AbortSignal,
): { signal: AbortSignal; cancel: () => void } {
  const child = new AbortController()
  const timer = setTimeout(() => child.abort(), ms)
  const onParent = () => child.abort()
  if (parent.aborted) child.abort()
  else parent.addEventListener('abort', onParent, { once: true })
  return {
    signal: child.signal,
    cancel: () => {
      clearTimeout(timer)
      parent.removeEventListener('abort', onParent)
    },
  }
}

function workersAiErrorSnippet(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return 'workers_ai_error'
  }
}

function workersAiStatus(err: unknown): number | null {
  if (!err || typeof err !== 'object') return null
  const rec = err as { status?: unknown; statusCode?: unknown }
  const raw = rec.status ?? rec.statusCode
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

function raceAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
    }
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (err) => {
        signal.removeEventListener('abort', onAbort)
        reject(err)
      },
    )
  })
}

export type GuideLlmCallOpts = {
  provider?: string
  workersAi?: GuideWorkersAi
  apiKey?: string
  baseUrl?: string
  model?: string
  system: string
  messages: GuideLlmMessage[]
  maxTokens: number
  timeoutMs?: number
}

export async function callGuideLlmDetailed(opts: GuideLlmCallOpts): Promise<GuideLlmCallResult> {
  const provider = resolveGuideLlmProvider(opts.provider, {
    hasWorkersAi: Boolean(opts.workersAi),
    hasApiKey: Boolean(opts.apiKey?.trim()),
  })
  if (provider === 'workers-ai') return callWorkersAiDetailed(opts)
  return callOpenAiCompatDetailed(opts)
}

async function callWorkersAiDetailed(opts: GuideLlmCallOpts): Promise<GuideLlmCallResult> {
  const empty: GuideLlmCallResult = {
    provider: 'workers-ai',
    text: null,
    host: 'workers-ai',
    modelsTried: [],
    lastStatus: null,
    lastError: opts.workersAi ? null : 'missing_binding',
    lastFinishReason: null,
    lastErrorSnippet: null,
  }
  if (!opts.workersAi) return empty

  const primary = resolveGuideLlmModel(opts.model, opts.apiKey, 'workers-ai')
  const models = guideLlmModelCandidates(primary, 'workers-ai')
  const maxTokens = Math.min(Math.max(1, opts.maxTokens), GUIDE_WORKERS_AI_MAX_TOKENS)
  const controller = new AbortController()
  const budgetMs = opts.timeoutMs ?? GUIDE_LLM_BUDGET_MS
  const startedAt = Date.now()
  const remainingMs = () => Math.max(0, budgetMs - (Date.now() - startedAt))
  const budget = setTimeout(() => controller.abort(), budgetMs)
  const messages = [{ role: 'system', content: opts.system }, ...opts.messages]

  try {
    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      const isPrimary = i === 0
      empty.modelsTried.push(model)
      let retriedPrimary = false

      while (true) {
        const attemptMs = guideLlmAttemptMs({
          isRetry: retriedPrimary,
          remainingMs: remainingMs(),
        })
        if (attemptMs < GUIDE_LLM_MIN_ATTEMPT_MS) {
          empty.lastError = empty.lastError || 'timeout'
          return empty
        }
        const attempt = abortAfter(attemptMs, controller.signal)
        try {
          const data = await raceAbort(
            opts.workersAi.run(
              model,
              {
                messages,
                max_tokens: maxTokens,
                temperature: 0.2,
              },
              { signal: attempt.signal },
            ),
            attempt.signal,
          )
          const text = extractWorkersAiText(data)
          empty.lastFinishReason = extractFinishReason(data)
          if (text && !isUnusableGuideReply(text, empty.lastFinishReason)) {
            empty.text = text
            empty.lastError = null
            empty.lastErrorSnippet = null
            return empty
          }
          empty.lastError = text ? 'truncated' : 'empty_content'
          empty.lastErrorSnippet = redactGuideLlmSnippet(
            typeof data === 'string' ? data : JSON.stringify(data ?? ''),
          )
          return empty
        } catch (err) {
          const name = err instanceof Error ? err.name : 'workers_ai_error'
          if (name === 'AbortError') {
            empty.lastError = 'timeout'
            return empty
          }
          const raw = workersAiErrorSnippet(err)
          const status =
            workersAiStatus(err) ??
            (modelMissing(404, raw) || /not found|unknown model|does not exist/i.test(raw)
              ? 404
              : 500)
          empty.lastStatus = status
          empty.lastErrorSnippet = redactGuideLlmSnippet(raw)
          empty.lastError = sanitizeProviderError(status, raw)
          const action = guideLlmOnProviderError(status, raw, isPrimary, retriedPrimary)
          if (action === 'retry' && guideLlmHasRetryBudget(remainingMs())) {
            retriedPrimary = true
            await sleep(Math.min(GUIDE_LLM_RATE_LIMIT_BACKOFF_MS, remainingMs()), controller.signal)
            continue
          }
          if (action === 'fallback') break
          return empty
        } finally {
          attempt.cancel()
        }
      }
    }
  } finally {
    clearTimeout(budget)
  }
  return empty
}

async function callOpenAiCompatDetailed(opts: GuideLlmCallOpts): Promise<GuideLlmCallResult> {
  const key = opts.apiKey?.trim() || ''
  const base = resolveGuideLlmBaseUrl(opts.baseUrl, key, opts.model)
  let host = 'invalid'
  try {
    host = new URL(base).host
  } catch {
    host = 'invalid'
  }
  const empty: GuideLlmCallResult = {
    provider: 'openai-compat',
    text: null,
    host,
    modelsTried: [],
    lastStatus: null,
    lastError: key ? null : 'missing_key',
    lastFinishReason: null,
    lastErrorSnippet: null,
  }
  if (!key) return empty

  const gemini = isGeminiHost(base)
  const headers: Record<string, string> = {
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
  }
  if (gemini) headers['x-goog-api-key'] = key

  const primary = resolveGuideLlmModel(opts.model, key, 'openai-compat')
  const models = guideLlmModelCandidates(primary, 'openai-compat')
  const controller = new AbortController()
  const budgetMs = opts.timeoutMs ?? GUIDE_LLM_BUDGET_MS
  const startedAt = Date.now()
  const remainingMs = () => Math.max(0, budgetMs - (Date.now() - startedAt))
  const budget = setTimeout(() => controller.abort(), budgetMs)

  const postOnce = async (
    model: string,
    signal: AbortSignal,
  ): Promise<{ status: number; raw: string; ok: boolean }> => {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: opts.maxTokens,
        messages: [{ role: 'system', content: opts.system }, ...opts.messages],
      }),
    })
    const raw = await res.text()
    return { status: res.status, raw, ok: res.ok }
  }

  try {
    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      const isPrimary = i === 0
      empty.modelsTried.push(model)
      let retriedPrimary = false

      while (true) {
        const attemptMs = guideLlmAttemptMs({
          isRetry: retriedPrimary,
          remainingMs: remainingMs(),
        })
        if (attemptMs < GUIDE_LLM_MIN_ATTEMPT_MS) {
          empty.lastError = empty.lastError || 'timeout'
          return empty
        }
        const attempt = abortAfter(attemptMs, controller.signal)
        try {
          const res = await postOnce(model, attempt.signal)
          empty.lastStatus = res.status
          empty.lastErrorSnippet = redactGuideLlmSnippet(res.raw)
          if (!res.ok) {
            empty.lastError = sanitizeProviderError(res.status, res.raw)
            const action = guideLlmOnProviderError(res.status, res.raw, isPrimary, retriedPrimary)
            if (action === 'retry' && guideLlmHasRetryBudget(remainingMs())) {
              retriedPrimary = true
              await sleep(
                Math.min(GUIDE_LLM_RATE_LIMIT_BACKOFF_MS, remainingMs()),
                controller.signal,
              )
              continue
            }
            if (action === 'fallback' && gemini) break
            return empty
          }
          let data: unknown
          try {
            data = JSON.parse(res.raw)
          } catch {
            empty.lastError = `${res.status}:invalid_json`
            return empty
          }
          const text = extractLlmText(data)
          empty.lastFinishReason = extractFinishReason(data)
          if (text && !isUnusableGuideReply(text, empty.lastFinishReason)) {
            empty.text = text
            empty.lastError = null
            return empty
          }
          empty.lastError = text ? 'truncated' : `${res.status}:empty_content`
          return empty
        } catch (err) {
          const name = err instanceof Error ? err.name : 'fetch_failed'
          if (name === 'AbortError') {
            empty.lastError = 'timeout'
            return empty
          }
          empty.lastError = name
          return empty
        } finally {
          attempt.cancel()
        }
      }
    }
  } finally {
    clearTimeout(budget)
  }
  return empty
}

export async function callGuideLlm(opts: GuideLlmCallOpts): Promise<string | null> {
  const result = await callGuideLlmDetailed(opts)
  return result.text
}

export function composeGuideSystemPrompt(
  policyPrompt: string,
  locale: 'en' | 'es',
  knowledge: string,
): string {
  const lang = locale === 'es' ? 'Spanish' : 'English'
  return [
    GUIDE_MANDATE,
    policyPrompt,
    'Reply in 4–8 short sentences unless the visitor asks for less. Do not stop mid-sentence.',
    knowledge ? `Allowlisted knowledge:\n${knowledge}` : '',
    `LANGUAGE LOCK: Visitor locale is ${locale}. Reply 100% in ${lang}. Do not mix languages. SKU names stay in English: GTM OS, STORE OS, NEXUS OS.`,
  ]
    .filter(Boolean)
    .join('\n\n')
}
