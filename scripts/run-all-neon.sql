-- ============================================================
-- Transplant Medication Navigator: one-shot Neon update.
-- Safe to run more than once (idempotent). Paste the whole
-- thing into the Neon SQL Editor and click Run.
-- ============================================================

-- 1) Tracking table for medications we don't have yet.
CREATE TABLE IF NOT EXISTS missing_medications (
    name_normalized text PRIMARY KEY,
    display_name    text NOT NULL,
    request_count   integer NOT NULL DEFAULT 0,
    first_seen      timestamptz NOT NULL DEFAULT now(),
    last_seen       timestamptz NOT NULL DEFAULT now()
);

-- 2) Supportive pre-transplant medications (Heart / Kidney / Liver).
INSERT INTO medications (
  id, brand_name, generic_name, rxcui, category, manufacturer, stage, common_organs, cost_tier, generic_available, typical_copay_tier, copay_url, copay_program_id, pap_url, pap_program_id
) VALUES
  ('amiodarone', 'Pacerone / Cordarone', 'Amiodarone', '703', 'Antiarrhythmic', 'Generic', 'both', ARRAY['Heart'], 'low', true, '1', NULL, NULL, NULL, NULL),
  ('eplerenone', 'Inspra', 'Eplerenone', '298869', 'Diuretic', 'Generic', 'both', ARRAY['Heart'], 'low', true, '1', NULL, NULL, NULL, NULL),
  ('bumetanide', 'Bumex', 'Bumetanide', '1808', 'Diuretic', 'Generic', 'both', ARRAY['Heart','Liver'], 'low', true, '1', NULL, NULL, NULL, NULL),
  ('nadolol', 'Corgard', 'Nadolol', '7226', 'Beta Blocker', 'Generic', 'both', ARRAY['Liver','Heart'], 'low', true, '1', NULL, NULL, NULL, NULL),
  ('sevelamer', 'Renvela / Renagel', 'Sevelamer', NULL, 'Phosphate Binder (ESRD)', 'Sanofi', 'pre', ARRAY['Kidney'], 'high', true, 'Specialty', 'https://www.sanofipatientconnection.com/', 'sanofi-copay', 'https://www.sanofipatientconnection.com/', 'sanofi-pap'),
  ('rifaximin', 'Xifaxan', 'Rifaximin', '35619', 'Liver Support', 'Salix (Bausch Health)', 'both', ARRAY['Liver'], 'high', false, 'Specialty', 'https://www.xifaxan.com/', 'salix-copay', 'https://www.bauschhealth.com/patient-resources/', 'bausch-pap')
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  generic_name = EXCLUDED.generic_name,
  rxcui = EXCLUDED.rxcui,
  category = EXCLUDED.category,
  manufacturer = EXCLUDED.manufacturer,
  stage = EXCLUDED.stage,
  common_organs = EXCLUDED.common_organs,
  cost_tier = EXCLUDED.cost_tier,
  generic_available = EXCLUDED.generic_available,
  typical_copay_tier = EXCLUDED.typical_copay_tier,
  copay_url = EXCLUDED.copay_url,
  copay_program_id = EXCLUDED.copay_program_id,
  pap_url = EXCLUDED.pap_url,
  pap_program_id = EXCLUDED.pap_program_id;

-- 3) Update the three lung rows that already exist (matched by name).
UPDATE medications SET
  generic_name = 'Pirfenidone', rxcui = '1373424', category = 'Pulmonary Fibrosis',
  manufacturer = 'Genentech', common_organs = ARRAY['Lung'], cost_tier = 'high',
  generic_available = true, typical_copay_tier = 'Specialty',
  copay_url = 'https://www.esbriet.com/financial-support.html', copay_program_id = 'genentech-copay',
  pap_url = 'https://www.genentech-access.com/', pap_program_id = 'genentech-pap'
WHERE brand_name = 'Esbriet';

UPDATE medications SET
  generic_name = 'Nintedanib', rxcui = '1599538', category = 'Pulmonary Fibrosis',
  manufacturer = 'Boehringer Ingelheim', common_organs = ARRAY['Lung'], cost_tier = 'high',
  generic_available = false, typical_copay_tier = 'Specialty',
  copay_url = 'https://www.ofev.com/financial-support', copay_program_id = 'boehringer-copay',
  pap_url = 'https://www.bicares.com/', pap_program_id = 'boehringer-pap'
WHERE brand_name = 'Ofev';

UPDATE medications SET
  generic_name = 'Iloprost', rxcui = '54409', category = 'Pulmonary Hypertension',
  manufacturer = 'Actelion/Janssen', common_organs = ARRAY['Lung','Heart'], cost_tier = 'high',
  generic_available = false, typical_copay_tier = 'Specialty',
  copay_url = 'https://www.jnjwithme.com/', copay_program_id = 'janssen-copay',
  pap_url = 'https://www.jnjwithme.com/', pap_program_id = 'janssen-pap'
WHERE brand_name = 'Ventavis';

