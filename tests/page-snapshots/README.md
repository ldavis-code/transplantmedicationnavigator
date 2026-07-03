# Page Snapshots — i18n Safety Net

These files are the rendered HTML (`#root` innerHTML) of the top
patient-facing pages, captured from the production build by
`scripts/snapshot-pages.js`.

## Purpose

They exist to make the i18n string-extraction work verifiable: replacing
hardcoded English strings with translation-key lookups (`t('...')`) must not
change the rendered output at all. After any extraction pass:

```bash
npx vite build
npm run snapshot:verify
```

If every page reports `OK (identical)`, the refactor provably changed nothing
user-visible. A `MISMATCH` writes the offending capture to
`<page>.actual.html` (gitignored) so you can diff it against the baseline.

## Updating baselines

Only update baselines when page content changes **intentionally**
(copy edits, new sections, data updates):

```bash
npx vite build
npm run snapshot:update
```

Then commit the changed baseline files together with the change that caused
them, so the baseline always matches the code.

## Pages covered

home, wizard, medications (search), medication-detail (tacrolimus),
education, appeals, application-help, faq — the pages in scope for the
Spanish translation project.

## Determinism

Captures block service workers, abort all external and `/api/*` requests
(pages render their deterministic fallbacks), and pin viewport, locale, and
timezone. If a verify run fails immediately after an update run with no code
changes, something nondeterministic crept into a page (e.g. `Math.random()`,
`new Date()` rendered on load) — fix or normalize it before trusting results.
