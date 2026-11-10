export const ARTICLE01_PATH =
  '/blog/icp-gated-cold-outbound-without-rented-sdr' as const
export const ARTICLE01_ES_PATH =
  '/es/blog/outbound-frio-con-icp-sin-sdr-rentado' as const
export const ARTICLE02_PATH = '/blog/shopify-admin-audit-before-ads' as const

/** Capo GO 23 Sep: blog index + articles are indexable.
 *  Capo 4 Nov 2026: Article02 stays indexable (do not apply the noindex option). */
export const BLOG_ROBOTS = 'index, follow' as const

export const BLOG_INDEX_FAQ = [
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
    a: 'GTM OS, Store OS, and NEXUS OS on this site. Catalog curriculum also lives at docs.rutinhq.com/catalog.',
  },
] as const

export const BLOG_INDEX_FAQ_ES = [
  {
    q: '¿Qué es el blog de RutinHQ?',
    a: 'Radar para fundadores que instalan sistemas de GTM y operación — no asientos rentados.',
  },
  {
    q: '¿Qué señal filtra este radar?',
    a: 'Fit de perfil de cliente ideal (ICP), un dolor real de operación/GTM, interés de producto y lenguaje de fundador / CEO / responsable de operación — luego un sistema que se queda con su equipo.',
  },
  {
    q: '¿Esto es un pozo de contenido?',
    a: 'No. El CTA en cada camino es discovery (strategy@) — no un pozo de contenido. Siguiente paso: discovery; educate-forever, nunca.',
  },
  {
    q: '¿Dónde viven los sistemas?',
    a: 'GTM OS, STORE OS y NEXUS OS en este sitio. El temario del catálogo también vive en docs.rutinhq.com/catalog.',
  },
] as const

export const BLOG_INDEX = {
  title: 'Blog — systems you own',
  description:
    'Radar for founders who install GTM and ops systems — not rented seats.',
  path: '/blog',
  alternatePath: '/es/blog',
  draft: false,
  noindex: false,
  faq: BLOG_INDEX_FAQ,
} as const

export const BLOG_INDEX_ES = {
  title: 'Blog — sistemas que usted posee',
  description:
    'Radar para fundadores que instalan sistemas de GTM y operación — no asientos rentados.',
  path: '/es/blog',
  alternatePath: '/blog',
  draft: false,
  noindex: false,
  faq: BLOG_INDEX_FAQ_ES,
} as const

export function articleSeoTitle(title: string) {
  return `RutinHQ — ${title}`
}

export const ARTICLE01 = {
  title: 'ICP-gated cold outbound without a rented SDR',
  description:
    'Keep the outbound core fixed—change only ICP, message, and filters—so pipeline stays with your team when the contract ends.',
  slug: 'icp-gated-cold-outbound-without-rented-sdr',
  path: ARTICLE01_PATH,
  alternatePath: ARTICLE01_ES_PATH,
  type: 'how-to',
  sku: 'gtm-os',
  job: 'Gate cold outbound by ICP before volume.',
  cta: 'strategy@',
  draft: false,
  noindex: false,
  inLanguage: 'en',
  author: 'RutinHQ',
  datePublished: '2026-09-08',
  dateModified: '2026-09-08',
  faq: [
    {
      q: 'Is this hiring an SDR?',
      a: 'No. It’s a prospecting system installed in your team so outbound survives when the agency leaves.',
    },
    {
      q: 'Do you skip ICP validation to go faster?',
      a: 'No. No volume without a correct ICP; no next vertical without signal from the prior.',
    },
    {
      q: 'What changes per vertical?',
      a: 'Language, filters, and angle — not the milestone core.',
    },
    {
      q: 'Where’s the full system sheet?',
      a: 'See the GTM OS catalog ficha at https://docs.rutinhq.com/catalog/gtm-os/ and the https://www.rutinhq.com/gtm-os page.',
    },
  ],
} as const

