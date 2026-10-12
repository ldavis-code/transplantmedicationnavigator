/**
 * Program eligibility by insurance pathway — ONE rule for every surface.
 *
 * The medication card (src/components/MedicationCardKit.jsx), the quiz
 * results (src/components/WizardProgramMatches.jsx), the prerendered
 * medication pages (scripts/prerender-seo.js via src/utils/medFacts.js) and
 * the sitemap all decide "does this program belong under this insurance?"
 * here, so the interactive card and the static pages cannot disagree.
 *
 * The rule:
 *   - A pathway shows a program only when the program's flag for that
 *     pathway is TRUE.
 *   - A flag that is unknown (null / missing) still shows the program, marked
 *     "Check eligibility with the program", and the program is listed in the
 *     verification report (scripts/report-medication-data.js). Never guessed.
 *   - A flag that is FALSE hides the program on that pathway.
 *   - Copay cards are commercial-only, always: they never appear on the
 *     Medicare, Medicaid, or uninsured pathway, whatever their flags say.
 *
 * Flags come from the eligibility block on each program in programs.json
 * ({ commercial, medicare, medicaid, uninsured, ... }). The Neon `programs`
 * columns proposed in db/migrations/056_program_eligibility_fields.sql
 * (accepts_commercial, accepts_medicare, ...) map onto the same block —
 * normalizeEligibility() accepts either spelling.
 *
 * Pure: no React, no i18n, no JSON imports. Build scripts import it too.
 */

export const PATHWAYS = ['commercial', 'medicare', 'medicaid', 'uninsured'];

export const STATUS = {
    ELIGIBLE: 'eligible', // flag is true: show
    CHECK: 'check',       // flag unknown: show with "Check eligibility with the program"
    HIDDEN: 'hidden',     // flag is false (or copay card off the commercial pathway): hide
};

// Entries stored in programs.json under copayPrograms/papPrograms that are not
// manufacturer copay cards or patient assistance programs: price-search links
// and discount cards. They are never routed as a copay card or a PAP (a
// discount card is not commercial-only, and treating it as a copay card would
// hide it from Medicare patients it does help). Listed in the report as data
// to reclassify.
export const NOT_ASSISTANCE_PROGRAM_IDS = new Set([
    'goodrx-search',
    'singlecare-search',
    'costplus-search',
    'drugs-com-search',
    'trumprx-gov',
]);

const bool = (v) => (v === true || v === false ? v : null);

/**
 * Normalize an eligibility block to
 * { commercial, medicare, medicaid, uninsured, excludesExtraHelp,
 *   requiresMedicaidDenial, verifiedDate, sourceUrl } with null = unknown.
 * Accepts the programs.json spelling and the Neon column spelling.
 */
export function normalizeEligibility(block) {
    const b = block || {};
    return {
        commercial: bool(b.commercial ?? b.accepts_commercial),
        medicare: bool(b.medicare ?? b.accepts_medicare),
        medicaid: bool(b.medicaid ?? b.accepts_medicaid),
        uninsured: bool(b.uninsured ?? b.accepts_uninsured),
        excludesExtraHelp: bool(b.excludesExtraHelp ?? b.excludes_extra_help),
        requiresMedicaidDenial: bool(b.requiresMedicaidDenial ?? b.requires_medicaid_denial),
        verifiedDate: b.verifiedDate ?? b.eligibility_verified_date ?? null,
        sourceUrl: b.sourceUrl ?? b.eligibility_source_url ?? null,
    };
}

/**
 * Status of one program on one pathway.
 * @param {'copay'|'pap'|'foundation'} type
 * @param {object|null} eligibility  programs.json eligibility block (or Neon row)
 * @param {string|null} pathway      one of PATHWAYS; null = insurance unknown
 */
export function programStatus(type, eligibility, pathway) {
    if (type === 'copay' && pathway && pathway !== 'commercial') return STATUS.HIDDEN;
    if (!pathway) return STATUS.ELIGIBLE; // no insurance answer: nothing to filter on
    const flag = normalizeEligibility(eligibility)[pathway];
    if (flag === true) return STATUS.ELIGIBLE;
    if (flag === false) return STATUS.HIDDEN;
    return STATUS.CHECK;
}

/** Which pathway flags are unknown on a program (for the verification report). */
export function unknownPathways(type, eligibility) {
    const e = normalizeEligibility(eligibility);
    // A copay card is commercial-only by rule, so only its commercial flag matters.
    const keys = type === 'copay' ? ['commercial'] : PATHWAYS;
    return keys.filter((k) => e[k] === null);
}
