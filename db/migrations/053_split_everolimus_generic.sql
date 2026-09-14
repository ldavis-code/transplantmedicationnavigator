-- Split everolimus into generic and brand records
--
-- The record with id 'everolimus' WAS Zortress: brand name, Novartis, the
-- Novartis PAP and the Zortress copay card, Specialty tier. Generic everolimus
-- tablets (the Zortress strengths) have been on the US market for years, and
-- everything downstream already treated the id as the generic — the TrumpRx
-- price keyed to it is the generic price ("Generic tablets (Zortress)"), and
-- Epic import maps generic "everolimus" to it. So a patient searching for the
-- everolimus on their bottle found only Zortress, a Specialty tier, and a
-- brand copay card that no generic qualifies for — and there was no generic
-- everolimus record to find at all.
--
-- This makes the id mean what the rest of the site assumes it means, and adds
-- a separate 'zortress' record for the brand, mirroring the tacrolimus
-- (generic) / Prograf and mycophenolate (generic) / CellCept pairs:
--
--   everolimus -> "Everolimus (generic)", manufacturer Generic, no PAP or
--                 copay program (generics have none), medium cost, tier 2
--                 (a newer generic, still pricier than tacrolimus or
--                 mycophenolate)
--   zortress   -> "Zortress", Novartis, novartis-pap / zortress-copay,
--                 high cost, Specialty tier (the old record's program links,
--                 unchanged)
--
-- Afinitor (everolimus at oncology strengths) is a different product and is
-- not in the catalogue.
--
-- Must be applied alongside the matching src/data/medications.json change:
-- MedicationsContext merges DB over JSON, so the DB row left as Zortress
-- would keep overriding the corrected JSON.
--
-- The live table carries a check constraint (medications_organs_chk, added in
-- Neon rather than by a migration here) that only accepts lowercase organ
-- names, and every row stores stage as 'post' / 'pre' / 'both' / 'peri'. The
-- INSERT uses those forms; the title-case values 047 used no longer pass.
--
-- Idempotent: the UPDATE keys on the stale brand_name so a re-run is a no-op,
-- and the INSERT is ON CONFLICT DO NOTHING.

UPDATE medications
   SET brand_name = 'Everolimus (generic)',
       manufacturer = 'Generic',
       pap_url = NULL,
       pap_program_id = NULL,
       copay_url = NULL,
       copay_program_id = NULL,
       cost_tier = 'medium',
       typical_copay_tier = '2'
 WHERE id = 'everolimus'
   AND brand_name = 'Zortress';

INSERT INTO medications
    (id, brand_name, generic_name, rxcui, category, manufacturer, stage,
     common_organs, pap_url, pap_program_id, copay_url, copay_program_id,
     cost_tier, generic_available, typical_copay_tier)
VALUES
    ('zortress', 'Zortress', 'Everolimus', NULL,
     'Immunosuppressant', 'Novartis', 'post',
     ARRAY['heart','intestine','kidney','liver','lung','pancreas'],
     'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', 'novartis-pap',
     'https://www.zortress.com/transplant/savings-and-support', 'zortress-copay',
     'high', TRUE, 'Specialty')
ON CONFLICT (id) DO NOTHING;
