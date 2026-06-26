-- Supportive pre-transplant medications (Heart/Kidney/Liver).
-- Idempotent: re-running updates rather than duplicating.
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
