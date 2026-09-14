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
 * The hand-written static pages under public/ quote the same three numbers
 * (the TrumpRx comparison page's whole argument is "we checked, and here are
 * the real numbers" — it cannot disagree with the homepage by a drug). They
 * carry <span data-stat="KEY">…</span> markers, and this script stamps the
 * counted value into every one of them, so the counts have exactly one
 * source. A listed page with no markers left is a build error, not a silent
 * skip. Same marker convention scripts/prerender-seo.js uses for dist/.
 *
 * The same markers carry the content-verified date (CONTENT_VERIFIED_ISO in
 * src/data/constants.js, the one date behind every visible "verified /
 * last updated" stamp): the TrumpRx guide's "verified on" lines, the
 * homepage banner in index.html, its JSON-LD lastReviewed, and the review
 * sentence in llms.txt. It is a review date, not a deploy date — the build
 * copies it, it never sets it (that is scripts/check-links.js, or a hand
 * edit after a real re-verification).
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CONTENT_VERIFIED_ISO, formatVerifiedDate } from '../src/data/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const medications = JSON.parse(readFileSync(join(dataDir, 'medications.json'), 'utf8'));
const programs = JSON.parse(readFileSync(join(dataDir, 'programs.json'), 'utf8'));

const countGroup = (group) => (group ? Object.keys(group).length : 0);

// The medication count is derived from medications.json again — the file is
// synced from the Neon table (scripts/sync-medications-json.js, which needs
// no credentials with --api), so counting its rows counts the real catalogue.
// The check below is what keeps that true: the catalogue lives in Neon and
// this file trails it between syncs, which is how the homepage said 220
// while the site served 259. If the live API reports medications this file
// doesn't have, the count on every stat surface would be a lie, so that is
// a build error with a one-command remedy — not a warning nobody reads.
// A network failure skips the check (offline dev must still build).
const API_URL = 'https://transplantmedicationnavigator.com/.netlify/functions/medications';
try {
    const response = await fetch(API_URL, { signal: AbortSignal.timeout(15000) });
    if (response.ok) {
        const body = await response.json();
        const localIds = new Set(medications.map((m) => m.id));
        const missing = (body.medications || []).filter((m) => !localIds.has(m.id));
        // Ids the sync's dedupe deliberately collapsed into another record
        // (same brand + generic) are not missing — the medication is here.
        const localKeys = new Set(medications.map((m) =>
            `${(m.brandName || '').toLowerCase().trim()}|${(m.genericName || '').toLowerCase().trim()}`));
        const trulyMissing = missing.filter((m) =>
            !localKeys.has(`${(m.brandName || '').toLowerCase().trim()}|${(m.genericName || '').toLowerCase().trim()}`));
        if (trulyMissing.length > 0) {
            console.error(
                `stats: the live medications API has ${trulyMissing.length} medication(s) missing from ` +
                `src/data/medications.json (${trulyMissing.slice(0, 5).map((m) => m.id).join(', ')}${trulyMissing.length > 5 ? ', …' : ''}).\n` +
                'The homepage count would under-report the catalogue. Run:  npm run sync:medications -- --api'
            );
            process.exit(1);
        }
        console.log(`stats: medications.json is in sync with the live API (${medications.length} local, ${body.count} in DB)`);
    } else {
        console.warn(`stats: freshness check skipped — API returned HTTP ${response.status}`);
    }
} catch (err) {
    console.warn(`stats: freshness check skipped — API unreachable (${err.message})`);
}

const stats = {
    medications: medications.length,
    copayCards: countGroup(programs.copayPrograms),
    assistancePrograms: countGroup(programs.papPrograms) + countGroup(programs.foundationPrograms),
};

// The content-verified date, formatted per language with the same function
// the app's footer and cards use, so a static page can never show a
// different month than the React pages beside it.
const stamps = {
    verifiedIso: CONTENT_VERIFIED_ISO,
    verifiedMonthEn: formatVerifiedDate(CONTENT_VERIFIED_ISO, 'en'),
    verifiedMonthEs: formatVerifiedDate(CONTENT_VERIFIED_ISO, 'es'),
    verifiedDateEn: formatVerifiedDate(CONTENT_VERIFIED_ISO, 'en', 'full'),
    verifiedDateEs: formatVerifiedDate(CONTENT_VERIFIED_ISO, 'es', 'full'),
};
const markers = { ...stats, ...stamps };

// Replace every <span data-stat="KEY">…</span> with the current value.
function stampMarkers(html) {
    let stamped = 0;
    let updated = html;
    for (const [key, value] of Object.entries(markers)) {
        updated = updated.replace(
            new RegExp(`(<span data-stat="${key}">)[^<]*(</span>)`, 'g'),
            (_match, open, close) => { stamped += 1; return `${open}${value}${close}`; }
        );
    }
    return { updated, stamped };
}

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
    const { updated, stamped } = stampMarkers(html);
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

// The app shell: the homepage "Verified <month>" banner (a data-stat
// marker) and the JSON-LD lastReviewed date. Both must be present.
const rootDir = join(__dirname, '..');
{
    const indexPath = join(rootDir, 'index.html');
    const html = readFileSync(indexPath, 'utf8');
    const { updated: withMarkers, stamped } = stampMarkers(html);
    const reviewedRe = /("lastReviewed":\s*)"\d{4}-\d{2}-\d{2}"/;
    if (stamped === 0 || !reviewedRe.test(withMarkers)) {
        console.error('stats: index.html is missing the verified-date marker or the JSON-LD "lastReviewed" field');
        failed = true;
    } else {
        const updated = withMarkers.replace(reviewedRe, `$1"${CONTENT_VERIFIED_ISO}"`);
        if (updated !== html) {
            writeFileSync(indexPath, updated, 'utf8');
            console.log(`stats: index.html updated (${stamped} markers + lastReviewed)`);
        } else {
            console.log(`stats: index.html unchanged (${stamped} markers + lastReviewed)`);
        }
    }
}

// llms.txt: the "were last reviewed <Month YYYY>" sentence AI tools quote.
{
    const llmsPath = join(publicDir, 'llms.txt');
    const txt = readFileSync(llmsPath, 'utf8');
    const reviewedRe = /(were last reviewed )[A-Z][a-z]+ \d{4}/;
    if (!reviewedRe.test(txt)) {
        console.error('stats: public/llms.txt is missing the "were last reviewed <Month YYYY>" sentence');
        failed = true;
    } else {
        const updated = txt.replace(reviewedRe, `$1${stamps.verifiedMonthEn}`);
        if (updated !== txt) {
            writeFileSync(llmsPath, updated, 'utf8');
            console.log('stats: public/llms.txt review date updated');
        } else {
            console.log('stats: public/llms.txt review date unchanged');
        }
    }
}

if (failed) {
    process.exit(1);
}
