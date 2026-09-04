import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { Section } from '@/components/Section'
import { hubJsonLd, Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { MAILTO_HUB } from '@/lib/links'

const CARDS = [
  { key: 'gtm', href: '/gtm-os' },
  { key: 'store', href: '/store-os' },
  { key: 'nexus', href: '/nexus-os' },
] as const

export default function HubPage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        title={t('seo.hubTitle')}
        description={t('seo.hubDescription')}
        path="/"
        jsonLd={hubJsonLd()}
      />

      <Section first>
        <h1
          className="max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('hub.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('hub.subhead')}
        </p>
        <p className="mt-3 max-w-2xl font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('hub.lead')}
        </p>
        <Ctas className="mt-10" mailto={MAILTO_HUB} />
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
              <Button asChild className="mt-8 self-start" size="lg">
                <Link to={card.href}>{t('common.ctaOffer')}</Link>
              </Button>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
