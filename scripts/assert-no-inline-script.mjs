import fs from 'node:fs'
import path from 'node:path'

const roots = ['dist/index.html', 'dist/404.html']
const prerenderDir = 'dist/prerender'
if (fs.existsSync(prerenderDir)) {
  for (const name of fs.readdirSync(prerenderDir)) {
    if (name.endsWith('.html')) roots.push(path.join(prerenderDir, name))
  }
}

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
const SRC_RE = /\bsrc\s*=/i
const LD_JSON_RE = /\btype\s*=\s*["']application\/ld\+json["']/i
const STREAM_RE = /\$RT\s*=|\$RB\s*=|\$RV\s*=/

const hits = []
for (const file of roots) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing — cannot check inline scripts.`)
    process.exit(1)
  }
  const html = fs.readFileSync(file, 'utf8')
  if (STREAM_RE.test(html)) {
    hits.push(`${file}: React streaming bootstrap ($RT/$RB/$RV)`)
  }
  for (const match of html.matchAll(SCRIPT_RE)) {
    const attrs = match[1] || ''
    if (SRC_RE.test(attrs) || LD_JSON_RE.test(attrs)) continue
    const snippet = match[0].slice(0, 120).replace(/\s+/g, ' ')
    hits.push(`${file}: executable inline <script> without src (${snippet})`)
  }
}

if (hits.length) {
  console.error('prerendered HTML must not emit executable inline scripts (CSP script-src has no unsafe-inline):')
  for (const hit of hits) console.error(`  ${hit}`)
  process.exit(1)
}

console.log(
  `no inline executable scripts: ${roots.length} HTML shells (JSON-LD allowed).`,
)
