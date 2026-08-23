/**
 * i18next configuration.
 *
 * BOTH locales load as their own chunks — neither rides in the entry
 * bundle (together they were ~425 KB of JSON every visitor parsed).
 * main.jsx awaits `i18nReady` before the first render, and index.html
 * carries a modulepreload hint for the English chunk (the /es/ pages for
 * both), so the locale downloads in parallel with the entry module and
 * t() is fully populated before anything renders: no missing-key flash,
 * no English flash for Spanish visitors. English is always loaded (it is
 * the fallback language); Spanish additionally when active.
 * English is the source of truth: en.json strings must match the original
 * hardcoded copy exactly (verified by `npm run snapshot:verify` — see
 * tests/page-snapshots/).
 *
 * Language selection:
 *   1. the /es/ path prefix (Spanish pages live at /es/<route>, served
 *      statically by Netlify; also saves the choice)
 *   2. ?lang=es|en URL parameter (legacy shareable links; the server 301s
 *      ?lang=es to /es/, so this mostly covers ?lang=en and old cached
 *      app shells; also saves the choice)
 *   3. previously saved choice in localStorage
 *   4. default: English
 * The choice is applied to <html lang> so screen readers and the
 * read-aloud feature use the right voice.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Exported for the components that persist the choice around a full page
// navigation (LanguageToggle, LanguageUrlSync), where changeLanguage's
// languageChanged handler never gets to run before the page unloads.
export const LANG_STORAGE_KEY = 'tmn-lang';

// Once set, the "¿Prefiere español?" offer bar stays hidden. Set by its own
// dismiss button and by any use of the language toggle — either way the
// reader has found the language controls, so the offer's job is done.
export const ES_OFFER_DISMISS_KEY = 'tmn-es-offer-dismissed';
const STORAGE_KEY = LANG_STORAGE_KEY;
const SUPPORTED = ['en', 'es'];

// Spanish pages live at the /es/ path prefix (e.g. /es/medications).
export function isSpanishPath(pathname) {
    return pathname === '/es' || pathname.startsWith('/es/');
}

function detectInitialLanguage() {
    if (typeof window === 'undefined') return 'en';
    try {
        // The path is the page's identity: /es/... IS the Spanish page,
        // whatever the saved preference says.
        if (isSpanishPath(window.location.pathname)) {
            localStorage.setItem(STORAGE_KEY, 'es');
            return 'es';
        }
        const param = new URLSearchParams(window.location.search).get('lang');
        if (SUPPORTED.includes(param)) {
            localStorage.setItem(STORAGE_KEY, param);
            return param;
        }
        const saved = localStorage.getItem(STORAGE_KEY);
        if (SUPPORTED.includes(saved)) return saved;
    } catch {
        // localStorage unavailable (private mode) — fall through to default;
        // the /es path check cannot throw, only the storage writes can, so
        // re-derive it here rather than losing the page's language.
        if (isSpanishPath(window.location.pathname)) return 'es';
    }
    return 'en';
}

// Fetch locale bundles on demand. Idempotent: repeated calls reuse the same
// promise, and the chunks are served immutable so the network cost is
// one-time. A FAILED load is not cached — a transient failure (offline
// moment, chunk replaced by a fresh deploy) would otherwise permanently
// break language switching for the rest of the visit.
const localeLoads = {};
function loadLocale(lng) {
    if (!localeLoads[lng]) {
        localeLoads[lng] = (lng === 'es' ? import('./locales/es.json') : import('./locales/en.json'))
            .then((mod) => {
                i18n.addResourceBundle(lng, 'translation', mod.default);
            })
            .catch((err) => {
                delete localeLoads[lng];
                throw err;
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
