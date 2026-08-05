import { localizeMedName } from './medNames.js';

// Reads the set of medication IDs the patient takes as the GENERIC, captured
// during Epic import (see EpicCallback). Generics have no manufacturer copay
// card, so cards use this to hide copay cards and steer to cash options.
export function isEpicGenericMed(medId) {
    try {
        const raw = localStorage.getItem('tmn_epic_generic_meds');
        if (!raw) return false;
        const ids = JSON.parse(raw);
        return Array.isArray(ids) && ids.includes(medId);
    } catch (e) {
        return false;
    }
}

// Label for a medication chip/list item. Shows the GENERIC name when the patient
// takes the generic (from their Epic import) or when a record bundles multiple
// brand names, so the quiz shows "Alprazolam", not "Xanax".
export function medDisplayName(med) {
    if (!med) return '';
    const multipleBrands = (med.brandName || '').includes('/');
    if ((med.id && isEpicGenericMed(med.id)) || multipleBrands) {
        return localizeMedName(med.genericName || med.brandName || '');
    }
    return localizeMedName((med.brandName || '').split('/')[0]);
}

// "Link verified" stamp: "July 2026" in English, "julio de 2026" in Spanish.
// iso is a YYYY-MM-DD date string.
