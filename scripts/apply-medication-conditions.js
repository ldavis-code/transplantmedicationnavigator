#!/usr/bin/env node
/**
 * Rewrite the resolved `condition` (and the normalized `category`) on every
 * record in src/data/medications.json from the taxonomy in
 * src/data/conditions.json.
 *
 * `category` is the drug class the site has always displayed; `condition` is
 * what the drug treats, which is what patients browse by. Keeping the
 * derivation in one script means a new medication only needs a category — its
 * condition follows — and a category with no mapping fails loudly here rather
 * than showing up as an unclassified row in the UI.
 *
 * Usage:
 *   node scripts/apply-medication-conditions.js           rewrite the file
 *   node scripts/apply-medication-conditions.js --check   verify only, exit 1
 *                                                         if the file is stale
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The frontend's own resolver, so the condition written into the file is by
// construction the one the site would compute for that record.
import {
    CONDITIONS,
    conditionForMedication as conditionFor,
    danglingConditionIds,
    normalizeCategory,
} from '../src/lib/conditions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDICATIONS_PATH = path.join(__dirname, '..', 'src', 'data', 'medications.json');

const checkOnly = process.argv.includes('--check');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

// A condition id in the map that no longer exists in the condition list would
// silently write a dangling value onto every medication in that category.
const dangling = danglingConditionIds();
if (dangling.length) {
    console.error('conditions.json maps to unknown condition ids:');
    dangling.forEach((id) => console.error(`  ${id}`));
    process.exit(1);
}

const medications = readJson(MEDICATIONS_PATH);

const unmapped = new Map();
const updated = medications.map((med) => {
    const category = normalizeCategory(med.category);
    const condition = conditionFor(med);
    if (!condition) {
        if (!unmapped.has(med.category)) unmapped.set(med.category, []);
        unmapped.get(med.category).push(med.id);
    }
    // Rebuild the record so `condition` always sits next to `category` rather
    // than landing at the end of whichever records happened to lack it.
    const out = {};
    for (const [key, value] of Object.entries(med)) {
        if (key === 'condition') continue;
        out[key] = key === 'category' ? category : value;
        if (key === 'category') out.condition = condition;
    }
    if (!('category' in med)) out.condition = condition;
    return out;
});

if (unmapped.size) {
    console.error('No condition mapping for these categories (add them to conditions.json):');
    for (const [category, ids] of unmapped) {
        console.error(`  ${category} — ${ids.length} medication(s): ${ids.slice(0, 5).join(', ')}`);
    }
    process.exit(1);
}

const serialized = `${JSON.stringify(updated, null, 2)}\n`;
const current = fs.readFileSync(MEDICATIONS_PATH, 'utf-8');

if (serialized === current) {
    console.log(`medications.json is up to date (${updated.length} medications).`);
    process.exit(0);
}

if (checkOnly) {
    console.error('medications.json is stale — run `npm run conditions:apply`.');
    process.exit(1);
}

fs.writeFileSync(MEDICATIONS_PATH, serialized);

const counts = new Map();
for (const med of updated) counts.set(med.condition, (counts.get(med.condition) || 0) + 1);
console.log(`Wrote condition for ${updated.length} medications across ${counts.size} conditions:`);
for (const condition of CONDITIONS) {
    const n = counts.get(condition.id);
    if (n) console.log(`  ${String(n).padStart(3)}  ${condition.label}`);
}
