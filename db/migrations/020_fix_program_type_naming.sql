-- Migration 020: Fix inconsistent program_type naming
-- Standardizes all program_type values to lowercase with underscores
-- This ensures the quiz correctly finds and displays all programs

-- Fix "Copay Card" -> "copay_card"
UPDATE savings_programs
SET program_type = 'copay_card'
WHERE program_type = 'Copay Card';

-- Fix "Patient Assistance" -> "pap"
UPDATE savings_programs
SET program_type = 'pap'
WHERE program_type = 'Patient Assistance';

-- Fix "Discount Card" -> "discount_card"
UPDATE savings_programs
SET program_type = 'discount_card'
WHERE program_type = 'Discount Card';

-- Fix "Bridge Program" -> "pap" (bridge programs are essentially PAPs)
UPDATE savings_programs
SET program_type = 'pap'
WHERE program_type = 'Bridge Program';

-- Verify the fix
SELECT program_type, COUNT(*) as count
FROM savings_programs
GROUP BY program_type
ORDER BY program_type;
