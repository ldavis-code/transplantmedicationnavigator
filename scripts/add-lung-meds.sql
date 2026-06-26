-- Lung / PAH medications for the Neon database.
-- Part 1: enrich the three rows that already exist (matched by brand_name).
--         Their id (UUID) and stage are left as-is to avoid duplicates.

UPDATE medications SET
  brand_name = 'Esbriet',
  generic_name = 'Pirfenidone',
  rxcui = '1373424',
  category = 'Pulmonary Fibrosis',
  manufacturer = 'Genentech',
  common_organs = ARRAY['Lung'],
  cost_tier = 'high',
  generic_available = true,
  typical_copay_tier = 'Specialty',
  copay_url = 'https://www.esbriet.com/financial-support.html',
  copay_program_id = 'genentech-copay',
  pap_url = 'https://www.genentech-access.com/',
  pap_program_id = 'genentech-pap'
WHERE brand_name = 'Esbriet';

UPDATE medications SET
  brand_name = 'Ofev',
  generic_name = 'Nintedanib',
  rxcui = '1599538',
  category = 'Pulmonary Fibrosis',
  manufacturer = 'Boehringer Ingelheim',
  common_organs = ARRAY['Lung'],
  cost_tier = 'high',
  generic_available = false,
  typical_copay_tier = 'Specialty',
  copay_url = 'https://www.ofev.com/financial-support',
  copay_program_id = 'boehringer-copay',
  pap_url = 'https://www.bicares.com/',
  pap_program_id = 'boehringer-pap'
WHERE brand_name = 'Ofev';

UPDATE medications SET
  brand_name = 'Ventavis',
  generic_name = 'Iloprost',
  rxcui = '54409',
  category = 'Pulmonary Hypertension',
  manufacturer = 'Actelion/Janssen',
  common_organs = ARRAY['Lung','Heart'],
  cost_tier = 'high',
  generic_available = false,
  typical_copay_tier = 'Specialty',
  copay_url = 'https://www.jnjwithme.com/',
  copay_program_id = 'janssen-copay',
  pap_url = 'https://www.jnjwithme.com/',
  pap_program_id = 'janssen-pap'
WHERE brand_name = 'Ventavis';

-- Part 2: insert the medications not in the DB yet (stage uses your short codes).
-- Idempotent: re-running updates the row instead of duplicating it.
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
