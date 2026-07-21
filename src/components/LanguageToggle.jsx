import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { trackServerEvent } from '../lib/trackServerEvent.js';

// The invitation to switch is always written in the TARGET language, so a
// Spanish speaker landing on the English page can find it. These two strings
// are intentionally not in the locale files.
const SWITCH_LABELS = {
    en: 'Ver esta página en español',
    es: 'View this page in English',
};

/**
 * Language switcher shown on pages that have a Spanish translation.
 * Persists the choice (via i18n.js) and updates <html lang> for screen
 * readers and the read-aloud feature.
 */
const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const current = i18n.resolvedLanguage === 'es' ? 'es' : 'en';
    const next = current === 'es' ? 'en' : 'es';

    return (
        <button
            onClick={() => {
                // Track before switching so the event carries the language
                // the user was leaving; `to` records where they went.
                trackServerEvent('language_toggle', { to: next });
                i18n.changeLanguage(next);
            }}
            lang={next}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-300 shadow-sm transition min-h-[44px]"
        >
            <Globe size={18} aria-hidden="true" />
            {SWITCH_LABELS[current]}
        </button>
    );
};

export default LanguageToggle;
