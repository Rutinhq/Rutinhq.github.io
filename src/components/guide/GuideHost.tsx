import { useLocation } from 'react-router-dom'
import { isGuideWidgetPath } from '@/guide/config'
import { languageFromPathname } from '@/lib/i18n/paths'
import { GuideWidget } from './GuideWidget'

export function GuideHost() {
  const { pathname } = useLocation()
  if (!isGuideWidgetPath(pathname)) return null
  const locale = languageFromPathname(pathname)
  return <GuideWidget key={locale} />
}
