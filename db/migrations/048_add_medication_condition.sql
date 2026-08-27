-- Add a normalized `condition` to medications, and collapse duplicate
-- category names.
--
-- `category` answers "what class of drug is this" and grew organically into a
-- mix of drug classes ('NSAID', 'Diuretic', 'Inhaled Corticosteroid') and
-- conditions ('Diabetes', 'Cystic Fibrosis'), with synonyms sitting alongside
-- each other: 'Pain Relief' and 'Pain Management' were two groups holding
-- three opioids between them, and sevelamer appeared in both 'Kidney Support'
-- (as Renvela) and 'Phosphate Binder (ESRD)'. Nothing in the table answered
-- the question patients actually ask -- what is this medication for -- so
-- there was no way to browse or filter the catalogue by condition.
--
-- This adds that column, backfilled from src/data/conditions.json, which is
-- the single source for the taxonomy. `category` keeps its meaning as the
-- drug class and still drives the display label (medications.categories.*),
-- the related-medications rail and the price-estimate defaults.
--
-- The category UPDATEs are of two kinds: the first four merge the duplicate
-- names above; the rest apply the site's singular vocabulary
-- ('Immunosuppressant', not 'Immunosuppressants') to rows that carried the
-- database's own plural spelling. scripts/sync-medications-json.js has always
-- translated those on read, so this changes no rendered text -- it just stops
-- the two sides disagreeing about what the row says.
--
-- The column is quoted throughout: CONDITION is a reserved word in the SQL
-- standard, and quoting keeps this working regardless of how a future
-- PostgreSQL release classifies it.
--
-- Must be applied alongside the matching src/data/medications.json change.
-- MedicationsContext merges DB over JSON, so rows left without a condition
-- would override the corrected JSON with nulls.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS, the category UPDATEs no longer match
-- once applied, and every condition UPDATE is guarded by IS DISTINCT FROM.

ALTER TABLE medications ADD COLUMN IF NOT EXISTS "condition" TEXT;

CREATE INDEX IF NOT EXISTS idx_medications_condition ON medications("condition");

-- ============================================
-- COLLAPSE DUPLICATE / LEGACY CATEGORY NAMES
-- ============================================

UPDATE medications SET category = 'Pain Management' WHERE category = 'Pain Relief';
UPDATE medications SET category = 'Anemia' WHERE category = 'Anemia (ESRD)';
UPDATE medications SET category = 'Kidney Support' WHERE category = 'Phosphate Binder (ESRD)';
UPDATE medications SET category = 'Asthma Biologic' WHERE category = 'Asthma Biologic / Allergy';
UPDATE medications SET category = 'Immunosuppressant' WHERE category = 'Immunosuppressants';
UPDATE medications SET category = 'Anti-viral' WHERE category = 'Antivirals';
UPDATE medications SET category = 'Anti-fungal' WHERE category = 'Antifungals';
UPDATE medications SET category = 'Steroid' WHERE category = 'Steroids';
UPDATE medications SET category = 'Diuretic' WHERE category = 'Diuretics';
UPDATE medications SET category = 'Induction' WHERE category = 'Induction Agents';
UPDATE medications SET category = 'Anticoagulant' WHERE category = 'Anticoagulation';

-- ============================================
-- BACKFILL CONDITION FROM CATEGORY
-- ============================================

UPDATE medications m
   SET "condition" = c.condition
  FROM (VALUES
    ('Immunosuppressant', 'rejection-prevention'),
    ('Induction', 'rejection-prevention'),
    ('Steroid', 'rejection-prevention'),
    ('Acute Rejection', 'rejection-treatment'),
    ('Antibody-Mediated Rejection', 'rejection-treatment'),
    ('Anti-viral', 'infection'),
    ('Anti-fungal', 'infection'),
    ('Antibiotic', 'infection'),
    ('Inhaled Antibiotic', 'infection'),
    ('Infection Prevention', 'infection'),
    ('Hepatitis B/C', 'hepatitis'),
    ('Liver Support', 'liver-disease'),
    ('Beta Blocker', 'liver-disease'),
    ('Kidney Support', 'kidney-disease'),
    ('Anemia', 'anemia'),
    ('Blood Support', 'low-white-cells'),
    ('Anticoagulant', 'blood-clots'),
    ('Antiplatelet', 'blood-clots'),
    ('Blood Pressure', 'high-blood-pressure'),
    ('Heart Failure', 'heart-failure'),
    ('Antiarrhythmic', 'heart-rhythm'),
    ('Cholesterol', 'high-cholesterol'),
    ('Diuretic', 'fluid-retention'),
    ('Pulmonary Hypertension', 'pulmonary-hypertension'),
    ('Respiratory', 'asthma-copd'),
    ('Bronchodilator', 'asthma-copd'),
    ('Inhaled Corticosteroid', 'asthma-copd'),
    ('Leukotriene Modifier', 'asthma-copd'),
    ('Asthma Biologic', 'asthma-copd'),
    ('Mast Cell Stabilizer', 'asthma-copd'),
    ('Cystic Fibrosis', 'cystic-fibrosis'),
    ('Mucolytic', 'cystic-fibrosis'),
    ('Pulmonary Fibrosis', 'pulmonary-fibrosis'),
    ('Antihistamine', 'allergies'),
    ('Nasal Corticosteroid', 'allergies'),
    ('Nasal Antihistamine', 'allergies'),
    ('Diabetes', 'diabetes'),
    ('Thyroid', 'thyroid'),
    ('Gout', 'gout'),
    ('GI / Acid Suppression', 'acid-reflux'),
    ('GI Support', 'digestive'),
    ('Antiemetic', 'digestive'),
    ('Enzymes', 'pancreatic-insufficiency'),
    ('Pain Management', 'pain'),
    ('NSAID', 'pain'),
    ('Mental Health', 'mental-health'),
    ('Antipsychotic', 'mental-health'),
    ('Vitamin', 'nutrition'),
    ('Supplement', 'nutrition'),
    ('Electrolyte', 'electrolytes')
       ) AS c(category, condition)
 WHERE m.category = c.category
   AND m.id NOT IN ('ferrous-sulfate', 'hydrochlorothiazide', 'chlorthalidone')
   AND m."condition" IS DISTINCT FROM c.condition;

-- ============================================
-- PER-MEDICATION OVERRIDES
-- ============================================
-- Drugs whose class does not imply their use in this catalogue.

UPDATE medications SET "condition" = 'anemia' WHERE id = 'ferrous-sulfate' AND "condition" IS DISTINCT FROM 'anemia';
UPDATE medications SET "condition" = 'high-blood-pressure' WHERE id = 'hydrochlorothiazide' AND "condition" IS DISTINCT FROM 'high-blood-pressure';
UPDATE medications SET "condition" = 'high-blood-pressure' WHERE id = 'chlorthalidone' AND "condition" IS DISTINCT FROM 'high-blood-pressure';
