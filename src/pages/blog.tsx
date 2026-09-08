import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { MonoTitle, Section } from '@/components/Section'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { ARTICLE01, BLOG_PILLARS, BLOG_SKUS } from '@/lib/blog'
import { DOCS_CATALOG_URL, MAILTO_HUB } from '@/lib/links'

export default function BlogPage() {
  const { t } = useTranslation()
  const livePillars = BLOG_PILLARS.filter((pillar) => pillar.status === 'live')
  const comingPillars = BLOG_PILLARS.filter(
    (pillar) => pillar.status === 'coming',
  )

  return (
    <>
      <Seo
        title="RutinHQ — Blog"
        description="A filter for founders who want systems they own. GTM, agentic ops, and lean machines—one SKU per post."
        path="/blog"
        noindex
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          Filter · radar · not indexed
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          A filter for founders who want systems they own.
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          This blog is a radar—not a wiki. We publish how-tos and frameworks
          only in our forte: GTM machines, ICP gates, agentic rails, and lean
          installs. One SKU per post. One next step.
        </p>
      </Section>

      <Section>
        <MonoTitle>Start here</MonoTitle>
        <article className="mt-8 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            How-to · GTM OS
          </p>
          <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em]">
            <Link to={ARTICLE01.path} className="hover:text-primary">
              {ARTICLE01.title}
            </Link>
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground">
            {ARTICLE01.description}
          </p>
          <p className="mt-6">
            <Button asChild size="lg">
              <Link to={ARTICLE01.path}>Read Article01</Link>
            </Button>
          </p>
        </article>
      </Section>

      <Section>
        <MonoTitle>Pillars</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] text-muted-foreground">
          Authority only where we install. Soft-park Store and NEXUS until those
          SKUs are GO for public writing.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          {livePillars.map((pillar) => (
            <article key={pillar.id}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {pillar.id}
              </p>
              <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em]">
                {pillar.name}
              </h2>
              <p className="mt-3 text-[16px] text-muted-foreground">
                {pillar.thesis}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-1 gap-10 border-t border-border pt-10 md:grid-cols-2">
          {comingPillars.map((pillar) => (
            <article key={pillar.id}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {pillar.id} · coming
              </p>
              <h2 className="mt-3 text-xl font-heading font-extrabold tracking-[-0.03em] text-muted-foreground">
                {pillar.name}
              </h2>
              <p className="mt-3 text-[16px] text-muted-foreground/80">
                {pillar.thesis}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <MonoTitle>Systems</MonoTitle>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3">
          {BLOG_SKUS.map((card, index) => (
            <article
              key={card.key}
              className={`flex flex-col py-8 ${
                index > 0
                  ? 'border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:px-8'
                  : 'lg:pr-8'
              }`}
            >
              <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
                {t(`cards.${card.key}.name`)}
              </h2>
              <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
                {t(`cards.${card.key}.thesis`)}
              </p>
              <Button asChild className="mt-8 self-start" size="lg">
                <Link to={card.href}>{t(`cards.${card.key}.cta`)}</Link>
              </Button>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          Curriculum proof lives at{' '}
          <a
            href={DOCS_CATALOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            docs.rutinhq.com/catalog/
          </a>
          .
        </p>
      </Section>

      <Section>
        <Ctas mailto={MAILTO_HUB} />
      </Section>
    </>
  )
}
