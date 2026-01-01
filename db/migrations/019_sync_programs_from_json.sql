-- Migration 019: Sync all programs from programs.json to savings_programs table
-- Run this in Neon SQL Editor to populate copay cards, PAPs, and foundations
-- This ensures the quiz returns all available assistance programs

-- ============================================
-- COPAY CARD PROGRAMS (Commercial Insurance Only)
-- ============================================

-- Astellas Copay Card (tacrolimus, cresemba)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Astellas Patient Support Solutions - Copay Card', 'copay_card', 'Astellas', 'tacrolimus', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Astellas Patient Support Solutions - Copay Card', 'copay_card', 'Astellas', 'cresemba', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Novartis Copay Card (cyclosporine, myfortic, everolimus, basiliximab, entresto)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance - Copay Card', 'copay_card', 'Novartis', 'cyclosporine', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance - Copay Card', 'copay_card', 'Novartis', 'myfortic', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance - Copay Card', 'copay_card', 'Novartis', 'everolimus', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance - Copay Card', 'copay_card', 'Novartis', 'basiliximab', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance - Copay Card', 'copay_card', 'Novartis', 'entresto', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Zortress Copay Card (everolimus)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Zortress Copay Card', 'copay_card', 'Novartis', 'everolimus', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.zortress.com/transplant/savings-and-support', '1-888-669-6682', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Genentech Copay Card (mycophenolate, valcyte, cytovene, rituxan)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Access Solutions - Copay Card', 'copay_card', 'Genentech', 'mycophenolate', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Access Solutions - Copay Card', 'copay_card', 'Genentech', 'valcyte', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Access Solutions - Copay Card', 'copay_card', 'Genentech', 'cytovene', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Access Solutions - Copay Card', 'copay_card', 'Genentech', 'rituxan', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- BMS Copay Card (belatacept, apixaban)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('BMS Access Support - Copay Card', 'copay_card', 'Bristol Myers Squibb', 'belatacept', true, false, false, false, false, false, NULL, 'Pay as little as $0 for first year', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-721-8909', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('BMS Access Support - Copay Card', 'copay_card', 'Bristol Myers Squibb', 'apixaban', true, false, false, false, false, false, NULL, 'Pay as little as $0 for first year', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-721-8909', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Nulojix Copay Card (belatacept)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Nulojix Co-Pay Assistance', 'copay_card', 'Bristol Myers Squibb', 'belatacept', true, false, false, false, false, false, NULL, 'Pay as little as $10 per infusion', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-861-0048', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Pfizer Copay Card (sirolimus, atgam, solu-medrol, diflucan, vfend, revatio)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer Savings Program', 'copay_card', 'Pfizer', 'sirolimus', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer Savings Program', 'copay_card', 'Pfizer', 'atgam', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer Savings Program', 'copay_card', 'Pfizer', 'solu-medrol', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer Savings Program', 'copay_card', 'Pfizer', 'diflucan', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer Savings Program', 'copay_card', 'Pfizer', 'vfend', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer Savings Program', 'copay_card', 'Pfizer', 'revatio', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Sanofi Copay Card (thymoglobulin, renvela, campath)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Sanofi Patient Connection - Copay Card', 'copay_card', 'Sanofi', 'thymoglobulin', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Sanofi Patient Connection - Copay Card', 'copay_card', 'Sanofi', 'renvela', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Sanofi Patient Connection - Copay Card', 'copay_card', 'Sanofi', 'campath', true, false, false, false, false, false, NULL, 'Pay as little as $0 copay', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Gilead Copay Card (vemlidy, epclusa, harvoni)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Gilead Advancing Access - Copay Card', 'copay_card', 'Gilead', 'vemlidy', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Gilead Advancing Access - Copay Card', 'copay_card', 'Gilead', 'epclusa', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Gilead Advancing Access - Copay Card', 'copay_card', 'Gilead', 'harvoni', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Merck Copay Card (prevymis, noxafil, januvia, janumet)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance - Copay Card', 'copay_card', 'Merck', 'prevymis', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance - Copay Card', 'copay_card', 'Merck', 'noxafil', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance - Copay Card', 'copay_card', 'Merck', 'januvia', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance - Copay Card', 'copay_card', 'Merck', 'janumet', true, false, false, false, false, false, NULL, 'Varies by medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Jardiance Copay Card
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Jardiance Savings Card', 'copay_card', 'Boehringer Ingelheim', 'jardiance', true, false, false, false, false, false, NULL, 'Pay as little as $10 per month', 'https://www.jardiance.com/savings/', '1-800-325-9881', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Farxiga Copay Card
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Farxiga Savings Card', 'copay_card', 'AstraZeneca', 'farxiga', true, false, false, false, false, false, NULL, 'Pay as little as $0 per month', 'https://www.farxiga.com/savings-and-support', '1-800-236-9933', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Entresto Copay Card
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Entresto Savings Card', 'copay_card', 'Novartis', 'entresto', true, false, false, false, false, false, NULL, 'Pay as little as $10 per month', 'https://www.entresto.com/savings-and-support', '1-888-669-6682', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Xarelto Copay Card
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Xarelto Savings Program', 'copay_card', 'Janssen', 'rivaroxaban', true, false, false, false, false, false, NULL, 'Pay as little as $10 per month', 'https://www.xarelto-us.com/savings', '1-888-927-3586', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Eliquis Copay Card
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Eliquis Savings Card', 'copay_card', 'Bristol Myers Squibb', 'apixaban', true, false, false, false, false, false, NULL, 'Pay as little as $10 per month', 'https://www.eliquis.bmscustomerconnect.com/afib/eliquis-free-trial-and-savings', '1-855-354-7847', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;

-- Dupixent Copay Card
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Dupixent MyWay Copay Card', 'copay_card', 'Regeneron / Sanofi', 'dupixent', true, false, false, false, false, false, NULL, 'Pay as little as $0 per month', 'https://www.dupixent.com/support-savings/dupixent-my-way', '1-844-387-4936', 'Commercial insurance only. Not valid for government insurance.', true)
ON CONFLICT DO NOTHING;


-- ============================================
-- PATIENT ASSISTANCE PROGRAMS (PAPs) - For Uninsured/Medicare
-- ============================================

-- Astellas PAP (tacrolimus, cresemba)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Astellas Patient Assistance Program', 'pap', 'Astellas', 'tacrolimus', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'For uninsured or Medicare patients who meet income requirements.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Astellas Patient Assistance Program', 'pap', 'Astellas', 'cresemba', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'For uninsured or Medicare patients who meet income requirements.', true)
ON CONFLICT DO NOTHING;

-- Novartis PAP (cyclosporine, myfortic, everolimus, basiliximab, entresto)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance Foundation', 'pap', 'Novartis', 'cyclosporine', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Covers Zortress, Myfortic, Neoral, Simulect, Entresto and other Novartis medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance Foundation', 'pap', 'Novartis', 'myfortic', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Covers Zortress, Myfortic, Neoral, Simulect, Entresto and other Novartis medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance Foundation', 'pap', 'Novartis', 'everolimus', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Covers Zortress, Myfortic, Neoral, Simulect, Entresto and other Novartis medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance Foundation', 'pap', 'Novartis', 'basiliximab', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Covers Zortress, Myfortic, Neoral, Simulect, Entresto and other Novartis medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Novartis Patient Assistance Foundation', 'pap', 'Novartis', 'entresto', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Covers Zortress, Myfortic, Neoral, Simulect, Entresto and other Novartis medications.', true)
ON CONFLICT DO NOTHING;

