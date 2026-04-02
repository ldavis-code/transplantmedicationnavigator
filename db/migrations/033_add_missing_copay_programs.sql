-- Migration 033: Add missing copay programs to the programs table
-- These 5 copay program IDs are referenced by medications but were never
-- inserted into the programs table, causing /out/ redirects to fall back
-- to JSON or 404.

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('prevymis-copay', 'copay', 'Merck Helps - Prevymis Copay Assistance', 'https://www.merckhelps.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('livtencity-copay', 'copay', 'Takeda Patient Services - Livtencity Copay', 'https://www.takeda.com/en-us/what-we-do/patient-services/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('cresemba-copay', 'copay', 'Astellas Patient Support - Cresemba Copay', 'https://www.astellaspharmasupportsolutions.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('vemlidy-copay', 'copay', 'Gilead Advancing Access - Vemlidy Copay', 'https://www.gileadadvancingaccess.com/', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('epclusa-copay', 'copay', 'Gilead Advancing Access - Epclusa Copay', 'https://www.gileadadvancingaccess.com/', true)
ON CONFLICT (program_id) DO NOTHING;
