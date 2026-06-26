-- ============================================================================
-- medications-cleanup.sql
-- Run in the Neon SQL editor. Cleans up the `medications` table:
--   1. Removes duplicate rows (same brand + generic inserted more than once).
--   2. Backfills common_organs / stage / cost_tier / PAP on records that are
--      missing them (the quiz filters meds by common_organs, so empty arrays
--      make a med invisible in the organ-specific suggestions).
--
-- IMPORTANT: Run the PREVIEW queries first and eyeball the results. Then run
-- the cleanup inside the transaction. Change COMMIT to ROLLBACK to test safely.
-- After cleanup, regenerate the JSON: node scripts/sync-medications-json.js
-- ============================================================================


-- ----------------------------------------------------------------------------
-- PREVIEW 1: exact duplicates (same brand_name + generic_name, multiple ids)
-- These are the ones the dedupe step below will collapse to a single row.
-- ----------------------------------------------------------------------------
SELECT brand_name, generic_name, COUNT(*) AS copies, array_agg(id ORDER BY id) AS ids
FROM medications
GROUP BY brand_name, generic_name
HAVING COUNT(*) > 1
ORDER BY brand_name;

-- ----------------------------------------------------------------------------
-- PREVIEW 2: cross-brand duplicates (same generic, DIFFERENT brand strings).
-- The dedupe step does NOT touch these because the brand text differs
-- (e.g. 'Campath / Lemtrada' vs 'Campath', or the legit Astagraf XL vs
-- Envarsus XR which share generic 'Tacrolimus Extended-Release'). REVIEW these
-- by hand: keep the legit separate products, manually delete true duplicates.
-- ----------------------------------------------------------------------------
SELECT generic_name, COUNT(*) AS rows, array_agg(brand_name || ' [' || id || ']' ORDER BY id) AS variants
FROM medications
GROUP BY generic_name
HAVING COUNT(*) > 1
ORDER BY generic_name;


-- ============================================================================
-- CLEANUP TRANSACTION — review previews above before running.
-- ============================================================================
BEGIN;

-- 1) DEDUPE exact duplicates. Keep one row per (brand_name, generic_name),
--    preferring a human-readable slug id over a generated UUID, then the
--    oldest row. Delete the rest.
WITH ranked AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY lower(brand_name), lower(generic_name)
            ORDER BY
                (id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-')::int ASC,  -- slug ids (0) before UUIDs (1)
                created_at ASC NULLS LAST,
                id ASC
        ) AS rn
    FROM medications
)
DELETE FROM medications m
USING ranked r
WHERE m.id = r.id
  AND r.rn > 1;

-- 2) BACKFILL the tacrolimus records (organs, stage, PAP, and rxcui for the
--    generic-available IR product). COALESCE preserves any value already set.
UPDATE medications SET
    common_organs  = ARRAY['Kidney','Liver','Heart','Lung','Pancreas'],
    stage          = COALESCE(stage, 'Post-transplant'),
    cost_tier      = COALESCE(cost_tier, 'medium'),
    rxcui          = COALESCE(rxcui, '42316'),
    pap_url        = COALESCE(pap_url, 'https://www.astellaspharmasupportsolutions.com/'),
    pap_program_id = COALESCE(pap_program_id, 'astellas-pap')
WHERE id = 'prograf';

UPDATE medications SET
    common_organs  = ARRAY['Kidney','Liver','Heart','Lung','Pancreas'],
    stage          = COALESCE(stage, 'Post-transplant'),
    cost_tier      = COALESCE(cost_tier, 'medium'),
    pap_url        = COALESCE(pap_url, 'https://www.astellaspharmasupportsolutions.com/'),
    pap_program_id = COALESCE(pap_program_id, 'astellas-pap')
WHERE id = 'astagraf-xl';

UPDATE medications SET
    common_organs  = ARRAY['Kidney','Liver'],
    stage          = COALESCE(stage, 'Post-transplant'),
    cost_tier      = COALESCE(cost_tier, 'medium'),
    pap_url        = COALESCE(pap_url, 'https://www.envarsusxr.com/savings-support')
WHERE id = 'envarsus-xr';

-- 3) BACKFILL common_organs on the other newly-added meds that came in with an
--    empty array. Keyed by generic_name so it hits whichever row survived the
--    dedupe. Only fills when currently empty/null (won't overwrite real data).
UPDATE medications SET common_organs = ARRAY['Kidney','Heart','Pancreas']
WHERE lower(generic_name) = 'tirzepatide' AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Liver']
WHERE lower(generic_name) = 'midodrine'   AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Liver']
WHERE lower(generic_name) = 'rifaximin'   AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Lung']
WHERE lower(generic_name) = 'pirfenidone' AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Lung']
WHERE lower(generic_name) = 'nintedanib'  AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Lung','Heart']
WHERE lower(generic_name) = 'iloprost'    AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Lung','Heart']
WHERE lower(generic_name) = 'macitentan'  AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Lung','Heart']
WHERE lower(generic_name) = 'selexipag'   AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Kidney','Liver']
WHERE lower(generic_name) = 'basiliximab' AND (common_organs IS NULL OR common_organs = '{}');

UPDATE medications SET common_organs = ARRAY['Kidney','Liver','Heart']
WHERE lower(generic_name) = 'alemtuzumab' AND (common_organs IS NULL OR common_organs = '{}');

-- Change to ROLLBACK to test without saving.
COMMIT;


-- ----------------------------------------------------------------------------
-- VERIFY after committing: should return no rows.
-- ----------------------------------------------------------------------------
-- SELECT brand_name, generic_name, COUNT(*) FROM medications
-- GROUP BY brand_name, generic_name HAVING COUNT(*) > 1;
--
-- SELECT id, brand_name, common_organs FROM medications
-- WHERE common_organs IS NULL OR common_organs = '{}';
