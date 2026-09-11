import { useTranslation } from 'react-i18next'
import { Ctas } from '@/components/Ctas'
import { BulletList, MonoTitle, Section } from '@/components/Section'
import { Seo, skuJsonLd } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { usePageLocale } from '@/lib/i18n/usePageLocale'
import { DOCS_NEXUS_URL } from '@/lib/links'

export default function NexusOsPage() {
  const { t } = useTranslation()
  const { locale, localized, alternatesFor } = usePageLocale()
  const path = localized('/nexus-os')
  const who = useObjectList<string>('nexus.who.items')
  const notFor = useObjectList<string>('nexus.notFor.items')
  const how = useObjectList<string>('nexus.how.items')
  const outcomes = useObjectList<string>('nexus.outcomes.items')
  const notWhat = useObjectList<string>('nexus.notWhat.items')

  return (
    <>
      <Seo
        title={t('seo.nexusTitle')}
        description={t('seo.nexusDescription')}
        path={path}
        locale={locale}
        alternates={alternatesFor('/nexus-os')}
        jsonLd={skuJsonLd(path, t('seo.nexusTitle'), t('seo.nexusDescription'), {
          serviceType: 'NEXUS OS',
        })}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('nexus.eyebrow')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('nexus.hero.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('nexus.hero.subhead')}
        </p>
        <Ctas className="mt-10" docsHref={DOCS_NEXUS_URL} />
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <MonoTitle>{t('nexus.who.title')}</MonoTitle>
            <BulletList items={who} />
          </div>
          <div>
            <MonoTitle muted>{t('nexus.notFor.title')}</MonoTitle>
            <BulletList items={notFor} muted />
          </div>
        </div>
      </Section>

      <Section>
        <MonoTitle>{t('nexus.how.title')}</MonoTitle>
        <BulletList items={how} />
      </Section>

      <Section>
        <MonoTitle>{t('nexus.outcomes.title')}</MonoTitle>
        <BulletList items={outcomes} />
      </Section>

      <Section>
        <MonoTitle muted>{t('nexus.notWhat.title')}</MonoTitle>
        <BulletList items={notWhat} muted />
        <Ctas className="mt-10" docsHref={DOCS_NEXUS_URL} />
      </Section>
    </>
  )
}
