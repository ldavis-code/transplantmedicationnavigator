-- Migration: Add copay_url and copay_program_id to medications table
-- This ensures copay cards display correctly for commercial insurance users
-- Run this in Neon SQL Editor after 014_add_copay_cards.sql

-- ============================================
-- UPDATE MEDICATIONS WITH COPAY CARD INFO
-- ============================================

-- Zortress (Everolimus)
UPDATE medications SET
    copay_url = 'https://www.zortress.com/transplant/savings-and-support',
    copay_program_id = 'zortress-copay'
WHERE id = 'everolimus';

-- Nulojix (Belatacept)
UPDATE medications SET
    copay_url = 'https://www.bmsaccesssupport.com/patient',
    copay_program_id = 'nulojix-copay'
WHERE id = 'belatacept';

-- Simulect (Basiliximab)
UPDATE medications SET
    copay_url = 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance',
    copay_program_id = 'simulect-copay'
WHERE id = 'simulect';

-- Thymoglobulin (ATG)
UPDATE medications SET
    copay_url = 'https://www.thymoglobulin.com/resources',
    copay_program_id = 'thymoglobulin-copay'
WHERE id = 'thymoglobulin';

-- Cresemba (Isavuconazonium)
UPDATE medications SET
    copay_url = 'https://www.astellaspharmasupportsolutions.com/',
    copay_program_id = 'cresemba-copay'
WHERE id = 'cresemba';

-- Entresto (Sacubitril/Valsartan)
UPDATE medications SET
    copay_url = 'https://www.entresto.com/savings-and-support',
    copay_program_id = 'entresto-copay'
WHERE id = 'entresto';

-- Jardiance (Empagliflozin)
UPDATE medications SET
    copay_url = 'https://www.jardiance.com/savings/',
    copay_program_id = 'jardiance-copay'
WHERE id = 'jardiance';

-- Farxiga (Dapagliflozin)
UPDATE medications SET
    copay_url = 'https://www.farxiga.com/savings-and-support',
    copay_program_id = 'farxiga-copay'
WHERE id = 'farxiga';

-- Xarelto (Rivaroxaban)
UPDATE medications SET
    copay_url = 'https://www.xarelto-us.com/savings',
    copay_program_id = 'xarelto-copay'
WHERE id = 'rivaroxaban';

-- Januvia (Sitagliptin)
UPDATE medications SET
    copay_url = 'https://www.januvia.com/savings-and-resources/',
    copay_program_id = 'januvia-copay'
WHERE id = 'sitagliptin';

-- Ozempic (Semaglutide)
UPDATE medications SET
    copay_url = 'https://www.ozempic.com/savings-and-resources/save-on-ozempic.html',
    copay_program_id = 'ozempic-copay'
WHERE id = 'semaglutide';

-- Trulicity (Dulaglutide)
UPDATE medications SET
    copay_url = 'https://www.trulicity.com/savings-and-resources',
    copay_program_id = 'trulicity-copay'
WHERE id = 'dulaglutide';

-- Opsumit (Macitentan)
UPDATE medications SET
    copay_url = 'https://www.opsumit.com/support',
    copay_program_id = 'opsumit-copay'
WHERE id = 'opsumit';

-- Adempas (Riociguat)
UPDATE medications SET
    copay_url = 'https://www.adempas-us.com/cteph/financial-support',
    copay_program_id = 'adempas-copay'
WHERE id = 'adempas';

-- Uptravi (Selexipag)
UPDATE medications SET
    copay_url = 'https://www.uptravi.com/support',
    copay_program_id = 'uptravi-copay'
WHERE id = 'uptravi';

-- Remodulin (Treprostinil)
UPDATE medications SET
    copay_url = 'https://unitedtherapeuticscares.com/',
    copay_program_id = 'tyvaso-copay'
WHERE id = 'remodulin';

-- Spiriva (Tiotropium)
UPDATE medications SET
    copay_url = 'https://www.spiriva.com/copd-resources/savings',
    copay_program_id = 'spiriva-copay'
WHERE id = 'tiotropium';

