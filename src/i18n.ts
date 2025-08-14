import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

async function setupI18n() {
  const en = await fetch("/locales/en/translation.json").then((res) =>
    res.json()
  );
  const fr = await fetch("/locales/fr/translation.json").then((res) =>
    res.json()
  );

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      debug: true,
      resources: {
        en: { translation: en },
        fr: { translation: fr },
      },
      interpolation: {
        escapeValue: false,
      },
    });
}

export default setupI18n;
