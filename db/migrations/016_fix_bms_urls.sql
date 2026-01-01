-- Fix Broken BMS URLs Migration
-- Verified January 1, 2026
-- Updates BMS program URLs to current working URLs

-- ============================================
-- PROGRAMS TABLE UPDATES
-- ============================================

-- Fix Nulojix copay URL
UPDATE programs
SET official_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/'
WHERE program_id = 'nulojix-copay';

-- Fix BMS PAP URL
UPDATE programs
SET official_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/'
WHERE program_id = 'bms-pap';

-- ============================================
-- MEDICATIONS TABLE UPDATES
-- ============================================

-- Fix BMS copay URLs
UPDATE medications
SET copay_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/'
WHERE copay_url = 'https://www.bmsaccesssupport.com/patient';

-- Fix BMS PAP URLs (old bmspaf.org domain)
UPDATE medications
SET pap_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/'
WHERE pap_url = 'https://www.bmspaf.org/';

-- ============================================
-- SAVINGS_PROGRAMS TABLE UPDATES
-- ============================================

-- Fix BMS application URLs
UPDATE savings_programs
SET application_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/'
WHERE application_url LIKE '%bmsaccesssupport.com/patient%';

UPDATE savings_programs
SET application_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/'
WHERE application_url LIKE '%bmspaf.org%';

-- ============================================
-- FIX ADDITIONAL BROKEN URLS
-- ============================================

-- Fix Alexion PAP URL (old: alexion.com/our-patients)
UPDATE programs
SET official_url = 'https://alexion.com/patient-support-services'
WHERE program_id = 'alexion-pap';

UPDATE medications
SET pap_url = 'https://alexion.com/patient-support-services'
WHERE pap_url = 'https://alexion.com/our-patients';

-- Fix Feraheme PAP URL (old: feraheme.com/support)
UPDATE programs
SET official_url = 'https://feraheme.com/patient-support/'
WHERE program_id = 'amag-feraheme-pap';

UPDATE medications
SET pap_url = 'https://feraheme.com/patient-support/'
WHERE pap_url = 'https://www.feraheme.com/support';

-- Fix Venofer PAP URL (old: venofer.com/venaccess -> now AR Assist)
UPDATE programs
SET official_url = 'https://www.venofer.com/arassist'
WHERE program_id = 'american-regent-venofer-pap';

UPDATE medications
SET pap_url = 'https://www.venofer.com/arassist'
WHERE pap_url = 'https://www.venofer.com/venaccess';

-- ============================================
-- VERIFICATION COMMENT
-- ============================================
-- All broken URLs updated:
--   - bmsaccesssupport.com/patient -> bmsaccesssupport.bmscustomerconnect.com
--   - bmspaf.org -> bmsaccesssupport.bmscustomerconnect.com
--   - alexion.com/our-patients -> alexion.com/patient-support-services
--   - feraheme.com/support -> feraheme.com/patient-support/
--   - venofer.com/venaccess -> venofer.com/arassist
-- Verified January 1, 2026
