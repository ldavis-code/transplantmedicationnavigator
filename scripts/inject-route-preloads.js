#!/usr/bin/env node
/**
 * Post-build modulepreload injection, in two stages (see package.json build):
 *
 *   --entry  Runs right after `vite build`, BEFORE prerender-seo.js.
 *            Injects hints into dist/index.html for the render-critical
 *            dynamic chunks that main.jsx gates the first render on: the
 *            English locale and the medications fallback. Vite only emits
 *            hints for STATIC imports, so without these the browser would
 *            discover the chunks only after the entry module executes — an
 *            extra round trip on the critical path (the exact regression
 *            Lighthouse caught when the Home chunk was lazy).
 *
 *   --pages  Runs AFTER prerender-seo.js. The prerenderer builds each
 *            route page (and every Spanish index-es.html variant) from its
 *            own template, carrying over only the entry <script> and
 *            stylesheet links — so prerendered pages ship with NO preload
 *            hints at all, not even Vite's react-vendor/icons ones. This
 *            stage mirrors dist/index.html's full hint set into every
 *            SPA-shell HTML in dist (identified by the entry module script
 *            tag), adding the Spanish locale chunk on index-es.html
 *            variants, which always need it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');

const stage = process.argv.includes('--pages') ? 'pages' : 'entry';

const assets = fs.readdirSync(assetsDir);
const findChunk = (prefix) => {
  const re = new RegExp(`^${prefix}-[\\w-]+\\.js$`);
  const matches = assets.filter((f) => re.test(f) && !f.endsWith('.map'));
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${prefix}-*.js chunk, found: ${matches.join(', ') || 'none'}`);
  }
  return `/assets/${matches[0]}`;
};

function injectInto(fullPath, hrefs) {
  let html = fs.readFileSync(fullPath, 'utf8');
  const links = hrefs
    .filter((href) => !html.includes(href))
    .map((href) => `    <link rel="modulepreload" crossorigin href="${href}">`);
  if (!links.length) return 0;
  html = html.replace('</head>', links.join('\n') + '\n</head>');
  fs.writeFileSync(fullPath, html, 'utf8');
  return links.length;
}

if (stage === 'entry') {
  const added = injectInto(path.join(distDir, 'index.html'), [findChunk('en'), findChunk('medications')]);
  console.log(`✅ index.html: +${added} modulepreload hint(s)`);
} else {
  const rootPath = path.join(distDir, 'index.html');
  const rootHtml = fs.readFileSync(rootPath, 'utf8');
  // The entry script marker identifies SPA-shell pages (prerendered route
  // copies), as opposed to standalone documents like appeal-guide.html.
  const entryScript = (rootHtml.match(/<script[^>]*type="module"[^>]*src="(\/assets\/index-[^"]+)"/) || [])[1];
  if (!entryScript) throw new Error('Could not find entry module script in dist/index.html');
  const hints = [...rootHtml.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"[^>]*>/g)]
    .map((m) => m[1]);
  const esChunk = findChunk('es');

  let pages = 0;
  let added = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'assets') walk(full);
      } else if (entry.name.endsWith('.html') && full !== rootPath) {
        const html = fs.readFileSync(full, 'utf8');
        if (!html.includes(entryScript)) continue; // standalone doc, skip
        const pageHints = entry.name.endsWith('-es.html') ? [...hints, esChunk] : hints;
        added += injectInto(full, pageHints);
        pages += 1;
      }
    }
  };
  walk(distDir);
  console.log(`✅ prerendered pages: +${added} modulepreload hint(s) across ${pages} page(s)`);
}