-- Genentech PAP (mycophenolate, valcyte, cytovene, rituxan)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Patient Foundation', 'pap', 'Genentech', 'mycophenolate', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Covers CellCept, Valcyte, Cytovene, Rituxan and other Genentech medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Patient Foundation', 'pap', 'Genentech', 'valcyte', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Covers CellCept, Valcyte, Cytovene, Rituxan and other Genentech medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Patient Foundation', 'pap', 'Genentech', 'cytovene', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Covers CellCept, Valcyte, Cytovene, Rituxan and other Genentech medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Genentech Patient Foundation', 'pap', 'Genentech', 'rituxan', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Covers CellCept, Valcyte, Cytovene, Rituxan and other Genentech medications.', true)
ON CONFLICT DO NOTHING;

-- BMS PAP (belatacept, apixaban)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Bristol Myers Squibb Patient Assistance Foundation', 'pap', 'Bristol Myers Squibb', 'belatacept', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.bmspaf.org/', '1-800-736-0003', 'Covers Nulojix, Eliquis and other BMS medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Bristol Myers Squibb Patient Assistance Foundation', 'pap', 'Bristol Myers Squibb', 'apixaban', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.bmspaf.org/', '1-800-736-0003', 'Covers Nulojix, Eliquis and other BMS medications.', true)
ON CONFLICT DO NOTHING;

