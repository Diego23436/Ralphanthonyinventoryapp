import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'

const supportedLanguages = ['en', 'fr']

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem('ra_lang')
    return stored && supportedLanguages.includes(stored) ? stored : 'en'
  } catch {
    return 'en'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getStoredLanguage(),
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

export function setAppLanguage(lng) {
  const nextLanguage = supportedLanguages.includes(lng) ? lng : 'en'
  try {
    localStorage.setItem('ra_lang', nextLanguage)
  } catch {
    // Ignore storage failures.
  }
  return i18n.changeLanguage(nextLanguage)
}

export default i18n
