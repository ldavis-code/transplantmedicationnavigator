-- Migration 034: Populate copay_url and copay_program_id for core medications
-- These 20 medications had copay data in medications.json but not in the
-- Neon database, causing /out/ redirect lookups to fail for the most
-- important transplant drugs (Prograf, CellCept, Myfortic, Eliquis, etc.)

-- Tacrolimus (Prograf / Envarsus XR / Astagraf XL) - Astellas
UPDATE medications SET
    copay_url = 'https://www.astellaspharmasupportsolutions.com/',
    copay_program_id = 'astellas-copay'
WHERE id = 'tacrolimus' AND copay_program_id IS NULL;

-- Cyclosporine (Neoral / Sandimmune / Gengraf) - Novartis
UPDATE medications SET
    copay_url = 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance',
    copay_program_id = 'novartis-copay'
WHERE id = 'cyclosporine' AND copay_program_id IS NULL;

-- Mycophenolate Mofetil (CellCept) - Genentech
UPDATE medications SET
    copay_url = 'https://www.genentech-access.com/patient.html',
    copay_program_id = 'genentech-copay'
WHERE id = 'mycophenolate' AND copay_program_id IS NULL;

-- Mycophenolate Sodium (Myfortic) - Novartis
UPDATE medications SET
    copay_url = 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance',
    copay_program_id = 'novartis-copay'
WHERE id = 'myfortic' AND copay_program_id IS NULL;

-- Sirolimus (Rapamune) - Pfizer
UPDATE medications SET
    copay_url = 'https://www.pfizerrxpathways.com/',
    copay_program_id = 'pfizer-copay'
WHERE id = 'sirolimus' AND copay_program_id IS NULL;

-- ATGAM (Anti-Thymocyte Globulin) - Pfizer
UPDATE medications SET
    copay_url = 'https://www.pfizerrxpathways.com/',
    copay_program_id = 'pfizer-copay'
WHERE id = 'atgam' AND copay_program_id IS NULL;

-- Valcyte (Valganciclovir) - Genentech
UPDATE medications SET
    copay_url = 'https://www.genentech-access.com/patient.html',
    copay_program_id = 'genentech-copay'
WHERE id = 'valcyte' AND copay_program_id IS NULL;

-- Cytovene (Ganciclovir) - Genentech
UPDATE medications SET
    copay_url = 'https://www.genentech-access.com/patient.html',
    copay_program_id = 'genentech-copay'
WHERE id = 'cytovene' AND copay_program_id IS NULL;

-- Diflucan (Fluconazole) - Pfizer
UPDATE medications SET
    copay_url = 'https://www.pfizerrxpathways.com/',
    copay_program_id = 'pfizer-copay'
WHERE id = 'diflucan' AND copay_program_id IS NULL;

-- Noxafil (Posaconazole) - Merck
UPDATE medications SET
    copay_url = 'https://www.merckhelps.com/',
    copay_program_id = 'merck-copay'
WHERE id = 'noxafil' AND copay_program_id IS NULL;

-- Vfend (Voriconazole) - Pfizer
UPDATE medications SET
    copay_url = 'https://www.pfizerrxpathways.com/',
    copay_program_id = 'pfizer-copay'
WHERE id = 'vfend' AND copay_program_id IS NULL;

-- Renvela (Sevelamer) - Sanofi
UPDATE medications SET
    copay_url = 'https://www.sanofipatientconnection.com/',
    copay_program_id = 'sanofi-copay'
WHERE id = 'renvela' AND copay_program_id IS NULL;

-- Revatio (Sildenafil) - Pfizer
UPDATE medications SET
    copay_url = 'https://www.pfizerrxpathways.com/',
    copay_program_id = 'pfizer-copay'
WHERE id = 'revatio' AND copay_program_id IS NULL;

-- Campath / Lemtrada (Alemtuzumab) - Sanofi
UPDATE medications SET
    copay_url = 'https://www.sanofipatientconnection.com/',
    copay_program_id = 'sanofi-copay'
WHERE id = 'campath' AND copay_program_id IS NULL;

-- Rituxan (Rituximab) - Genentech
UPDATE medications SET
    copay_url = 'https://www.genentech-access.com/patient.html',
    copay_program_id = 'genentech-copay'
WHERE id = 'rituxan' AND copay_program_id IS NULL;

-- Lantus / Basaglar (Insulin Glargine)
UPDATE medications SET
    copay_url = 'https://www.lantus.com/sign-up-for-savings',
    copay_program_id = 'lantus-copay'
WHERE id = 'insulin-glargine' AND copay_program_id IS NULL;

-- Humalog (Insulin Lispro)
UPDATE medications SET
    copay_url = 'https://www.humalog.com/savings-support',
    copay_program_id = 'humalog-copay'
WHERE id = 'insulin-lispro' AND copay_program_id IS NULL;

-- Novolog (Insulin Aspart)
UPDATE medications SET
    copay_url = 'https://www.novolog.com/savings-card',
    copay_program_id = 'novolog-copay'
WHERE id = 'insulin-aspart' AND copay_program_id IS NULL;

-- Advair (Fluticasone/Salmeterol)
UPDATE medications SET
    copay_url = 'https://www.advair.com/savings-and-support/',
    copay_program_id = 'advair-copay'
WHERE id = 'fluticasone-salmeterol' AND copay_program_id IS NULL;

-- Symbicort (Budesonide/Formoterol)
UPDATE medications SET
    copay_url = 'https://www.symbicort.com/savings-and-support',
    copay_program_id = 'symbicort-copay'
WHERE id = 'budesonide-formoterol' AND copay_program_id IS NULL;

-- Apixaban (Eliquis) - BMS
UPDATE medications SET
    copay_url = 'https://www.eliquis.bmscustomerconnect.com/savings',
    copay_program_id = 'eliquis-copay'
WHERE id = 'apixaban' AND copay_program_id IS NULL;
