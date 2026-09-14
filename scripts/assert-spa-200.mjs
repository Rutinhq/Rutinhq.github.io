import fs from 'node:fs'

function rootInner(html) {
  const match = html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/i)
  return match ? match[1] : ''
}

function assertRealBody(file, needles) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing — crawlers would get an empty SPA shell.`)
    process.exit(1)
  }
  const html = fs.readFileSync(file, 'utf8')
  const inner = rootInner(html)
  if (!inner.trim() || inner.includes('<!--ssr-outlet-->')) {
    console.error(
      `${file} #root must contain SSR marketing HTML, not <!--ssr-outlet-->.`,
    )
    process.exit(1)
  }
  for (const needle of needles) {
    if (!inner.includes(needle)) {
      console.error(`${file} #root must include existing copy: ${needle}`)
      process.exit(1)
    }
  }
}

if (!fs.existsSync('dist/404.html')) {
  console.error(
    'dist/404.html must ship — Cloudflare Pages serves it with HTTP 404 for unknown paths.',
  )
  process.exit(1)
}

for (const route of ['gtm-os', 'store-os', 'nexus-os', 'blog', 'es', 'agents']) {
  const folderPage = `dist/${route}/index.html`
  if (fs.existsSync(folderPage)) {
    console.error(
      `${folderPage} must not ship — folder assets make /${route} 308 instead of 200.`,
    )
    process.exit(1)
  }
  const htmlPage = `dist/${route}.html`
  if (fs.existsSync(htmlPage)) {
    console.error(
      `${htmlPage} must not ship — html-handling 308s pretty /${route}.`,
    )
    process.exit(1)
  }
}

if (fs.existsSync('dist/blog/icp-gated-cold-outbound-without-rented-sdr/index.html')) {
  console.error(
    'dist/blog/<slug>/index.html must not ship — pretty /blog/<slug> would 308.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/blog/shopify-admin-audit-before-ads/index.html')) {
  console.error(
    'dist/blog/<slug>/index.html must not ship — pretty /blog/<slug> would 308.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/es/blog/index.html')) {
  console.error(
    'dist/es/blog/index.html must not ship — pretty /es/blog would 308.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/agents/auth/index.html')) {
  console.error(
    'dist/agents/auth/index.html must not ship — pretty /agents/auth would 308.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/es/agents/index.html')) {
  console.error(
    'dist/es/agents/index.html must not ship — pretty /es/agents would 308.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/es/agents/auth/index.html')) {
  console.error(
    'dist/es/agents/auth/index.html must not ship — pretty /es/agents/auth would 308.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/blog.html')) {
  console.error(
    'dist/blog.html must not ship — html-handling 308s /blog.html → /blog and a /blog /blog.html rewrite self-loops.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/es/blog.html')) {
  console.error(
    'dist/es/blog.html must not ship — html-handling 308s /es/blog onto itself.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/es.html')) {
  console.error(
    'dist/es.html must not ship — html-handling 308s /es onto itself.',
  )
  process.exit(1)
}
if (fs.existsSync('dist/es/index.html')) {
  console.error(
    'dist/es/index.html must not ship — pretty /es would 308.',
  )
  process.exit(1)
}
for (const sku of ['gtm-os', 'store-os', 'nexus-os']) {
  if (fs.existsSync(`dist/es/${sku}/index.html`)) {
    console.error(
      `dist/es/${sku}/index.html must not ship — pretty /es/${sku} would 308.`,
    )
    process.exit(1)
  }
}

if (!fs.existsSync('dist/_redirects')) {
  console.error(
    'dist/_redirects missing — exact 200 rewrites for known routes are required.',
  )
  process.exit(1)
}

const redirects = fs.readFileSync('dist/_redirects', 'utf8')
if (/\/\*\s+\/index\.html\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must not include `/* /index.html 200` — that is the soft-404.',
  )
  process.exit(1)
}
if (/\/blog\s+\/blog\.html\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must not rewrite /blog to /blog.html — Pages 308 self-loop.',
  )
  process.exit(1)
}
if (/\/es\/blog\s+\/es\/blog\.html\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must not rewrite /es/blog to /es/blog.html — Pages 308 self-loop.',
  )
  process.exit(1)
}
if (/\/es\s+\/es\/blog\s+301/.test(redirects)) {
  console.error(
    'dist/_redirects must not 301 /es to /es/blog — /es is the Spanish hub.',
  )
  process.exit(1)
}
if (!/\/es\s+\/prerender\/es\s+200/.test(redirects)) {
  console.error('dist/_redirects must 200-rewrite /es to /prerender/es.')
  process.exit(1)
}
if (!/\/es\/\s+\/prerender\/es\s+200/.test(redirects)) {
  console.error('dist/_redirects must 200-rewrite /es/ to /prerender/es.')
  process.exit(1)
}
for (const sku of ['gtm-os', 'store-os', 'nexus-os']) {
  if (!new RegExp(`/${sku}\\s+/prerender/${sku}\\s+200`).test(redirects)) {
    console.error(`dist/_redirects must 200-rewrite /${sku} to /prerender/${sku}.`)
    process.exit(1)
  }
  if (
    !new RegExp(`/es/${sku}\\s+/prerender/es-${sku}\\s+200`).test(redirects)
  ) {
    console.error(
      `dist/_redirects must 200-rewrite /es/${sku} to /prerender/es-${sku}.`,
    )
    process.exit(1)
  }
}
if (!/\/blog\s+\/prerender\/blog\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must 200-rewrite /blog to /prerender/blog (extensionless).',
  )
  process.exit(1)
}
if (!/\/blog\/\s+\/prerender\/blog\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must 200-rewrite /blog/ to /prerender/blog.',
  )
  process.exit(1)
}
if (
  !/\/blog\/icp-gated-cold-outbound-without-rented-sdr\s+\/prerender\/blog-icp-gated-cold-outbound-without-rented-sdr\s+200/.test(
    redirects,
  )
) {
  console.error(
    'dist/_redirects must 200-rewrite Article01 to /prerender/<slug> (not .html).',
  )
  process.exit(1)
}
if (
  !/\/blog\/shopify-admin-audit-before-ads\s+\/prerender\/blog-shopify-admin-audit-before-ads\s+200/.test(
    redirects,
  )
) {
  console.error(
    'dist/_redirects must 200-rewrite Article02 to /prerender/<slug> (not .html).',
  )
  process.exit(1)
}
if (!/\/es\/blog\s+\/prerender\/es-blog\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must 200-rewrite /es/blog to /prerender/es-blog.',
  )
  process.exit(1)
}
if (!/\/es\/blog\/\s+\/prerender\/es-blog\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must 200-rewrite /es/blog/ to /prerender/es-blog.',
  )
  process.exit(1)
}
if (!/\/llms\.txt\s+\/llms\.txt\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must 200-rewrite /llms.txt onto itself so it cannot be served as HTML.',
  )
  process.exit(1)
}
if (!/\/llms-full\.txt\s+\/llms-full\.txt\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must 200-rewrite /llms-full.txt onto itself so it cannot be served as HTML.',
  )
  process.exit(1)
}
if (!/\/\.well-known\/api-catalog\s+\/\.well-known\/api-catalog\s+200/.test(redirects)) {
  console.error(
    'dist/_redirects must 200-rewrite /.well-known/api-catalog onto itself.',
  )
  process.exit(1)
}
if (!/\/auth\.md\s+\/auth\.md\s+200/.test(redirects)) {
  console.error('dist/_redirects must 200-rewrite /auth.md onto itself.')
  process.exit(1)
}
if (!/\/agents\.md\s+\/agents\.md\s+200/.test(redirects)) {
  console.error('dist/_redirects must 200-rewrite /agents.md onto itself.')
  process.exit(1)
}
for (const pair of [
  ['/agents', '/prerender/agents'],
  ['/agents/auth', '/prerender/agents-auth'],
  ['/es/agents', '/prerender/es-agents'],
  ['/es/agents/auth', '/prerender/es-agents-auth'],
]) {
  const [from, to] = pair
  const escaped = `${from.replaceAll('/', '\\/')}\\s+${to.replaceAll('/', '\\/')}\\s+200`
  if (!new RegExp(escaped).test(redirects)) {
    console.error(`dist/_redirects must 200-rewrite ${from} to ${to}.`)
    process.exit(1)
  }
}
for (const identity of [
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-48x48.png',
  '/favicon-192x192.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
]) {
  const escaped = identity.replaceAll('.', '\\.')
  if (!new RegExp(`${escaped}\\s+${escaped}\\s+200`).test(redirects)) {
    console.error(
      `dist/_redirects must 200-rewrite ${identity} onto itself so crawlers cannot receive SPA HTML.`,
    )
    process.exit(1)
  }
}

