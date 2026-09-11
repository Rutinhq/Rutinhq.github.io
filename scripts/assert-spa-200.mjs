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

for (const route of ['gtm-os', 'store-os', 'nexus-os', 'blog', 'es']) {
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
if (fs.existsSync('dist/es/blog/index.html')) {
  console.error(
    'dist/es/blog/index.html must not ship — pretty /es/blog would 308.',
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
  'https://www.rutinhq.com/blog',
  'https://www.rutinhq.com/blog/icp-gated-cold-outbound-without-rented-sdr',
  'https://www.rutinhq.com/es/blog',
  'https://www.rutinhq.com/es/blog/outbound-frio-con-icp-sin-sdr-rentado',
]
if (
  locs.length !== expectedLocs.length ||
  expectedLocs.some((url) => !locs.includes(url))
) {
  console.error(
    `${sitemap} must list exactly the 12 www URLs (EN+ES hub + 3 SKUs + EN/ES blog + Article01).`,
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
if (!sitemapBody.includes('<lastmod>2026-09-08</lastmod>')) {
  console.error(`${sitemap} must keep Article01 lastmod from dateModified.`)
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
  if (/X-Robots-Tag:\s*noindex/i.test(active)) {
    console.error(
      'dist/_headers must not noindex published /blog or Article01.',
    )
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
    !/Link:\s*<\/sitemap\.xml>;\s*rel="sitemap".*<\/llms\.txt>;\s*rel="describedby"/i.test(
      headers,
    )
  ) {
    console.error(
      'dist/_headers must keep Soft P1 RFC 8288 Link to sitemap + llms.txt.',
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
if (!/draft:\s*false/.test(blogFlags) || !/noindex:\s*false/.test(blogFlags)) {
  console.error(
    `${blogSource} must set draft:false and noindex:false for the published index + Article01.`,
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
if (!/name="robots"\s+content="index, follow"/.test(articleHtml)) {
  console.error(`${articleShell} must robots index, follow.`)
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

const htmlShell = /<!doctype html|<html[\s>]/i
const forbiddenLlms = /fzf\.dev|fuzzyflags|\bfzf\b|\bcapo\b|\$\d[\d,]*/i
const llmsRequired = [
  'https://www.rutinhq.com/',
  'https://www.rutinhq.com/gtm-os',
  'https://www.rutinhq.com/store-os',
  'https://www.rutinhq.com/nexus-os',
  'https://www.rutinhq.com/blog',
  'https://www.rutinhq.com/blog/icp-gated-cold-outbound-without-rented-sdr',
  'https://docs.rutinhq.com/catalog/',
  'strategy@rutinhq.com',
  'https://calendly.com/rutinhq/30min',
]
const llmsFullRequired = [
  ...llmsRequired,
  'https://www.rutinhq.com/es/blog',
  'https://www.rutinhq.com/es/blog/outbound-frio-con-icp-sin-sdr-rentado',
  'https://docs.rutinhq.com/catalog/gtm-os/',
  'https://docs.rutinhq.com/catalog/store-os/',
  'https://docs.rutinhq.com/catalog/nexus-os/',
  'https://www.rutinhq.com/llms.txt',
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

const appSource = fs.readFileSync('src/App.tsx', 'utf8')
for (const route of ['/es', '/es/gtm-os', '/es/store-os', '/es/nexus-os']) {
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
  !footerSource.includes('CALENDLY_URL') ||
  !footerSource.includes('MAILTO_EMAIL')
) {
  console.error(
    'Footer must keep Catalog (docs), locale Blog, Calendly Talk, and mailto email.',
  )
  process.exit(1)
}

const bodyRoutes = [
  {
    file: 'dist/index.html',
    needles: ['Systems you own — not retainers that vanish.', 'GTM OS', 'STORE OS', 'NEXUS OS'],
  },
  {
    file: 'dist/prerender/gtm-os.html',
    needles: ['Outbound that stays yours.'],
  },
  {
    file: 'dist/prerender/store-os.html',
    needles: ['Make the store convert before you buy ads.'],
  },
  {
    file: 'dist/prerender/nexus-os.html',
    needles: ['Agentic marketing — paper first, Ads only when signed.'],
  },
  {
    file: 'dist/prerender/es.html',
    needles: ['Sistemas que posees — no retainers que desaparecen.'],
  },
  {
    file: 'dist/prerender/es-gtm-os.html',
    needles: ['Outbound que se queda contigo.'],
  },
  {
    file: 'dist/prerender/es-store-os.html',
    needles: ['Haz que la tienda convierta antes de comprar ads.'],
  },
  {
    file: 'dist/prerender/es-nexus-os.html',
    needles: ['Marketing agéntico — primero en papel, Ads solo con GO.'],
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
for (const needle of ['gtm-os', 'store-os', 'nexus-os', 'GuideWidget']) {
  if (!assetNames.includes(needle)) {
    console.error(
      `dist/assets must include a ${needle} chunk after route/guide code-split. Files: ${assetNames}`,
    )
    process.exit(1)
  }
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
  'dist/prerender/es-blog-outbound-frio-con-icp-sin-sdr-rentado.html',
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
    console.error(`${file} must not wire SVG as og:image (blocked on Capo D14 PNG).`)
    process.exit(1)
  }
  if (html.includes(`name="twitter:image" content="https://www.rutinhq.com/${ogSvg}"`)) {
    console.error(`${file} must not wire SVG as twitter:image (blocked on Capo D14 PNG).`)
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
for (const shell of osServiceShells) {
  const html = fs.readFileSync(shell.file, 'utf8')
  if (!html.includes('"@type":"Service"') || !html.includes(shell.type)) {
    console.error(`${shell.file} must emit JSON-LD Service for ${shell.type}.`)
    process.exit(1)
  }
  if (/"@type":"FAQPage"/.test(html)) {
    console.error(`${shell.file} must not invent FAQPage (no on-page FAQ).`)
    process.exit(1)
  }
  if (/price|precio|offers/i.test(html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/)?.[0] || '')) {
    console.error(`${shell.file} Service JSON-LD must not invent pricing.`)
    process.exit(1)
  }
}

if (/"@type":"FAQPage"/.test(homepage) || /"@type":"FAQPage"/.test(blogHtml)) {
  console.error('Hub/blog index must not invent FAQPage (no on-page FAQ).')
  process.exit(1)
}
if (!articleHtml.includes('"@type":"FAQPage"')) {
  console.error(`${articleShell} must keep FAQPage for the real Article01 FAQ.`)
  process.exit(1)
}

console.log(
  `code-split: ${assetJs.length} JS chunks; largest ${assetJs[0].name} ${assetJs[0].size} B`,
)

console.log(
  'SSR bodies in #root; 404.html ships (no SPA catch-all); blog + SKU + ES shells unique; favicon.ico real; Calendly primary CTA.',
)
