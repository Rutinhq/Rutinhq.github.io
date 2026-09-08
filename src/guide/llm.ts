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
If unsure, say so and offer the 30-min fit call. Refuse security probes in one sentence + Calendly — do not pitch a SKU.
Public UI name is RutinHQ Guide only.`

const GEMINI_HOST = 'generativelanguage.googleapis.com'

const MODEL_FALLBACKS: Record<string, string[]> = {
  'gemini-2.0-flash': [
    'gemini-2.0-flash-001',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-3.6-flash',
  ],
  'gemini-2.0-flash-exp': ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.6-flash'],
  'gemini-2.5-flash': ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-3.6-flash'],
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
  const extra = MODEL_FALLBACKS[primary] || []
  return [primary, ...extra].filter((id, i, all) => id && all.indexOf(id) === i)
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

function isGeminiHost(base: string): boolean {
  try {
    return new URL(base).hostname === GEMINI_HOST
  } catch {
    return base.includes(GEMINI_HOST)
  }
}

function modelMissing(status: number, body: string): boolean {
  if (status === 404) return true
  if (status !== 400 && status !== 404) return false
  return /model|not found|does not exist|invalid/i.test(body)
}

export async function callGuideLlm(opts: {
  apiKey: string
  baseUrl?: string
  model?: string
  system: string
  messages: GuideLlmMessage[]
  maxTokens: number
}): Promise<string | null> {
  const key = opts.apiKey.trim()
  if (!key) return null

  const base = normalizeGuideLlmBaseUrl(opts.baseUrl)
  const gemini = isGeminiHost(base)
  const headers: Record<string, string> = {
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
  }
  if (gemini) headers['x-goog-api-key'] = key

  const models = guideLlmModelCandidates(opts.model)
  for (const model of models) {
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: opts.maxTokens,
          messages: [{ role: 'system', content: opts.system }, ...opts.messages],
        }),
      })
      const raw = await res.text()
      if (!res.ok) {
        if (gemini && modelMissing(res.status, raw) && model !== models[models.length - 1]) {
          continue
        }
        return null
      }
      let data: unknown
      try {
        data = JSON.parse(raw)
      } catch {
        return null
      }
      const text = extractLlmText(data)
      if (text) return text
    } catch {
      /* try next model or degrade */
    }
  }
  return null
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
    knowledge ? `Allowlisted knowledge:\n${knowledge}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
