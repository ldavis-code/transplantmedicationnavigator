-- Migration 027: Add all programs referenced by /out/ redirect links
-- Ensures every copay, PAP, and foundation program from programs.json
-- and hardcoded links has an entry in the programs table for redirect tracking.
-- Uses ON CONFLICT DO NOTHING to skip programs already in the table.

-- ============================================
-- COPAY CARD PROGRAMS (from programs.json)
-- ============================================

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('astellas-copay', 'copay', 'Astellas Patient Support Solutions - Copay Card', 'https://www.astellaspharmasupportsolutions.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('novartis-copay', 'copay', 'Novartis Patient Assistance - Copay Card', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('zortress-copay', 'copay', 'Zortress Copay Card', 'https://www.zortress.com/transplant/savings-and-support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('genentech-copay', 'copay', 'Genentech Access Solutions - Copay Card', 'https://www.genentech-access.com/patient.html', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('bms-copay', 'copay', 'BMS Access Support - Copay Card', 'https://www.bmscopay.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('nulojix-copay', 'copay', 'Nulojix Co-Pay Assistance', 'https://www.bmscopay.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('pfizer-copay', 'copay', 'Pfizer Savings Program', 'https://www.pfizerrxpathways.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('sanofi-copay', 'copay', 'Sanofi Patient Connection - Copay Card', 'https://www.sanofipatientconnection.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('gilead-copay', 'copay', 'Gilead Advancing Access - Copay Card', 'https://www.gileadadvancingaccess.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('merck-copay', 'copay', 'Merck Patient Assistance - Copay Card', 'https://www.merckhelps.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('jardiance-copay', 'copay', 'Jardiance Savings Card', 'https://www.jardiance.com/savings/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('farxiga-copay', 'copay', 'Farxiga Savings Card', 'https://www.farxiga.com/savings-and-support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('entresto-copay', 'copay', 'Entresto Savings Card', 'https://www.entresto.com/savings-and-support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('xarelto-copay', 'copay', 'Xarelto Savings Program', 'https://www.xarelto-us.com/savings', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('eliquis-copay', 'copay', 'Eliquis Savings Card', 'https://www.bmscopay.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('dupixent-copay', 'copay', 'Dupixent MyWay Copay Card', 'https://www.dupixent.com/support-savings/dupixent-my-way', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('simulect-copay', 'copay', 'Simulect Copay Card', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('thymoglobulin-copay', 'copay', 'Thymoglobulin CoPay Card', 'https://www.thymoglobulin.com/resources', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('januvia-copay', 'copay', 'Januvia Savings Card', 'https://www.januvia.com/savings-and-resources/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('ozempic-copay', 'copay', 'Ozempic Savings Card', 'https://www.ozempic.com/savings-and-resources/save-on-ozempic.html', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('trulicity-copay', 'copay', 'Trulicity Savings Card', 'https://www.trulicity.com/savings-resources/savings-card', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('opsumit-copay', 'copay', 'Opsumit Co-Pay Program', 'https://www.opsumit.com/support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('adempas-copay', 'copay', 'Adempas Co-Pay Program', 'https://www.adempas-us.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('uptravi-copay', 'copay', 'Uptravi Co-Pay Program', 'https://www.uptravi.com/support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('tyvaso-copay', 'copay', 'Tyvaso Co-Pay Assistance', 'https://unitedtherapeuticscares.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('spiriva-copay', 'copay', 'Spiriva Savings Card', 'https://www.spiriva.com/copd-resources/savings', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('breo-copay', 'copay', 'Breo Ellipta Savings Offer', 'https://www.breoellipta.com/savings/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('nucala-copay', 'copay', 'Nucala Copay Program', 'https://www.nucala.com/severe-eosinophilic-asthma/nucala-costs/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('fasenra-copay', 'copay', 'Fasenra Copay Card', 'https://www.fasenra.com/savings-and-support/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('tezspire-copay', 'copay', 'Tezspire Copay Program', 'https://www.tezspire.com/savings/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('xolair-copay', 'copay', 'Xolair Co-pay Program', 'https://www.xolair.com/allergic-asthma/financial-support.html', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('anoro-copay', 'copay', 'Anoro Ellipta Savings Offer', 'https://www.anoro.com/savings-and-support/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('dulera-copay', 'copay', 'Dulera Savings Card', 'https://www.organonhelps.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('envarsus-copay', 'copay', 'Envarsus XR Savings Program', 'https://www.envarsusxr.com/savings/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('mavyret-copay', 'copay', 'Mavyret Savings Card', 'https://www.mavyret.com/savings', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('creon-copay', 'copay', 'Creon Savings Card', 'https://www.creoninfo.com/savings/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('auryxia-copay', 'copay', 'Auryxia Co-Pay Assistance', 'https://www.akebiacares.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('rezdiffra-copay', 'copay', 'Rezdiffra Copay Card', 'https://madrigalpatientsupport.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('symbicort-copay', 'copay', 'Symbicort Savings Card', 'https://www.symbicort.com/savings-and-support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('advair-copay', 'copay', 'Advair Savings Offer', 'https://www.advair.com/savings-and-support/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('lantus-copay', 'copay', 'Lantus Savings Card', 'https://www.lantus.com/sign-up-for-savings', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('humalog-copay', 'copay', 'Humalog Savings Card', 'https://www.humalog.com/savings-support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('novolog-copay', 'copay', 'NovoLog Savings Card', 'https://www.novolog.com/savings-card', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('lyrica-copay', 'copay', 'Lyrica Savings Card', 'https://www.lyrica.com/savings', true)
ON CONFLICT (program_id) DO NOTHING;

-- ============================================
-- PATIENT ASSISTANCE PROGRAMS (from programs.json)
-- ============================================

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('astellas-pap', 'pap', 'Astellas Patient Assistance Program', 'https://www.astellaspharmasupportsolutions.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('novartis-pap', 'pap', 'Novartis Patient Assistance Foundation', 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('genentech-pap', 'pap', 'Genentech Patient Foundation', 'https://www.genentech-access.com/patient.html', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('bms-pap', 'pap', 'Bristol Myers Squibb Patient Assistance Foundation', 'https://www.bmspaf.org/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('pfizer-pap', 'pap', 'Pfizer RxPathways', 'https://www.pfizerrxpathways.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('sanofi-pap', 'pap', 'Sanofi Patient Connection', 'https://www.sanofipatientconnection.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('gilead-pap', 'pap', 'Gilead Advancing Access', 'https://www.gileadadvancingaccess.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('merck-pap', 'pap', 'Merck Patient Assistance Program', 'https://www.merckhelps.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('abbvie-pap', 'pap', 'AbbVie Patient Assistance Foundation', 'https://www.abbvie.com/patients/patient-assistance.html', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('lilly-pap', 'pap', 'Lilly Cares Foundation', 'https://www.lillycares.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('boehringer-pap', 'pap', 'Boehringer Ingelheim Cares Foundation', 'https://www.boehringer-ingelheim.com/us/patient-assistance', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('astrazeneca-pap', 'pap', 'AZ&Me Prescription Savings Program', 'https://www.azandmeapp.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('janssen-pap', 'pap', 'J&J Patient Assistance Foundation', 'https://www.jnjwithme.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('novo-nordisk-pap', 'pap', 'NovoCare Patient Assistance Program', 'https://www.novocare.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('takeda-pap', 'pap', 'Takeda Patient Assistance Program', 'https://www.takeda.com/en-us/what-we-do/patient-services/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('gsk-pap', 'pap', 'GSK For You', 'https://www.gskforyou.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('alexion-pap', 'pap', 'Alexion OneSource', 'https://alexiononesource.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('madrigal-pap', 'pap', 'Madrigal Patient Support', 'https://madrigalpatientsupport.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('united-therapeutics-pap', 'pap', 'United Therapeutics Cares', 'https://unitedtherapeuticscares.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('amgen-pap', 'pap', 'Amgen Safety Net Foundation', 'https://www.amgensupportplus.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('akebia-pap', 'pap', 'AkebiaCares', 'https://www.akebiacares.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('bausch-pap', 'pap', 'Bausch Health Patient Assistance', 'https://www.bauschhealthpap.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('organon-pap', 'pap', 'Organon Helps', 'https://www.organonhelps.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('sunovion-pap', 'pap', 'Sunovion Patient Assistance', 'https://www.sunovion.com/patient-support', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('teva-pap', 'pap', 'Teva Cares Foundation', 'https://www.tevacares.org/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('grifols-pap', 'pap', 'Grifols Patient Care Programs', 'https://www.grifols.com/en/supporting-patients', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('vifor-pap', 'pap', 'CSL Vifor Patient Support', 'https://www.csl.com/patients-public-health/patient-support-and-organizations/csl-vifor-managed-access-programs', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('american-regent-pap', 'pap', 'American Regent Patient Assistance', 'https://www.venofer.com/venaccess', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('bayer-pap', 'pap', 'Bayer Patient Assistance Foundation', 'https://www.bayer.com/en/pharma/patients', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('regeneron-pap', 'pap', 'Regeneron Patient Assistance', 'https://www.dupixent.com/support-savings/dupixent-my-way', true)
ON CONFLICT (program_id) DO NOTHING;

-- ============================================
-- FOUNDATION PROGRAMS (for hardcoded links)
-- ============================================

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('healthwell-general', 'foundation', 'HealthWell Foundation', 'https://www.healthwellfoundation.org/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('pan-general', 'foundation', 'PAN Foundation', 'https://www.panfoundation.org/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('pan-fundfinder', 'foundation', 'PAN Foundation FundFinder', 'https://fundfinder.panfoundation.org/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('paf-general', 'foundation', 'Patient Advocate Foundation', 'https://www.patientadvocate.org/', true)
ON CONFLICT (program_id) DO NOTHING;

-- ============================================
-- UTILITY / SEARCH TOOLS (for hardcoded links)
-- ============================================

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('phrma-mat', 'pap', 'PhRMA Medicine Assistance Tool', 'https://www.medicineassistancetool.org/', true)
ON CONFLICT (program_id) DO NOTHING;
