-- Migration: Add comprehensive programs for ALL transplant medications
-- Run this in Neon SQL Editor after 004_savings_programs_and_how_to_steps.sql

-- ============================================
-- IMMUNOSUPPRESSANTS - COPAY CARDS (Commercial Only)
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- CellCept (Genentech)
('Genentech Access Solutions - CellCept', 'copay_card', 'mycophenolate', 'Genentech', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.genentech-access.com/patient/brands/cellcept.html', '1-866-422-2377', 'Commercial insurance only'),

-- Myfortic (Novartis)
('Novartis Copay Card - Myfortic', 'copay_card', 'myfortic', 'Novartis', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only'),

-- Cyclosporine/Neoral (Novartis)
('Novartis Copay Card - Neoral', 'copay_card', 'cyclosporine', 'Novartis', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only'),

-- Rapamune/Sirolimus (Pfizer)
('Pfizer Savings Program - Rapamune', 'copay_card', 'sirolimus', 'Pfizer', true, false, false, false, false, false, 'none', 'Up to $9,500/year', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only'),

-- Simulect (Novartis)
('Novartis Copay Card - Simulect', 'copay_card', 'simulect', 'Novartis', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'Commercial insurance only'),

-- Thymoglobulin (Sanofi)
('Sanofi Copay Assistance - Thymoglobulin', 'copay_card', 'thymoglobulin', 'Sanofi', true, false, false, false, false, false, 'none', 'Copay assistance available', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Commercial insurance only'),

-- Prevymis (Merck)
('Merck Copay Card - Prevymis', 'copay_card', 'prevymis', 'Merck', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.merckhelps.com/', '1-800-727-5400', 'Commercial insurance only'),

-- Livtencity (Takeda)
('Takeda Copay Card - Livtencity', 'copay_card', 'livtencity', 'Takeda', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.takeda.com/en-us/what-we-do/patient-services/', '1-844-817-6468', 'Commercial insurance only'),

-- Noxafil (Merck)
('Merck Copay Card - Noxafil', 'copay_card', 'noxafil', 'Merck', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.merckhelps.com/', '1-800-727-5400', 'Commercial insurance only'),

-- Vfend (Pfizer)
('Pfizer Savings Program - Vfend', 'copay_card', 'vfend', 'Pfizer', true, false, false, false, false, false, 'none', 'Savings available', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only'),

-- Cresemba (Astellas)
('Astellas Copay Card - Cresemba', 'copay_card', 'cresemba', 'Astellas', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'Commercial insurance only'),

-- Creon (AbbVie)
('AbbVie Copay Card - Creon', 'copay_card', 'creon', 'AbbVie', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.creon.com/savings-support', '1-800-222-6885', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- HEPATITIS B/C - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Baraclude (BMS)
('BMS Copay Card - Baraclude', 'copay_card', 'baraclude', 'Bristol Myers Squibb', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-861-0048', 'Commercial insurance only'),

-- Vemlidy (Gilead)
('Gilead Copay Card - Vemlidy', 'copay_card', 'vemlidy', 'Gilead', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only'),

-- Viread (Gilead)
('Gilead Copay Card - Viread', 'copay_card', 'viread', 'Gilead', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only'),

-- Epclusa (Gilead)
('Gilead Copay Card - Epclusa', 'copay_card', 'epclusa', 'Gilead', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only'),

-- Mavyret (AbbVie)
('AbbVie Copay Card - Mavyret', 'copay_card', 'mavyret', 'AbbVie', true, false, false, false, false, false, 'none', 'Pay as little as $5', 'https://www.mavyret.com/savings', '1-800-222-6885', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- CARDIAC/KIDNEY SUPPORT - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Renvela (Sanofi)
('Sanofi Copay Card - Renvela', 'copay_card', 'renvela', 'Sanofi', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Commercial insurance only'),

-- Sensipar (Amgen)
('Amgen FIRST STEP - Sensipar', 'copay_card', 'sensipar', 'Amgen', true, false, false, false, false, false, 'none', 'Pay as little as $5', 'https://www.amgenfirststep.com/', '1-888-427-7478', 'Commercial insurance only'),

-- Parsabiv (Amgen)
('Amgen FIRST STEP - Parsabiv', 'copay_card', 'parsabiv', 'Amgen', true, false, false, false, false, false, 'none', 'Pay as little as $5', 'https://www.amgenfirststep.com/', '1-888-427-7478', 'Commercial insurance only'),

-- Auryxia (Akebia)
('Akebia Copay Card - Auryxia', 'copay_card', 'auryxia', 'Akebia', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.auryxia.com/phosphate-binder/savings-support', '1-844-445-3799', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- PULMONARY HYPERTENSION - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Revatio (Pfizer)
('Pfizer Savings Program - Revatio', 'copay_card', 'revatio', 'Pfizer', true, false, false, false, false, false, 'none', 'Savings available', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only'),

-- Tracleer (Janssen)
('Janssen CarePath - Tracleer', 'copay_card', 'tracleer', 'Janssen', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.janssencarepath.com/', '1-800-526-7736', 'Commercial insurance only'),

-- Letairis (Gilead)
('Gilead Copay Card - Letairis', 'copay_card', 'letairis', 'Gilead', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'Commercial insurance only'),

-- Opsumit (Janssen)
('Janssen CarePath - Opsumit', 'copay_card', 'opsumit', 'Janssen', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.janssencarepath.com/', '1-800-526-7736', 'Commercial insurance only'),

-- Adempas (Bayer)
('Bayer Copay Card - Adempas', 'copay_card', 'adempas', 'Bayer', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.adempas.com/savings-support', '1-855-423-3672', 'Commercial insurance only'),

-- Uptravi (Janssen)
('Janssen CarePath - Uptravi', 'copay_card', 'uptravi', 'Janssen', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.janssencarepath.com/', '1-800-526-7736', 'Commercial insurance only'),

-- Remodulin (United Therapeutics)
('United Therapeutics ASSIST - Remodulin', 'copay_card', 'remodulin', 'United Therapeutics', true, false, false, false, false, false, 'none', 'Copay assistance', 'https://unitedtherapeuticscares.com/', '1-877-864-8437', 'Commercial insurance only'),

-- Flolan (GSK)
('GSK For You - Flolan', 'copay_card', 'flolan', 'GlaxoSmithKline', true, false, false, false, false, false, 'none', 'Copay assistance', 'https://www.gskforyou.com/', '1-888-825-5249', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- ANEMIA/IRON - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Procrit (Janssen)
('Janssen CarePath - Procrit', 'copay_card', 'procrit', 'Janssen', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.janssencarepath.com/', '1-800-526-7736', 'Commercial insurance only'),

-- Aranesp (Amgen)
('Amgen FIRST STEP - Aranesp', 'copay_card', 'aranesp', 'Amgen', true, false, false, false, false, false, 'none', 'Pay as little as $5', 'https://www.amgenfirststep.com/', '1-888-427-7478', 'Commercial insurance only'),

-- Venofer (American Regent)
('Venofer VenAccess - Copay Card', 'copay_card', 'venofer', 'American Regent', true, false, false, false, false, false, 'none', 'Copay assistance', 'https://www.venofer.com/venaccess', '1-800-706-3404', 'Commercial insurance only'),

-- Injectafer (American Regent)
('DSI Access Central - Injectafer', 'copay_card', 'injectafer', 'American Regent', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.dsiaccesscentral.com/', '1-888-548-3206', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- BIOLOGICS/REJECTION - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Rituxan (Genentech)
('Genentech Access Solutions - Rituxan', 'copay_card', 'rituxan', 'Genentech', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Commercial insurance only'),

-- Soliris (Alexion)
('Alexion OneSource - Soliris', 'copay_card', 'soliris', 'Alexion', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://alexion.com/our-patients', '1-888-765-4747', 'Commercial insurance only'),

-- Ultomiris (Alexion)
('Alexion OneSource - Ultomiris', 'copay_card', 'ultomiris', 'Alexion', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://alexion.com/our-patients', '1-888-765-4747', 'Commercial insurance only'),

-- IVIG/Gammagard
('Takeda Copay Card - Gammagard', 'copay_card', 'ivig', 'Takeda', true, false, false, false, false, false, 'none', 'Copay assistance', 'https://www.gammagard.com/primary-immunodeficiency/copay-support', '1-844-817-6468', 'Commercial insurance only'),

-- Campath (Sanofi)
('Sanofi Copay Card - Campath', 'copay_card', 'campath', 'Sanofi', true, false, false, false, false, false, 'none', 'Copay assistance', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- DIABETES - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Januvia (Merck)
('Merck Copay Card - Januvia', 'copay_card', 'sitagliptin', 'Merck', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.merckhelps.com/', '1-800-727-5400', 'Commercial insurance only'),

-- Ozempic (Novo Nordisk)
('Novo Nordisk Copay Card - Ozempic', 'copay_card', 'semaglutide', 'Novo Nordisk', true, false, false, false, false, false, 'none', 'Pay as little as $25', 'https://www.novocare.com/', '1-888-668-6444', 'Commercial insurance only'),

-- Trulicity (Lilly)
('Lilly Copay Card - Trulicity', 'copay_card', 'dulaglutide', 'Lilly', true, false, false, false, false, false, 'none', 'Pay as little as $25', 'https://www.trulicity.com/savings-resources', '1-800-545-6962', 'Commercial insurance only'),

-- Lantus (Sanofi)
('Sanofi Copay Card - Lantus', 'copay_card', 'insulin-glargine', 'Sanofi', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.lantus.com/sign-up/savings-and-support', '1-888-847-4877', 'Commercial insurance only'),

-- Humalog (Lilly)
('Lilly Copay Card - Humalog', 'copay_card', 'insulin-lispro', 'Lilly', true, false, false, false, false, false, 'none', 'Pay as little as $35', 'https://www.insulinaffordability.com/', '1-800-545-6962', 'Commercial insurance only'),

-- Novolog (Novo Nordisk)
('Novo Nordisk Copay Card - Novolog', 'copay_card', 'insulin-aspart', 'Novo Nordisk', true, false, false, false, false, false, 'none', 'Pay as little as $25', 'https://www.novocare.com/', '1-888-668-6444', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- RESPIRATORY - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Spiriva (Boehringer)
('Boehringer Copay Card - Spiriva', 'copay_card', 'tiotropium', 'Boehringer Ingelheim', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.spiriva.com/copd/support-and-savings', '1-800-542-6257', 'Commercial insurance only'),

-- Advair (GSK)
('GSK For You - Advair', 'copay_card', 'fluticasone-salmeterol', 'GlaxoSmithKline', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.gskforyou.com/', '1-888-825-5249', 'Commercial insurance only'),

-- Symbicort (AstraZeneca)
('AZ&Me - Symbicort', 'copay_card', 'budesonide-formoterol', 'AstraZeneca', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.symbicort.com/copd/copd-savings', '1-800-236-9933', 'Commercial insurance only'),

-- Xolair (Genentech)
('Genentech Access Solutions - Xolair', 'copay_card', 'omalizumab', 'Genentech', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'Commercial insurance only'),

-- Nucala (GSK)
('GSK For You - Nucala', 'copay_card', 'mepolizumab', 'GlaxoSmithKline', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.gskforyou.com/', '1-888-825-5249', 'Commercial insurance only'),

-- Fasenra (AstraZeneca)
('AZ&Me - Fasenra', 'copay_card', 'benralizumab', 'AstraZeneca', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.fasenra.com/savings', '1-800-236-9933', 'Commercial insurance only'),

-- Dupixent (Regeneron/Sanofi)
('Dupixent MyWay - Copay Card', 'copay_card', 'dupilumab', 'Regeneron/Sanofi', true, false, false, false, false, false, 'none', 'Pay as little as $0', 'https://www.dupixent.com/support-savings/dupixent-my-way', '1-844-387-4936', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- NERVE PAIN - COPAY CARDS
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Lyrica (Pfizer)
('Pfizer Savings Program - Lyrica', 'copay_card', 'pregabalin', 'Pfizer', true, false, false, false, false, false, 'none', 'Savings available', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'Commercial insurance only')

ON CONFLICT DO NOTHING;

-- ============================================
-- PATIENT ASSISTANCE PROGRAMS (PAPs) - FREE MEDS
-- For Medicare/Uninsured patients
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- CellCept PAP
('Genentech Patient Foundation - CellCept', 'pap', 'mycophenolate', 'Genentech', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient/brands/cellcept/patient-foundation.html', '1-866-422-2377', 'For uninsured or Medicare patients'),

-- Myfortic PAP
('Novartis Patient Assistance - Myfortic', 'pap', 'myfortic', 'Novartis', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'For uninsured or Medicare patients'),

-- Cyclosporine PAP
('Novartis Patient Assistance - Neoral', 'pap', 'cyclosporine', 'Novartis', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'For uninsured or Medicare patients'),

-- Simulect PAP
('Novartis Patient Assistance - Simulect', 'pap', 'simulect', 'Novartis', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', '1-800-277-2254', 'For uninsured or Medicare patients'),

-- Thymoglobulin PAP
('Sanofi Patient Connection - Thymoglobulin', 'pap', 'thymoglobulin', 'Sanofi', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'For uninsured or Medicare patients'),

-- Prevymis PAP
('Merck Patient Assistance - Prevymis', 'pap', 'prevymis', 'Merck', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'For uninsured or Medicare patients'),

-- Livtencity PAP
('Takeda Patient Assistance - Livtencity', 'pap', 'livtencity', 'Takeda', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.takeda.com/en-us/what-we-do/patient-services/', '1-844-817-6468', 'For uninsured or Medicare patients'),

-- Diflucan PAP
('Pfizer RxPathways - Diflucan', 'pap', 'diflucan', 'Pfizer', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'For uninsured or Medicare patients'),

-- Noxafil PAP
('Merck Patient Assistance - Noxafil', 'pap', 'noxafil', 'Merck', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'For uninsured or Medicare patients'),

-- Vfend PAP
('Pfizer RxPathways - Vfend', 'pap', 'vfend', 'Pfizer', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'For uninsured or Medicare patients'),

-- Cresemba PAP
('Astellas Patient Assistance - Cresemba', 'pap', 'cresemba', 'Astellas', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.astellaspharmasupportsolutions.com/', '1-800-477-6472', 'For uninsured or Medicare patients'),

-- Baraclude PAP
('BMS Patient Assistance - Baraclude', 'pap', 'baraclude', 'Bristol Myers Squibb', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.bmsaccesssupport.bmscustomerconnect.com/', '1-800-861-0048', 'For uninsured or Medicare patients'),

-- Vemlidy PAP
('Gilead Advancing Access - Vemlidy', 'pap', 'vemlidy', 'Gilead', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'For uninsured or Medicare patients'),

-- Viread PAP
('Gilead Advancing Access - Viread', 'pap', 'viread', 'Gilead', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'For uninsured or Medicare patients'),

-- Epclusa PAP
('Gilead Advancing Access - Epclusa', 'pap', 'epclusa', 'Gilead', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'For uninsured or Medicare patients'),

-- Mavyret PAP
('AbbVie Patient Assistance - Mavyret', 'pap', 'mavyret', 'AbbVie', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.abbvie.com/patients/patient-assistance.html', '1-800-222-6885', 'For uninsured or Medicare patients'),

-- Creon PAP
('AbbVie Patient Assistance - Creon', 'pap', 'creon', 'AbbVie', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.abbvie.com/patients/patient-assistance.html', '1-800-222-6885', 'For uninsured or Medicare patients'),

-- Renvela PAP
('Sanofi Patient Connection - Renvela', 'pap', 'renvela', 'Sanofi', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'For uninsured or Medicare patients'),

-- Sensipar PAP
('Amgen Safety Net - Sensipar', 'pap', 'sensipar', 'Amgen', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.amgensafetynetfoundation.com/', '1-888-762-6436', 'For uninsured or Medicare patients'),

-- Procrit PAP
('Janssen Patient Assistance - Procrit', 'pap', 'procrit', 'Janssen', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.janssencarepath.com/', '1-800-526-7736', 'For uninsured or Medicare patients'),

-- Aranesp PAP
('Amgen Safety Net - Aranesp', 'pap', 'aranesp', 'Amgen', false, true, false, true, false, false, '300% FPL', 'Free medication', 'https://www.amgensafetynetfoundation.com/', '1-888-762-6436', 'For uninsured or Medicare patients'),

-- Rituxan PAP
('Genentech Patient Foundation - Rituxan', 'pap', 'rituxan', 'Genentech', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'For uninsured or Medicare patients'),

-- Soliris PAP
('Alexion OneSource - Soliris PAP', 'pap', 'soliris', 'Alexion', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://alexion.com/our-patients', '1-888-765-4747', 'For uninsured or Medicare patients'),

-- Ultomiris PAP
('Alexion OneSource - Ultomiris PAP', 'pap', 'ultomiris', 'Alexion', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://alexion.com/our-patients', '1-888-765-4747', 'For uninsured or Medicare patients'),

-- Campath PAP
('Sanofi Patient Connection - Campath', 'pap', 'campath', 'Sanofi', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'For uninsured or Medicare patients'),

-- Tracleer PAP
('Janssen Patient Assistance - Tracleer', 'pap', 'tracleer', 'Janssen', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.janssencarepath.com/', '1-800-526-7736', 'For uninsured or Medicare patients'),

-- Letairis PAP
('Gilead Advancing Access - Letairis', 'pap', 'letairis', 'Gilead', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.gileadadvancingaccess.com/', '1-800-226-2056', 'For uninsured or Medicare patients'),

-- Opsumit PAP
('Janssen Patient Assistance - Opsumit', 'pap', 'opsumit', 'Janssen', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.janssencarepath.com/', '1-800-526-7736', 'For uninsured or Medicare patients'),

-- Uptravi PAP
('Janssen Patient Assistance - Uptravi', 'pap', 'uptravi', 'Janssen', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.janssencarepath.com/', '1-800-526-7736', 'For uninsured or Medicare patients'),

-- Remodulin PAP
('United Therapeutics ASSIST - Remodulin PAP', 'pap', 'remodulin', 'United Therapeutics', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://unitedtherapeuticscares.com/', '1-877-864-8437', 'For uninsured or Medicare patients'),

-- Januvia PAP
('Merck Patient Assistance - Januvia', 'pap', 'sitagliptin', 'Merck', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.merckhelps.com/', '1-800-727-5400', 'For uninsured or Medicare patients'),

-- Ozempic PAP
('Novo Nordisk PAP - Ozempic', 'pap', 'semaglutide', 'Novo Nordisk', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novocare.com/diabetes/help-with-costs/pap.html', '1-866-310-7549', 'For uninsured or Medicare patients'),

-- Trulicity PAP
('Lilly Cares - Trulicity', 'pap', 'dulaglutide', 'Lilly', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.lillycares.com/', '1-800-545-6962', 'For uninsured or Medicare patients'),

-- Lantus PAP
('Sanofi Patient Connection - Lantus', 'pap', 'insulin-glargine', 'Sanofi', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.sanofipatientconnection.com/', '1-888-847-4877', 'For uninsured or Medicare patients'),

-- Humalog PAP
('Lilly Cares - Humalog', 'pap', 'insulin-lispro', 'Lilly', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.lillycares.com/', '1-800-545-6962', 'For uninsured or Medicare patients'),

-- Novolog PAP
('Novo Nordisk PAP - Novolog', 'pap', 'insulin-aspart', 'Novo Nordisk', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.novocare.com/diabetes/help-with-costs/pap.html', '1-866-310-7549', 'For uninsured or Medicare patients'),

-- Spiriva PAP
('Boehringer Cares - Spiriva', 'pap', 'tiotropium', 'Boehringer Ingelheim', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.boehringer-ingelheim.us/our-responsibility/patient-assistance-program', '1-800-556-8317', 'For uninsured or Medicare patients'),

-- Advair PAP
('GSK Patient Assistance - Advair', 'pap', 'fluticasone-salmeterol', 'GlaxoSmithKline', false, true, false, true, false, false, '350% FPL', 'Free medication', 'https://www.gskforyou.com/', '1-888-825-5249', 'For uninsured or Medicare patients'),

-- Symbicort PAP
('AstraZeneca Patient Assistance - Symbicort', 'pap', 'budesonide-formoterol', 'AstraZeneca', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.azandmeapp.com/', '1-800-292-6363', 'For uninsured or Medicare patients'),

-- Xolair PAP
('Genentech Patient Foundation - Xolair', 'pap', 'omalizumab', 'Genentech', false, true, false, true, false, false, '500% FPL', 'Free medication', 'https://www.genentech-access.com/patient.html', '1-866-422-2377', 'For uninsured or Medicare patients'),

-- Nucala PAP
('GSK Patient Assistance - Nucala', 'pap', 'mepolizumab', 'GlaxoSmithKline', false, true, false, true, false, false, '350% FPL', 'Free medication', 'https://www.gskforyou.com/', '1-888-825-5249', 'For uninsured or Medicare patients'),

-- Fasenra PAP
('AstraZeneca Patient Assistance - Fasenra', 'pap', 'benralizumab', 'AstraZeneca', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.azandmeapp.com/', '1-800-292-6363', 'For uninsured or Medicare patients'),

-- Dupixent PAP
('Dupixent MyWay - Patient Assistance', 'pap', 'dupilumab', 'Regeneron/Sanofi', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.dupixent.com/support-savings/dupixent-my-way', '1-844-387-4936', 'For uninsured or Medicare patients'),

-- Lyrica PAP
('Pfizer RxPathways - Lyrica', 'pap', 'pregabalin', 'Pfizer', false, true, false, true, false, false, '400% FPL', 'Free medication', 'https://www.pfizerrxpathways.com/', '1-844-989-7284', 'For uninsured or Medicare patients')

ON CONFLICT DO NOTHING;

-- ============================================
-- GENERIC MEDICATION RESOURCES
-- ============================================

INSERT INTO savings_programs (program_name, program_type, medication_id, manufacturer, commercial_eligible, medicare_eligible, medicaid_eligible, uninsured_eligible, tricare_va_eligible, ihs_tribal_eligible, income_limit, max_benefit, application_url, phone, fund_status_note) VALUES

-- Imuran (Generic)
('NeedyMeds - Generic Azathioprine', 'pap', 'imuran', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/azathioprine', NULL, 'Multiple programs available'),

-- Prednisone (Generic)
('NeedyMeds - Generic Prednisone', 'pap', 'prednisone', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/prednisone', NULL, 'Multiple programs available'),

-- Metformin (Generic)
('NeedyMeds - Generic Metformin', 'pap', 'metformin', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/metformin', NULL, 'Multiple programs available'),

-- Amlodipine (Generic)
('NeedyMeds - Generic Amlodipine', 'pap', 'amlodipine', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/amlodipine', NULL, 'Multiple programs available'),

-- Lisinopril (Generic)
('NeedyMeds - Generic Lisinopril', 'pap', 'lisinopril', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/lisinopril', NULL, 'Multiple programs available'),

-- Atorvastatin (Generic)
('NeedyMeds - Generic Atorvastatin', 'pap', 'atorvastatin', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/atorvastatin', NULL, 'Multiple programs available'),

-- Gabapentin (Generic)
('NeedyMeds - Generic Gabapentin', 'pap', 'gabapentin', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/gabapentin', NULL, 'Multiple programs available'),

-- Omeprazole (Generic)
('NeedyMeds - Generic Omeprazole', 'pap', 'omeprazole', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/omeprazole', NULL, 'Multiple programs available'),

-- Levothyroxine (Generic)
('NeedyMeds - Generic Levothyroxine', 'pap', 'levothyroxine', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/levothyroxine', NULL, 'Multiple programs available'),

-- Sertraline (Generic)
('NeedyMeds - Generic Sertraline', 'pap', 'sertraline', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/sertraline', NULL, 'Multiple programs available'),

-- Escitalopram (Generic)
('NeedyMeds - Generic Escitalopram', 'pap', 'escitalopram', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/escitalopram', NULL, 'Multiple programs available'),

-- Losartan (Generic)
('NeedyMeds - Generic Losartan', 'pap', 'losartan', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/losartan', NULL, 'Multiple programs available'),

-- Carvedilol (Generic)
('NeedyMeds - Generic Carvedilol', 'pap', 'coreg', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/carvedilol', NULL, 'Multiple programs available'),

-- Metoprolol (Generic)
('NeedyMeds - Generic Metoprolol', 'pap', 'lopressor', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/metoprolol', NULL, 'Multiple programs available'),

-- Furosemide (Generic)
('NeedyMeds - Generic Furosemide', 'pap', 'lasix', 'Various', false, true, true, true, true, true, 'Varies', 'Discounted or free', 'https://www.needymeds.org/drug/generic/furosemide', NULL, 'Multiple programs available')

ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify programs were added:
-- SELECT medication_id, COUNT(*) as program_count
-- FROM savings_programs
-- WHERE medication_id IS NOT NULL
-- GROUP BY medication_id
-- ORDER BY program_count DESC;