export const ARTICLE01_ES = {
  title: 'Prospección en frío con perfil de cliente ideal (ICP) — sin SDR rentado',
  description:
    'Mantenga fijo el núcleo de la prospección en frío; cambie solo ICP, mensaje y filtros — el flujo de ventas se queda con su equipo cuando termina el contrato.',
  slug: 'outbound-frio-con-icp-sin-sdr-rentado',
  path: ARTICLE01_ES_PATH,
  alternatePath: ARTICLE01_PATH,
  type: 'how-to',
  sku: 'gtm-os',
  job: 'Cierra la prospección en frío con ICP antes del volumen.',
  cta: 'strategy@',
  draft: false,
  noindex: false,
  inLanguage: 'es',
  author: 'RutinHQ',
  datePublished: '2026-09-08',
  dateModified: '2026-09-08',
  faq: [
    {
      q: '¿Esto es contratar un SDR?',
      a: 'No. Es un sistema de prospección instalado en su equipo para que la prospección en frío sobreviva cuando la agencia se va.',
    },
    {
      q: '¿Se salta la validación de ICP para ir más rápido?',
      a: 'No. Sin ICP correcto no hay volumen; sin señal del vertical previo no hay siguiente vertical.',
    },
    {
      q: '¿Qué cambia por vertical?',
      a: 'Lenguaje, filtros y ángulo — no el núcleo de etapas.',
    },
    {
      q: '¿Dónde está la ficha del sistema?',
      a: 'Mire la ficha GTM OS en catalog y la página /gtm-os.',
    },
  ],
} as const

export const ARTICLE02 = {
  title: 'Shopify Admin audit before you buy ads',
  description:
    'Replicable Shopify Admin audit + config — variants, price, weight, shipping — so ops friction stops killing conversion.',
  slug: 'shopify-admin-audit-before-ads',
  path: ARTICLE02_PATH,
  type: 'how-to',
  sku: 'store-os',
  job: 'Audit Admin friction before ad spend.',
  cta: 'strategy@',
  draft: true,
  /** Capo 4 Nov 2026: outline may stay visually DRAFT; robots stay index,follow. */
  noindex: false,
  inLanguage: 'en',
  author: 'RutinHQ',
  datePublished: '2026-09-13',
  dateModified: '2026-09-13',
  outline: [
    {
      heading: 'Why Admin before ads',
      note: 'DRAFT — catalog language only. Store converts before ad spend.',
    },
    {
      heading: 'Scorecard / Admin friction diagnosis',
      note: 'DRAFT — name ops friction; no invented scores or case studies.',
    },
    {
      heading: 'Audit: variants, price, weight, shipping',
      note: 'DRAFT — replicable Shopify Admin audit from the Store OS sheet.',
    },
    {
      heading: 'Admin config to the mold',
      note: 'DRAFT — config only; no theme / Dawn file edits.',
    },
    {
      heading: 'Delivery checklist + handoff',
      note: 'DRAFT — team owns the Admin after install.',
    },
    {
      heading: 'Out of scope',
      note: 'DRAFT — Ads / creatives = NEXUS OS. Theme-only work is not Store OS.',
    },
  ],
} as const

export const BLOG_FEATURED = [
  { path: ARTICLE01.path, name: ARTICLE01.title },
  { path: ARTICLE02.path, name: ARTICLE02.title },
] as const

export const BLOG_FILTER_SIGNALS = [
  { name: 'ICP fit', thesis: 'Vertical / buyer role' },
  { name: 'Pain', thesis: 'Pipeline, handoff, ICP, lean ops friction' },
  { name: 'SKU interest', thesis: 'Which OS page they open' },
  { name: 'Seniority', thesis: 'Founder / CEO / ops lead language' },
] as const

export const BLOG_FEATURED_COMING = [
  {
    title: 'What “systems you own” means for a B2B founder',
    type: 'framework',
  },
  {
    title: 'Radar → Blueprint → OS: pick the bottleneck before you buy build',
    type: 'how-to',
  },
  {
    title: 'Agency retainer vs outbound OS install',
    type: 'comparison',
  },
] as const

export const BLOG_FILTER_SIGNALS_ES = [
  { name: 'Fit de perfil de cliente ideal (ICP)', thesis: 'Vertical / rol del comprador' },
  { name: 'Dolor', thesis: 'Flujo de ventas, handoff, ICP, fricción de operación lean' },
  { name: 'Interés de producto', thesis: 'Qué página OS abren' },
  { name: 'Seniority', thesis: 'Lenguaje de fundador / CEO / responsable de operación' },
] as const

export const BLOG_FEATURED_COMING_ES = [
  {
    title: 'Qué significa “sistemas que usted posee” para un fundador B2B',
    type: 'framework',
  },
  {
    title: 'Radar → Blueprint → OS: el cuello antes de comprar build',
    type: 'guía práctica',
  },
  {
    title: 'Iguala mensual de agencia vs instalar un OS de prospección en frío',
    type: 'comparison',
  },
] as const

export { localePath } from './i18n/paths'
