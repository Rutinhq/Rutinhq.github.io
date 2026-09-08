export const ARTICLE01_PATH =
  '/blog/icp-gated-cold-outbound-without-rented-sdr' as const

export const BLOG_INDEX = {
  title: 'Blog — systems you own',
  description:
    'Radar for founders who install GTM and ops systems — not rented seats.',
  path: '/blog/',
} as const

export const ARTICLE01 = {
  title: 'ICP-gated cold outbound without a rented SDR',
  description:
    'Keep the outbound core fixed—change only ICP, message, and filters—so pipeline stays with your team when the contract ends.',
  slug: 'icp-gated-cold-outbound-without-rented-sdr',
  path: ARTICLE01_PATH,
  type: 'how-to',
  sku: 'gtm-os',
  job: 'Gate cold outbound by ICP before volume.',
  cta: 'strategy@',
  draft: true,
  noindex: true,
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
      a: 'See the GTM OS catalog ficha and the /gtm-os page.',
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
