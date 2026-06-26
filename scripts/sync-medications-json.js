#!/usr/bin/env node
/**
 * Sync src/data/medications.json FROM the Neon database.
 *
 * Neon is the source of truth for medications. This script regenerates the
 * bundled JSON (used as the offline fallback and to backfill null program
 * fields at runtime) so it stays in sync with the database — no more manual
 * editing after you change the table.
 *
 * It PRESERVES any medication that exists only in the JSON and not in the DB
 * (e.g. an intentional offline-only entry) so nothing is silently dropped, and
 * it WARNS about duplicate rows in the DB (same brand + generic, multiple ids)
 * so you know to clean them up — see scripts/medications-cleanup.sql.
 *
 * Recommended order:
 *   1. Run scripts/medications-cleanup.sql in the Neon SQL editor (dedupe +
 *      backfill common_organs / stage / PAP).
 *   2. Run this script to regenerate the JSON from the cleaned table.
 *
 * Usage:
 *   export DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require'
 *   node scripts/sync-medications-json.js
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const JSON_PATH = join(__dirname, '..', 'src', 'data', 'medications.json');

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required.');
    console.error("  export DATABASE_URL='postgresql://...sslmode=require'");
    console.error('  node scripts/sync-medications-json.js');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

/** Map a DB row (snake_case) to the medications.json shape (camelCase). */
function transform(row) {
    const out = {
        id: row.id,
        brandName: row.brand_name,
        genericName: row.generic_name,
        rxcui: row.rxcui ?? null,
        category: row.category,
        manufacturer: row.manufacturer ?? null,
        stage: row.stage ?? null,
        commonOrgans: row.common_organs || [],
        papUrl: row.pap_url ?? null,
        papProgramId: row.pap_program_id ?? null,
        copayUrl: row.copay_url ?? null,
        copayProgramId: row.copay_program_id ?? null,
        supportUrl: row.support_url ?? null,
        cost_tier: row.cost_tier ?? null,
        generic_available: row.generic_available ?? null,
        typical_copay_tier: row.typical_copay_tier ?? null,
    };
    // Optional richer fields — only include when present to keep the file tidy.
    if (row.copay_program) out.copayProgram = row.copay_program;
    if (row.pap_program) out.papProgram = row.pap_program;
    if (row.medicare_partd) out.medicarePartD = row.medicare_partd;
    if (row.cost_plus_slug) out.costPlusSlug = row.cost_plus_slug;
    if (row.goodrx_slug) out.goodrxSlug = row.goodrx_slug;
    if (row.singlecare_slug) out.singlecareSlug = row.singlecare_slug;
    return out;
}

async function main() {
    const rows = await sql`SELECT * FROM medications ORDER BY category, generic_name`;
    const dbMeds = rows.map(transform);
    const dbIds = new Set(dbMeds.map(m => m.id));

    // Warn about duplicate rows (same brand + generic with multiple ids).
    const groups = new Map();
    for (const m of dbMeds) {
        const key = `${(m.brandName || '').toLowerCase()}|${(m.genericName || '').toLowerCase()}`;
        groups.set(key, (groups.get(key) || []).concat(m.id));
    }
    const dups = [...groups.entries()].filter(([, ids]) => ids.length > 1);
    if (dups.length) {
        console.warn(`\n⚠️  ${dups.length} duplicate brand+generic group(s) found in the DB (left as-is in JSON):`);
        for (const [key, ids] of dups) console.warn(`   ${key.split('|')[0]} -> ${ids.join(', ')}`);
        console.warn('   Clean these up with scripts/medications-cleanup.sql, then re-run.\n');
    }

    // Preserve medications that exist only in the JSON (not in the DB).
    let existing = [];
    try {
        existing = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
    } catch {
        // first run / unreadable — start fresh
    }
    const jsonOnly = existing.filter(m => !dbIds.has(m.id));
    if (jsonOnly.length) {
        console.log(`Preserving ${jsonOnly.length} JSON-only med(s) not in the DB: ${jsonOnly.map(m => m.id).join(', ')}`);
    }

    const merged = [...dbMeds, ...jsonOnly];
    writeFileSync(JSON_PATH, JSON.stringify(merged, null, 2) + '\n');
    console.log(`\n✅ Wrote ${merged.length} medications to src/data/medications.json (${dbMeds.length} from DB + ${jsonOnly.length} JSON-only).`);
}

main().catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
});
