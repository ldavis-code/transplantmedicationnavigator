-- Backfill events.program_type for client-tracked program clicks
--
-- Two paths write program clicks. The /out/ redirect (out-redirect.js) fills
-- program_type from the URL. The client helper (trackServerEvent) only ever
-- sent programId in meta, and event.js read program_type from meta alone — so
-- every click tracked from a medication card or the wizard results landed with
-- program_type NULL.
--
-- The reporting dashboard groups and filters on that column
-- (admin-api.js getEventsByProgram), so those rows showed a blank type, split
-- a single program into two rows when it was also reached via /out/, and
-- dropped out entirely whenever someone filtered by program type.
--
-- event.js now derives the type from the event name for new rows. This repairs
-- the existing ones with the same mapping. Nothing is recovered or guessed:
-- the event name already carries the type, one name per type.
--
-- Idempotent by construction — the NULL guard means a re-run is a no-op, so a
-- partial failure can safely re-run on the next scheduled pass.

UPDATE events SET program_type = 'copay'
 WHERE program_type IS NULL AND event_name = 'copay_card_click';

UPDATE events SET program_type = 'pap'
 WHERE program_type IS NULL AND event_name = 'pap_click';

UPDATE events SET program_type = 'foundation'
 WHERE program_type IS NULL AND event_name = 'foundation_click';
