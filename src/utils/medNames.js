import i18n from '../i18n.js';

/**
 * Brand names stay in English everywhere (they must match what's printed on
 * the bottle), but qualifiers like the "(generic)" in "Tacrolimus (generic)"
 * or the "Extended-Release" in "Tacrolimus Extended-Release" are labels, not
 * part of the name — so they are localized in Spanish mode. Display-only:
 * never apply this to values used for matching (Epic import, dedupe keys,
 * program lookups).
 */
export function localizeMedName(name) {
    if (!name || i18n.resolvedLanguage !== 'es') return name;
    return name
        .replace(/\(generic\)/gi, '(genérico)')
        .replace(/Extended-Release/gi, 'de liberación prolongada');
}
