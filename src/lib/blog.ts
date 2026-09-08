export const ARTICLE01_PATH =
  '/blog/icp-gated-cold-outbound-without-rented-sdr' as const

export const ARTICLE01 = {
  title: 'ICP-gated cold outbound without a rented SDR',
  description:
    'Keep the outbound core fixed—change only ICP, message, and filters—so pipeline stays with your team when the contract ends.',
  slug: 'icp-gated-cold-outbound-without-rented-sdr',
  path: ARTICLE01_PATH,
  type: 'how-to',
  sku: 'gtm-os',
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

export const BLOG_PILLARS = [
  {
    id: 'P1',
    name: 'Growth systems GTM',
    thesis: 'Loops, milestones, ICP gates, pipeline machines.',
    status: 'live',
  },
  {
    id: 'P2',
    name: 'AI agentic ops',
    thesis: 'Rails and charters we install — not eng-culture essays.',
    status: 'live',
  },
  {
    id: 'P3',
    name: 'Automation / lean',
    thesis: 'Workflows that survive handoff. Continuous improvement.',
    status: 'live',
  },
  {
    id: 'P6',
    name: 'Solopreneur owning the machine',
    thesis: 'Dual-desk entrepreneurship. Own the system, not the retainer.',
    status: 'live',
  },
  {
    id: 'P4',
    name: 'Store & conversion ops',
    thesis: 'Admin friction. Convert before ads.',
    status: 'coming',
  },
  {
    id: 'P5',
    name: 'Demand paper → Ads gated',
    thesis: 'Content systems, creative banks, spend gates.',
    status: 'coming',
  },
] as const

export const BLOG_SKUS = [
  { key: 'gtm', href: '/gtm-os' },
  { key: 'store', href: '/store-os' },
  { key: 'nexus', href: '/nexus-os' },
] as const
