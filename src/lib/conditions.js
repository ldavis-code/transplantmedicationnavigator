/**
 * Condition taxonomy helpers.
 *
 * A medication's `category` is its drug class; its `condition` is what the
 * drug is for. See src/data/conditions.json for why both exist and how the
 * mapping is maintained.
 *
 * Every consumer — the frontend, the Neon sync scripts and the migration
 * generator — resolves conditions through this module, so the JSON file, the
 * database column and the UI can never drift into three different taxonomies.
 */

// The import attribute is what lets scripts/apply-medication-conditions.js
// run this module under plain node, so the file it writes and the frontend
// that reads it resolve conditions through the same code.
import CONDITIONS_DATA from '../data/conditions.json' with { type: 'json' };

export const CONDITIONS = CONDITIONS_DATA.conditions;
export const CATEGORY_TO_CONDITION = CONDITIONS_DATA.categoryToCondition;
export const CATEGORY_ALIASES = Object.fromEntries(
    Object.entries(CONDITIONS_DATA.categoryAliases).filter(([key]) => key !== '_comment')
);
const MEDICATION_OVERRIDES = Object.fromEntries(
    Object.entries(CONDITIONS_DATA.medicationOverrides).filter(([key]) => key !== '_comment')
);

const BY_ID = new Map(CONDITIONS.map((c) => [c.id, c]));

/** Collapse a merged category name onto the one that survived. */
export function normalizeCategory(category) {
    return CATEGORY_ALIASES[category] || category || null;
}

/**
 * Resolve the condition id for a medication record. Returns null when the
 * category has no mapping — callers that must not ship an unclassified record
 * (the apply script, the migration generator) treat null as a hard error.
 */
export function conditionForMedication(med) {
    if (!med) return null;
    if (MEDICATION_OVERRIDES[med.id]) return MEDICATION_OVERRIDES[med.id];
    return CATEGORY_TO_CONDITION[normalizeCategory(med.category)] || null;
}

/** Condition record ({ id, label, group }) for an id, or null. */
export function getCondition(id) {
    return BY_ID.get(id) || null;
}

/** Display label for a condition id, falling back to the id itself. */
export function conditionLabel(id) {
    return BY_ID.get(id)?.label || id || '';
}

/** Condition ids referenced by the maps but missing from the condition list. */
export function danglingConditionIds() {
    const referenced = new Set([
        ...Object.values(CATEGORY_TO_CONDITION),
        ...Object.values(MEDICATION_OVERRIDES),
    ]);
    return [...referenced].filter((id) => !BY_ID.has(id)).sort();
}

/** Categories present in `medications` that this taxonomy cannot classify. */
export function unmappedCategories(medications) {
    const missing = new Set();
    for (const med of medications) {
        if (!conditionForMedication(med)) missing.add(med.category);
    }
    return [...missing].sort();
}

/**
 * Group medications by condition, in the taxonomy's declared order.
 * Returns [{ ...condition, medications: [...] }] with empty conditions omitted.
 */
export function groupByCondition(medications) {
    const buckets = new Map(CONDITIONS.map((c) => [c.id, []]));
    for (const med of medications) {
        const id = med.condition || conditionForMedication(med);
        if (buckets.has(id)) buckets.get(id).push(med);
    }
    return CONDITIONS
        .map((c) => ({ ...c, medications: buckets.get(c.id) }))
        .filter((c) => c.medications.length > 0);
}
