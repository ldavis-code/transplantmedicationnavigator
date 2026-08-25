/**
 * Whether a medication record IS the generic, and what to call it.
 *
 * Most records are a brand with a generic equivalent ("Prograf" / tacrolimus).
 * A few ARE the generic: "Tacrolimus (generic)" and "Prednisone" have no brand
 * to name, so brandName carries the generic name — with a "(generic)" label
 * bolted on in the tacrolimus case to keep it apart from Prograf in a list.
 *
 * Anything that drops brandName into a slot meant for a brand mangles those
 * records: the detail page printed "Tacrolimus (generic) (Tacrolimus)" and
 * asked "Is there a generic for Tacrolimus (generic)?" — a question that
 * answers itself, in the <title> and in the FAQ block Google lifts into
 * search results. These helpers are the shared answer, used by the page
 * (src/pages/MedicationDetail.jsx) and by the prerenderer
 * (scripts/prerender-seo.js) so the static and hydrated pages can't drift.
 *
 * Deliberately free of i18n and React imports: build scripts import it too.
 * Names come back in English (they must match what is printed on the bottle);
 * pass the result through localizeMedName() for display.
 */

const GENERIC_TAG = /\s*\(generic\)\s*/gi;

const clean = (name) => String(name || '').trim();

/** "Tacrolimus (generic)" -> "Tacrolimus". Leaves other names alone. */
export function stripGenericTag(name) {
    return clean(name).replace(GENERIC_TAG, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * True when the record is the generic drug itself rather than a brand that
 * has one. Compares the brand name minus its "(generic)" label against the
 * generic name: "Tacrolimus (generic)" and "Prednisone" match, "Prograf"
 * does not.
 */
export function isGenericRecord(med) {
    if (!med) return false;
    const brand = stripGenericTag(med.brandName).toLowerCase();
    const generic = clean(med.genericName).toLowerCase();
    return !!brand && !!generic && brand === generic;
}

/**
 * What the page calls the medication. For a generic record that is the drug
 * name without the "(generic)" label — the page says it is the generic in
 * prose, so the label would only stutter through the heading, title, and
 * every "Ways to save on ..." slot.
 */
export function medPageName(med) {
    if (!med) return '';
    return isGenericRecord(med) ? stripGenericTag(med.brandName) : clean(med.brandName);
}

/**
 * "Brand (Generic)" — for the intro line and meta description. Collapses to
 * the single name when the record IS the generic, or when the generic name
 * is already inside the brand name ("Tacrolimus Extended-Release").
 */
export function medNameWithGeneric(med) {
    if (!med) return '';
    const name = medPageName(med);
    const generic = clean(med.genericName);
    if (!generic || isGenericRecord(med)) return name;
    if (name.toLowerCase().includes(generic.toLowerCase())) return name;
    return `${name} (${generic})`;
}

/**
 * The brands a generic record stands in for: tacrolimus -> ["Prograf"].
 * Exact generic-name matches only, so extended-release brands (Astagraf XL,
 * genericName "Tacrolimus Extended-Release") are not offered as the brand
 * behind plain tacrolimus. Records that bundle brands ("Motrin / Advil")
 * contribute each name separately. Empty when we know of no brand, which the
 * copy has to handle — plenty of generics have no branded counterpart here.
 */
export function brandNamesForGeneric(med, allMeds) {
    if (!med || !isGenericRecord(med) || !Array.isArray(allMeds)) return [];
    const generic = clean(med.genericName).toLowerCase();
    const names = [];
    for (const other of allMeds) {
        if (!other || other.id === med.id || isGenericRecord(other)) continue;
        if (clean(other.genericName).toLowerCase() !== generic) continue;
        for (const part of clean(other.brandName).split('/')) {
            const name = stripGenericTag(part);
            if (name && !names.includes(name)) names.push(name);
        }
    }
    return names;
}
