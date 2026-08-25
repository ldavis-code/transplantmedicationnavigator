-- Envarsus XR has no patient assistance program
--
-- Verified by phone with Veloxis: there is no PAP for Envarsus XR. The row's
-- pap_url pointed at https://www.envarsusxr.com/savings-support — the same URL
-- as its copay link, which is a copay-card page, not a free-medication
-- program. So the wizard and the medication card offered a PAP badged "free if
-- eligible" and sent Medicare, Medicaid, and uninsured patients — the people a
-- PAP exists for and a copay card excludes — to a page that cannot help them.
--
-- Its copay side is real and unaffected (copay_program_id = 'envarsus-copay').
-- With no PAP the UI degrades correctly: the card's PAP section hides, the
-- wizard drops the row, and the medication page falls back to "ask your
-- transplant team about manufacturer or foundation options" — the same as
-- every other medication with no PAP. Foundation grants remain reachable.
--
-- Must be applied alongside the matching src/data/medications.json change, not
-- instead of it: MedicationsContext merges the two with
-- `papUrl: dbMed.papUrl || fallbackMed.papUrl`, so a null on one side alone is
-- refilled by the other and the bad link survives.
--
-- Idempotent: the NOT NULL guard makes a re-run a no-op, and because the
-- runner records a migration id as applied exactly once, a PAP added later
-- (should Veloxis start one) will not be clobbered by this.

UPDATE medications
   SET pap_url = NULL, pap_program_id = NULL
 WHERE id = 'envarsus-xr'
   AND (pap_url IS NOT NULL OR pap_program_id IS NOT NULL);
