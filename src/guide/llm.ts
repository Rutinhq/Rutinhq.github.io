/**
 * Shared Guide LLM client (Pages Function + Vite middleware).
 * Speaks OpenAI chat-completions; Gemini's OpenAI-compat endpoint is first-class.
 */

export type GuideLlmMode = 'llm' | 'degraded'

export type GuideLlmMessage = { role: 'user' | 'assistant' | 'system'; content: string }

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
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash'

/** Thinking Gemini IDs burn max_tokens on thoughts → finish_reason=length mid-sentence. */
const THINKING_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.6-flash',
])

/** 404 / model-not-found only. Never used on 429/503. Never hop to thinking models. */
const MODEL_FALLBACKS: Record<string, string[]> = {
  'gemini-2.0-flash': ['gemini-2.0-flash-001', 'gemini-flash-latest'],
  'gemini-2.0-flash-exp': ['gemini-2.0-flash', 'gemini-2.0-flash-001'],
  'gemini-2.0-flash-001': ['gemini-2.0-flash', 'gemini-flash-latest'],
  'gemini-flash-latest': ['gemini-2.0-flash'],
}

export const GUIDE_LLM_CANDIDATE_CAP = 3
export const GUIDE_LLM_MIN_REPLY_CHARS = 80
export const GUIDE_LLM_RATE_LIMIT_BACKOFF_MS = 600
export const GUIDE_LLM_BUDGET_MS = 9_000

function looksLikeGeminiKey(apiKey?: string): boolean {
  const key = apiKey?.trim() || ''
  // Legacy Google API keys are AIza…; current AI Studio / Gemini keys are AQ.…
  return key.startsWith('AIza') || key.startsWith('AQ.')
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

export function resolveGuideLlmModel(raw?: string, apiKey?: string): string {
  const explicit = raw?.trim()
  if (explicit) return normalizeGuideLlmModel(explicit)
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
  const model = (raw || 'gpt-4o-mini').trim()
  return model.replace(/^models\//, '')
}

export function guideLlmModelCandidates(raw?: string): string[] {
  const primary = normalizeGuideLlmModel(raw)
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
  text: string | null
  host: string
  modelsTried: string[]
  lastStatus: number | null
  lastError: string | null
  lastFinishReason: string | null
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

export async function callGuideLlmDetailed(opts: {
  apiKey: string
  baseUrl?: string
  model?: string
  system: string
  messages: GuideLlmMessage[]
  maxTokens: number
  timeoutMs?: number
}): Promise<GuideLlmCallResult> {
  const key = opts.apiKey.trim()
  const base = resolveGuideLlmBaseUrl(opts.baseUrl, key, opts.model)
  let host = 'invalid'
  try {
    host = new URL(base).host
  } catch {
    host = 'invalid'
  }
  const empty: GuideLlmCallResult = {
    text: null,
    host,
    modelsTried: [],
    lastStatus: null,
    lastError: key ? null : 'missing_key',
    lastFinishReason: null,
  }
  if (!key) return empty

  const gemini = isGeminiHost(base)
  const headers: Record<string, string> = {
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
  }
  if (gemini) headers['x-goog-api-key'] = key

  const primary = resolveGuideLlmModel(opts.model, key)
  const models = guideLlmModelCandidates(primary)
  const controller = new AbortController()
  const budgetMs = opts.timeoutMs ?? GUIDE_LLM_BUDGET_MS
  const budget = setTimeout(() => controller.abort(), budgetMs)

  const postOnce = async (model: string): Promise<{ status: number; raw: string; ok: boolean }> => {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers,
      signal: controller.signal,
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
        try {
          const res = await postOnce(model)
          empty.lastStatus = res.status
          if (!res.ok) {
            empty.lastError = sanitizeProviderError(res.status, res.raw)
            const action = guideLlmOnProviderError(res.status, res.raw, isPrimary, retriedPrimary)
            if (action === 'retry') {
              retriedPrimary = true
              await sleep(GUIDE_LLM_RATE_LIMIT_BACKOFF_MS, controller.signal)
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
        }
      }
    }
  } finally {
    clearTimeout(budget)
  }
  return empty
}

export async function callGuideLlm(opts: {
  apiKey: string
  baseUrl?: string
  model?: string
  system: string
  messages: GuideLlmMessage[]
  maxTokens: number
}): Promise<string | null> {
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
    `Visitor locale: ${locale}. Reply entirely in ${lang}. Do not mix languages. SKU names stay in English.`,
    'Reply in 4–8 short sentences unless the visitor asks for less. Do not stop mid-sentence.',
    knowledge ? `Allowlisted knowledge:\n${knowledge}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
