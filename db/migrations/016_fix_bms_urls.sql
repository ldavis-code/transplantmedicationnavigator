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
-- VERIFICATION COMMENT
-- ============================================
-- All BMS URLs updated to bmsaccesssupport.bmscustomerconnect.com
-- Previous domains were returning 404 errors:
--   - bmsaccesssupport.com/patient (broken)
--   - bmspaf.org (broken)
-- Verified January 1, 2026
