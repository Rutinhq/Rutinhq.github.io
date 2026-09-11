import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { isGuideWidgetPath } from '@/guide/config'
import { languageFromPathname } from '@/lib/i18n/paths'

const GuideWidget = lazy(() => import('./GuideWidget'))

export function GuideHost() {
  const { pathname } = useLocation()
  if (!isGuideWidgetPath(pathname)) return null
  const locale = languageFromPathname(pathname)
  return (
    <Suspense fallback={null}>
      <GuideWidget key={locale} />
    </Suspense>
  )
}
