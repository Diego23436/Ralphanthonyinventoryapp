import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: (() => {
    try {
      return localStorage.getItem('ra_lang') || 'en'
    } catch {
      return 'en'
    }
  })(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

function syncDocumentLanguage(lng) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng
  document.documentElement.dir = lng === 'fr' ? 'ltr' : 'ltr'
}

syncDocumentLanguage(i18n.resolvedLanguage || i18n.language)
i18n.on('languageChanged', syncDocumentLanguage)

export default i18n
