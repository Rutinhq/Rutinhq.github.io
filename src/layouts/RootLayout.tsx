import { Helmet } from '@dr.pogodin/react-helmet'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Footer } from './parts/Footer'
import { Header } from './parts/Header'

export function RootLayout() {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('es') ? 'es' : 'en'

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Helmet>
        <html lang={lang} />
        <meta name="theme-color" content="#0A0A0A" />
      </Helmet>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
