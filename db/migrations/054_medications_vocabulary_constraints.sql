-- Codify the medications vocabulary the live table already enforces
--
-- The Neon table carries a check constraint, medications_organs_chk, that no
-- migration in this repo created: it accepts only lowercase organ names
-- (heart, intestine, kidney, liver, lung, pancreas). Every row also stores
-- stage as one of post / pre / both / peri. scripts/sync-medications-json.js
-- translates both back to the site's wording ("Kidney", "Post-transplant")
-- when it regenerates medications.json, so the app never sees the short forms
-- and nothing in the repo said they were required. Migration 053's Zortress
-- INSERT copied 047's title-case organs and was rejected by the constraint
-- the moment it ran in Neon.
--
-- This migration makes the rule visible and enforceable from the repo:
--
--   1. Normalizes any rows still holding the long forms, so a database built
--      from these migrations alone (002 and 047 insert title-case organs and
--      'Post-transplant') satisfies the constraints below. On the live table,
--      where every row is already in the short forms, both UPDATEs match
--      nothing.
--   2. Adds medications_organs_chk when it is missing, so a fresh database has
--      the same guard Neon does. The live constraint is left untouched: the
--      name is checked first, and a constraint that exists is not replaced.
--   3. Adds medications_stage_chk the same way. Neon has no stage constraint
--      today; every row already satisfies this one, and without it a
--      'Post-transplant' insert would succeed and become the one row whose
--      stage the sync script does not recognise.
--
-- Anything that writes to this table from now on uses the short forms; see
-- "Medication vocabulary" in DATABASE_SETUP.md.
--
-- Idempotent: the UPDATEs match only rows that need changing, and each
-- constraint is added only when absent.

UPDATE medications
   SET common_organs = ARRAY(SELECT lower(o) FROM unnest(common_organs) AS o)
 WHERE common_organs IS NOT NULL
   AND EXISTS (SELECT 1 FROM unnest(common_organs) AS o WHERE o <> lower(o));

UPDATE medications
   SET stage = CASE stage
                 WHEN 'Post-transplant'   THEN 'post'
                 WHEN 'Pre-transplant'    THEN 'pre'
                 WHEN 'Both (Pre & Post)' THEN 'both'
                 WHEN 'Peri-transplant'   THEN 'peri'
               END
 WHERE stage IN ('Post-transplant', 'Pre-transplant', 'Both (Pre & Post)', 'Peri-transplant');

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'medications_organs_chk'
           AND conrelid = 'medications'::regclass
    ) THEN
        ALTER TABLE medications
            ADD CONSTRAINT medications_organs_chk
            CHECK (common_organs IS NULL
                   OR common_organs <@ ARRAY['heart','intestine','kidney','liver','lung','pancreas']::text[]);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'medications_stage_chk'
           AND conrelid = 'medications'::regclass
    ) THEN
        ALTER TABLE medications
            ADD CONSTRAINT medications_stage_chk
            CHECK (stage IS NULL OR stage IN ('pre', 'post', 'both', 'peri'));
    END IF;
END $$;
