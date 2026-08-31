import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function virtualContentPlugin(): Plugin {
  const virtualId = 'virtual:content'
  const resolvedId = `\0${virtualId}`

  const readJson = (file: string) =>
    JSON.parse(
      fs.readFileSync(path.resolve(rootDir, 'src/content/pages', file), 'utf8'),
    )

  return {
    name: 'virtual-content',
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return
      const home = readJson('home.json')
      const services = readJson('services.json')
      const case_studies = readJson('case-studies.json')
      return [
        `export const home = ${JSON.stringify(home)};`,
        `export const services = ${JSON.stringify(services)};`,
        `export const case_studies = ${JSON.stringify(case_studies)};`,
      ].join('\n')
    },
    handleHotUpdate({ file, server }) {
      if (!file.includes(`${path.sep}content${path.sep}`)) return
      const mod = server.moduleGraph.getModuleById(resolvedId)
      if (mod) void server.reloadModule(mod)
    },
  }
}

function collectBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function leadCaptureDevPlugin(): Plugin {
  return {
    name: 'lead-capture-dev',
    configureServer(server) {
      server.middlewares.use(
        '/api/contact/lead-capture',
        async (req: IncomingMessage, res: ServerResponse, next) => {
          if (req.method !== 'POST') {
            next()
            return
          }
          try {
            const raw = await collectBody(req)
            const body = raw ? JSON.parse(raw) : {}
            const { handleLeadCapture } = await server.ssrLoadModule(
              '/src/server/api/contact/lead-capture/POST.ts',
            )
            await handleLeadCapture(
              { body } as { body: unknown },
              {
                status(code: number) {
                  res.statusCode = code
                  return this
                },
                json(payload: unknown) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(payload))
                },
              },
            )
          } catch (error) {
            server.config.logger.error(String(error))
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Lead capture failed' }))
          }
        },
      )
    },
  }
}

function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const dir = path.resolve(rootDir, 'dist')
      const index = path.join(dir, 'index.html')
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, path.join(dir, '404.html'))
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    virtualContentPlugin(),
    leadCaptureDevPlugin(),
    spaFallbackPlugin(),
  ],
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