-- Breo Ellipta (Fluticasone/Vilanterol)
UPDATE medications SET
    copay_url = 'https://www.breoellipta.com/savings/',
    copay_program_id = 'breo-copay'
WHERE id = 'fluticasone-vilanterol';

-- Nucala (Mepolizumab)
UPDATE medications SET
    copay_url = 'https://www.nucala.com/severe-eosinophilic-asthma/nucala-costs/',
    copay_program_id = 'nucala-copay'
WHERE id = 'mepolizumab';

-- Fasenra (Benralizumab)
UPDATE medications SET
    copay_url = 'https://www.fasenra.com/savings-and-support/',
    copay_program_id = 'fasenra-copay'
WHERE id = 'benralizumab';

-- Dupixent (Dupilumab)
UPDATE medications SET
    copay_url = 'https://www.dupixent.com/support-savings/dupixent-my-way',
    copay_program_id = 'dupixent-copay'
WHERE id = 'dupilumab';

-- Tezspire (Tezepelumab)
UPDATE medications SET
    copay_url = 'https://www.tezspire.com/savings/',
    copay_program_id = 'tezspire-copay'
WHERE id = 'tezepelumab';

-- Xolair (Omalizumab)
UPDATE medications SET
    copay_url = 'https://www.xolair.com/allergic-asthma/financial-support.html',
    copay_program_id = 'xolair-copay'
WHERE id = 'omalizumab';

-- Anoro Ellipta (Umeclidinium/Vilanterol)
UPDATE medications SET
    copay_url = 'https://www.anoro.com/savings-and-support/',
    copay_program_id = 'anoro-copay'
WHERE id = 'umeclidinium-vilanterol';

-- Dulera (Mometasone/Formoterol)
UPDATE medications SET
    copay_url = 'https://www.dulera.com/savings/',
    copay_program_id = 'dulera-copay'
WHERE id = 'mometasone-formoterol';

-- Vemlidy (Tenofovir Alafenamide)
UPDATE medications SET
    copay_url = 'https://www.gileadadvancingaccess.com/',
    copay_program_id = 'vemlidy-copay'
WHERE id = 'vemlidy';

-- Epclusa (Sofosbuvir/Velpatasvir)
UPDATE medications SET
    copay_url = 'https://www.gileadadvancingaccess.com/',
    copay_program_id = 'epclusa-copay'
WHERE id = 'epclusa';

-- Mavyret (Glecaprevir/Pibrentasvir)
UPDATE medications SET
    copay_url = 'https://www.mavyret.com/savings',
    copay_program_id = 'mavyret-copay'
WHERE id = 'mavyret';

-- Creon (Pancrelipase)
UPDATE medications SET
    copay_url = 'https://www.creoninfo.com/savings/',
    copay_program_id = 'creon-copay'
WHERE id = 'creon';

-- Auryxia (Ferric Citrate)
UPDATE medications SET
    copay_url = 'https://www.akebiacares.com/',
    copay_program_id = 'auryxia-copay'
WHERE id = 'auryxia';

-- Rezdiffra (Resmetirom)
UPDATE medications SET
    copay_url = 'https://madrigalpatientsupport.com/',
    copay_program_id = 'rezdiffra-copay'
WHERE id = 'resmetirom';

-- Prevymis (Letermovir)
UPDATE medications SET
    copay_url = 'https://www.merckhelps.com/',
    copay_program_id = 'prevymis-copay'
WHERE id = 'prevymis';

-- Livtencity (Maribavir)
UPDATE medications SET
    copay_url = 'https://www.takeda.com/en-us/what-we-do/patient-services/',
    copay_program_id = 'livtencity-copay'
WHERE id = 'livtencity';

-- Lyrica (Pregabalin)
UPDATE medications SET
    copay_url = 'https://www.pfizerrxpathways.com/',
    copay_program_id = 'lyrica-copay'
WHERE id = 'pregabalin';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify medications have copay info:
-- SELECT id, brand_name, copay_url, copay_program_id FROM medications WHERE copay_url IS NOT NULL ORDER BY id;
