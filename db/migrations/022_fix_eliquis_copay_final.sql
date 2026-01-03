-- Fix Eliquis Copay URL - FINAL
-- The correct Eliquis savings/copay card URL is /savings, not root or /afib path
-- Verified January 3, 2026
--
-- IMPORTANT: Run this in Neon SQL Editor to apply the fix

-- ============================================
-- MEDICATIONS TABLE
-- ============================================
UPDATE medications
SET copay_url = 'https://www.eliquis.bmscustomerconnect.com/savings'
WHERE id = 'apixaban';

-- ============================================
-- PROGRAMS TABLE
-- ============================================
UPDATE programs
SET official_url = 'https://www.eliquis.bmscustomerconnect.com/savings'
WHERE program_id = 'eliquis-copay';

-- ============================================
-- SAVINGS_PROGRAMS TABLE
-- ============================================
UPDATE savings_programs
SET application_url = 'https://www.eliquis.bmscustomerconnect.com/savings'
WHERE program_name = 'Eliquis Savings Card' AND program_type = 'copay_card';

-- ============================================
-- VERIFY (run these after the updates)
-- ============================================
-- SELECT id, brand_name, copay_url FROM medications WHERE id = 'apixaban';
-- Expected: apixaban | Eliquis | https://www.eliquis.bmscustomerconnect.com/savings
