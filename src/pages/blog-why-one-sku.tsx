import { Link } from 'react-router-dom'
import { Section } from '@/components/Section'
import { Seo } from '@/components/Seo'
import { DOCS_CATALOG_URL } from '@/lib/links'

const PATH = '/blog/why-one-sku'
const TITLE = 'RutinHQ — Why one page, one SKU (draft)'
const DESCRIPTION =
  'Placeholder. How GTM OS, Store OS, and NEXUS OS stay one page, one SKU. Not for search.'

export default function BlogWhyOneSkuPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        path={PATH}
        noindex
        ogType="article"
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          DRAFT · not indexed
        </p>
        <p className="mt-3 font-mono text-[12px] tracking-[0.04em] text-muted-foreground">
          <Link to="/blog" className="hover:text-foreground">
            Blog
          </Link>
          {' / '}
          Why one page, one SKU
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          Why one page, one SKU
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          Placeholder article. Not for search. Canonical host is{' '}
          <span className="text-foreground">www.rutinhq.com</span>. Remove the
          DRAFT label, drop noindex, and add this URL to sitemap.xml only when
          the post is ready to crawl.
        </p>
      </Section>

      <Section>
        <div className="max-w-2xl space-y-6 text-[16px] leading-7 text-foreground">
          <p>
            RutinHQ sells three installable operating systems. Each one gets its
            own page. The hub lists them; it does not mix offers.
          </p>
          <p>
            If the bottleneck is repeatable B2B pipeline, start with{' '}
            <Link
              to="/gtm-os"
              className="underline underline-offset-4 hover:text-primary"
            >
              GTM OS
            </Link>
            — cold, ICP-filtered outbound that stays with the team.
          </p>
          <p>
            Store OS is Shopify Admin audit and config. NEXUS OS is paper-first
            social and Ads, gated until creatives, mix, and budget are signed.
            Curriculum for every SKU lives in the catalog at{' '}
            <a
              href={DOCS_CATALOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              docs.rutinhq.com/catalog/
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  )
}
