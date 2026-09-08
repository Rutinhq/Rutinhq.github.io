/**
 * Standalone Worker if Pages Functions are awkward on rutinhq-web.
 * Contract: POST { messages, locale, page } → { reply, mode, leadBrief?, calendlyUrl }
 *
 * Preferred path remains functions/api/guide.ts on the Pages project.
 * This folder is the escape hatch — see README.md.
 */

type Env = {
  GUIDE_LLM_API_KEY?: string
  GUIDE_LLM_BASE_URL?: string
  GUIDE_LLM_MODEL?: string
  GUIDE_LEAD_WEBHOOK_URL?: string
  GUIDE_KB_URL?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() })
    }
    if (request.method !== 'POST') {
      return json(405, { error: 'method_not_allowed' })
    }

    const kbUrl = env.GUIDE_KB_URL || 'https://www.rutinhq.com/guide-kb.json'
    let kb: {
      documents?: { title: string; url: string; text: string }[]
      policy?: {
        calendlyUrl: string
        systemPrompt: string
        limits: { maxReplyTokens: number; maxInputChars: number }
        fallbackReplies: Record<string, { en: string; es: string }>
        buyingIntentHints: string[]
      }
    } | null = null
    try {
      const res = await fetch(kbUrl)
      if (res.ok) kb = (await res.json()) as typeof kb
    } catch {
      kb = null
    }

    const parsed = (await request.json()) as {
      messages?: { role: string; content: string }[]
      locale?: string
      page?: string
    }
    const locale = parsed.locale === 'es' ? 'es' : 'en'
    const messages = parsed.messages || []
    const hay = messages.map((m) => m.content).join('\n')
    const securityHay = hay.toLowerCase()
    const securityHints = [
      'password',
      'contraseña',
      'api key',
      'apikey',
      'capo',
      'banorte',
      'faa',
      'notion',
      'fuzzyflags',
      'fzf',
      'clabe',
      'saldo',
    ]
    if (securityHints.some((h) => securityHay.includes(h))) {
      return json(200, {
        reply:
          locale === 'es'
            ? 'No comparto credenciales, contraseñas, claves de API, datos bancarios ni operaciones privadas. Agenda 30 min si quieres hablar de GTM OS, STORE OS o NEXUS OS.'
            : 'I cannot share credentials, passwords, API keys, bank details, or private operations. Book a 30-min fit call if you want to talk GTM OS, STORE OS, or NEXUS OS.',
        mode: 'degraded',
        calendlyUrl: kb?.policy?.calendlyUrl || 'https://calendly.com/rutinhq/30min',
      })
    }
    const pick = (key: string) => {
      const pack = kb?.policy?.fallbackReplies?.[key] || kb?.policy?.fallbackReplies?.unsure
      if (!pack) {
        return locale === 'es'
          ? 'Agenda 30 min — https://calendly.com/rutinhq/30min'
          : 'Book a 30-min fit call — https://calendly.com/rutinhq/30min'
      }
      return locale === 'es' ? pack.es : pack.en
    }

    let reply = `${pick('degraded')}\n\n${pick('unsure')}`
    let mode: 'llm' | 'degraded' = 'degraded'
    const key = env.GUIDE_LLM_API_KEY?.trim()
    if (key && kb?.policy) {
      const base = (env.GUIDE_LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
      const model = (env.GUIDE_LLM_MODEL || 'gpt-4o-mini').replace(/^models\//, '')
      const knowledge = (kb.documents || [])
        .map((d) => `### ${d.title}\n${d.text}`)
        .join('\n\n')
        .slice(0, 14000)
      const mandate =
        'You are GEMINI ENGINE operating as RutinHQ Guide — not a generic assistant. Public catalog only: GTM OS, STORE OS, NEXUS OS. Never invent prices, legal terms, or credentials. CTA: https://calendly.com/rutinhq/30min + strategy@rutinhq.com.'
      try {
        const headers: Record<string, string> = {
          authorization: `Bearer ${key}`,
          'content-type': 'application/json',
        }
        if (base.includes('generativelanguage.googleapis.com')) {
          headers['x-goog-api-key'] = key
        }
        const llm = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            temperature: 0.2,
            max_tokens: kb.policy.limits?.maxReplyTokens || 900,
            messages: [
              {
                role: 'system',
                content: `${mandate}\n\n${kb.policy.systemPrompt}\n\nVisitor locale: ${locale}. Reply entirely in ${locale === 'es' ? 'Spanish' : 'English'}.\n\n${knowledge}`,
              },
              ...messages.map((m) => ({
                role: m.role,
                content: String(m.content).slice(0, kb.policy?.limits.maxInputChars || 2000),
              })),
            ],
          }),
        })
        if (llm.ok) {
          const data = (await llm.json()) as {
            choices?: { message?: { content?: string | { text?: string }[] } }[]
          }
          const raw = data.choices?.[0]?.message?.content
          const text = (typeof raw === 'string' ? raw : raw?.map((p) => p.text || '').join(''))?.trim()
          if (text) {
            reply = text
            mode = 'llm'
          }
        }
      } catch {
        /* keep degraded */
      }
    }

    const body: Record<string, unknown> = {
      reply,
      mode,
      calendlyUrl: kb?.policy?.calendlyUrl || 'https://calendly.com/rutinhq/30min',
    }

    const email = hay.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0]
    const buying = (kb?.policy?.buyingIntentHints || ['book', 'price', 'hire']).some((h) =>
      hay.toLowerCase().includes(h.toLowerCase()),
    )
    if (email || buying) {
      const leadBrief = {
        topic: locale === 'es' ? 'Fit RutinHQ' : 'RutinHQ fit',
        questionsAsked: messages.filter((m) => m.role === 'user').map((m) => m.content).slice(-6),
        objections: [],
        recommendedSku: 'unclear',
        nextStep:
          locale === 'es'
            ? `Agendar 30 min de fit — ${body.calendlyUrl}`
            : `Book 30-min fit call — ${body.calendlyUrl}`,
        transcriptExcerpt: hay.slice(0, 900),
        email,
        page: parsed.page || '/',
        locale,
      }
      body.leadBrief = leadBrief
      if (env.GUIDE_LEAD_WEBHOOK_URL) {
        try {
          await fetch(env.GUIDE_LEAD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ type: 'lead_brief', leadBrief }),
          })
        } catch {
          /* mailto remains v1 */
        }
      }
    }

    return json(200, body)
  },
}

function cors(): Record<string, string> {
  return {
    'access-control-allow-origin': 'https://www.rutinhq.com',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  }
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...cors() },
  })
}
