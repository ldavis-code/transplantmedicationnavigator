/**
 * Shared Epic FHIR medication matching: RxNorm code first, then brand/generic
 * name, then curated generic-name synonyms. Single source of truth used by the
 * epic-medications Netlify function (server-side matching for the static
 * callback page) and importable by the React app.
 *
 * Extracted verbatim from src/pages/EpicCallback.jsx so both paths match
 * identically.
 */

function cleanMedicationName(name) {
    if (!name) return '';
    let n = String(name);
    // Strengths with units, including ratios like "100 mg/5 mL"
    n = n.replace(/\b\d+(\.\d+)?\s*(mg|mcg|g|gm|ml|l|units?|meq|iu|%)\b(\s*\/\s*\d+(\.\d+)?\s*(mg|mcg|g|ml)?)?/gi, ' ');
    // Leftover unit-only ratios like "/mL" (when the numerator strength was removed)
    n = n.replace(/\/\s*(mg|mcg|g|gm|ml|l|units?|meq|iu|%)\b/gi, ' ');
    // Multi-word dosage forms
    n = n.replace(/\b(extended|delayed|sustained|immediate|modified|controlled)[ -]release\b/gi, ' ');
    // Dosage forms / routes of administration
    n = n.replace(/\b(oral|tablets?|capsules?|caps?|solution|suspension|injectable|injection|intravenous|subcutaneous|intramuscular|topical|transdermal|cream|ointment|gel|lotion|patches?|inhalation|inhaler|nebulizer|spray|drops?|ophthalmic|otic|nasal|syrup|elixir|powder|granules?|kit|pack|disintegrating|chewable)\b/gi, ' ');
    // Standalone dosage-form abbreviations
    n = n.replace(/\b(er|xr|xl|sr|dr|cr|la|ec|iv|im)\b/gi, ' ');
    // Leftover standalone numbers
    n = n.replace(/\b\d+(\.\d+)?\b/g, ' ');
    // Tidy punctuation and whitespace
    n = n.replace(/[(),;]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    n = n.replace(/\s*[-/]\s*$/, '').trim();
    return n;
}

/**
 * Cleaned, lowercased brand-name segments for a medication record. A record's
 * brandName can list several products (e.g. "Prograf / Envarsus XR / Astagraf
 * XL"); each segment is cleaned so "Envarsus XR" still matches "Envarsus".
 */
function brandSegments(med) {
    return (med.brandName || '')
        .split('/')
        .map(s => cleanMedicationName(s).toLowerCase().trim())
        .filter(Boolean);
}

/**
 * True when EVERY significant word of `phrase` appears in `name`. Word-based
 * (not substring) so word order doesn't matter, e.g. our generic
 * "Trimethoprim-Sulfamethoxazole" still matches Epic's "Sulfamethoxazole-
 * Trimethoprim", and so similar drugs are distinguished: "tenofovir
 * disoproxil" (Viread) matches Viread but not "tenofovir alafenamide" (Vemlidy).
 */
function wordsAllPresent(phrase, name) {
    // Whole-word (token) match, NOT substring, so "ganciclovir" does not match
    // inside "valganciclovir", and "vitamin" does not match inside "multivitamin".
    const nameWords = new Set((name || '').split(/[^a-z0-9]+/).filter(Boolean));
    const words = (phrase || '').split(/[^a-z0-9]+/).filter(w => w.length > 2);
    return words.length > 0 && words.every(w => nameWords.has(w));
}

/** How specifically a record matches a name, more matched words = more specific. */
function matchSpecificity(name, med) {
    const wordCount = phrase => (phrase || '').split(/[^a-z0-9]+/).filter(w => w.length > 2).length;
    let score = 0;
    const generic = (med.genericName || '').toLowerCase().trim();
    if (wordsAllPresent(generic, name)) score = Math.max(score, wordCount(generic));
    for (const seg of brandSegments(med)) {
        if (wordsAllPresent(seg, name)) score = Math.max(score, wordCount(seg));
    }
    return score;
}

/** Does a (cleaned, lowercased) FHIR name correspond to this medication record? */
function nameMatchesMed(name, med) {
    if (wordsAllPresent((med.genericName || '').toLowerCase().trim(), name)) return true;
    return brandSegments(med).some(seg => wordsAllPresent(seg, name));
}

/**
 * Is the patient taking the GENERIC (vs a brand) of this medication? Determined
 * from the name Epic sent: it's the generic when the name matches the generic
 * name and does not specifically name a brand product. Generics have no
 * manufacturer copay card, so the UI steers to cash options instead.
 */
function isGenericName(name, med) {
    const generic = (med.genericName || '').toLowerCase().trim();
    if (!generic) return false;
    const matchesGeneric = wordsAllPresent(generic, name);
    const matchesBrand = brandSegments(med).some(seg => wordsAllPresent(seg, name));
    return matchesGeneric && !matchesBrand;
}

/** Is this record the generic itself (vs a brand-name product)? */
function isGenericRecord(med) {
    const brand = (med.brandName || '').toLowerCase();
    const generic = (med.genericName || '').toLowerCase().trim();
    return (med.manufacturer || '').toLowerCase() === 'generic'
        || brand.includes('generic')
        || brand.trim() === generic;
}

/**
 * Pick the single best record for a patient's medication name. We want the ONE
 * product the patient actually takes, never a pile of related brands, so:
 *   1. an exact brand-name hit (the patient named a specific brand), else
 *   2. the generic record when the patient's name is the generic, else
 *   3. the first reasonable name match.
 */
function pickBestMatch(name, candidates) {
    if (candidates.length <= 1) return candidates[0] || null;
    // Prefer the most SPECIFIC match (most words matched, e.g. "Fluticasone
    // Nasal" over plain "Fluticasone"); break ties toward the generic record so
    // a generic name maps to the generic, not a brand.
    let best = null;
    let bestScore = -1;
    for (const m of candidates) {
        const tieBreak = isGenericRecord(m) && isGenericName(name, m) ? 0.25 : 0;
        const score = matchSpecificity(name, m) + tieBreak;
        if (score > bestScore) {
            bestScore = score;
            best = m;
        }
    }
    return best;
}

/**
 * Curated fallbacks for generic-name variants Epic sends that don't token-match
 * our record names, e.g. Epic's "mycophenolate sodium" is our Myfortic, and a
 * bare "tenofovir" is our Viread. Most specific entries first. These are GENERIC
 * chemical names, so a synonym hit is treated as the generic.
 */
const SYNONYM_MAP = [
    { tokens: ['mycophenolate', 'sodium'], id: 'myfortic' },
    { tokens: ['mycophenolic'], id: 'myfortic' },
    { tokens: ['mycophenolate', 'mofetil'], id: 'mycophenolate' },
    { tokens: ['mycophenolate'], id: 'mycophenolate' },
    { tokens: ['tenofovir', 'alafenamide'], id: 'vemlidy' },
    { tokens: ['tenofovir', 'disoproxil'], id: 'viread' },
    { tokens: ['tenofovir'], id: 'viread' },
];

/** Match a name against the curated synonym map; returns the record id or null. */
function matchSynonym(name, medsList) {
    const nameWords = new Set((name || '').split(/[^a-z0-9]+/).filter(Boolean));
    for (const syn of SYNONYM_MAP) {
        if (syn.tokens.every(t => nameWords.has(t)) && medsList.some(m => m.id === syn.id)) {
            return syn.id;
        }
    }
    return null;
}

/**
 * Match raw FHIR medications (name + RxNorm code) from Epic against our
 * transplant medication database, returning internal medication IDs that the
 * My Path Quiz and the Grants & Foundations medications tab can consume.
 *
 * Strategy: exact RxNorm (rxcui) match first (most reliable), then fall back to
 * brand/generic name matching. Epic returns names like "Tacrolimus 1 MG Oral
 * Capsule" or "Prograf 1 MG Oral Capsule", so we check whether the FHIR name
 * contains our generic name or any brand-name segment. We also record which
 * matches are the GENERIC so copay cards (brand-only) can be hidden for them.
 */
function matchEpicMedications(fhirMeds, medsList) {
    const matched = new Set();
    const genericIds = new Set();
    const unmatched = [];
    for (const med of fhirMeds) {
        const cleanName = cleanMedicationName(med.name);
        const name = cleanName.toLowerCase().trim();
        const rx = String(med.rxNormCode || '').trim();
        let found = null;

        // 1) RxNorm code match
        if (rx) {
            found = medsList.find(m => m.rxcui && String(m.rxcui) === rx);
        }

        // 2) Brand / generic name match, pick the single best product so we
        //    import only the drug the patient actually takes, not every related brand.
        if (!found && name) {
            found = pickBestMatch(name, medsList.filter(m => nameMatchesMed(name, m)));
        }

        // Curated synonym for generic-name variants Epic uses that don't
        //    token-match our names (e.g. "mycophenolate sodium" -> Myfortic
        //    [mycophenolate sodium is the generic of Myfortic], "tenofovir" ->
        //    Viread). Compute this regardless of how `found` was resolved: these
        //    are GENERIC chemical names, so a hit means the patient takes the
        //    generic even when an RxNorm code matched the brand record first.
        const synId = name ? matchSynonym(name, medsList) : null;

        // 3) Synonym fallback when nothing else matched.
        if (!found && synId) {
            found = medsList.find(m => m.id === synId) || null;
        }

        if (found) {
            matched.add(found.id);
            // It's the generic when the name is a generic synonym for this
            // record, or the name matches the generic (not a brand). Either way,
            // show the generic, no brand copay card / PAP.
            const isGenericSynonym = synId && synId === found.id;
            if (isGenericSynonym || (name && isGenericName(name, found))) {
                genericIds.add(found.id);
            }
        } else if (cleanName || med.name) {
            // Store the cleaned (name-only) value so skipped meds show without
            // the strength/form clutter.
            unmatched.push(cleanName || med.name);
        }
    }
    return {
        matched: Array.from(matched),
        unmatched,
        genericIds: Array.from(genericIds)
    };
}

export { matchEpicMedications, cleanMedicationName };
