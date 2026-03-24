import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from './locales/en/common'
import ruCommon from './locales/ru/common'

const STORAGE_KEY = 'peardread-language'

export const supportedLanguages = ['en', 'ru'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

function resolveInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY)
  if (storedLanguage === 'en' || storedLanguage === 'ru') {
    return storedLanguage
  }

  const browserLanguage = window.navigator.language.toLowerCase()
  if (browserLanguage.startsWith('ru')) {
    return 'ru'
  }

  return 'en'
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { common: enCommon },
      ru: { common: ruCommon },
    },
    lng: resolveInitialLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })
}

void i18n.on('languageChanged', (language) => {
  if (language === 'en' || language === 'ru') {
    window.localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
  }
})

document.documentElement.lang = i18n.language

export default i18n
