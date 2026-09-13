import { BlogPostLayout } from '@/components/blog'
import { OG_IMAGE, Seo, articleJsonLd } from '@/components/Seo'
import { ARTICLE02, BLOG_ROBOTS, articleSeoTitle } from '@/lib/blog'
import {
  CALENDLY_URL,
  DOCS_STORE_URL,
  MAILTO_STORE,
  WWW_STORE_URL,
} from '@/lib/links'

const TITLE = articleSeoTitle(ARTICLE02.title)

export default function BlogStoreOsAdminAuditPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE02.description}
        path={ARTICLE02.path}
        locale="en"
        noindex={ARTICLE02.noindex}
        robots={BLOG_ROBOTS}
        ogType="article"
        image={OG_IMAGE.blog}
        jsonLd={articleJsonLd({
          path: ARTICLE02.path,
          headline: ARTICLE02.title,
          description: ARTICLE02.description,
          datePublished: ARTICLE02.datePublished,
          dateModified: ARTICLE02.dateModified,
          faq: [],
        })}
      />

      <BlogPostLayout
        typeLabel="How-to · STORE OS · DRAFT"
        draft={ARTICLE02.draft}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Blog', to: '/blog' },
          { label: ARTICLE02.title },
        ]}
        title={ARTICLE02.title}
        lede={
          <p>
            <strong>DRAFT</strong> shell — title, outline, and CTA only. Copy
            below is catalog language from STORE OS. No invented metrics, case
            studies, or prices.
          </p>
        }
        cta={{
          title: 'One SKU. One next step.',
          body: (
            <p>
              Book a 30-min fit call or write strategy@rutinhq.com. Next desk is
              STORE OS — not ads.
            </p>
          ),
          mailto: MAILTO_STORE,
          mailtoLabel: 'strategy@rutinhq.com',
          calendly: CALENDLY_URL,
          calendlyLabel: 'Book 30 min',
          lpHref: WWW_STORE_URL,
          lpLabel: 'www.rutinhq.com/store-os',
        }}
      >
        <h2>Outline (DRAFT)</h2>
        <p>
          Make the store convert before you buy ads. Replicable Shopify Admin
          audit + config — variants, price, weight, shipping — so ops friction
          stops killing conversion.
        </p>
        <ol>
          {ARTICLE02.outline.map((item) => (
            <li key={item.heading}>
              <strong>{item.heading}</strong>
              <p className="note">{item.note}</p>
            </li>
          ))}
        </ol>

        <h2>For / not for (catalog)</h2>
        <ul>
          <li>For: founder / ecom lead on DTC Shopify; ops friction; wants ads but the store does not convert yet.</li>
          <li>Not for: theme-only work; ads with no converting store; creatives-only; Plus enterprise with no Admin owner.</li>
        </ul>

        <p className="note">
          Curriculum proof:{' '}
          <a href={DOCS_STORE_URL} target="_blank" rel="noopener noreferrer">
            STORE OS catalog
          </a>
          . Ads / creatives stay out of scope (NEXUS OS).
        </p>
      </BlogPostLayout>
    </>
  )
}
