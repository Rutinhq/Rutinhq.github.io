import { useTranslation } from 'react-i18next'
import { Ctas } from '@/components/Ctas'
import { BulletList, MonoTitle, Section } from '@/components/Section'
import { Seo, skuJsonLd } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { MAILTO_STORE } from '@/lib/links'

export default function StoreOsPage() {
  const { t } = useTranslation()
  const what = useObjectList<string>('store.what.items')
  const who = useObjectList<string>('store.who.items')
  const notFor = useObjectList<string>('store.notFor.items')

  return (
    <>
      <Seo
        title={t('seo.storeTitle')}
        description={t('seo.storeDescription')}
        path="/store-os"
        jsonLd={skuJsonLd(
          '/store-os',
          t('seo.storeTitle'),
          t('seo.storeDescription'),
        )}
      />

      <Section first>
        <h1
          className="max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('store.hero.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('store.hero.subhead')}
        </p>
        <Ctas
          className="mt-10"
          mailto={MAILTO_STORE}
          primaryKey="common.ctaDiscovery"
        />
      </Section>

      <Section>
        <MonoTitle>{t('store.what.title')}</MonoTitle>
        <BulletList items={what} />
      </Section>

      <Section>
        <MonoTitle>{t('store.offer.title')}</MonoTitle>
        <p className="mt-6 font-mono text-[15px] tracking-[0.04em] text-foreground md:text-[18px]">
          {t('store.offer.line')}
        </p>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <MonoTitle>{t('store.who.title')}</MonoTitle>
            <BulletList items={who} />
          </div>
          <div>
            <MonoTitle muted>{t('store.notFor.title')}</MonoTitle>
            <BulletList items={notFor} muted />
          </div>
        </div>
      </Section>

      <Section>
        <MonoTitle>{t('store.prices.title')}</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] text-foreground">
          {t('store.prices.body')}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t('store.prices.note')}
        </p>
        <Ctas
          className="mt-10"
          mailto={MAILTO_STORE}
          primaryKey="common.ctaDiscovery"
        />
      </Section>
    </>
  )
}
