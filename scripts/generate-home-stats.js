#!/usr/bin/env node
/**
 * Build-time generation of the site's medication/program counts.
 *
 * The tiles used to compute these by importing medications.json (94 KB) and
 * programs.json (62 KB) into the entry bundle — every visitor downloaded
 * 156 KB of JSON so the homepage could show three integers. This script
 * derives the same numbers at build time into a ~60 byte module instead.
 * It runs at the start of `npm run build` (see package.json), so every deploy
 * recounts the program tiles from the data files and they can never drift
 * from what the Programs pages list. The generated file is committed so
 * `vite dev` works without a build step.
 *
 * Copay cards = copay-card programs; Assistance Programs = income-based
 * PAPs + foundation grants (kept separate from copay so the two tiles
 * never double-count the same program). Same formulas as the old
 * entry-bundle code — do not change one without the other's history in
 * mind (see git blame for src/pages/main/Home.jsx).
 *
 * The medication total is the one count that is NOT derived here — see
 * DB_MEDICATION_COUNT below.
 *
 * The hand-written static pages under public/ quote the same three numbers
 * (the TrumpRx comparison page's whole argument is "we checked, and here are
 * the real numbers" — it cannot disagree with the homepage by a drug). They
 * carry <span data-stat="KEY">…</span> markers, and this script stamps the
 * counted value into every one of them, so the counts have exactly one
 * source. A listed page with no markers left is a build error, not a silent
 * skip. Same marker convention scripts/prerender-seo.js uses for dist/.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const medications = JSON.parse(readFileSync(join(dataDir, 'medications.json'), 'utf8'));
const programs = JSON.parse(readFileSync(join(dataDir, 'programs.json'), 'utf8'));

const countGroup = (group) => (group ? Object.keys(group).length : 0);

// The medication catalogue lives in Neon, not in this repo: MedicationsContext
// fetches /.netlify/functions/medications and only falls back to the bundled
// medications.json when that request fails. So the bundled file is an offline
// fallback that trails the live table — counting its rows told visitors the
// site covered 220 drugs while it was actually serving 259. This number is
// therefore pinned to the table, not derived. Refresh it whenever medications
// are added, from the Neon SQL editor or the public endpoint:
//
//   SELECT count(*) FROM medications;
//   curl -s https://transplantmedicationnavigator.com/.netlify/functions/medications | jq .count
//
const DB_MEDICATION_COUNT = 259; // verified 2026-08-26

// Guard against the pin going stale downward: the bundled fallback is a subset
// of the table, so more rows here than the pin means the pin was never updated
// after a sync. A wrong count on the homepage is exactly what this script
// exists to prevent, so that is a build error, not a warning.
if (medications.length > DB_MEDICATION_COUNT) {
    console.error(
        `stats: medications.json has ${medications.length} rows but DB_MEDICATION_COUNT is ${DB_MEDICATION_COUNT}. ` +
        'Re-count the Neon medications table and update the constant in scripts/generate-home-stats.js.'
    );
    process.exit(1);
}

const stats = {
    medications: DB_MEDICATION_COUNT,
    copayCards: countGroup(programs.copayPrograms),
    assistancePrograms: countGroup(programs.papPrograms) + countGroup(programs.foundationPrograms),
};

const outPath = join(dataDir, 'home-stats.json');
const next = JSON.stringify(stats, null, 2) + '\n';
let prev = null;
try { prev = readFileSync(outPath, 'utf8'); } catch { /* first run */ }
if (prev !== next) {
    writeFileSync(outPath, next, 'utf8');
    console.log(`home-stats.json updated: ${JSON.stringify(stats)}`);
} else {
    console.log(`home-stats.json unchanged: ${JSON.stringify(stats)}`);
}

// Static pages that quote the counts. Each must carry at least one
// <span data-stat="..."> marker; losing them means the page has gone back to
// hand-maintained numbers, which is how the homepage and the TrumpRx page
// ended up 219/46 vs 218/47 in the first place.
const publicDir = join(__dirname, '..', 'public');
const STATIC_PAGES = [
    'trumprx.html',
    'trumprx-es.html',
    'hospital-sell-sheet.html',
    'hospital-case-study-template.html',
];

let failed = false;
for (const file of STATIC_PAGES) {
    const filePath = join(publicDir, file);
    let html;
    try {
        html = readFileSync(filePath, 'utf8');
    } catch {
        console.error(`stats: ${file} is listed as a stat page but is missing`);
        failed = true;
        continue;
    }
    let stamped = 0;
    let updated = html;
    for (const [key, value] of Object.entries(stats)) {
        updated = updated.replace(
            new RegExp(`(<span data-stat="${key}">)[^<]*(</span>)`, 'g'),
            (_match, open, close) => { stamped += 1; return `${open}${value}${close}`; }
        );
    }
    if (stamped === 0) {
        console.error(`stats: no <span data-stat="..."> markers found in public/${file}`);
        failed = true;
        continue;
    }
    if (updated !== html) {
        writeFileSync(filePath, updated, 'utf8');
        console.log(`stats: public/${file} updated (${stamped} markers)`);
    } else {
        console.log(`stats: public/${file} unchanged (${stamped} markers)`);
    }
}

if (failed) {
    process.exit(1);
}
