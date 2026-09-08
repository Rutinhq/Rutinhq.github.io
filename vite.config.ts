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
      if (url !== '/api/guide') {
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
        const request = new Request('http://guide.local/api/guide', {
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
          }
          response = await mod.handleGuideRequest(request, env, kb)
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

async function degradeGuidePreview(request: Request, kb: unknown): Promise<Response> {
  const policy = (
    kb as {
      policy?: {
        calendlyUrl?: string
        fallbackReplies?: Record<string, { en: string; es: string }>
        pricingHints?: string[]
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
  const hay = (parsed.messages || []).map((m) => m.content).join('\n').toLowerCase()
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
  const isSecurity = securityHints.some((h) => hay.includes(h.toLowerCase()))
  const pricingHints = policy?.pricingHints || ['price', 'pricing', 'precio', 'cobro']
  const isPricing = pricingHints.some((h) => hay.includes(h.toLowerCase()))
  const pick = (key: string, fallback: { en: string; es: string }) => {
    const pack = policy?.fallbackReplies?.[key] || fallback
    return locale === 'es' ? pack.es : pack.en
  }
  let reply: string
  if (isSecurity) {
    reply = pick('security', {
      en: 'I cannot share credentials, passwords, API keys, bank details, or private operations. Book a 30-min fit call.',
      es: 'No comparto credenciales, contraseñas, claves de API, datos bancarios ni operaciones privadas. Agenda 30 min.',
    })
  } else if (isPricing) {
    reply = pick('pricing', {
      en: 'I do not quote prices in chat. Book a 30-min fit call.',
      es: 'No cito precios en el chat. Agenda 30 min.',
    })
  } else {
    reply = pick('degraded', {
      en: 'Book a 30-min fit call — https://calendly.com/rutinhq/30min',
      es: 'Agenda 30 min — https://calendly.com/rutinhq/30min',
    })
  }
  let leadBrief: unknown
  if (!isSecurity && (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(hay) || /book|price|hire|precio|agendar|cobro/i.test(hay))) {
    leadBrief = {
      topic: locale === 'es' ? 'Fit RutinHQ (SKU por confirmar)' : 'RutinHQ fit (SKU TBD)',
      questionsAsked: (parsed.messages || [])
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .slice(-6),
      objections: [],
      recommendedSku: 'unclear',
      nextStep:
        locale === 'es'
          ? 'Agendar 30 min de fit — https://calendly.com/rutinhq/30min'
          : 'Book 30-min fit call — https://calendly.com/rutinhq/30min',
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