-- 4) Insert the lung / PAH / CF medications not in the DB yet.
INSERT INTO medications (
  id, brand_name, generic_name, rxcui, category, manufacturer, stage, common_organs, cost_tier, generic_available, typical_copay_tier, copay_url, copay_program_id, pap_url, pap_program_id
) VALUES
  ('adcirca', 'Adcirca', 'Tadalafil', '358263', 'Pulmonary Hypertension', 'United Therapeutics', 'pre', ARRAY['Lung','Heart'], 'high', true, 'Specialty', 'https://unitedtherapeuticscares.com/', 'united-therapeutics-copay', 'https://unitedtherapeuticscares.com/', 'united-therapeutics-pap'),
  ('tyvaso', 'Tyvaso', 'Treprostinil (Inhaled)', '38663', 'Pulmonary Hypertension', 'United Therapeutics', 'pre', ARRAY['Lung','Heart'], 'high', false, 'Specialty', 'https://unitedtherapeuticscares.com/', 'united-therapeutics-copay', 'https://unitedtherapeuticscares.com/', 'united-therapeutics-pap'),
  ('orenitram', 'Orenitram', 'Treprostinil (Oral)', '38663', 'Pulmonary Hypertension', 'United Therapeutics', 'pre', ARRAY['Lung','Heart'], 'high', false, 'Specialty', 'https://unitedtherapeuticscares.com/', 'united-therapeutics-copay', 'https://unitedtherapeuticscares.com/', 'united-therapeutics-pap'),
  ('winrevair', 'Winrevair', 'Sotatercept', NULL, 'Pulmonary Hypertension', 'Merck', 'pre', ARRAY['Lung','Heart'], 'high', false, 'Specialty', 'https://www.merckaccessprogram-winrevair.com/', 'merck-copay', 'https://www.merckhelps.com/', 'merck-pap'),
  ('opsynvi', 'Opsynvi', 'Macitentan/Tadalafil', NULL, 'Pulmonary Hypertension', 'Actelion/Janssen', 'pre', ARRAY['Lung','Heart'], 'high', false, 'Specialty', 'https://www.jnjwithme.com/', 'janssen-copay', 'https://www.jnjwithme.com/', 'janssen-pap'),
  ('veletri', 'Veletri', 'Epoprostenol', '8814', 'Pulmonary Hypertension', 'Actelion/Janssen', 'pre', ARRAY['Lung','Heart'], 'high', true, 'Specialty', 'https://www.jnjwithme.com/', 'janssen-copay', 'https://www.jnjwithme.com/', 'janssen-pap'),
  ('trikafta', 'Trikafta', 'Elexacaftor/Tezacaftor/Ivacaftor', NULL, 'Cystic Fibrosis', 'Vertex', 'pre', ARRAY['Lung'], 'high', false, 'Specialty', 'https://www.vertexgps.com/', 'vertex-copay', 'https://www.vertexgps.com/', 'vertex-pap'),
  ('kalydeco', 'Kalydeco', 'Ivacaftor', '1243041', 'Cystic Fibrosis', 'Vertex', 'pre', ARRAY['Lung'], 'high', false, 'Specialty', 'https://www.vertexgps.com/', 'vertex-copay', 'https://www.vertexgps.com/', 'vertex-pap'),
  ('symdeko', 'Symdeko', 'Tezacaftor/Ivacaftor', NULL, 'Cystic Fibrosis', 'Vertex', 'pre', ARRAY['Lung'], 'high', false, 'Specialty', 'https://www.vertexgps.com/', 'vertex-copay', 'https://www.vertexgps.com/', 'vertex-pap'),
  ('orkambi', 'Orkambi', 'Lumacaftor/Ivacaftor', NULL, 'Cystic Fibrosis', 'Vertex', 'pre', ARRAY['Lung'], 'high', false, 'Specialty', 'https://www.vertexgps.com/', 'vertex-copay', 'https://www.vertexgps.com/', 'vertex-pap'),
  ('tobramycin-inhaled', 'TOBI / Bethkis / Kitabis Pak', 'Tobramycin Inhaled', '1248038', 'Inhaled Antibiotic', 'Generic', 'both', ARRAY['Lung'], 'high', true, 'Specialty', NULL, NULL, NULL, NULL),
  ('pulmozyme', 'Pulmozyme', 'Dornase Alfa', '3414', 'Mucolytic', 'Genentech', 'both', ARRAY['Lung'], 'high', false, 'Specialty', 'https://www.pulmozyme.com/', 'genentech-copay', 'https://www.genentech-access.com/', 'genentech-pap'),
  ('cayston', 'Cayston', 'Aztreonam Inhaled', '742627', 'Inhaled Antibiotic', 'Gilead', 'both', ARRAY['Lung'], 'high', false, 'Specialty', 'https://www.gileadadvancingaccess.com/', 'gilead-copay', 'https://www.gileadadvancingaccess.com/', 'gilead-pap')
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  generic_name = EXCLUDED.generic_name,
  rxcui = EXCLUDED.rxcui,
  category = EXCLUDED.category,
  manufacturer = EXCLUDED.manufacturer,
  stage = EXCLUDED.stage,
  common_organs = EXCLUDED.common_organs,
  cost_tier = EXCLUDED.cost_tier,
  generic_available = EXCLUDED.generic_available,
  typical_copay_tier = EXCLUDED.typical_copay_tier,
  copay_url = EXCLUDED.copay_url,
  copay_program_id = EXCLUDED.copay_program_id,
  pap_url = EXCLUDED.pap_url,
  pap_program_id = EXCLUDED.pap_program_id;
