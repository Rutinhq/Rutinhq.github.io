import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { MonoTitle, Section, SimpleTable } from '@/components/Section'
import { Seo, articleJsonLd } from '@/components/Seo'
import { ARTICLE01 } from '@/lib/blog'
import { DOCS_GTM_URL, MAILTO_GTM } from '@/lib/links'

const TITLE = `RutinHQ — ${ARTICLE01.title}`

export default function BlogIcpGatedColdOutboundPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE01.description}
        path={ARTICLE01.path}
        noindex
        ogType="article"
        jsonLd={articleJsonLd({
          path: ARTICLE01.path,
          headline: ARTICLE01.title,
          description: ARTICLE01.description,
          datePublished: ARTICLE01.datePublished,
          dateModified: ARTICLE01.dateModified,
          faq: ARTICLE01.faq,
        })}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          How-to · GTM OS · not indexed
        </p>
        <p className="mt-3 font-mono text-[12px] tracking-[0.04em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          {' / '}
          <Link to="/blog" className="hover:text-foreground">
            Blog
          </Link>
          {' / '}
          {ARTICLE01.title}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {ARTICLE01.title}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-foreground md:text-[18px]">
          Cold outbound works when the <strong>machine</strong> stays fixed and
          only language, filters, and angle change. A rented SDR vanishes with
          the contract. An ICP-gated system stays with your team.
        </p>
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          What “ICP-gated” means
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          ICP-gated outbound refuses volume until criteria are{' '}
          <strong>checkable</strong>. No spray list. No “we’ll refine after
          replies.” The gate is the product: if the firmographic and motion
          tests fail, the sequence does not ship.
        </p>
        <SimpleTable
          headers={['Gate', 'Pass signal']}
          rows={[
            ['Firmographic fit', 'Vertical + buyer role match the sheet'],
            ['Motion fit', 'Cold email is acceptable; first run stays cold'],
            ['Message fit', 'Pain is specific enough to classify replies'],
            ['Volume fit', 'No scale until the prior vertical showed signal'],
          ]}
        />
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Keep the core, change the inputs
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          RutinHQ’s GTM OS treats outbound as a reusable machine. Per vertical
          you change:
        </p>
        <ul className="mt-6 max-w-2xl space-y-3 text-[16px] text-foreground">
          <li className="flex gap-3">
            <span className="text-primary" aria-hidden="true">
              ·
            </span>
            <span>
              <strong>Language</strong> — how the pain is named
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary" aria-hidden="true">
              ·
            </span>
            <span>
              <strong>Filters</strong> — who enters the pool
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary" aria-hidden="true">
              ·
            </span>
            <span>
              <strong>Angle</strong> — which thesis opens the thread
            </span>
          </li>
        </ul>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          You do <strong>not</strong> rebuild milestones, reply protocol, or
          governance for each experiment. That is the difference between
          installing a system and renting a seat.
        </p>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-muted-foreground">
          Curriculum proof:{' '}
          <a
            href={DOCS_GTM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            GTM OS catalog
          </a>{' '}
          · commercial page:{' '}
          <Link
            to="/gtm-os"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            /gtm-os
          </Link>
        </p>
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Milestone order (M0–M7 at a glance)
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          Nothing skipped. Each phase feeds the next. Validate one vertical
          before the next.
        </p>
        <SimpleTable
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
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-muted-foreground">
          Skipping M3 to “get meetings faster” usually means you scaled noise.
        </p>
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Reply before pitch
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          Classify before you answer. Discovery calls: the lead describes their
          process in their words — no feature pitch.
        </p>
        <SimpleTable
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
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Who this is for / not for
        </h2>
        <SimpleTable
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
      </Section>

      <Section>
        <MonoTitle>FAQ</MonoTitle>
        <div className="mt-8 max-w-2xl space-y-8">
          {ARTICLE01.faq.map((item) => (
            <div key={item.q}>
              <h3 className="text-xl font-heading font-extrabold tracking-[-0.03em]">
                {item.q}
              </h3>
              {item.q === 'Where’s the full system sheet?' ? (
                <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
                  See the{' '}
                  <a
                    href={DOCS_GTM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    GTM OS catalog ficha
                  </a>{' '}
                  and the{' '}
                  <Link
                    to="/gtm-os"
                    className="text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    /gtm-os
                  </Link>{' '}
                  page.
                </p>
              ) : (
                <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <MonoTitle>One SKU. One next step.</MonoTitle>
        <Ctas className="mt-8" mailto={MAILTO_GTM} />
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-muted-foreground">
          Or go direct:{' '}
          <Link
            to="/gtm-os"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            /gtm-os
          </Link>
        </p>
      </Section>
    </>
  )
}
