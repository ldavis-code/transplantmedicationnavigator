-- Fix Eliquis URLs Migration
-- Correcting the copay and support URLs based on actual BMS program structure:
--   - eliquis.bmscustomerconnect.com → Eliquis Copay Card enrollment
--   - bmscopay.com → BMS Patient Support Services portal
-- Created January 3, 2026

-- ============================================
-- MEDICATIONS TABLE UPDATES
-- ============================================

-- Fix Eliquis (apixaban) URLs
UPDATE medications
SET
    copay_url = 'https://www.eliquis.bmscustomerconnect.com/',
    support_url = 'https://www.bmscopay.com/'
WHERE id = 'apixaban';

-- ============================================
-- PROGRAMS TABLE UPDATES
-- ============================================

-- Fix Eliquis copay program URL
UPDATE programs
SET official_url = 'https://www.eliquis.bmscustomerconnect.com/'
WHERE program_id = 'eliquis-copay';

-- ============================================
-- SAVINGS_PROGRAMS TABLE UPDATES
-- ============================================

-- Fix Eliquis Savings Card application URL
UPDATE savings_programs
SET application_url = 'https://www.eliquis.bmscustomerconnect.com/'
WHERE program_name = 'Eliquis Savings Card' AND program_type = 'copay_card';

-- ============================================
-- VERIFICATION QUERIES (run these to confirm)
-- ============================================
-- SELECT id, brand_name, copay_url, support_url FROM medications WHERE id = 'apixaban';
-- SELECT program_id, official_url FROM programs WHERE program_id = 'eliquis-copay';
-- SELECT program_name, application_url FROM savings_programs WHERE program_name = 'Eliquis Savings Card';
