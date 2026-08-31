import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { handleLeadCapture } from './api/contact/lead-capture/POST.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT || 4321)

async function start() {
  const app = express()
  app.use(express.json())
  app.post('/api/contact/lead-capture', (req, res) => {
    void handleLeadCapture(req, {
      status(code) {
        res.status(code)
        return this
      },
      json(payload) {
        res.json(payload)
      },
    })
  })

  if (!isProd) {
    const { createServer } = await import('vite')
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })
    app.use(vite.middlewares)
    app.use(async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        next()
        return
      }
      try {
        const url = req.originalUrl
        const templatePath = path.resolve(__dirname, '../../index.html')
        let template = fs.readFileSync(templatePath, 'utf8')
        template = await vite.transformIndexHtml(url, template)
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
        const cookie = String(req.headers.cookie ?? '')
        const stored = cookie.match(/i18nextLng=([^;]+)/)?.[1]
        const accept = String(req.headers['accept-language'] ?? '')
        const lang = stored?.startsWith('es')
          ? 'es'
          : accept.startsWith('es')
            ? 'es'
            : 'en'
        const { html, head, htmlAttributes } = await render(url, lang)
        const page = template
          .replace('<html lang="en">', `<html lang="${lang}" ${htmlAttributes}>`)
          .replace('<!--ssr-head-->', head)
          .replace('<!--ssr-outlet-->', html)
        res.status(200).set({ 'Content-Type': 'text/html' }).end(page)
      } catch (error) {
        vite.ssrFixStacktrace(error as Error)
        next(error)
      }
    })
  } else {
    const clientDir = path.resolve(__dirname, '../../dist')
    app.use(express.static(clientDir))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RutinHQ at http://127.0.0.1:${PORT}`)
  })
}

void start()
