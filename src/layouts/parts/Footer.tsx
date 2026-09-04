import { useTranslation } from 'react-i18next'
import { EMAIL, MAILTO_GTM, ONE_PAGER_URL } from '@/lib/links'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="container mx-auto flex flex-col gap-3 px-6 font-mono text-[12px] tracking-[0.04em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          RutinHQ · {t('footer.location')} ·{' '}
          <a
            href={MAILTO_GTM}
            className="text-foreground hover:text-primary"
          >
            {EMAIL}
          </a>
        </p>
        <a
          href={ONE_PAGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          {t('footer.onePager')}
        </a>
      </div>
    </footer>
  )
}
