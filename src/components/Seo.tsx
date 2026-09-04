import { Helmet } from '@dr.pogodin/react-helmet'

const SITE = 'https://www.rutinhq.com'
const OG = `${SITE}/airo-assets/images/logo/horizontal.svg`

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
          'GTM OS — a B2B outbound system that stays yours. Clay → Instantly → CRM.',
        inLanguage: ['es', 'en'],
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'RutinHQ',
        url: `${SITE}/`,
        email: 'rutinhqsolutions@gmail.com',
        logo: `${SITE}/airo-assets/images/logo/horizontal.svg`,
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}/#webpage`,
        url: `${SITE}/`,
        name: 'RutinHQ — GTM OS',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` },
      },
    ],
  }
}
