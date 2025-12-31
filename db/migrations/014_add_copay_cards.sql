-- Migration: Add Copay Card Programs for Branded Medications
-- Ensures copay cards are separate from PAPs for medications that offer both
-- Run this in Neon SQL Editor after 013_fix_broken_urls.sql

-- ============================================
-- COPAY CARD PROGRAMS - For Commercial Insurance ONLY
-- ============================================

-- Zortress (Novartis) - Everolimus
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('zortress-copay', 'copay', 'Zortress Copay Card', 'https://www.zortress.com/transplant/savings-and-support', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Nulojix (BMS) - Belatacept
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('nulojix-copay', 'copay', 'Nulojix Co-Pay Assistance', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Simulect (Novartis) - Basiliximab
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('simulect-copay', 'copay', 'Simulect Copay Card', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Thymoglobulin (Sanofi) - ATG
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('thymoglobulin-copay', 'copay', 'Thymoglobulin CoPay Card', 'https://www.thymoglobulin.com/resources', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Entresto (Novartis)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('entresto-copay', 'copay', 'Entresto Savings Card', 'https://www.entresto.com/savings-and-support', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Jardiance (Boehringer Ingelheim)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('jardiance-copay', 'copay', 'Jardiance Savings Card', 'https://www.jardiance.com/savings/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Farxiga (AstraZeneca)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('farxiga-copay', 'copay', 'Farxiga Savings Card', 'https://www.farxiga.com/savings-and-support', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Xarelto (Janssen)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('xarelto-copay', 'copay', 'Xarelto Savings Program', 'https://www.xarelto-us.com/savings', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Januvia (Merck)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('januvia-copay', 'copay', 'Januvia Savings Card', 'https://www.januvia.com/savings-and-resources/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Ozempic (Novo Nordisk)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('ozempic-copay', 'copay', 'Ozempic Savings Card', 'https://www.ozempic.com/savings-and-resources/save-on-ozempic.html', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Mounjaro (Lilly)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('mounjaro-copay', 'copay', 'Mounjaro Savings Card', 'https://www.mounjaro.com/savings', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Opsumit (Janssen) - Pulmonary Hypertension
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('opsumit-copay', 'copay', 'Opsumit Co-Pay Program', 'https://www.opsumit.com/support', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Adempas (Bayer)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('adempas-copay', 'copay', 'Adempas Co-Pay Program', 'https://www.adempas-us.com/cteph/financial-support', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Uptravi (Janssen)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('uptravi-copay', 'copay', 'Uptravi Co-Pay Program', 'https://www.uptravi.com/support', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Remodulin/Tyvaso (United Therapeutics)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('tyvaso-copay', 'copay', 'Tyvaso Co-Pay Assistance', 'https://unitedtherapeuticscares.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Spiriva (Boehringer Ingelheim)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('spiriva-copay', 'copay', 'Spiriva Savings Card', 'https://www.spiriva.com/copd-resources/savings', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Breo Ellipta (GSK)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('breo-copay', 'copay', 'Breo Ellipta Savings Offer', 'https://www.breoellipta.com/savings/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Nucala (GSK)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('nucala-copay', 'copay', 'Nucala Copay Program', 'https://www.nucala.com/severe-eosinophilic-asthma/nucala-costs/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Fasenra (AstraZeneca)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('fasenra-copay', 'copay', 'Fasenra Copay Card', 'https://www.fasenra.com/savings-and-support/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Dupixent (Sanofi/Regeneron)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('dupixent-copay', 'copay', 'Dupixent MyWay Copay Card', 'https://www.dupixent.com/support-savings/dupixent-my-way', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Tezspire (AstraZeneca)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('tezspire-copay', 'copay', 'Tezspire Copay Program', 'https://www.tezspire.com/savings/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Xolair (Genentech/Novartis)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('xolair-copay', 'copay', 'Xolair Co-pay Program', 'https://www.xolair.com/allergic-asthma/financial-support.html', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Anoro Ellipta (GSK)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('anoro-copay', 'copay', 'Anoro Ellipta Savings Offer', 'https://www.anoro.com/savings-and-support/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Dulera (Organon)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('dulera-copay', 'copay', 'Dulera Savings Card', 'https://www.dulera.com/savings/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Prograf (Astellas) - Adding copay for brand Prograf
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('prograf-copay', 'copay', 'Prograf Copay Card', 'https://www.astellaspharmasupportsolutions.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Envarsus XR (Veloxis)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('envarsus-copay', 'copay', 'Envarsus XR Savings Program', 'https://www.envarsusxr.com/savings/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Cresemba (Astellas)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('cresemba-copay', 'copay', 'Cresemba Copay Card', 'https://www.astellaspharmasupportsolutions.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Vemlidy (Gilead)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('vemlidy-copay', 'copay', 'Vemlidy Co-Pay Coupon', 'https://www.gileadadvancingaccess.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Epclusa (Gilead)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('epclusa-copay', 'copay', 'Epclusa Co-Pay Coupon', 'https://www.gileadadvancingaccess.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Mavyret (AbbVie)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('mavyret-copay', 'copay', 'Mavyret Savings Card', 'https://www.mavyret.com/savings', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Creon (AbbVie)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('creon-copay', 'copay', 'Creon Savings Card', 'https://www.creoninfo.com/savings/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Auryxia (Akebia)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('auryxia-copay', 'copay', 'Auryxia Co-Pay Assistance', 'https://www.akebiacares.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- Rezdiffra (Madrigal)
INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('rezdiffra-copay', 'copay', 'Rezdiffra Copay Card', 'https://madrigalpatientsupport.com/', true)
ON CONFLICT (program_id) DO UPDATE SET official_url = EXCLUDED.official_url, name = EXCLUDED.name;

-- ============================================
-- ADD COPAY CARDS TO SAVINGS_PROGRAMS TABLE
-- ============================================

-- Zortress Copay Card
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Zortress Copay Card', 'copay_card', 'everolimus', 'Novartis',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 copay',
    'https://www.zortress.com/transplant/savings-and-support', '1-888-669-6682',
    'Commercial insurance only. Not valid for government insurance.', true
) ON CONFLICT DO NOTHING;

-- Nulojix Copay Card
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Nulojix Co-Pay Assistance', 'copay_card', 'belatacept', 'Bristol Myers Squibb',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per infusion',
    'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-721-8909',
    'Commercial insurance only. Not valid for government insurance.', true
) ON CONFLICT DO NOTHING;

-- Entresto Copay Card
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Entresto Savings Card', 'copay_card', 'entresto', 'Novartis',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per month',
    'https://www.entresto.com/savings-and-support', '1-888-669-6682',
    'Commercial insurance only. Not valid for government insurance.', true
) ON CONFLICT DO NOTHING;

-- Jardiance Copay Card
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Jardiance Savings Card', 'copay_card', 'jardiance', 'Boehringer Ingelheim',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per month',
    'https://www.jardiance.com/savings/', '1-800-325-9881',
    'Commercial insurance only. Not valid for government insurance.', true
) ON CONFLICT DO NOTHING;

-- Farxiga Copay Card
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Farxiga Savings Card', 'copay_card', 'farxiga', 'AstraZeneca',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 per month',
    'https://www.farxiga.com/savings-and-support', '1-800-236-9933',
    'Commercial insurance only. Not valid for government insurance.', true
) ON CONFLICT DO NOTHING;

-- Xarelto Copay Card
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Xarelto Savings Program', 'copay_card', 'rivaroxaban', 'Janssen',
    true, false, false, false, false, false, 'none',
    'Pay as little as $10 per month',
    'https://www.xarelto-us.com/savings', '1-888-927-3586',
    'Commercial insurance only. Not valid for government insurance.', true
) ON CONFLICT DO NOTHING;

-- Dupixent Copay Card
INSERT INTO savings_programs (
    program_name, program_type, medication_id, manufacturer,
    commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible,
    tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit,
    application_url, phone, fund_status_note, is_active
) VALUES (
    'Dupixent MyWay Copay Card', 'copay_card', 'dupixent', 'Regeneron / Sanofi',
    true, false, false, false, false, false, 'none',
    'Pay as little as $0 per month',
    'https://www.dupixent.com/support-savings/dupixent-my-way', '1-844-387-4936',
    'Commercial insurance only. Not valid for government insurance.', true
) ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly:
-- SELECT program_id, program_type, name FROM programs WHERE program_type = 'copay' ORDER BY program_id;
-- SELECT program_name, program_type, medication_id FROM savings_programs WHERE program_type = 'copay_card' ORDER BY program_name;
