import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

const SKU_ROUTES = ['gtm-os', 'store-os', 'nexus-os'] as const

// Do not emit dist/404.html. On Cloudflare Pages a present 404.html
// serves missing paths (including valid SPA routes) with HTTP 404 even
// when the body is the SPA shell. Deep links use public/_redirects
// (`/* /index.html 200`) plus real `dist/<sku>/index.html` copies so
// /gtm-os /store-os /nexus-os are actual assets (HTTP 200).

function skuStaticPagesPlugin(): Plugin {
  return {
    name: 'sku-static-pages',
    closeBundle() {
      const dir = path.resolve(rootDir, 'dist')
      const index = path.join(dir, 'index.html')
      if (!fs.existsSync(index)) return
      for (const route of SKU_ROUTES) {
        const destDir = path.join(dir, route)
        fs.mkdirSync(destDir, { recursive: true })
        fs.copyFileSync(index, path.join(destDir, 'index.html'))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), skuStaticPagesPlugin()],
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
