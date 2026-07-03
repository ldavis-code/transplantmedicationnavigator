#!/usr/bin/env node
/**
 * Assistance-Program Link Checker
 *
 * Validates every outbound assistance-program URL in the data files so a
 * patient never clicks a dead "Get Card" / "Apply" button. This is the tooling
 * behind the "Link verified" trust badges shown on each medication.
 *
 * Why a custom checker: most pharma savings sites sit behind a WAF (Akamai,
 * Cloudflare) that returns 403/406 to any non-browser request. A naive checker
 * would flag GoodRx, Drugs.com, Lilly, AstraZeneca, etc. as "broken" every run.
 * We send browser-like headers AND treat 403/406 on a maintained allowlist of
 * known-live-but-bot-blocked hosts as "reachable, manual-verify" rather than
 * "dead". Only true 404s / DNS failures / connection errors are reported broken.
 *
 * The checker validates TWO sources:
 *   1. The repo data files (medications.json, programs.json, resources.json)
 *   2. The LIVE production medications API (Neon database): because the app
 *      serves URLs from the database, not the bundled JSON. A July 2026 audit
 *      found 14 medications whose links were fixed in JSON but still broken in
 *      production because the DB was never synced. Checking only the files
 *      hides exactly the links patients actually click.
 * Any live URL that differs from the JSON for the same medication is reported
 * as DRIFT (even if reachable) so the DB and repo stay in sync.
 *
 * Usage:
 *   npm run check:links              # report broken links, exit 1 if any
 *   node scripts/check-links.js --stamp   # if fully clean, bump the "verified"
 *                                         # date in constants.js + programs.json
 *   node scripts/check-links.js --skip-live  # files only (offline/dev)
 *
 * Exit codes: 0 = no broken links, 1 = broken links or live drift found
 * (CI-friendly). An unreachable live API is a warning, not a failure.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const STAMP = process.argv.includes('--stamp');
const SKIP_LIVE = process.argv.includes('--skip-live');
const TIMEOUT_MS = 25000;
const CONCURRENCY = 8;

// The production medications API (Neon-backed): the URLs patients really get.
const LIVE_MEDICATIONS_API =
    'https://transplantmedicationnavigator.com/.netlify/functions/medications';
// URL fields on a medication record, in both API (camelCase) shape and
// the bundled-JSON shape used for drift comparison.
const MED_URL_FIELDS = ['papUrl', 'copayUrl', 'supportUrl', 'medicarePartDUrl'];

// Data files to scan for URLs.
const DATA_FILES = [
    'src/data/medications.json',
    'src/data/programs.json',
    'src/data/resources.json',
];

// Hosts known to be live but that block bots with 403/406. A 403/406 from one
// of these is NOT a broken link: real patients in a browser reach them fine.
// Keep this list tight: only add a host after confirming it loads in a browser.
const WAF_ALLOWLIST = new Set([
    'www.goodrx.com', 'goodrx.com',
    'www.drugs.com', 'drugs.com',
    'costplusdrugs.com', 'www.costplusdrugs.com',
    'www.singlecare.com', 'singlecare.com',
    'rarediseases.org', 'www.rarediseases.org',
    'www.abbvie.com',
    'www.bayer.com',
    'www.lillycares.com',
    'www.farxiga.com',
    'www.fasenra.com',
    'www.adempas-us.com',
    'www.opsumit.com',
    'www.vertexgps.com',
    'www.humalog.com', 'insulins.lilly.com',
    'www.trulicity.com', 'trulicity.lilly.com',
    'www.symbicort.com', 'www.mysymbicort.com',
    'www.panfoundation.org', 'panfoundation.org',
    'www.azandmeapp.com', 'azandmeapp.com',
    'www.tezspire.com', 'copay.tezspiretogether.com',
]);

// Statuses a WAF/CDN returns to automated clients while serving real browsers
// normally: 401/403/406 (blocked) and 429/503 (Cloudflare "challenge" pages).
const WAF_CHALLENGE_STATUSES = new Set([401, 403, 406, 429, 503]);

// A response we consider "reachable" (not broken) even without a 200 body.
function isReachableStatus(status, host) {
    if (status >= 200 && status < 400) return true;
    if (WAF_CHALLENGE_STATUSES.has(status) && WAF_ALLOWLIST.has(host)) return true;
    return false;
}

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

const URL_RE = /https?:\/\/[^\s"'<>\\)]+/g;
// Skip template URLs that contain a placeholder the site fills in at runtime.
const TEMPLATE_RE = /\{[^}]+\}/;

/** Collect every unique http(s) URL that appears in the data files. */
function collectUrls() {
    const map = new Map(); // url -> Set(sourceFiles)
    for (const rel of DATA_FILES) {
        let text;
        try {
            text = readFileSync(join(ROOT, rel), 'utf8');
        } catch {
            continue; // file optional
        }
        for (let m of text.match(URL_RE) || []) {
            m = m.replace(/[.,;]+$/, '');
            if (TEMPLATE_RE.test(m)) continue;
            if (!map.has(m)) map.set(m, new Set());
            map.get(m).add(rel);
        }
    }
    return map;
}

