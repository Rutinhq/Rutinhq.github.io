import { Helmet } from '@dr.pogodin/react-helmet'

const SITE = 'https://www.rutinhq.com'
const OG = `${SITE}/airo-assets/images/logo/horizontal.svg`

type SeoProps = {
  title: string
  description: string
  path: string
  jsonLd?: Record<string, unknown>
  noindex?: boolean
  ogType?: 'website' | 'article'
}

export function Seo({
  title,
  description,
  path,
  jsonLd,
  noindex = false,
  ogType = 'website',
}: SeoProps) {
  const url = `${SITE}${path}`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="RutinHQ" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG} />
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  )
}

export function hubJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'RutinHQ',
        description:
          'Three installable operating systems. Pick the bottleneck. One page, one SKU.',
        inLanguage: ['en', 'es'],
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'RutinHQ',
        url: `${SITE}/`,
        email: 'strategy@rutinhq.com',
        logo: `${SITE}/airo-assets/images/logo/horizontal.svg`,
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}/#webpage`,
        url: `${SITE}/`,
        name: 'RutinHQ — systems you own',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` },
      },
    ],
  }
}

export function skuJsonLd(path: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE}${path}#webpage`,
    url: `${SITE}${path}`,
    name,
    description,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#organization` },
  }
}

type FaqItem = { q: string; a: string }

export function articleJsonLd({
  path,
  headline,
  description,
  datePublished,
  dateModified,
  faq,
}: {
  path: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  faq: readonly FaqItem[]
}) {
  const url = `${SITE}${path}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'RutinHQ',
      url: `${SITE}/`,
      email: 'strategy@rutinhq.com',
    },
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline,
      description,
      datePublished,
      dateModified: dateModified ?? datePublished,
      inLanguage: 'en',
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@id': `${SITE}/#organization` },
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${SITE}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: headline,
          item: url,
        },
      ],
    },
  ]

  if (faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