const sitemap = 'dist/sitemap.xml'
if (!fs.existsSync(sitemap)) {
  console.error(`${sitemap} missing — Google would receive SPA HTML at /sitemap.xml.`)
  process.exit(1)
}
const sitemapBody = fs.readFileSync(sitemap, 'utf8')
if (/<!doctype html|<html[\s>]/i.test(sitemapBody)) {
  console.error(`${sitemap} must be XML, not HTML.`)
  process.exit(1)
}
if (!sitemapBody.includes('<urlset') || !sitemapBody.includes('https://www.rutinhq.com/')) {
  console.error(`${sitemap} must be a urlset with www.rutinhq.com loc entries.`)
  process.exit(1)
}
if (!sitemapBody.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) {
  console.error(`${sitemap} must declare the xhtml namespace for hreflang links.`)
  process.exit(1)
}

const locs = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const expectedLocs = [
  'https://www.rutinhq.com/',
  'https://www.rutinhq.com/gtm-os',
  'https://www.rutinhq.com/store-os',
  'https://www.rutinhq.com/nexus-os',
  'https://www.rutinhq.com/es',
  'https://www.rutinhq.com/es/gtm-os',
  'https://www.rutinhq.com/es/store-os',
  'https://www.rutinhq.com/es/nexus-os',
  'https://www.rutinhq.com/agents',
  'https://www.rutinhq.com/agents/auth',
  'https://www.rutinhq.com/es/agents',
  'https://www.rutinhq.com/es/agents/auth',
]
if (
  (sitemapBody.match(/xhtml:link rel="alternate"/g) || []).length <
  expectedLocs.length * 3
) {
  console.error(
    `${sitemap} must emit xhtml:link hreflang (en + es + x-default) on every URL.`,
  )
  process.exit(1)
}
if (
  locs.length !== expectedLocs.length ||
  expectedLocs.some((url) => !locs.includes(url))
) {
  console.error(
    `${sitemap} must list exactly the 12 indexable www URLs (EN+ES hub + 3 SKUs + agents/auth). Blog is draft/noindex.`,
  )
  process.exit(1)
}
if (locs.some((url) => !url.startsWith('https://www.rutinhq.com'))) {
  console.error(`${sitemap} must stay www-only.`)
  process.exit(1)
}
const lastmods = [...sitemapBody.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(
  (m) => m[1],
)
if (lastmods.length !== expectedLocs.length) {
  console.error(`${sitemap} must include <lastmod> on every URL.`)
  process.exit(1)
}
if (lastmods.some((value) => !/^\d{4}-\d{2}-\d{2}$/.test(value))) {
  console.error(`${sitemap} lastmod values must be YYYY-MM-DD.`)
  process.exit(1)
}
if (/\/blog/.test(sitemapBody)) {
  console.error(`${sitemap} must omit blog URLs while the Sprint 2 hold is noindex.`)
  process.exit(1)
}
if (!sitemapBody.includes('<lastmod>2026-09-13</lastmod>')) {
  console.error(`${sitemap} must lastmod hub/OS after the FAQPage residual.`)
  process.exit(1)
}

const crawlHtml = [
  'dist/index.html',
  'dist/prerender/gtm-os.html',
  'dist/prerender/store-os.html',
  'dist/prerender/nexus-os.html',
  'dist/prerender/es.html',
  'dist/sitemap.xml',
]
for (const file of crawlHtml) {
  if (!fs.existsSync(file)) continue
  const body = fs.readFileSync(file, 'utf8')
  if (/http:\/\/(?:www\.)?rutinhq\.com/.test(body) || /https:\/\/rutinhq\.com/.test(body)) {
    console.error(`${file} must not emit apex or http:// rutinhq.com URLs.`)
    process.exit(1)
  }
}

if (fs.existsSync('dist/_headers')) {
  const headers = fs.readFileSync('dist/_headers', 'utf8')
  const active = headers
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .join('\n')
  if (!/\/llms\.txt[\s\S]*?Content-Type:\s*text\/plain/i.test(headers)) {
    console.error('dist/_headers must set text/plain on /llms.txt.')
    process.exit(1)
  }
  if (!/\/llms-full\.txt[\s\S]*?Content-Type:\s*text\/plain/i.test(headers)) {
    console.error('dist/_headers must set text/plain on /llms-full.txt.')
    process.exit(1)
  }
  const splat = active.match(/^\/\*[\s\S]*?(?=\n\/[^*\n]|\n#[^\n]*\n\/|$)/)
  const splatBlock = splat ? splat[0] : active
  if (/X-Robots-Tag:\s*noindex/i.test(splatBlock)) {
    console.error(
      'dist/_headers /* must not noindex published hub, OS, or agents (blog uses page robots meta).',
    )
    process.exit(1)
  }
  if (
    !/\/prerender\/\*[\s\S]*?X-Robots-Tag:\s*noindex,\s*nofollow/i.test(headers)
  ) {
    console.error(
      'dist/_headers must noindex /prerender/* (internal crawl shells only).',
    )
    process.exit(1)
  }
  if (
    !/\/guide-kb\.json[\s\S]*?X-Robots-Tag:\s*noindex,\s*nofollow/i.test(headers)
  ) {
    console.error('dist/_headers must noindex /guide-kb.json.')
    process.exit(1)
  }
  if (!/X-Content-Type-Options:\s*nosniff/i.test(headers)) {
    console.error('dist/_headers must set X-Content-Type-Options: nosniff.')
    process.exit(1)
  }
  if (!/Referrer-Policy:\s*strict-origin-when-cross-origin/i.test(headers)) {
    console.error(
      'dist/_headers must set Referrer-Policy: strict-origin-when-cross-origin.',
    )
    process.exit(1)
  }
  if (/Strict-Transport-Security/i.test(active)) {
    console.error('dist/_headers must not enable HSTS (still park).')
    process.exit(1)
  }
  if (!/\/\*[\s\S]*?Cache-Control:\s*public,\s*max-age=0/i.test(headers)) {
    console.error('dist/_headers must short-cache HTML (max-age=0).')
    process.exit(1)
  }
  if (
    !/\/assets\/\*[\s\S]*?Cache-Control:\s*public,\s*max-age=31536000,\s*immutable/i.test(
      headers,
    )
  ) {
    console.error('dist/_headers must long-cache hashed /assets/* as immutable.')
    process.exit(1)
  }
  if (
    !/Link:\s*<\/sitemap\.xml>;\s*rel="sitemap".*<\/llms\.txt>;\s*rel="describedby".*api-catalog.*<\/auth\.md>;\s*rel="describedby"/i.test(
      headers,
    )
  ) {
    console.error(
      'dist/_headers must keep RFC 8288 Link to sitemap + llms.txt + api-catalog + auth.md.',
    )
    process.exit(1)
  }
  if (
    !/\/\.well-known\/api-catalog[\s\S]*?Content-Type:\s*application\/linkset\+json/i.test(
      headers,
    )
  ) {
    console.error(
      'dist/_headers must set application/linkset+json on /.well-known/api-catalog.',
    )
    process.exit(1)
  }
  if (!/\/auth\.md[\s\S]*?Content-Type:\s*text\/markdown/i.test(headers)) {
    console.error('dist/_headers must set text/markdown on /auth.md.')
    process.exit(1)
  }
  if (!/\/agents\.md[\s\S]*?Content-Type:\s*text\/markdown/i.test(headers)) {
    console.error('dist/_headers must set text/markdown on /agents.md.')
    process.exit(1)
  }
  if (
    !/\/\*[\s\S]*?Content-Signal:\s*search=yes,\s*ai-train=no,\s*use=reference/i.test(
      headers,
    )
  ) {
    console.error(
      'dist/_headers must set Content-Signal search=yes, ai-train=no, use=reference on /*.',
    )
    process.exit(1)
  }
  if (!/\/favicon-48x48\.png[\s\S]*?Content-Type:\s*image\/png/i.test(headers)) {
    console.error('dist/_headers must set image/png on /favicon-48x48.png.')
    process.exit(1)
  }
  if (!/\/favicon-192x192\.png[\s\S]*?Content-Type:\s*image\/png/i.test(headers)) {
    console.error('dist/_headers must set image/png on /favicon-192x192.png.')
    process.exit(1)
  }
  if (
    !/\/site\.webmanifest[\s\S]*?Content-Type:\s*application\/manifest\+json/i.test(
      headers,
    )
  ) {
    console.error(
      'dist/_headers must set application/manifest+json on /site.webmanifest.',
    )
    process.exit(1)
  }
}

const blogSource = 'src/lib/blog.ts'
if (!fs.existsSync(blogSource)) {
  console.error(`${blogSource} missing — published blog flags cannot be checked.`)
  process.exit(1)
}
const blogFlags = fs.readFileSync(blogSource, 'utf8')
if (
  /draft:\s*false/.test(blogFlags) ||
  /noindex:\s*false/.test(blogFlags) ||
  !blogFlags.includes("BLOG_ROBOTS = 'noindex, follow'")
) {
  console.error(
    `${blogSource} must hold the blog as draft:true / noindex:true with BLOG_ROBOTS noindex, follow.`,
  )
  process.exit(1)
}

const homepageTitle = 'RutinHQ — systems you own'
const blogShell = 'dist/prerender/blog.html'
const articleShell =
  'dist/prerender/blog-icp-gated-cold-outbound-without-rented-sdr.html'
if (!fs.existsSync(blogShell)) {
  console.error(`${blogShell} missing — crawlers would get the homepage SPA shell at /blog.`)
  process.exit(1)
}
if (!fs.existsSync(articleShell)) {
  console.error(
    `${articleShell} missing — crawlers would get the homepage SPA shell at Article01.`,
  )
  process.exit(1)
}

const blogHtml = fs.readFileSync(blogShell, 'utf8')
const articleHtml = fs.readFileSync(articleShell, 'utf8')
const articleTitle = 'RutinHQ — ICP-gated cold outbound without a rented SDR'
const blogTitle = 'Blog — systems you own'

if (!blogHtml.includes(`<title>${blogTitle}</title>`)) {
  console.error(`${blogShell} must ship unique <title>${blogTitle}</title>.`)
  process.exit(1)
}
if (blogHtml.includes(`<title>${homepageTitle}</title>`)) {
  console.error(`${blogShell} must not keep the homepage <title>.`)
  process.exit(1)
}
if (!blogHtml.includes('rel="canonical" href="https://www.rutinhq.com/blog"')) {
  console.error(`${blogShell} must canonical https://www.rutinhq.com/blog.`)
  process.exit(1)
}

if (!articleHtml.includes(`<title>${articleTitle}</title>`)) {
  console.error(`${articleShell} must ship unique <title>${articleTitle}</title>.`)
  process.exit(1)
}
if (articleHtml.includes(`<title>${homepageTitle}</title>`)) {
  console.error(`${articleShell} must not keep the homepage <title>.`)
  process.exit(1)
}
if (
  !articleHtml.includes(
    'rel="canonical" href="https://www.rutinhq.com/blog/icp-gated-cold-outbound-without-rented-sdr"',
  )
) {
  console.error(`${articleShell} must canonical the Article01 www URL.`)
  process.exit(1)
}
if (!articleHtml.includes('property="og:title" content="' + articleTitle + '"')) {
  console.error(`${articleShell} must ship unique og:title for Article01.`)
  process.exit(1)
}
if (!/name="robots"\s+content="noindex, follow"/.test(articleHtml)) {
  console.error(`${articleShell} must robots noindex, follow until publish GO.`)
  process.exit(1)
}
if (!/name="robots"\s+content="noindex, follow"/.test(blogHtml)) {
  console.error(`${blogShell} must robots noindex, follow until publish GO.`)
  process.exit(1)
}
if (
  !articleHtml.includes(
    'hreflang="es" href="https://www.rutinhq.com/es/blog/outbound-frio-con-icp-sin-sdr-rentado"',
  )
) {
  console.error(`${articleShell} must hreflang to the ES Article01 URL.`)
  process.exit(1)
}

const esBlogShell = 'dist/prerender/es-blog.html'
const esArticleShell =
  'dist/prerender/es-blog-outbound-frio-con-icp-sin-sdr-rentado.html'
if (!fs.existsSync(esBlogShell) || !fs.existsSync(esArticleShell)) {
  console.error('ES blog prerender shells missing.')
  process.exit(1)
}
const esBlogHtml = fs.readFileSync(esBlogShell, 'utf8')
const esBlogTitle = 'Blog — sistemas que posees'
if (!esBlogHtml.includes(`<title>${esBlogTitle}</title>`)) {
  console.error(`${esBlogShell} must ship unique ES index <title>.`)
  process.exit(1)
}
if (esBlogHtml.includes(`<title>${homepageTitle}</title>`)) {
  console.error(`${esBlogShell} must not keep the homepage <title>.`)
  process.exit(1)
}
if (!esBlogHtml.includes('rel="canonical" href="https://www.rutinhq.com/es/blog"')) {
  console.error(`${esBlogShell} must canonical https://www.rutinhq.com/es/blog.`)
  process.exit(1)
}
if (!/name="robots"\s+content="noindex, follow"/.test(esBlogHtml)) {
  console.error(`${esBlogShell} must robots noindex, follow until publish GO.`)
  process.exit(1)
}
const esArticleHtml = fs.readFileSync(esArticleShell, 'utf8')
const esArticleTitle = 'RutinHQ — Outbound frío con ICP — sin SDR rentado'
if (!esArticleHtml.includes(`<title>${esArticleTitle}</title>`)) {
  console.error(`${esArticleShell} must ship unique ES Article01 <title>.`)
  process.exit(1)
}
if (esArticleHtml.includes(`<title>${homepageTitle}</title>`)) {
  console.error(`${esArticleShell} must not keep the homepage <title>.`)
  process.exit(1)
}

const esMarketing = [
  {
    file: 'dist/prerender/es.html',
    path: '/es',
    title: 'RutinHQ — sistemas que posees',
    description:
      'Tres sistemas operativos instalables. Elige el cuello de botella. Una página, un SKU.',
  },
  {
    file: 'dist/prerender/es-gtm-os.html',
    path: '/es/gtm-os',
    title: 'RutinHQ — GTM OS — outbound que se queda contigo',
    description:
      'Outbound que se queda contigo. Un sistema de prospección B2B en frío instalado en tu equipo.',
  },
  {
    file: 'dist/prerender/es-store-os.html',
    path: '/es/store-os',
    title: 'RutinHQ — STORE OS — la tienda convierte antes de los ads',
    description:
      'Haz que la tienda convierta antes de comprar ads. Auditoría y config replicable del Admin de Shopify.',
  },
  {
    file: 'dist/prerender/es-nexus-os.html',
    path: '/es/nexus-os',
    title: 'RutinHQ — NEXUS OS — marketing agéntico en papel primero',
    description:
      'Marketing agéntico — primero en papel, Ads solo con GO. Estrategia → Social → Ads.',
  },
]

const esTitles = new Set()
for (const route of esMarketing) {
  if (!fs.existsSync(route.file)) {
    console.error(`${route.file} missing — crawlers would get the EN homepage shell at ${route.path}.`)
    process.exit(1)
  }
  const html = fs.readFileSync(route.file, 'utf8')
  if (!html.includes(`<title>${route.title}</title>`)) {
    console.error(`${route.file} must ship unique <title>${route.title}</title>.`)
    process.exit(1)
  }
  if (html.includes(`<title>${homepageTitle}</title>`)) {
    console.error(`${route.file} must not keep the homepage <title>.`)
    process.exit(1)
  }
  if (
    !html.includes(
      `rel="canonical" href="https://www.rutinhq.com${route.path}"`,
    )
  ) {
    console.error(`${route.file} must canonical https://www.rutinhq.com${route.path}.`)
    process.exit(1)
  }
  if (!html.includes(`content="${route.description}"`)) {
    console.error(`${route.file} must ship unique ES description.`)
    process.exit(1)
  }
  if (!html.includes('property="og:locale" content="es_MX"')) {
    console.error(`${route.file} must set og:locale es_MX.`)
    process.exit(1)
  }
  if (!html.includes('<html lang="es">')) {
    console.error(`${route.file} must set <html lang="es">.`)
    process.exit(1)
  }
  esTitles.add(route.title)
}
if (esTitles.size !== esMarketing.length) {
  console.error('ES hub + LP prerender titles must be unique from each other.')
  process.exit(1)
}

const enJson = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'))
const esJson = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'))

function keyTree(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((_, index) => keyTree(value[index], `${prefix}[${index}]`))
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).flatMap((key) =>
      keyTree(value[key], prefix ? `${prefix}.${key}` : key),
    )
  }
  return [prefix]
}

function lookup(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

const enKeys = keyTree(enJson).sort()
const esKeys = keyTree(esJson).sort()
if (enKeys.join('|') !== esKeys.join('|')) {
  console.error('src/locales/es.json must have the same key tree as en.json.')
  process.exit(1)
}

const mustDiffer = [
  'common.ctaPrimary',
  'common.ctaPrimaryShort',
  'common.ctaDocs',
  'hub.eyebrow',
  'hub.headline',
  'hub.subhead',
  'gtm.hero.headline',
  'gtm.hero.subhead',
  'store.hero.headline',
  'store.hero.subhead',
  'nexus.hero.headline',
  'nexus.hero.subhead',
  'cards.gtm.thesis',
  'cards.gtm.cta',
  'cards.store.thesis',
  'cards.store.cta',
  'cards.nexus.thesis',
  'cards.nexus.cta',
  'seo.hubTitle',
  'seo.hubDescription',
  'seo.gtmTitle',
  'seo.gtmDescription',
  'seo.storeTitle',
  'seo.storeDescription',
  'seo.nexusTitle',
  'seo.nexusDescription',
  'hub.faq.title',
  'gtm.faq.title',
  'store.faq.title',
  'nexus.faq.title',
  'common.skipToContent',
  'common.agents',
  'seo.agentsTitle',
  'seo.agentsDescription',
  'seo.agentsAuthTitle',
  'agents.headline',
  'agentsAuth.headline',
]
for (const key of mustDiffer) {
  if (lookup(enJson, key) === lookup(esJson, key)) {
    console.error(`${key} must not fall back to the English marketing string on ES.`)
    process.exit(1)
  }
}

const linksSource = fs.readFileSync('src/lib/links.ts', 'utf8')
if (!linksSource.includes('https://calendly.com/rutinhq/30min')) {
  console.error('Primary scheduling URL must be https://calendly.com/rutinhq/30min.')
  process.exit(1)
}
const headerSource = fs.readFileSync('src/layouts/parts/Header.tsx', 'utf8')
const ctasSource = fs.readFileSync('src/components/Ctas.tsx', 'utf8')
const footerSource = fs.readFileSync('src/layouts/parts/Footer.tsx', 'utf8')
for (const [name, source] of [
  ['Header', headerSource],
  ['Footer', footerSource],
  ['Ctas', ctasSource],
]) {
  if (!source.includes('CALENDLY_URL')) {
    console.error(`${name} primary Talk CTA must use CALENDLY_URL.`)
    process.exit(1)
  }
}
if (headerSource.includes('MAILTO_HUB') || ctasSource.includes('mailto={')) {
  console.error('Header/Ctas must not use mailto as the primary Talk button.')
  process.exit(1)
}
if (!footerSource.includes('MAILTO_EMAIL')) {
  console.error('Footer email line must use MAILTO_EMAIL.')
  process.exit(1)
}

const robots = 'dist/robots.txt'
if (!fs.existsSync(robots)) {
  console.error(`${robots} missing — deploy would fall back to SPA HTML at /robots.txt.`)
  process.exit(1)
}
const robotsBody = fs.readFileSync(robots, 'utf8')
if (/<!doctype html|<html[\s>]/i.test(robotsBody)) {
  console.error(`${robots} must be text, not HTML.`)
  process.exit(1)
}
if (!robotsBody.includes('Sitemap: https://www.rutinhq.com/sitemap.xml')) {
  console.error(`${robots} must include the www sitemap line.`)
  process.exit(1)
}
if (!robotsBody.includes('Disallow: /prerender/')) {
  console.error(`${robots} must Disallow /prerender/ (internal crawl shells).`)
  process.exit(1)
}
if (!robotsBody.includes('Disallow: /guide-kb.json')) {
  console.error(`${robots} must Disallow /guide-kb.json.`)
  process.exit(1)
}
if (!robotsBody.includes('Content-Signal: search=yes,ai-train=no,use=reference')) {
  console.error(`${robots} must keep Content-Signal search=yes,ai-train=no,use=reference.`)
  process.exit(1)
}
for (const bot of ['GPTBot', 'ClaudeBot', 'Google-Extended']) {
  if (!new RegExp(`User-agent:\\s*${bot}\\s*Allow:\\s*/`, 'i').test(robotsBody)) {
    console.error(`${robots} must Allow: / for ${bot} (AI Crawl Allow).`)
    process.exit(1)
  }
  if (new RegExp(`User-agent:\\s*${bot}\\s*Disallow:\\s*/\\s*$`, 'im').test(robotsBody)) {
    console.error(`${robots} must not Disallow: / for ${bot}.`)
    process.exit(1)
  }
}

const htmlShell = /<!doctype html|<html[\s>]/i
const forbiddenLlms = /fzf\.dev|fuzzyflags|\bfzf\b|\bcapo\b|\$\d[\d,]*/i
const llmsRequired = [
  'https://www.rutinhq.com/',
  'https://www.rutinhq.com/gtm-os',
  'https://www.rutinhq.com/store-os',
  'https://www.rutinhq.com/nexus-os',
  'https://www.rutinhq.com/blog',
  'https://www.rutinhq.com/blog/icp-gated-cold-outbound-without-rented-sdr',
  'https://www.rutinhq.com/blog/shopify-admin-audit-before-ads',
  'https://docs.rutinhq.com/catalog/',
  'strategy@rutinhq.com',
  'https://calendly.com/rutinhq/30min',
  'https://www.rutinhq.com/agents',
  'https://www.rutinhq.com/agents.md',
  'https://www.rutinhq.com/auth.md',
  'https://www.rutinhq.com/.well-known/api-catalog',
]
const llmsFullRequired = [
  ...llmsRequired,
  'https://www.rutinhq.com/es/blog',
  'https://www.rutinhq.com/es/blog/outbound-frio-con-icp-sin-sdr-rentado',
  'https://docs.rutinhq.com/catalog/gtm-os/',
  'https://docs.rutinhq.com/catalog/store-os/',
  'https://docs.rutinhq.com/catalog/nexus-os/',
  'https://www.rutinhq.com/llms.txt',
  'https://www.rutinhq.com/agents/auth',
]

for (const spec of [
  {
    file: 'dist/llms.txt',
    required: [...llmsRequired, 'https://www.rutinhq.com/llms-full.txt'],
  },
  { file: 'dist/llms-full.txt', required: llmsFullRequired },
]) {
  if (!fs.existsSync(spec.file)) {
    console.error(
      `${spec.file} missing — deploy would fall back to SPA HTML at that path.`,
    )
    process.exit(1)
  }
  const body = fs.readFileSync(spec.file, 'utf8')
  if (htmlShell.test(body)) {
    console.error(`${spec.file} must be plain text, not HTML.`)
    process.exit(1)
  }
  if (forbiddenLlms.test(body)) {
    console.error(
      `${spec.file} must not invent prices or mention fzf / FuzzyFlags / Capo.`,
    )
    process.exit(1)
  }
  for (const needle of spec.required) {
    if (!body.includes(needle)) {
      console.error(`${spec.file} must include ${needle}.`)
      process.exit(1)
    }
  }
}

const skuShells = [
  {
    file: 'dist/prerender/gtm-os.html',
    title: 'RutinHQ — GTM OS',
    canonical: 'https://www.rutinhq.com/gtm-os',
  },
  {
    file: 'dist/prerender/store-os.html',
    title: 'RutinHQ — STORE OS',
    canonical: 'https://www.rutinhq.com/store-os',
  },
  {
    file: 'dist/prerender/nexus-os.html',
    title: 'RutinHQ — NEXUS OS',
    canonical: 'https://www.rutinhq.com/nexus-os',
  },
  {
    file: 'dist/prerender/es.html',
    title: 'RutinHQ — sistemas que posees',
    canonical: 'https://www.rutinhq.com/es',
  },
  {
    file: 'dist/prerender/es-gtm-os.html',
    title: 'RutinHQ — GTM OS — outbound que se queda contigo',
    canonical: 'https://www.rutinhq.com/es/gtm-os',
  },
  {
    file: 'dist/prerender/es-store-os.html',
    title: 'RutinHQ — STORE OS — la tienda convierte antes de los ads',
    canonical: 'https://www.rutinhq.com/es/store-os',
  },
  {
    file: 'dist/prerender/es-nexus-os.html',
    title: 'RutinHQ — NEXUS OS — marketing agéntico en papel primero',
    canonical: 'https://www.rutinhq.com/es/nexus-os',
  },
]

for (const shell of skuShells) {
  if (!fs.existsSync(shell.file)) {
    console.error(`${shell.file} missing — crawlers would get the homepage SPA shell.`)
    process.exit(1)
  }
  const html = fs.readFileSync(shell.file, 'utf8')
  if (!html.includes(`<title>${shell.title}</title>`)) {
    console.error(`${shell.file} must ship unique <title>${shell.title}</title>.`)
    process.exit(1)
  }
  if (html.includes(`<title>${homepageTitle}</title>`)) {
    console.error(`${shell.file} must not keep the homepage <title>.`)
    process.exit(1)
  }
  if (!html.includes(`rel="canonical" href="${shell.canonical}"`)) {
    console.error(`${shell.file} must canonical ${shell.canonical}.`)
    process.exit(1)
  }
  if (!html.includes(`property="og:title" content="${shell.title}"`)) {
    console.error(`${shell.file} must ship unique og:title.`)
    process.exit(1)
  }
  if (!html.includes(`property="og:url" content="${shell.canonical}"`)) {
    console.error(`${shell.file} must ship unique og:url.`)
    process.exit(1)
  }
}

const homepage = fs.readFileSync('dist/index.html', 'utf8')
if (!homepage.includes(`<title>${homepageTitle}</title>`)) {
  console.error('dist/index.html must keep the hub <title>.')
  process.exit(1)
}
if (!homepage.includes('rel="canonical" href="https://www.rutinhq.com/"')) {
  console.error('dist/index.html must canonical the hub.')
  process.exit(1)
}
if (!homepage.includes('"@type":"Organization"') || !homepage.includes('strategy@rutinhq.com')) {
  console.error('dist/index.html must emit Organization JSON-LD with strategy@rutinhq.com.')
  process.exit(1)
}
if (
  !homepage.includes('"@type":"ImageObject"') ||
  !homepage.includes(`${'https://www.rutinhq.com'}/apple-touch-icon.png`)
) {
  console.error(
    'dist/index.html Organization.logo must be the HQ PNG ImageObject, not SVG.',
  )
  process.exit(1)
}
if (/"logo":"https:\/\/www\.rutinhq\.com\/airo-assets/.test(homepage)) {
  console.error('dist/index.html Organization.logo must not be the wordmark SVG.')
  process.exit(1)
}
if (!homepage.includes('"@type":"ContactPoint"')) {
  console.error('dist/index.html Organization must emit ContactPoint.')
  process.exit(1)
}
if (!homepage.includes('GTM OS') || !homepage.includes('STORE OS') || !homepage.includes('NEXUS OS')) {
  console.error('dist/index.html JSON-LD must name the three OS landings.')
  process.exit(1)
}

const favicon = 'dist/favicon.ico'
if (!fs.existsSync(favicon)) {
  console.error(`${favicon} missing — crawlers would receive SPA HTML at /favicon.ico.`)
  process.exit(1)
}
const ico = fs.readFileSync(favicon)
if (ico.includes(Buffer.from('<html')) || ico.includes(Buffer.from('<!doctype'))) {
  console.error(`${favicon} must be an icon, not HTML.`)
  process.exit(1)
}
if (ico[0] !== 0 || ico[1] !== 0 || ico[2] !== 1 || ico[3] !== 0) {
  console.error(`${favicon} must be a Windows ICO (16/32/48).`)
  process.exit(1)
}
if (ico[4] < 3) {
  console.error(`${favicon} must contain at least 16/32/48 sizes.`)
  process.exit(1)
}

function assertPngSize(file, width, height) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing — Google SERP needs a square PNG raster icon.`)
    process.exit(1)
  }
  const buf = fs.readFileSync(file)
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    console.error(`${file} must be a PNG, not HTML.`)
    process.exit(1)
  }
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  if (w !== width || h !== height) {
    console.error(`${file} must be ${width}×${height} (got ${w}×${h}).`)
    process.exit(1)
  }
}

assertPngSize('dist/favicon-48x48.png', 48, 48)
assertPngSize('dist/favicon-192x192.png', 192, 192)

const manifestPath = 'dist/site.webmanifest'
if (!fs.existsSync(manifestPath)) {
  console.error(`${manifestPath} missing — Google/PWA icon discovery 404s without it.`)
  process.exit(1)
}
let manifest
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
} catch {
  console.error(`${manifestPath} must be valid JSON.`)
  process.exit(1)
}
const manifestIcons = Array.isArray(manifest.icons) ? manifest.icons : []
for (const icon of [
  { src: '/favicon-48x48.png', sizes: '48x48' },
  { src: '/favicon-192x192.png', sizes: '192x192' },
]) {
  if (
    !manifestIcons.some(
      (entry) => entry.src === icon.src && entry.sizes === icon.sizes && entry.type === 'image/png',
    )
  ) {
    console.error(
      `${manifestPath} must list ${icon.src} as a ${icon.sizes} PNG icon.`,
    )
    process.exit(1)
  }
}

const seoSource = fs.readFileSync('src/components/Seo.tsx', 'utf8')
const png48Href = 'https://www.rutinhq.com/favicon-48x48.png'
const png192Href = 'https://www.rutinhq.com/favicon-192x192.png'
const svgHref = 'https://www.rutinhq.com/favicon.svg'
if (!seoSource.includes('favicon-48x48.png') || !seoSource.includes('favicon-192x192.png')) {
  console.error('src/components/Seo.tsx must link PNG 48 and 192 HQ icons.')
  process.exit(1)
}
if (seoSource.indexOf('favicon-48x48.png') > seoSource.indexOf('image/svg+xml')) {
  console.error('src/components/Seo.tsx must link PNG before SVG for Google SERP.')
  process.exit(1)
}

function assertGoogleFaviconLinks(file) {
  const html = fs.readFileSync(file, 'utf8')
  for (const needle of [
    `type="image/png" sizes="48x48" href="${png48Href}"`,
    `type="image/png" sizes="192x192" href="${png192Href}"`,
    `href="https://www.rutinhq.com/favicon.ico"`,
    `type="image/svg+xml" href="${svgHref}"`,
    `rel="apple-touch-icon" href="https://www.rutinhq.com/apple-touch-icon.png"`,
    `rel="manifest" href="https://www.rutinhq.com/site.webmanifest"`,
  ]) {
    if (!html.includes(needle)) {
      console.error(`${file} must include Google-friendly icon link: ${needle}`)
      process.exit(1)
    }
  }
  if (html.indexOf(png48Href) > html.indexOf(svgHref)) {
    console.error(`${file} must link PNG 48×48 before SVG so Google can pick a raster icon.`)
    process.exit(1)
  }
}

assertGoogleFaviconLinks('dist/index.html')
assertGoogleFaviconLinks('index.html')

const appSource = fs.readFileSync('src/App.tsx', 'utf8')
for (const route of [
  '/es',
  '/es/gtm-os',
  '/es/store-os',
  '/es/nexus-os',
  '/agents',
  '/es/agents',
  '/agents/auth',
  '/es/agents/auth',
]) {
  if (!appSource.includes(`path="${route}"`)) {
    console.error(`src/App.tsx must route ${route} for the EN/ES toggle.`)
    process.exit(1)
  }
}

const mailto = fs.readFileSync('src/lib/links.ts', 'utf8')
if (!mailto.includes("mailto('STORE OS — fit call')")) {
  console.error('src/lib/links.ts must use STORE OS — fit call.')
  process.exit(1)
}

if (footerSource.includes('ONE_PAGER_URL') || /\bDOCS_URL\b/.test(footerSource)) {
  console.error('Footer must drop standalone Docs and One-pager.')
  process.exit(1)
}
if (
  !footerSource.includes('DOCS_CATALOG_URL') ||
  !footerSource.includes("localized('/blog')") ||
  !footerSource.includes("localized('/agents')") ||
  !footerSource.includes('CALENDLY_URL') ||
  !footerSource.includes('MAILTO_EMAIL')
) {
  console.error(
    'Footer must keep Catalog (docs), locale Blog, Agents, Calendly Talk, and mailto email.',
  )
  process.exit(1)
}

const bodyRoutes = [
  {
    file: 'dist/index.html',
    needles: [
      'Systems you own — not retainers that vanish.',
      'GTM OS',
      'STORE OS',
      'NEXUS OS',
      'What does RutinHQ install?',
    ],
  },
  {
    file: 'dist/prerender/gtm-os.html',
    needles: ['Outbound that stays yours.', 'What is GTM OS?'],
  },
  {
    file: 'dist/prerender/store-os.html',
    needles: ['Make the store convert before you buy ads.', 'What is STORE OS?'],
  },
  {
    file: 'dist/prerender/nexus-os.html',
    needles: [
      'Agentic marketing — paper first, Ads only when signed.',
      'What is NEXUS OS?',
    ],
  },
  {
    file: 'dist/prerender/es.html',
    needles: [
      'Sistemas que posees — no retainers que desaparecen.',
      '¿Qué instala RutinHQ?',
    ],
  },
  {
    file: 'dist/prerender/es-gtm-os.html',
    needles: ['Outbound que se queda contigo.', '¿Qué es GTM OS?'],
  },
  {
    file: 'dist/prerender/es-store-os.html',
    needles: [
      'Haz que la tienda convierta antes de comprar ads.',
      '¿Qué es STORE OS?',
    ],
  },
  {
    file: 'dist/prerender/es-nexus-os.html',
    needles: [
      'Marketing agéntico — primero en papel, Ads solo con GO.',
      '¿Qué es NEXUS OS?',
    ],
  },
  {
    file: 'dist/prerender/blog.html',
    needles: ['Systems you own — filtered for founders who install, not rent'],
  },
  {
    file: 'dist/prerender/blog-icp-gated-cold-outbound-without-rented-sdr.html',
    needles: ['ICP-gated cold outbound without a rented SDR'],
  },
  {
    file: 'dist/prerender/blog-shopify-admin-audit-before-ads.html',
    needles: [
      'Shopify Admin audit before you buy ads',
      'DRAFT',
      'strategy@rutinhq.com',
      'calendly.com/rutinhq/30min',
    ],
  },
  {
    file: 'dist/prerender/es-blog.html',
    needles: ['Sistemas que posees — filtrados para founders que instalan, no rentan'],
  },
  {
    file: 'dist/prerender/es-blog-outbound-frio-con-icp-sin-sdr-rentado.html',
    needles: ['Outbound frío con ICP — sin SDR rentado'],
  },
  {
    file: 'dist/404.html',
    needles: ['Page not found', 'That route does not exist.'],
  },
  {
    file: 'dist/prerender/agents.html',
    needles: [
      'Public surfaces agents can read.',
      'docs.rutinhq.com/catalog',
      'strategy@rutinhq.com',
    ],
  },
  {
    file: 'dist/prerender/agents-auth.html',
    needles: ['Public vs authenticated.', '/auth.md'],
  },
  {
    file: 'dist/prerender/es-agents.html',
    needles: ['Superficies públicas que un agente puede leer.'],
  },
  {
    file: 'dist/prerender/es-agents-auth.html',
    needles: ['Público vs autenticado.'],
  },
]

for (const route of bodyRoutes) {
  assertRealBody(route.file, route.needles)
}

const notFoundHtml = fs.readFileSync('dist/404.html', 'utf8')
if (!/name="robots"\s+content="noindex, nofollow"/.test(notFoundHtml)) {
  console.error('dist/404.html must robots noindex, nofollow.')
  process.exit(1)
}
if (notFoundHtml.includes('<!--ssr-outlet-->')) {
  console.error('dist/404.html must not keep the empty ssr-outlet.')
  process.exit(1)
}

const MONOLITH_BYTES = 400_000
const assetJs = fs
  .readdirSync('dist/assets')
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({
    name,
    size: fs.statSync(`dist/assets/${name}`).size,
  }))
  .sort((a, b) => b.size - a.size)

if (assetJs.length < 4) {
  console.error(
    `dist/assets must ship route-level JS chunks (found ${assetJs.length}: ${assetJs
      .map((f) => f.name)
      .join(', ')}).`,
  )
  process.exit(1)
}

const assetNames = assetJs.map((f) => f.name).join(' ')
for (const needle of [
  'page-hub',
  'page-gtm-os',
  'page-store-os',
  'page-nexus-os',
  'page-blog',
  'page-agents',
  'GuideWidget',
]) {
  if (!assetNames.includes(needle)) {
    console.error(
      `dist/assets must include a ${needle} chunk after route/guide code-split. Files: ${assetNames}`,
    )
    process.exit(1)
  }
}

const layoutSource = fs.readFileSync('src/layouts/RootLayout.tsx', 'utf8')
if (
  !layoutSource.includes('href="#main-content"') ||
  !layoutSource.includes('id="main-content"') ||
  !layoutSource.includes("t('common.skipToContent')")
) {
  console.error(
    'RootLayout must keep a skip-to-content link targeting #main-content.',
  )
  process.exit(1)
}
if (
  !layoutSource.includes('<Suspense') ||
  !layoutSource.includes('<Outlet />')
) {
  console.error(
    'RootLayout must wrap <Outlet /> in Suspense so header/footer stay mounted while route chunks load.',
  )
  process.exit(1)
}
if (!appSource.includes('lazy(() => import')) {
  console.error('src/App.tsx must keep route-level React.lazy imports.')
  process.exit(1)
}

const oversized = assetJs.filter((f) => f.size >= MONOLITH_BYTES)
if (oversized.length) {
  console.error(
    `JS monolith still present: ${oversized
      .map((f) => `${f.name} (${f.size} B)`)
      .join(', ')}. Expected chunks below ${MONOLITH_BYTES} B.`,
  )
  process.exit(1)
}

const twitterShells = [
  'dist/index.html',
  'dist/prerender/gtm-os.html',
  'dist/prerender/store-os.html',
  'dist/prerender/nexus-os.html',
  'dist/prerender/es.html',
  'dist/prerender/es-gtm-os.html',
  'dist/prerender/es-store-os.html',
  'dist/prerender/es-nexus-os.html',
  'dist/prerender/blog.html',
  'dist/prerender/es-blog.html',
  articleShell,
  'dist/prerender/blog-shopify-admin-audit-before-ads.html',
  'dist/prerender/es-blog-outbound-frio-con-icp-sin-sdr-rentado.html',
  'dist/prerender/agents.html',
  'dist/prerender/agents-auth.html',
  'dist/prerender/es-agents.html',
  'dist/prerender/es-agents-auth.html',
]
const ogSvg = 'airo-assets/images/logo/horizontal.svg'
for (const file of twitterShells) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing — twitter:card cannot be checked.`)
    process.exit(1)
  }
  const html = fs.readFileSync(file, 'utf8')
  if (!html.includes('name="twitter:card" content="summary_large_image"')) {
    console.error(`${file} must set twitter:card=summary_large_image.`)
    process.exit(1)
  }
  if (html.includes('name="twitter:card" content="summary"')) {
    console.error(`${file} must not keep twitter:card=summary.`)
    process.exit(1)
  }
  if (html.includes(`property="og:image" content="https://www.rutinhq.com/${ogSvg}"`)) {
    console.error(`${file} must not wire SVG as og:image (PNG pack only).`)
    process.exit(1)
  }
  if (html.includes(`name="twitter:image" content="https://www.rutinhq.com/${ogSvg}"`)) {
    console.error(`${file} must not wire SVG as twitter:image (PNG pack only).`)
    process.exit(1)
  }
  if (
    html.includes('fonts.googleapis.com') ||
    html.includes('fonts.gstatic.com')
  ) {
    console.error(`${file} must not render-block Google Fonts.`)
    process.exit(1)
  }
}

