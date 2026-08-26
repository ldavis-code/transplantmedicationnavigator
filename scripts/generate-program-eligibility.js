#!/usr/bin/env node
/**
 * Build-time extraction of per-program insurance eligibility.
 *
 * Which insurance types a program accepts lives in programs.json, but that
 * file is 62 KB and the medication card — a shared chunk on every results
 * page — deliberately does not import it. The card needs one thing from it:
 * whether THIS program excludes THIS patient's insurance, so a commercial
 * patient isn't shown a patient assistance program at the same weight as the
 * copay card that is actually their route.
 *
 * So this emits just the eligibility blocks, ~7 KB instead of 62 KB. Same
 * approach as generate-home-stats.js: derive the small thing at build time
 * rather than ship the big thing to every visitor.
 *
 * Programs with no eligibility block are omitted, and the card treats a
 * missing entry as "no claim either way" — patient assistance programs vary,
 * and an unknown must never grey out a program a patient might qualify for.
 *
 * Runs at the start of `npm run build`. The output is committed so `vite dev`
 * works without a build step.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const programs = JSON.parse(readFileSync(join(dataDir, 'programs.json'), 'utf8'));

const GROUPS = ['papPrograms', 'copayPrograms', 'foundationPrograms'];

const eligibility = {};
let count = 0;
for (const group of GROUPS) {
    for (const [id, program] of Object.entries(programs[group] || {})) {
        if (!program?.eligibility) continue;
        (eligibility[group] ||= {})[id] = program.eligibility;
        count += 1;
    }
}

const outPath = join(dataDir, 'program-eligibility.json');
const next = JSON.stringify(eligibility, null, 2) + '\n';
let prev = null;
try { prev = readFileSync(outPath, 'utf8'); } catch { /* first run */ }
if (prev !== next) {
    writeFileSync(outPath, next, 'utf8');
    console.log(`program-eligibility.json updated: ${count} programs`);
} else {
    console.log(`program-eligibility.json unchanged: ${count} programs`);
}
