-- ============================================
-- SYNC COPAY CARDS TO NEON DATABASE
-- ============================================
-- Run this script in the Neon SQL Editor to ensure all copay cards are properly configured
-- This script is idempotent - safe to run multiple times
--
-- Usage: psql $DATABASE_URL -f db/sync_copay_cards_to_neon.sql

-- ============================================
-- STEP 1: Ensure savings_programs table exists
-- ============================================
CREATE TABLE IF NOT EXISTS savings_programs (
    id SERIAL PRIMARY KEY,
    program_name TEXT NOT NULL,
    program_type TEXT NOT NULL CHECK (program_type IN ('copay_card', 'pap', 'foundation', 'discount_card', 'discount_pharmacy')),
    manufacturer TEXT,
    medication_id TEXT,
    commercial_eligible BOOLEAN DEFAULT false,
    medicare_eligible BOOLEAN DEFAULT false,
    medicaid_eligible BOOLEAN DEFAULT false,
    uninsured_eligible BOOLEAN DEFAULT false,
    tricare_va_eligible BOOLEAN DEFAULT false,
    ihs_tribal_eligible BOOLEAN DEFAULT false,
    income_limit TEXT,
    max_benefit TEXT,
    application_url TEXT,
    phone TEXT,
    fund_status_note TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_savings_programs_type ON savings_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_savings_programs_medication ON savings_programs(medication_id);
CREATE INDEX IF NOT EXISTS idx_savings_programs_commercial ON savings_programs(commercial_eligible) WHERE commercial_eligible = true;
CREATE INDEX IF NOT EXISTS idx_savings_programs_active ON savings_programs(is_active) WHERE is_active = true;

-- ============================================
-- STEP 2: Delete existing copay cards to avoid duplicates
-- ============================================
-- This ensures clean data - we'll re-insert everything fresh
DELETE FROM savings_programs WHERE program_type = 'copay_card';

-- ============================================
-- STEP 3: Insert ALL Copay Cards
-- ============================================

-- TRANSPLANT MEDICATIONS

-- Eliquis (Apixaban) - BMS
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Eliquis Savings Card', 'copay_card', 'apixaban', 'Bristol Myers Squibb',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per month',
    'https://www.eliquis.bmscustomerconnect.com/afib/eliquis-free-trial-and-savings',
    '1-855-354-7847',
    'Commercial insurance only. Not valid for Medicare, Medicaid, or government programs.',
    true
);

-- Prograf (Tacrolimus) - Astellas
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Astellas Patient Support - Prograf', 'copay_card', 'tacrolimus', 'Astellas',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.astellaspharmasupportsolutions.com/',
    '1-800-477-6472',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- Zortress (Everolimus) - Novartis
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Zortress Copay Card', 'copay_card', 'everolimus', 'Novartis',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.zortress.com/transplant/savings-and-support',
    '1-888-669-6682',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- Nulojix (Belatacept) - BMS
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Nulojix Co-Pay Assistance', 'copay_card', 'belatacept', 'Bristol Myers Squibb',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per infusion',
    'https://www.bmsaccesssupport.bmscustomerconnect.com/',
    '1-800-721-8909',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- Valcyte (Valganciclovir) - Genentech
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Genentech Access Solutions - Valcyte', 'copay_card', 'valcyte', 'Genentech',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.genentech-access.com/patient.html',
    '1-866-422-2377',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- Envarsus XR (Extended-release Tacrolimus) - Veloxis
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Envarsus XR Savings Program', 'copay_card', 'envarsus-xr', 'Veloxis',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.envarsusxr.com/savings/',
    '1-833-368-2778',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- CARDIOVASCULAR MEDICATIONS

-- Xarelto (Rivaroxaban) - Janssen
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Xarelto Savings Program', 'copay_card', 'rivaroxaban', 'Janssen',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per month',
    'https://www.xarelto-us.com/savings',
    '1-888-927-3586',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- Entresto - Novartis
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Entresto Savings Card', 'copay_card', 'entresto', 'Novartis',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per month',
    'https://www.entresto.com/savings-and-support',
    '1-888-669-6682',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- DIABETES MEDICATIONS

-- Jardiance - Boehringer Ingelheim
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Jardiance Savings Card', 'copay_card', 'jardiance', 'Boehringer Ingelheim',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per month',
    'https://www.jardiance.com/savings/',
    '1-800-325-9881',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- Farxiga - AstraZeneca
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Farxiga Savings Card', 'copay_card', 'farxiga', 'AstraZeneca',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 per month',
    'https://www.farxiga.com/savings-and-support',
    '1-800-236-9933',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- LIVER MEDICATIONS

-- Xifaxan - Bausch
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Xifaxan Savings Program', 'copay_card', 'xifaxan', 'Bausch Health',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://xifaxan.copaysavingsprogram.com/',
    '1-844-943-2926',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- Mavyret - AbbVie (Hepatitis C)
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Mavyret Savings Card', 'copay_card', 'mavyret', 'AbbVie',
    true, false, false, false, false, false, 'none',
    'Pay as little as $5 per month',
    'https://www.mavyret.com/savings',
    '1-800-222-6885',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- HEPATITIS B MEDICATIONS

-- Vemlidy - Gilead
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Vemlidy Co-Pay Coupon', 'copay_card', 'vemlidy', 'Gilead',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.gileadadvancingaccess.com/',
    '1-800-226-2056',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- ANTIFUNGAL MEDICATIONS

-- Cresemba - Astellas
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Cresemba Copay Card', 'copay_card', 'cresemba', 'Astellas',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.astellaspharmasupportsolutions.com/',
    '1-800-477-6472',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- ANTIVIRAL MEDICATIONS

