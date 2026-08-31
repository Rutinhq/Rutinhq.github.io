import { useTranslation } from 'react-i18next'
import { services } from 'virtual:content'
import { CtaBand } from '@/components/CtaBand'
import { pageJsonLd, Seo } from '@/components/Seo'
import type { SupportedLanguage } from '@/lib/i18n/config'

export default function ServicesPage() {
  const { t, i18n } = useTranslation()
  const lang: SupportedLanguage = i18n.language?.startsWith('es') ? 'es' : 'en'

  return (
    <>
      <Seo
        title={t('seo.servicesTitle')}
        description={t('seo.servicesDescription')}
        path="/services"
        jsonLd={pageJsonLd('/services', t('seo.servicesTitle'))}
      />

      <section className="bg-background py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-10">
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {t(services.hero.eyebrowKey)}
          </p>
          <h1
            className="max-w-3xl font-heading font-extrabold tracking-[-0.03em]"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            {t(services.hero.headlineKey)}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {t(services.hero.subheadKey)}
          </p>
        </div>
      </section>

      {services.items.map((item) => (
        <section key={item.number} className="border-b border-border bg-background">
          <div className="container mx-auto grid grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-24">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {item.number}
              </p>
              <h2 className="mt-6 text-3xl font-heading font-extrabold tracking-[-0.03em] md:text-4xl">
                {item.title[lang]}
              </h2>
              <p className="mt-3 text-lg text-foreground">{item.tagline[lang]}</p>
              <p className="mt-6 text-muted-foreground">{item.description[lang]}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t('services.deliverables')}
              </p>
              <ul className="mt-4 space-y-3">
                {item.deliverables[lang].map((line) => (
                  <li key={line} className="flex gap-3 text-foreground">
                    <span className="text-primary">✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2">
                {item.tools.map((tool) => (
                  <span
                    key={tool}
                    className="border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <div className="mt-8 border border-border bg-card px-5 py-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {t('services.outcome')}
                </p>
                <p className="mt-3 text-foreground">{item.outcome[lang]}</p>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-border bg-background py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 border-t border-border md:grid-cols-4">
            {services.process.map((step, index) => (
              <article
                key={step.number}
                className={`py-10 md:px-6 ${index > 0 ? 'md:border-l md:border-border' : ''} ${index === 0 ? 'md:pl-0' : ''}`}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {step.number}
                </p>
                <h3 className="mt-6 text-xl font-heading font-extrabold tracking-[-0.03em]">
                  {step.title[lang]}
                </h3>
                <p className="mt-4 text-sm text-muted-foreground">{step.body[lang]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        headline={t('services.ctaHeadline')}
        subhead={t('services.ctaSubhead')}
        cta={t('services.ctaBtn')}
      />
    </>
  )
}
