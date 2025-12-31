#!/usr/bin/env node
/**
 * Sync Medications to Neon Database
 *
 * This script reads medications from the local JSON file and syncs them
 * to the Neon PostgreSQL database using upsert operations.
 *
 * Usage:
 *   export DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/dbname?sslmode=require'
 *   node sync_medications_to_neon.js
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error("  export DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/dbname?sslmode=require'");
  console.error('  node sync_medications_to_neon.js');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

/**
 * Load medications from the local JSON file
 */
function loadMedications() {
  const medicationsPath = join(__dirname, 'src', 'data', 'medications.json');
  const data = readFileSync(medicationsPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Sync a single medication to the database
 */
async function syncMedication(medication) {
  const {
    id,
    brandName,
    genericName,
    rxcui,
    category,
    manufacturer,
    stage,
    commonOrgans,
    papUrl,
    cost_tier,
    generic_available,
    typical_copay_tier,
    papProgramId,
    copayUrl,
    copayProgramId,
    supportUrl
  } = medication;

  // Convert typical_copay_tier to string for consistency
  const copayTierStr = typical_copay_tier !== undefined ? String(typical_copay_tier) : null;

  await sql`
    INSERT INTO medications (
      id,
      brand_name,
      generic_name,
      rxcui,
      category,
      manufacturer,
      stage,
      common_organs,
      pap_url,
      cost_tier,
      generic_available,
      typical_copay_tier,
      pap_program_id,
      copay_url,
      copay_program_id,
      support_url,
      created_at,
      updated_at
    ) VALUES (
      ${id},
      ${brandName},
      ${genericName},
      ${rxcui || null},
      ${category},
      ${manufacturer || null},
      ${stage || null},
      ${commonOrgans || []},
      ${papUrl || null},
      ${cost_tier || null},
      ${generic_available ?? null},
      ${copayTierStr},
      ${papProgramId || null},
      ${copayUrl || null},
      ${copayProgramId || null},
      ${supportUrl || null},
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      brand_name = EXCLUDED.brand_name,
      generic_name = EXCLUDED.generic_name,
      rxcui = EXCLUDED.rxcui,
      category = EXCLUDED.category,
      manufacturer = EXCLUDED.manufacturer,
      stage = EXCLUDED.stage,
      common_organs = EXCLUDED.common_organs,
      pap_url = EXCLUDED.pap_url,
      cost_tier = EXCLUDED.cost_tier,
      generic_available = EXCLUDED.generic_available,
      typical_copay_tier = EXCLUDED.typical_copay_tier,
      pap_program_id = EXCLUDED.pap_program_id,
      copay_url = EXCLUDED.copay_url,
      copay_program_id = EXCLUDED.copay_program_id,
      support_url = EXCLUDED.support_url,
      updated_at = NOW()
  `;
}

/**
 * Main sync function
 */
async function syncAllMedications() {
  console.log('Loading medications from JSON file...');
  const medications = loadMedications();
  console.log(`Found ${medications.length} medications to sync`);

  let synced = 0;
  let errors = 0;

  console.log('Starting sync to Neon database...\n');

  for (const medication of medications) {
    try {
      await syncMedication(medication);
      synced++;
      // Progress indicator every 10 medications
      if (synced % 10 === 0) {
        process.stdout.write(`\rSynced ${synced}/${medications.length} medications...`);
      }
    } catch (error) {
      errors++;
      console.error(`\nError syncing ${medication.id}: ${error.message}`);
    }
  }

  console.log(`\n\nSync complete!`);
  console.log(`  Successfully synced: ${synced}`);
  if (errors > 0) {
    console.log(`  Errors: ${errors}`);
  }

  // Verify the count in the database
  const result = await sql`SELECT COUNT(*) as count FROM medications`;
  console.log(`  Total medications in database: ${result[0].count}`);
}

// Run the sync
syncAllMedications()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
