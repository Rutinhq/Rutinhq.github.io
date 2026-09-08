import { Link } from 'react-router-dom'
import { Section } from '@/components/Section'
import { Seo } from '@/components/Seo'

const ARTICLE = {
  href: '/blog/why-one-sku',
  title: 'Why one page, one SKU',
  lede: 'DRAFT placeholder. How GTM OS, Store OS, and NEXUS OS stay one page each.',
} as const

export default function BlogPage() {
  return (
    <>
      <Seo
        title="RutinHQ — Blog (draft)"
        description="Draft notes. Not indexed. One SKU per page — GTM OS, Store OS, NEXUS OS."
        path="/blog"
        noindex
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          DRAFT · not indexed
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          Notes
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          Placeholder blog scaffold. Commercial copy stays EN. This index and
          the sample article are noindex and are not in sitemap.xml — four www
          URLs only until a post is ready to crawl.
        </p>
      </Section>

      <Section>
        <article className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            DRAFT
          </p>
          <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em]">
            <Link to={ARTICLE.href} className="hover:text-primary">
              {ARTICLE.title}
            </Link>
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground">{ARTICLE.lede}</p>
          <p className="mt-6">
            <Link
              to={ARTICLE.href}
              className="font-mono text-[12px] tracking-[0.04em] text-foreground underline underline-offset-4 hover:text-primary"
            >
              Read draft
            </Link>
          </p>
        </article>
      </Section>
    </>
  )
}
