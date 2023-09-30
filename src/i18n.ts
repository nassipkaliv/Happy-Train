import i18n from "i18next";
import {initReactI18next} from "react-i18next";
// import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/en.json';

const resources = {
  en: {
    translation: en,
  },
  // ru: {
  //   translation: ru,
  // },
  // tr: {
  //   translation: tr,
  // },
  // zh: {
  //   translation: zh,
  // },
  // fr: {
  //   translation: fr,
  // },
  // vi: {
  //   translation: vi,
  // },
  // hi: {
  //   translation: hi,
  // },
  // th: {
  //   translation: th,
  // },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  // .use(LanguageDetector)
  .init({
    resources,

    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
