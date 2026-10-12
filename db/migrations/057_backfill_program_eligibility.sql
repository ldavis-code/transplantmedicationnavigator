-- Migration 057: backfill eligibility flags from src/data/programs.json
--
-- PROPOSED — NOT YET RUN. Run only after 056, and only with approval.
--
-- Copies the eligibility values already curated in programs.json into the
-- new columns. Nothing is guessed:
--   - Programs with no eligibility block in programs.json stay NULL (unknown).
--   - excludes_extra_help, requires_medicaid_denial, eligibility_verified_date
--     and eligibility_source_url are left NULL for Lorrinda to fill in.
--   - Price-search / discount entries (goodrx-search, singlecare-search,
--     costplus-search, drugs-com-search, trumprx-gov) are not copay cards or
--     PAPs and are left NULL; see reports/medication-data-review.md.
-- Generated from programs.json on 2026-10-12.

BEGIN;
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'astellas-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'novartis-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'zortress-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'genentech-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'bms-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'nulojix-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'pfizer-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'sanofi-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'gilead-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'merck-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'jardiance-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'farxiga-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'entresto-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'xarelto-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'eliquis-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'dupixent-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'simulect-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'thymoglobulin-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'januvia-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'ozempic-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'trulicity-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'opsumit-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'adempas-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'uptravi-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'tyvaso-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'spiriva-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'breo-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'nucala-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'fasenra-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'tezspire-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'xolair-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'anoro-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'dulera-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'envarsus-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'mavyret-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'creon-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'auryxia-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'rezdiffra-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'symbicort-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'advair-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'lantus-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'humalog-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'novolog-copay';
UPDATE programs SET accepts_commercial = true, accepts_medicare = false, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'lyrica-copay';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'astellas-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = NULL, accepts_medicaid = NULL, accepts_uninsured = true WHERE program_id = 'veloxis-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'novartis-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'genentech-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'bms-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'pfizer-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'sanofi-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'gilead-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'merck-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'abbvie-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'lilly-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'boehringer-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'astrazeneca-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'janssen-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'novo-nordisk-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'takeda-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'gsk-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'alexion-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'madrigal-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'united-therapeutics-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'amgen-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'akebia-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'bausch-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'organon-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'sunovion-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'teva-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'grifols-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'vifor-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'american-regent-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'bayer-pap';
UPDATE programs SET accepts_commercial = false, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'regeneron-pap';
UPDATE programs SET accepts_commercial = true, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'healthwell';
UPDATE programs SET accepts_commercial = true, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'totalassist';
UPDATE programs SET accepts_commercial = true, accepts_medicare = true, accepts_medicaid = true, accepts_uninsured = true WHERE program_id = 'american-kidney-fund';
UPDATE programs SET accepts_commercial = true, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = true WHERE program_id = 'nord';
UPDATE programs SET accepts_commercial = true, accepts_medicare = true, accepts_medicaid = false, accepts_uninsured = false WHERE program_id = 'accessia-health';
COMMIT;

-- Programs in programs.json that have no row in the programs table (the
-- UPDATEs above do nothing for them). Review before relying on Neon.
SELECT j.program_id FROM (VALUES ('astellas-copay'), ('novartis-copay'), ('zortress-copay'), ('genentech-copay'), ('bms-copay'), ('nulojix-copay'), ('pfizer-copay'), ('sanofi-copay'), ('gilead-copay'), ('merck-copay'), ('jardiance-copay'), ('farxiga-copay'), ('entresto-copay'), ('xarelto-copay'), ('eliquis-copay'), ('dupixent-copay'), ('simulect-copay'), ('thymoglobulin-copay'), ('januvia-copay'), ('ozempic-copay'), ('trulicity-copay'), ('opsumit-copay'), ('adempas-copay'), ('uptravi-copay'), ('tyvaso-copay'), ('spiriva-copay'), ('breo-copay'), ('nucala-copay'), ('fasenra-copay'), ('tezspire-copay'), ('xolair-copay'), ('anoro-copay'), ('dulera-copay'), ('envarsus-copay'), ('mavyret-copay'), ('creon-copay'), ('auryxia-copay'), ('rezdiffra-copay'), ('symbicort-copay'), ('advair-copay'), ('lantus-copay'), ('humalog-copay'), ('novolog-copay'), ('lyrica-copay'), ('goodrx-search'), ('singlecare-search'), ('costplus-search'), ('prevymis-copay'), ('livtencity-copay'), ('cresemba-copay'), ('vemlidy-copay'), ('epclusa-copay'), ('xifaxan-copay'), ('astellas-pap'), ('veloxis-pap'), ('novartis-pap'), ('genentech-pap'), ('bms-pap'), ('pfizer-pap'), ('sanofi-pap'), ('gilead-pap'), ('merck-pap'), ('abbvie-pap'), ('lilly-pap'), ('boehringer-pap'), ('astrazeneca-pap'), ('janssen-pap'), ('novo-nordisk-pap'), ('takeda-pap'), ('gsk-pap'), ('alexion-pap'), ('madrigal-pap'), ('united-therapeutics-pap'), ('amgen-pap'), ('akebia-pap'), ('bausch-pap'), ('organon-pap'), ('sunovion-pap'), ('teva-pap'), ('grifols-pap'), ('vifor-pap'), ('american-regent-pap'), ('bayer-pap'), ('regeneron-pap'), ('drugs-com-search'), ('trumprx-gov'), ('abbvie-creon-pap'), ('boehringer-ingelheim-pap'), ('bayer-adempas-pap'), ('american-regent-venofer-pap'), ('amag-feraheme-pap'), ('dsi-pap'), ('akebia-auryxia-pap'), ('takeda-gammagard-pap'), ('sanofi-dupixent-pap'), ('healthwell'), ('totalassist'), ('american-kidney-fund'), ('nord'), ('accessia-health')) AS j(program_id)
LEFT JOIN programs p ON p.program_id = j.program_id
WHERE p.program_id IS NULL;
