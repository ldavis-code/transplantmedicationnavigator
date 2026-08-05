#!/usr/bin/env node
/**
 * Post-build: inject <link rel="modulepreload"> hints for the homepage's
 * lazy route chunk into the homepage HTML variants.
 *
 * Why: route-based code splitting made Home a dynamically-imported chunk.
 * Without hints the browser only discovers it after the entry module has
 * downloaded and executed — an extra network round trip on the critical
 * path that showed up as a Lighthouse LCP regression on the deploy preview.
 * Preloading Home + its static dependency graph (and, for the Spanish
 * homepage, the lazy locale chunk) restores a flat waterfall: everything
 * needed for first paint downloads in parallel with the entry.
 *
 * Runs AFTER prerender-seo.js on purpose: the per-route prerendered pages
 * are copies of index.html, and only the two homepage documents should
 * preload the Home chunk.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');

const assets = fs.readdirSync(assetsDir);
const findChunk = (prefix) => {
  const matches = assets.filter((f) => f.startsWith(prefix) && f.endsWith('.js') && !f.endsWith('.map'));
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${prefix}*.js chunk, found: ${matches.join(', ') || 'none'}`);
  }
  return matches[0];
};

// Transitive static imports of a chunk (minified ESM: from"./x.js" / import"./x.js").
function staticGraph(chunkName) {
  const seen = new Set();
  const queue = [chunkName];
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    const code = fs.readFileSync(path.join(assetsDir, name), 'utf8');
    for (const m of code.matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)) {
      if (!seen.has(m[1])) queue.push(m[1]);
    }
  }
  return [...seen];
}

function inject(htmlFile, chunkNames) {
  const file = path.join(distDir, htmlFile);
  if (!fs.existsSync(file)) {
    console.warn(`  ⚠️  ${htmlFile} not found, skipping`);
    return;
  }
  let html = fs.readFileSync(file, 'utf8');
  const links = chunkNames
    .filter((name) => !html.includes(`/assets/${name}`))
    .map((name) => `    <link rel="modulepreload" crossorigin href="/assets/${name}">`);
  if (!links.length) {
    console.log(`  ✅ ${htmlFile}: all chunks already referenced`);
    return;
  }
  html = html.replace('</head>', links.join('\n') + '\n</head>');
  fs.writeFileSync(file, html, 'utf8');
  console.log(`  ✅ ${htmlFile}: +${links.length} modulepreload hint(s)`);
}

const homeGraph = staticGraph(findChunk('Home-'));
const esLocale = findChunk('es-');

console.log('Injecting route-chunk modulepreload hints...');
inject('index.html', homeGraph);
inject('index-es.html', [...homeGraph, esLocale]);
