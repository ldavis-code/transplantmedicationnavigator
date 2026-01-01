-- Fix Eliquis Copay URL Migration
-- The /afib/eliquis-free-trial-and-savings path returns 404
-- Using the official BMS Copay portal instead
-- Verified January 1, 2026

-- ============================================
-- PROGRAMS TABLE UPDATES
-- ============================================

-- Fix Eliquis copay URL in programs table
UPDATE programs
SET official_url = 'https://www.bmscopay.com/'
WHERE program_id = 'eliquis-copay';

-- Fix BMS general copay URL
UPDATE programs
SET official_url = 'https://www.bmscopay.com/'
WHERE program_id = 'bms-copay';

-- ============================================
-- MEDICATIONS TABLE UPDATES
-- ============================================

-- Fix Eliquis (apixaban) copay URL
UPDATE medications
SET copay_url = 'https://www.bmscopay.com/'
WHERE id = 'apixaban';

-- ============================================
-- SAVINGS_PROGRAMS TABLE UPDATES
-- ============================================

-- Fix Eliquis Savings Card URL
UPDATE savings_programs
SET application_url = 'https://www.bmscopay.com/'
WHERE program_name = 'Eliquis Savings Card' AND program_type = 'copay_card';

-- Fix any BMS copay cards that used the broken bmscustomerconnect URL
UPDATE savings_programs
SET application_url = 'https://www.bmscopay.com/'
WHERE application_url LIKE '%eliquis.bmscustomerconnect.com%';

-- ============================================
-- VERIFICATION COMMENT
-- ============================================
-- Fixed broken URL:
--   - eliquis.bmscustomerconnect.com/afib/eliquis-free-trial-and-savings (404) -> bmscopay.com (working)
-- The bmscopay.com portal is the official BMS copay card enrollment site
-- Phone: 1-855-ELIQUIS (1-855-354-7847)
-- Verified January 1, 2026
