import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { BulletList, MonoTitle, Section } from '@/components/Section'
import { OG_IMAGE, Seo } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { usePageLocale } from '@/lib/i18n/usePageLocale'
import { AUTH_MD_URL, DOCS_CATALOG_URL, SITE_URL } from '@/lib/links'

export default function AgentsAuthPage() {
  const { t } = useTranslation()
  const { locale, localized, alternatesFor } = usePageLocale()
  const path = localized('/agents/auth')
  const publicItems = useObjectList<string>('agentsAuth.public.items')
  const gatedItems = useObjectList<string>('agentsAuth.gated.items')
  const notOffered = useObjectList<string>('agentsAuth.notOffered.items')

  return (
    <>
      <Seo
        title={t('seo.agentsAuthTitle')}
        description={t('seo.agentsAuthDescription')}
        path={path}
        locale={locale}
        alternates={alternatesFor('/agents/auth')}
        image={OG_IMAGE.hub}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${SITE_URL}${path}#webpage`,
          url: `${SITE_URL}${path}`,
          name: t('seo.agentsAuthTitle'),
          description: t('seo.agentsAuthDescription'),
          isPartOf: { '@id': `${SITE_URL}/#website` },
        }}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('agentsAuth.eyebrow')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('agentsAuth.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('agentsAuth.subhead')}
        </p>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {t('agentsAuth.rawNote')}{' '}
          <a
            href={AUTH_MD_URL}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            /auth.md
          </a>
          .
        </p>
      </Section>

      <Section>
        <MonoTitle>{t('agentsAuth.public.title')}</MonoTitle>
        <BulletList items={publicItems} />
      </Section>

      <Section>
        <MonoTitle muted>{t('agentsAuth.gated.title')}</MonoTitle>
        <BulletList items={gatedItems} muted />
      </Section>

      <Section>
        <MonoTitle muted>{t('agentsAuth.notOffered.title')}</MonoTitle>
        <BulletList items={notOffered} muted />
        <p className="mt-8 max-w-2xl text-[16px] text-muted-foreground">
          {t('agentsAuth.catalogNote')}{' '}
          <Link
            to={localized('/agents')}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            {t('common.agents')}
          </Link>
          .
        </p>
        <Ctas className="mt-10" docsHref={DOCS_CATALOG_URL} />
      </Section>
    </>
  )
}