if (
  !homepage.includes('href="/fonts/inter-latin.woff2"') ||
  !homepage.includes('href="/fonts/space-grotesk-latin-700.woff2"')
) {
  console.error('dist/index.html must preload self-hosted Inter + Space Grotesk.')
  process.exit(1)
}

const osServiceShells = [
  { file: 'dist/prerender/gtm-os.html', type: 'GTM OS' },
  { file: 'dist/prerender/store-os.html', type: 'STORE OS' },
  { file: 'dist/prerender/nexus-os.html', type: 'NEXUS OS' },
  { file: 'dist/prerender/es-gtm-os.html', type: 'GTM OS' },
  { file: 'dist/prerender/es-store-os.html', type: 'STORE OS' },
  { file: 'dist/prerender/es-nexus-os.html', type: 'NEXUS OS' },
]
function ldNodes(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => {
      try {
        const data = JSON.parse(match[1])
        return data['@graph'] || [data]
      } catch {
        return []
      }
    })
}

function faqEntities(html) {
  return ldNodes(html).filter((node) => node['@type'] === 'FAQPage')
}

function assertFaqPageMatchesVisible(file, html) {
  const pages = faqEntities(html)
  if (pages.length === 0) {
    console.error(`${file} must emit FAQPage JSON-LD for the on-page FAQ.`)
    process.exit(1)
  }
  const inner = rootInner(html)
  for (const page of pages) {
    const entities = page.mainEntity || []
    if (entities.length < 3 || entities.length > 5) {
      console.error(
        `${file} FAQPage must have 3–5 questions (found ${entities.length}).`,
      )
      process.exit(1)
    }
    for (const entity of entities) {
      const question = entity.name
      const answer = entity.acceptedAnswer?.text
      if (!question || !answer) {
        console.error(`${file} FAQPage Question is missing name or acceptedAnswer.text.`)
        process.exit(1)
      }
      if (!inner.includes(question) || !inner.includes(answer)) {
        console.error(
          `${file} FAQPage must match visible FAQ 1:1: ${question}`,
        )
        process.exit(1)
      }
    }
  }
}

