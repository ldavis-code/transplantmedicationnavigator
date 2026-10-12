-- Migration 058: medication cleanup approved by Lorrinda on 2026-10-12
--
--   1. Campath: merge the duplicate UUID row into `campath` and rename it
--      "Campath" (Lemtrada is the MS brand, a different product). Keeps the
--      all-organ list and the Sanofi programs already on `campath`.
--   2. Sevelamer: becomes the generic page — "Sevelamer (generic)", no
--      manufacturer programs. `renvela` stays the brand page.
--   3. Ofev, Esbriet, Ventavis: in Neon these exist ONLY under UUID ids,
--      while the site uses `ofev`, `esbriet`, `ventavis`. Each row is
--      re-keyed to the readable id (copied, references moved, UUID copy
--      removed). No medication is lost.
--
-- One transaction: if any statement fails, nothing changes. Safe to read
-- before running; run once in the Neon SQL Editor (paste the whole file).

BEGIN;

-- Move every reference from one medication id to another, in the tables
-- that store medication ids (skipping any table this database doesn't have).
CREATE OR REPLACE FUNCTION pg_temp.move_med_refs(old_id TEXT, new_id TEXT) RETURNS void AS $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['savings_programs', 'org_medication_configs', 'user_savings', 'price_reports'] LOOP
        IF to_regclass(t) IS NOT NULL THEN
            EXECUTE format('UPDATE %I SET medication_id = $1 WHERE medication_id = $2', t) USING new_id, old_id;
        END IF;
    END LOOP;
END $$ LANGUAGE plpgsql;

-- Copy a medication row to a new id (all columns, whatever they are).
CREATE OR REPLACE FUNCTION pg_temp.rekey_med(old_id TEXT, new_id TEXT) RETURNS void AS $$
BEGIN
    INSERT INTO medications
    SELECT (jsonb_populate_record(NULL::medications, to_jsonb(m) || jsonb_build_object('id', new_id))).*
    FROM medications m WHERE m.id = old_id;
    PERFORM pg_temp.move_med_refs(old_id, new_id);
    DELETE FROM medications WHERE id = old_id;
END $$ LANGUAGE plpgsql;

-- 1. Campath
UPDATE medications SET brand_name = 'Campath', updated_at = NOW() WHERE id = 'campath';
SELECT pg_temp.move_med_refs('3e7d60c8-9882-4077-9fb5-848abaaf47fe', 'campath');
DELETE FROM medications WHERE id = '3e7d60c8-9882-4077-9fb5-848abaaf47fe';

-- 2. Sevelamer -> generic page
UPDATE medications
SET brand_name = 'Sevelamer (generic)', manufacturer = 'Generic',
    pap_url = NULL, pap_program_id = NULL, copay_url = NULL, copay_program_id = NULL,
    updated_at = NOW()
WHERE id = 'sevelamer';

-- 3. Re-key Ofev, Esbriet, Ventavis to the ids the site uses
SELECT pg_temp.rekey_med('41be035c-9a26-4f74-b28a-24080bd9c1e5', 'ofev');
SELECT pg_temp.rekey_med('42f1cad0-db0d-47fe-bea2-c5faa89fe016', 'esbriet');
SELECT pg_temp.rekey_med('a9c229b4-4d45-4aae-b914-b32ff51354d0', 'ventavis');

COMMIT;

-- Check: should list campath (Campath), sevelamer (Sevelamer (generic)),
-- ofev, esbriet, ventavis — and no UUID ids. Total medications: 259.
SELECT id, brand_name FROM medications
WHERE id IN ('campath', 'sevelamer', 'renvela', 'ofev', 'esbriet', 'ventavis')
   OR id IN ('3e7d60c8-9882-4077-9fb5-848abaaf47fe', '41be035c-9a26-4f74-b28a-24080bd9c1e5',
             '42f1cad0-db0d-47fe-bea2-c5faa89fe016', 'a9c229b4-4d45-4aae-b914-b32ff51354d0')
ORDER BY id;
SELECT COUNT(*) AS total_medications FROM medications;
