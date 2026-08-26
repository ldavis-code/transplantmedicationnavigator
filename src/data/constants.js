// Last updated date - Update this when content changes (ISO date; the
// footer formats it per language so the Spanish page never shows an
// English-formatted date like "July 1, 2026")
export const LAST_UPDATED_ISO = "2026-07-01";

// Date the full set of assistance-program links was last checked for accuracy.
// Maintained by scripts/check-links.js, it rewrites these lines after a clean run.
export const LINKS_LAST_VERIFIED = "2026-07-03";
export const LINKS_LAST_VERIFIED_DISPLAY = "July 2026";

// 100% Federal Poverty Level, annual income, by household size (HHS
// guidelines). One source for both the income-eligibility table on the
// results page and the PAP card's income line, which quotes a multiple of
// these — "400% FPL" means nothing to a patient without the dollar figure
// beside it, and two hardcoded copies would drift the year these change.
export const FPL_ANNUAL = { 1: 15960, 2: 21640, 3: 27320, 4: 33000 };

// Income ceiling most manufacturer PAPs use, as a multiple of FPL.
export const PAP_FPL_MULTIPLE = 4;

// "$63,840" — formatted for display at a given multiple and household size.
export const fplDollars = (householdSize = 1, multiple = 1) =>
    '$' + Math.round((FPL_ANNUAL[householdSize] || FPL_ANNUAL[1]) * multiple).toLocaleString('en-US');

// User roles
export const Role = {
    PATIENT: 'Patient',
    CAREPARTNER: 'Carepartner / Family',
    SOCIAL_WORKER: 'Social Worker / Coordinator',
};

// Transplant status
export const TransplantStatus = {
    PRE_EVAL: 'Pre-transplant (Evaluation/Waitlist)',
    POST_ACUTE: 'Post-transplant (Within 1st year)',
    POST_STABLE: 'Post-transplant (1+ years)',
};

// Organ types
export const OrganType = {
    KIDNEY: 'Kidney',
    LIVER: 'Liver',
    HEART: 'Heart',
    LUNG: 'Lung',
    PANCREAS: 'Pancreas',
    MULTI: 'Multi-organ',
    OTHER: 'Other',
};

// Insurance types
export const InsuranceType = {
    COMMERCIAL: 'Commercial / Employer',
    MARKETPLACE: 'Marketplace / Self-purchased',
    MEDICARE: 'Medicare',
    MEDICAID: 'Medicaid (State)',
    TRICARE_VA: 'TRICARE / VA',
    IHS: 'Indian Health Service / Tribal',
    UNINSURED: 'Uninsured / Self-pay',
    OTHER: 'Other / Not Sure',
};

// Financial status
export const FinancialStatus = {
    MANAGEABLE: 'Manageable',
    CHALLENGING: 'Challenging',
    UNAFFORDABLE: 'Unaffordable',
    CRISIS: 'Crisis',
};

// Transplant stage
export const TransplantStage = {
    PRE: 'Pre-transplant',
    POST: 'Post-transplant',
    BOTH: 'Both (Pre & Post)',
};
