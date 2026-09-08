/**
 * Cloudflare Pages Function — POST /api/guide
 * Secrets (Pages → Settings → Environment variables):
 *   GUIDE_LLM_API_KEY (or OpenAI-compatible key)
 *   GUIDE_LLM_BASE_URL (optional, Gemini: https://generativelanguage.googleapis.com/v1beta/openai)
 *   GUIDE_LLM_MODEL (optional, recommended gemini-2.0-flash)
 *   GUIDE_LEAD_WEBHOOK_URL (optional JSON POST of lead briefs)
 *
 * Gemini runs with the full RutinHQ Guide mandate (not a bare model).
 * Successful LLM answers return mode=llm. Security/pricing stay hard refuses.
 */

import {
  callGuideLlmDetailed,
  composeGuideSystemPrompt,
  type GuideLlmMode,
} from '../../src/guide/llm'

type Env = {
  ASSETS?: { fetch: (input: Request | URL | string) => Promise<Response> }
  GUIDE_LLM_API_KEY?: string
  GUIDE_LLM_BASE_URL?: string
  GUIDE_LLM_MODEL?: string
  GUIDE_LEAD_WEBHOOK_URL?: string
}

type Msg = { role: 'user' | 'assistant'; content: string }
type Locale = 'en' | 'es'

const hits = new Map<string, { n: number; resetAt: number }>()

const SECURITY_HINTS = [
  'password',
  'contraseña',
  'contrasena',
  'api key',
  'apikey',
  'api-key',
  'access token',
  'secret key',
  'admin secret',
  'shopify token',
  'shopify secret',
  'private key',
  'credencial',
  'credentials',
  'cuenta bancaria',
  'bank account',
  'routing number',
  'workspace id',
  'private ops',
  'day-of ops',
  'internal notion',
  'notion interno',
  'correo interno',
  'email privado',
  'private email',
  'capo',
  'fuzzyflags',
  'fzf',
  'faa',
  'banorte',
  'clabe',
  'saldo',
  'notion',
]

const LEAK_RE =
  /\b(capo|fuzzyflags|fzf|banorte|faa|clabe|password|api[-\s]?key|contraseña)\b/i

const COPY = {
  en: {
    degraded:
      'Book a 30-min fit call and we will map the bottleneck to GTM OS, STORE OS, or NEXUS OS. https://calendly.com/rutinhq/30min',
    security:
      'I cannot share credentials, passwords, API keys, bank details, or private operations. I only cover public RutinHQ systems. Book a 30-min fit call if you want to talk GTM OS, STORE OS, or NEXUS OS.',
    nextStep: (url: string) => `Book 30-min fit call — ${url}`,
    topicUnclear: 'RutinHQ fit (SKU TBD)',
    topicSku: (sku: string) => `${sku} fit`,
  },
  es: {
    degraded:
      'Agenda 30 min y mapeamos el cuello a GTM OS, STORE OS o NEXUS OS. https://calendly.com/rutinhq/30min',
    security:
      'No comparto credenciales, contraseñas, claves de API, datos bancarios ni operaciones privadas. Solo cubro los sistemas públicos de RutinHQ. Agenda 30 min si quieres hablar de GTM OS, STORE OS o NEXUS OS.',
    nextStep: (url: string) => `Agendar 30 min de fit — ${url}`,
    topicUnclear: 'Fit RutinHQ (SKU por confirmar)',
    topicSku: (sku: string) => `Fit ${sku}`,
  },
} as const

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hintMatches(hay: string, hint: string): boolean {
  const text = hay.toLowerCase()
  const h = hint.toLowerCase()
  if (!h) return false
  if (h.includes(' ')) return text.includes(h)
  return new RegExp(`(?:^|[^a-z0-9_])${escapeRe(h)}(?:[^a-z0-9_]|$)`).test(text)
}

function score(text: string, hints: string[]) {
  const hay = text.toLowerCase()
  return hints.reduce((n, h) => (hintMatches(hay, h) ? n + 1 : n), 0)
}

