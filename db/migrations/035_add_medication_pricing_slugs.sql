-- Migration 035: Add pricing deep-link slug fields to medications
--
-- These columns let us override the default URL builders in
-- src/components/PricingLinks.jsx with a known-good slug per pharmacy site.
-- All three are nullable: when null, the component falls back to deriving
-- the URL from generic_name (and, for Cost Plus, strength + dosage_form).

ALTER TABLE medications
    ADD COLUMN IF NOT EXISTS cost_plus_slug  TEXT,
    ADD COLUMN IF NOT EXISTS goodrx_slug     TEXT,
    ADD COLUMN IF NOT EXISTS singlecare_slug TEXT;
