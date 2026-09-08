export const ARTICLE01_PATH =
  '/blog/icp-gated-cold-outbound-without-rented-sdr' as const
export const ARTICLE01_ES_PATH =
  '/es/blog/outbound-frio-con-icp-sin-sdr-rentado' as const

export const BLOG_INDEX = {
  title: 'Blog — systems you own',
  description:
    'Radar for founders who install GTM and ops systems — not rented seats.',
  path: '/blog',
  alternatePath: '/es/blog',
  draft: false,
  noindex: false,
} as const

export const BLOG_INDEX_ES = {
  title: 'Blog — sistemas que posees',
  description:
    'Radar para founders que instalan sistemas de GTM y ops — no asientos rentados.',
  path: '/es/blog',
  alternatePath: '/blog',
  draft: false,
  noindex: false,
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
  title: 'Outbound frío con ICP — sin SDR rentado',
  description:
    'Mantén fijo el núcleo del outbound; cambia solo ICP, mensaje y filtros — el pipeline se queda con tu equipo cuando termina el contrato.',
  slug: 'outbound-frio-con-icp-sin-sdr-rentado',
  path: ARTICLE01_ES_PATH,
  alternatePath: ARTICLE01_PATH,
  type: 'how-to',
  sku: 'gtm-os',
  job: 'Cierra el outbound frío con ICP antes del volumen.',
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
      a: 'No. Es un sistema de prospección instalado en tu equipo para que el outbound sobreviva cuando la agencia se va.',
    },
    {
      q: '¿Se salta la validación de ICP para ir más rápido?',
      a: 'No. Sin ICP correcto no hay volumen; sin señal del vertical previo no hay siguiente vertical.',
    },
    {
      q: '¿Qué cambia por vertical?',
      a: 'Lenguaje, filtros y ángulo — no el núcleo de milestones.',
    },
    {
      q: '¿Dónde está la ficha del sistema?',
      a: 'Mira la ficha GTM OS en catalog y la página /gtm-os.',
    },
  ],
} as const

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
  { name: 'Fit de ICP', thesis: 'Vertical / rol del buyer' },
  { name: 'Dolor', thesis: 'Pipeline, handoff, ICP, fricción de ops lean' },
  { name: 'Interés de SKU', thesis: 'Qué página OS abren' },
  { name: 'Seniority', thesis: 'Lenguaje founder / CEO / lead de ops' },
] as const

export const BLOG_FEATURED_COMING_ES = [
  {
    title: 'Qué significa “sistemas que posees” para un founder B2B',
    type: 'framework',
  },
  {
    title: 'Radar → Blueprint → OS: el cuello antes de comprar build',
    type: 'how-to',
  },
  {
    title: 'Retainer de agencia vs instalar un OS de outbound',
    type: 'comparison',
  },
] as const

export { localePath } from './i18n/paths'
