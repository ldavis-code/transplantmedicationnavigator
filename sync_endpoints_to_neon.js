#!/usr/bin/env node
/**
 * Sync FHIR Endpoints to Neon Database
 *
 * Reads the Epic FHIR endpoint catalog from src/data/epic-endpoints.json (the
 * same list that powers the health-system picker) and syncs it into the Neon
 * fhir_endpoint_directory table. This is what lets login tracking resolve an
 * iss URL to a named center on the Center Logins admin dashboard.
 *
 * Matching is by iss_url, case- and trailing-slash-insensitive, to mirror the
 * lookup done at login time in epic-token-exchange.js.
 *
 * On update we only refresh brand_name (and updated_at) — curated columns like
 * facility_city/facility_state/is_transplant_ctr/epic_org_id are left untouched
 * so manual enrichment in the table is never clobbered.
 *
 * Usage:
 *   export DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/dbname?sslmode=require'
 *   node sync_endpoints_to_neon.js
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error("  export DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/dbname?sslmode=require'");
  console.error('  node sync_endpoints_to_neon.js');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function loadEndpoints() {
  const path = join(__dirname, 'src', 'data', 'epic-endpoints.json');
  const data = readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

/**
 * Upsert a single endpoint, keyed on a normalized iss_url so it matches the
 * runtime lookup (lower + trailing-slash stripped).
 */
async function syncEndpoint(endpoint) {
  const issUrl = endpoint.fhirBaseUrl;
  const brandName = endpoint.name;

  if (!issUrl || !brandName) {
    throw new Error(`endpoint missing fhirBaseUrl or name: ${JSON.stringify(endpoint)}`);
  }

  const existing = await sql`
    SELECT id FROM fhir_endpoint_directory
    WHERE lower(rtrim(iss_url, '/')) = lower(rtrim(${issUrl}, '/'))
    LIMIT 1
  `;

  if (existing.length > 0) {
    await sql`
      UPDATE fhir_endpoint_directory
      SET brand_name = ${brandName}, updated_at = NOW()
      WHERE id = ${existing[0].id}
    `;
    return 'updated';
  }

  await sql`
    INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
    VALUES (${issUrl}, ${brandName})
  `;
  return 'inserted';
}

async function main() {
  console.log('Loading FHIR endpoints from src/data/epic-endpoints.json...');
  const endpoints = loadEndpoints();
  console.log(`Found ${endpoints.length} endpoints to sync.\n`);

  const stats = { inserted: 0, updated: 0, errors: 0 };

  for (const endpoint of endpoints) {
    try {
      const result = await syncEndpoint(endpoint);
      stats[result]++;
      if ((stats.inserted + stats.updated) % 50 === 0) {
        console.log(`  ...${stats.inserted + stats.updated}/${endpoints.length}`);
      }
    } catch (error) {
      stats.errors++;
      console.error(`  ✗ ${endpoint.name || endpoint.id}: ${error.message}`);
    }
  }

  console.log('\n=== Sync Complete ===');
  console.log(`  Inserted: ${stats.inserted}`);
  console.log(`  Updated:  ${stats.updated}`);
  if (stats.errors > 0) console.log(`  Errors:   ${stats.errors}`);

  const result = await sql`SELECT COUNT(*) AS count FROM fhir_endpoint_directory`;
  console.log(`\n  Total endpoints in directory: ${result[0].count}`);
}

main()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
