import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from '../../locales/en.json'
import es from '../../locales/es.json'
import { defaultLanguage, supportedLanguages } from './config'

const isBrowser = typeof window !== 'undefined'

void i18n.use(initReactI18next)

if (isBrowser) {
  i18n.use(LanguageDetector)
}

void i18n.init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: isBrowser ? undefined : defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: [...supportedLanguages],
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },
})

export default i18n
