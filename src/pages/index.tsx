import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { FaqSection } from '@/components/Faq'
import { Section } from '@/components/Section'
import { hubJsonLd, OG_IMAGE, Seo } from '@/components/Seo'
import { buttonVariants } from '@/components/ui/button'
import { useObjectList } from '@/lib/i18n/lists'
import { usePageLocale } from '@/lib/i18n/usePageLocale'
import { DOCS_CATALOG_URL } from '@/lib/links'
import { cn } from '@/lib/utils'

const CARDS = [
  { key: 'gtm', href: '/gtm-os' },
  { key: 'store', href: '/store-os' },
  { key: 'nexus', href: '/nexus-os' },
] as const

export default function HubPage() {
  const { t } = useTranslation()
  const { locale, localized, alternatesFor } = usePageLocale()
  const faq = useObjectList<{ q: string; a: string }>('hub.faq.items')

  return (
    <>
      <Seo
        title={t('seo.hubTitle')}
        description={t('seo.hubDescription')}
        path={localized('/')}
        locale={locale}
        alternates={alternatesFor('/')}
        image={OG_IMAGE.hub}
        jsonLd={hubJsonLd(localized('/'), t('seo.hubTitle'), faq)}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('hub.eyebrow')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('hub.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('hub.subhead')}
        </p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {CARDS.map((card, index) => (
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
              <Link
                to={localized(card.href)}
                className={cn(buttonVariants({ size: 'lg' }), 'mt-8 self-start')}
              >
                {t(`cards.${card.key}.cta`)}
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <FaqSection title={t('hub.faq.title')} items={faq} />

      <Section>
        <Ctas />
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          {t('hub.catalogNote')}{' '}
          <a
            href={DOCS_CATALOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            docs.rutinhq.com/catalog
          </a>{' '}
          {t('hub.catalogNoteAfter')}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {t('hub.blogNote')}{' '}
          <Link
            to={localized('/blog')}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            {t('common.blog')}
          </Link>
          .
        </p>
      </Section>
    </>
  )
}