/**
 * Fetch the live production medications API and return:
 *  - urls: Map(url -> Set('live DB: Brand (field)')) to merge into the check pool
 *  - drift: rows where the live URL differs from medications.json for the same
 *    medication id (the DB missed a sync: flag it even if the URL still works)
 * Returns null if the API is unreachable (warn, don't fail: offline dev/CI).
 */
async function collectLiveUrls() {
    let live;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const res = await fetch(LIVE_MEDICATIONS_API, {
            headers: BROWSER_HEADERS, signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        live = (await res.json()).medications;
        if (!Array.isArray(live)) throw new Error('unexpected response shape');
    } catch (err) {
        console.log(`⚠ Live medications API unreachable (${err.message}); ` +
            'checking data files only.\n');
        return null;
    }

    let bundled = [];
    try {
        bundled = JSON.parse(readFileSync(join(ROOT, 'src/data/medications.json'), 'utf8'));
    } catch { /* drift comparison becomes a no-op */ }
    const bundledById = new Map(bundled.map(m => [m.id, m]));
    // Some DB rows carry a generated UUID instead of the slug id (e.g. rows
    // added via admin), so fall back to brand-name matching for those.
    const bundledByBrand = new Map(
        bundled.map(m => [(m.brandName || '').toLowerCase(), m]));

    const urls = new Map();
    const drift = [];
    for (const med of live) {
        const ref = bundledById.get(med.id)
            || bundledByBrand.get((med.brandName || '').toLowerCase());
        for (const field of MED_URL_FIELDS) {
            const url = med[field];
            if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) continue;
            if (TEMPLATE_RE.test(url)) continue;
            if (!urls.has(url)) urls.set(url, new Set());
            urls.get(url).add(`live DB: ${med.brandName || med.id} (${field})`);
            const refUrl = ref?.[field];
            if (ref && refUrl && refUrl !== url) {
                drift.push({ id: med.id, brand: med.brandName || med.id, field,
                             live: url, json: refUrl });
            }
        }
    }
    console.log(`Live medications API: ${live.length} medications, ` +
        `${urls.size} unique URLs, ${drift.length} drift(s) vs medications.json\n`);
    return { urls, drift };
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// A 429/5xx/connection error is often transient WAF throttling, not a dead
// page, so retry those a couple of times before declaring a link broken.
function isTransient(status) {
    return status === 0 || status === 429 || status >= 500;
}

async function fetchOnce(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            method: 'GET', redirect: 'follow', headers: BROWSER_HEADERS,
            signal: controller.signal,
        });
        return { status: res.status, finalUrl: res.url };
    } catch (err) {
        return { status: 0, finalUrl: null,
                 error: err.code || err.name || String(err.message || err) };
    } finally {
        clearTimeout(timer);
    }
}

