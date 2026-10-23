import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import fr from "./fr.json";

const deviceLanguage = getLocales()[0]?.languageCode;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: deviceLanguage === "fr" ? "fr" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;