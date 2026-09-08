import fs from 'node:fs'

if (fs.existsSync('dist/404.html')) {
  console.error(
    'dist/404.html must not ship — Cloudflare Pages would serve SPA routes as HTTP 404.',
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
    'dist/_redirects must not 301 /es onto /es/blog — hub language switch.',
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
    `${sitemap} must list the 12 www URLs (hub + 3 SKUs + ES hub/LPs + EN/ES blog + Article01).`,
  )
  process.exit(1)
}
if (locs.some((url) => !url.startsWith('https://www.rutinhq.com'))) {
  console.error(`${sitemap} must stay www-only.`)
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
  if (/X-Robots-Tag:\s*noindex/i.test(active)) {
    console.error(
      'dist/_headers must not noindex published /blog or Article01.',
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
    title: 'RutinHQ — GTM OS',
    canonical: 'https://www.rutinhq.com/es/gtm-os',
  },
  {
    file: 'dist/prerender/es-store-os.html',
    title: 'RutinHQ — STORE OS',
    canonical: 'https://www.rutinhq.com/es/store-os',
  },
  {
    file: 'dist/prerender/es-nexus-os.html',
    title: 'RutinHQ — NEXUS OS',
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

const footerSource = fs.readFileSync('src/layouts/parts/Footer.tsx', 'utf8')
if (footerSource.includes('ONE_PAGER_URL') || /\bDOCS_URL\b/.test(footerSource)) {
  console.error('Footer must drop standalone Docs and One-pager.')
  process.exit(1)
}
if (
  !footerSource.includes('DOCS_CATALOG_URL') ||
  !footerSource.includes("localized('/blog')") ||
  !footerSource.includes('MAILTO_HUB')
) {
  console.error('Footer must keep Catalog (docs), locale Blog, and Talk mailto.')
  process.exit(1)
}

console.log(
  'SPA 200 fallback: no 404.html; blog + SKU prerender shells unique; favicon.ico real; crawl files www-only; /es hub not 301.',
)
