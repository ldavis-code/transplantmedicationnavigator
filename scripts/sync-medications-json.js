#!/usr/bin/env node
/**
 * Sync src/data/medications.json FROM the Neon database.
 *
 * Neon is the source of truth for medications. This script regenerates the
 * bundled JSON (used as the offline fallback and to backfill null program
 * fields at runtime) so it stays in sync with the database — no more manual
 * editing after you change the table.
 *
 * The file is EXACTLY the DB catalogue: a medication that exists only in the
 * JSON and not in the DB is dropped (and logged), so the file's row count IS
 * the medication count every stat surface quotes — one number, one source.
 *
 * Recommended order:
 *   1. Run scripts/medications-cleanup.sql in the Neon SQL editor (dedupe +
 *      backfill common_organs / stage / PAP).
 *   2. Run this script to regenerate the JSON from the cleaned table.
 *
 * It also PRESERVES a curated field the JSON has and the DB row leaves null
 * (a copay URL, a PAP program id). Those are the exact fields
 * MedicationsContext already backfills from this file at runtime
 * (`dbMed.copayUrl || fallbackMed.copayUrl`), so writing the DB's null over
 * them would only make the offline fallback poorer than the live site. A
 * non-null DB value always wins; Neon is still the source of truth for
 * everything it actually knows.
 *
 * A DB row keyed by a UUID whose brand + generic matches a slug-keyed record
 * already in the JSON (e.g. the DB's UUID-keyed Ofev row next to the file's
 * "ofev") keeps the slug as its id: the slug is the /medications/<id> URL
 * patients and crawlers already have, and MedicationsContext's runtime dedupe
 * prefers it the same way. The row's data still comes from the DB.
 *
 * Two sources, same output:
 *   - DATABASE_URL set  -> read the medications table directly.
 *   - --api[=URL]       -> read the deployed /.netlify/functions/medications
 *                          endpoint instead (same table, no credentials
 *                          needed). Defaults to production.
 *
 * Usage:
 *   export DATABASE_URL='postgresql://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require'
 *   node scripts/sync-medications-json.js
 *   node scripts/sync-medications-json.js --api
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const JSON_PATH = join(__dirname, '..', 'src', 'data', 'medications.json');
const CONDITIONS_PATH = join(__dirname, '..', 'src', 'data', 'conditions.json');

const DEFAULT_API = 'https://transplantmedicationnavigator.com/.netlify/functions/medications';
const apiArg = process.argv.find(a => a === '--api' || a.startsWith('--api='));
const API_URL = apiArg ? (apiArg.split('=')[1] || DEFAULT_API) : null;

if (!API_URL && !process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is required (or pass --api).');
    console.error("  export DATABASE_URL='postgresql://...sslmode=require'");
    console.error('  node scripts/sync-medications-json.js');
    console.error('  node scripts/sync-medications-json.js --api');
    process.exit(1);
}

// Imported lazily so the --api path runs without the Neon driver installed.
const connect = async () => {
    const { neon } = await import('@neondatabase/serverless');
    return neon(process.env.DATABASE_URL);
};

// Fields whose curated JSON value survives a null in the DB row. Kept in sync
// with the explicit fallbacks in MedicationsContext.jsx.
const PRESERVE_WHEN_DB_NULL = [
    'condition',
    'papUrl',
    'papProgramId',
    'copayUrl',
    'copayProgramId',
    'supportUrl',
];

const isSet = (value) => value !== null && value !== undefined && value !== '';

/** Map a DB row (snake_case) to the medications.json shape (camelCase). */
function transform(row) {
    const out = {
        id: row.id,
        brandName: row.brand_name,
        genericName: row.generic_name,
        rxcui: row.rxcui ?? null,
        category: row.category,
        condition: row.condition ?? null,
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

/** Read the medications table, either straight from Neon or via the API. */
async function loadDbMeds() {
    if (!API_URL) {
        const sql = await connect();
        const rows = await sql`SELECT * FROM medications ORDER BY category, generic_name`;
        return rows.map(transform);
    }
    console.log(`Reading medications from ${API_URL}`);
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`${API_URL} returned HTTP ${response.status}`);
    }
    const body = await response.json();
    if (!Array.isArray(body.medications)) {
        throw new Error(`${API_URL} returned no medications array`);
    }
    // The endpoint already returns the medications.json shape (it shares this
    // script's field mapping), so only drop the keys the file omits when
    // empty, to keep the diff to real changes.
    return body.medications.map((med) => {
        const out = { ...med };
        for (const key of ['copayProgram', 'papProgram', 'medicarePartD', 'costPlusSlug', 'goodrxSlug', 'singlecareSlug']) {
            if (!isSet(out[key])) delete out[key];
        }
        return out;
    });
}

