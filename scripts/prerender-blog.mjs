import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CONTENT_STAMP } from './content-stamp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const SITE = 'https://www.rutinhq.com'

const enLocale = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/en.json'), 'utf8'),
)
const esLocale = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/es.json'), 'utf8'),
)

function faqPageNode(pageUrl, items) {
  if (!Array.isArray(items) || items.length === 0) return null
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

const OG_IMAGE = {
  hub: `${SITE}/og/og-hub.png`,
  gtm: `${SITE}/og/og-gtm.png`,
  store: `${SITE}/og/og-store.png`,
  nexus: `${SITE}/og/og-nexus.png`,
  blog: `${SITE}/og/og-blog.png`,
}

const LOGO_PNG = `${SITE}/apple-touch-icon.png`

function organizationNode(locale = 'en') {
  const es = locale === 'es'
  return {
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: 'RutinHQ',
    alternateName: 'Rutin HQ',
    url: `${SITE}/`,
    email: 'strategy@rutinhq.com',
    logo: {
      '@type': 'ImageObject',
      url: LOGO_PNG,
      width: 180,
      height: 180,
    },
    image: LOGO_PNG,
    description: es
      ? 'RutinHQ es un estudio de sistemas B2B. Instalamos GTM OS, STORE OS y NEXUS OS — sistemas operativos que los equipos poseen, no iguala mensual que desaparece.'
      : 'RutinHQ is a B2B systems studio. We install GTM OS, STORE OS, and NEXUS OS — operating systems teams own, not retainers that vanish.',
    knowsAbout: [
      'GTM OS',
      'STORE OS',
      'NEXUS OS',
      es ? 'prospección en frío B2B' : 'B2B outbound',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'strategy@rutinhq.com',
      contactType: 'sales',
      availableLanguage: ['English', 'Spanish'],
    },
  }
}

function breadcrumbList(url, items) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Do NOT emit dist/blog.html, dist/es/blog.html, dist/blog/index.html, or
// dist/blog/<slug>/index.html. Pages html-handling 308s pretty URLs:
// /blog.html → /blog, and /blog → /blog.html 200 then self-loops Location:/blog.
// Shells live under dist/prerender/*.html; _redirects 200-rewrites to the
// extensionless pretty URL (/prerender/blog), which Pages serves as 200.
const ROUTES = [
  {
    path: '/blog',
    file: 'prerender/blog.html',
    title: 'Blog — systems you own',
    description:
      'Radar for founders who install GTM and ops systems — not rented seats.',
    ogType: 'website',
    locale: 'en',
    image: OG_IMAGE.blog,
    alternates: [
      { hreflang: 'en', href: `${SITE}/blog` },
      { hreflang: 'es', href: `${SITE}/es/blog` },
      { hreflang: 'x-default', href: `${SITE}/blog` },
    ],
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
          isPartOf: { '@id': `${SITE}/#website` },
          about: { '@id': `${SITE}/#organization` },
          mainEntity: { '@id': `${SITE}/blog#featured` },
        },
        {
          '@type': 'ItemList',
          '@id': `${SITE}/blog#featured`,
          name: 'Featured',
          numberOfItems: 3,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'ICP-gated cold outbound without a rented SDR',
              url: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Shopify Admin audit before you buy ads',
              url: `${SITE}/blog/shopify-admin-audit-before-ads`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'Agentic marketing: paper first, Ads only when signed',
              url: `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
            },
          ],
        },
        faqPageNode(`${SITE}/blog`, [
          {
            q: 'What is the RutinHQ blog?',
            a: 'Radar for founders who install GTM and ops systems — not rented seats.',
          },
          {
            q: 'What signal does this radar filter?',
            a: 'ICP fit, a real ops/GTM pain, SKU interest, and founder / CEO / ops lead language — then a system that stays with your team.',
          },
          {
            q: 'Is this a content rabbit hole?',
            a: 'No. CTA on every path is discovery (strategy@) — not a content rabbit hole. Discovery next; educate-forever never.',
          },
          {
            q: 'Where do the systems live?',
            a: 'GTM OS, STORE OS, and NEXUS OS on this site. Catalog curriculum also lives at docs.rutinhq.com/catalog.',
          },
        ]),
      ].filter(Boolean),
    },
  },
  {
    path: '/blog/icp-gated-cold-outbound-without-rented-sdr',
    file: 'prerender/blog-icp-gated-cold-outbound-without-rented-sdr.html',
    title: 'RutinHQ — ICP-gated cold outbound without a rented SDR',
    description:
      'Keep the outbound core fixed—change only ICP, message, and filters—so pipeline stays with your team when the contract ends.',
    ogType: 'article',
    locale: 'en',
    image: OG_IMAGE.blog,
    alternates: [
      {
        hreflang: 'en',
        href: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
      },
      {
        hreflang: 'es',
        href: `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado`,
      },
      {
        hreflang: 'x-default',
        href: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
      },
    ],
    datePublished: '2026-09-08',
    dateModified: '2026-09-08',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode(),
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
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
          },
          author: { '@id': `${SITE}/#organization` },
          publisher: { '@id': `${SITE}/#organization` },
        },
        breadcrumbList(`${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`, [
          { name: 'Home', url: `${SITE}/` },
          { name: 'Blog', url: `${SITE}/blog` },
          {
            name: 'ICP-gated cold outbound without a rented SDR',
            url: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
          },
        ]),
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
                text: 'See the GTM OS catalog system sheet at https://docs.rutinhq.com/catalog/gtm-os/ and the https://www.rutinhq.com/gtm-os page.',
              },
            },
          ],
        },
      ],
    },
  },
  {
    path: '/blog/shopify-admin-audit-before-ads',
    file: 'prerender/blog-shopify-admin-audit-before-ads.html',
    title: 'RutinHQ — Shopify Admin audit before you buy ads',
    description:
      'Replicable Shopify Admin audit + config — variants, price, weight, shipping — so ops friction stops killing conversion.',
    ogType: 'article',
    locale: 'en',
    image: OG_IMAGE.blog,
    datePublished: '2026-09-13',
    dateModified: CONTENT_STAMP,
    alternates: [
      {
        hreflang: 'en',
        href: `${SITE}/blog/shopify-admin-audit-before-ads`,
      },
      {
        hreflang: 'es',
        href: `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios`,
      },
      {
        hreflang: 'x-default',
        href: `${SITE}/blog/shopify-admin-audit-before-ads`,
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode(),
        {
          '@type': 'BlogPosting',
          '@id': `${SITE}/blog/shopify-admin-audit-before-ads#article`,
          headline: 'Shopify Admin audit before you buy ads',
          description:
            'Replicable Shopify Admin audit + config — variants, price, weight, shipping — so ops friction stops killing conversion.',
          datePublished: '2026-09-13',
          dateModified: CONTENT_STAMP,
          inLanguage: 'en',
          url: `${SITE}/blog/shopify-admin-audit-before-ads`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE}/blog/shopify-admin-audit-before-ads`,
          },
          author: { '@id': `${SITE}/#organization` },
          publisher: { '@id': `${SITE}/#organization` },
        },
        breadcrumbList(`${SITE}/blog/shopify-admin-audit-before-ads`, [
          { name: 'Home', url: `${SITE}/` },
          { name: 'Blog', url: `${SITE}/blog` },
          {
            name: 'Shopify Admin audit before you buy ads',
            url: `${SITE}/blog/shopify-admin-audit-before-ads`,
          },
        ]),
        {
          '@type': 'FAQPage',
          '@id': `${SITE}/blog/shopify-admin-audit-before-ads#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is STORE OS?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Make the store convert before you buy ads. Replicable Shopify Admin audit + config — variants, price, weight, shipping — so ops friction stops killing conversion.',
              },
            },
            {
              '@type': 'Question',
              name: 'Who is STORE OS for?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Founder / ecom lead on DTC Shopify. Ops friction. Wants ads but store doesn’t convert yet.',
              },
            },
            {
              '@type': 'Question',
              name: 'Does STORE OS buy ads or edit the theme?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Ads / creatives = out of scope (NEXUS OS). Theme / Dawn file editing is not STORE OS. Config only — no theme file edits.',
              },
            },
            {
              '@type': 'Question',
              name: 'Where’s the full system sheet?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'See the STORE OS system sheet and the www.rutinhq.com/store-os page.',
              },
            },
          ],
        },
      ],
    },
  },
  {
    path: '/es/blog',
    file: 'prerender/es-blog.html',
    title: 'Blog — sistemas que usted posee',
    description:
      'Radar para fundadores que instalan sistemas de prospección y operación — no asientos rentados.',
    ogType: 'website',
    locale: 'es',
    image: OG_IMAGE.blog,
    alternates: [
      { hreflang: 'en', href: `${SITE}/blog` },
      { hreflang: 'es', href: `${SITE}/es/blog` },
      { hreflang: 'x-default', href: `${SITE}/blog` },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['CollectionPage', 'Blog'],
          '@id': `${SITE}/es/blog#blog`,
          url: `${SITE}/es/blog`,
          name: 'Blog — sistemas que usted posee',
          description:
            'Radar para fundadores que instalan sistemas de prospección y operación — no asientos rentados.',
          inLanguage: 'es',
          isPartOf: { '@id': `${SITE}/#website` },
          about: { '@id': `${SITE}/#organization` },
          mainEntity: { '@id': `${SITE}/es/blog#featured` },
        },
        {
          '@type': 'ItemList',
          '@id': `${SITE}/es/blog#featured`,
          name: 'Destacado',
          numberOfItems: 3,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Prospección en frío con perfil de cliente ideal (ICP) — sin SDR rentado',
              url: `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Auditoría del panel de Shopify antes de comprar anuncios',
              url: `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'Marketing agéntico en papel antes de comprar anuncios',
              url: `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios`,
            },
          ],
        },
        faqPageNode(`${SITE}/es/blog`, [
          {
            q: '¿Qué es el blog de RutinHQ?',
            a: 'Radar para fundadores que instalan sistemas de prospección y operación — no asientos rentados.',
          },
          {
            q: '¿Qué señal filtra este radar?',
            a: 'Encaje de perfil de cliente ideal (ICP), un dolor real de operación o de prospección, interés de producto y lenguaje de fundador / director general / responsable de operación — luego un sistema que se queda con su equipo.',
          },
          {
            q: '¿Esto es un pozo de contenido?',
            a: 'No. En cada camino, el siguiente paso es una llamada de encaje (strategy@) — no un pozo de contenido ni un ciclo de artículos sin fin.',
          },
          {
            q: '¿Dónde viven los sistemas?',
            a: 'GTM OS, STORE OS y NEXUS OS en este sitio. El temario del catálogo también vive en docs.rutinhq.com/catalog.',
          },
        ]),
      ].filter(Boolean),
    },
  },
  {
    path: '/es/blog/outbound-frio-con-icp-sin-sdr-rentado',
    file: 'prerender/es-blog-outbound-frio-con-icp-sin-sdr-rentado.html',
    title: 'RutinHQ — Prospección en frío con perfil de cliente ideal (ICP) — sin SDR rentado',
    description:
      'Mantenga fijo el núcleo de la prospección en frío; cambie solo ICP, mensaje y filtros — el flujo de ventas se queda con su equipo cuando termina el contrato.',
    ogType: 'article',
    locale: 'es',
    image: OG_IMAGE.blog,
    alternates: [
      {
        hreflang: 'en',
        href: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
      },
      {
        hreflang: 'es',
        href: `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado`,
      },
      {
        hreflang: 'x-default',
        href: `${SITE}/blog/icp-gated-cold-outbound-without-rented-sdr`,
      },
    ],
    datePublished: '2026-09-08',
    dateModified: '2026-09-08',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode('es'),
        {
          '@type': 'BlogPosting',
          '@id': `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado#article`,
          headline: 'Prospección en frío con perfil de cliente ideal (ICP) — sin SDR rentado',
          description:
            'Mantenga fijo el núcleo de la prospección en frío; cambie solo ICP, mensaje y filtros — el flujo de ventas se queda con su equipo cuando termina el contrato.',
          datePublished: '2026-09-08',
          dateModified: '2026-09-08',
          inLanguage: 'es',
          url: `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado`,
          },
          author: { '@id': `${SITE}/#organization` },
          publisher: { '@id': `${SITE}/#organization` },
        },
        breadcrumbList(`${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado`, [
          { name: 'Inicio', url: `${SITE}/es` },
          { name: 'Blog', url: `${SITE}/es/blog` },
          {
            name: 'Prospección en frío con perfil de cliente ideal (ICP) — sin SDR rentado',
            url: `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado`,
          },
        ]),
        {
          '@type': 'FAQPage',
          '@id': `${SITE}/es/blog/outbound-frio-con-icp-sin-sdr-rentado#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: '¿Esto es contratar un SDR?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Es un sistema de prospección instalado en su equipo para que la prospección en frío sobreviva cuando la agencia se va.',
              },
            },
            {
              '@type': 'Question',
              name: '¿Se salta la validación de ICP para ir más rápido?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Sin ICP correcto no hay volumen; sin señal del vertical previo no hay siguiente vertical.',
              },
            },
            {
              '@type': 'Question',
              name: '¿Qué cambia por vertical?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Lenguaje, filtros y ángulo — no el núcleo de etapas.',
              },
            },
            {
              '@type': 'Question',
              name: '¿Dónde está la ficha del sistema?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Mire la ficha GTM OS en el catálogo y la página /es/gtm-os.',
              },
            },
          ],
        },
      ],
    },
  },
  {
    path: '/es/blog/auditoria-panel-shopify-antes-de-anuncios',
    file: 'prerender/es-blog-auditoria-panel-shopify-antes-de-anuncios.html',
    title: 'RutinHQ — Auditoría panel Shopify antes de anuncios',
    description:
      'Auditoría y configuración del panel de Shopify — variantes, precio, peso, envío — para que la tienda convierta antes de gastar en anuncios.',
    ogType: 'article',
    locale: 'es',
    image: OG_IMAGE.blog,
    datePublished: '2026-11-22',
    dateModified: '2026-11-22',
    alternates: [
      {
        hreflang: 'en',
        href: `${SITE}/blog/shopify-admin-audit-before-ads`,
      },
      {
        hreflang: 'es',
        href: `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios`,
      },
      {
        hreflang: 'x-default',
        href: `${SITE}/blog/shopify-admin-audit-before-ads`,
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode('es'),
        {
          '@type': 'BlogPosting',
          '@id': `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios#article`,
          headline: 'Auditoría del panel de Shopify antes de comprar anuncios',
          description:
            'Auditoría y configuración del panel de Shopify — variantes, precio, peso, envío — para que la tienda convierta antes de gastar en anuncios.',
          datePublished: '2026-11-22',
          dateModified: '2026-11-22',
          inLanguage: 'es',
          url: `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios`,
          },
          author: { '@id': `${SITE}/#organization` },
          publisher: { '@id': `${SITE}/#organization` },
        },
        breadcrumbList(`${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios`, [
          { name: 'Inicio', url: `${SITE}/es` },
          { name: 'Blog', url: `${SITE}/es/blog` },
          {
            name: 'Auditoría del panel de Shopify antes de comprar anuncios',
            url: `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios`,
          },
        ]),
        {
          '@type': 'FAQPage',
          '@id': `${SITE}/es/blog/auditoria-panel-shopify-antes-de-anuncios#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: '¿Qué es STORE OS?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Auditoría y configuración del panel de Shopify para que la tienda convierta antes de gastar en anuncios.',
              },
            },
            {
              '@type': 'Question',
              name: '¿Para quién es STORE OS?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Marcas que venden directo al consumidor en Shopify. Hay fricción en la operación de la tienda. Quiere anuncios, pero la tienda aún no convierte.',
              },
            },
            {
              '@type': 'Question',
              name: '¿STORE OS compra anuncios o edita la plantilla?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. No incluye anuncios ni creatividades — quedan fuera de alcance y viven en NEXUS OS. No es edición de plantilla / Dawn. Configuración del panel, sin editar archivos de plantilla.',
              },
            },
            {
              '@type': 'Question',
              name: '¿Dónde está la ficha del sistema?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Mire la ficha STORE OS en el catálogo y la página www.rutinhq.com/es/store-os.',
              },
            },
          ],
        },
      ],
    },
  },
  {
    path: '/blog/agentic-marketing-paper-first-before-ads',
    file: 'prerender/blog-agentic-marketing-paper-first-before-ads.html',
    title: 'RutinHQ — Agentic marketing: paper first, Ads only when signed',
    description:
      'Strategy → Social → Ads. Until creatives, mix, and budget have an explicit sign-off: paper only (no pixel, no spend).',
    ogType: 'article',
    locale: 'en',
    image: OG_IMAGE.blog,
    datePublished: '2026-11-22',
    dateModified: '2026-11-22',
    alternates: [
      {
        hreflang: 'en',
        href: `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
      },
      {
        hreflang: 'es',
        href: `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios`,
      },
      {
        hreflang: 'x-default',
        href: `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode(),
        {
          '@type': 'BlogPosting',
          '@id': `${SITE}/blog/agentic-marketing-paper-first-before-ads#article`,
          headline: 'Agentic marketing: paper first, Ads only when signed',
          description:
            'Strategy → Social → Ads. Until creatives, mix, and budget have an explicit sign-off: paper only (no pixel, no spend).',
          datePublished: '2026-11-22',
          dateModified: '2026-11-22',
          inLanguage: 'en',
          url: `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
          },
          author: { '@id': `${SITE}/#organization` },
          publisher: { '@id': `${SITE}/#organization` },
        },
        breadcrumbList(`${SITE}/blog/agentic-marketing-paper-first-before-ads`, [
          { name: 'Home', url: `${SITE}/` },
          { name: 'Blog', url: `${SITE}/blog` },
          {
            name: 'Agentic marketing: paper first, Ads only when signed',
            url: `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
          },
        ]),
        {
          '@type': 'FAQPage',
          '@id': `${SITE}/blog/agentic-marketing-paper-first-before-ads#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is NEXUS OS?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Agentic marketing — paper first, Ads only when signed. Strategy → Social → Ads. Until creatives, mix, and budget have an explicit sign-off: paper only (no pixel, no spend).',
              },
            },
            {
              '@type': 'Question',
              name: 'Who is NEXUS OS for?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Retailer / ecom with clear offer and SKUs. Wants demand from social as a system. Brand voice owned by client’s ops/marketing (NEXUS does not invent ICP or offer).',
              },
            },
            {
              '@type': 'Question',
              name: 'When do Ads go live?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Ads stay parked until creatives, mix, and budget are signed. Until that explicit sign-off: paper only (no pixel, no spend). Live Ads, pixel, or spend without explicit sign-off is out of scope.',
              },
            },
            {
              '@type': 'Question',
              name: 'Where’s the full system sheet?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'See the NEXUS OS system sheet and the www.rutinhq.com/nexus-os page.',
              },
            },
          ],
        },
      ],
    },
  },
  {
    path: '/es/blog/marketing-agentico-en-papel-antes-de-anuncios',
    file: 'prerender/es-blog-marketing-agentico-en-papel-antes-de-anuncios.html',
    title: 'RutinHQ — Marketing agéntico en papel antes de comprar anuncios',
    description:
      'Estrategia → Social → Ads. Hasta que apruebe las creatividades, la mezcla y el presupuesto: solo papel (sin píxel, sin gasto).',
    ogType: 'article',
    locale: 'es',
    image: OG_IMAGE.blog,
    datePublished: '2026-11-22',
    dateModified: '2026-11-22',
    alternates: [
      {
        hreflang: 'en',
        href: `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
      },
      {
        hreflang: 'es',
        href: `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios`,
      },
      {
        hreflang: 'x-default',
        href: `${SITE}/blog/agentic-marketing-paper-first-before-ads`,
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode('es'),
        {
          '@type': 'BlogPosting',
          '@id': `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios#article`,
          headline: 'Marketing agéntico en papel antes de comprar anuncios',
          description:
            'Estrategia → Social → Ads. Hasta que apruebe las creatividades, la mezcla y el presupuesto: solo papel (sin píxel, sin gasto).',
          datePublished: '2026-11-22',
          dateModified: '2026-11-22',
          inLanguage: 'es',
          url: `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios`,
          },
          author: { '@id': `${SITE}/#organization` },
          publisher: { '@id': `${SITE}/#organization` },
        },
        breadcrumbList(
          `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios`,
          [
            { name: 'Inicio', url: `${SITE}/es` },
            { name: 'Blog', url: `${SITE}/es/blog` },
            {
              name: 'Marketing agéntico en papel antes de comprar anuncios',
              url: `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios`,
            },
          ],
        ),
        {
          '@type': 'FAQPage',
          '@id': `${SITE}/es/blog/marketing-agentico-en-papel-antes-de-anuncios#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: '¿Qué es NEXUS OS?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Marketing agéntico — primero en papel, anuncios solo con aprobación explícita. Estrategia → Social → Ads. Hasta que apruebe las creatividades, la mezcla y el presupuesto: solo papel (sin píxel, sin gasto).',
              },
            },
            {
              '@type': 'Question',
              name: '¿Para quién es NEXUS OS?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Minorista / tienda en línea con oferta y productos claros. Quiere demanda desde social como sistema. La voz de marca la define el equipo de operación y marketing del cliente (NEXUS no inventa el perfil de cliente ideal (ICP) ni la oferta).',
              },
            },
            {
              '@type': 'Question',
              name: '¿Cuándo se activan los anuncios?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Anuncios en pausa hasta que apruebe las creatividades, la mezcla y el presupuesto. Hasta esa aprobación explícita: solo papel (sin píxel, sin gasto). Anuncios en vivo, píxel o gasto sin aprobación explícita quedan fuera de NEXUS OS.',
              },
            },
            {
              '@type': 'Question',
              name: '¿Dónde está la ficha del sistema?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Mire la ficha NEXUS OS en el catálogo y la página www.rutinhq.com/es/nexus-os.',
              },
            },
          ],
        },
      ],
    },
  },
]

function skuJsonLd(path, name, description, serviceType, faq = []) {
  const pageUrl = `${SITE}${path}`
  const webpage = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name,
    description,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#organization` },
  }
  const faqNode = faqPageNode(pageUrl, faq)
  if (!serviceType) {
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
  const graph = [
    { ...webpage, mainEntity: { '@id': `${pageUrl}#service` } },
    {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: serviceType,
      description,
      url: pageUrl,
      provider: { '@id': `${SITE}/#organization` },
      serviceType,
    },
  ]
  if (faqNode) graph.push(faqNode)
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

function skuRoute({ path, file, title, description, locale, serviceType, image, faq }) {
  const enPath = path === '/es' ? '/' : path.replace(/^\/es/, '') || '/'
  const esPath = enPath === '/' ? '/es' : `/es${enPath}`
  return {
    path,
    file,
    title,
    description,
    ogType: 'website',
    locale,
    image,
    alternates: [
      { hreflang: 'en', href: `${SITE}${enPath}` },
      { hreflang: 'es', href: `${SITE}${esPath}` },
      { hreflang: 'x-default', href: `${SITE}${enPath}` },
    ],
    jsonLd: skuJsonLd(path, title, description, serviceType, faq),
  }
}

const MARKETING_ROUTES = [
  skuRoute({
    path: '/gtm-os',
    file: 'prerender/gtm-os.html',
    title: enLocale.seo.gtmTitle,
    description: enLocale.seo.gtmDescription,
    locale: 'en',
    serviceType: 'GTM OS',
    image: OG_IMAGE.gtm,
    faq: enLocale.gtm.faq.items,
  }),
  skuRoute({
    path: '/store-os',
    file: 'prerender/store-os.html',
    title: enLocale.seo.storeTitle,
    description: enLocale.seo.storeDescription,
    locale: 'en',
    serviceType: 'STORE OS',
    image: OG_IMAGE.store,
    faq: enLocale.store.faq.items,
  }),
  skuRoute({
    path: '/nexus-os',
    file: 'prerender/nexus-os.html',
    title: enLocale.seo.nexusTitle,
    description: enLocale.seo.nexusDescription,
    locale: 'en',
    serviceType: 'NEXUS OS',
    image: OG_IMAGE.nexus,
    faq: enLocale.nexus.faq.items,
  }),
  skuRoute({
    path: '/es',
    file: 'prerender/es.html',
    title: esLocale.seo.hubTitle,
    description: esLocale.seo.hubDescription,
    locale: 'es',
    image: OG_IMAGE.hub,
    faq: esLocale.hub.faq.items,
  }),
  skuRoute({
    path: '/es/gtm-os',
    file: 'prerender/es-gtm-os.html',
    title: esLocale.seo.gtmTitle,
    description: esLocale.seo.gtmDescription,
    locale: 'es',
    serviceType: 'GTM OS',
    image: OG_IMAGE.gtm,
    faq: esLocale.gtm.faq.items,
  }),
  skuRoute({
    path: '/es/store-os',
    file: 'prerender/es-store-os.html',
    title: esLocale.seo.storeTitle,
    description: esLocale.seo.storeDescription,
    locale: 'es',
    serviceType: 'STORE OS',
    image: OG_IMAGE.store,
    faq: esLocale.store.faq.items,
  }),
  skuRoute({
    path: '/es/nexus-os',
    file: 'prerender/es-nexus-os.html',
    title: esLocale.seo.nexusTitle,
    description: esLocale.seo.nexusDescription,
    locale: 'es',
    serviceType: 'NEXUS OS',
    image: OG_IMAGE.nexus,
    faq: esLocale.nexus.faq.items,
  }),
]

const AGENT_ROUTES = [
  skuRoute({
    path: '/agents',
    file: 'prerender/agents.html',
    title: enLocale.seo.agentsTitle,
    description: enLocale.seo.agentsDescription,
    locale: 'en',
    image: OG_IMAGE.hub,
  }),
  skuRoute({
    path: '/agents/auth',
    file: 'prerender/agents-auth.html',
    title: enLocale.seo.agentsAuthTitle,
    description: enLocale.seo.agentsAuthDescription,
    locale: 'en',
    image: OG_IMAGE.hub,
  }),
  skuRoute({
    path: '/es/agents',
    file: 'prerender/es-agents.html',
    title: esLocale.seo.agentsTitle,
    description: esLocale.seo.agentsDescription,
    locale: 'es',
    image: OG_IMAGE.hub,
  }),
  skuRoute({
    path: '/es/agents/auth',
    file: 'prerender/es-agents-auth.html',
    title: esLocale.seo.agentsAuthTitle,
    description: esLocale.seo.agentsAuthDescription,
    locale: 'es',
    image: OG_IMAGE.hub,
  }),
]

ROUTES.push(...MARKETING_ROUTES, ...AGENT_ROUTES)

const HUB_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
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
    organizationNode(),
    {
      '@type': 'WebPage',
      '@id': `${SITE}/#webpage`,
      url: `${SITE}/`,
      name: 'RutinHQ — systems you own',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#organization` },
    },
    faqPageNode(`${SITE}/`, enLocale.hub.faq.items),
  ].filter(Boolean),
}

