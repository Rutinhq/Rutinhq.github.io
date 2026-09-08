import fs from 'node:fs'

if (fs.existsSync('dist/404.html')) {
  console.error(
    'dist/404.html must not ship — Cloudflare Pages would serve SPA routes as HTTP 404.',
  )
  process.exit(1)
}

for (const route of ['gtm-os', 'store-os', 'nexus-os', 'blog']) {
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
  'https://www.rutinhq.com/blog',
  'https://www.rutinhq.com/blog/icp-gated-cold-outbound-without-rented-sdr',
]
if (
  locs.length !== expectedLocs.length ||
  expectedLocs.some((url) => !locs.includes(url))
) {
  console.error(
    `${sitemap} must list exactly the 6 www URLs (hub + 3 SKUs + /blog + Article01).`,
  )
  process.exit(1)
}
if (locs.some((url) => !url.startsWith('https://www.rutinhq.com'))) {
  console.error(`${sitemap} must stay www-only.`)
  process.exit(1)
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
  console.error(`${blogSource} must set draft:false and noindex:false for the published index + Article01.`)
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

console.log(
  'SPA 200 fallback: no 404.html; _redirects present; crawl files www-only; /blog + Article01 indexed.',
)
