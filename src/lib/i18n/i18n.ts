import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ru from './locales/ru.json'
import be from './locales/be.json'

export const SUPPORTED_LANGS = ['en', 'ru', 'be'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

function normalizeLang(code: string | undefined): SupportedLang {
  const base = (code ?? 'ru').split('-')[0]?.toLowerCase() ?? 'ru'
  return SUPPORTED_LANGS.includes(base as SupportedLang) ? (base as SupportedLang) : 'ru'
}

function setHtmlLang(lng: string): void {
  document.documentElement.lang = normalizeLang(lng)
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      be: { translation: be },
    },
    fallbackLng: 'ru',
    supportedLngs: [...SUPPORTED_LANGS],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

setHtmlLang(i18n.language)
i18n.on('languageChanged', setHtmlLang)

export default i18n
