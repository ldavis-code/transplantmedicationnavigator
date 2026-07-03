/**
 * i18next configuration.
 *
 * Locale resources are bundled inline (no async backend), so init is
 * synchronous and t() is available on first render. English is the source
 * of truth: en.json strings must match the original hardcoded copy exactly
 * (verified by `npm run snapshot:verify` — see tests/page-snapshots/).
 *
 * Spanish will be added as locales/es.json when translations land.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
        // React already escapes rendered strings
        escapeValue: false,
    },
});

export default i18n;