for (const shell of osServiceShells) {
  const html = fs.readFileSync(shell.file, 'utf8')
  if (!html.includes('"@type":"Service"') || !html.includes(shell.type)) {
    console.error(`${shell.file} must emit JSON-LD Service for ${shell.type}.`)
    process.exit(1)
  }
  const serviceBlob = JSON.stringify(
    ldNodes(html).filter((node) => node['@type'] === 'Service'),
  )
  if (/"price"|offers/i.test(serviceBlob)) {
    console.error(`${shell.file} Service JSON-LD must not invent pricing.`)
    process.exit(1)
  }
  assertFaqPageMatchesVisible(shell.file, html)
}

if (/"@type":"FAQPage"/.test(blogHtml)) {
  console.error('Blog index must not invent FAQPage (no on-page FAQ).')
  process.exit(1)
}
assertFaqPageMatchesVisible('dist/index.html', homepage)
assertFaqPageMatchesVisible(
  'dist/prerender/es.html',
  fs.readFileSync('dist/prerender/es.html', 'utf8'),
)
if (!articleHtml.includes('"@type":"FAQPage"')) {
  console.error(`${articleShell} must keep FAQPage for the real Article01 FAQ.`)
  process.exit(1)
}
if (!esArticleHtml.includes('"@type":"FAQPage"')) {
  console.error(`${esArticleShell} must keep FAQPage for the real Article01 ES FAQ.`)
  process.exit(1)
}
if (!articleHtml.includes('"@type":"BreadcrumbList"')) {
  console.error(`${articleShell} must emit BreadcrumbList matching the visible crumbs.`)
  process.exit(1)
}
if (!esArticleHtml.includes('"@type":"BreadcrumbList"')) {
  console.error(`${esArticleShell} must emit BreadcrumbList matching the visible crumbs.`)
  process.exit(1)
}
if (!esArticleHtml.includes('"datePublished":"2026-09-08"')) {
  console.error(`${esArticleShell} BlogPosting must include datePublished.`)
  process.exit(1)
}
if (!esArticleHtml.includes('"@type":"Organization"')) {
  console.error(`${esArticleShell} must emit the Organization publisher node.`)
  process.exit(1)
}
if (!articleHtml.includes('property="article:published_time" content="2026-09-08"')) {
  console.error(`${articleShell} must emit article:published_time.`)
  process.exit(1)
}
if (
  !esArticleHtml.includes('property="article:published_time" content="2026-09-08"')
) {
  console.error(`${esArticleShell} must emit article:published_time.`)
  process.exit(1)
}

