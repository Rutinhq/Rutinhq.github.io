import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { MonoTitle, Section } from '@/components/Section'
import { OG_IMAGE, Seo } from '@/components/Seo'
import { buttonVariants } from '@/components/ui/button'
import { usePageLocale } from '@/lib/i18n/usePageLocale'
import {
  API_CATALOG_URL,
  AUTH_MD_URL,
  DOCS_CATALOG_URL,
  EMAIL,
  LLMS_FULL_URL,
  LLMS_URL,
  MAILTO_EMAIL,
  SITEMAP_URL,
  SITE_URL,
} from '@/lib/links'
import { cn } from '@/lib/utils'

const RESOURCES = [
  { key: 'docs', href: DOCS_CATALOG_URL, external: true },
  { key: 'contact', href: MAILTO_EMAIL, external: false, label: EMAIL },
  { key: 'llms', href: LLMS_URL, external: false },
  { key: 'llmsFull', href: LLMS_FULL_URL, external: false },
  { key: 'sitemap', href: SITEMAP_URL, external: false },
  { key: 'apiCatalog', href: API_CATALOG_URL, external: false },
  { key: 'authMd', href: AUTH_MD_URL, external: false },
] as const

export default function AgentsPage() {
  const { t } = useTranslation()
  const { locale, localized, alternatesFor } = usePageLocale()
  const path = localized('/agents')

  return (
    <>
      <Seo
        title={t('seo.agentsTitle')}
        description={t('seo.agentsDescription')}
        path={path}
        locale={locale}
        alternates={alternatesFor('/agents')}
        image={OG_IMAGE.hub}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${SITE_URL}${path}#webpage`,
          url: `${SITE_URL}${path}`,
          name: t('seo.agentsTitle'),
          description: t('seo.agentsDescription'),
          isPartOf: { '@id': `${SITE_URL}/#website` },
        }}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('agents.eyebrow')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('agents.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('agents.subhead')}
        </p>
      </Section>

      <Section>
        <MonoTitle>{t('agents.resourcesTitle')}</MonoTitle>
        <ul className="mt-6 max-w-3xl space-y-4">
          {RESOURCES.map((item) => {
            const href = item.href
            const label = 'label' in item ? item.label : href.replace('https://', '')
            return (
              <li key={item.key} className="border-b border-border pb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  {t(`agents.resources.${item.key}.name`)}
                </p>
                <p className="mt-2 text-[16px] text-muted-foreground">
                  {t(`agents.resources.${item.key}.blurb`)}
                </p>
                <a
                  href={href}
                  {...(item.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="mt-2 inline-block text-[15px] text-foreground underline underline-offset-4 hover:text-primary"
                >
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section>
        <MonoTitle>{t('agents.authTitle')}</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] text-muted-foreground">
          {t('agents.authBody')}
        </p>
        <Link
          to={localized('/agents/auth')}
          className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'mt-8')}
        >
          {t('agents.authCta')}
        </Link>
      </Section>

      <Section>
        <Ctas docsHref={DOCS_CATALOG_URL} />
      </Section>
    </>
  )
}
