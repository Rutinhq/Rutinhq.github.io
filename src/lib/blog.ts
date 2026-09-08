export type BlogSection = {
  heading: string
  body: string
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  datePublished: string
  demo: boolean
  lede: string
  sections: BlogSection[]
}

export const BLOG_INDEX_PATH = '/blog'

/** Public notes. EN-first marketing copy; demo posts are catalog restatements. */
export const POSTS: BlogPost[] = [
  {
    slug: 'choose-a-system',
    title: 'How to choose GTM OS, Store OS, or NEXUS OS',
    description:
      'Match the installable system to the bottleneck you can name: outbound, store conversion, or paper-first demand work.',
    datePublished: '2026-09-08',
    demo: true,
    lede:
      'Start with the bottleneck you can name. Repeatable outbound is GTM OS. A store that does not convert is Store OS. Demand work that stays on paper until spend is signed is NEXUS OS. One page, one SKU — do not stack them because a page exists.',
    sections: [
      {
        heading: 'What “installable” means',
        body: 'An installable operating system is a system your team keeps after the install. Language, filters, and angle can change; the core stays. It is not a retainer that vanishes when a contract ends, and it is not a wiki for someone else’s product.',
      },
      {
        heading: 'Three questions',
        body: 'If the bottleneck is a pipeline you cannot run twice the same way, read GTM OS. If Admin friction (variants, price, weight, shipping) is killing conversion before ads make sense, read Store OS. If you want a demand system that stays paper-only until creatives, mix, and budget have an explicit GO, read NEXUS OS.',
      },
      {
        heading: 'What this note is not',
        body: 'This is a sample article for the public notes scaffold. It restates the catalog. It does not add offers, outcomes, or case claims.',
      },
    ],
  },
]

export function getPost(slug: string | undefined) {
  if (!slug) return undefined
  return POSTS.find((post) => post.slug === slug)
}

export function postPath(slug: string) {
  return `${BLOG_INDEX_PATH}/${slug}`
}

export function sitemapBlogPaths() {
  return [BLOG_INDEX_PATH, ...POSTS.map((post) => postPath(post.slug))]
}
