import { useLocation } from 'react-router-dom'
import { hreflangPair } from '@/components/Seo'
import {
  languageFromPathname,
  localePath,
  stripLocalePrefix,
  withLocale,
  type PageLocale,
} from './paths'

export function usePageLocale() {
  const { pathname } = useLocation()
  const locale: PageLocale = languageFromPathname(pathname)
  const path = localePath(pathname, locale)
  const barePath = stripLocalePrefix(pathname)

  function localized(enPath: string) {
    return withLocale(enPath, locale)
  }

  function alternatesFor(enPath: string) {
    return hreflangPair(enPath, withLocale(enPath, 'es'))
  }

  return { locale, path, barePath, localized, alternatesFor }
}
