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

/**
 * Language switcher shown on pages that have a Spanish translation.
 * Persists the choice (via i18n.js) and updates <html lang> for screen
 * readers and the read-aloud feature. Also mirrors the choice into the
 * URL (?lang=es) so the current page is immediately shareable in Spanish;
 * English is the default, so switching back removes the parameter.
 */
const LanguageToggle = () => {
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
