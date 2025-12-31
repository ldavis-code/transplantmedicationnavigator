-- SYNC COPAY CARDS TO NEON DATABASE
-- Copy and paste this entire script into the Neon SQL Editor and run

CREATE TABLE IF NOT EXISTS savings_programs (
    id SERIAL PRIMARY KEY,
    program_name TEXT NOT NULL,
    program_type TEXT NOT NULL,
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

DELETE FROM savings_programs WHERE program_type = 'copay_card';

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active) VALUES
('Eliquis Savings Card', 'copay_card', 'apixaban', 'Bristol Myers Squibb', true, false, false, false, false, false, 'none', 'Pay as little as $10 per month', 'https://www.eliquis.bmscustomerconnect.com/afib/eliquis-free-trial-and-savings', '1-855-354-7847', 'Commercial insurance only', true),
('Astellas Patient Support - Prograf', 'copay_card', 'tacrolimus', 'Astellas', true, false, false, false, false, false, 'none', 'Pay as little as $0 copay', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'Commercial insurance only', true),
('Zortress Copay Card', 'copay_card', 'everolimus', 'Novartis', true, false, false, false, false, false, 'none', 'Pay as little as $0 copay', 'https://www.zortress.com/transplant/savings-and-support', '1-888-669-6682', 'Commercial insurance only', true),
('Nulojix Co-Pay Assistance', 'copay_card', 'belatacept', 'Bristol Myers Squibb', true, false, false, false, false, false, 'none', 'Pay as little as $10 per infusion', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-721-8909', 'Commercial insurance only', true),
('Genentech Access Solutions - Valcyte', 'copay_card', 'valcyte', 'Genentech', true, false, false, false, false, false, 'none', 'Pay as little as $0 copay', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Commercial insurance only', true),
('Envarsus XR Savings Program', 'copay_card', 'envarsus-xr', 'Veloxis', true, false, false, false, false, false, 'none', 'Pay as little as $0 copay', 'https://www.envarsusxr.com/savings/', '1-833-368-2778', 'Commercial insurance only', true),
('Xarelto Savings Program', 'copay_card', 'rivaroxaban', 'Janssen', true, false, false, false, false, false, 'none', 'Pay as little as $10 per month', 'https://www.xarelto-us.com/savings', '1-888-927-3586', 'Commercial insurance only', true),
('Entresto Savings Card', 'copay_card', 'entresto', 'Novartis', true, false, false, false, false, false, 'none', 'Pay as little as $10 per month', 'https://www.entresto.com/savings-and-support', '1-888-669-6682', 'Commercial insurance only', true),
('Jardiance Savings Card', 'copay_card', 'jardiance', 'Boehringer Ingelheim', true, false, false, false, false, false, 'none', 'Pay as little as $10 per month', 'https://www.jardiance.com/savings/', '1-800-325-9881', 'Commercial insurance only', true),
('Farxiga Savings Card', 'copay_card', 'farxiga', 'AstraZeneca', true, false, false, false, false, false, 'none', 'Pay as little as $0 per month', 'https://www.farxiga.com/savings-and-support', '1-800-236-9933', 'Commercial insurance only', true),
('Xifaxan Savings Program', 'copay_card', 'xifaxan', 'Bausch Health', true, false, false, false, false, false, 'none', 'Pay as little as $0 copay', 'https://xifaxan.copaysavingsprogram.com/', '1-844-943-2926', 'Commercial insurance only', true),
('Mavyret Savings Card', 'copay_card', 'mavyret', 'AbbVie', true, false, false, false, false, false, 'none', 'Pay as little as $5 per month', 'https://www.mavyret.com/savings', '1-800-222-6885', 'Commercial insurance only', true),
('Vemlidy Co-Pay Coupon', 'copay_card', 'vemlidy', 'Gilead', true, false, false, false, false, false, 'none', 'Pay as little as $0 copay', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only', true),
('Creon Savings Card', 'copay_card', 'creon', 'AbbVie', true, false, false, false, false, false, 'none', 'Pay as little as $0 copay', 'https://www.creoninfo.com/savings/', '1-800-222-6885', 'Commercial insurance only', true),
('Dupixent MyWay Copay Card', 'copay_card', 'dupixent', 'Regeneron Sanofi', true, false, false, false, false, false, 'none', 'Pay as little as $0 per month', 'https://www.dupixent.com/support-savings/dupixent-my-way', '1-844-387-4936', 'Commercial insurance only', true);

DELETE FROM savings_programs WHERE program_type = 'pap' AND medication_id IN ('apixaban', 'tacrolimus', 'everolimus', 'belatacept');

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active) VALUES
('Bristol Myers Squibb Patient Assistance - Eliquis', 'pap', 'apixaban', 'Bristol Myers Squibb', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-721-8909', 'For uninsured or Medicare patients', true),
('Astellas Patient Assistance Program', 'pap', 'tacrolimus', 'Astellas', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'For uninsured or Medicare patients', true),
('Novartis Patient Assistance Program', 'pap', 'everolimus', 'Novartis', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'For uninsured or Medicare patients', true),
('Bristol Myers Squibb Patient Assistance - Nulojix', 'pap', 'belatacept', 'Bristol Myers Squibb', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-721-8909', 'For uninsured or Medicare patients', true);

SELECT program_type, COUNT(*) as count FROM savings_programs WHERE is_active = true GROUP BY program_type;

SELECT program_name, program_type, commercial_eligible FROM savings_programs WHERE medication_id = 'apixaban';
