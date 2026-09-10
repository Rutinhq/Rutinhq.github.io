import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Connect, Plugin, ViteDevServer } from 'vite'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function guideApiPlugin(): Plugin {
  const attach = (
    server: ViteDevServer | { middlewares: Connect.Server; ssrLoadModule?: ViteDevServer['ssrLoadModule'] },
  ) => {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
      const url = req.url?.split('?')[0]
      if (url !== '/api/guide' && url !== '/api/guide/lead') {
        next()
        return
      }
      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ error: 'method_not_allowed' }))
        return
      }
      try {
        const body = await readBody(req)
        const request = new Request(`http://guide.local${url}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: body.length ? new Uint8Array(body) : undefined,
        })
        const kbPath = path.join(rootDir, 'public/guide-kb.json')
        const kb = fs.existsSync(kbPath)
          ? JSON.parse(fs.readFileSync(kbPath, 'utf8'))
          : null
        const env: Record<string, string | undefined> = {
          GUIDE_LLM_API_KEY: process.env.GUIDE_LLM_API_KEY,
          GUIDE_LLM_BASE_URL: process.env.GUIDE_LLM_BASE_URL,
          GUIDE_LLM_MODEL: process.env.GUIDE_LLM_MODEL,
          GUIDE_LEAD_WEBHOOK_URL: process.env.GUIDE_LEAD_WEBHOOK_URL,
        }
        let response: Response
        if (typeof server.ssrLoadModule === 'function') {
          const mod = (await server.ssrLoadModule('/src/guide/api.ts')) as {
            handleGuideRequest: (
              req: Request,
              env: Record<string, string | undefined>,
              kb: unknown,
            ) => Promise<Response>
            handleGuideLeadRequest: (
              req: Request,
              env: Record<string, string | undefined>,
            ) => Promise<Response>
          }
          response =
            url === '/api/guide/lead'
              ? await mod.handleGuideLeadRequest(request, env)
              : await mod.handleGuideRequest(request, env, kb)
        } else if (url === '/api/guide/lead') {
          response = new Response(JSON.stringify({ ok: true, delivered: false }), {
            status: 200,
            headers: { 'content-type': 'application/json; charset=utf-8' },
          })
        } else {
          response = await degradeGuidePreview(request, kb)
        }
        res.statusCode = response.status
        response.headers.forEach((value, key) => {
          res.setHeader(key, value)
        })
        res.end(Buffer.from(await response.arrayBuffer()))
      } catch (error) {
        console.error('[guide-api]', error)
        res.statusCode = 500
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ error: 'guide_failed' }))
      }
    })
  }

  return {
    name: 'guide-api',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

function lastUserContent(messages: { role: string; content: string }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content
  }
  return ''
}

function previewHintHit(text: string, hints: string[]): boolean {
  const hay = text.toLowerCase()
  return hints.some((hint) => hint && hay.includes(hint.toLowerCase()))
}

async function degradeGuidePreview(request: Request, kb: unknown): Promise<Response> {
  const policy = (
    kb as {
      policy?: {
        calendlyUrl?: string
        fallbackReplies?: Record<string, { en: string; es: string }>
        intentHints?: Record<string, string[]>
        pricingHints?: string[]
        bookingHints?: string[]
        securityHints?: string[]
      }
    } | null
  )?.policy
  let parsed: {
    messages?: { role: string; content: string }[]
    page?: string
    locale?: string
  } = {}
  try {
    parsed = (await request.json()) as typeof parsed
  } catch {
    /* empty */
  }
  const locale = parsed.locale === 'es' ? 'es' : 'en'
  const messages = parsed.messages || []
  const last = lastUserContent(messages)
  const users = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n')
  const hay = messages.map((m) => m.content).join('\n')
  const securityHints = policy?.securityHints || [
    'password',
    'api key',
    'apikey',
    'capo',
    'banorte',
    'faa',
    'notion',
    'contraseña',
  ]
  const bookingHints = policy?.bookingHints || [
    'cita',
    'agenda',
    'schedule',
    'calendly',
    'fit',
    'leads',
    'qué más',
    'que mas',
  ]
  const pricingHints = policy?.pricingHints || ['price', 'pricing', 'precio', 'cobro']
  const isSecurity = previewHintHit(last, securityHints)
  const isBooking = previewHintHit(last, bookingHints)
  const isPricing = !isBooking && previewHintHit(last, pricingHints)
  const skuKeys = ['gtm-os', 'store-os', 'nexus-os'] as const
  const ranked = skuKeys
    .map((key) => ({
      key,
      n: (policy?.intentHints?.[key] || []).filter((h) => users.toLowerCase().includes(h.toLowerCase()))
        .length,
    }))
    .sort((a, b) => b.n - a.n)
  const recommendedSku =
    ranked[0] && ranked[0].n > 0 && ranked[0].n !== ranked[1]?.n ? ranked[0].key : 'unclear'
  const pick = (key: string, fallback: { en: string; es: string }) => {
    const pack = policy?.fallbackReplies?.[key] || fallback
    return locale === 'es' ? pack.es : pack.en
  }
  const calendly = policy?.calendlyUrl || 'https://calendly.com/rutinhq/30min'
  let replyKey = 'degraded'
  if (isSecurity) replyKey = 'security'
  else if (isPricing) replyKey = 'pricing'
  else if (recommendedSku !== 'unclear') replyKey = recommendedSku
  else if (isBooking) replyKey = 'fit'
  let reply = pick(replyKey, {
    en: 'GTM OS, STORE OS, and NEXUS OS are the public catalog. Book 30 min — https://calendly.com/rutinhq/30min',
    es: 'GTM OS, STORE OS y NEXUS OS son el catálogo público. Agenda 30 min — https://calendly.com/rutinhq/30min',
  })
  if (!/calendly\.com\/rutinhq\/30min/i.test(reply)) {
    reply = `${reply.trim()} ${
      locale === 'es' ? `Siguiente paso: agenda 30 min — ${calendly}` : `Next step: book 30 min — ${calendly}`
    }`
  }
  let leadBrief: unknown
  if (!isSecurity && (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(hay) || isBooking || isPricing)) {
    leadBrief = {
      topic:
        recommendedSku === 'unclear'
          ? locale === 'es'
            ? 'Fit RutinHQ (SKU por confirmar)'
            : 'RutinHQ fit (SKU TBD)'
          : locale === 'es'
            ? `Fit ${recommendedSku}`
            : `${recommendedSku} fit`,
      questionsAsked: messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .slice(-6),
      objections: [],
      recommendedSku,
      nextStep:
        locale === 'es'
          ? `Agendar 30 min de fit — ${calendly}`
          : `Book 30-min fit call — ${calendly}`,
      transcriptExcerpt: hay.slice(0, 900),
      page: parsed.page || '/',
      locale,
    }
  }
  return new Response(
    JSON.stringify({
      reply,
      mode: 'degraded',
      calendlyUrl: policy?.calendlyUrl || 'https://calendly.com/rutinhq/30min',
      leadBrief,
    }),
    { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } },
  )
}

// Do not emit dist/404.html. On Cloudflare Pages a present 404.html
// serves missing paths (including valid SPA routes) with HTTP 404 even
// when the body is the SPA shell.
// Do not emit dist/<sku>/index.html either — that folder form makes
// Pages/wrangler 308 /gtm-os away from the pretty URL. Deep links use
// public/_redirects exact 200 rewrites + `/* /index.html 200`.

export default defineConfig({
  plugins: [react(), tailwindcss(), guideApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4321,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4321,
  },
})
