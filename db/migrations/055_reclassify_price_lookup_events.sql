-- Migration 055: Reclassify price-lookup and drug-info clicks
--
-- The /out/ redirect logged every /out/copay/* and /out/pap/* hit as a
-- copay_card_click or pap_click, including the GoodRx, SingleCare, Cost Plus
-- Drugs, and TrumpRx price lookups and the Drugs.com "Drug facts" link that
-- sits on every medication card. Those are not assistance programs, and they
-- inflated "programs reached" and its copay/PAP split. out-redirect.js now
-- writes them as price_lookup_click / drug_info_click; this moves the rows
-- written before that. Guards make a re-run a no-op.

UPDATE events
SET event_name = 'price_lookup_click', program_type = 'price_lookup'
WHERE program_id IN ('goodrx-search', 'singlecare-search', 'costplus-search', 'trumprx-gov')
  AND event_name IN ('copay_card_click', 'pap_click');

UPDATE events
SET event_name = 'drug_info_click', program_type = 'drug_info'
WHERE program_id = 'drugs-com-search'
  AND event_name = 'pap_click';
