-- Migration: Add programs for CellCept (mycophenolate) and other missing medications
-- Run this in Neon SQL Editor after 004_savings_programs_and_how_to_steps.sql

-- ============================================
-- ADD COPAY CARDS FOR MISSING MEDICATIONS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- CellCept (Genentech) - Copay Card
('Genentech Access Solutions - CellCept', 'copay_card', 'mycophenolate', 'Genentech', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.genentech-access.com/patient/brands/cellcept.html', '1-866-422-2377', 'Commercial insurance only'),

-- Myfortic (Novartis) - Copay Card
('Novartis Copay Card - Myfortic', 'copay_card', 'myfortic', 'Novartis', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only'),

-- Rapamune/Sirolimus (Pfizer) - Copay Card
('Pfizer Savings Program - Rapamune', 'copay_card', 'sirolimus', 'Pfizer', true, false, false, false, false, false, 'none', 'Up to $9,500/year', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only'),

-- Cyclosporine (Novartis) - Copay Card
('Novartis Copay Card - Neoral', 'copay_card', 'cyclosporine', 'Novartis', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- ADD PATIENT ASSISTANCE PROGRAMS (PAPs)
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- CellCept (Genentech) - PAP
('Genentech Patient Foundation - CellCept', 'pap', 'mycophenolate', 'Genentech', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient/brands/cellcept/patient-foundation.html', '1-866-422-2377', 'For uninsured or Medicare patients who need CellCept'),

-- Myfortic (Novartis) - PAP
('Novartis Patient Assistance - Myfortic', 'pap', 'myfortic', 'Novartis', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'For uninsured or Medicare patients'),

-- Cyclosporine (Novartis) - PAP
('Novartis Patient Assistance - Neoral', 'pap', 'cyclosporine', 'Novartis', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'For uninsured or Medicare patients'),

-- Imuran/Azathioprine - Generally generic, point to NeedyMeds
('NeedyMeds - Generic Azathioprine', 'pap', 'imuran', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/azathioprine', NULL, 'Multiple programs available for generic azathioprine'),

-- Prednisone - Generic, point to NeedyMeds
('NeedyMeds - Generic Prednisone', 'pap', 'prednisone', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/prednisone', NULL, 'Multiple programs available for generic prednisone')

ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY PROGRAMS WERE ADDED
-- ============================================
-- Run this to confirm:
-- SELECT medication_id, program_name, program_type FROM savings_programs WHERE medication_id IN ('mycophenolate', 'myfortic', 'cyclosporine', 'sirolimus', 'imuran', 'prednisone') ORDER BY medication_id, program_type;
