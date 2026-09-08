-- Envarsus XR: restore a patient assistance program, pointed at the right place
--
-- Migration 046 removed the Envarsus XR PAP because its pap_url was the copay
-- card page and a phone check with Veloxis came back "no PAP". Two sources now
-- document one: the Veloxis HCP site (envarsusxr.com/hcp/resources/savings-
-- support) lists a "Patient Assistance Program ... to provide ENVARSUS XR at no
-- cost to eligible patients who meet certain criteria" (enroll at
-- veloxistransplantsupport.com, 1-844-VELOXIS), and the AST TxPharm COP
-- "Transplant Medication Access: A Patient's Guide" (June 2026) lists Envarsus
-- XR with "30-Day Trial Voucher, Copay Card, Bridge Program, Patient
-- Assistance". So the row gets a PAP again, but as its own program
-- ('veloxis-pap') with the Veloxis Transplant Support URL — not the copay page
-- that 046 correctly removed.
--
-- The same pass fixed the Envarsus copay row: envarsusxr.com/savings/ now 301s
-- to an HCP-only page, so the redirect target becomes the patient page
-- (/savings-support). out-redirect.js prefers programs.official_url over
-- programs.json, so the DB row has to change too or /out/ keeps sending
-- patients to the HCP page.
--
-- Must be applied alongside the matching src/data/medications.json and
-- src/data/programs.json changes: MedicationsContext merges DB over JSON with
-- `papUrl: dbMed.papUrl || fallbackMed.papUrl`, so a NULL here would be
-- refilled by the JSON and vice versa — both sides must agree.
--
-- Idempotent: every statement is guarded (IS DISTINCT FROM / ON CONFLICT), so
-- a re-run is a no-op.

UPDATE medications
   SET pap_url = 'https://veloxistransplantsupport.com/',
       pap_program_id = 'veloxis-pap'
 WHERE id = 'envarsus-xr'
   AND (pap_url IS DISTINCT FROM 'https://veloxistransplantsupport.com/'
        OR pap_program_id IS DISTINCT FROM 'veloxis-pap');

INSERT INTO programs (program_id, program_type, name, official_url, active)
VALUES ('veloxis-pap', 'pap', 'Veloxis Patient Assistance Program', 'https://veloxistransplantsupport.com/', true)
ON CONFLICT (program_id) DO NOTHING;

UPDATE programs
   SET official_url = 'https://www.envarsusxr.com/savings-support'
 WHERE program_id = 'envarsus-copay'
   AND official_url IS DISTINCT FROM 'https://www.envarsusxr.com/savings-support';
