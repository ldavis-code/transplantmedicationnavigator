import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { LANG_STORAGE_KEY, ES_OFFER_DISMISS_KEY } from '../i18n.js';

// On the English page the invitation is in Spanish so a Spanish speaker can
// find it. On the Spanish page it is also in Spanish: the reader chose
// Spanish, and the accessibility review flagged English UI instructions
// interrupting Spanish pages ("inglés" stays recognizable to English
// speakers who switched by accident). Intentionally not in the locale files.
const SWITCH_LABELS = {
    en: 'Ver esta página en español',
    es: 'Ver esta página en inglés',
};

// Short labels for the compact header variant: the name of the language the
// button switches TO, in that language, per the usual web convention.
const SWITCH_LABELS_SHORT = {
    en: 'Español',
    es: 'English',
};

/**
 * Language switcher shown on pages that have a Spanish translation.
 * Spanish lives at the /es/ path prefix, so switching is a full navigation
 * between the two URL spaces: /es/<page> ⇄ /<page>. That lands the reader
 * on the prerendered page in the chosen language with a shareable address,
 * and the router restarts with the right basename. The choice is persisted
 * to localStorage before navigating (the page unloads, so i18n's own
 * languageChanged handler would be too late).
 *
 * compact: small header variant — shows just "Español" / "English" with the
 * full invitation moved to the accessible name.
 */
const LanguageToggle = ({ compact = false }) => {
    const { i18n } = useTranslation();
    const location = useLocation(); // basename-stripped: no /es prefix
    const current = i18n.resolvedLanguage === 'es' ? 'es' : 'en';
    const next = current === 'es' ? 'en' : 'es';

    const switchLanguage = () => {
        try {
            localStorage.setItem(LANG_STORAGE_KEY, next);
            // Using the toggle means the reader found the language controls —
            // retire the "¿Prefiere español?" offer bar for good.
            localStorage.setItem(ES_OFFER_DISMISS_KEY, '1');
        } catch {
            // localStorage unavailable — the target URL still decides
        }
        const params = new URLSearchParams(location.search);
        params.delete('lang'); // legacy parameter; the path carries the language
        const qs = params.toString();
        const suffix = location.pathname + (qs ? `?${qs}` : '') + location.hash;
        // assign, not replace: back should return to the pre-switch language
        window.location.assign(next === 'es' ? `/es${suffix}` : suffix);
    };

    if (compact) {
        return (
            <button
                onClick={switchLanguage}
                lang={next}
                aria-label={SWITCH_LABELS[current]}
                title={SWITCH_LABELS[current]}
                className="hidden min-[360px]:inline-flex items-center gap-1.5 px-2 2xl:px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 text-sm 2xl:text-base font-semibold rounded-lg border border-emerald-300 transition min-h-[44px] min-w-[44px] justify-center whitespace-nowrap"
            >
                <Globe size={16} aria-hidden="true" />
                {/* On the narrowest phones only the globe fits next to the
                    brand and menu button; the full label returns at sm. */}
                <span className="hidden sm:inline">{SWITCH_LABELS_SHORT[current]}</span>
            </button>
        );
    }

    return (
        <button
            onClick={switchLanguage}
            lang={next}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-300 shadow-sm transition min-h-[44px]"
        >
            <Globe size={18} aria-hidden="true" />
            {SWITCH_LABELS[current]}
        </button>
    );
};

export default LanguageToggle;