const article02Shell = 'dist/prerender/blog-shopify-admin-audit-before-ads.html'
if (!fs.existsSync(article02Shell)) {
  console.error(`${article02Shell} missing — Article02 draft shell must prerender.`)
  process.exit(1)
}
const article02Html = fs.readFileSync(article02Shell, 'utf8')
if (/"@type":"FAQPage"/.test(article02Html)) {
  console.error('Article02 draft shell must not invent FAQPage.')
  process.exit(1)
}
if (!/name="robots"\s+content="noindex, follow"/.test(article02Html)) {
  console.error(`${article02Shell} must robots noindex, follow.`)
  process.exit(1)
}
if (
  !article02Html.includes(
    'rel="canonical" href="https://www.rutinhq.com/blog/shopify-admin-audit-before-ads"',
  )
) {
  console.error(`${article02Shell} must canonical the Article02 www URL.`)
  process.exit(1)
}

const OG_PACK = [
  'og-hub.png',
  'og-gtm.png',
  'og-store.png',
  'og-nexus.png',
  'og-blog.png',
]
for (const name of OG_PACK) {
  const file = `dist/og/${name}`
  if (!fs.existsSync(file)) {
    console.error(`${file} missing — OG PNG pack must ship from public/og/.`)
    process.exit(1)
  }
  const buf = fs.readFileSync(file)
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    console.error(`${file} must be a PNG.`)
    process.exit(1)
  }
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  if (width !== 1200 || height !== 630) {
    console.error(`${file} must be 1200×630 (got ${width}×${height}).`)
    process.exit(1)
  }
}

