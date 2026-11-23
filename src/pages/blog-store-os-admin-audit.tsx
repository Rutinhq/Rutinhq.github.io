import { BlogPostLayout, BlogTable } from '@/components/blog'
import { OG_IMAGE, Seo, articleJsonLd, hreflangPair } from '@/components/Seo'
import { ARTICLE02, ARTICLE02_ES, BLOG_ROBOTS, articleSeoTitle } from '@/lib/blog'
import {
  CALENDLY_URL,
  DOCS_STORE_URL,
  MAILTO_STORE,
  WWW_STORE_URL,
} from '@/lib/links'

const TITLE = articleSeoTitle(ARTICLE02.title)
const FAQ_SHEET = ARTICLE02.faq.find(
  (item) => item.q === 'Where’s the full system sheet?',
)!

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
        datePublished={ARTICLE02.datePublished}
        dateModified={ARTICLE02.dateModified}
        alternates={hreflangPair(ARTICLE02.path, ARTICLE02_ES.path)}
        image={OG_IMAGE.blog}
        jsonLd={articleJsonLd({
          path: ARTICLE02.path,
          headline: ARTICLE02.title,
          description: ARTICLE02.description,
          datePublished: ARTICLE02.datePublished,
          dateModified: ARTICLE02.dateModified,
          faq: ARTICLE02.faq,
        })}
      />

      <BlogPostLayout
        typeLabel="How-to · STORE OS"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Blog', to: '/blog' },
          { label: ARTICLE02.title },
        ]}
        title={ARTICLE02.title}
        lede={
          <p>
            Make the store convert before you buy ads. STORE OS is a{' '}
            <strong>replicable Shopify Admin audit + config</strong> — variants,
            price, weight, shipping — so ops friction stops killing conversion.
            The next step is STORE OS, not an ads campaign.
          </p>
        }
        faqTitle="FAQ"
        faq={ARTICLE02.faq.map((item) =>
          item.q === FAQ_SHEET.q
            ? {
                q: item.q,
                a: (
                  <p>
                    See the{' '}
                    <a
                      href={DOCS_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      STORE OS system sheet
                    </a>{' '}
                    and the{' '}
                    <a href={WWW_STORE_URL}>www.rutinhq.com/store-os</a> page.
                  </p>
                ),
              }
            : item,
        )}
        cta={{
          title: 'One SKU. One next step.',
          body: (
            <p>Book a 30-min fit call. The next step is STORE OS — not ads.</p>
          ),
          mailto: MAILTO_STORE,
          mailtoLabel: 'strategy@rutinhq.com',
          calendly: CALENDLY_URL,
          calendlyLabel: 'Book 30 min',
          lpHref: WWW_STORE_URL,
          lpLabel: 'www.rutinhq.com/store-os',
        }}
      >
        <h2>Why Admin before ads</h2>
        <p>
          Ads cannot fix a store that does not convert. STORE OS puts Shopify
          Admin first so ops friction stops killing conversion. The work is a
          replicable audit + config — not a theme rewrite, not creatives, not
          an ads agency. Ads / creatives stay out of scope; they live in NEXUS
          OS. The catalog outcome is a store that converts with less ops
          friction, coherent Admin config, and a base ready before ad spend.
        </p>

        <h2>How STORE OS works</h2>
        <p>
          The machine stays fixed. Each install follows the same order. Nothing
          skipped. Theme files stay out of the path.
        </p>
        <BlogTable
          headers={['Step', 'What happens']}
          rows={[
            ['1', 'Scorecard / Admin friction diagnosis'],
            ['2', 'Audit: variants, price, weight, shipping'],
            ['3', 'Admin config to the mold (no theme file edits)'],
            ['4', 'Delivery checklist + handoff'],
            ['5', 'Ads / creatives = out of scope (NEXUS OS)'],
          ]}
        />

        <h2>Scorecard / Admin friction diagnosis</h2>
        <p>
          The first step names ops friction in Shopify Admin. It is a scorecard
          of the Admin surface — not invented scores, not a case study, not a
          theme audit. Founder / ecom lead on DTC Shopify is the reader: they
          want ads, but the store does not convert yet.
        </p>
        <h2>Audit: variants, price, weight, shipping</h2>
        <p>
          The audit is replicable and bounded. STORE OS touches four Admin
          fields: variants, price, weight, shipping. Someone else’s catalog
          defaults or shipping rates are not the deliverable. Bots placing
          purchase orders are not the deliverable. The audit does not become
          Dawn file editing.
        </p>

        <h2>Admin config to the mold</h2>
        <p>
          After the audit, Admin config follows the mold. Config only — no
          theme file edits. The mold is the delivery pattern from the STORE OS
          sheet, not a second theme and not an ads campaign parked inside
          Admin.
        </p>
        <p className="note">
          Proof of work:{' '}
          <a href={DOCS_STORE_URL} target="_blank" rel="noopener noreferrer">
            STORE OS catalog
          </a>
        </p>

        <h2>Delivery checklist + handoff</h2>
        <p>
          Delivery is a checklist plus handoff so the team owns the Admin after
          install. That is the difference between installing a system and
          renting a seat: the Admin stays with the client. Handoff does not
          include ads; creatives stay in NEXUS OS.
        </p>

        <h2>Who this is for / not for</h2>
        <BlogTable
          headers={['For', 'Not for']}
          rows={[
            ['Founder / ecom lead on DTC Shopify', 'Theme-only work'],
            ['Ops friction', 'Ads with no converting store'],
            [
              'Wants ads but store doesn’t convert yet',
              'Creatives-only',
            ],
            [
              'Willing to own the Admin after install',
              'Shopify Plus with no Admin owner',
            ],
          ]}
        />

        <h2>Out of scope</h2>
        <p>
          STORE OS is not an ads agency. It is not theme / Dawn file editing.
          It is not someone else’s catalog defaults or shipping rates. It is
          not bots placing purchase orders. Ads / creatives = NEXUS OS. The
          store converts first; spend comes after.
        </p>
      </BlogPostLayout>
    </>
  )
}
