import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Header() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en'
  const toggleLanguage = () => {
    void i18n.changeLanguage(currentLang === 'en' ? 'es' : 'en')
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background">
      <div className="container mx-auto flex h-full items-center justify-between px-6 md:px-10">
        <Link to="/" className="flex items-center">
          <img
            src={`${import.meta.env.BASE_URL}airo-assets/images/logo/horizontal.svg`}
            alt="RutinHQ"
            className="h-auto w-auto max-w-[140px] object-contain md:max-w-none"
            style={{ maxHeight: 56 }}
          />
        </Link>
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="flex items-center gap-3 overflow-x-auto md:gap-6">
            <Link
              to="/services"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
            >
              {t('nav.services')}
            </Link>
            <Link
              to="/case-studies"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
            >
              {t('nav.caseStudies')}
            </Link>
          </nav>
          <button
            type="button"
            onClick={toggleLanguage}
            className="font-mono text-[11px] tracking-[0.12em]"
            aria-label="Toggle language"
          >
            <span
              className={
                currentLang === 'en' ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              EN
            </span>
            <span className="text-muted-foreground"> / </span>
            <span
              className={
                currentLang === 'es' ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              ES
            </span>
          </button>
          <Button asChild className="shrink-0 px-3 md:px-6">
            <a href="#contact">{t('nav.cta')}</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
