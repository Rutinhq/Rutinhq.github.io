import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { SupportedLanguage } from '@/lib/i18n/config'

export function Header() {
  const { i18n } = useTranslation()
  const currentLang: SupportedLanguage = i18n.language?.startsWith('es')
    ? 'es'
    : 'en'

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
        <div
          className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em]"
          role="group"
          aria-label="Language"
        >
          <button
            type="button"
            onClick={() => void i18n.changeLanguage('es')}
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
            onClick={() => void i18n.changeLanguage('en')}
            className={
              currentLang === 'en' ? 'text-foreground' : 'text-muted-foreground'
            }
            aria-pressed={currentLang === 'en'}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  )
}
