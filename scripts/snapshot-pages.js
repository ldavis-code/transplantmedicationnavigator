#!/usr/bin/env node
/**
 * Page Snapshot Harness
 *
 * Captures the rendered HTML (#root innerHTML) of the top patient-facing
 * pages from the production build, and compares it against committed
 * baselines. This is the safety net for the i18n string-extraction work:
 * after replacing hardcoded strings with t() calls, the rendered English
 * output must be byte-identical to the baseline.
 *
 * Usage:
 *   npx vite build              # build first (plain vite build is enough)
 *   npm run snapshot:update     # (re)write baselines in tests/page-snapshots/
 *   npm run snapshot:verify     # compare fresh capture against baselines
 *
 * Exit codes: 0 = all pages match, 1 = mismatch or capture failure.
 *
 * Determinism notes:
 * - Each route is loaded in a fresh browser context (no shared storage).
 * - Service workers are blocked; external requests (analytics, fonts) and
 *   /api/* calls are aborted so pages render their deterministic fallbacks.
 * - Fixed viewport, locale, and timezone.
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const snapshotDir = path.join(projectRoot, 'tests', 'page-snapshots');

const UPDATE = process.argv.includes('--update');
const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const CHROMIUM_PATH = process.env.SNAPSHOT_CHROMIUM || '/opt/pw-browsers/chromium';

// Top patient-facing pages — the scope of the i18n project.
const PAGES = [
    { name: 'home', route: '/' },
    { name: 'wizard', route: '/wizard' },
    { name: 'medications', route: '/medications' },
    { name: 'medication-detail-tacrolimus', route: '/medications/tacrolimus' },
    { name: 'education', route: '/education' },
    // Every education tab is deep-linkable, which makes the tab-gated
    // content snapshot-verifiable (default tab is DEDUCTIBLE_TRAP, above).
    { name: 'education-emergency', route: '/education?topic=EMERGENCY' },
    { name: 'education-generics', route: '/education?topic=GENERICS' },
    { name: 'education-diversion', route: '/education?topic=DIVERSION' },
    { name: 'education-directory', route: '/education?topic=DIRECTORY' },
    { name: 'education-insurance', route: '/education?topic=INSURANCE' },
    { name: 'education-mental', route: '/education?topic=MENTAL' },
    { name: 'education-oop', route: '/education?topic=OOP' },
    { name: 'appeals', route: '/education/appeals' },
    { name: 'application-help', route: '/application-help' },
    { name: 'faq', route: '/faq' },
];

function startPreviewServer() {
    return new Promise((resolve, reject) => {
        // detached => own process group, so we can kill npx AND the vite
        // grandchild it spawns (otherwise the grandchild outlives us and the
        // script never exits).
        const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
            cwd: projectRoot,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: true,
        });
        let settled = false;
        const onFail = (err) => { if (!settled) { settled = true; reject(err); } };
        child.on('error', onFail);
        child.on('exit', (code) => onFail(new Error(`vite preview exited early (code ${code})`)));

        const deadline = Date.now() + 30000;
        const poll = async () => {
            try {
                const res = await fetch(BASE + '/');
                if (res.ok) { settled = true; resolve(child); return; }
            } catch { /* not up yet */ }
            if (Date.now() > deadline) return onFail(new Error('vite preview did not start within 30s'));
            setTimeout(poll, 300);
        };
        setTimeout(poll, 500);
    });
}

/**
 * Insert line breaks between adjacent tags so baselines diff line-by-line.
 * Purely cosmetic and stable — does not alter the markup itself.
 */
function formatHtml(html) {
    return html.replace(/></g, '>\n<').trim() + '\n';
}

async function capturePage(browser, { name, route }) {
    const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        locale: 'en-US',
        timezoneId: 'America/New_York',
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
    });
    // Abort everything that is not the local preview server (analytics, fonts,
    // Supabase, Stripe) and all /api/* calls, so pages render deterministic
    // fallbacks instead of live data.
    await context.route('**/*', (r) => {
        const url = r.request().url();
        if (!url.startsWith(BASE) || new URL(url).pathname.startsWith('/api/')) {
            return r.abort();
        }
        return r.continue();
    });

    const page = await context.newPage();
    try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForSelector('#root :first-child', { timeout: 15000 });
        // Settle window for lazy-loaded chunks and post-mount effects.
        await page.waitForTimeout(1200);
        const html = await page.evaluate(() => document.getElementById('root').innerHTML);
        return formatHtml(html);
    } finally {
        await context.close();
    }
}

function firstDiffLine(a, b) {
    const al = a.split('\n');
    const bl = b.split('\n');
    const n = Math.max(al.length, bl.length);
    for (let i = 0; i < n; i++) {
        if (al[i] !== bl[i]) {
            return { line: i + 1, expected: al[i] ?? '<missing>', actual: bl[i] ?? '<missing>' };
        }
    }
    return null;
}

async function main() {
    if (!fs.existsSync(path.join(distDir, 'index.html'))) {
        console.error('dist/index.html not found. Run "npx vite build" first.');
        process.exit(1);
    }
    fs.mkdirSync(snapshotDir, { recursive: true });

    console.log('Starting preview server...');
    const server = await startPreviewServer();
    const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });

    let failures = 0;
    try {
        for (const pageDef of PAGES) {
            const baselinePath = path.join(snapshotDir, `${pageDef.name}.html`);
            const actualPath = path.join(snapshotDir, `${pageDef.name}.actual.html`);
            process.stdout.write(`  ${pageDef.route.padEnd(36)} `);
            let html;
            try {
                html = await capturePage(browser, pageDef);
            } catch (err) {
                failures++;
                console.log(`CAPTURE FAILED: ${err.message}`);
                continue;
            }

            if (UPDATE) {
                fs.writeFileSync(baselinePath, html);
                if (fs.existsSync(actualPath)) fs.unlinkSync(actualPath);
                console.log(`baseline written (${html.split('\n').length} lines)`);
                continue;
            }

            if (!fs.existsSync(baselinePath)) {
                failures++;
                console.log('NO BASELINE — run "npm run snapshot:update" first');
                continue;
            }
            const baseline = fs.readFileSync(baselinePath, 'utf8');
            if (baseline === html) {
                if (fs.existsSync(actualPath)) fs.unlinkSync(actualPath);
                console.log('OK (identical)');
            } else {
                failures++;
                fs.writeFileSync(actualPath, html);
                const diff = firstDiffLine(baseline, html);
                console.log('MISMATCH');
                console.log(`      first diff at line ${diff.line}:`);
                console.log(`      - expected: ${diff.expected.slice(0, 160)}`);
                console.log(`      + actual:   ${diff.actual.slice(0, 160)}`);
                console.log(`      full capture saved to ${path.relative(projectRoot, actualPath)}`);
            }
        }
    } finally {
        await browser.close();
        try { process.kill(-server.pid, 'SIGTERM'); } catch { server.kill(); }
    }

    if (failures > 0) {
        console.error(`\n${failures} page(s) failed ${UPDATE ? 'capture' : 'verification'}.`);
        process.exit(1);
    }
    console.log(UPDATE ? '\nAll baselines updated.' : '\nAll pages byte-identical to baseline.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
