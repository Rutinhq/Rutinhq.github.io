import { Helmet } from '@dr.pogodin/react-helmet'

export const SITE = 'https://www.rutinhq.com'
const LOGO_SVG = `${SITE}/airo-assets/images/logo/horizontal.svg`

/** Absolute PNG 1200×630 rasterized from `public/favicon.svg` onto `#0A0A0A`. */
export const OG_IMAGE = {
  hub: `${SITE}/og/og-hub.png`,
  gtm: `${SITE}/og/og-gtm.png`,
  store: `${SITE}/og/og-store.png`,
  nexus: `${SITE}/og/og-nexus.png`,
  blog: `${SITE}/og/og-blog.png`,
} as const

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
  /** Absolute PNG 1200×630 from `OG_IMAGE`. Do not pass SVG. */
  image?: string
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
  image,
}: SeoProps) {
  const url = `${SITE}${path}`
  const ogLocale = locale === 'es' ? 'es_MX' : 'en_US'
  return (
    <Helmet>
      <html lang={locale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  )
}

const OS_LANDINGS = [
  { name: 'GTM OS', path: '/gtm-os' },
  { name: 'STORE OS', path: '/store-os' },
  { name: 'NEXUS OS', path: '/nexus-os' },
] as const

export type FaqItem = { q: string; a: string }

export function faqPageNode(path: string, faq: readonly FaqItem[]) {
  if (faq.length === 0) return null
  const pageUrl = `${SITE}${path === '/' ? '/' : path}`
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function hubJsonLd(
  path = '/',
  name = 'RutinHQ — systems you own',
  faq: readonly FaqItem[] = [],
) {
  const pageUrl = `${SITE}${path === '/' ? '/' : path}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'RutinHQ',
      description:
        'RutinHQ installs B2B operating systems — GTM OS, STORE OS, and NEXUS OS — that founding teams own.',
      inLanguage: ['en', 'es'],
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'RutinHQ',
      alternateName: 'Rutin HQ',
      url: `${SITE}/`,
      email: 'strategy@rutinhq.com',
      logo: LOGO_SVG,
      image: `${SITE}/apple-touch-icon.png`,
      description:
        'RutinHQ is a B2B systems studio. We install GTM OS, STORE OS, and NEXUS OS — operating systems teams own, not retainers that vanish.',
      knowsAbout: ['GTM OS', 'STORE OS', 'NEXUS OS', 'B2B outbound'],
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE}/#os-landings`,
      name: 'RutinHQ operating systems',
      numberOfItems: OS_LANDINGS.length,
      itemListElement: OS_LANDINGS.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${SITE}${item.path}`,
      })),
    },
  ]
  const faqNode = faqPageNode(path, faq)
  if (faqNode) graph.push(faqNode)
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function skuJsonLd(
  path: string,
  name: string,
  description: string,
  service?: { serviceType: string },
  faq: readonly FaqItem[] = [],
) {
  const pageUrl = `${SITE}${path}`
  const webpage = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name,
    description,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#organization` },
    ...(service ? { mainEntity: { '@id': `${pageUrl}#service` } } : {}),
  }
  const faqNode = faqPageNode(path, faq)

  if (!service) {
    if (!faqNode) {
      return {
        '@context': 'https://schema.org',
        ...webpage,
      }
    }
    return {
      '@context': 'https://schema.org',
      '@graph': [webpage, faqNode],
    }
  }

  const graph: Record<string, unknown>[] = [
    webpage,
    {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: service.serviceType,
      description,
      url: pageUrl,
      provider: { '@id': `${SITE}/#organization` },
      serviceType: service.serviceType,
    },
  ]
  if (faqNode) graph.push(faqNode)

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

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

  const faqNode = faqPageNode(path, faq)
  if (faqNode) graph.push(faqNode)

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
