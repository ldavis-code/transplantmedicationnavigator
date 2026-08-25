-- Bucket program clicks that carry no program id under 'unlisted'
--
-- A medication can link straight to a manufacturer URL without naming one of
-- the catalogued programs (programs.json), in which case the click was tracked
-- with programId null. getEventsByProgram filters on program_id IS NOT NULL,
-- so those clicks didn't just lose their attribution — they disappeared from
-- the Programs dashboard entirely, while still counting on the Events page.
--
-- event.js now stores 'unlisted' for new rows. This applies the same bucket to
-- existing ones. The click itself is unchanged; meta_json still records which
-- medication it was, so a bucket row can always be traced back.
--
-- Deliberately separate from 044 rather than appended to it: 044 is already
-- committed, and the runner records a migration id as applied exactly once, so
-- statements added to it after it runs anywhere would be skipped in silence.
--
-- Depends on 044 having set program_type first — the guard below keys off it,
-- and the runner applies migrations in registry order, stopping at the first
-- failure. Idempotent: the NULL guard makes a re-run a no-op.

UPDATE events SET program_id = 'unlisted'
 WHERE program_id IS NULL AND program_type IS NOT NULL;
