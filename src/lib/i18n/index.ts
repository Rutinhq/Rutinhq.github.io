import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../../locales/en.json'
import es from '../../locales/es.json'
import { defaultLanguage, supportedLanguages } from './config'
import { languageFromPathname } from './paths'

const isBrowser = typeof window !== 'undefined'

void i18n.use(initReactI18next)

void i18n.init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: isBrowser
    ? languageFromPathname(window.location.pathname)
    : defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: [...supportedLanguages],
  interpolation: { escapeValue: false },
})

export default i18n
