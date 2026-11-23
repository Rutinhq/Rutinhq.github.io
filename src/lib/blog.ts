import { CONTENT_STAMP } from './content-stamp'

export const ARTICLE01_PATH =
  '/blog/icp-gated-cold-outbound-without-rented-sdr' as const
export const ARTICLE01_ES_PATH =
  '/es/blog/outbound-frio-con-icp-sin-sdr-rentado' as const
export const ARTICLE02_PATH = '/blog/shopify-admin-audit-before-ads' as const
export const ARTICLE02_ES_PATH =
  '/es/blog/auditoria-panel-shopify-antes-de-anuncios' as const
export const ARTICLE03_PATH =
  '/blog/agentic-marketing-paper-first-before-ads' as const
export const ARTICLE03_ES_PATH =
  '/es/blog/marketing-agentico-en-papel-antes-de-anuncios' as const

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
    'Radar para fundadores que instalan sistemas de prospección y operación — no asientos rentados.',
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
      a: 'Mire la ficha GTM OS en el catálogo y la página /es/gtm-os.',
    },
  ],
} as const

export const ARTICLE02 = {
  title: 'Shopify Admin audit before you buy ads',
  description:
    'Replicable Shopify Admin audit + config — variants, price, weight, shipping — so ops friction stops killing conversion.',
  slug: 'shopify-admin-audit-before-ads',
  path: ARTICLE02_PATH,
  alternatePath: ARTICLE02_ES_PATH,
  type: 'how-to',
  sku: 'store-os',
  job: 'Audit Admin friction before ad spend.',
  cta: 'strategy@',
  draft: false,
  noindex: false,
  inLanguage: 'en',
  author: 'RutinHQ',
  datePublished: '2026-09-13',
  dateModified: CONTENT_STAMP,
  faq: [
    {
      q: 'What is STORE OS?',
      a: 'Make the store convert before you buy ads. Replicable Shopify Admin audit + config — variants, price, weight, shipping — so ops friction stops killing conversion.',
    },
    {
      q: 'Who is STORE OS for?',
      a: 'Founder / ecom lead on DTC Shopify. Ops friction. Wants ads but store doesn’t convert yet.',
    },
    {
      q: 'Does STORE OS buy ads or edit the theme?',
      a: 'No. Ads / creatives = out of scope (NEXUS OS). Theme / Dawn file editing is not STORE OS. Config only — no theme file edits.',
    },
    {
      q: 'Where’s the full system sheet?',
      a: 'See the STORE OS system sheet and the www.rutinhq.com/store-os page.',
    },
  ],
} as const

export const ARTICLE02_ES = {
  title: 'Auditoría del panel de Shopify antes de comprar anuncios',
  description:
    'Auditoría y configuración del panel de Shopify — variantes, precio, peso, envío — para que la tienda convierta antes de gastar en anuncios.',
  slug: 'auditoria-panel-shopify-antes-de-anuncios',
  path: ARTICLE02_ES_PATH,
  alternatePath: ARTICLE02_PATH,
  type: 'how-to',
  sku: 'store-os',
  job: 'Audite la fricción del panel de Shopify antes de gastar en anuncios.',
  cta: 'strategy@',
  draft: false,
  noindex: false,
  inLanguage: 'es',
  author: 'RutinHQ',
  datePublished: CONTENT_STAMP,
  dateModified: CONTENT_STAMP,
  faq: [
    {
      q: '¿Qué es STORE OS?',
      a: 'Auditoría y configuración del panel de Shopify para que la tienda convierta antes de gastar en anuncios.',
    },
    {
      q: '¿Para quién es STORE OS?',
      a: 'Marcas que venden directo al consumidor en Shopify. Hay fricción en la operación de la tienda. Quiere anuncios, pero la tienda aún no convierte.',
    },
    {
      q: '¿STORE OS compra anuncios o edita la plantilla?',
      a: 'No. No incluye anuncios ni creatividades — quedan fuera de alcance y viven en NEXUS OS. No es edición de plantilla / Dawn. Configuración del panel, sin editar archivos de plantilla.',
    },
    {
      q: '¿Dónde está la ficha del sistema?',
      a: 'Mire la ficha STORE OS en el catálogo y la página www.rutinhq.com/es/store-os.',
    },
  ],
} as const