const ogShells = [
  { file: 'dist/index.html', image: 'https://www.rutinhq.com/og/og-hub.png' },
  { file: 'dist/prerender/es.html', image: 'https://www.rutinhq.com/og/og-hub.png' },
  { file: 'dist/prerender/gtm-os.html', image: 'https://www.rutinhq.com/og/og-gtm.png' },
  {
    file: 'dist/prerender/es-gtm-os.html',
    image: 'https://www.rutinhq.com/og/og-gtm.png',
  },
  {
    file: 'dist/prerender/store-os.html',
    image: 'https://www.rutinhq.com/og/og-store.png',
  },
  {
    file: 'dist/prerender/es-store-os.html',
    image: 'https://www.rutinhq.com/og/og-store.png',
  },
  {
    file: 'dist/prerender/nexus-os.html',
    image: 'https://www.rutinhq.com/og/og-nexus.png',
  },
  {
    file: 'dist/prerender/es-nexus-os.html',
    image: 'https://www.rutinhq.com/og/og-nexus.png',
  },
  { file: 'dist/prerender/blog.html', image: 'https://www.rutinhq.com/og/og-blog.png' },
  {
    file: 'dist/prerender/es-blog.html',
    image: 'https://www.rutinhq.com/og/og-blog.png',
  },
  {
    file: articleShell,
    image: 'https://www.rutinhq.com/og/og-blog.png',
  },
  {
    file: 'dist/prerender/blog-shopify-admin-audit-before-ads.html',
    image: 'https://www.rutinhq.com/og/og-blog.png',
  },
  {
    file: 'dist/prerender/es-blog-outbound-frio-con-icp-sin-sdr-rentado.html',
    image: 'https://www.rutinhq.com/og/og-blog.png',
  },
  { file: 'dist/prerender/agents.html', image: 'https://www.rutinhq.com/og/og-hub.png' },
  {
    file: 'dist/prerender/agents-auth.html',
    image: 'https://www.rutinhq.com/og/og-hub.png',
  },
  {
    file: 'dist/prerender/es-agents.html',
    image: 'https://www.rutinhq.com/og/og-hub.png',
  },
  {
    file: 'dist/prerender/es-agents-auth.html',
    image: 'https://www.rutinhq.com/og/og-hub.png',
  },
]
for (const shell of ogShells) {
  const html = fs.readFileSync(shell.file, 'utf8')
  if (!html.includes(`property="og:image" content="${shell.image}"`)) {
    console.error(`${shell.file} must set og:image to ${shell.image}.`)
    process.exit(1)
  }
  if (!html.includes(`name="twitter:image" content="${shell.image}"`)) {
    console.error(`${shell.file} must set twitter:image to ${shell.image}.`)
    process.exit(1)
  }
  if (!html.includes('property="og:image:width" content="1200"')) {
    console.error(`${shell.file} must set og:image:width=1200.`)
    process.exit(1)
  }
  if (!html.includes('property="og:image:height" content="630"')) {
    console.error(`${shell.file} must set og:image:height=630.`)
    process.exit(1)
  }
  if (!html.includes('property="og:image:type" content="image/png"')) {
    console.error(`${shell.file} must set og:image:type=image/png.`)
    process.exit(1)
  }
}

