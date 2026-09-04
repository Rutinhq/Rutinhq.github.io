import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CALENDLY_URL, DOCS_URL, EMAIL, MAILTO_HUB, ONE_PAGER_URL } from '@/lib/links'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="container mx-auto flex flex-col gap-4 px-6 font-mono text-[12px] tracking-[0.04em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          RutinHQ · {t('footer.location')} ·{' '}
          <a href={MAILTO_HUB} className="text-foreground hover:text-primary">
            {EMAIL}
          </a>
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/" className="hover:text-foreground">
            {t('common.hubLink')}
          </Link>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            {t('common.ctaPrimary')}
          </a>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/80 hover:text-muted-foreground"
          >
            {t('common.docs')}
          </a>
          <a
            href={ONE_PAGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/80 hover:text-muted-foreground"
          >
            {t('footer.onePager')}
          </a>
        </nav>
      </div>
    </footer>
  )
}
