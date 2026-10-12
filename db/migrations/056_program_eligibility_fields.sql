-- Migration 056: per-program eligibility fields
--
-- PROPOSED — NOT YET RUN. Do not apply without Lorrinda's approval.
--
-- Eligibility routing must never be inferred from insurance type alone. Each
-- program carries its own flag per pathway; NULL means "unknown" and is shown
-- on the site as "Check eligibility with the program" and listed in
-- reports/medication-data-review.md for verification. There are deliberately
-- NO defaults: a default of false (as on the older savings_programs table)
-- cannot tell "not eligible" apart from "nobody has checked".
--
-- The site reads these values from src/data/programs.json (eligibility block)
-- after `node scripts/sync-program-eligibility.js` copies them out of Neon.
-- Rule enforced in code: src/utils/programEligibility.js.

ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS accepts_commercial        BOOLEAN,  -- NULL = unknown
    ADD COLUMN IF NOT EXISTS accepts_medicare          BOOLEAN,
    ADD COLUMN IF NOT EXISTS accepts_medicaid          BOOLEAN,
    ADD COLUMN IF NOT EXISTS accepts_uninsured         BOOLEAN,
    ADD COLUMN IF NOT EXISTS excludes_extra_help       BOOLEAN,  -- true = not for Medicare Extra Help (LIS) enrollees
    ADD COLUMN IF NOT EXISTS requires_medicaid_denial  BOOLEAN,  -- true = applicant needs a Medicaid denial letter
    ADD COLUMN IF NOT EXISTS eligibility_verified_date DATE,
    ADD COLUMN IF NOT EXISTS eligibility_source_url    TEXT;

-- Copay cards are commercial-only, always. Federal law bars manufacturer
-- copay cards for Medicare and other government insurance.
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_copay_commercial_only;
ALTER TABLE programs ADD CONSTRAINT programs_copay_commercial_only CHECK (
    program_type <> 'copay'
    OR (accepts_medicare IS NOT TRUE AND accepts_medicaid IS NOT TRUE AND accepts_uninsured IS NOT TRUE)
);

-- A verified date must say where it was verified.
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_verified_needs_source;
ALTER TABLE programs ADD CONSTRAINT programs_verified_needs_source CHECK (
    eligibility_verified_date IS NULL OR eligibility_source_url IS NOT NULL
);
