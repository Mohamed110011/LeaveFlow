import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './translations/en.json';
import frTranslations from './translations/fr.json';

// Configuration i18next
i18n
  .use(LanguageDetector) // Détecte automatiquement la langue préférée du navigateur
  .use(initReactI18next) // Passe l'instance i18n à react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      fr: {
        translation: frTranslations
      }
    },
    fallbackLng: 'en', // Langue par défaut si la traduction n'existe pas
    detection: {
      order: ['localStorage', 'navigator'], // Ordre de détection de la langue
      lookupLocalStorage: 'preferredLanguage', // Clé utilisée dans localStorage
    },
    interpolation: {
      escapeValue: false // Réagit échappe déjà par défaut
    }
  });

export default i18n;
