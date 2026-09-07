import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Do not emit dist/404.html. On Cloudflare Pages a present 404.html
// serves missing paths (including valid SPA routes) with HTTP 404 even
// when the body is the SPA shell.
// Do not emit dist/<sku>/index.html either — that folder form makes
// Pages/wrangler 308 /gtm-os away from the pretty URL. Deep links use
// public/_redirects exact 200 rewrites + `/* /index.html 200`.

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