const esHub = ROUTES.find((route) => route.path === '/es')
if (esHub) {
  esHub.jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      ...HUB_JSON_LD['@graph']
        .filter((node) => node['@type'] !== 'FAQPage')
        .map((node) => {
          if (node['@type'] === 'WebPage') {
            return {
              ...node,
              '@id': `${SITE}/es#webpage`,
              url: `${SITE}/es`,
              name: esHub.title,
            }
          }
          if (node['@type'] === 'Organization') return organizationNode('es')
          if (node['@type'] === 'WebSite') {
            return {
              ...node,
              description:
                'RutinHQ instala sistemas operativos B2B — GTM OS, STORE OS y NEXUS OS — que los equipos fundadores poseen.',
            }
          }
          return node
        }),
      faqPageNode(`${SITE}/es`, esLocale.hub.faq.items),
    ].filter(Boolean),
  }
}

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
    .replace(/<link\s+rel="alternate"[\s\S]*?\/?>/gi, '')
    .replace(/<link\s+rel="api-catalog"[\s\S]*?\/?>/gi, '')
    .replace(/<link\s+rel="describedby"[\s\S]*?\/?>/gi, '')
    .replace(/<link\s+rel="sitemap"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\s+property="og:[^"]+"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?\/?>/gi, '')
    .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
}

