#!/usr/bin/env node
/**
 * Post-build: bring dist/index-es.html's resource hints up to parity with
 * dist/index.html, plus the lazy Spanish locale chunk.
 *
 * Vite injects <link rel="modulepreload"> for the entry's static chunk graph
 * into index.html, but index-es.html (the prerendered Spanish homepage that
 * /es serves) is generated from a template without them — so Spanish
 * visitors paid an extra round trip for chunks the browser could have
 * fetched in parallel, and another for the lazy locale chunk that
 * i18nReady always needs on that page.
 *
 * Runs AFTER prerender-seo.js (which writes index-es.html).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const esFile = path.join(distDir, 'index-es.html');
if (!fs.existsSync(esFile)) {
  console.warn('⚠️  dist/index-es.html not found, skipping preload injection');
  process.exit(0);
}

// The entry graph as Vite declared it in index.html.
const hints = [...indexHtml.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"[^>]*>/g)]
  .map((m) => m[1]);

// The lazy Spanish locale chunk (es-<hash>.js) — always needed on this page.
const assets = fs.readdirSync(path.join(distDir, 'assets'));
const esChunks = assets.filter((f) => /^es-[\w-]+\.js$/.test(f));
if (esChunks.length !== 1) {
  throw new Error(`Expected exactly one es-*.js locale chunk, found: ${esChunks.join(', ') || 'none'}`);
}
hints.push(`/assets/${esChunks[0]}`);

let html = fs.readFileSync(esFile, 'utf8');
const links = hints
  .filter((href) => !html.includes(href))
  .map((href) => `    <link rel="modulepreload" crossorigin href="${href}">`);

if (links.length) {
  html = html.replace('</head>', links.join('\n') + '\n</head>');
  fs.writeFileSync(esFile, html, 'utf8');
}
console.log(`✅ index-es.html: +${links.length} modulepreload hint(s)`);
