-- Migration 028: Add discount card and search redirect programs
-- These programs use {query} URL templates for dynamic search redirects
-- via the /out/ redirect tracker (out-redirect.js).
-- Tracking is anonymous and aggregate only — no user IDs, emails, or IPs are logged.

-- ============================================
-- COPAY / DISCOUNT CARD PROGRAMS
-- ============================================

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('goodrx-search', 'copay', 'GoodRx', 'https://www.goodrx.com/search?s={query}', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('singlecare-search', 'copay', 'SingleCare', 'https://www.singlecare.com/search?search={query}', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('costplus-search', 'copay', 'Cost Plus Drugs', 'https://costplusdrugs.com/medications/?query={query}', true)
ON CONFLICT (program_id) DO NOTHING;

-- ============================================
-- PAP / SEARCH PROGRAMS
-- ============================================

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('drugs-com-search', 'pap', 'Drugs.com', 'https://www.drugs.com/search.php?searchterm={query}', true)
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('trumprx-gov', 'pap', 'TrumpRx.gov', 'https://trumprx.gov', true)
ON CONFLICT (program_id) DO NOTHING;
