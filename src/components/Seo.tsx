import { Helmet } from '@dr.pogodin/react-helmet'

export const SITE = 'https://www.rutinhq.com'
const OG = `${SITE}/airo-assets/images/logo/horizontal.svg`

export type HreflangLink = { hreflang: string; href: string }

type SeoProps = {
  title: string
  description: string
  path: string
  jsonLd?: Record<string, unknown>
  noindex?: boolean
  ogType?: 'website' | 'article'
  locale?: 'en' | 'es'
  alternates?: readonly HreflangLink[]
}

export function hreflangPair(enPath: string, esPath: string): HreflangLink[] {
  return [
    { hreflang: 'en', href: `${SITE}${enPath}` },
    { hreflang: 'es', href: `${SITE}${esPath}` },
    { hreflang: 'x-default', href: `${SITE}${enPath}` },
  ]
}

export function Seo({
  title,
  description,
  path,
  jsonLd,
  noindex = false,
  ogType = 'website',
  locale = 'en',
  alternates,
}: SeoProps) {
  const url = `${SITE}${path}`
  const ogLocale = locale === 'es' ? 'es_MX' : 'en_US'
  return (
    <Helmet>
      <html lang={locale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {alternates?.map((alt) => (
        <link
          key={alt.hreflang}
          rel="alternate"
          hrefLang={alt.hreflang}
          href={alt.href}
        />
      ))}
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="RutinHQ" />
      <meta property="og:locale" content={ogLocale} />
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
  inLanguage = 'en',
  breadcrumbHome = 'Home',
  breadcrumbBlog = 'Blog',
}: {
  path: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  faq: readonly FaqItem[]
  inLanguage?: 'en' | 'es'
  breadcrumbHome?: string
  breadcrumbBlog?: string
}) {
  const url = `${SITE}${path}`
  const blogPath = inLanguage === 'es' ? '/es/blog' : '/blog'
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
      inLanguage,
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
          name: breadcrumbHome,
          item: `${SITE}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumbBlog,
          item: `${SITE}${blogPath}`,
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

export function blogIndexJsonLd(
  featured: readonly { path: string; name: string }[],
  {
    path = '/blog',
    name = 'Blog — systems you own',
    description = 'Radar for founders who install GTM and ops systems — not rented seats.',
    inLanguage = 'en',
  }: {
    path?: string
    name?: string
    description?: string
    inLanguage?: 'en' | 'es'
  } = {},
) {
  const url = `${SITE}${path}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollectionPage', 'Blog'],
        '@id': `${url}#blog`,
        url,
        name,
        description,
        inLanguage,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` },
        mainEntity: { '@id': `${url}#featured` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#featured`,
        name: inLanguage === 'es' ? 'Destacado' : 'Featured',
        numberOfItems: featured.length,
        itemListElement: featured.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: `${SITE}${item.path}`,
        })),
      },
    ],
  }
}
