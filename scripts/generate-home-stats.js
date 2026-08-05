#!/usr/bin/env node
/**
 * Build-time generation of the homepage stat tile numbers.
 *
 * The tiles used to compute these by importing medications.json (94 KB) and
 * programs.json (62 KB) into the entry bundle — every visitor downloaded
 * 156 KB of JSON so the homepage could show three integers. This script
 * derives the same numbers at build time into a ~60 byte module instead.
 * It runs at the start of `npm run build` (see package.json), so the
 * "computed from the data files, can never go stale" guarantee still holds:
 * every deploy recounts. The generated file is committed so `vite dev`
 * works without a build step.
 *
 * Copay cards = copay-card programs; Assistance Programs = income-based
 * PAPs + foundation grants (kept separate from copay so the two tiles
 * never double-count the same program). Same formulas as the old
 * entry-bundle code — do not change one without the other's history in
 * mind (see git blame for src/pages/main/Home.jsx).
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const medications = JSON.parse(readFileSync(join(dataDir, 'medications.json'), 'utf8'));
const programs = JSON.parse(readFileSync(join(dataDir, 'programs.json'), 'utf8'));

const countGroup = (group) => (group ? Object.keys(group).length : 0);

const stats = {
    medications: medications.length,
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
