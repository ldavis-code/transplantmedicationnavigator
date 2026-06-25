-- Migration 036: Normalize GoodRx / SingleCare / Cost Plus URLs to homepages
--
-- Per-medication deep links (e.g. https://www.goodrx.com/tenofovir-alafenamide)
-- frequently 404 or redirect oddly. Replace any per-drug URL on these three
-- services with the service homepage so users land on a working page and can
-- search from there.

UPDATE savings_programs
SET application_url = 'https://www.goodrx.com/'
WHERE application_url LIKE 'https://www.goodrx.com/%'
  AND application_url <> 'https://www.goodrx.com/';

UPDATE savings_programs
SET application_url = 'https://www.singlecare.com/'
WHERE application_url LIKE 'https://www.singlecare.com/%'
  AND application_url <> 'https://www.singlecare.com/';

UPDATE savings_programs
SET application_url = 'https://costplusdrugs.com/'
WHERE application_url LIKE 'https://costplusdrugs.com/%'
  AND application_url <> 'https://costplusdrugs.com/';
