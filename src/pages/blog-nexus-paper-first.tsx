import { BlogPostLayout, BlogTable } from '@/components/blog'
import { OG_IMAGE, Seo, articleJsonLd, hreflangPair } from '@/components/Seo'
import { ARTICLE03, ARTICLE03_ES, BLOG_ROBOTS, articleSeoTitle } from '@/lib/blog'
import {
  CALENDLY_URL,
  DOCS_NEXUS_URL,
  MAILTO_NEXUS,
  WWW_NEXUS_URL,
} from '@/lib/links'

const TITLE = articleSeoTitle(ARTICLE03.title)

export default function BlogNexusPaperFirstPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE03.description}
        path={ARTICLE03.path}
        locale="en"
        noindex={ARTICLE03.noindex}
        robots={BLOG_ROBOTS}
        ogType="article"
        datePublished={ARTICLE03.datePublished}
        dateModified={ARTICLE03.dateModified}
        alternates={hreflangPair(ARTICLE03.path, ARTICLE03_ES.path)}
        image={OG_IMAGE.blog}
        jsonLd={articleJsonLd({
          path: ARTICLE03.path,
          headline: ARTICLE03.title,
          description: ARTICLE03.description,
          datePublished: ARTICLE03.datePublished,
          dateModified: ARTICLE03.dateModified,
          faq: ARTICLE03.faq,
        })}
      />

      <BlogPostLayout
        typeLabel="How-to · NEXUS OS"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Blog', to: '/blog' },
          { label: ARTICLE03.title },
        ]}
        title={ARTICLE03.title}
        lede={
          <p>
            Agentic marketing — paper first, Ads only when signed. NEXUS OS
            runs <strong>Strategy → Social → Ads</strong>. Until creatives,
            mix, and budget have an explicit GO: paper only (no pixel, no
            spend).
          </p>
        }
        faqTitle="FAQ"
        faq={ARTICLE03.faq.map((item) =>
          item.q === 'Where’s the full system sheet?'
            ? {
                q: item.q,
                a: (
                  <p>
                    See the{' '}
                    <a
                      href={DOCS_NEXUS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      NEXUS OS catalog ficha
                    </a>{' '}
                    and the{' '}
                    <a href={WWW_NEXUS_URL}>www.rutinhq.com/nexus-os</a> page.
                  </p>
                ),
              }
            : item,
        )}
        cta={{
          title: 'One SKU. One next step.',
          body: (
            <p>
              Book a 30-min fit call. Walk the NEXUS OS gate — paper first.
            </p>
          ),
          mailto: MAILTO_NEXUS,
          mailtoLabel: 'strategy@rutinhq.com',
          calendly: CALENDLY_URL,
          calendlyLabel: 'Book 30 min',
          lpHref: WWW_NEXUS_URL,
          lpLabel: 'www.rutinhq.com/nexus-os',
        }}
      >
        <h2>What “paper first” means</h2>
        <p>
          NEXUS OS produces content batches and plans. It does not invent the
          retailer’s offer or ICP. Brand voice stays owned by the client’s
          ops/marketing. Until photos, mix, and budget are signed, nothing
          hits a pixel and nothing spends.
        </p>
        <p>
          Live Ads / pixel / spend without GO is what NEXUS OS is not. Budget 0
          pretending to be “live Ads” is in the not-for list.
        </p>

        <h2>How NEXUS OS works</h2>
        <p>
          The sequence is fixed. Ads stay parked until the gate is signed.
        </p>
        <BlogTable
          headers={['Step', 'What happens']}
          rows={[
            ['1', 'Brief + content pillars (one problem, one object)'],
            ['2', 'Weekly paper batch: message · organic post · product story'],
            ['3', 'Voice approval by client’s brand owner'],
            ['4', 'Pillar rotation'],
            ['5', 'Ads parked until photos + mix + budget signed'],
          ]}
        />

        <h2>Brief + content pillars</h2>
        <p>
          The brief names one problem and one object. Pillars come from that
          pair — not from an invented offer. NEXUS is not the owner of the
          client’s ICP or offer. Retailer / ecom with a clear offer and SKUs
          is the fit. No offer / SKU is not.
        </p>
        <p>
          Demand from social is the system. Ads with zero creative bank is
          not the starting point.
        </p>

        <h2>Weekly paper batch</h2>
        <p>
          Each week produces a paper batch: message · organic post · product
          story. Paper is ready for review before spend. Claims stay inside
          what the client already owns. The outcome is a repeatable content
          system without invented claims.
        </p>
        <p className="note">
          Curriculum proof:{' '}
          <a href={DOCS_NEXUS_URL} target="_blank" rel="noopener noreferrer">
            NEXUS OS catalog
          </a>
        </p>

        <h2>Voice approval, then the Ads gate</h2>
        <p>
          Voice approval belongs to the client’s brand owner. Pillar rotation
          keeps the batch moving. Ads stay parked until photos + mix + budget
          are signed. That is the explicit GO. Without it: paper only (no
          pixel, no spend).
        </p>

        <h2>Who this is for / not for</h2>
        <BlogTable
          headers={['For', 'Not for']}
          rows={[
            [
              'Retailer / ecom with clear offer and SKUs',
              'No offer / SKU',
            ],
            [
              'Wants demand from social as a system',
              'Ads with zero creative bank',
            ],
            [
              'Brand voice owned by client’s ops/marketing',
              'Budget 0 pretending to be “live Ads”',
            ],
          ]}
        />

        <h2>Not GTM OS. Not Store OS.</h2>
        <p>
          Clear separation: NEXUS ≠ outbound (GTM OS) ≠ store Admin (Store OS).
          NEXUS OS is not GTM OS. It is not Shopify theme editing. It is
          agentic marketing — Strategy → Social → Ads — paper first.
        </p>
      </BlogPostLayout>
    </>
  )
}
