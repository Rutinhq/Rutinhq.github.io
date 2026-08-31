import { Helmet } from '@dr.pogodin/react-helmet'

const SITE = 'https://rutinhq.com'
const OG = `${SITE}/assets/og-image.png`

type SeoProps = {
  title: string
  description: string
  path: string
  jsonLd?: Record<string, unknown>
}

export function Seo({ title, description, path, jsonLd }: SeoProps) {
  const url = `${SITE}${path}`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="RutinHQ" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG} />
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  )
}

export function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: `${SITE}/`,
        name: 'RutinHQ',
        description:
          'Revenue Operations and GTM Engineering consultancy.',
        inLanguage: ['en', 'es'],
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'RutinHQ',
        url: `${SITE}/`,
        logo: `${SITE}/airo-assets/images/logo/horizontal.png`,
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}/#webpage`,
        url: `${SITE}/`,
        name: 'RutinHQ — Revenue Operations & GTM Engineering',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` },
      },
    ],
  }
}

export function pageJsonLd(path: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE}${path}#webpage`,
    url: `${SITE}${path}`,
    name,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#organization` },
  }
}