-- Pfizer PAP (sirolimus, atgam, solu-medrol, diflucan, vfend, revatio)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer RxPathways', 'pap', 'Pfizer', 'sirolimus', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Covers Rapamune, ATGAM, Solu-Medrol, Diflucan, Vfend, Revatio and many other Pfizer medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer RxPathways', 'pap', 'Pfizer', 'atgam', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Covers Rapamune, ATGAM, Solu-Medrol, Diflucan, Vfend, Revatio and many other Pfizer medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer RxPathways', 'pap', 'Pfizer', 'solu-medrol', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Covers Rapamune, ATGAM, Solu-Medrol, Diflucan, Vfend, Revatio and many other Pfizer medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer RxPathways', 'pap', 'Pfizer', 'diflucan', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Covers Rapamune, ATGAM, Solu-Medrol, Diflucan, Vfend, Revatio and many other Pfizer medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer RxPathways', 'pap', 'Pfizer', 'vfend', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Covers Rapamune, ATGAM, Solu-Medrol, Diflucan, Vfend, Revatio and many other Pfizer medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Pfizer RxPathways', 'pap', 'Pfizer', 'revatio', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Covers Rapamune, ATGAM, Solu-Medrol, Diflucan, Vfend, Revatio and many other Pfizer medications.', true)
ON CONFLICT DO NOTHING;

-- Sanofi PAP (thymoglobulin, renvela, campath)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Sanofi Patient Connection', 'pap', 'Sanofi', 'thymoglobulin', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Covers Thymoglobulin, Renvela, Campath and other Sanofi medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Sanofi Patient Connection', 'pap', 'Sanofi', 'renvela', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Covers Thymoglobulin, Renvela, Campath and other Sanofi medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Sanofi Patient Connection', 'pap', 'Sanofi', 'campath', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Covers Thymoglobulin, Renvela, Campath and other Sanofi medications.', true)
ON CONFLICT DO NOTHING;

-- Gilead PAP (vemlidy, epclusa, harvoni)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Gilead Advancing Access', 'pap', 'Gilead', 'vemlidy', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Covers Vemlidy, Epclusa, Harvoni and other Gilead hepatitis medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Gilead Advancing Access', 'pap', 'Gilead', 'epclusa', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Covers Vemlidy, Epclusa, Harvoni and other Gilead hepatitis medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Gilead Advancing Access', 'pap', 'Gilead', 'harvoni', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Covers Vemlidy, Epclusa, Harvoni and other Gilead hepatitis medications.', true)
ON CONFLICT DO NOTHING;

-- Merck PAP (prevymis, noxafil, januvia, janumet)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance Program', 'pap', 'Merck', 'prevymis', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Covers Prevymis, Noxafil, Januvia, Janumet and other Merck medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance Program', 'pap', 'Merck', 'noxafil', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Covers Prevymis, Noxafil, Januvia, Janumet and other Merck medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance Program', 'pap', 'Merck', 'januvia', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Covers Prevymis, Noxafil, Januvia, Janumet and other Merck medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Merck Patient Assistance Program', 'pap', 'Merck', 'janumet', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'Covers Prevymis, Noxafil, Januvia, Janumet and other Merck medications.', true)
ON CONFLICT DO NOTHING;