async function checkUrl(url) {
    const host = (() => { try { return new URL(url).host; } catch { return ''; } })();
    let r;
    for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await sleep(1500 * attempt);
        r = await fetchOnce(url);
        if (!isTransient(r.status)) break;
    }
    return { url, host, status: r.status, finalUrl: r.finalUrl,
             ok: isReachableStatus(r.status, host), error: r.error };
}

/** Run checks with a small concurrency pool. */
async function runPool(urls) {
    const results = [];
    let i = 0;
    async function worker() {
        while (i < urls.length) {
            const url = urls[i++];
            results.push(await checkUrl(url));
        }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    return results;
}

/** On a fully-clean run, bump the verified date everywhere it is displayed. */
function stampVerifiedDate() {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    const display = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const constPath = join(ROOT, 'src/data/constants.js');
    let c = readFileSync(constPath, 'utf8');
    c = c.replace(/export const LINKS_LAST_VERIFIED = "[^"]*";/,
                  `export const LINKS_LAST_VERIFIED = "${iso}";`);
    c = c.replace(/export const LINKS_LAST_VERIFIED_DISPLAY = "[^"]*";/,
                  `export const LINKS_LAST_VERIFIED_DISPLAY = "${display}";`);
    writeFileSync(constPath, c);

    const progPath = join(ROOT, 'src/data/programs.json');
    let p = readFileSync(progPath, 'utf8');
    p = p.replace(/("lastVerified":\s*)"[^"]*"/g, `$1"${iso}"`);
    writeFileSync(progPath, p);

    console.log(`\n✓ Stamped verified date ${iso} into constants.js and programs.json`);
}

async function main() {
    const map = collectUrls();

    // Merge in the URLs production actually serves (Neon DB via the API).
    let drift = [];
    if (!SKIP_LIVE) {
        const liveResult = await collectLiveUrls();
        if (liveResult) {
            drift = liveResult.drift;
            for (const [url, sources] of liveResult.urls) {
                if (!map.has(url)) map.set(url, new Set());
                for (const s of sources) map.get(url).add(s);
            }
        }
    }

    const urls = [...map.keys()];
    console.log(`Checking ${urls.length} unique assistance-program links...\n`);

    const results = await runPool(urls);
    const broken = results.filter(r => !r.ok);
    const blocked = results.filter(r => r.ok && (r.status === 403 || r.status === 406 || r.status === 401));

    if (blocked.length) {
        console.log(`ℹ ${blocked.length} link(s) bot-blocked but known-live (allowlisted):`);
        for (const r of blocked.sort((a, b) => a.host.localeCompare(b.host))) {
            console.log(`   ${r.status}  ${r.url}`);
        }
        console.log('');
    }

    if (drift.length) {
        console.log(`⚠ ${drift.length} live-DB URL(s) differ from medications.json: the`);
        console.log('  database missed a sync. Write a db/migrations/ update (key it by');
        console.log('  medication id) and run it in the Neon SQL Editor:\n');
        for (const d of drift) {
            console.log(`   ${d.brand} (${d.id}) ${d.field}`);
            console.log(`      live: ${d.live}`);
            console.log(`      json: ${d.json}`);
        }
        console.log('');
    }

    if (broken.length === 0 && drift.length === 0) {
        console.log(`✅ All ${urls.length} links reachable and live DB in sync. No broken assistance-program links.`);
        if (STAMP) stampVerifiedDate();
        process.exit(0);
    }

    if (broken.length) {
        console.log(`❌ ${broken.length} BROKEN link(s): a patient would hit a dead page:\n`);
        for (const r of broken.sort((a, b) => (b.status || 0) - (a.status || 0))) {
            const label = r.status ? `HTTP ${r.status}` : `ERR ${r.error}`;
            const where = [...map.get(r.url)].join(', ');
            console.log(`   [${label}] ${r.url}`);
            console.log(`             found in: ${where}`);
        }
        console.log('\nFix these in the data files, then re-run. WAF false-positives can');
        console.log('be silenced by adding the host to WAF_ALLOWLIST in this script.');
    }
    process.exit(1);
}

main().catch(err => { console.error(err); process.exit(2); });
