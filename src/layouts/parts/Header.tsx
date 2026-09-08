import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { localePath } from '@/lib/blog'
import type { SupportedLanguage } from '@/lib/i18n/config'
import { MAILTO_HUB } from '@/lib/links'

export function Header() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const currentLang: SupportedLanguage = i18n.language?.startsWith('es')
    ? 'es'
    : 'en'

  function switchLang(next: SupportedLanguage) {
    void i18n.changeLanguage(next)
    const mapped = localePath(location.pathname, next)
    if (mapped && mapped !== location.pathname) navigate(mapped)
  }

  return (
    <header className="sticky top-0 isolate z-50 h-16 border-b border-border bg-background">
      <div className="container mx-auto flex h-full flex-nowrap items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 md:gap-4 md:px-10">
        <Link
          to="/"
          aria-label="RutinHQ"
          className="flex shrink-0 items-center text-foreground"
        >
          <Logo />
        </Link>
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <div
            className="flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.12em]"
            role="group"
            aria-label={t('nav.language')}
          >
            <button
              type="button"
              onClick={() => switchLang('es')}
              className={
                currentLang === 'es' ? 'text-foreground' : 'text-muted-foreground'
              }
              aria-pressed={currentLang === 'es'}
            >
              ES
            </button>
            <span className="text-muted-foreground" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              onClick={() => switchLang('en')}
              className={
                currentLang === 'en' ? 'text-foreground' : 'text-muted-foreground'
              }
              aria-pressed={currentLang === 'en'}
            >
              EN
            </button>
          </div>
          <Button asChild size="sm" className="shrink-0 px-3 md:px-4">
            <a href={MAILTO_HUB}>
              <span className="md:hidden">{t('common.ctaPrimaryShort')}</span>
              <span className="hidden md:inline">{t('common.ctaPrimary')}</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
