import { Helmet } from '@dr.pogodin/react-helmet'
import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { languageFromPathname } from '@/lib/i18n/paths'
import { GuideHost } from '@/components/guide/GuideHost'
import { Footer } from './parts/Footer'
import { Header } from './parts/Header'

function RouteFallback() {
  return <div className="min-h-[40vh]" aria-busy="true" />
}

export function RootLayout() {
  const { i18n } = useTranslation()
  const { pathname } = useLocation()
  const lang = languageFromPathname(pathname)

  useEffect(() => {
    if (!i18n.language?.startsWith(lang)) {
      void i18n.changeLanguage(lang)
    }
  }, [i18n, lang])

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Helmet>
        <html lang={lang} />
        <meta name="theme-color" content="#0A0A0A" />
      </Helmet>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <GuideHost />
    </div>
  )
}
