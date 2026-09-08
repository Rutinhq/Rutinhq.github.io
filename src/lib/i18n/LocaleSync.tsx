import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocale } from './paths'

/** Path is the source of truth: `/es` and `/es/*` are Spanish; everything else is English. */
export function LocaleSync() {
  const { lang } = useLocale()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!i18n.language?.startsWith(lang)) {
      void i18n.changeLanguage(lang)
    }
  }, [i18n, lang])

  return null
}