const catalogFile = 'dist/.well-known/api-catalog'
if (!fs.existsSync(catalogFile)) {
  console.error(`${catalogFile} missing — RFC 9727 catalog must ship from public/.`)
  process.exit(1)
}
const catalogBody = fs.readFileSync(catalogFile, 'utf8')
if (htmlShell.test(catalogBody)) {
  console.error(`${catalogFile} must be linkset JSON, not HTML.`)
  process.exit(1)
}
let catalogJson
try {
  catalogJson = JSON.parse(catalogBody)
} catch {
  console.error(`${catalogFile} must be valid JSON.`)
  process.exit(1)
}
if (!Array.isArray(catalogJson.linkset) || catalogJson.linkset.length === 0) {
  console.error(`${catalogFile} must be an RFC 9264 linkset with a linkset array.`)
  process.exit(1)
}
for (const needle of [
  'https://docs.rutinhq.com/catalog/',
  'https://www.rutinhq.com/llms.txt',
  'https://www.rutinhq.com/sitemap.xml',
  'https://www.rutinhq.com/auth.md',
  'https://www.rutinhq.com/agents.md',
]) {
  if (!catalogBody.includes(needle)) {
    console.error(`${catalogFile} must list ${needle}.`)
    process.exit(1)
  }
}
if (forbiddenLlms.test(catalogBody)) {
  console.error(`${catalogFile} must not invent prices or mention fzf / FuzzyFlags / Capo.`)
  process.exit(1)
}

