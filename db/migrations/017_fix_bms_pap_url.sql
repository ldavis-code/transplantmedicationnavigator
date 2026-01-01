-- Fix BMS URLs Migration
-- The bmsaccesssupport.bmscustomerconnect.com URL is returning 503 errors
-- PAP: Using official BMSPAF website: bmspaf.org
-- Copay: Using official BMS copay site: bmscopay.com
-- Verified January 1, 2026

-- ============================================
-- PROGRAMS TABLE UPDATES
-- ============================================

-- Fix BMS PAP URL - the bmscustomerconnect URL is broken
UPDATE programs
SET official_url = 'https://www.bmspaf.org/'
WHERE program_id = 'bms-pap';

-- Fix Nulojix copay URL
UPDATE programs
SET official_url = 'https://www.bmscopay.com/'
WHERE program_id = 'nulojix-copay';

-- ============================================
-- MEDICATIONS TABLE UPDATES
-- ============================================

-- Fix BMS PAP URLs in medications table
UPDATE medications
SET pap_url = 'https://www.bmspaf.org/'
WHERE pap_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/';

-- Fix BMS copay URLs in medications table
UPDATE medications
SET copay_url = 'https://www.bmscopay.com/'
WHERE copay_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/';

-- ============================================
-- SAVINGS_PROGRAMS TABLE UPDATES
-- ============================================

-- Fix BMS PAP application URLs
UPDATE savings_programs
SET application_url = 'https://www.bmspaf.org/'
WHERE application_url = 'https://www.bmsaccesssupport.bmscustomerconnect.com/';

-- ============================================
-- VERIFICATION COMMENT
-- ============================================
-- Fixed broken URL:
--   - bmsaccesssupport.bmscustomerconnect.com (503 error) -> bmspaf.org (working)
-- Phone: 1-800-736-0003
-- Fax: 1-800-736-1611
-- Address: P.O. Box 220769, Charlotte, NC 28222-0769
-- Verified January 1, 2026
