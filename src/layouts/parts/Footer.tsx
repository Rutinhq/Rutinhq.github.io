import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePageLocale } from '@/lib/i18n/usePageLocale'
import { CALENDLY_URL, DOCS_CATALOG_URL, EMAIL, MAILTO_EMAIL } from '@/lib/links'

export function Footer() {
  const { t } = useTranslation()
  const { localized } = usePageLocale()

  return (
    <footer className="relative z-10 border-t border-border bg-background py-10">
      <div className="container mx-auto flex flex-col gap-4 px-6 font-mono text-[12px] tracking-[0.04em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          RutinHQ · {t('footer.location')} ·{' '}
          <a href={MAILTO_EMAIL} className="text-foreground hover:text-primary">
            {EMAIL}
          </a>
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={DOCS_CATALOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            {t('common.hubLink')}
          </a>
          <Link to={localized('/blog')} className="hover:text-foreground">
            {t('common.blog')}
          </Link>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            <span className="md:hidden">{t('common.ctaPrimaryShort')}</span>
            <span className="hidden md:inline">{t('common.ctaPrimary')}</span>
          </a>
        </nav>
      </div>
    </footer>
  )
}
