/**
 * i18next configuration.
 *
 * English is bundled inline (it is the default and the fallback), so t() is
 * available on first render for English visitors. Spanish is a separate
 * lazily-loaded chunk: bundling both languages put ~425 KB of JSON in the
 * main bundle every visitor paid for. main.jsx awaits `i18nReady` before the
 * first render, so Spanish visitors never see an English flash — they wait
 * for the (small, cached) Spanish chunk instead of the old everything-bundle.
 * English is the source of truth: en.json strings must match the original
 * hardcoded copy exactly (verified by `npm run snapshot:verify` — see
 * tests/page-snapshots/).
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

// Fetch the Spanish bundle on demand. Idempotent: repeated calls reuse the
// same promise, and the chunk is served immutable so the network cost is
// one-time.
let spanishLoad = null;
function loadSpanish() {
    if (!spanishLoad) {
        spanishLoad = import('./locales/es.json').then((mod) => {
            i18n.addResourceBundle('es', 'translation', mod.default);
        });
    }
    return spanishLoad;
}

const initialLanguage = detectInitialLanguage();

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
        // React already escapes rendered strings
        escapeValue: false,
    },
});

// Every language switch goes through changeLanguage (LanguageToggle, ?lang=
// handling, /es redirect), so make it load the Spanish bundle first. Wrapping
// here rather than at call sites keeps future callers correct by default.
const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = (lng, ...args) => {
    if (typeof lng === 'string' && lng.toLowerCase().startsWith('es')) {
        return loadSpanish().then(() => originalChangeLanguage(lng, ...args));
    }
    return originalChangeLanguage(lng, ...args);
};

// Resolves when the initially-detected language is ready to render.
// English: already resolved. Spanish: after the Spanish chunk loads (on
// failure, fall through to English fallback rather than blocking render).
export const i18nReady = initialLanguage === 'es'
    ? loadSpanish().then(() => originalChangeLanguage('es')).catch(() => {})
    : Promise.resolve();

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
