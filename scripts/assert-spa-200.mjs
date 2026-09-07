import fs from 'node:fs'

if (fs.existsSync('dist/404.html')) {
  console.error(
    'dist/404.html must not ship — Cloudflare Pages would serve SPA routes as HTTP 404.',
  )
  process.exit(1)
}

for (const route of ['gtm-os', 'store-os', 'nexus-os']) {
  const folderPage = `dist/${route}/index.html`
  if (fs.existsSync(folderPage)) {
    console.error(
      `${folderPage} must not ship — folder assets make /${route} 308 instead of 200.`,
    )
    process.exit(1)
  }
}

if (!fs.existsSync('dist/_redirects')) {
  console.error(
    'dist/_redirects missing — SPA fallback `/* /index.html 200` is required.',
  )
  process.exit(1)
}

const redirects = fs.readFileSync('dist/_redirects', 'utf8')
if (!/\/\*\s+\/index\.html\s+200/.test(redirects)) {
  console.error('dist/_redirects must include `/* /index.html 200`.')
  process.exit(1)
}

console.log('SPA 200 fallback: no 404.html; _redirects present.')
