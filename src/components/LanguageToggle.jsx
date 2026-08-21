import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Globe } from 'lucide-react';

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
 * Persists the choice (via i18n.js) and updates <html lang> for screen
 * readers and the read-aloud feature. Also mirrors the choice into the
 * URL (?lang=es) so the current page is immediately shareable in Spanish;
 * English is the default, so switching back removes the parameter.
 *
 * compact: small header variant — shows just "Español" / "English" with the
 * full invitation moved to the accessible name.
 */
const LanguageToggle = ({ compact = false }) => {
    const { i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const current = i18n.resolvedLanguage === 'es' ? 'es' : 'en';
    const next = current === 'es' ? 'en' : 'es';

    const switchLanguage = () => {
        i18n.changeLanguage(next);
        const params = new URLSearchParams(searchParams);
        if (next === 'es') {
            params.set('lang', 'es');
        } else {
            params.delete('lang');
        }
        // replace, not push: back should return to the previous page, not
        // re-toggle the language (which only applies on initial load anyway)
        setSearchParams(params, { replace: true });
    };

    if (compact) {
        return (
            <button
                onClick={switchLanguage}
                lang={next}
                aria-label={SWITCH_LABELS[current]}
                title={SWITCH_LABELS[current]}
                className="hidden min-[360px]:inline-flex items-center gap-1.5 px-2 py-2 bg-white hover:bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg border border-emerald-300 transition min-h-[44px] min-w-[44px] justify-center whitespace-nowrap"
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