-- Prevymis - Merck
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Prevymis Savings Card', 'copay_card', 'prevymis', 'Merck',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.merckhelps.com/',
    '1-800-727-5400',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- PANCREATIC ENZYME

-- Creon - AbbVie
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Creon Savings Card', 'copay_card', 'creon', 'AbbVie',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.creoninfo.com/savings/',
    '1-800-222-6885',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- KIDNEY MEDICATIONS

-- Auryxia - Akebia
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Auryxia Co-Pay Assistance', 'copay_card', 'auryxia', 'Akebia',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.akebiacares.com/',
    '1-844-445-3799',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- RESPIRATORY MEDICATIONS

-- Dupixent - Sanofi/Regeneron
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Dupixent MyWay Copay Card', 'copay_card', 'dupixent', 'Regeneron / Sanofi',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 per month',
    'https://www.dupixent.com/support-savings/dupixent-my-way',
    '1-844-387-4936',
    'Commercial insurance only. Not valid for government insurance.',
    true
);

-- ============================================
-- STEP 4: Ensure PAP programs exist for non-commercial
-- ============================================

-- Delete and re-insert PAPs for key transplant meds
DELETE FROM savings_programs
WHERE program_type = 'pap'
AND medication_id IN ('apixaban', 'tacrolimus', 'everolimus', 'belatacept');

-- BMS PAP for Eliquis
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Bristol Myers Squibb Patient Assistance - Eliquis', 'pap', 'apixaban', 'Bristol Myers Squibb',
    false, true, false, true, false, false, '300% FPL',
    'Free medication for eligible patients',
    'https://www.bmsaccesssupport.bmscustomerconnect.com/',
    '1-800-721-8909',
    'For uninsured or Medicare patients who meet income requirements.',
    true
);

-- Astellas PAP for Prograf
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Astellas Patient Assistance Program', 'pap', 'tacrolimus', 'Astellas',
    false, true, false, true, false, false, '400% FPL',
    'Free medication for eligible patients',
    'https://www.astellaspharmasupportsolutions.com/',
    '1-800-477-6472',
    'For uninsured or Medicare patients who meet income requirements.',
    true
);

-- Novartis PAP for Zortress
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Novartis Patient Assistance Program', 'pap', 'everolimus', 'Novartis',
    false, true, false, true, false, false, '400% FPL',
    'Free medication for eligible patients',
    'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance',
    '1-800-277-2254',
    'For uninsured or Medicare patients who meet income requirements.',
    true
);

-- BMS PAP for Nulojix
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Bristol Myers Squibb Patient Assistance - Nulojix', 'pap', 'belatacept', 'Bristol Myers Squibb',
    false, true, false, true, false, false, '300% FPL',
    'Free medication for eligible patients',
    'https://www.bmsaccesssupport.bmscustomerconnect.com/',
    '1-800-721-8909',
    'For uninsured or Medicare patients who meet income requirements.',
    true
);

-- ============================================
-- STEP 5: Ensure Foundation Programs Exist
-- ============================================

-- Check and insert HealthWell Foundation if not exists
INSERT INTO savings_programs (
    program_name, program_type, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
)
SELECT
    'HealthWell Foundation', 'foundation', NULL,
    true, true, false, false, false, false, '500% FPL',
    'Varies by fund',
    'https://www.healthwellfoundation.org/',
    '1-800-675-8416',
    'Funds open/close based on availability - check website frequently.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM savings_programs WHERE program_name = 'HealthWell Foundation'
);

-- Check and insert PAN Foundation if not exists
INSERT INTO savings_programs (
    program_name, program_type, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
)
SELECT
    'PAN Foundation', 'foundation', NULL,
    true, true, false, false, false, false, '400% FPL',
    'Varies by fund',
    'https://www.panfoundation.org/',
    '1-866-316-7263',
    'Funds open/close based on availability - sign up for alerts.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM savings_programs WHERE program_name = 'PAN Foundation'
);

-- American Kidney Fund
INSERT INTO savings_programs (
    program_name, program_type, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
)
SELECT
    'American Kidney Fund', 'foundation', NULL,
    true, true, true, true, true, true, 'Based on need',
    'Varies',
    'https://www.kidneyfund.org/',
    '1-800-638-8299',
    'Kidney patients only - includes HIPP for insurance premiums.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM savings_programs WHERE program_name = 'American Kidney Fund'
);

-- ============================================
-- STEP 6: Verification Queries
-- ============================================

-- Show all copay cards
SELECT
    program_name,
    medication_id,
    commercial_eligible,
    is_active
FROM savings_programs
WHERE program_type = 'copay_card'
ORDER BY program_name;

-- Count by program type
SELECT
    program_type,
    COUNT(*) as count
FROM savings_programs
WHERE is_active = true
GROUP BY program_type
ORDER BY count DESC;

-- Specifically check Eliquis
SELECT
    program_name,
    program_type,
    medication_id,
    commercial_eligible,
    medicare_eligible,
    is_active
FROM savings_programs
WHERE medication_id = 'apixaban';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
    copay_count INTEGER;
    pap_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO copay_count FROM savings_programs WHERE program_type = 'copay_card' AND is_active = true;
    SELECT COUNT(*) INTO pap_count FROM savings_programs WHERE program_type = 'pap' AND is_active = true;

    RAISE NOTICE '✅ Sync complete!';
    RAISE NOTICE '   - Copay cards: %', copay_count;
    RAISE NOTICE '   - PAP programs: %', pap_count;
    RAISE NOTICE '';
    RAISE NOTICE 'To verify Eliquis specifically:';
    RAISE NOTICE 'SELECT * FROM savings_programs WHERE medication_id = ''apixaban'';';
END $$;
