-- ============================================================================
-- medications-split-immunosuppressants.sql
-- Splits the remaining combined immunosuppressant records into a GENERIC record
-- (cash options like Cost Plus Drugs, no manufacturer copay card) and separate
-- BRAND record(s) that carry the manufacturer copay program — the same pattern
-- already applied to tacrolimus (generic) vs Prograf / Astagraf XL / Envarsus XR.
--
-- Uses ONLY copay/PAP links already present in your table (no invented data).
-- Brand records get generic_available = false (so Cost Plus is not offered for
-- the brand) and no rxcui (so RxNorm import matching maps to the generic).
--
-- Run in the Neon SQL editor, then regenerate the bundled JSON:
--   export DATABASE_URL='postgresql://...sslmode=require'
--   npm run sync:medications
-- (COMMIT can be switched to ROLLBACK to test first.)
-- ============================================================================
BEGIN;

-- ---------------------------------------------------------------- CYCLOSPORINE
-- Existing 'cyclosporine' row becomes the generic; add Neoral / Sandimmune /
-- Gengraf as brands. Neoral & Sandimmune are Novartis (existing copay); Gengraf
-- is AbbVie (no copay link on file -> left null; foundations still apply).
UPDATE medications SET
    brand_name = 'Cyclosporine (generic)',
    manufacturer = 'Generic',
    generic_available = true,
    copay_url = NULL,
    copay_program_id = NULL
WHERE id = 'cyclosporine';

INSERT INTO medications
    (id, brand_name, generic_name, rxcui, category, manufacturer, stage,
     common_organs, generic_available, cost_tier, typical_copay_tier,
     copay_url, copay_program_id, pap_url)
VALUES
    ('neoral', 'Neoral', 'Cyclosporine', NULL, 'Immunosuppressants', 'Novartis', 'post',
     ARRAY['heart','lung','liver','kidney','pancreas','intestine'], false, 'medium', '2',
     'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', 'novartis-copay',
     'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance'),
    ('sandimmune', 'Sandimmune', 'Cyclosporine', NULL, 'Immunosuppressants', 'Novartis', 'post',
     ARRAY['heart','lung','liver','kidney','pancreas','intestine'], false, 'medium', '2',
     'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', 'novartis-copay',
     'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance'),
    ('gengraf', 'Gengraf', 'Cyclosporine', NULL, 'Immunosuppressants', 'AbbVie', 'post',
     ARRAY['heart','lung','liver','kidney','pancreas','intestine'], false, 'medium', '2',
     NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------- MYCOPHENOLATE
UPDATE medications SET
    brand_name = 'Mycophenolate Mofetil (generic)',
    manufacturer = 'Generic',
    generic_available = true,
    copay_url = NULL,
    copay_program_id = NULL
WHERE id = 'mycophenolate';

INSERT INTO medications
    (id, brand_name, generic_name, rxcui, category, manufacturer, stage,
     common_organs, generic_available, cost_tier, typical_copay_tier,
     copay_url, copay_program_id, pap_url)
VALUES
    ('cellcept', 'CellCept', 'Mycophenolate Mofetil', NULL, 'Immunosuppressants', 'Genentech', 'post',
     ARRAY['heart','lung','liver','kidney','pancreas','intestine'], false, 'medium', '2',
     'https://www.genentech-access.com/patient.html', 'genentech-copay',
     'https://www.genentech-access.com/patient.html')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------- SIROLIMUS
UPDATE medications SET
    brand_name = 'Sirolimus (generic)',
    manufacturer = 'Generic',
    generic_available = true,
    copay_url = NULL,
    copay_program_id = NULL
WHERE id = 'sirolimus';

INSERT INTO medications
    (id, brand_name, generic_name, rxcui, category, manufacturer, stage,
     common_organs, generic_available, cost_tier, typical_copay_tier,
     copay_url, copay_program_id, pap_url)
VALUES
    ('rapamune', 'Rapamune', 'Sirolimus', NULL, 'Immunosuppressants', 'Pfizer', 'post',
     ARRAY['heart','lung','liver','kidney','pancreas','intestine'], false, 'medium', '3',
     'https://www.pfizerrxpathways.com/', 'pfizer-copay', 'https://www.pfizerrxpathways.com/')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------- AZATHIOPRINE / IMURAN
-- Imuran has no manufacturer copay card (it's effectively generic), so just
-- present it under the generic name. No separate brand record needed.
UPDATE medications SET
    brand_name = 'Azathioprine (generic)',
    manufacturer = 'Generic',
    generic_available = true
WHERE id = 'imuran';

COMMIT;

-- VERIFY (should show the generic + brand rows):
-- SELECT id, brand_name, generic_name, generic_available, copay_program_id
-- FROM medications
-- WHERE generic_name IN ('Cyclosporine','Mycophenolate Mofetil','Sirolimus','Azathioprine')
-- ORDER BY generic_name, generic_available DESC;