const authMd = 'dist/auth.md'
if (!fs.existsSync(authMd)) {
  console.error(`${authMd} missing — agents need a public auth.md.`)
  process.exit(1)
}
const authBody = fs.readFileSync(authMd, 'utf8')
if (htmlShell.test(authBody)) {
  console.error(`${authMd} must be markdown, not HTML.`)
  process.exit(1)
}
for (const needle of [
  'https://docs.rutinhq.com/catalog/',
  'strategy@rutinhq.com',
  'Cloudflare Access',
  'https://www.rutinhq.com/.well-known/api-catalog',
]) {
  if (!authBody.includes(needle)) {
    console.error(`${authMd} must include ${needle}.`)
    process.exit(1)
  }
}
if (forbiddenLlms.test(authBody)) {
  console.error(`${authMd} must not invent prices or mention fzf / FuzzyFlags / Capo.`)
  process.exit(1)
}
if (/sk-[A-Za-z0-9]|api[_-]?key\s*[:=]|Bearer\s+[A-Za-z0-9]/i.test(authBody)) {
  console.error(`${authMd} must not publish secrets.`)
  process.exit(1)
}

const agentsMd = 'dist/agents.md'
if (!fs.existsSync(agentsMd)) {
  console.error(`${agentsMd} missing — agents need a public agents.md.`)
  process.exit(1)
}
const agentsBody = fs.readFileSync(agentsMd, 'utf8')
if (htmlShell.test(agentsBody)) {
  console.error(`${agentsMd} must be markdown, not HTML.`)
  process.exit(1)
}
for (const needle of [
  'https://www.rutinhq.com/agents',
  'https://docs.rutinhq.com/catalog/',
  'strategy@rutinhq.com',
  'https://www.rutinhq.com/.well-known/api-catalog',
]) {
  if (!agentsBody.includes(needle)) {
    console.error(`${agentsMd} must include ${needle}.`)
    process.exit(1)
  }
}
if (forbiddenLlms.test(agentsBody)) {
  console.error(`${agentsMd} must not invent prices or mention fzf / FuzzyFlags / Capo.`)
  process.exit(1)
}
if (/sk-[A-Za-z0-9]|api[_-]?key\s*[:=]|Bearer\s+[A-Za-z0-9]/i.test(agentsBody)) {
  console.error(`${agentsMd} must not publish secrets.`)
  process.exit(1)
}

const agentShells = [
  {
    file: 'dist/prerender/agents.html',
    title: 'RutinHQ — agent catalog',
    canonical: 'https://www.rutinhq.com/agents',
  },
  {
    file: 'dist/prerender/agents-auth.html',
    title: 'RutinHQ — agent auth surfaces',
    canonical: 'https://www.rutinhq.com/agents/auth',
  },
  {
    file: 'dist/prerender/es-agents.html',
    title: 'RutinHQ — catálogo para agentes',
    canonical: 'https://www.rutinhq.com/es/agents',
  },
  {
    file: 'dist/prerender/es-agents-auth.html',
    title: 'RutinHQ — auth para agentes',
    canonical: 'https://www.rutinhq.com/es/agents/auth',
  },
]
for (const shell of agentShells) {
  const html = fs.readFileSync(shell.file, 'utf8')
  if (!html.includes(`<title>${shell.title}</title>`)) {
    console.error(`${shell.file} must ship unique <title>${shell.title}</title>.`)
    process.exit(1)
  }
  if (!html.includes(`rel="canonical" href="${shell.canonical}"`)) {
    console.error(`${shell.file} must canonical ${shell.canonical}.`)
    process.exit(1)
  }
  if (!html.includes('rel="api-catalog" href="https://www.rutinhq.com/.well-known/api-catalog"')) {
    console.error(`${shell.file} must advertise api-catalog in HTML link tags.`)
    process.exit(1)
  }
  if (/"@type":"FAQPage"/.test(html)) {
    console.error(`${shell.file} must not invent FAQPage.`)
    process.exit(1)
  }
}

if (
  !homepage.includes('rel="api-catalog" href="https://www.rutinhq.com/.well-known/api-catalog"')
) {
  console.error('dist/index.html must advertise api-catalog in HTML link tags.')
  process.exit(1)
}

console.log(
  `code-split: ${assetJs.length} JS chunks; largest ${assetJs[0].name} ${assetJs[0].size} B`,
)

console.log(
  'SSR bodies in #root; 404.html ships (no SPA catch-all); blog + SKU + ES shells unique; favicon.ico + PNG 48/192 + manifest real; Calendly primary CTA.',
)
