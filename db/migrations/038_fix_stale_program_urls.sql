-- Fix stale assistance-program URLs in the live medications table
--
-- Audit 2026-07-03: production (Neon) served 14 medication rows with URLs
-- that were fixed in src/data/medications.json on 2026-07-02 but never
-- synced to the database. 10 of the 11 unique stale URLs are dead
-- (404 / 503 / domain no longer resolves). A patient reported the Eliquis
-- patient-assistance link failing with a browser privacy warning; the row
-- still pointed at the decommissioned bmsaccesssupport.bmscustomerconnect.com.
--
-- Updates are keyed BY MEDICATION ID (not by matching the old URL, as
-- migration 017 did) so this cannot be silently skipped if a row drifted
-- to some other value.
--
-- IMPORTANT: Run this in the Neon SQL Editor to apply the fix.

-- ============================================
-- MEDICATIONS TABLE: PAP URLs
-- ============================================

-- BMS Patient Assistance Foundation (bmsaccesssupport domain is dead, 503/TLS failure)
UPDATE medications SET pap_url = 'https://www.bmspaf.org/' WHERE id = 'apixaban';     -- Eliquis
UPDATE medications SET pap_url = 'https://www.bmspaf.org/' WHERE id = 'baraclude';    -- Baraclude
UPDATE medications SET pap_url = 'https://www.bmspaf.org/' WHERE id = 'belatacept';   -- Nulojix

-- Daiichi Sankyo access site returns 503; Injectafer support page is live
UPDATE medications SET pap_url = 'https://www.injectafer.com/ida/support-and-savings' WHERE id = 'injectafer';

-- feraheme.com/support returns 404
UPDATE medications SET pap_url = 'https://feraheme.com/download-resources/' WHERE id = 'feraheme';

-- venofer.com/venaccess returns 404; VenAccess renamed to ARAssist
UPDATE medications SET pap_url = 'https://www.venofer.com/arassist' WHERE id = 'venofer';

-- alexion.com/our-patients returns 404
UPDATE medications SET pap_url = 'https://alexion.com/patient-support-services' WHERE id = 'soliris';
UPDATE medications SET pap_url = 'https://alexion.com/patient-support-services' WHERE id = 'ultomiris';

-- grifolspatientcare.com no longer resolves (DNS failure)
UPDATE medications SET pap_url = 'https://www.hepagamb.com/' WHERE id = 'hbig';

-- tevausa.com/patient-resources returns 404
UPDATE medications SET pap_url = 'https://www.qvar.com/redihaler/teva-patient-assistance-program' WHERE id = 'beclomethasone';

-- bauschhealth.com/patient-resources returns 404; PAP has a dedicated site
UPDATE medications SET pap_url = 'https://www.bauschhealthpap.com/' WHERE id = 'rifaximin';
UPDATE medications SET pap_url = 'https://www.bauschhealthpap.com/' WHERE id = 'xifaxan';

-- ============================================
-- MEDICATIONS TABLE: COPAY URLs
-- ============================================

-- novolog.com/savings-card returns 404
UPDATE medications SET copay_url = 'https://www.novolog.com/savings.html' WHERE id = 'insulin-aspart';

-- advair.com/savings-and-support returns 404; GSK moved savings to gskforyou.com
UPDATE medications SET copay_url = 'https://gskforyou.com/programs/gsk-coupons-free-trials/' WHERE id = 'fluticasone-salmeterol';

-- esbriet.com/financial-support.html returns 404. This row carries a
-- generated UUID id in production (not the 'esbriet' slug), so key by brand.
UPDATE medications SET copay_url = 'https://www.esbrietcopay.com/' WHERE brand_name = 'Esbriet';

-- ============================================
-- PROGRAMS TABLE: same stale URLs wherever they appear
-- ============================================

UPDATE programs SET official_url = 'https://www.bmspaf.org/'
WHERE official_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/';

UPDATE programs SET official_url = 'https://alexion.com/patient-support-services'
WHERE official_url = 'https://alexion.com/our-patients';

UPDATE programs SET official_url = 'https://www.bauschhealthpap.com/'
WHERE official_url = 'https://www.bauschhealth.com/patient-resources/';

-- ============================================
-- SAVINGS_PROGRAMS TABLE: same stale URLs wherever they appear
-- ============================================

UPDATE savings_programs SET application_url = 'https://www.bmspaf.org/'
WHERE application_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/';

UPDATE savings_programs SET application_url = 'https://alexion.com/patient-support-services'
WHERE application_url = 'https://alexion.com/our-patients';

UPDATE savings_programs SET application_url = 'https://www.bauschhealthpap.com/'
WHERE application_url = 'https://www.bauschhealth.com/patient-resources/';

-- ============================================
-- VERIFY (run after the updates; expect the fixed URLs)
-- ============================================
-- SELECT id, brand_name, pap_url, copay_url FROM medications
-- WHERE id IN ('apixaban','baraclude','belatacept','injectafer','feraheme',
--              'venofer','soliris','ultomiris','hbig','beclomethasone',
--              'rifaximin','xifaxan','insulin-aspart','fluticasone-salmeterol')
-- ORDER BY id;
-- SELECT program_id, official_url FROM programs WHERE program_id LIKE 'bms%';
