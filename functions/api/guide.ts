/**
 * Cloudflare Pages Function — POST /api/guide
 * Secrets (Pages → Settings → Environment variables):
 *   GUIDE_LLM_API_KEY (or OpenAI-compatible key)
 *   GUIDE_LLM_BASE_URL (optional, default https://api.openai.com/v1)
 *   GUIDE_LLM_MODEL (optional, default gpt-4o-mini)
 *   GUIDE_LEAD_WEBHOOK_URL (optional JSON POST of lead briefs)
 */

type Env = {
  ASSETS?: { fetch: (input: Request | URL | string) => Promise<Response> }
  GUIDE_LLM_API_KEY?: string
  GUIDE_LLM_BASE_URL?: string
  GUIDE_LLM_MODEL?: string
  GUIDE_LEAD_WEBHOOK_URL?: string
}

type Msg = { role: 'user' | 'assistant'; content: string }

const hits = new Map<string, { n: number; resetAt: number }>()

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function score(text: string, hints: string[]) {
  const hay = text.toLowerCase()
  return hints.reduce((n, h) => (hay.includes(h.toLowerCase()) ? n + 1 : n), 0)
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
      fallbackReplies: Record<string, { en: string; es: string }>
    }
  } | null

  const policy = kb?.policy
  if (!policy) {
    return json(200, {
      reply:
        'Book a 30-min fit call and we will map the bottleneck to GTM OS, STORE OS, or NEXUS OS. https://calendly.com/rutinhq/30min',
      mode: 'degraded',
      calendlyUrl: 'https://calendly.com/rutinhq/30min',
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

  const raw = await context.request.text()
  if (raw.length > limits.maxBodyBytes) return json(413, { error: 'payload_too_large' })

  let parsed: { messages?: Msg[]; locale?: string; page?: string }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const messages = Array.isArray(parsed.messages) ? parsed.messages : []
  if (messages.length === 0 || messages.length > limits.maxMessagesPerSession) {
    return json(400, { error: 'invalid_messages' })
  }
  const locale = parsed.locale === 'es' ? 'es' : 'en'
  const page = typeof parsed.page === 'string' ? parsed.page.slice(0, 80) : '/'
  const hay = messages.map((m) => m.content).join('\n')

  function pick(key: string) {
    const pack = policy.fallbackReplies[key] || policy.fallbackReplies.unsure
    return locale === 'es' ? pack.es : pack.en
  }

  function intent() {
    if (score(hay, policy.offTopicHints) && !score(hay, [
      ...(policy.intentHints['gtm-os'] || []),
      ...(policy.intentHints['store-os'] || []),
      ...(policy.intentHints['nexus-os'] || []),
    ])) {
      return 'offTopic'
    }
    if (score(hay, policy.pricingHints)) return 'pricing'
    const ranked = (['gtm-os', 'store-os', 'nexus-os', 'catalog'] as const).map((key) => ({
      key,
      n: score(hay, policy.intentHints[key] || []),
    }))
    ranked.sort((a, b) => b.n - a.n)
    return ranked[0] && ranked[0].n > 0 ? ranked[0].key : 'unsure'
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

  let reply = pick(skuIntent)
  let mode: 'live' | 'degraded' = 'degraded'
  const key = context.env.GUIDE_LLM_API_KEY?.trim()

  if (key) {
    const base = (context.env.GUIDE_LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
    const model = context.env.GUIDE_LLM_MODEL || 'gpt-4o-mini'
    const knowledge = (kb?.documents || [])
      .map((d) => `### ${d.title}\nSource: ${d.url}\n${d.text}`)
      .join('\n\n')
      .slice(0, 14000)
    try {
      const llm = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${key}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: limits.maxReplyTokens,
          messages: [
            {
              role: 'system',
              content: `${policy.systemPrompt}\n\nVisitor locale: ${locale}.\n\nAllowlisted knowledge:\n${knowledge}`,
            },
            ...messages.map((m) => ({
              role: m.role,
              content: String(m.content).slice(0, limits.maxInputChars),
            })),
          ],
        }),
      })
      if (llm.ok) {
        const data = (await llm.json()) as { choices?: { message?: { content?: string } }[] }
        const text = data.choices?.[0]?.message?.content?.trim()
        if (text) {
          reply = text
          mode = 'live'
        }
      }
    } catch {
      /* keep catalog fallback */
    }
  }

  const body: Record<string, unknown> = {
    reply,
    mode,
    calendlyUrl: policy.calendlyUrl,
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
          ? 'RutinHQ fit (SKU TBD)'
          : `${recommendedSku} fit`,
      questionsAsked: questions,
      objections: [],
      recommendedSku,
      nextStep: `Book 30-min fit call — ${policy.calendlyUrl}`,
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
