import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const policy = JSON.parse(
  fs.readFileSync(path.join(root, 'src/guide/policy.json'), 'utf8'),
)
const mirrorsDir = path.join(root, 'src/guide/mirrors')
const localesEn = JSON.parse(fs.readFileSync(path.join(root, 'src/locales/en.json'), 'utf8'))

const documents = []
const sources = []

function addDoc(id, url, title, text, source) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return
  documents.push({ id, url, title, text: clean.slice(0, 6000), source })
  sources.push({ url, ok: true, source })
}

for (const file of fs.readdirSync(mirrorsDir).filter((f) => f.endsWith('.md'))) {
  const text = fs.readFileSync(path.join(mirrorsDir, file), 'utf8')
  const id = file.replace(/\.md$/, '')
  const title = text.split('\n')[0]?.replace(/^#\s*/, '') || id
  const urlMatch = text.match(/https:\/\/(?:www|docs)\.rutinhq\.com\/[^\s)]+/)
  addDoc(id, urlMatch?.[0] || policy.allowlistUrls[0], title, text, 'mirror')
}

function localeSku(key, url, title) {
  const block = localesEn[key]
  if (!block) return
  const parts = [
    title,
    block.hero?.headline,
    block.hero?.subhead,
    block.who?.items?.join('; '),
    block.notFor?.items?.join('; '),
    block.how?.items?.join('; '),
    block.outcomes?.items?.join('; '),
    block.notWhat?.items?.join('; '),
  ].filter(Boolean)
  addDoc(`locale-${key}`, url, `${title} (site copy)`, parts.join('\n'), 'locale')
}

localeSku('gtm', 'https://www.rutinhq.com/gtm-os', 'GTM OS')
localeSku('store', 'https://www.rutinhq.com/store-os', 'STORE OS')
localeSku('nexus', 'https://www.rutinhq.com/nexus-os', 'NEXUS OS')
addDoc(
  'locale-hub',
  'https://www.rutinhq.com/',
  'RutinHQ hub (site copy)',
  [localesEn.hub?.headline, localesEn.hub?.subhead, localesEn.cards?.gtm?.thesis, localesEn.cards?.store?.thesis, localesEn.cards?.nexus?.thesis].filter(Boolean).join('\n'),
  'locale',
)

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function crawl(url) {
  try {
    const host = new URL(url).hostname
    if (!policy.allowlistHosts.includes(host)) {
      sources.push({ url, ok: false, source: 'crawl' })
      return
    }
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'user-agent': 'RutinHQ-GuideKB/1.0' },
    })
    if (!res.ok) {
      sources.push({ url, ok: false, source: 'crawl' })
      return
    }
    const text = htmlToText(await res.text())
    addDoc(`crawl-${host}${new URL(url).pathname}`, url, url, text, 'crawl')
  } catch {
    sources.push({ url, ok: false, source: 'crawl' })
  }
}

if (process.env.GUIDE_KB_SKIP_CRAWL !== '1') {
  await Promise.all(policy.allowlistUrls.map((url) => crawl(url)))
}

const out = {
  builtAt: new Date().toISOString(),
  documents,
  sources,
  policy,
}

const dest = path.join(root, 'public/guide-kb.json')
fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`)
console.log(`guide-kb: ${documents.length} documents → ${dest}`)
