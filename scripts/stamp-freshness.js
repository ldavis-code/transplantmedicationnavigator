#!/usr/bin/env node
/**
 * Stamps deploy-time freshness signals into the BUILT output (dist/), never
 * into source files:
 *
 *   - dist/index.html : "dateModified" in the WebApplication JSON-LD → today
 *   - dist/llms.txt   : the "Site last deployed" lines → today
 *
 * Runs after `vite build` and BEFORE prerender-seo.js, so the stamped
 * dateModified propagates into every prerendered page (the prerender uses
 * dist/index.html as its template).
 *
 * Deliberately NOT automated: the "reviewed July 2026" content-review dates
 * in llms.txt. A deploy is an update; it is not a content review. Bump those
 * by hand when medication prices, program details, or Medicare figures are
 * actually re-verified — the accessibility review flagged stale "reviewed on"
 * claims as a trust problem, and auto-stamping them would recreate it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const today = new Date().toISOString().slice(0, 10);

// 1. dateModified in the app shell's structured data
const indexPath = path.join(dist, 'index.html');
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf-8');
  if (/"dateModified": "\d{4}-\d{2}-\d{2}"/.test(html)) {
    fs.writeFileSync(indexPath, html.replace(/"dateModified": "\d{4}-\d{2}-\d{2}"/, `"dateModified": "${today}"`));
    console.log(`✅ stamp-freshness: dist/index.html dateModified → ${today}`);
  } else {
    console.warn('⚠️  stamp-freshness: no dateModified field found in dist/index.html');
  }
} else {
  console.warn('⚠️  stamp-freshness: dist/index.html not found — run after vite build');
}

// 2. "Site last deployed" lines in llms.txt
const llmsPath = path.join(dist, 'llms.txt');
if (fs.existsSync(llmsPath)) {
  const txt = fs.readFileSync(llmsPath, 'utf-8');
  const stamped = txt.replace(/^(\*\*Site last deployed\*\*|Site last deployed):.*$/gm,
    (_, label) => `${label}: ${today} (stamped automatically at build time)`);
  if (stamped !== txt) {
    fs.writeFileSync(llmsPath, stamped);
    console.log(`✅ stamp-freshness: dist/llms.txt deploy date → ${today}`);
  } else {
    console.warn('⚠️  stamp-freshness: no "Site last deployed" line found in dist/llms.txt');
  }
} else {
  console.warn('⚠️  stamp-freshness: dist/llms.txt not found');
}
