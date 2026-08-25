-- Split mycophenolate into generic and brand records
--
-- The record with id 'mycophenolate' WAS CellCept: brand name, Genentech,
-- brand PAP and copay program. But everything downstream already treated the
-- id as the generic — the homepage chip labels it "generic", Epic import maps
-- generic "mycophenolate mofetil" to it, and its price estimates are generic
-- prices ("Generic CellCept - as low as $17"). So a patient who tapped the
-- "Mycophenolate generic" chip got CellCept, Tier 2, and Genentech's brand
-- PAP — the exact brand-vs-generic confusion the homepage explainer teaches
-- patients to avoid, in both languages.
--
-- This makes the id mean what the rest of the site assumes it means, and adds
-- a separate 'cellcept' record for the brand, mirroring the existing
-- tacrolimus (generic) / Prograf pair:
--
--   mycophenolate -> "Mycophenolate Mofetil (generic)", manufacturer Generic,
--                    no PAP or copay program (generics have none), tier 1
--   cellcept      -> "CellCept", Genentech, genentech-pap / genentech-copay,
--                    tier 2 (the old record's program links, unchanged)
--
-- Myfortic (mycophenolic acid, a different product) is untouched.
--
-- Must be applied alongside the matching src/data/medications.json change:
-- MedicationsContext merges DB over JSON, so the DB row left as CellCept
-- would keep overriding the corrected JSON.
--
-- Idempotent: the UPDATE keys on the stale brand_name so a re-run is a no-op,
-- and the INSERT is ON CONFLICT DO NOTHING.

UPDATE medications
   SET brand_name = 'Mycophenolate Mofetil (generic)',
       manufacturer = 'Generic',
       pap_url = NULL,
       pap_program_id = NULL,
       copay_url = NULL,
       copay_program_id = NULL,
       cost_tier = 'low',
       typical_copay_tier = '1'
 WHERE id = 'mycophenolate'
   AND brand_name = 'CellCept';

INSERT INTO medications
    (id, brand_name, generic_name, rxcui, category, manufacturer, stage,
     common_organs, pap_url, pap_program_id, copay_url, copay_program_id,
     cost_tier, generic_available, typical_copay_tier)
VALUES
    ('cellcept', 'CellCept', 'Mycophenolate Mofetil', NULL,
     'Immunosuppressant', 'Genentech', 'Post-transplant',
     ARRAY['Kidney','Liver','Heart','Lung','Pancreas'],
     'https://www.genentech-access.com/patient.html', 'genentech-pap',
     'https://www.genentech-access.com/patient.html', 'genentech-copay',
     'medium', TRUE, '2')
ON CONFLICT (id) DO NOTHING;
