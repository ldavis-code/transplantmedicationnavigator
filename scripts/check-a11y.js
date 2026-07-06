/**
 * Automated accessibility check (axe-core over the built site).
 *
 * Usage:
 *   npm run build          # needs a fresh dist/
 *   npm run check:a11y     # serves dist/ and audits key pages
 *
 * Audits each page against WCAG 2.1 A/AA rules in two states:
 * the first-visit state (disclaimer modal + consent banner showing) and the
 * normal browsing state (both dismissed). Exits non-zero if any SERIOUS or
 * CRITICAL violation is found, so this can gate CI. Moderate/minor issues
 * are reported but do not fail the run — fix them as time allows and then
 * tighten the threshold.
 */

import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AXE_SOURCE = readFileSync(
  path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js'),
  'utf8'
);

const PAGES = [
  '/',
  '/wizard',
  '/medications',
  '/medications/tacrolimus',
  '/education',
  '/faq',
  '/application-help',
  '/savings-tracker',
  '/feedback',
  '/privacy',
  '/accessibility',
  '/for-hospitals',
];

const FAIL_ON = new Set(['serious', 'critical']);

async function runAxe(page) {
  await page.evaluate(AXE_SOURCE);
  return page.evaluate(() =>
    window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    })
  );
}

function report(route, state, results, failures) {
  for (const v of results.violations) {
    const line = `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''})`;
    console.log(line);
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`      ${node.target.join(' ')}`);
    }
    if (FAIL_ON.has(v.impact)) {
      failures.push(`${route} (${state}): ${v.id} — ${v.help}`);
    }
  }
  if (results.violations.length === 0) {
    console.log('  clean');
  }
}

async function main() {
  const previewServer = await (await import('vite')).preview({
    preview: { port: 4517, strictPort: true },
  });
  const base = 'http://localhost:4517';

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium',
  });

  const failures = [];
  try {
    // State 1: first visit on the home page — disclaimer modal + consent banner
    {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      console.log('\n== / (first visit: disclaimer + consent banner)');
      report('/', 'first-visit', await runAxe(page), failures);
      await ctx.close();
    }

    // State 2: normal browsing — disclaimer accepted, analytics declined
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => {
      localStorage.setItem('disclaimer_accepted', '2026-07-06');
      localStorage.setItem('tmn_consent', JSON.stringify({ analytics: 'denied' }));
    });
    const page = await ctx.newPage();
    for (const route of PAGES) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      console.log(`\n== ${route}`);
      report(route, 'browsing', await runAxe(page), failures);
    }
    await ctx.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => previewServer.httpServer.close(resolve));
  }

  console.log('\n----------------------------------------');
  if (failures.length) {
    console.log(`FAIL: ${failures.length} serious/critical accessibility violation(s):`);
    failures.forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('PASS: no serious or critical accessibility violations.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
