-- Language Tracking for Events
-- Adds a lang column so English vs Spanish usage can be reported separately.
-- The UI language ('en' or 'es') is captured at event time from the app's
-- i18next selection. Rows created before this migration have NULL lang.

ALTER TABLE events ADD COLUMN IF NOT EXISTS lang TEXT;

-- For language breakdown queries
CREATE INDEX IF NOT EXISTS idx_events_lang ON events(lang);
