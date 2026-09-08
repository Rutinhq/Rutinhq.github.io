import { useTranslation } from 'react-i18next'
import { Ctas } from '@/components/Ctas'
import { BulletList, MonoTitle, Section } from '@/components/Section'
import { Seo, skuJsonLd } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { usePageLocale } from '@/lib/i18n/usePageLocale'
import { DOCS_STORE_URL } from '@/lib/links'

export default function StoreOsPage() {
  const { t } = useTranslation()
  const { locale, localized, alternatesFor } = usePageLocale()
  const path = localized('/store-os')
  const who = useObjectList<string>('store.who.items')
  const notFor = useObjectList<string>('store.notFor.items')
  const how = useObjectList<string>('store.how.items')
  const outcomes = useObjectList<string>('store.outcomes.items')
  const notWhat = useObjectList<string>('store.notWhat.items')

  return (
    <>
      <Seo
        title={t('seo.storeTitle')}
        description={t('seo.storeDescription')}
        path={path}
        locale={locale}
        alternates={alternatesFor('/store-os')}
        jsonLd={skuJsonLd(path, t('seo.storeTitle'), t('seo.storeDescription'))}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('store.eyebrow')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('store.hero.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('store.hero.subhead')}
        </p>
        <Ctas className="mt-10" docsHref={DOCS_STORE_URL} />
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
        <MonoTitle>{t('store.how.title')}</MonoTitle>
        <BulletList items={how} />
      </Section>

      <Section>
        <MonoTitle>{t('store.outcomes.title')}</MonoTitle>
        <BulletList items={outcomes} />
      </Section>

      <Section>
        <MonoTitle muted>{t('store.notWhat.title')}</MonoTitle>
        <BulletList items={notWhat} muted />
        <Ctas className="mt-10" docsHref={DOCS_STORE_URL} />
      </Section>
    </>
  )
}