export const ARTICLE03 = {
  title: 'Agentic marketing: paper first, Ads only when signed',
  description:
    'Strategy → Social → Ads. Until creatives, mix, and budget have an explicit sign-off: paper only (no pixel, no spend).',
  slug: 'agentic-marketing-paper-first-before-ads',
  path: ARTICLE03_PATH,
  alternatePath: ARTICLE03_ES_PATH,
  type: 'how-to',
  sku: 'nexus-os',
  job: 'Park Ads until creatives, mix, and budget are signed.',
  cta: 'strategy@',
  draft: false,
  noindex: false,
  inLanguage: 'en',
  author: 'RutinHQ',
  datePublished: CONTENT_STAMP,
  dateModified: CONTENT_STAMP,
  faq: [
    {
      q: 'What is NEXUS OS?',
      a: 'Agentic marketing — paper first, Ads only when signed. Strategy → Social → Ads. Until creatives, mix, and budget have an explicit sign-off: paper only (no pixel, no spend).',
    },
    {
      q: 'Who is NEXUS OS for?',
      a: 'Retailer / ecom with clear offer and SKUs. Wants demand from social as a system. Brand voice owned by the client’s ops/marketing (NEXUS does not invent ICP or offer).',
    },
    {
      q: 'When do Ads go live?',
      a: 'Ads stay parked until creatives, mix, and budget are signed. Until that explicit sign-off: paper only (no pixel, no spend). Live Ads, pixel, or spend without explicit sign-off is out of scope.',
    },
    {
      q: 'Where’s the full system sheet?',
      a: 'See the NEXUS OS system sheet and the www.rutinhq.com/nexus-os page.',
    },
  ],
} as const

export const ARTICLE03_ES = {
  title: 'Marketing agéntico en papel antes de comprar anuncios',
  description:
    'Estrategia → Social → Ads. Hasta que apruebe las creatividades, la mezcla y el presupuesto: solo papel (sin píxel, sin gasto).',
  slug: 'marketing-agentico-en-papel-antes-de-anuncios',
  path: ARTICLE03_ES_PATH,
  alternatePath: ARTICLE03_PATH,
  type: 'how-to',
  sku: 'nexus-os',
  job: 'Anuncios en pausa hasta que apruebe creatividades, mezcla y presupuesto.',
  cta: 'strategy@',
  draft: false,
  noindex: false,
  inLanguage: 'es',
  author: 'RutinHQ',
  datePublished: CONTENT_STAMP,
  dateModified: CONTENT_STAMP,
  faq: [
    {
      q: '¿Qué es NEXUS OS?',
      a: 'Marketing agéntico — primero en papel, anuncios solo con aprobación explícita. Estrategia → Social → Ads. Hasta que apruebe las creatividades, la mezcla y el presupuesto: solo papel (sin píxel, sin gasto).',
    },
    {
      q: '¿Para quién es NEXUS OS?',
      a: 'Minorista / tienda en línea con oferta y productos claros. Quiere demanda desde social como sistema. La voz de marca la define el equipo de operación y marketing del cliente (NEXUS no inventa el perfil de cliente ideal (ICP) ni la oferta).',
    },
    {
      q: '¿Cuándo se activan los anuncios?',
      a: 'Anuncios en pausa hasta que apruebe las creatividades, la mezcla y el presupuesto. Hasta esa aprobación explícita: solo papel (sin píxel, sin gasto). Anuncios en vivo, píxel o gasto sin aprobación explícita quedan fuera de NEXUS OS.',
    },
    {
      q: '¿Dónde está la ficha del sistema?',
      a: 'Mire la ficha NEXUS OS en el catálogo y la página www.rutinhq.com/es/nexus-os.',
    },
  ],
} as const

export const BLOG_FEATURED = [
  { path: ARTICLE01.path, name: ARTICLE01.title },
  { path: ARTICLE02.path, name: ARTICLE02.title },
  { path: ARTICLE03.path, name: ARTICLE03.title },
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
  { name: 'Encaje de perfil de cliente ideal (ICP)', thesis: 'Vertical / rol del comprador' },
  { name: 'Dolor', thesis: 'Flujo de ventas, traspaso, ICP, poca fricción de operación' },
  { name: 'Interés de producto', thesis: 'Qué página de sistema abren' },
  { name: 'Cargo', thesis: 'Lenguaje de fundador / director general / responsable de operación' },
] as const

export const BLOG_FEATURED_COMING_ES = [
  {
    title: 'Qué significa “sistemas que usted posee” para un fundador B2B',
    type: 'marco',
  },
  {
    title: 'Radar → esquema → sistema: el cuello antes de comprar desarrollo',
    type: 'guía práctica',
  },
  {
    title: 'Iguala mensual de agencia frente a instalar un sistema de prospección en frío',
    type: 'comparación',
  },
] as const

export { localePath } from './i18n/paths'
