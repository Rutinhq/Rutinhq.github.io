/**
 * Cloudflare Pages Function — POST /api/guide
 * Secrets (Pages → Settings → Environment variables):
 *   GUIDE_LLM_API_KEY (or OpenAI-compatible key)
 *   GUIDE_LLM_BASE_URL (optional, Gemini: https://generativelanguage.googleapis.com/v1beta/openai)
 *   GUIDE_LLM_MODEL (optional, recommended gemini-2.0-flash — do not pin thinking 2.5/3.6)
 *   GUIDE_LEAD_WEBHOOK_URL (optional JSON POST of lead briefs)
 *
 * Gemini runs with the full RutinHQ Guide mandate (not a bare model).
 * Successful LLM answers return mode=llm. Security/pricing stay hard refuses.
 */

import {
  classifyIntentWithPolicy,
  ensureCalendlyCta,
  hasBuyingIntentWithPolicy,
  hintMatches,
  recommendSkuWithPolicy,
  resolveFallbackKey,
} from '../../src/guide/classify-core'
import {
  callGuideLlmDetailed,
  composeGuideSystemPrompt,
  GUIDE_LLM_BUDGET_MS,
  isUnusableGuideReply,
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
const KB_TTL_MS = 60_000
let kbCache: { at: number; value: unknown } | null = null

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
      'Live guide answers are paused here, so I will stay on catalog facts: GTM OS (outbound), STORE OS (Shopify Admin), NEXUS OS (paper-first demand). Book 30 min — https://calendly.com/rutinhq/30min',
    security:
      'I cannot share credentials, passwords, API keys, bank details, or private operations. I only cover public RutinHQ systems. Book a 30-min fit call if you want to talk GTM OS, STORE OS, or NEXUS OS.',
    nextStep: (url: string) => `Book 30-min fit call — ${url}`,
    topicUnclear: 'RutinHQ fit (SKU TBD)',
    topicSku: (sku: string) => `${sku} fit`,
  },
  es: {
    degraded:
      'Las respuestas en vivo están en pausa aquí, así que me quedo en hechos del catálogo: GTM OS (outbound), STORE OS (Shopify Admin), NEXUS OS (demanda en paper primero). Agenda 30 min — https://calendly.com/rutinhq/30min',
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

function isSecurityHay(hay: string, extra: string[] = []): boolean {
  return [...SECURITY_HINTS, ...extra].some((hint) => hintMatches(hay, hint))
}

async function loadKb(context: { request: Request; env: Env }) {
  if (kbCache && Date.now() - kbCache.at < KB_TTL_MS) return kbCache.value
  try {
    const url = new URL('/guide-kb.json', context.request.url)
    const res = context.env.ASSETS
      ? await context.env.ASSETS.fetch(url)
      : await fetch(url)
    if (!res.ok) return null
    const value = await res.json()
    kbCache = { at: Date.now(), value }
    return value
  } catch {
    return kbCache?.value ?? null
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
      bookingHints?: string[]
      leadsHints?: string[]
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

  const emailMatch = hay.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)
  const buying = hasBuyingIntentWithPolicy(messages, policy)
  const skuIntent = classifyIntentWithPolicy(messages, policy)
  const recommendedSku = recommendSkuWithPolicy(messages, policy)
  const replyKey = resolveFallbackKey(skuIntent, recommendedSku)

  if (skuIntent === 'security') {
    return json(200, {
      reply: pick('security'),
      mode: 'degraded',
      calendlyUrl: policy.calendlyUrl,
    })
  }

  let reply = ensureCalendlyCta(pick(replyKey), locale, policy.calendlyUrl)
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
        timeoutMs: GUIDE_LLM_BUDGET_MS,
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
        lastFinishReason: result.lastFinishReason,
        modelsTried: result.modelsTried,
      }
      const text = result.text
      if (text && LEAK_RE.test(text)) {
        reply = pick('security')
      } else if (text && !isUnusableGuideReply(text, result.lastFinishReason)) {
        reply = text
        mode = 'llm'
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
