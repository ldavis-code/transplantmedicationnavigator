/**
 * i18next configuration.
 *
 * BOTH locales load as their own chunks — neither rides in the entry
 * bundle (together they were ~425 KB of JSON every visitor parsed).
 * main.jsx awaits `i18nReady` before the first render, and index.html
 * carries a modulepreload hint for the English chunk (index-es.html for
 * both), so the locale downloads in parallel with the entry module and
 * t() is fully populated before anything renders: no missing-key flash,
 * no English flash for Spanish visitors. English is always loaded (it is
 * the fallback language); Spanish additionally when active.
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

// Fetch locale bundles on demand. Idempotent: repeated calls reuse the same
// promise, and the chunks are served immutable so the network cost is
// one-time.
const localeLoads = {};
function loadLocale(lng) {
    if (!localeLoads[lng]) {
        localeLoads[lng] = (lng === 'es' ? import('./locales/es.json') : import('./locales/en.json'))
            .then((mod) => {
                i18n.addResourceBundle(lng, 'translation', mod.default);
            });
    }
    return localeLoads[lng];
}
const loadSpanish = () => loadLocale('es');

const initialLanguage = detectInitialLanguage();

i18n.use(initReactI18next).init({
    // Resource bundles are added asynchronously by loadLocale before the
    // first render (main.jsx awaits i18nReady).
    resources: {},
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
// English always loads (it is the fallback for missing Spanish keys);
// Spanish additionally when it is the active language. The trailing
// changeLanguage makes i18next re-resolve now that bundles exist. On a
// load failure, render anyway rather than blocking the page.
export const i18nReady = Promise.all([
    loadLocale('en'),
    initialLanguage === 'es' ? loadLocale('es') : null,
]).then(() => originalChangeLanguage(initialLanguage)).catch(() => {});

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
