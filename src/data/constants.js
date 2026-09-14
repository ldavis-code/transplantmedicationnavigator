// THE date the site's content was last verified — the single source for
// every "verified / last updated / reviewed" stamp a visitor can see: the
// homepage banner, the footer, the grants card, the price-estimate notes,
// the "Link verified" stamps on program cards, the TrumpRx guide (both
// languages), llms.txt, and the JSON-LD lastReviewed in index.html.
// The app reads it directly; scripts/generate-home-stats.js copies it into
// the static pages at build time (the data-stat markers there), and
// scripts/check-links.js rewrites it after a clean link check. Five
// surfaces once showed five different dates at the same time — never add
// a second date constant, and never stamp a deploy date here: a deploy is
// not a content review.
export const CONTENT_VERIFIED_ISO = "2026-08-24";

// "September 2026" / "septiembre de 2026" (month, the default) or
// "September 8, 2026" / "8 de septiembre de 2026" (full). Pure — no i18n
// import — so the build scripts format with the same code as the app.
export const formatVerifiedDate = (iso, lang = 'en', style = 'month') =>
    new Date(iso + 'T00:00:00').toLocaleDateString(
        String(lang || 'en').startsWith('es') ? 'es' : 'en-US',
        style === 'full'
            ? { year: 'numeric', month: 'long', day: 'numeric' }
            : { month: 'long', year: 'numeric' }
    );

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
