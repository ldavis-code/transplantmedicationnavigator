-- Fix events table: allow NULL for program_type and program_id
-- These columns were NOT NULL but page_view, quiz, and search events don't have program data

ALTER TABLE events ALTER COLUMN program_type DROP NOT NULL;
ALTER TABLE events ALTER COLUMN program_id DROP NOT NULL;
