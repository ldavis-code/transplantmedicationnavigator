#!/usr/bin/env node
/**
 * Medication data review report -> reports/medication-data-review.md
 *
 * Lists everything the site will NOT guess about, for a human to verify:
 *   1. Medication pages rendered with noindex (left out of the sitemap)
 *      because their linked copay/PAP data is missing or unverified.
 *   2. Programs with unknown (null) eligibility fields. The site shows these
 *      with "Check eligibility with the program".
 *   3. Data conflicts flagged for review (nothing is changed automatically).
 *
 * Same rules as the pages themselves: src/utils/medFacts.js and
 * src/utils/programEligibility.js. Runs in `npm run build` (summary to the
 * log) and on demand with `npm run report:meds`.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { buildMedFacts, priceFor, NOINDEX_ISSUES } from '../src/utils/medFacts.js';
import { unknownPathways, NOT_ASSISTANCE_PROGRAM_IDS } from '../src/utils/programEligibility.js';
import { isGenericRecord } from '../src/utils/medIdentity.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(root, 'src', 'data', f), 'utf8'));
const meds = read('medications.json');
const programs = read('programs.json');
const priceEstimates = read('price-estimates.json');
const costPlusExclusions = read('cost-plus-exclusions.json');
const withdrawnMeds = read('withdrawn-medications.json');

const facts = meds.map((m) => buildMedFacts(m, {
    lang: 'en', allMeds: meds, programs, programsEs: {}, priceEstimates, costPlusExclusions, withdrawnMeds,
    priceRange: ({ min, max }) => `$${min}-$${max}`,
}));

const label = (m) => `\`${m.id}\` — ${m.brandName}${m.genericName && !m.brandName.includes(m.genericName) ? ` (${m.genericName})` : ''}`;
const byId = Object.fromEntries(meds.map((m) => [m.id, m]));

// 1. Noindex
const noindex = facts.filter((f) => !f.indexable);
const noindexLines = noindex.map((f) => {
    const reasons = f.issues.filter((i) => NOINDEX_ISSUES.has(i.kind)).map((i) => i.detail);
    return `- ${label(byId[f.id])}: ${reasons.join('; ')}`;
});

// 2. Unknown eligibility fields, per program
const GROUPS = { copayPrograms: 'copay', papPrograms: 'pap', foundationPrograms: 'foundation' };
const usedBy = {};
for (const m of meds) {
    for (const id of [m.copayProgramId, m.papProgramId]) if (id) (usedBy[id] ||= []).push(m.id);
}
const unknownLines = [];
const noBlockLines = [];
const extraLines = [];
for (const [group, type] of Object.entries(GROUPS)) {
    for (const [id, p] of Object.entries(programs[group] || {})) {
        if (NOT_ASSISTANCE_PROGRAM_IDS.has(id)) continue;
        const used = usedBy[id] ? ` — used by ${usedBy[id].length} medication page(s)` : '';
        if (!p.eligibility) {
            noBlockLines.push(`- \`${id}\` (${type}) ${p.name}: no eligibility fields at all${used}`);
            continue;
        }
        const unk = unknownPathways(type, p.eligibility);
        if (unk.length) unknownLines.push(`- \`${id}\` (${type}) ${p.name}: unknown ${unk.join(', ')}${used}`);
        const missing = [];
        if (type !== 'copay' && p.eligibility.excludesExtraHelp == null) missing.push('excludes_extra_help');
        if (type !== 'copay' && p.eligibility.requiresMedicaidDenial == null) missing.push('requires_medicaid_denial');
        if (!p.eligibility.verifiedDate) missing.push('eligibility_verified_date');
        if (!p.eligibility.sourceUrl) missing.push('eligibility_source_url');
        if (missing.length) extraLines.push(`- \`${id}\` (${type}): ${missing.join(', ')}`);
    }
}
const urlOnlyPap = meds.filter((m) => m.papUrl && !m.papProgramId && !isGenericRecord(m))
    .map((m) => `- ${label(m)}: PAP link ${m.papUrl} has no program record, so no eligibility fields`);

// 3. Conflicts
const notAssistance = [...NOT_ASSISTANCE_PROGRAM_IDS].map((id) => {
    const group = Object.keys(GROUPS).find((g) => programs[g]?.[id]);
    const e = group && programs[group][id].eligibility;
    return `- \`${id}\` is stored under ${group} but is a price-search / discount tool${e ? ` (flags: ${JSON.stringify(e)})` : ''}. Not routed as a copay card or PAP. Proposal: give it its own category (Neon \`savings_programs\` already has \`discount_card\`).`;
});
const genericLinked = facts.filter((f) => f.issues.some((i) => i.kind === 'generic-has-brand-program'))
    .map((f) => `- ${label(byId[f.id])}: generic record linked to copay \`${byId[f.id].copayProgramId || '—'}\` / PAP \`${byId[f.id].papProgramId || '—'}\`. Not shown on the generic page (one page = one product).`);
const multiBrand = meds.filter((m) => (m.brandName || '').includes('/')).map((m) => `- ${label(m)}`);
const brandNoPrice = meds.filter((m) => !isGenericRecord(m) && !priceFor(m, priceEstimates, costPlusExclusions)).length;

const today = new Date().toISOString().slice(0, 10);
const md = `# Medication data review

Generated ${today} by \`npm run report:meds\` (scripts/report-medication-data.js). Nothing in this list was changed automatically.

**Summary:** ${meds.length} medication records · ${meds.length - noindex.length} indexed · **${noindex.length} noindex** · ${unknownLines.length + noBlockLines.length} programs with unknown eligibility fields · ${urlOnlyPap.length} PAP links with no program record.

## 1. Pages rendered with noindex (left out of the sitemap)

These pages still load for patients, but search engines are told not to list them until the copay/PAP data below is fixed or verified.

${noindexLines.join('\n') || '_None._'}

## 2. Eligibility fields to verify

Programs below are shown on the site with **"Check eligibility with the program"** on any pathway where the field is unknown.

### Programs with no eligibility fields at all
${noBlockLines.join('\n') || '_None._'}

### PAP links with no program record
${urlOnlyPap.join('\n') || '_None._'}

### Programs with some pathway fields unknown
${unknownLines.join('\n') || '_None._'}

### New fields not filled in yet (Neon migration 056)
After migration 056 runs, fill these in Neon and run \`node scripts/sync-program-eligibility.js\`.

${extraLines.join('\n') || '_None._'}

## 3. Conflicts flagged for review

### Entries stored as copay cards / PAPs that are not
${notAssistance.join('\n')}

### Generic records linked to a brand's programs
${genericLinked.join('\n') || '_None._'}

### Records that combine several brands on one page (one page = one product)
${multiBrand.length} records. Flagged only; splitting them is a data decision.

${multiBrand.join('\n')}

### Prices
${brandNoPrice} brand-name records have no drug-specific price estimate. Their pages show no cost estimate rather than borrowing the generic price for their category (brand and generic pages never share prices). Generic records show the typical price for the category, labeled as typical.

See also: reports/cleanup-proposals.md (duplicates, slugs, Zantac, medication count).
`;

mkdirSync(join(root, 'reports'), { recursive: true });
writeFileSync(join(root, 'reports', 'medication-data-review.md'), md, 'utf8');
console.log(`report: ${noindex.length} noindex medication page(s), ${unknownLines.length + noBlockLines.length} program(s) with unknown eligibility -> reports/medication-data-review.md`);
