import { useTranslation } from 'react-i18next'
import { case_studies } from 'virtual:content'
import { CtaBand } from '@/components/CtaBand'
import { pageJsonLd, Seo } from '@/components/Seo'
import type { SupportedLanguage } from '@/lib/i18n/config'

export default function CaseStudiesPage() {
  const { t, i18n } = useTranslation()
  const lang: SupportedLanguage = i18n.language?.startsWith('es') ? 'es' : 'en'

  return (
    <>
      <Seo
        title={t('seo.caseTitle')}
        description={t('seo.caseDescription')}
        path="/case-studies"
        jsonLd={pageJsonLd('/case-studies', t('seo.caseTitle'))}
      />

      <section className="bg-background py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-10">
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('caseStudies.eyebrow')}
          </p>
          <h1
            className="max-w-3xl font-heading font-extrabold tracking-[-0.03em]"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            {t('caseStudies.headline')}
          </h1>
          <p className="mt-6 max-w-xl text-muted-foreground">
            {t('caseStudies.subhead')}
          </p>
        </div>
      </section>

      {case_studies.studies.map((study) => (
        <section key={study.id} className="border-t border-border bg-background">
          <div className="container mx-auto grid grid-cols-1 px-6 md:grid-cols-5 md:px-10">
            <div className="border-b border-border py-12 md:col-span-3 md:border-b-0 md:pr-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {study.industry[lang]}
              </p>
              <div className="mt-8 border-b border-border pb-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t('caseStudies.challenge')}
                </p>
                <p className="mt-4 text-lg text-foreground">{study.challenge[lang]}</p>
              </div>
              <div className="pt-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t('caseStudies.solution')}
                </p>
                <p className="mt-4 text-lg text-foreground">{study.solution[lang]}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 py-12 md:col-span-2 md:pl-8">
              {study.metrics.map((metric) => (
                <div
                  key={metric.value}
                  className="border border-border bg-card px-6 py-8"
                >
                  <p className="font-heading text-5xl font-extrabold tracking-[-0.03em] text-primary">
                    {metric.value}
                  </p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {metric.label[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <CtaBand
        headline={t('caseStudies.ctaHeadline')}
        subhead={t('caseStudies.ctaSubhead')}
        cta={t('caseStudies.ctaBtn')}
      />
    </>
  )
}
