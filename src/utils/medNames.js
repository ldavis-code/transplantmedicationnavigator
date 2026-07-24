import i18n from '../i18n.js';

/**
 * Drug names stay in English everywhere (they must match what's printed on
 * the bottle), but the "(generic)" qualifier in names like
 * "Tacrolimus (generic)" is a label, not part of the name — so it is
 * localized in Spanish mode. Display-only: never apply this to values used
 * for matching (Epic import, dedupe keys, program lookups).
 */
export function localizeMedName(name) {
    if (!name || i18n.resolvedLanguage !== 'es') return name;
    return name.replace(/\(generic\)/gi, '(genérico)');
}
