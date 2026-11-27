import { useTranslation } from 'react-i18next'
import { Ctas } from '@/components/Ctas'
import { FaqSection } from '@/components/Faq'
import { BulletList, MonoTitle, Section } from '@/components/Section'
import { OG_IMAGE, Seo } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { usePageLocale } from '@/lib/i18n/usePageLocale'
import { DOCS_GTM_URL, talkMailtoForPath } from '@/lib/links'

const PILOT_SLOTS = ['results', 'testimonial', 'metrics'] as const

export default function GtmOsOfferPage() {
  const { t } = useTranslation()
  const { locale, localized, alternatesFor } = usePageLocale()
  const path = localized('/gtm-os/offer')
  const who = useObjectList<string>('gtm.who.items')
  const notFor = useObjectList<string>('gtm.notFor.items')
  const how = useObjectList<string>('gtm.how.items')
  const roles = useObjectList<string>('gtm.roles.items')
  const reply = useObjectList<string>('gtm.reply.items')
  const outcomes = useObjectList<string>('gtm.outcomes.items')
  const notWhat = useObjectList<string>('gtm.notWhat.items')
  const faq = useObjectList<{ q: string; a: string }>('gtm.faq.items')

  return (
    <>
      <Seo
        title={t('seo.gtmOfferTitle')}
        description={t('seo.gtmOfferDescription')}
        path={path}
        locale={locale}
        noindex
        robots="noindex, nofollow"
        alternates={alternatesFor('/gtm-os/offer')}
        image={OG_IMAGE.gtm}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('gtmOffer.eyebrow')}
        </p>
        <p className="mt-4 max-w-2xl border border-dashed border-border px-4 py-3 font-mono text-[12px] text-muted-foreground">
          {t('gtmOffer.banner')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('gtmOffer.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('gtm.hero.subhead')}
        </p>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {t('gtmOffer.pilotNote')}
        </p>
        <Ctas className="mt-10" docsHref={DOCS_GTM_URL} mailtoHref={talkMailtoForPath(path)} />
      </Section>

      <Section>
        <MonoTitle muted>{t('gtmOffer.slotsTitle')}</MonoTitle>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {t('gtmOffer.slotsIntro')}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILOT_SLOTS.map((slot) => (
            <aside
              key={slot}
              data-pilot-slot={slot}
              className="border border-dashed border-border px-4 py-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t(`gtmOffer.slots.${slot}.title`)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {t(`gtmOffer.slots.${slot}.body`)}
              </p>
            </aside>
          ))}
        </div>
      </Section>

      <Section>
        <p className="max-w-2xl text-sm text-muted-foreground">{t('gtmOffer.sourceNote')}</p>
        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <MonoTitle>{t('gtm.who.title')}</MonoTitle>
            <BulletList items={who} />
          </div>
          <div>
            <MonoTitle muted>{t('gtm.notFor.title')}</MonoTitle>
            <BulletList items={notFor} muted />
          </div>
        </div>
      </Section>

      <Section>
        <MonoTitle>{t('gtm.how.title')}</MonoTitle>
        <BulletList items={how} />
      </Section>

      <Section>
        <MonoTitle>{t('gtm.roles.title')}</MonoTitle>
        <BulletList items={roles} />
      </Section>

      <Section>
        <MonoTitle>{t('gtm.reply.title')}</MonoTitle>
        <BulletList items={reply} />
      </Section>

      <Section>
        <MonoTitle>{t('gtm.outcomes.title')}</MonoTitle>
        <BulletList items={outcomes} />
      </Section>

      <Section>
        <MonoTitle muted>{t('gtm.notWhat.title')}</MonoTitle>
        <BulletList items={notWhat} muted />
        <Ctas className="mt-10" docsHref={DOCS_GTM_URL} mailtoHref={talkMailtoForPath(path)} />
      </Section>

      <FaqSection title={t('gtm.faq.title')} items={faq} />
    </>
  )
}
