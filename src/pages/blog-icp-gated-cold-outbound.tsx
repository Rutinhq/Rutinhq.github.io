import { BlogPostLayout, BlogTable } from '@/components/blog'
import { OG_IMAGE, Seo, articleJsonLd, hreflangPair } from '@/components/Seo'
import { ARTICLE01, ARTICLE01_ES, articleSeoTitle } from '@/lib/blog'
import { DOCS_GTM_URL, MAILTO_GTM, WWW_GTM_URL } from '@/lib/links'

const TITLE = articleSeoTitle(ARTICLE01.title)

export default function BlogIcpGatedColdOutboundPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE01.description}
        path={ARTICLE01.path}
        locale="en"
        noindex={ARTICLE01.noindex}
        ogType="article"
        alternates={hreflangPair(ARTICLE01.path, ARTICLE01_ES.path)}
        image={OG_IMAGE.blog}
        jsonLd={articleJsonLd({
          path: ARTICLE01.path,
          headline: ARTICLE01.title,
          description: ARTICLE01.description,
          datePublished: ARTICLE01.datePublished,
          dateModified: ARTICLE01.dateModified,
          faq: ARTICLE01.faq,
        })}
      />

      <BlogPostLayout
        typeLabel="How-to · GTM OS"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Blog', to: '/blog' },
          { label: ARTICLE01.title },
        ]}
        title={ARTICLE01.title}
        lede={
          <p>
            Cold outbound works when the <strong>machine</strong> stays fixed and
            only language, filters, and angle change. A rented SDR vanishes with
            the contract. An ICP-gated system stays with your team.
          </p>
        }
        faqTitle="FAQ"
        faq={ARTICLE01.faq.map((item) =>
          item.q === 'Where’s the full system sheet?'
            ? {
                q: item.q,
                a: (
                  <p>
                    See the{' '}
                    <a
                      href={DOCS_GTM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GTM OS catalog ficha
                    </a>{' '}
                    and the{' '}
                    <a href={WWW_GTM_URL}>www.rutinhq.com/gtm-os</a> page.
                  </p>
                ),
              }
            : item,
        )}
        cta={{
          title: 'One SKU. One next step.',
          mailto: MAILTO_GTM,
          mailtoLabel: 'strategy@',
          lpHref: WWW_GTM_URL,
          lpLabel: 'www.rutinhq.com/gtm-os',
        }}
      >
        <h2>What “ICP-gated” means</h2>
        <p>
          ICP-gated outbound refuses volume until criteria are{' '}
          <strong>checkable</strong>. No spray list. No “we’ll refine after
          replies.” The gate is the product: if the firmographic and motion
          tests fail, the sequence does not ship.
        </p>
        <BlogTable
          headers={['Gate', 'Pass signal']}
          rows={[
            ['Firmographic fit', 'Vertical + buyer role match the sheet'],
            ['Motion fit', 'Cold email is acceptable; first run stays cold'],
            ['Message fit', 'Pain is specific enough to classify replies'],
            ['Volume fit', 'No scale until the prior vertical showed signal'],
          ]}
        />

        <h2>Keep the core, change the inputs</h2>
        <p>
          RutinHQ’s GTM OS treats outbound as a reusable machine. Per vertical
          you change:
        </p>
        <ul>
          <li>
            <strong>Language</strong> — how the pain is named
          </li>
          <li>
            <strong>Filters</strong> — who enters the pool
          </li>
          <li>
            <strong>Angle</strong> — which thesis opens the thread
          </li>
        </ul>
        <p>
          You do <strong>not</strong> rebuild milestones, reply protocol, or
          governance for each experiment. That is the difference between
          installing a system and renting a seat.
        </p>
        <p className="note">
          Curriculum proof:{' '}
          <a
            href={DOCS_GTM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            GTM OS catalog
          </a>
        </p>

        <h2>Milestone order (M0–M7 at a glance)</h2>
        <p>
          Nothing skipped. Each phase feeds the next. Validate one vertical
          before the next.
        </p>
        <BlogTable
          headers={['M', 'Step']}
          rows={[
            ['M0', 'Sector research'],
            ['M1', 'ICP + validation'],
            ['M2', 'Messaging framework'],
            ['M3', 'Sales playbook + gate'],
            ['M4', 'Campaign activation'],
            ['M5', 'Crawl / analysis'],
            ['M6', 'Weekly KPIs (ongoing)'],
            ['M7', 'Close + scale to next vertical'],
          ]}
        />
        <p className="note">
          Skipping M3 to “get meetings faster” usually means you scaled noise.
        </p>

        <h2>Reply before pitch</h2>
        <p>
          Classify before you answer. Discovery calls: the lead describes their
          process in their words — no feature pitch.
        </p>
        <BlogTable
          headers={['Type', 'Action']}
          rows={[
            ['Open', 'Reply soon; three time slots; short call'],
            ['Question', 'Research framing; no pitch; confirm call'],
            ['Referral', 'Thank + contact referred with mention'],
            ['OOO', 'Mark; follow up on return'],
            ['Not interested', 'Thank; discard; no chase'],
            ['Silence (5–7d)', 'One bump in-thread; then discard'],
          ]}
        />

        <h2>Who this is for / not for</h2>
        <BlogTable
          headers={['For', 'Not for']}
          rows={[
            ['Founder / CEO or B2B ops lead', 'Pure ecom/B2C'],
            [
              'Already sells; bottleneck is repeatable pipeline',
              '“Just run ads”',
            ],
            [
              'Willing to own the machine after install',
              'Enterprise RFP with no outbound owner',
            ],
            ['Cold-first motion', 'Buyers demanding guaranteed N meetings'],
          ]}
        />
      </BlogPostLayout>
    </>
  )
}
