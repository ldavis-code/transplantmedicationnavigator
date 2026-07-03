/**
 * i18next configuration.
 *
 * Locale resources are bundled inline (no async backend), so init is
 * synchronous and t() is available on first render. English is the source
 * of truth: en.json strings must match the original hardcoded copy exactly
 * (verified by `npm run snapshot:verify` — see tests/page-snapshots/).
 *
 * Language selection:
 *   1. ?lang=es|en URL parameter (shareable links; also saves the choice)
 *   2. previously saved choice in localStorage
 *   3. default: English
 * The choice is applied to <html lang> so screen readers and the
 * read-aloud feature use the right voice.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

const STORAGE_KEY = 'tmn-lang';
const SUPPORTED = ['en', 'es'];

function detectInitialLanguage() {
    if (typeof window === 'undefined') return 'en';
    try {
        const param = new URLSearchParams(window.location.search).get('lang');
        if (SUPPORTED.includes(param)) {
            localStorage.setItem(STORAGE_KEY, param);
            return param;
        }
        const saved = localStorage.getItem(STORAGE_KEY);
        if (SUPPORTED.includes(saved)) return saved;
    } catch {
        // localStorage unavailable (private mode) — fall through to default
    }
    return 'en';
}

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        es: { translation: es },
    },
    lng: detectInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
        // React already escapes rendered strings
        escapeValue: false,
    },
});

i18n.on('languageChanged', (lng) => {
    if (typeof document !== 'undefined') {
        document.documentElement.lang = lng;
    }
    try {
        localStorage.setItem(STORAGE_KEY, lng);
    } catch {
        // localStorage unavailable — language still switches for this visit
    }
});

// Apply the initial language to <html lang> (languageChanged only fires on
// later switches for the already-detected initial language).
if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.language;
}

export default i18n;
