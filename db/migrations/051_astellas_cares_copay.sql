-- Prograf / Astagraf XL copay card: move to Astellas Cares
--
-- Both brand rows carried copay links that now land on "not found" pages
-- (prograf.com/savings-information and astagrafxl.com/savings-info each 302
-- to an error route), and their copay_program_ids ('prograf-copay',
-- 'astagraf-copay') exist only in the programs redirect table — programs.json
-- never had them, so the card fell back to the dead raw URL. Astellas now
-- hosts the Prograf / Astagraf XL Copay Card Program on astellascares.com
-- (terms on every page: "annual savings up to $3000 for PROGRAF or ASTAGRAF
-- XL", commercial coverage required, not valid under Medicare/Medicaid/other
-- government plans, Prograf offer void in CA and not open to MA residents,
-- 12-month enrollment).
--
-- programs.json's 'astellas-copay' becomes that one shared card (it was a
-- catch-all for "tacrolimus" with the generic support-solutions URL), and both
-- medications point at it. The legacy 'prograf-copay' / 'astagraf-copay'
-- redirect rows keep their ids — event history references them — but their
-- official_url moves too, so any old /out/ link lands on the live page.
-- savings_programs (the chatbot's source) carried the dead Prograf URL in two
-- rows; same fix.
--
-- Must be applied alongside the matching src/data/medications.json and
-- src/data/programs.json changes: MedicationsContext merges DB over JSON with
-- `copayUrl: dbMed.copayUrl || fallbackMed.copayUrl`, so the DB side wins
-- whenever it is non-null.
--
-- Idempotent: every statement is guarded (IS DISTINCT FROM / IN-list of the
-- stale values), so a re-run is a no-op.

UPDATE medications
   SET copay_url = 'https://astellascares.com/',
       copay_program_id = 'astellas-copay'
 WHERE id IN ('prograf', 'astagraf-xl')
   AND (copay_url IS DISTINCT FROM 'https://astellascares.com/'
        OR copay_program_id IS DISTINCT FROM 'astellas-copay');

UPDATE programs
   SET name = 'Astellas Cares Copay Card',
       official_url = 'https://astellascares.com/'
 WHERE program_id = 'astellas-copay'
   AND (name IS DISTINCT FROM 'Astellas Cares Copay Card'
        OR official_url IS DISTINCT FROM 'https://astellascares.com/');

UPDATE programs
   SET official_url = 'https://astellascares.com/'
 WHERE program_id IN ('prograf-copay', 'astagraf-copay')
   AND official_url IS DISTINCT FROM 'https://astellascares.com/';

UPDATE savings_programs
   SET application_url = 'https://astellascares.com/'
 WHERE application_url IN ('https://www.prograf.com/savings-information',
                           'https://www.astagrafxl.com/savings-info');
