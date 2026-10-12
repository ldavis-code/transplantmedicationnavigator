#!/usr/bin/env node
/**
 * Sync per-program eligibility FROM Neon INTO src/data/programs.json.
 *
 * Requires migration 056 (db/migrations/056_program_eligibility_fields.sql).
 * Neon is where the eligibility fields are maintained; the site reads them
 * from programs.json (the build then derives program-eligibility.json for the
 * medication card). Same pattern as scripts/sync-medications-json.js.
 *
 * Never silently changes data:
 *   - Without --write it only reports. Every difference between Neon and
 *     programs.json is printed as a conflict for review.
 *   - With --write, Neon values are copied in. A NULL in Neon never erases a
 *     value programs.json already has; that case is reported instead.
 *
 * Usage:
 *   export DATABASE_URL='postgresql://...sslmode=require'
 *   node scripts/sync-program-eligibility.js            # report only
 *   node scripts/sync-program-eligibility.js --write    # apply
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROGRAMS_PATH = join(__dirname, '..', 'src', 'data', 'programs.json');
const WRITE = process.argv.includes('--write');

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required.');
    process.exit(1);
}

// Neon column -> programs.json eligibility key
const FIELDS = {
    accepts_commercial: 'commercial',
    accepts_medicare: 'medicare',
    accepts_medicaid: 'medicaid',
    accepts_uninsured: 'uninsured',
    excludes_extra_help: 'excludesExtraHelp',
    requires_medicaid_denial: 'requiresMedicaidDenial',
    eligibility_verified_date: 'verifiedDate',
    eligibility_source_url: 'sourceUrl',
};

const { neon } = await import('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT program_id, ${sql.unsafe(Object.keys(FIELDS).join(', '))} FROM programs`;

const programs = JSON.parse(readFileSync(PROGRAMS_PATH, 'utf8'));
const findProgram = (id) => {
    for (const g of ['copayPrograms', 'papPrograms', 'foundationPrograms']) {
        if (programs[g]?.[id]) return programs[g][id];
    }
    return null;
};
const norm = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);

let changes = 0;
const conflicts = [];
for (const row of rows) {
    const p = findProgram(row.program_id);
    if (!p) { conflicts.push(`${row.program_id}: in Neon, not in programs.json`); continue; }
    const elig = { ...(p.eligibility || {}) };
    for (const [col, key] of Object.entries(FIELDS)) {
        const neonVal = norm(row[col]);
        const jsonVal = elig[key] ?? null;
        if (neonVal === null) {
            if (jsonVal !== null) conflicts.push(`${row.program_id}.${key}: programs.json has ${JSON.stringify(jsonVal)}, Neon is NULL (kept)`);
            continue;
        }
        if (neonVal !== jsonVal) {
            conflicts.push(`${row.program_id}.${key}: programs.json ${JSON.stringify(jsonVal)} -> Neon ${JSON.stringify(neonVal)}`);
            elig[key] = neonVal;
            changes++;
        }
    }
    if (WRITE) p.eligibility = elig;
}

console.log(conflicts.length ? `Differences (${conflicts.length}):\n  ${conflicts.join('\n  ')}` : 'No differences.');
if (WRITE && changes) {
    writeFileSync(PROGRAMS_PATH, JSON.stringify(programs, null, 2) + '\n', 'utf8');
    console.log(`programs.json updated: ${changes} value(s). Run npm run report:meds to refresh the review list.`);
} else if (changes) {
    console.log(`${changes} value(s) would change. Re-run with --write to apply.`);
}
