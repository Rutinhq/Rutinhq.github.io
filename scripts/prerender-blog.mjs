import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const SITE = 'https://www.rutinhq.com'
const OG = `${SITE}/airo-assets/images/logo/horizontal.svg`

// Do NOT emit dist/blog/index.html or dist/blog/<slug>/index.html.
// Cloudflare Pages html-handling 308s those pretty URLs. SKU routes
// stay on the SPA fallback. Blog shells are flat files + _redirects 200.
const ROUTES = [
  {
    path: '/blog',
    file: 'blog.html',
    title: 'Blog — systems you own',
    description:
      'Radar for founders who install GTM and ops systems — not rented seats.',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['CollectionPage', 'Blog'],
          '@id': `${SITE}/blog#blog`,
          url: `${SITE}/blog`,
          name: 'Blog — systems you own',
          description:
            'Radar for founders who install GTM and ops systems — not rented seats.',
          inLanguage: 'en',
        },
        {
          '@type': 'ItemList',
          '@id': `${SITE}/blog#featured`,
          name: 'Featured',
          numberOfItems: 1,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'ICP-gated cold outbound without a rented SDR',
              url: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
            },
          ],
        },
      ],
    },
  },
  {
    path: '/blog/icp-gated-cold-outbound-without-rented-sdr',
    file: 'prerender/blog-icp-gated-cold-outbound-without-rented-sdr.html',
    title: 'RutinHQ — ICP-gated cold outbound without a rented SDR',
    description:
      'Keep the outbound core fixed—change only ICP, message, and filters—so pipeline stays with your team when the contract ends.',
    ogType: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE}/#organization`,
          name: 'RutinHQ',
          url: `${SITE}/`,
          email: 'strategy@rutinhq.com',
        },
        {
          '@type': 'BlogPosting',
          '@id': `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr#article`,
          headline: 'ICP-gated cold outbound without a rented SDR',
          description:
            'Keep the outbound core fixed—change only ICP, message, and filters—so pipeline stays with your team when the contract ends.',
          datePublished: '2026-09-08',
          dateModified: '2026-09-08',
          inLanguage: 'en',
          url: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
          author: { '@id': `${SITE}/#organization` },
          publisher: { '@id': `${SITE}/#organization` },
        },
        {
          '@type': 'FAQPage',
          '@id': `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Is this hiring an SDR?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. It’s a prospecting system installed in your team so outbound survives when the agency leaves.',
              },
            },
            {
              '@type': 'Question',
              name: 'Do you skip ICP validation to go faster?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. No volume without a correct ICP; no next vertical without signal from the prior.',
              },
            },
            {
              '@type': 'Question',
              name: 'What changes per vertical?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Language, filters, and angle — not the milestone core.',
              },
            },
            {
              '@type': 'Question',
              name: 'Where’s the full system sheet?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'See the GTM OS catalog ficha at https://docs.rutinhq.com/catalog/gtm-os/ and the https://www.rutinhq.com/gtm-os page.',
              },
            },
          ],
        },
      ],
    },
  },
]

function esc(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function stripHomepageSeo(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/?>/gi, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\s+property="og:[^"]+"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\s+name="robots"[\s\S]*?\/?>/gi, '')
}

function seoHead(route) {
  const url = `${SITE}${route.path}`
  return [
    `<!-- prerender:${route.path} -->`,
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta property="og:type" content="${route.ogType}" />`,
    `<meta property="og:site_name" content="RutinHQ" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${OG}" />`,
    `<script type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>`,
  ].join('\n    ')
}

const templatePath = path.join(dist, 'index.html')
if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html missing — run vite build first.')
  process.exit(1)
}

const template = fs.readFileSync(templatePath, 'utf8')

for (const route of ROUTES) {
  let page = stripHomepageSeo(template)
  if (!page.includes('</head>')) {
    console.error('dist/index.html has no </head> — cannot inject blog SEO.')
    process.exit(1)
  }
  page = page.replace('</head>', `    ${seoHead(route)}\n  </head>`)
  const outPath = path.join(dist, route.file)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, page)
  console.log(`prerender ${route.path} → ${route.file}`)
}
