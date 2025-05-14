import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from '../locales/en/translation.json';
import translationPTBR from '../locales/pt-BR/translation.json';
import translationPTPT from '../locales/pt-PT/translation.json';

// Get browser language preference
const browserLanguage = navigator.language || navigator.userLanguage;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en': {
        translation: translationEN
      },
      'pt-BR': {
        translation: translationPTBR
      },
      'pt-PT': {
        translation: translationPTPT
      }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR', 'pt-PT'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie'],
      lookupFromPathIndex: 0,
      checkWhitelist: true
    },
    react: {
      useSuspense: false
    }
  });

export default i18n; 