function helmetHasRobots(head) {
  return /<meta\b[^>]*\bname=["']robots["'][^>]*>/i.test(head || '')
}

function stripHelmetAlternates(head) {
  return (head || '').replace(
    /<link\b[^>]*\brel=["']alternate["'][^>]*>/gi,
    '',
  )
}

function jsonLdScriptRe() {
  return /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
}

function decodeJsonLdInner(inner) {
  return inner
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

function extractJsonLdBlocks(html) {
  const blocks = []
  for (const match of (html || '').matchAll(jsonLdScriptRe())) {
    try {
      blocks.push(JSON.parse(decodeJsonLdInner(match[1])))
    } catch {
      // Helmet/prerender must still emit one valid graph below.
    }
  }
  return blocks
}

function stripJsonLdScripts(html) {
  return (html || '').replace(jsonLdScriptRe(), '')
}

function jsonLdNodes(data) {
  if (!data) return []
  if (Array.isArray(data)) return data.flatMap(jsonLdNodes)
  if (Array.isArray(data['@graph'])) return data['@graph']
  const node = { ...data }
  delete node['@context']
  return [node]
}

function jsonLdNodeKey(node) {
  if (node?.['@id']) return `id:${node['@id']}`
  const type = node?.['@type']
  const typeKey = Array.isArray(type) ? [...type].sort().join(',') : String(type || '')
  return `type:${typeKey}`
}

function pickRicherJsonLd(a, b) {
  return JSON.stringify(b).length > JSON.stringify(a).length ? b : a
}

function mergeJsonLd(routeLd, extraBlocks) {
  const merged = new Map()
  for (const node of [...jsonLdNodes(routeLd), ...extraBlocks.flatMap(jsonLdNodes)]) {
    const key = jsonLdNodeKey(node)
    const prev = merged.get(key)
    merged.set(key, prev ? pickRicherJsonLd(prev, node) : node)
  }
  const graph = [...merged.values()]
  if (graph.length === 0) return routeLd
  if (
    graph.length === 1 &&
    !routeLd?.['@graph'] &&
    extraBlocks.length === 0
  ) {
    return routeLd
  }
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

function helmetHeadWithoutJsonLd(head) {
  return stripHelmetAlternates(stripJsonLdScripts(head))
}

function seoHead(route, { omitRobots = false } = {}) {
  const url = `${SITE}${route.path}`
  const ogLocale = route.locale === 'es' ? 'es_MX' : 'en_US'
  const ogLocaleAlternate = route.locale === 'es' ? 'en_US' : 'es_MX'
  const modified = route.dateModified ?? route.datePublished
  const alternates = (route.alternates ?? []).map(
    (alt) =>
      `<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`,
  )
  return [
    `<!-- prerender:${route.path} -->`,
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="api-catalog" href="${SITE}/.well-known/api-catalog" type="application/linkset+json" />`,
    `<link rel="describedby" href="${SITE}/llms.txt" type="text/plain" />`,
    `<link rel="describedby" href="${SITE}/auth.md" type="text/markdown" />`,
    `<link rel="sitemap" href="${SITE}/sitemap.xml" type="application/xml" />`,
    ...alternates,
    ...(omitRobots
      ? []
      : [
          `<meta name="robots" content="${route.robots ?? (route.noindex ? 'noindex, follow' : 'index, follow')}" />`,
        ]),
    `<meta property="og:type" content="${route.ogType}" />`,
    `<meta property="og:site_name" content="RutinHQ" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    ...(route.alternates?.length
      ? [`<meta property="og:locale:alternate" content="${ogLocaleAlternate}" />`]
      : []),
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    ...(route.image
      ? [
          `<meta property="og:image" content="${route.image}" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta property="og:image:type" content="image/png" />`,
          `<meta property="og:image:alt" content="${esc(route.title)}" />`,
          `<meta name="twitter:image" content="${route.image}" />`,
          `<meta name="twitter:image:alt" content="${esc(route.title)}" />`,
        ]
      : []),
    ...(route.ogType === 'article' && route.datePublished
      ? [
          `<meta property="article:published_time" content="${route.datePublished}" />`,
        ]
      : []),
    ...(route.ogType === 'article' && modified
      ? [`<meta property="article:modified_time" content="${modified}" />`]
      : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<script type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>`,
  ].join('\n    ')
}

const NOT_FOUND_ROUTE = {
  path: '/404',
  renderPath: '/this-path-should-404',
  file: '404.html',
  title: 'RutinHQ — 404',
  description: 'That route does not exist.',
  ogType: 'website',
  locale: 'en',
  noindex: true,
  robots: 'noindex, nofollow',
  alternates: [],
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'RutinHQ — 404',
    description: 'That route does not exist.',
  },
}

function injectSsrBody(page, markup, label) {
  if (!page.includes('<!--ssr-outlet-->')) {
    console.error(`${label}: template missing <!--ssr-outlet--> — cannot inject SSR body.`)
    process.exit(1)
  }
  if (!markup || !markup.trim()) {
    console.error(`${label}: SSR render produced an empty body.`)
    process.exit(1)
  }
  return page.replace('<!--ssr-outlet-->', markup)
}

async function loadRender() {
  const { createServer } = await import('vite')
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  const mod = await vite.ssrLoadModule('/src/entry-server.tsx')
  if (typeof mod.render !== 'function') {
    await vite.close()
    console.error('src/entry-server.tsx must export render().')
    process.exit(1)
  }
  return {
    render: (url, lang) => mod.render(url, lang),
    close: () => vite.close(),
  }
}

function writePage(relFile, page, label) {
  const outPath = path.join(dist, relFile)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, page)
  console.log(`prerender ${label} → ${relFile}`)
}

async function main() {
  const templatePath = path.join(dist, 'index.html')
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html missing — run vite build first.')
    process.exit(1)
  }

  const template = fs.readFileSync(templatePath, 'utf8')

  if (!template.includes('application/ld+json')) {
    const hubHead = `<script type="application/ld+json">${JSON.stringify(HUB_JSON_LD)}</script>`
    if (!template.includes('</head>')) {
      console.error('dist/index.html has no </head> — cannot inject hub JSON-LD.')
      process.exit(1)
    }
    const withLd = template.replace('</head>', `    ${hubHead}\n  </head>`)
    fs.writeFileSync(templatePath, withLd)
    console.log('prerender / → index.html (hub JSON-LD)')
  }

  const pageTemplate = fs.readFileSync(templatePath, 'utf8')
  const { render, close } = await loadRender()

  try {
    for (const route of ROUTES) {
      let page = stripHomepageSeo(pageTemplate)
      if (!page.includes('</head>')) {
        console.error('dist/index.html has no </head> — cannot inject blog SEO.')
        process.exit(1)
      }
      if (!page.includes('<!--ssr-head-->')) {
        console.error('dist/index.html missing <!--ssr-head--> — Seo/Helmet robots cannot land.')
        process.exit(1)
      }
      const { html, head, htmlAttributes } = await render(route.path, route.locale)
      if (htmlAttributes) {
        page = page.replace(/<html[^>]*>/, `<html ${htmlAttributes}>`)
      } else if (route.locale === 'es') {
        page = page.replace('<html lang="en">', '<html lang="es">')
      }
      route.jsonLd = mergeJsonLd(route.jsonLd, extractJsonLdBlocks(head))
      page = page.replace('<!--ssr-head-->', helmetHeadWithoutJsonLd(head))
      page = page.replace(
        '</head>',
        `    ${seoHead(route, { omitRobots: helmetHasRobots(head) })}\n  </head>`,
      )
      page = injectSsrBody(page, html, route.path)
      writePage(route.file, page, route.path)
    }

    const hubPage = injectSsrBody(
      fs.readFileSync(templatePath, 'utf8'),
      (await render('/', 'en')).html,
      '/',
    )
    fs.writeFileSync(templatePath, hubPage)
    console.log('prerender / → index.html (SSR body)')

    let notFound = stripHomepageSeo(pageTemplate)
    const notFoundSsr = await render(NOT_FOUND_ROUTE.renderPath, 'en')
    if (notFoundSsr.htmlAttributes) {
      notFound = notFound.replace(
        /<html[^>]*>/,
        `<html ${notFoundSsr.htmlAttributes}>`,
      )
    }
    NOT_FOUND_ROUTE.jsonLd = mergeJsonLd(
      NOT_FOUND_ROUTE.jsonLd,
      extractJsonLdBlocks(notFoundSsr.head),
    )
    notFound = notFound.replace(
      '<!--ssr-head-->',
      helmetHeadWithoutJsonLd(notFoundSsr.head),
    )
    notFound = notFound.replace(
      '</head>',
      `    ${seoHead(NOT_FOUND_ROUTE, { omitRobots: helmetHasRobots(notFoundSsr.head) })}\n  </head>`,
    )
    notFound = injectSsrBody(notFound, notFoundSsr.html, NOT_FOUND_ROUTE.renderPath)
    writePage(NOT_FOUND_ROUTE.file, notFound, NOT_FOUND_ROUTE.renderPath)
    stampSitemapLastmod()
  } finally {
    await close()
  }
}

function stampSitemapLastmod() {
  const file = path.join(dist, 'sitemap.xml')
  if (!fs.existsSync(file)) return
  const locStamps = {
    'https://www.rutinhq.com/blog': CONTENT_STAMP,
    'https://www.rutinhq.com/es/blog': CONTENT_STAMP,
    'https://www.rutinhq.com/store-os': CONTENT_STAMP,
    'https://www.rutinhq.com/es/store-os': CONTENT_STAMP,
    'https://www.rutinhq.com/blog/shopify-admin-audit-before-ads':
      CONTENT_STAMP,
    'https://www.rutinhq.com/es/blog/auditoria-panel-shopify-antes-de-anuncios':
      '2026-11-22',
    'https://www.rutinhq.com/nexus-os': CONTENT_STAMP,
    'https://www.rutinhq.com/es/nexus-os': CONTENT_STAMP,
    'https://www.rutinhq.com/blog/agentic-marketing-paper-first-before-ads':
      '2026-11-22',
    'https://www.rutinhq.com/es/blog/marketing-agentico-en-papel-antes-de-anuncios':
      '2026-11-22',
  }
  const xml = fs.readFileSync(file, 'utf8').replace(
    /<url>([\s\S]*?)<\/url>/g,
    (block) => {
      const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1]
      const stamp = locStamps[loc]
      if (!stamp) return block
      return block.replace(
        /<lastmod>[^<]+<\/lastmod>/,
        `<lastmod>${stamp}</lastmod>`,
      )
    },
  )
  fs.writeFileSync(file, xml)
}

await main()
