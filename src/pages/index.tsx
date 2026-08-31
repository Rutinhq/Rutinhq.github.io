import { useTranslation } from 'react-i18next'
import { home } from 'virtual:content'
import { homeJsonLd, Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        title={t('seo.homeTitle')}
        description={t('seo.homeDescription')}
        path="/"
        jsonLd={homeJsonLd()}
      />

      <section
        className="flex flex-col justify-center bg-background"
        style={{ minHeight: '100vh' }}
      >
        <div className="container mx-auto px-6 md:px-10">
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('hero.eyebrow')}
          </p>
          <h1
            className="max-w-[820px] font-heading font-extrabold tracking-[-0.03em]"
            style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
          >
            {t('hero.headline')}
          </h1>
          <p className="mt-8 max-w-[520px] text-[18px] text-muted-foreground">
            {t('hero.subhead')}
          </p>
          <Button asChild className="mt-10" size="lg">
            <a href="#contact">{t('hero.cta')}</a>
          </Button>
          <p className="mt-10 font-mono text-[12px] tracking-[0.06em] text-muted-foreground">
            {t('hero.social')}
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto px-6 md:px-10">
          <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('integrations.eyebrow')}
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {home.integrations.map((item) => (
              <p
                key={item.name}
                className="text-center font-mono text-sm uppercase tracking-[0.2em] text-foreground opacity-40"
              >
                {item.name}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-10">
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {t('architecture.eyebrow')}
          </p>
          <h2
            className="mb-16 max-w-3xl font-heading font-extrabold tracking-[-0.03em]"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
          >
            {t('architecture.headline')}
          </h2>
          <div className="grid grid-cols-1 border-t border-border md:grid-cols-3">
            {home.pillars.map((pillar, index) => (
              <article
                key={pillar.number}
                className={`py-10 md:px-8 ${index > 0 ? 'md:border-l md:border-border' : ''} ${index === 0 ? 'md:pl-0' : ''}`}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {pillar.number}
                </p>
                <h3 className="mt-6 text-2xl font-heading font-extrabold tracking-[-0.03em]">
                  {t(pillar.titleKey)}
                </h3>
                <p className="mt-4 text-muted-foreground">{t(pillar.bodyKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
