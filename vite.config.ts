import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Connect, Plugin, ViteDevServer } from 'vite'
import { defineConfig } from 'vite'
import {
  classifyIntentWithPolicy,
  ensureCalendlyCta,
  recommendSkuWithPolicy,
  resolveFallbackKey,
  type ClassifyPolicy,
} from './src/guide/classify-core.ts'

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

async function degradeGuidePreview(request: Request, kb: unknown): Promise<Response> {
  const policy = (
    kb as {
      policy?: ClassifyPolicy & {
        calendlyUrl?: string
        fallbackReplies?: Record<string, { en: string; es: string }>
      }
    } | null
  )?.policy
  let parsed: {
    messages?: { role: 'user' | 'assistant'; content: string }[]
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
  const hay = messages.map((m) => m.content).join('\n')
  const classifyPolicy: ClassifyPolicy = {
    intentHints: policy?.intentHints || {},
    offTopicHints: policy?.offTopicHints || [],
    pricingHints: policy?.pricingHints || ['price', 'pricing', 'precio', 'cobro'],
    bookingHints: policy?.bookingHints,
    leadsHints: policy?.leadsHints,
    buyingIntentHints: policy?.buyingIntentHints,
    securityHints: policy?.securityHints || [
      'password',
      'api key',
      'apikey',
      'capo',
      'banorte',
      'faa',
      'notion',
      'contraseña',
    ],
  }
  const skuIntent = classifyIntentWithPolicy(messages, classifyPolicy)
  const recommendedSku = recommendSkuWithPolicy(messages, classifyPolicy)
  const replyKey = resolveFallbackKey(skuIntent, recommendedSku)
  const pick = (key: string, fallback: { en: string; es: string }) => {
    const pack = policy?.fallbackReplies?.[key] || fallback
    return locale === 'es' ? pack.es : pack.en
  }
  const calendly = policy?.calendlyUrl || 'https://calendly.com/rutinhq/30min'
  let reply = pick(replyKey, {
    en: 'GTM OS, STORE OS, and NEXUS OS are the public catalog. Book 30 min — https://calendly.com/rutinhq/30min',
    es: 'GTM OS, STORE OS y NEXUS OS son el catálogo público. Agenda 30 min — https://calendly.com/rutinhq/30min',
  })
  reply = ensureCalendlyCta(reply, locale, calendly)
  let leadBrief: unknown
  if (
    skuIntent !== 'security' &&
    (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(hay) ||
      skuIntent === 'fit' ||
      skuIntent === 'pricing' ||
      skuIntent === 'gtm-os')
  ) {
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

// Ship dist/404.html so Cloudflare Pages returns HTTP 404 for unknown
// paths. Safe because every valid pretty URL has an exact `_redirects`
// 200 rewrite — do NOT add `/* /index.html 200` (that is the soft-404).
// Do not emit dist/<sku>/index.html — that folder form makes
// Pages/wrangler 308 /gtm-os away from the pretty URL.

export default defineConfig({
  plugins: [react(), tailwindcss(), guideApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|i18next|react-i18next|@dr\.pogodin[\\/]react-helmet)/,
            },
            {
              name: 'page-hub',
              test: /src[\\/]pages[\\/]index\.tsx$/,
            },
            {
              name: 'page-gtm-os',
              test: /src[\\/]pages[\\/]gtm-os\.tsx$/,
            },
            {
              name: 'page-store-os',
              test: /src[\\/]pages[\\/]store-os\.tsx$/,
            },
            {
              name: 'page-nexus-os',
              test: /src[\\/]pages[\\/]nexus-os\.tsx$/,
            },
            {
              name: 'page-blog',
              test: /src[\\/]pages[\\/]blog\.tsx$/,
            },
            {
              name: 'page-blog-es',
              test: /src[\\/]pages[\\/]blog-es\.tsx$/,
            },
            {
              name: 'page-article-en',
              test: /src[\\/]pages[\\/]blog-icp-gated-cold-outbound\.tsx$/,
            },
            {
              name: 'page-article-es',
              test: /src[\\/]pages[\\/]blog-outbound-frio\.tsx$/,
            },
            {
              name: 'page-not-found',
              test: /src[\\/]pages[\\/]not-found\.tsx$/,
            },
          ],
        },
      },
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
