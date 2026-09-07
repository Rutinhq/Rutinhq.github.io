import { useTranslation } from 'react-i18next'
import { Ctas } from '@/components/Ctas'
import { BulletList, MonoTitle, Section } from '@/components/Section'
import { Seo, skuJsonLd } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { DOCS_GTM_URL, MAILTO_GTM } from '@/lib/links'

export default function GtmOsPage() {
  const { t } = useTranslation()
  const who = useObjectList<string>('gtm.who.items')
  const notFor = useObjectList<string>('gtm.notFor.items')
  const how = useObjectList<string>('gtm.how.items')
  const roles = useObjectList<string>('gtm.roles.items')
  const reply = useObjectList<string>('gtm.reply.items')
  const outcomes = useObjectList<string>('gtm.outcomes.items')
  const notWhat = useObjectList<string>('gtm.notWhat.items')

  return (
    <>
      <Seo
        title={t('seo.gtmTitle')}
        description={t('seo.gtmDescription')}
        path="/gtm-os"
        jsonLd={skuJsonLd('/gtm-os', t('seo.gtmTitle'), t('seo.gtmDescription'))}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('gtm.eyebrow')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('gtm.hero.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('gtm.hero.subhead')}
        </p>
        <Ctas className="mt-10" mailto={MAILTO_GTM} docsHref={DOCS_GTM_URL} />
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
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
        <Ctas className="mt-10" mailto={MAILTO_GTM} docsHref={DOCS_GTM_URL} />
      </Section>
    </>
  )
}
