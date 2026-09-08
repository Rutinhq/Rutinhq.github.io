import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { MonoTitle, Section } from '@/components/Section'
import { Seo, blogIndexJsonLd } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import {
  ARTICLE01,
  BLOG_FEATURED_COMING,
  BLOG_FILTER_SIGNALS,
  BLOG_INDEX,
} from '@/lib/blog'
import {
  DOCS_CATALOG_URL,
  DOCS_GTM_URL,
  MAILTO_HUB,
  WWW_GTM_URL,
  WWW_NEXUS_URL,
  WWW_STORE_URL,
} from '@/lib/links'

export default function BlogPage() {
  return (
    <>
      <Seo
        title={BLOG_INDEX.title}
        description={BLOG_INDEX.description}
        path={BLOG_INDEX.path}
        locale="en"
        noindex={BLOG_INDEX.noindex}
        jsonLd={blogIndexJsonLd([{ path: ARTICLE01.path, name: ARTICLE01.title }])}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          Radar · filter
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          Systems you own — filtered for founders who install, not rent
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          RutinHQ Blog is a radar: each post surfaces whether you fit our ICP,
          name a real ops/GTM pain, and want a system that stays with your team.
          Dual desk — CEO strategy + ops install. Discovery next; educate-forever
          never.
        </p>
      </Section>

      <Section>
        <MonoTitle>Filter frame</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] text-muted-foreground">
          This blog tags reader signal. CTA on every path is discovery
          (strategy@) — not a content rabbit hole.
        </p>
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-4">
          {BLOG_FILTER_SIGNALS.map((signal, index) => (
            <article
              key={signal.name}
              className={`flex flex-col py-8 ${
                index > 0
                  ? 'border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:px-8'
                  : 'lg:pr-8'
              }`}
            >
              <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
                {signal.name}
              </h2>
              <p className="mt-3 text-[16px] text-muted-foreground">
                {signal.thesis}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <MonoTitle>Featured</MonoTitle>
        <article className="mt-8 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            How-to · GTM OS
          </p>
          <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em]">
            <Link to={ARTICLE01.path} className="hover:text-primary">
              {ARTICLE01.title}
            </Link>
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground">{ARTICLE01.job}</p>
          <Button asChild className="mt-8" size="lg">
            <Link to={ARTICLE01.path}>Read the how-to</Link>
          </Button>
        </article>
        <div className="mt-12 grid grid-cols-1 border-t border-border lg:grid-cols-3">
          {BLOG_FEATURED_COMING.map((item, index) => (
            <article
              key={item.title}
              className={`flex flex-col py-8 ${
                index > 0
                  ? 'border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:px-8'
                  : 'lg:pr-8'
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {item.type} · coming
              </p>
              <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em] text-muted-foreground">
                {item.title}
              </h2>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <MonoTitle>If your bottleneck is…</MonoTitle>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3">
          <article className="flex flex-col py-8 lg:pr-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Repeatable cold pipeline / ICP gates
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Start with Article01, then GTM OS.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <Link
                to={ARTICLE01.path}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Article01
              </Link>
              {' · '}
              <a
                href={WWW_GTM_URL}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                GTM OS
              </a>
            </p>
          </article>
          <article className="flex flex-col border-t border-border py-8 lg:border-t-0 lg:border-l lg:border-border lg:px-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Owning the machine vs retainer
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              M1 posts when live. Outbound now is GTM OS.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <a
                href={WWW_GTM_URL}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                GTM OS
              </a>
            </p>
          </article>
          <article className="flex flex-col border-t border-border py-8 lg:border-t-0 lg:border-l lg:border-border lg:px-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Curriculum / systems map
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Catalog proof — not a second offer.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <a
                href={DOCS_CATALOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                docs.rutinhq.com/catalog/
              </a>
            </p>
          </article>
        </div>
      </Section>

      <Section>
        <Ctas mailto={MAILTO_HUB} />
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Proof:{' '}
          <a
            href={DOCS_CATALOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            systems catalog
          </a>
          {' · '}
          <a
            href={DOCS_GTM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            GTM ficha
          </a>
          {' · '}
          primary LP{' '}
          <a
            href={WWW_GTM_URL}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            GTM OS
          </a>
          .
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Soft-park until those desks are GO:{' '}
          <a
            href={WWW_STORE_URL}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Store OS
          </a>
          {' · '}
          <a
            href={WWW_NEXUS_URL}
            className="underline underline-offset-4 hover:text-foreground"
          >
            NEXUS OS
          </a>
          .
        </p>
      </Section>
    </>
  )
}
