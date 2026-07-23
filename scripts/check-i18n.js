#!/usr/bin/env node
/**
 * Localization gate: flags hardcoded English UI text in components that are
 * reachable from the Spanish experience.
 *
 * Motivated by the July 2026 Spanish-experience review: pages and floating
 * widgets kept shipping with hardcoded English because nothing failed when a
 * string bypassed i18n. This scan catches the common cases:
 *
 *   1. JSX text nodes with 3+ words of prose (`>Add a Medication<`)
 *   2. English text in aria-label / placeholder / title / alt attributes
 *
 * Files that are intentionally English-only (admin and reporting dashboards,
 * partner/sales pages not linked from Spanish navigation) are allowlisted
 * below. Everything else must render user-visible text through t()/<Trans>.
 *
 * Usage:  node scripts/check-i18n.js            (report, exit 1 on findings)
 *         node scripts/check-i18n.js --warn     (report only, always exit 0)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');
const warnOnly = process.argv.includes('--warn');

// English-only surfaces, not reachable from the Spanish patient journey.
const ALLOWLIST = [
  'pages/admin/',
  'pages/reporting/',
  'pages/Demo.jsx',
  'pages/Pilot.jsx',
  'pages/Pricing.jsx',
  'pages/ForHospitalAdmin.jsx',
  'pages/ForEmployers.jsx',
  'pages/ForPayers.jsx',
  'pages/ForTransplantPrograms.jsx',
  'pages/Evidence.jsx',
  'pages/About.jsx',
  'pages/NotLicensed.jsx',
  'pages/EpicCallback.jsx',
  'pages/SurveyLanding.jsx',
  'pages/TransplantMedicationSurvey.jsx',
  'pages/GeneralMedicationSurvey.jsx',
  'pages/CopayCardReminders.jsx',
  'components/admin/',
  'components/reporting/',
  'components/DemoBanner.jsx',
  'components/EpicSandboxHelp.jsx',
  // App.jsx hosts several English-only sections (pricing/demo shells) plus the
  // already-localized patient pages; too mixed for a line-level gate. New
  // patient-facing pages must NOT be added here — use i18n from the start.
  'App.jsx',
];

// JSX text nodes: >  some prose  <   (3+ words, at least one 3+ letter word)
const TEXT_NODE_RE = />\s*([A-Za-z][A-Za-z0-9'’,.$%+&/-]*(?:\s+[A-Za-z0-9'’,.$%+&/()-]+){2,})\s*</g;
// Literal English in accessibility/UX attributes
const ATTR_RE = /(aria-label|placeholder|title|alt)\s*=\s*"([A-Za-z][^"]{5,})"/g;

// Things that look like prose but aren't user-facing English.
const IGNORE_VALUE_RE = /^[\d\s$%–+.,:/-]*$|^https?:|^[A-Z_]+$|^[a-z-]+$/;

const findings = [];

function scanFile(file) {
  const rel = path.relative(SRC, file).replace(/\\/g, '/');
  if (ALLOWLIST.some((a) => rel.startsWith(a))) return;
  const src = fs.readFileSync(file, 'utf-8');
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    // Skip comments and lines already going through i18n
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    // Per-line escape hatch for proper nouns and brand names
    if (line.includes('i18n-ok')) return;

    for (const [re, group] of [[TEXT_NODE_RE, 1], [ATTR_RE, 2]]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        const value = m[group].trim();
        if (IGNORE_VALUE_RE.test(value)) continue;
        // Interpolated or translated content is fine
        if (value.includes('{') || value.includes('t(')) continue;
        findings.push({ file: rel, line: i + 1, text: value.slice(0, 70) });
      }
    }
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx|js)$/.test(entry.name) && (full.includes(`${path.sep}pages${path.sep}`) || full.includes(`${path.sep}components${path.sep}`))) {
      scanFile(full);
    }
  }
}

walk(SRC);

if (findings.length === 0) {
  console.log('✅ i18n gate: no hardcoded UI text found in Spanish-reachable components.');
  process.exit(0);
}

console.log(`\n⚠️  i18n gate: ${findings.length} hardcoded UI string(s) in Spanish-reachable components:\n`);
for (const f of findings) {
  console.log(`  ${f.file}:${f.line}  "${f.text}"`);
}
console.log('\nMove these strings into src/locales/en.json + es.json and render them');
console.log('through t() or <Trans>. If a file is genuinely English-only (admin,');
console.log('reporting, partner pages), add it to the allowlist in scripts/check-i18n.js.\n');
process.exit(warnOnly ? 0 : 1);