function isSecurityHay(hay: string, extra: string[] = []): boolean {
  return [...SECURITY_HINTS, ...extra].some((hint) => hintMatches(hay, hint))
}

async function loadKb(context: { request: Request; env: Env }) {
  try {
    const url = new URL('/guide-kb.json', context.request.url)
    const res = context.env.ASSETS
      ? await context.env.ASSETS.fetch(url)
      : await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const raw = await context.request.text()
  let parsed: { messages?: Msg[]; locale?: string; page?: string } = {}
  try {
    parsed = JSON.parse(raw || '{}')
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const locale: Locale = parsed.locale === 'es' ? 'es' : 'en'
  const page = typeof parsed.page === 'string' ? parsed.page.slice(0, 80) : '/'
  const messages = Array.isArray(parsed.messages) ? parsed.messages : []
  const hay = messages.map((m) => m.content).join('\n')
  const calendly = 'https://calendly.com/rutinhq/30min'

  if (isSecurityHay(hay)) {
    return json(200, {
      reply: COPY[locale].security,
      mode: 'degraded',
      calendlyUrl: calendly,
    })
  }

  const kb = (await loadKb(context)) as {
    documents?: { title: string; url: string; text: string }[]
    policy?: {
      calendlyUrl: string
      email: string
      systemPrompt: string
      limits: {
        maxMessagesPerSession: number
        maxInputChars: number
        maxReplyTokens: number
        maxBodyBytes: number
        rateLimitWindowMs: number
        rateLimitMax: number
      }
      intentHints: Record<string, string[]>
      buyingIntentHints: string[]
      pricingHints: string[]
      offTopicHints: string[]
      securityHints?: string[]
      fallbackReplies: Record<string, { en: string; es: string }>
    }
  } | null

  const policy = kb?.policy
  if (!policy) {
    return json(200, {
      reply: COPY[locale].degraded,
      mode: 'degraded',
      calendlyUrl: calendly,
    })
  }

  if (isSecurityHay(hay, policy.securityHints || [])) {
    const pack = policy.fallbackReplies.security
    return json(200, {
      reply: locale === 'es' ? pack?.es || COPY.es.security : pack?.en || COPY.en.security,
      mode: 'degraded',
      calendlyUrl: policy.calendlyUrl,
    })
  }

  const limits = policy.limits
  const ip =
    context.request.headers.get('cf-connecting-ip') ||
    context.request.headers.get('x-forwarded-for') ||
    'anon'
  const now = Date.now()
  const row = hits.get(ip)
  if (!row || now > row.resetAt) hits.set(ip, { n: 1, resetAt: now + limits.rateLimitWindowMs })
  else {
    row.n += 1
    if (row.n > limits.rateLimitMax) return json(429, { error: 'rate_limited' })
  }

  if (raw.length > limits.maxBodyBytes) return json(413, { error: 'payload_too_large' })
  if (messages.length === 0 || messages.length > limits.maxMessagesPerSession) {
    return json(400, { error: 'invalid_messages' })
  }

  function pick(key: string) {
    const pack = policy.fallbackReplies[key] || policy.fallbackReplies.unsure
    return locale === 'es' ? pack.es : pack.en
  }

  function intent() {
    if (isSecurityHay(hay, policy.securityHints || [])) return 'security'
    if (
      score(hay, policy.offTopicHints) &&
      !score(hay, [
        ...(policy.intentHints['gtm-os'] || []),
        ...(policy.intentHints['store-os'] || []),
        ...(policy.intentHints['nexus-os'] || []),
      ])
    ) {
      return 'offTopic'
    }
    if (score(hay, policy.pricingHints)) return 'pricing'
    const ranked = (['gtm-os', 'store-os', 'nexus-os', 'catalog'] as const).map((key) => ({
      key,
      n: score(hay, policy.intentHints[key] || []),
    }))
    ranked.sort((a, b) => b.n - a.n)
    if (!ranked[0] || ranked[0].n === 0) return 'unsure'
    if (ranked[1] && ranked[0].n === ranked[1].n && ranked[0].n < 2) return 'unsure'
    return ranked[0].key
  }

  const emailMatch = hay.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)
  const buying = score(hay, policy.buyingIntentHints) >= 1
  const skuIntent = intent()
  const skuRank = (['gtm-os', 'store-os', 'nexus-os'] as const).map((key) => ({
    key,
    n: score(hay, policy.intentHints[key] || []),
  }))
  skuRank.sort((a, b) => b.n - a.n)
  const recommendedSku =
    skuRank[0] && skuRank[0].n > 0 && skuRank[0].n !== skuRank[1]?.n
      ? skuRank[0].key
      : 'unclear'

  if (skuIntent === 'security') {
    return json(200, {
      reply: pick('security'),
      mode: 'degraded',
      calendlyUrl: policy.calendlyUrl,
    })
  }

  let reply = pick(skuIntent)
  let mode: GuideLlmMode = 'degraded'
  const key = context.env.GUIDE_LLM_API_KEY?.trim()
  const skipLlm = skuIntent === 'pricing' || skuIntent === 'offTopic'

  let llmDebug: Record<string, unknown> | null = null
  if (key && !skipLlm) {
    const knowledge = (kb?.documents || [])
      .map((d) => `### ${d.title}\nSource: ${d.url}\n${d.text}`)
      .join('\n\n')
      .slice(0, 14000)
    try {
      const result = await callGuideLlmDetailed({
        apiKey: key,
        baseUrl: context.env.GUIDE_LLM_BASE_URL,
        model: context.env.GUIDE_LLM_MODEL,
        maxTokens: limits.maxReplyTokens,
        system: composeGuideSystemPrompt(policy.systemPrompt, locale, knowledge),
        messages: messages.map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, limits.maxInputChars),
        })),
      })
      llmDebug = {
        hasKey: true,
        hasBase: Boolean(context.env.GUIDE_LLM_BASE_URL),
        hasModel: Boolean(context.env.GUIDE_LLM_MODEL),
        host: result.host,
        lastStatus: result.lastStatus,
        lastError: result.lastError,
        modelsTried: result.modelsTried,
      }
      const text = result.text
      if (text && !LEAK_RE.test(text)) {
        reply = text
        mode = 'llm'
      } else if (text && LEAK_RE.test(text)) {
        reply = pick('security')
      }
    } catch {
      llmDebug = { hasKey: true, lastError: 'call_threw' }
    }
  } else {
    llmDebug = {
      hasKey: Boolean(key),
      hasBase: Boolean(context.env.GUIDE_LLM_BASE_URL),
      hasModel: Boolean(context.env.GUIDE_LLM_MODEL),
      skipLlm,
      skuIntent,
    }
  }

  const body: Record<string, unknown> = {
    reply,
    mode,
    calendlyUrl: policy.calendlyUrl,
  }
  if (context.request.headers.get('x-rutinhq-guide-debug') === '1') {
    body.debug = llmDebug
  }

  if (emailMatch || buying) {
    const questions = messages
      .filter((m) => m.role === 'user')
      .map((m) => String(m.content).trim())
      .filter(Boolean)
      .slice(-6)
    const leadBrief = {
      topic:
        recommendedSku === 'unclear'
          ? COPY[locale].topicUnclear
          : COPY[locale].topicSku(recommendedSku),
      questionsAsked: questions,
      objections: [],
      recommendedSku,
      nextStep: COPY[locale].nextStep(policy.calendlyUrl),
      transcriptExcerpt: messages
        .slice(-8)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n')
        .slice(0, 900),
      email: emailMatch?.[0],
      page,
      locale,
    }
    body.leadBrief = leadBrief
    const hook = context.env.GUIDE_LEAD_WEBHOOK_URL?.trim()
    if (hook) {
      try {
        await fetch(hook, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ type: 'lead_brief', leadBrief }),
        })
      } catch {
        /* mailto remains the v1 path */
      }
    }
  }

  return json(200, body)
}
