#!/usr/bin/env node
/**
 * Sync Programs to Neon Database
 *
 * This script reads copay cards, PAPs, and foundation programs from the local
 * programs.json file and syncs them to the Neon PostgreSQL savings_programs table.
 *
 * Usage:
 *   export DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/dbname?sslmode=require'
 *   node sync_programs_to_neon.js
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
  console.error('  node sync_programs_to_neon.js');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

/**
 * Load programs from the local JSON file
 */
function loadPrograms() {
  const programsPath = join(__dirname, 'src', 'data', 'programs.json');
  const data = readFileSync(programsPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Map program type from JSON structure to database enum
 */
function mapProgramType(jsonType) {
  const mapping = {
    copayPrograms: 'copay_card',
    papPrograms: 'pap',
    foundationPrograms: 'foundation',
  };
  return mapping[jsonType] || 'copay_card';
}

/**
 * Sync a single program to the database
 * Uses program_name + program_type as unique identifier for upsert
 */
async function syncProgram(program, programType, medications) {
  const {
    programId,
    name,
    manufacturer,
    url,
    phone,
    eligibility,
    maxBenefit,
    incomeLimit,
    notes,
  } = program;

  // For each medication linked to this program, create a separate entry
  // If no medications (like foundations), create one entry with null medication_id
  const medsToSync = medications && medications.length > 0 ? medications : [null];

  for (const medId of medsToSync) {
    try {
      // Check if this program already exists for this medication
      const existing = await sql`
        SELECT id FROM savings_programs
        WHERE program_name = ${name}
        AND program_type = ${programType}
        AND (medication_id = ${medId} OR (medication_id IS NULL AND ${medId} IS NULL))
      `;

      if (existing.length > 0) {
        // Update existing program
        await sql`
          UPDATE savings_programs SET
            manufacturer = ${manufacturer || null},
            commercial_eligible = ${eligibility?.commercial ?? false},
            medicare_eligible = ${eligibility?.medicare ?? false},
            medicaid_eligible = ${eligibility?.medicaid ?? false},
            uninsured_eligible = ${eligibility?.uninsured ?? false},
            tricare_va_eligible = ${false},
            ihs_tribal_eligible = ${false},
            income_limit = ${incomeLimit || null},
            max_benefit = ${maxBenefit || null},
            application_url = ${url || null},
            phone = ${phone || null},
            fund_status_note = ${notes || null},
            is_active = true,
            updated_at = NOW()
          WHERE id = ${existing[0].id}
        `;
      } else {
        // Insert new program
        await sql`
          INSERT INTO savings_programs (
            program_name,
            program_type,
            manufacturer,
            medication_id,
            commercial_eligible,
            medicare_eligible,
            medicaid_eligible,
            uninsured_eligible,
            tricare_va_eligible,
            ihs_tribal_eligible,
            income_limit,
            max_benefit,
            application_url,
            phone,
            fund_status_note,
            is_active,
            created_at,
            updated_at
          ) VALUES (
            ${name},
            ${programType},
            ${manufacturer || null},
            ${medId},
            ${eligibility?.commercial ?? false},
            ${eligibility?.medicare ?? false},
            ${eligibility?.medicaid ?? false},
            ${eligibility?.uninsured ?? false},
            ${false},
            ${false},
            ${incomeLimit || null},
            ${maxBenefit || null},
            ${url || null},
            ${phone || null},
            ${notes || null},
            true,
            NOW(),
            NOW()
          )
        `;
      }
    } catch (error) {
      // If medication doesn't exist in medications table, skip medication-specific entry
      if (error.message.includes('foreign key constraint')) {
        console.warn(`  Warning: Medication '${medId}' not found in database, skipping link`);
        continue;
      }
      throw error;
    }
  }
}

/**
 * Main sync function
 */
async function syncAllPrograms() {
  console.log('Loading programs from JSON file...');
  const programs = loadPrograms();

  const stats = {
    copayCards: 0,
    paps: 0,
    foundations: 0,
    errors: 0,
  };

  console.log('\n=== Syncing Copay Cards ===');
  for (const [programId, program] of Object.entries(programs.copayPrograms || {})) {
    try {
      await syncProgram(program, 'copay_card', program.medications);
      stats.copayCards++;
      console.log(`  ✓ ${program.name}`);
    } catch (error) {
      stats.errors++;
      console.error(`  ✗ Error syncing ${program.name}: ${error.message}`);
    }
  }

  console.log('\n=== Syncing Patient Assistance Programs (PAPs) ===');
  for (const [programId, program] of Object.entries(programs.papPrograms || {})) {
    try {
      await syncProgram(program, 'pap', program.medications);
      stats.paps++;
      console.log(`  ✓ ${program.name}`);
    } catch (error) {
      stats.errors++;
      console.error(`  ✗ Error syncing ${program.name}: ${error.message}`);
    }
  }

  console.log('\n=== Syncing Foundation Programs ===');
  for (const [programId, program] of Object.entries(programs.foundationPrograms || {})) {
    try {
      await syncProgram(program, 'foundation', null);
      stats.foundations++;
      console.log(`  ✓ ${program.name}`);
    } catch (error) {
      stats.errors++;
      console.error(`  ✗ Error syncing ${program.name}: ${error.message}`);
    }
  }

  console.log('\n=== Sync Complete ===');
  console.log(`  Copay Cards synced: ${stats.copayCards}`);
  console.log(`  PAPs synced: ${stats.paps}`);
  console.log(`  Foundations synced: ${stats.foundations}`);
  if (stats.errors > 0) {
    console.log(`  Errors: ${stats.errors}`);
  }

  // Verify the count in the database
  const result = await sql`SELECT COUNT(*) as count FROM savings_programs`;
  console.log(`\n  Total programs in database: ${result[0].count}`);

  // Show breakdown by type
  const breakdown = await sql`
    SELECT program_type, COUNT(*) as count
    FROM savings_programs
    GROUP BY program_type
    ORDER BY program_type
  `;
  console.log('\n  Breakdown by type:');
  for (const row of breakdown) {
    console.log(`    ${row.program_type}: ${row.count}`);
  }
}

// Run the sync
syncAllPrograms()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