// The DB grew its own vocabulary for fields the site already had one for:
// plural categories ("Immunosuppressants"), lowercase organs ("kidney") and
// short stages ("post"). Sentences and labels across the site were written
// for the original vocabulary ("Tacrolimus is an immunosuppressant…",
// "(Kidney, Liver)"), so rows are normalized back to it here. Categories
// with no established equivalent (Mental Health, Blood Pressure…) pass
// through untouched.
//
// The category map lives in conditions.json alongside the condition taxonomy
// it feeds — the same aliases decide which name survives and which condition
// that name resolves to, so they cannot be maintained in two places. Migration
// 048 applied them to the rows as well; this stays as the safety net for rows
// added to the table afterwards.
const TAXONOMY = JSON.parse(readFileSync(CONDITIONS_PATH, 'utf8'));
const withoutComment = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([key]) => key !== '_comment'));
const CATEGORY_ALIASES = withoutComment(TAXONOMY.categoryAliases);
const CONDITION_OVERRIDES = withoutComment(TAXONOMY.medicationOverrides);
const STAGE_ALIASES = {
    post: 'Post-transplant',
    pre: 'Pre-transplant',
    both: 'Both (Pre & Post)',
    peri: 'Peri-transplant',
};
const capitalize = (w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w);
function normalize(med) {
    const category = CATEGORY_ALIASES[med.category] || med.category;
    // A row added straight to the table has no condition yet (nothing in the
    // Neon SQL editor derives one). Resolving it here means a new medication
    // reaches the JSON classified, instead of silently becoming the one record
    // that no condition filter can find.
    const condition = med.condition
        || CONDITION_OVERRIDES[med.id]
        || TAXONOMY.categoryToCondition[category]
        || null;
    return {
        ...med,
        category,
        condition,
        stage: STAGE_ALIASES[med.stage] || med.stage,
        commonOrgans: (med.commonOrgans || []).map(capitalize),
    };
}

const dupKey = (m) => `${(m.brandName || '').toLowerCase().trim()}|${(m.genericName || '').toLowerCase().trim()}`;
const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(id || ''));

async function main() {
    const dbMeds = (await loadDbMeds()).map(normalize);
    const dbIds = new Set(dbMeds.map(m => m.id));

    let existing = [];
    try {
        existing = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
    } catch {
        // first run / unreadable — start fresh
    }

    // UUID-keyed DB rows adopt the slug id of the matching existing record
    // (same brand + generic), so their page URLs survive the sync.
    const slugByKey = new Map(
        existing.filter(m => !isUuid(m.id)).map(m => [dupKey(m), m.id])
    );
    for (const med of dbMeds) {
        const slug = slugByKey.get(dupKey(med));
        if (isUuid(med.id) && slug && !dbIds.has(slug)) {
            console.log(`Keeping slug id for "${med.brandName}": ${med.id} -> ${slug}`);
            med.id = slug;
        }
    }

    // Keep curated program links the DB row leaves null (see the note at the
    // top of this file); a non-null DB value still wins.
    const byId = new Map(existing.map(m => [m.id, m]));
    const kept = new Map();
    for (const med of dbMeds) {
        const prev = byId.get(med.id);
        if (!prev) continue;
        for (const field of PRESERVE_WHEN_DB_NULL) {
            if (!isSet(med[field]) && isSet(prev[field])) {
                med[field] = prev[field];
                kept.set(field, (kept.get(field) || 0) + 1);
            }
        }
    }
    for (const [field, count] of kept) {
        console.log(`Kept ${count} curated ${field} value(s) the DB has as null`);
    }

    // The DB is the catalogue: records only the JSON has are dropped, loudly.
    const finalIds = new Set(dbMeds.map(m => m.id));
    const finalKeys = new Set(dbMeds.map(dupKey));
    const dropped = existing.filter(m => !finalIds.has(m.id));
    for (const m of dropped) {
        const covered = finalKeys.has(dupKey(m));
        console.log(`Dropped JSON-only med "${m.id}" (${m.brandName})${covered ? ' — same brand+generic exists under another id' : ' — NOT in the DB at all'}`);
    }

    writeFileSync(JSON_PATH, JSON.stringify(dbMeds, null, 2) + '\n');
    console.log(`\n✅ Wrote ${dbMeds.length} medications to src/data/medications.json (all from the DB; ${dropped.length} JSON-only record(s) dropped).`);
}

main().catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
});
