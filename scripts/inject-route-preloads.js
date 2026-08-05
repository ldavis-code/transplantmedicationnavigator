#!/usr/bin/env node
/**
 * Post-build modulepreload injection, in two stages (see package.json build):
 *
 *   --entry  Runs right after `vite build`, BEFORE prerender-seo.js.
 *            Injects hints for the render-critical dynamic chunks that
 *            main.jsx gates the first render on: the English locale and the
 *            medications fallback. Vite only emits hints for STATIC imports,
 *            so without these the browser would discover the chunks only
 *            after the entry module executes — an extra round trip on the
 *            critical path (the exact regression Lighthouse caught when the
 *            Home chunk was lazy). Injecting before prerender means every
 *            prerendered page copy inherits the hints.
 *
 *   --es     Runs AFTER prerender-seo.js (which writes index-es.html from
 *            its own template, without any hints). Mirrors index.html's
 *            hints into index-es.html and adds the Spanish locale chunk,
 *            which that page always needs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');

const stage = process.argv.includes('--es') ? 'es' : 'entry';

const assets = fs.readdirSync(assetsDir);
const findChunk = (prefix) => {
  const re = new RegExp(`^${prefix}-[\\w-]+\\.js$`);
  const matches = assets.filter((f) => re.test(f) && !f.endsWith('.map'));
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${prefix}-*.js chunk, found: ${matches.join(', ') || 'none'}`);
  }
  return `/assets/${matches[0]}`;
};

function injectInto(file, hrefs) {
  const full = path.join(distDir, file);
  let html = fs.readFileSync(full, 'utf8');
  const links = hrefs
    .filter((href) => !html.includes(href))
    .map((href) => `    <link rel="modulepreload" crossorigin href="${href}">`);
  if (links.length) {
    html = html.replace('</head>', links.join('\n') + '\n</head>');
    fs.writeFileSync(full, html, 'utf8');
  }
  console.log(`✅ ${file}: +${links.length} modulepreload hint(s)`);
}

if (stage === 'entry') {
  injectInto('index.html', [findChunk('en'), findChunk('medications')]);
} else {
  if (!fs.existsSync(path.join(distDir, 'index-es.html'))) {
    console.warn('⚠️  dist/index-es.html not found, skipping');
    process.exit(0);
  }
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const hints = [...indexHtml.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"[^>]*>/g)]
    .map((m) => m[1]);
  hints.push(findChunk('es'));
  injectInto('index-es.html', hints);
}