-- AbbVie PAP (mavyret, creon, humira)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('AbbVie Patient Assistance Foundation', 'pap', 'AbbVie', 'mavyret', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.abbvie.com/patients/patient-assistance.html', '1-800-222-6885', 'Covers Mavyret, Creon, Humira and other AbbVie medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('AbbVie Patient Assistance Foundation', 'pap', 'AbbVie', 'creon', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.abbvie.com/patients/patient-assistance.html', '1-800-222-6885', 'Covers Mavyret, Creon, Humira and other AbbVie medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('AbbVie Patient Assistance Foundation', 'pap', 'AbbVie', 'humira', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.abbvie.com/patients/patient-assistance.html', '1-800-222-6885', 'Covers Mavyret, Creon, Humira and other AbbVie medications.', true)
ON CONFLICT DO NOTHING;

-- Lilly PAP (insulin-lispro, insulin-glargine, mounjaro)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Lilly Cares Foundation', 'pap', 'Eli Lilly', 'insulin-lispro', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.lillycares.com/', '1-800-545-6962', 'Covers Humalog, Basaglar, Mounjaro and other Lilly insulins and medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Lilly Cares Foundation', 'pap', 'Eli Lilly', 'insulin-glargine', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.lillycares.com/', '1-800-545-6962', 'Covers Humalog, Basaglar, Mounjaro and other Lilly insulins and medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Lilly Cares Foundation', 'pap', 'Eli Lilly', 'mounjaro', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.lillycares.com/', '1-800-545-6962', 'Covers Humalog, Basaglar, Mounjaro and other Lilly insulins and medications.', true)
ON CONFLICT DO NOTHING;

-- Boehringer Ingelheim PAP (jardiance, tradjenta, spiriva)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Boehringer Ingelheim Cares Foundation', 'pap', 'Boehringer Ingelheim', 'jardiance', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.boehringer-ingelheim.com/us/patient-assistance', '1-800-556-8317', 'Covers Jardiance, Tradjenta, Spiriva and other Boehringer Ingelheim medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Boehringer Ingelheim Cares Foundation', 'pap', 'Boehringer Ingelheim', 'tradjenta', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.boehringer-ingelheim.com/us/patient-assistance', '1-800-556-8317', 'Covers Jardiance, Tradjenta, Spiriva and other Boehringer Ingelheim medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Boehringer Ingelheim Cares Foundation', 'pap', 'Boehringer Ingelheim', 'spiriva', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.boehringer-ingelheim.com/us/patient-assistance', '1-800-556-8317', 'Covers Jardiance, Tradjenta, Spiriva and other Boehringer Ingelheim medications.', true)
ON CONFLICT DO NOTHING;

-- AstraZeneca PAP (farxiga, symbicort, crestor)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('AZ&Me Prescription Savings Program', 'pap', 'AstraZeneca', 'farxiga', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.azandmeapp.com/', '1-800-292-6363', 'Covers Farxiga, Symbicort, Crestor and other AstraZeneca medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('AZ&Me Prescription Savings Program', 'pap', 'AstraZeneca', 'symbicort', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.azandmeapp.com/', '1-800-292-6363', 'Covers Farxiga, Symbicort, Crestor and other AstraZeneca medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('AZ&Me Prescription Savings Program', 'pap', 'AstraZeneca', 'crestor', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.azandmeapp.com/', '1-800-292-6363', 'Covers Farxiga, Symbicort, Crestor and other AstraZeneca medications.', true)
ON CONFLICT DO NOTHING;

-- Janssen PAP (rivaroxaban, invokana, xarelto)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('J&J Patient Assistance Foundation', 'pap', 'Janssen', 'rivaroxaban', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.jnjwithme.com/', '1-800-652-6227', 'Covers Xarelto, Invokana and other Janssen medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('J&J Patient Assistance Foundation', 'pap', 'Janssen', 'invokana', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.jnjwithme.com/', '1-800-652-6227', 'Covers Xarelto, Invokana and other Janssen medications.', true)
ON CONFLICT DO NOTHING;

-- Novo Nordisk PAP (ozempic, victoza, novolog, levemir)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('NovoCare Patient Assistance Program', 'pap', 'Novo Nordisk', 'ozempic', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novocare.com/', '1-866-310-7549', 'Covers Ozempic, Victoza, NovoLog, Levemir and other Novo Nordisk insulins and medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('NovoCare Patient Assistance Program', 'pap', 'Novo Nordisk', 'victoza', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novocare.com/', '1-866-310-7549', 'Covers Ozempic, Victoza, NovoLog, Levemir and other Novo Nordisk insulins and medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('NovoCare Patient Assistance Program', 'pap', 'Novo Nordisk', 'novolog', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novocare.com/', '1-866-310-7549', 'Covers Ozempic, Victoza, NovoLog, Levemir and other Novo Nordisk insulins and medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('NovoCare Patient Assistance Program', 'pap', 'Novo Nordisk', 'levemir', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novocare.com/', '1-866-310-7549', 'Covers Ozempic, Victoza, NovoLog, Levemir and other Novo Nordisk insulins and medications.', true)
ON CONFLICT DO NOTHING;

-- Takeda PAP (gammagard, adynovate, entyvio)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Takeda Patient Assistance Program', 'pap', 'Takeda', 'gammagard', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.takeda.com/en-us/what-we-do/patient-services/', '1-800-830-9159', 'Covers Gammagard, Adynovate, Entyvio and other Takeda medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Takeda Patient Assistance Program', 'pap', 'Takeda', 'adynovate', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.takeda.com/en-us/what-we-do/patient-services/', '1-800-830-9159', 'Covers Gammagard, Adynovate, Entyvio and other Takeda medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Takeda Patient Assistance Program', 'pap', 'Takeda', 'entyvio', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.takeda.com/en-us/what-we-do/patient-services/', '1-800-830-9159', 'Covers Gammagard, Adynovate, Entyvio and other Takeda medications.', true)
ON CONFLICT DO NOTHING;

-- GSK PAP (breo, anoro, trelegy, nucala)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('GSK For You', 'pap', 'GlaxoSmithKline', 'breo', false, true, false, true, false, false, '350% FPL', 'Free medication', 'https://www.gskforyou.com/', '1-888-825-5249', 'Covers Breo Ellipta, Anoro Ellipta, Trelegy, Nucala and other GSK medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('GSK For You', 'pap', 'GlaxoSmithKline', 'anoro', false, true, false, true, false, false, '350% FPL', 'Free medication', 'https://www.gskforyou.com/', '1-888-825-5249', 'Covers Breo Ellipta, Anoro Ellipta, Trelegy, Nucala and other GSK medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('GSK For You', 'pap', 'GlaxoSmithKline', 'trelegy', false, true, false, true, false, false, '350% FPL', 'Free medication', 'https://www.gskforyou.com/', '1-888-825-5249', 'Covers Breo Ellipta, Anoro Ellipta, Trelegy, Nucala and other GSK medications.', true)
ON CONFLICT DO NOTHING;

INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('GSK For You', 'pap', 'GlaxoSmithKline', 'nucala', false, true, false, true, false, false, '350% FPL', 'Free medication', 'https://www.gskforyou.com/', '1-888-825-5249', 'Covers Breo Ellipta, Anoro Ellipta, Trelegy, Nucala and other GSK medications.', true)
ON CONFLICT DO NOTHING;


-- ============================================
-- FOUNDATION PROGRAMS (General - not medication-specific)
-- ============================================
-- Note: These should already exist from migration 004, but we'll use ON CONFLICT DO NOTHING

-- HealthWell Foundation
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('HealthWell Foundation', 'foundation', NULL, NULL, true, true, false, false, false, false, '500% FPL', 'Varies by fund', 'https://www.healthwellfoundation.org/', '1-800-675-8416', 'Funds open/close based on availability - check website frequently.', true)
ON CONFLICT DO NOTHING;

-- PAN Foundation
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('PAN Foundation', 'foundation', NULL, NULL, true, true, false, false, false, false, '400% FPL', 'Varies by fund', 'https://www.panfoundation.org/', '1-866-316-7263', 'Funds open/close based on availability - sign up for alerts.', true)
ON CONFLICT DO NOTHING;

-- Patient Advocate Foundation
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Patient Advocate Foundation Co-Pay Relief', 'foundation', NULL, NULL, true, true, false, false, false, false, '400% FPL', 'Up to $12,000/year', 'https://www.copays.org/', '1-866-512-3861', 'Disease-specific funds - check eligibility.', true)
ON CONFLICT DO NOTHING;

-- American Kidney Fund
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('American Kidney Fund', 'foundation', NULL, NULL, true, true, true, true, true, true, 'Based on need', 'Varies', 'https://www.kidneyfund.org/', '1-800-638-8299', 'Kidney patients only - includes HIPP for insurance premiums.', true)
ON CONFLICT DO NOTHING;

-- NORD RareCare
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('NORD RareCare Patient Assistance', 'foundation', NULL, NULL, true, true, false, true, false, false, 'Varies', 'Varies by program', 'https://rarediseases.org/patients-and-families/help-access-medications/', '1-800-999-6673', 'For rare disease patients.', true)
ON CONFLICT DO NOTHING;

-- Accessia Health (formerly PSI)
INSERT INTO savings_programs (program_name, program_type, manufacturer, medication_id, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note, is_active)
VALUES ('Accessia Health (formerly Patient Services Inc)', 'foundation', NULL, NULL, true, true, false, false, false, false, '500% FPL', 'Varies by fund', 'https://www.accessiahealth.org/', '1-800-366-7741', 'Multiple disease-specific funds available.', true)
ON CONFLICT DO NOTHING;


-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after the inserts to see what was added:

SELECT
  program_type,
  COUNT(*) as count
FROM savings_programs
GROUP BY program_type
ORDER BY program_type;
