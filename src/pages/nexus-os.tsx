import { useTranslation } from 'react-i18next'
import { Ctas } from '@/components/Ctas'
import { BulletList, MonoTitle, Section } from '@/components/Section'
import { Seo, skuJsonLd } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { MAILTO_NEXUS } from '@/lib/links'

export default function NexusOsPage() {
  const { t } = useTranslation()
  const what = useObjectList<string>('nexus.what.items')
  const who = useObjectList<string>('nexus.who.items')
  const notFor = useObjectList<string>('nexus.notFor.items')
  const gates = useObjectList<string>('nexus.gates.items')

  return (
    <>
      <Seo
        title={t('seo.nexusTitle')}
        description={t('seo.nexusDescription')}
        path="/nexus-os"
        jsonLd={skuJsonLd(
          '/nexus-os',
          t('seo.nexusTitle'),
          t('seo.nexusDescription'),
        )}
      />

      <Section first>
        <h1
          className="max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('nexus.hero.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('nexus.hero.subhead')}
        </p>
        <Ctas
          className="mt-10"
          mailto={MAILTO_NEXUS}
          primaryKey="common.ctaDiscovery"
        />
      </Section>

      <Section>
        <MonoTitle>{t('nexus.what.title')}</MonoTitle>
        <BulletList items={what} />
      </Section>

      <Section>
        <MonoTitle>{t('nexus.offer.title')}</MonoTitle>
        <p className="mt-6 font-mono text-[15px] tracking-[0.04em] text-foreground md:text-[18px]">
          {t('nexus.offer.line')}
        </p>
      </Section>

      <Section>
        <MonoTitle>{t('nexus.gates.title')}</MonoTitle>
        <BulletList items={gates} />
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
        <MonoTitle>{t('nexus.prices.title')}</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] text-foreground">
          {t('nexus.prices.body')}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t('nexus.prices.note')}
        </p>
        <Ctas
          className="mt-10"
          mailto={MAILTO_NEXUS}
          primaryKey="common.ctaDiscovery"
        />
      </Section>
    </>
  )
}
