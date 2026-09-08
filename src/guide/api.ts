import { classifyIntent, shouldCaptureLead } from './classify'
import {
  fallbackReply,
  guidePolicy,
  GUIDE_LIMITS,
  GUIDE_SYSTEM_PROMPT,
  knowledgeBlock,
} from './config'
import { localGuideReply } from './fallback'
import { buildLeadBrief } from './lead'
import { callGuideLlm, composeGuideSystemPrompt } from './llm'
import { enforceSafeReply, isSecurityProbe, securityReply } from './security'
import type {
  GuideApiRequest,
  GuideApiResponse,
  GuideChatMessage,
  GuideEnv,
  GuideKb,
  GuideLocale,
} from './types'

export type { GuideEnv }

const hits = new Map<string, { n: number; resetAt: number }>()

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function clientKey(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'
  )
}

function rateLimited(key: string): boolean {
  const now = Date.now()
  const row = hits.get(key)
  if (!row || now > row.resetAt) {
    hits.set(key, { n: 1, resetAt: now + GUIDE_LIMITS.rateLimitWindowMs })
    return false
  }
  row.n += 1
  return row.n > GUIDE_LIMITS.rateLimitMax
}

function asLocale(value: unknown): GuideLocale {
  return value === 'es' ? 'es' : 'en'
}

function parseMessages(value: unknown): GuideChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0) return null
  if (value.length > GUIDE_LIMITS.maxMessagesPerSession) return null
  const messages: GuideChatMessage[] = []
  for (const item of value) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant')) return null
    if (typeof item.content !== 'string') return null
    const content = item.content.trim().slice(0, GUIDE_LIMITS.maxInputChars)
    if (!content) return null
    messages.push({ role: item.role, content })
  }
  if (messages[messages.length - 1]?.role !== 'user') return null
  return messages
}

async function callLlm(
  env: GuideEnv,
  messages: GuideChatMessage[],
  kb: GuideKb | null,
  locale: GuideLocale,
): Promise<string | null> {
  const apiKey = env.GUIDE_LLM_API_KEY?.trim()
  if (!apiKey) return null

  return callGuideLlm({
    apiKey,
    baseUrl: env.GUIDE_LLM_BASE_URL,
    model: env.GUIDE_LLM_MODEL,
    maxTokens: GUIDE_LIMITS.maxReplyTokens,
    system: composeGuideSystemPrompt(
      GUIDE_SYSTEM_PROMPT,
      locale,
      knowledgeBlock(kb?.documents ?? []),
    ),
    messages,
  })
}

async function notifyWebhook(env: GuideEnv, payload: unknown): Promise<void> {
  const url = env.GUIDE_LEAD_WEBHOOK_URL?.trim()
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Delivery is best-effort; mailto remains the v1 path.
  }
}

export async function handleGuideRequest(
  request: Request,
  env: GuideEnv,
  kb: GuideKb | null,
): Promise<Response> {
  if (request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' })
  }
  if (rateLimited(clientKey(request))) {
    return json(429, { error: 'rate_limited' })
  }

  const raw = await request.text()
  if (raw.length > GUIDE_LIMITS.maxBodyBytes) {
    return json(413, { error: 'payload_too_large' })
  }

  let parsed: GuideApiRequest
  try {
    parsed = JSON.parse(raw) as GuideApiRequest
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const messages = parseMessages(parsed.messages)
  if (!messages) return json(400, { error: 'invalid_messages' })

  const locale = asLocale(parsed.locale)
  const page = typeof parsed.page === 'string' ? parsed.page.slice(0, 80) : '/'

  if (isSecurityProbe(messages) || classifyIntent(messages) === 'security') {
    return json(200, {
      reply: securityReply(locale),
      mode: 'degraded',
      calendlyUrl: guidePolicy.calendlyUrl,
    })
  }

  if (classifyIntent(messages) === 'pricing') {
    const body: GuideApiResponse = {
      reply: fallbackReply('pricing', locale),
      mode: env.GUIDE_LLM_API_KEY ? 'llm' : 'degraded',
      calendlyUrl: guidePolicy.calendlyUrl,
    }
    if (shouldCaptureLead(messages)) {
      body.leadBrief = buildLeadBrief(messages, page, locale)
    }
    return json(200, body)
  }

  if (classifyIntent(messages) === 'offTopic') {
    const reply = fallbackReply('offTopic', locale)
    const body: GuideApiResponse = {
      reply,
      mode: env.GUIDE_LLM_API_KEY ? 'llm' : 'degraded',
      calendlyUrl: guidePolicy.calendlyUrl,
    }
    return json(200, body)
  }

  let mode: GuideApiResponse['mode'] = 'degraded'
  let reply: string
  try {
    const live = await callLlm(env, messages, kb, locale)
    if (live) {
      reply = enforceSafeReply(live, locale)
      mode = reply === live ? 'llm' : 'degraded'
    } else {
      reply = localGuideReply(messages, locale)
    }
  } catch {
    reply = localGuideReply(messages, locale)
  }

  const body: GuideApiResponse = {
    reply,
    mode,
    calendlyUrl: guidePolicy.calendlyUrl,
  }

  if (shouldCaptureLead(messages)) {
    const leadBrief = buildLeadBrief(messages, page, locale)
    body.leadBrief = leadBrief
    await notifyWebhook(env, { type: 'lead_brief', leadBrief })
  }

  return json(200, body)
}
