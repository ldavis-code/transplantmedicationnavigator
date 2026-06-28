-- Seed fhir_endpoint_directory from src/data/epic-endpoints.json
-- Idempotent: re-running skips endpoints whose iss_url already exists
-- (matched case- and trailing-slash-insensitively, like the runtime lookup).
-- Paste this whole file into the Neon SQL Editor and click Run.

INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eprescribing.accesscommunityhealth.net/FHIR/api/FHIR/R4', 'Access Community Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eprescribing.accesscommunityhealth.net/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1041.epichosted.com/FHIRProxy/api/FHIR/R4', 'Acumen Physician Solutions, LLC.'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1041.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://hygieia.bronsonhg.org/FHIRProxy/api/FHIR/R4', 'Adult & Pediatric Ear, Nose & Throat – Kalamazoo'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://hygieia.bronsonhg.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epwebapps.acpny.com/FHIRproxy/api/FHIR/R4', 'AdvantageCare Physicians'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epwebapps.acpny.com/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mobile.adventhealth.com/oauth2-PRD/api/FHIR/R4', 'AdventHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mobile.adventhealth.com/oauth2-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku-canto-prod.chmca.org/ARR-FHIR-PRD/api/FHIR/R4', 'Akron Children'''s Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku-canto-prod.chmca.org/ARR-FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1075.epichosted.com/FHIRProxy/api/FHIR/R4', 'Alameda Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1075.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1299.epichosted.com/FHIRProxy/api/FHIR/R4', 'Albany Med Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1299.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicprisfd.ahn.org/PRD-FHIR/api/FHIR/R4', 'Allegheny Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicprisfd.ahn.org/PRD-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://webproxy.allina.com/FHIR/api/FHIR/R4', 'Allina Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://webproxy.allina.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1138.epichosted.com/FHIRProxy/api/FHIR/R4', 'Altais'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1138.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1123.epichosted.com/FHIRProxy/api/FHIR/R4', 'AltaMed'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1123.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoap.altru.org/fhir/api/FHIR/R4', 'Altru Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoap.altru.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0971.epichosted.com/FHIRProxy/api/FHIR/R4', 'AnMed Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0971.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicmobile.luriechildrens.org/Interconnect-FHIRPRD/api/FHIR/R4', 'Ann & Robert H. Lurie Children'''s Hospital of Chicago'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicmobile.luriechildrens.org/Interconnect-FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.ardenthealth.com/fhir/api/FHIR/R4', 'Ardent'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.ardenthealth.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1036.epichosted.com/APIProxyPRD/api/FHIR/R4', 'Arkansas Children'''s'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1036.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1152.epichosted.com/fhirproxy/api/FHIR/R4', 'Arrowhead Regional Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1152.epichosted.com/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicmobile.asante.org/FHIR-PRD/api/FHIR/R4', 'Asante Health Systems'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicmobile.asante.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicmobile.presencehealth.org/fhirPRD/api/FHIR/R4', 'Ascension Illinois'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicmobile.presencehealth.org/fhirPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://stofo.providence-waco.org/FHIRProxy/api/FHIR/R4', 'Ascension Providence'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://stofo.providence-waco.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eprescribe.wfhc.org/FHIRproxy/api/FHIR/R4', 'Ascension Wisconsin'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eprescribe.wfhc.org/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1254.epichosted.com/FHIRProxy/api/FHIR/R4', 'Aspen Valley Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1254.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://erx.aspirus.org/FHIR/api/FHIR/R4', 'Aspirus'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://erx.aspirus.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapproxy.atlantichealth.org/FHIRPrd/api/FHIR/R4', 'Atlantic Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapproxy.atlantichealth.org/FHIRPrd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0905.epichosted.com/FHIRProxy/api/FHIR/R4', 'Atrium Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0905.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://w1soap.wakehealth.edu/fhirproxy/api/FHIR/R4', 'Atrium Health Wake Forest Baptist'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://w1soap.wakehealth.edu/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0905.epichosted.com/FHIRproxy/MHC/api/FHIR/R4', 'Atrium – Morehouse Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0905.epichosted.com/FHIRproxy/MHC/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://iatrius.atriushealth.org/FHIR/api/FHIR/R4', 'Atrius Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://iatrius.atriushealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0301.epichosted.com/FHIRProxyPRD/LiveWell/api/FHIR/R4', 'Aurora Health Care - LiveWell'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0301.epichosted.com/FHIRProxyPRD/LiveWell/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mobileprod.arcmd.com/FHIR/api/FHIR/R4', 'Austin Regional Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mobileprod.arcmd.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soap.wellmont.org/FHIRPRD/api/FHIR/R4', 'Ballad Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soap.wellmont.org/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://api.baptist-health.org/Interconnect-FHIR/api/FHIR/R4', 'Baptist Health (Arkansas)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://api.baptist-health.org/Interconnect-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1206.epichosted.com/FHIRProxy/api/FHIR/R4', 'Baptist Health - Northeast Florida'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1206.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.bhsi.com/PRD-FHIR/api/FHIR/R4', 'Baptist Health – KY & IN'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.bhsi.com/PRD-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rxedi.bmhcc.org/prd-fhir/api/FHIR/R4', 'Baptist Memorial Health Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rxedi.bmhcc.org/prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soap.bassett.org/FHIR/api/FHIR/R4', 'Bassett Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soap.bassett.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://interconnect.brgeneral.org/oauth/api/FHIR/R4', 'Baton Rouge General'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://interconnect.brgeneral.org/oauth/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0301.epichosted.com/FHIRProxyPRD/MYBAYCARE/api/FHIR/R4', 'BayCare Clinic - myBayCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0301.epichosted.com/FHIRProxyPRD/MYBAYCARE/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epproxy.bayhealth.org/FHIR/api/FHIR/R4', 'Bayhealth Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epproxy.bayhealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.clinical.bcm.edu/stage1fhir/api/FHIR/R4', 'Baylor College of Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.clinical.bcm.edu/stage1fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.bswhealth.org/FHIR-PRD/BSW/api/FHIR/R4', 'Baylor Scott & White'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.bswhealth.org/FHIR-PRD/BSW/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://moc.beaumont.org/FHIR/api/FHIR/R4', 'Beaumont Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://moc.beaumont.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arr.thedacare.org/FHIR/BLN/api/FHIR/R4', 'Bellin Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arr.thedacare.org/FHIR/BLN/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1334.epichosted.com/FHIRProxy/api/FHIR/R4', 'Benefis Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1334.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.laheyhealth.org/proxy-prd-fhir/api/FHIR/R4', 'Beth Israel Lahey Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.laheyhealth.org/proxy-prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0965.epichosted.com/FHIRProxy/api/FHIR/R4', 'BJC & Washington University'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0965.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku.bshsi.org/fhir/BSHSI_OAUTH/api/FHIR/R4', 'Bon Secours Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku.bshsi.org/fhir/BSHSI_OAUTH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://chperx.health-partners.org/Proxy-FHIR/api/FHIR/R4', 'Bon Secours Mercy Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://chperx.health-partners.org/Proxy-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1351.epichosted.com/APIProxyPRD/api/FHIR/R4', 'Boston Children'''s Hospital (Enterprise)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1351.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://emerge-soap1.bmc.org/FHIR-PRD/api/FHIR/R4', 'Boston Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://emerge-soap1.bmc.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://prevprox.bch.org/FHIRproxyPRD/api/FHIR/R4', 'Boulder Community Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://prevprox.bch.org/FHIRproxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://revproxy.bh.bozemanhealth.org/Interconnect-Oauth2-PRD/api/FHIR/R4', 'Bozeman Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://revproxy.bh.bozemanhealth.org/Interconnect-Oauth2-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.bhsala.com/FHIRProxy/api/FHIR/R4', 'Brookwood Baptist Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.bhsala.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1031.epichosted.com/FHIRProxy/api/FHIR/R4', 'Bryan Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1031.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.buffalomedicalgroup.com/fhir-arr/api/FHIR/R4', 'Buffalo Medical Group'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.buffalomedicalgroup.com/fhir-arr/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et4001.epichosted.com/FHIRProxy/api/FHIR/R4', 'Caldera Family Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et4001.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicmobile.challiance.org/Interconnect-oauth2/api/FHIR/R4', 'Cambridge Health Alliance'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicmobile.challiance.org/Interconnect-oauth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1149.epichosted.com/FHIRProxy/api/FHIR/R4', 'Cape Cod Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1149.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1094.epichosted.com/FHIRProxy/api/FHIR/R4', 'Cape Fear Valley Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1094.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://cnesp001.carene.org/FHIR/api/FHIR/R4', 'Care New England'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://cnesp001.carene.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://interconnect.carelonhealth.com/Interconnect-PRD-OAuth2/api/FHIR/R4', 'Carelon'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://interconnect.carelonhealth.com/Interconnect-PRD-OAuth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0316.epichosted.com/FHIRProxy/api/FHIR/R4', 'Carle Foundation Hospital & Physician Group'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0316.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://spp.caromonthealth.org/FhirProxy/api/FHIR/R4', 'Caromont Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://spp.caromonthealth.org/FhirProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epx1.chsli.org/FHIR/api/FHIR/R4', 'Catholic Health (Long Island NY)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epx1.chsli.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1144.epichosted.com/FHIRProxy/api/FHIR/R4', 'Catholic Health System (Buffalo)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1144.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://cslinkmobile.csmc.edu/fhirproxy/api/FHIR/R4', 'Cedars-Sinai Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://cslinkmobile.csmc.edu/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicmobile.centracare.com/fhir/api/FHIR/R4', 'CentraCare Health and Affiliates'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicmobile.centracare.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rp-prd.copcp.com/FHIRProxy/api/FHIR/R4', 'Central Ohio Primary Care Physicians'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rp-prd.copcp.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-p-mobile.centura.org/prd-fhir/api/FHIR/R4', 'Centura Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-p-mobile.centura.org/prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1001.epichosted.com/FHIRProxyPRD/api/FHIR/R4', 'Charlotte Eye Ear Nose & Throat Associates'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1001.epichosted.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku.bshsi.org/fhir/CRMC_OAUTH/api/FHIR/R4', 'Chesapeake Regional Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku.bshsi.org/fhir/CRMC_OAUTH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soap.crmcwy.org/fhirproxy/api/FHIR/R4', 'Cheyenne Regional Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soap.crmcwy.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rp.chihealth.com/fhir/api/FHIR/R4', 'CHI Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rp.chihealth.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rpsouth.catholichealth.net/fhir/FHIRMCT/api/FHIR/R4', 'CHI Memorial'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rpsouth.catholichealth.net/fhir/FHIRMCT/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rpsouth.catholichealth.net/fhir/FHIRKY/api/FHIR/R4', 'CHI Saint Joseph Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rpsouth.catholichealth.net/fhir/FHIRKY/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rp.chihealth.com/fhir/FHIRSTA/api/FHIR/R4', 'CHI St. Alexius Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rp.chihealth.com/fhir/FHIRSTA/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rpsouth.catholichealth.net/fhir/api/FHIR/R4', 'CHI St. Luke'''s Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rpsouth.catholichealth.net/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-fhir.mercy.net/PRDFHIRSGF/CHI/api/FHIR/R4', 'CHI St. Vincent'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-fhir.mercy.net/PRDFHIRSGF/CHI/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.childrens.com/prd/api/FHIR/R4', 'Children'''s Health System of Texas'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.childrens.com/prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://EPROXY1.chsomaha.org/FHIRPROXY/api/FHIR/R4', 'Children'''s Hospital and Medical Center, Omaha Nebraska'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://EPROXY1.chsomaha.org/FHIRPROXY/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.childrenscolorado.org/fhirprd/api/FHIR/R4', 'Children'''s Hospital Colorado'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.childrenscolorado.org/fhirprd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicnsproxy.chop.edu/fhir/api/FHIR/R4', 'Children'''s Hospital of Philadelphia'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicnsproxy.chop.edu/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1246.epichosted.com/FHIRProxy/api/FHIR/R4', 'Children'''s of Alabama'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1246.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0815.epichosted.com/FHIRProxy/api/FHIR/R4', 'Children'''s Wisconsin'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0815.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://wpprod.choa.org/FHIR_PRD/api/FHIR/R4', 'Childrens'''s Healthcare of Atlanta'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://wpprod.choa.org/FHIR_PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://proxy.christushealth.org/FHIRPRD/api/FHIR/R4', 'CHRISTUS Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://proxy.christushealth.org/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicarr.healthcare.cigna.com/FHIR-PRD/api/FHIR/R4', 'Cigna Medical Group'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicarr.healthcare.cigna.com/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://boomer.cchmc.org/fhir/api/fhir/R4', 'Cincinnati Children'''s Hospital Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://boomer.cchmc.org/fhir/api/fhir/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-rproxyprod.coh.org/Interconnect-FHIR-PRD/api/FHIR/R4', 'City of Hope'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-rproxyprod.coh.org/Interconnect-FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://api.ccf.org/mu/api/FHIR/R4', 'Cleveland Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://api.ccf.org/mu/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy-pub.et1089.epichosted.com/FHIRProxy/api/FHIR/R4', 'Columbia Physicians'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy-pub.et1089.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicprdproxy.crh.org/FHIRPRD/api/FHIR/R4', 'Columbus Regional Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicprdproxy.crh.org/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://esp.ecommunity.com/FHIRProxy/api/FHIR/R4', 'Community Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://esp.ecommunity.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoapprd.communitymedical.org/arr_fhir/api/FHIR/R4', 'Community Medical Centers'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoapprd.communitymedical.org/arr_fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1290.epichosted.com/FHIRProxy/api/FHIR/R4', 'Community Technology Cooperative'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1290.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1164.epichosted.com/FHIRproxy/api/FHIR/R4', 'CommUnityCare Health Centers'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1164.epichosted.com/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epsoap.conehealth.com/FHIRProxy/api/FHIR/R4', 'Cone Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epsoap.conehealth.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.conemaugh.org/arr-fhir-prd/api/FHIR/R4', 'Conemaugh Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.conemaugh.org/arr-fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0764.epichosted.com/FHIRProxy/api/FHIR/R4', 'Confluence Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0764.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.connecticutchildrens.org/FHIR/api/FHIR/R4', 'Connecticut Children'''s Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.connecticutchildrens.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://icproxy.mycclink.org/proxy-FHIR/api/FHIR/R4', 'Contra Costa'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://icproxy.mycclink.org/proxy-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://cookicfg.cookchildrens.org/CookFHIR/api/FHIR/R4', 'Cook Children’s Health Care System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://cookicfg.cookchildrens.org/CookFHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0578.epichosted.com/FHIRProxy/api/FHIR/R4', 'Cooper University Health Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0578.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eparp.sbch.org/FHIR/api/FHIR/R4', 'Cottage Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eparp.sbch.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1356.epichosted.com/FHIRProxyPRD/api/FHIR/R4', 'County of San Mateo'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1356.epichosted.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku.bshsi.org/fhir/COV_OAUTH/api/FHIR/R4', 'Covenant Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku.bshsi.org/fhir/COV_OAUTH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epichaiku.chs-mi.com/FHIRPROXY/api/FHIR/R4', 'Covenant HealthCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epichaiku.chs-mi.com/FHIRPROXY/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://retailepicfhir.cvshealth.com/FhirProxy/api/fhir/R4', 'CVS Health & Minute Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://retailepicfhir.cvshealth.com/FhirProxy/api/fhir/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://edhwebportal.hitchcock.org/FHIRProxy/api/FHIR/R4', 'Dartmouth-Hitchcock'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://edhwebportal.hitchcock.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1087.epichosted.com/FHIRProxy/api/FHIR/R4', 'DaVita Physician Solutions'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1087.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://appprd.childrensdayton.org/interconnect-prd-fhir/api/FHIR/R4', 'Dayton Children'''s Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://appprd.childrensdayton.org/interconnect-prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eprp.deaconess.com/FHIR/api/FHIR/R4', 'Deaconess Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eprp.deaconess.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://webservices.dhha.org/PRD-FHIR/api/FHIR/R4', 'Denver Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://webservices.dhha.org/PRD-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.dchstx.org/FHIR-External/api/FHIR/R4', 'Driscoll Children'''s Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.dchstx.org/FHIR-External/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://health-apis.duke.edu/FHIR/api/FHIR/R4', 'Duke Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://health-apis.duke.edu/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1296.epichosted.com/APIProxyPRD/api/FHIR/R4', 'Duly Health and Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1296.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhirprd.edward.org/fhirprd/EEHOAUTH/api/FHIR/R4', 'Edward-Elmhurst Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhirprd.edward.org/fhirprd/EEHOAUTH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicarr.emc.org/EMC_FHIR_PRD/api/FHIR/R4', 'Eisenhower Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicarr.emc.org/EMC_FHIR_PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rwebproxy.elcaminohospital.org/FHIR/api/FHIR/R4', 'El Camino Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rwebproxy.elcaminohospital.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1240.epichosted.com/FHIRProxy/api/FHIR/R4', 'El Rio Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1240.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicrp-prd.eushc.org/OAUTH2-PRD/api/FHIR/R4', 'Emory Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicrp-prd.eushc.org/OAUTH2-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1073.epichosted.com/FHIRProxy/api/FHIR/R4', 'Englewood Hospital and Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1073.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1034.epichosted.com/FHIRProxy/api/FHIR/R4', 'Enloe Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1034.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1038.epichosted.com/FHIRProxy/api/FHIR/R4', 'EPIC Management (Beaver Medical Group)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1038.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0967.epichosted.com/FHIRProxy/api/FHIR/R4', 'Erlanger Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0967.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://proxy.eskenazihealth.edu/FHIR-Proxy/api/FHIR/R4', 'Eskenazi Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://proxy.eskenazihealth.edu/FHIR-Proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://m.essentiahealth.org/FHIR/api/FHIR/R4', 'Essentia Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://m.essentiahealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1270.epichosted.com/apiproxyprd/api/FHIR/R4', 'EvergreenHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1270.epichosted.com/apiproxyprd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1126.epichosted.com/FHIRProxy/api/FHIR/R4', 'Exact Sciences'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1126.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://sfd.fairview.org/FHIR/api/FHIR/R4', 'Fairview Health Services'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://sfd.fairview.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.fcn.net/Fhir/api/FHIR/R4', 'Family Care Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.fcn.net/Fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://external.fastmed.com/FHIRproxy/api/FHIR/R4', 'FastMed'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://external.fastmed.com/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicrp.firsthealth.org/FHIR-PRD/api/FHIR/R4', 'FirstHealth of the Carolinas'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicrp.firsthealth.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1359.epichosted.com/FHIRProxyPRD/api/FHIR/R4', 'Florida Health Care Plans'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1359.epichosted.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ema.franciscanalliance.org/FHIR_PROXY/api/FHIR/R4', 'Franciscan Alliance'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ema.franciscanalliance.org/FHIR_PROXY/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0830.epichosted.com/FHIRProxy/api/FHIR/R4', 'Franciscan Missionaries of Our Lady Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0830.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicserviceGW.froedtert.com/FHIRProxyPRD/api/FHIR/R4', 'Froedtert Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicserviceGW.froedtert.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic.garnethealth.org/FHIR/api/FHIR/R4', 'Garnet Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic.garnethealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://geisapi.geisinger.edu/FHIR_PROD/api/FHIR/R4', 'Geisinger'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://geisapi.geisinger.edu/FHIR_PROD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.genesishcs.org/api/FHIR/R4', 'Genesis Healthcare System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.genesishcs.org/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1222.epichosted.com/FHIRProxy/api/FHIR/R4', 'George Washington University Medical Faculty Associates'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1222.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ep-rps.gvhc.org/FHIR-PRD/api/FHIR/R4', 'Golden Valley Health Centers'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ep-rps.gvhc.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://surescripts.gmh.edu/OAuth2PRD/api/FHIR/R4', 'Grady Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://surescripts.gmh.edu/OAuth2PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eportal.gbmc.org/fhir/api/FHIR/R4', 'Greater Baltimore Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eportal.gbmc.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://linkpoint.ghcscw.com/Interconnect-prd-fhir/api/FHIR/R4', 'Group Health Cooperative - South Central Wisconsin'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://linkpoint.ghcscw.com/Interconnect-prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://scproxy.gundersenhealth.org/FHIRARR/api/FHIR/R4', 'Gundersen Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://scproxy.gundersenhealth.org/FHIRARR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mepic.hmhn.org/fhir/api/FHIR/R4', 'Hackensack Meridian Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mepic.hmhn.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1336.epichosted.com/FHIRProxy/api/FHIR/R4', 'Hamilton Health Care System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1336.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.harrishealth.org/fhir/api/FHIR/R4', 'Harris Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.harrishealth.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.hhchealth.org/FHIR/api/FHIR/R4', 'Hartford HealthCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.hhchealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapprod.hattiesburgclinic.com/OAuth2/api/FHIR/R4', 'Hattiesburg Clinic and Forrest General Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapprod.hattiesburgclinic.com/OAuth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://webservices.hawaiipacifichealth.org/fhir/api/FHIR/R4', 'Hawaii Pacific Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://webservices.hawaiipacifichealth.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://stdavidsfhirprd.app.medcity.net/fhir-proxy/api/FHIR/R4', 'HCA Central and West Texas'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://stdavidsfhirprd.app.medcity.net/fhir-proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mountainstarhealthfhirprd.app.medcity.net/fhir-proxy/api/FHIR/R4', 'HCA Mountain'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mountainstarhealthfhirprd.app.medcity.net/fhir-proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://memorialhealthfhirprd.app.medcity.net/fhir-proxy/api/FHIR/R4', 'HCA South Atlantic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://memorialhealthfhirprd.app.medcity.net/fhir-proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1256.epichosted.com/FHIRProxy/api/FHIR/R4', 'Health Choice Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1256.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://proxy.healthpartners.com/FHIRProxy/api/FHIR/R4', 'HealthPartners'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://proxy.healthpartners.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1395.epichosted.com/APIProxyPRD/api/FHIR/R4', 'HealthPoint'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1395.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://sehproxy.stelizabeth.com/arr-fhir/HRH/api/FHIR/R4', 'Hendricks Regional Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://sehproxy.stelizabeth.com/arr-fhir/HRH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://hie.hcmed.org/FHIR/api/FHIR/R4', 'Hennepin Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://hie.hcmed.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.hfhs.org/FHIRProxy/api/FHIR/R4', 'Henry Ford Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.hfhs.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicscripts.trihealth.com/fhirproxy/api/FHIR/R4', 'Highland District Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicscripts.trihealth.com/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1013.epichosted.com/FHIRProxy/api/FHIR/R4', 'Hill Physicians'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1013.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1197.epichosted.com/FHIRProxy/api/FHIR/R4', 'Hoag Memorial Hospital Presbyterian'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1197.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://interconnect.honorhealth.com/Interconnect-FHIR-PRD/api/FHIR/R4', 'HonorHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://interconnect.honorhealth.com/Interconnect-FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0927.epichosted.com/FHIRProxy/api/FHIR/R4', 'Hospital for Special Surgery'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0927.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://scripts.prevea.com/FHIR-ARR-PRD/api/FHIR/R4', 'Hospital Sisters Health System (HSHS)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://scripts.prevea.com/FHIR-ARR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0922.epichosted.com/FHIRProxy/api/FHIR/R4', 'Houston Methodist'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0922.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.hurleymc.com/fhir/api/FHIR/R4', 'Hurley Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.hurleymc.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1195.epichosted.com/fhirproxy/api/FHIR/R4', 'Illinois Bone & Joint Institute'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1195.epichosted.com/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ssproxyprod.infirmaryhealth.org/epicFHIR/api/FHIR/R4', 'Infirmary Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ssproxyprod.infirmaryhealth.org/epicFHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rp.innovage.com/OAUTH2-PRD/api/FHIR/R4', 'Innovage'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rp.innovage.com/OAUTH2-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicrpprd.inova.org/fhirrp/api/FHIR/R4', 'Inova Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicrpprd.inova.org/fhirrp/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.institute.org/fhir/api/FHIR/R4', 'Institute for Family Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.institute.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://FHIR.Integrisok.com/Interconnect-FHIR/api/FHIR/R4', 'INTEGRIS Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://FHIR.Integrisok.com/Interconnect-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0645.epichosted.com/FHIRProxyPRD/api/FHIR/R4', 'Intermountain Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0645.epichosted.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.jefferson.edu/FHIRProxy/api/FHIR/R4', 'Jefferson Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.jefferson.edu/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.johnmuirhealth.com/fhir-prd/api/FHIR/R4', 'John Muir Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.johnmuirhealth.com/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0842.epichosted.com/FHIRProxyPRD/api/FHIR/R4', 'Johns Hopkins Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0842.epichosted.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://oauth2.revprxprd.jpshealth.org/epoauth2/api/FHIR/R4', 'JPS Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://oauth2.revprxprd.jpshealth.org/epoauth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://FHIR.KP.ORG/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/312/api/FHIR/R4', 'Kaiser Permanente - California - Northern'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://FHIR.KP.ORG/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/312/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/212/api/FHIR/R4', 'Kaiser Permanente - California - Southern'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/212/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/140/api/FHIR/R4', 'Kaiser Permanente - Colorado'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/140/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/170/api/FHIR/R4', 'Kaiser Permanente - Maryland/Virginia/Washington D.C.'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/170/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.kp.org/Interconnect-FHIR-PRD/api/FHIR/R4', 'Kaiser Permanente - Washington'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.kp.org/Interconnect-FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/130/api/FHIR/R4', 'Kaiser Permanente Hawaii / Maui Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/130/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/200/api/FHIR/R4', 'Kaiser Permanente – Georgia'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.kp.org/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/200/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://FHIR.KP.ORG/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/190/api/FHIR/R4', 'Kaiser Permanente – Oregon – SW Washington'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://FHIR.KP.ORG/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/190/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://FHIR.KP.ORG/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/326/api/FHIR/R4', 'Kaiser – NCAL - prod 326 (CIS)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://FHIR.KP.ORG/service/ptnt_care/EpicEdiFhirRoutingSvc/v2014/esb-envlbl/326/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ssrx.ksnet.com/FhirProxy/api/FHIR/R4', 'Kelsey-Seybold Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ssrx.ksnet.com/FhirProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1095.epichosted.com/FHIRProxy/api/FHIR/R4', 'Kennedy Krieger Institute'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1095.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://khnarr.ketthealth.com/FHIR-PROD/api/FHIR/R4', 'Kettering Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://khnarr.ketthealth.com/FHIR-PROD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1284.epichosted.com/FHIRProxy/api/FHIR/R4', 'KeyCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1284.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arrprd.kdmc.net/fhir/api/FHIR/R4', 'King'''s Daughters Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arrprd.kdmc.net/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapprod.multicare.org/FHIRProxy/KH/api/FHIR/R4', 'Kootenai Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapprod.multicare.org/FHIRProxy/KH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.bswhealth.org/FHIR-PRD/CONNECT/api/FHIR/R4', 'Lacy C Kessler, MD, PA'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.bswhealth.org/FHIR-PRD/CONNECT/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicapp.mylrh.org/OAuth2/api/FHIR/R4', 'Lakeland Regional Health (FL)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicapp.mylrh.org/OAuth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.lghealth.org/FHIRProxy/api/FHIR/R4', 'Lancaster General Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.lghealth.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://interconnect.lcmchealth.org/FHIR/api/FHIR/R4', 'LCMC Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://interconnect.lcmchealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicedi.leememorial.org/FHIR-prd/api/FHIR/R4', 'Lee Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicedi.leememorial.org/FHIR-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://lhspdxfhirprd.lhs.org/FHIR/api/FHIR/R4', 'Legacy Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://lhspdxfhirprd.lhs.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://proxy.lvh.com/FHIR/api/FHIR/R4', 'Lehigh Valley Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://proxy.lvh.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://prodinterconnect.leonmedicalcenters.com/FHIR-PRD/api/FHIR/R4', 'Leon Medical Centers'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://prodinterconnect.leonmedicalcenters.com/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://lmcrcs.lexmed.com/FHIR/api/FHIR/R4', 'Lexington Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://lmcrcs.lexmed.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1168.epichosted.com/FHIRProxy/api/FHIR/R4', 'Licking Memorial Health Systems'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1168.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://lsepprdsoap.lifespan.org/fhirproxy/api/FHIR/R4', 'Lifespan'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://lsepprdsoap.lifespan.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://prd.lluh.org/fhir/api/FHIR/R4', 'Loma Linda University Health and CareConnect Partners'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://prd.lluh.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rxhub.luhs.org/fhir/api/FHIR/R4', 'Loyola Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rxhub.luhs.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicarr.aahs.org/FHIR/api/FHIR/R4', 'Luminis Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicarr.aahs.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1007.epichosted.com/FHIRProxy/api/FHIR/R4', 'Main Line Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1007.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.mainehealth.org/FHIRPRD/api/FHIR/R4', 'MaineHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.mainehealth.org/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://emrproxy.mcfarlandclinic.com/FHIRProxy/api/FHIR/R4', 'Mary Greeley Medical Center (Iowa)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://emrproxy.mcfarlandclinic.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1055.epichosted.com/FHIRProxy/api/FHIR/R4', 'Mary Washington Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1055.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ws-interconnect-fhir.partners.org/Interconnect-FHIR-MU-PRD/api/FHIR/R4', 'Mass General Brigham'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ws-interconnect-fhir.partners.org/Interconnect-FHIR-MU-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1267.epichosted.com/FHIRProxy/api/FHIR/R4', 'McLeod Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1267.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhirprod.musc.edu/fhirprod/api/FHIR/R4', 'Medical University of South Carolina'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhirprod.musc.edu/fhirprod/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eprescribe-p.medisys.org/fhir-prd/api/FHIR/R4', 'MediSys Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eprescribe-p.medisys.org/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mhssp.mhs.net/fhir/api/FHIR/R4', 'Memorial Healthcare System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mhssp.mhs.net/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1326.epichosted.com/FHIRProxy/api/FHIR/R4', 'Memorial Hermann'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1326.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arrprd.mhhcc.org/OAuth2/api/FHIR/R4', 'Memorial Hospital and Health Care Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arrprd.mhhcc.org/OAuth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1353.epichosted.com/APIPROXYPRD/api/fhir/R4', 'Memorial Sloan Kettering Cancer Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1353.epichosted.com/APIPROXYPRD/api/fhir/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.memorialcare.org/fhir/api/FHIR/R4', 'MemorialCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.memorialcare.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-fhir.mercy.net/prdfhirstl/api/FHIR/R4', 'Mercy Health (Arkansas, Louisiana, Mississippi and Texas)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-fhir.mercy.net/prdfhirstl/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://surescripts.mdmercy.com/fhir-prd/api/FHIR/R4', 'Mercy Health Services (MD)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://surescripts.mdmercy.com/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.mhsjvl.org/FHIRproxy/api/FHIR/R4', 'Mercy Health System - WI'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.mhsjvl.org/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eproxy.mercycare.org/oauth2/api/FHIR/R4', 'Mercy Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eproxy.mercycare.org/oauth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1062.epichosted.com/FHIRProxyPRD/api/FHIR/R4', 'Meritus'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1062.epichosted.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epcapp.mhd.com/arr-prd-fhir/api/FHIR/R4', 'Methodist Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epcapp.mhd.com/arr-prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mychart.methodisthospitals.org/FHIR-ARR/api/FHIR/R4', 'Methodist Hospitals'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mychart.methodisthospitals.org/FHIR-ARR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arrprd.metrohealth.net/fhir/api/FHIR/R4', 'Metro Health - Michigan'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arrprd.metrohealth.net/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.metrohealth.org/fhir_prd/api/FHIR/R4', 'MetroHealth - OH'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.metrohealth.org/fhir_prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mcproxyprd.med.umich.edu/FHIR-PRD/api/FHIR/R4', 'Michigan Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mcproxyprd.med.umich.edu/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1124.epichosted.com/FHIRProxy/api/FHIR/R4', 'Middlesex Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1124.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1329.epichosted.com/APIProxyPRD/api/FHIR/R4', 'Midwestern University'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1329.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.mvhealthsystem.org/FHIRproxy/api/FHIR/R4', 'Mohawk Valley Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.mvhealthsystem.org/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1057.epichosted.com/FHIRProxy/api/FHIR/R4', 'Molina Care Connections'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1057.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1058.epichosted.com/FHIRProxy/api/FHIR/R4', 'Montage Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1058.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapepic.montefiore.org/FhirProxyPrd/api/FHIR/R4', 'Montefiore Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapepic.montefiore.org/FhirProxyPrd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ehrmobile.monument.health/interconnect-prd-fhir/api/FHIR/R4', 'Monument Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ehrmobile.monument.health/interconnect-prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1274.epichosted.com/FHIRProxy/api/FHIR/R4', 'Mosaic Life Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1274.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.mah.org/prd-fhir/api/FHIR/R4', 'Mount Auburn Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.mah.org/prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoapproxyprd.mountsinai.org/FHIR-PRD/api/FHIR/R4', 'Mount Sinai Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoapproxyprd.mountsinai.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicfhir.msmc.com/proxysite-prd/api/FHIR/R4', 'Mount Sinai Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicfhir.msmc.com/proxysite-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapprod.multicare.org/FHIRProxy/api/FHIR/R4', 'MultiCare Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapprod.multicare.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1221.epichosted.com/FHIRProxy/api/FHIR/R4', 'Muscogee - Creek Nation Department of Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1221.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arrprod.midmichigan.net/ProdFHIR/api/FHIR/R4', 'MyMichigan Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arrprod.midmichigan.net/ProdFHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://hkc.nationwidechildrens.org/FHIR/api/FHIR/R4', 'Nationwide Children'''s Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://hkc.nationwidechildrens.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1233.epichosted.com/FHIRProxy/api/FHIR/R4', 'NCH Healthcare System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1233.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ocsoapprd.nebraskamed.com/FHIR-PRD/api/FHIR/R4', 'Nebraska Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ocsoapprd.nebraskamed.com/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://iconnect.nemours.org/fhir/api/FHIR/R4', 'Nemours'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://iconnect.nemours.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1153.epichosted.com/FHIRProxy/api/FHIR/R4', 'New Jersey Urology'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1153.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://prdproxy.nomshealthcare.com/PRD-OAuth2/api/FHIR/R4', 'NOMS Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://prdproxy.nomshealthcare.com/PRD-OAuth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1332.epichosted.com/FHIRProxy/api/FHIR/R4', 'North East Medical Services'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1332.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://minerva.northmemorial.com/fhir/api/FHIR/R4', 'North Memorial Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://minerva.northmemorial.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapproxyprd.northoaks.org/nohsfhir/api/FHIR/R4', 'North Oaks'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapproxyprd.northoaks.org/nohsfhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://wpprod.nghs.com/fhir/api/FHIR/R4', 'Northeast Georgia Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://wpprod.nghs.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku.northshore.org/Interconnect-FHIR/api/FHIR/R4', 'NorthShore University Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku.northshore.org/Interconnect-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicprdproxy.nch.org/prd-fhir/api/FHIR/R4', 'Northwest Community Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicprdproxy.nch.org/prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://nmepicproxy.nm.org/FHIR-PRD/api/FHIR/R4', 'Northwestern Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://nmepicproxy.nm.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0819.epichosted.com/APIPROXYPRD/api/FHIR/R4', 'Norton Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0819.epichosted.com/APIPROXYPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0798.epichosted.com/APIProxyPRD/api/FHIR/R4', 'Novant Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0798.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxypda.nychhc.org/FHIRProxy/api/FHIR/R4', 'NYC Health + Hospitals'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxypda.nychhc.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicfhir.nyumc.org/FHIRPRD/api/FHIR/R4', 'NYU Langone Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicfhir.nyumc.org/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://webprd.ochin.org/prd-fhir/api/FHIR/R4', 'OCHIN'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://webprd.ochin.org/prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://myc.ochsner.org/FHIR/api/FHIR/R4', 'Ochsner Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://myc.ochsner.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ccpintconfg.ohiohealth.com/Interconnect-PRD-MUAPI/api/FHIR/R4', 'OhioHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ccpintconfg.ohiohealth.com/Interconnect-PRD-MUAPI/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicrp.okheart.com/Oauth2Proxy/api/FHIR/R4', 'Oklahoma Heart Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicrp.okheart.com/Oauth2Proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1077.epichosted.com/APIPROXYPRD/api/FHIR/R4', 'Olmsted Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1077.epichosted.com/APIPROXYPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0883.epichosted.com/FHIRProxy/api/FHIR/R4', 'One Brooklyn Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0883.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.myeverettclinic.com/fhir/api/FHIR/R4', 'Optum Care Washington'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.myeverettclinic.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicarr.optum.com/FHIR/api/FHIR/R4', 'OptumCare East'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicarr.optum.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicpnwarr.optum.com/FHIR/api/FHIR/R4', 'OptumCare West'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicpnwarr.optum.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1131.epichosted.com/FHIRProxy/api/FHIR/R4', 'Orlando Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1131.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epwebapps.orthocarolina.com/fhir-prd/api/FHIR/R4', 'OrthoCarolina'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epwebapps.orthocarolina.com/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1015.epichosted.com/FHIRProxy/api/FHIR/R4', 'OrthoVirginia'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1015.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ssproxy.osfhealthcare.org/fhir-proxy/api/FHIR/R4', 'OSF HealthCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ssproxy.osfhealthcare.org/fhir-proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1181.epichosted.com/FHIRProxy/api/FHIR/R4', 'OU Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1181.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://sfd.overlakehospital.org/FHIRproxy/api/FHIR/R4', 'Overlake Hospital Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://sfd.overlakehospital.org/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.omhs.org/rp-prd-fhir/api/FHIR/R4', 'Owensboro Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.omhs.org/rp-prd-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1079.epichosted.com/FHIRProxy/api/FHIR/R4', 'Pacific Dental Services'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1079.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://pmh-vmhaiku-01.pmh.org/FHIR/api/FHIR/R4', 'Parkland'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://pmh-vmhaiku-01.pmh.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicprod-mobile.parkview.com/FHIR/api/FHIR/R4', 'Parkview Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicprod-mobile.parkview.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapproxy.peacehealth.org/FHIRProxy/api/FHIR/R4', 'PeaceHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapproxy.peacehealth.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.chppoc.org/Fhir-External/api/FHIR/R4', 'Pediatric Physicians Organization at Children'''s'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.chppoc.org/Fhir-External/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ssproxy.pennhealth.com/PRD-FHIR/api/FHIR/R4', 'Penn Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ssproxy.pennhealth.com/PRD-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1134.epichosted.com/FHIRProxy/api/FHIR/R4', 'Phelps Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1134.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://webproxy.piedmont.org/ARR-FHIR/api/FHIR/R4', 'Piedmont Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://webproxy.piedmont.org/ARR-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1225.epichosted.com/FHIRProxy/api/FHIR/R4', 'Pikeville Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1225.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://wecare.pinerest.org/fhirproxy/api/FHIR/R4', 'Pine Rest Christian Mental Health Services'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://wecare.pinerest.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1154.epichosted.com/FHIRProxy/api/FHIR/R4', 'Planned Parenthood'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1154.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://webproxy.comhs.org/FHIR/api/FHIR/R4', 'Powers Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://webproxy.comhs.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rx.premierhealthpartners.org/fhir/api/FHIR/R4', 'Premier Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rx.premierhealthpartners.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1052.epichosted.com/FHIRProxy/api/FHIR/R4', 'Premise Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1052.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicFHIR.phs.org/FHIR/api/FHIR/R4', 'Presbyterian Healthcare Services'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicFHIR.phs.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://phsfhir.primehealthcare.com/PHS-PRD-FHIR/api/FHIR/R4', 'Prime Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://phsfhir.primehealthcare.com/PHS-PRD-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0915.epichosted.com/FHIRProxy/api/FHIR/R4', 'Prisma Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0915.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.promedica.org/FHIR/api/FHIR/R4', 'ProMedica Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.promedica.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haikuak.providence.org/fhirproxy/api/FHIR/R4', 'Providence Health & Services - Alaska'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haikuak.providence.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haikuor.providence.org/fhirproxy/api/FHIR/R4', 'Providence Health & Services - Oregon/California'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haikuor.providence.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haikuwa.providence.org/fhirproxy/api/FHIR/R4', 'Providence Health & Services - Washington/Montana'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haikuwa.providence.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicicfore.quadmedical.com/fhirprd/api/FHIR/R4', 'QuadMed'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicicfore.quadmedical.com/fhirprd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epcppxl1.rchsd.org/fhirprd/api/FHIR/R4', 'Rady Children'''s'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epcppxl1.rchsd.org/fhirprd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1220.epichosted.com/FHIRProxy/api/FHIR/R4', 'Reid Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1220.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhirprd.reliantmedicalgroup.org/FHIRPRD/api/FHIR/R4', 'Reliant Medical Group'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhirprd.reliantmedicalgroup.org/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.renown.org/FHIRProxy/api/FHIR/R4', 'Renown, Barton, CVMC'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.renown.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ep-rpfg.rivhs.com/Interconnect-FHIR-PRD/api/FHIR/R4', 'Riverside Health System (Newport News, VA)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ep-rpfg.rivhs.com/Interconnect-FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rpprod.riversidehealthcare.net/FHIRPRD/api/FHIR/R4', 'Riverside Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rpprod.riversidehealthcare.net/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://sf1.rmcps.com/FHIRProxy/api/FHIR/R4', 'Riverside Medical Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://sf1.rmcps.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-fhir.mercy.net/PRDFHIRSTL/RVH/api/FHIR/R4', 'Riverview Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-fhir.mercy.net/PRDFHIRSTL/RVH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicarr.rochesterregional.org/FHIR/api/FHIR/R4', 'Rochester Regional Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicarr.rochesterregional.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.rush.edu/fhir-prd/api/FHIR/R4', 'Rush University Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.rush.edu/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1157.epichosted.com/FHIRProxy/api/FHIR/R4', 'RWJBarnabas Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1157.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eprdsoap000.saintfrancis.com/FHIRProxy/api/FHIR/R4', 'Saint Francis Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eprdsoap000.saintfrancis.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://reverseproxy.sfmc.net/fhirproxyprd/api/FHIR/R4', 'Saint Francis Healthcare System (Manual)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://reverseproxy.sfmc.net/fhirproxyprd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicmobile.corp.saint-lukes.org/FHIRPROXY/api/FHIR/R4', 'Saint Luke'''s Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicmobile.corp.saint-lukes.org/FHIRPROXY/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://prd.salemhealth.org/fhir/api/FHIR/R4', 'Salem Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://prd.salemhealth.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1146.epichosted.com/FHIRProxy/api/FHIR/R4', 'Salinas Valley Memorial Healthcare Systems'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1146.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.samhealth.org/fhir-arr/api/FHIR/R4', 'Samaritan Health Services'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.samhealth.org/fhir-arr/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1082.epichosted.com/FHIRProxy/api/FHIR/R4', 'San Francisco Department of Public Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1082.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1327.epichosted.com/FHIRProxy/api/FHIR/R4', 'San Ysidro Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1327.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eprescribe.sanfordhealth.org/FHIR/api/FHIR/R4', 'Sanford Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eprescribe.sanfordhealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://wavesurescripts.sansumclinic.org/FHIR/api/FHIR/R4', 'Sansum Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://wavesurescripts.sansumclinic.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://scvhhsfhir.sccgov.org/interconnect-fhir/api/FHIR/R4', 'Santa Clara Valley Medical Center Hospitals and Clinics'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://scvhhsfhir.sccgov.org/interconnect-fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://sbhepicrevprox.barnabas.network/FHIRProxy/api/FHIR/R4', 'SBH Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://sbhepicrevprox.barnabas.network/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0905.epichosted.com/FHIRproxy/SCOTMYCHART/api/FHIR/R4', 'Scotland Health Care System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0905.epichosted.com/FHIRproxy/SCOTMYCHART/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0970.epichosted.com/FHIRProxy/api/FHIR/R4', 'Scottish Rite for Children'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0970.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku.scrippshealth.org/ARR-PRD-FHIR/api/FHIR/R4', 'Scripps Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku.scrippshealth.org/ARR-PRD-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.seattlechildrens.org/fhir/api/FHIR/R4', 'Seattle Children'''s Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.seattlechildrens.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0948.epichosted.com/FhirProxy/api/FHIR/R4', 'Select Medical'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0948.epichosted.com/FhirProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1235.epichosted.com/FHIRProxy/api/FHIR/R4', 'Self Regional Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1235.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicfhir.sentara.com/ARR-FHIR-PRD/api/FHIR/R4', 'Sentara Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicfhir.sentara.com/ARR-FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicrpx.shannonhealth.org/FHIR_ARR/api/FHIR/R4', 'Shannon Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicrpx.shannonhealth.org/FHIR_ARR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1275.epichosted.com/fhirproxy/api/FHIR/R4', 'Sharp HealthCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1275.epichosted.com/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1283.epichosted.com/FHIRProxy/api/FHIR/R4', 'Shriners Children’s'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1283.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arr.mysrhs.com/FHIR/api/FHIR/R4', 'Singing River Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arr.mysrhs.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1005.epichosted.com/FHIRProxy/api/FHIR/R4', 'Skagit Regional Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1005.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxyprd.solutionhealth.org/FHIR_PROD/api/FHIR/R4', 'SolutionHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxyprd.solutionhealth.org/FHIR_PROD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1024.epichosted.com/APIPROXYPRD/api/FHIR/R4', 'South Georgia Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1024.epichosted.com/APIPROXYPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://SSHIC.southshorehealth.org/FHIR/api/FHIR/R4', 'South Shore Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://SSHIC.southshorehealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicpproxy.southcoast.org/FHIR/api/FHIR/R4', 'Southcoast Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicpproxy.southcoast.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arrprd.southeasthealth.org/FHIR/api/FHIR/R4', 'Southeast Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arrprd.southeasthealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0986.epichosted.com/FHIRProxy/api/FHIR/R4', 'Southern Illinois Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0986.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku.sparrow.org/fhir-prd/api/FHIR/R4', 'Sparrow Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku.sparrow.org/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0939.epichosted.com/FHIRProxy/api/FHIR/R4', 'Spartanburg Regional Health Systems'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0939.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicarr02.spectrumhealth.org/EpicFHIR/api/FHIR/R4', 'Spectrum Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicarr02.spectrumhealth.org/EpicFHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.lakelandregional.org/fhirproxy/api/FHIR/R4', 'Spectrum Health Lakeland'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.lakelandregional.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.ssmhc.com/Fhir/api/FHIR/R4', 'SSM Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.ssmhc.com/Fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1030.epichosted.com/FHIRProxy/api/FHIR/R4', 'St. Charles Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1030.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://sehproxy.stelizabeth.com/arr-fhir/SEH/api/FHIR/R4', 'St. Elizabeth Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://sehproxy.stelizabeth.com/arr-fhir/SEH/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mobileproxy.sjhsyr.org/FHIR/api/FHIR/R4', 'St. Joseph Hospital Health Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mobileproxy.sjhsyr.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rp.stjude.org/oauth2-prd/api/FHIR/R4', 'St. Jude Children'''s Research Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rp.stjude.org/oauth2-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0905.epichosted.com/FHIRproxy/STLUMYCHART/api/FHIR/R4', 'St. Luke'''s Hospital (North Carolina)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0905.epichosted.com/FHIRproxy/STLUMYCHART/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.slhn.org/fhir/api/FHIR/R4', 'St. Luke'''s University Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.slhn.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epmobile.slhs.org/Interconnect-FHIR/api/FHIR/R4', 'St. Luke’s Health System (Idaho & Eastern Oregon)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epmobile.slhs.org/Interconnect-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0857.epichosted.com/FHIRProxy/api/FHIR/R4', 'Stanford Children'''s Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0857.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://sfd.stanfordmed.org/FHIR/api/FHIR/R4', 'Stanford Health Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://sfd.stanfordmed.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoap.stormontvail.org/FHIRproxy/api/FHIR/R4', 'Stormont Vail Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoap.stormontvail.org/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1289.epichosted.com/FHIRProxy/api/FHIR/R4', 'Summa Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1289.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoap.bmctotalcare.com/fhir/api/FHIR/R4', 'Summit Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoap.bmctotalcare.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicedge.upstate.edu/fhir/api/FHIR/R4', 'SUNY Upstate Medical University'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicedge.upstate.edu/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://apiservices.sutterhealth.org/ifs/api/FHIR/R4', 'Sutter Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://apiservices.sutterhealth.org/ifs/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-fhir.mercy.net/PRDFHIRAOK2/TAO/api/FHIR/R4', 'Tahoe Forest Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-fhir.mercy.net/PRDFHIRAOK2/TAO/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0761.epichosted.com/FHIRProxy/api/FHIR/R4', 'Tampa General Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0761.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1098.epichosted.com/FHIRProxy/api/FHIR/R4', 'Tanner Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1098.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicaccess.templehealth.org/FhirProxyPrd/api/FHIR/R4', 'TempleHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicaccess.templehealth.org/FhirProxyPrd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mobileapps.texaschildrens.org/FHIR/api/FHIR/R4', 'Texas Children'''s'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mobileapps.texaschildrens.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epproxy.texashealth.org/FHIR/api/FHIR/R4', 'Texas Health Resources'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epproxy.texashealth.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1043.epichosted.com/FHIRProxy/api/FHIR/R4', 'The Brooklyn Hospital Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1043.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et4006.epichosted.com/FHIRProxyPRD/api/FHIR/R4', 'The Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et4006.epichosted.com/FHIRProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapproxyprod.thechristhospital.com/fhir/api/FHIR/R4', 'The Christ Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapproxyprod.thechristhospital.com/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.guthrie.org/FHIR-PRD/api/FHIR/R4', 'The Guthrie Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.guthrie.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ihismufhir.osumc.edu/fhir-prd/api/FHIR/R4', 'The Ohio State University Wexner Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ihismufhir.osumc.edu/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://tpc-shield.tpcllp.com/FHIR/api/FHIR/R4', 'The Portland Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://tpc-shield.tpcllp.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://mobileapps.queens.org/FHIR/api/FHIR/R4', 'The Queen'''s Health Systems'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://mobileapps.queens.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1178.epichosted.com/FHIRProxy/api/FHIR/R4', 'The University of Texas Health Science Center at Houston'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1178.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.mdanderson.org/FHIR/api/FHIR/R4', 'The University of Texas MD Anderson Cancer Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.mdanderson.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.uvmhealth.org/FHIR-ARR/api/FHIR/R4', 'The University of Vermont Health Network'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.uvmhealth.org/FHIR-ARR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapprod.tvc.org/ARR-FHIR/api/FHIR/R4', 'The Vancouver Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapprod.tvc.org/ARR-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arr.thedacare.org/FHIR/TC/api/FHIR/R4', 'ThedaCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arr.thedacare.org/FHIR/TC/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://eweb.peninsula.org/FHIRProxy/api/FHIR/R4', 'TidalHealth'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://eweb.peninsula.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhirprod.musc.edu/fhirprod/TIDELANDS/api/FHIR/R4', 'Tidelands Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhirprod.musc.edu/fhirprod/TIDELANDS/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.tmcaz.com/FHIRProxy/api/FHIR/R4', 'TMC HealthCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.tmcaz.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoap.readinghospital.org/FHIR-PRD/api/FHIR/R4', 'Tower Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoap.readinghospital.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-ext.trinity-health.org/FHIR/api/FHIR/R4', 'Trinity Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-ext.trinity-health.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicprdext.stfranciscare.org/FhirProxy/api/FHIR/R4', 'Trinity Health of New England'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicprdext.stfranciscare.org/FhirProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rmgpxy.riverbendmedical.com/fhir_proxy/api/FHIR/R4', 'Trinity Health of New England Medical Group Springfield'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rmgpxy.riverbendmedical.com/fhir_proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://intconfg-p.well-net.org/PRD-OAUTH2/api/FHIR/R4', 'Tufts Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://intconfg-p.well-net.org/PRD-OAUTH2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://emrrp.ucdmc.ucdavis.edu/FHIR/api/FHIR/R4', 'UC Davis'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://emrrp.ucdmc.ucdavis.edu/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://emrrp.ucdmc.ucdavis.edu/FHIR/MMC/api/FHIR/R4', 'UC Davis - MMC'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://emrrp.ucdmc.ucdavis.edu/FHIR/MMC/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-soap.uchealth.com/FHIRProxy/api/FHIR/R4', 'UC Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-soap.uchealth.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://interconapps.uchospitals.edu/PRD-FHIR-Proxy/api/FHIR/R4', 'UChicago Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://interconapps.uchospitals.edu/PRD-FHIR-Proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arrprox.mednet.ucla.edu/FHIRPRD/api/FHIR/R4', 'UCLA Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arrprox.mednet.ucla.edu/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0996.epichosted.com/FHIRProxy/api/FHIR/R4', 'UConn Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0996.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://unified-api.ucsf.edu/clinical/apex/api/FHIR/R4', 'UCSF Benioff Children'''s Hospital'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://unified-api.ucsf.edu/clinical/apex/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoap.shands.ufl.edu/FHIR/api/FHIR/R4', 'UF Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoap.shands.ufl.edu/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1130.epichosted.com/FHIRProxy/api/FHIR/R4', 'UHS San Antonio'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1130.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1085.epichosted.com/FHIRPROXY/api/FHIR/R4', 'UI Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1085.epichosted.com/FHIRPROXY/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ukepicproxy.mc.uky.edu/Interconnect-PRD-OAuth2/api/FHIR/R4', 'UK HealthCare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ukepicproxy.mc.uky.edu/Interconnect-PRD-OAuth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0978.epichosted.com/FHIRProxy/api/FHIR/R4', 'UMass Memorial Health Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0978.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1023.epichosted.com/FHIRProxy/api/FHIR/R4', 'UMC Southern Nevada'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1023.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicfe.unch.unc.edu/FHIR/api/FHIR/R4', 'UNC Health Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicfe.unch.unc.edu/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1127.epichosted.com/FHIRproxy/api/FHIR/R4', 'United Health Services New York (NYUHS)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1127.epichosted.com/FHIRproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1096.epichosted.com/FHIRProxy/api/fhir/r4', 'United Regional Health Care System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1096.epichosted.com/FHIRProxy/api/fhir/r4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicfhir.unitypoint.org/ProdFHIR/api/FHIR/R4', 'UnityPoint Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicfhir.unitypoint.org/ProdFHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soap.uhcs.org/IC-FHIR/api/FHIR/R4', 'University Health Care System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soap.uhcs.org/IC-FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0434.epichosted.com/APIProxyPRD/api/FHIR/R4', 'University Hospital (New Jersey)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0434.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://uhhsportal.uhhospitals.org/oauth2-prd/api/FHIR/R4', 'University Hospitals Cleveland'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://uhhsportal.uhhospitals.org/oauth2-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ucsoap.uams.edu/FHIRProxy/api/FHIR/R4', 'University of Arkansas for Medical Sciences'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ucsoap.uams.edu/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0502.epichosted.com/FHIRProxy/api/FHIR/R4', 'University of California Irvine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0502.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ss.uch.edu/FHIRProxy/api/FHIR/R4', 'University of Colorado Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ss.uch.edu/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://myepicapps.uihealthcare.org/FHIRProxy/api/FHIR/R4', 'University of Iowa Health Care'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://myepicapps.uihealthcare.org/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.kansashealthsystem.com/interconnect-PRD_FHIR/api/FHIR/R4', 'University of Kansas Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.kansashealthsystem.com/interconnect-PRD_FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1193.epichosted.com/FHIRProxy/api/FHIR/R4', 'University of Louisville Physicians'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1193.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.umm.edu/fhir/api/FHIR/R4', 'University of Maryland Medical System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.umm.edu/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0747.epichosted.com/APIProxyPRD/api/FHIR/R4', 'University of Miami (UHealth)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0747.epichosted.com/APIProxyPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://soapproxy.umc.edu/FHIRProxy/api/FHIR/R4', 'University of Mississippi Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://soapproxy.umc.edu/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-fhir-prd.upmc.com/FHIR-PRD/api/FHIR/R4', 'University of Pittsburgh Medical Center (UPMC)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-fhir-prd.upmc.com/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ercd-sproxy.urmc.rochester.edu/MIPS/api/FHIR/R4', 'University of Rochester Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ercd-sproxy.urmc.rochester.edu/MIPS/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-arr.utmb.edu/fhir-prd/api/FHIR/R4', 'University of Texas Medical Branch'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-arr.utmb.edu/fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://EpicIntprxyPRD.swmed.edu/FHIR/api/FHIR/R4', 'University of Texas Southwestern Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://EpicIntprxyPRD.swmed.edu/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://icon.utoledo.edu/ic-oa2-prd/api/FHIR/R4', 'University of Toledo'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://icon.utoledo.edu/ic-oa2-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://webproxyprd.med.utah.edu/FHIRMyChart/api/FHIR/R4', 'University of Utah Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://webproxyprd.med.utah.edu/FHIRMyChart/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://Epic-Arr.pinnaclehealth.org/PRD-FHIR-ARR/api/FHIR/R4', 'UPMC Central PA'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://Epic-Arr.pinnaclehealth.org/PRD-FHIR-ARR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0582.epichosted.com/FHIRProxy/api/FHIR/R4', 'UT Health San Antonio'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0582.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://hscsesoap.hscs.virginia.edu/FHIRProxy/api/FHIR/R4', 'UVA Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://hscsesoap.hscs.virginia.edu/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.hosp.wisc.edu/FhirProxy/api/FHIR/R4', 'UW Health And Affiliates - Wisconsin'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.hosp.wisc.edu/FhirProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://fhir.epic.medical.washington.edu/FHIR-Proxy/api/FHIR/R4', 'UW Medicine (Washington)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://fhir.epic.medical.washington.edu/FHIR-Proxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://ic.valleychildrens.org/fhir/api/FHIR/R4', 'Valley Children'''s Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://ic.valleychildrens.org/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1320.epichosted.com/FHIRProxy/api/FHIR/R4', 'Valley Health System (VA)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1320.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://api.valleyhealth.org/fhirproxy/api/FHIR/R4', 'Valley Health Systems'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://api.valleyhealth.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://FHIR.valleymed.org/FHIR-PRD/api/FHIR/R4', 'Valley Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://FHIR.valleymed.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://arr01.service.vumc.org/FHIR-PRD/api/FHIR/R4', 'Vanderbilt'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://arr01.service.vumc.org/FHIR-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1200.epichosted.com/OAuth2-PRD/api/FHIR/R4', 'VCU Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1200.epichosted.com/OAuth2-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://prd-proxy.vidanthealth.com/FHIR/api/FHIR/R4', 'Vidant Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://prd-proxy.vidanthealth.com/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://common.virginiahospitalcenter.com/FHIRPRD/api/FHIR/R4', 'Virginia Hospital Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://common.virginiahospitalcenter.com/FHIRPRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://rp.catholichealth.net/fhir/api/FHIR/R4', 'Virginia Mason Franciscan Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://rp.catholichealth.net/fhir/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1017.epichosted.com/FHIRProxy/api/FHIR/R4', 'Virtua Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1017.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://haiku.wacofhc.org/FHIR/api/FHIR/R4', 'Waco Family Medicine (Heart of Texas Community Health Center)'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://haiku.wacofhc.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-soap.wakemed.org/FHIR/api/FHIR/R4', 'WakeMed Health and Hospitals'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-soap.wakemed.org/FHIR/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://psacesoap.whhs.com/interconnect-fhir-prd/api/FHIR/R4', 'Washington Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://psacesoap.whhs.com/interconnect-fhir-prd/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epic-arr.watsonclinicad.com/FHIRProxy/api/FHIR/R4', 'Watson Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epic-arr.watsonclinicad.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://interconnect.wellspan.org/interconnect-prd-oauth2/api/FHIR/R4', 'WellSpan Health'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://interconnect.wellspan.org/interconnect-prd-oauth2/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicsoap.wellstar.org/fhirproxy/api/FHIR/R4', 'WellStar'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicsoap.wellstar.org/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1243.epichosted.com/OAuth2-PRD/api/FHIR/R4', 'West Tennessee Healthcare'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1243.epichosted.com/OAuth2-PRD/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://apps.mywvuchart.com/fhirproxy/api/FHIR/R4', 'West Virginia University Medicine'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://apps.mywvuchart.com/fhirproxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et1339.epichosted.com/FHIRProxy/api/FHIR/R4', 'Woman'''s'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et1339.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://epicproxy.et0943.epichosted.com/FHIRProxy/api/FHIR/R4', 'Yakima Valley Farm Workers Clinic'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://epicproxy.et0943.epichosted.com/FHIRProxy/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://patientfhirapis.ynhh.org/pff/api/FHIR/R4', 'Yale New Haven Health System'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://patientfhirapis.ynhh.org/pff/api/FHIR/R4', '/')));
INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
SELECT 'https://yrmccare1.yumaregional.org/FHIR/api/FHIR/R4', 'Yuma Regional Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM fhir_endpoint_directory WHERE lower(rtrim(iss_url, '/')) = lower(rtrim('https://yrmccare1.yumaregional.org/FHIR/api/FHIR/R4', '/')));

SELECT COUNT(*) AS total_endpoints FROM fhir_endpoint_directory;
