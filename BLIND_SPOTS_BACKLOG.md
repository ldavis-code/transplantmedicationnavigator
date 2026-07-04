# Blind Spots & Gaps — Tracked Backlog

**Created:** 2026-07-04
**Scope:** Full-codebase audit (serverless security, frontend/testing/observability, data freshness & legal/compliance).
**How to read this:** Items are grouped by severity and ordered by what to fix first. Each has a checkbox, the concrete evidence (file:line), the risk, and the fix. Findings were verified by reading the actual code, not inferred.

**The one-line summary:** Recent work has been concentrated on content, SEO, founder bio, and Spanish translation. Meanwhile the backend that handles money, auth, and patient health data has verified security holes, and there is no automated safety net (no CI, no tests on money paths, no error tracking, no scheduled data-freshness checks) watching any of it.

---

## P0 — Critical (do this week; #1 is today)

- [ ] **1. Seeded super-admin with a repo-committed password**
  - Evidence: `db/migrations/030_seed_admin_user.sql:24-40`, `netlify/functions/admin-seed.js:91-92`
  - Both seed `ldavis@transplantmedicationnavigator.com` / `change-me-immediately` as `role='super_admin'`. The migration commits the exact PBKDF2 hash; `admin-seed.js` self-documents "DELETE THIS FILE after first use" but it is still present.
  - Risk: If the password was never rotated in production, anyone reading the public repo has full admin (every role-gated admin endpoint accepts the resulting JWT).
  - Fix: **Rotate the password in the live DB today.** Delete/neuter `admin-seed.js`. Confirm no login still works with the default.

- [ ] **2. Auth secrets fall back to hardcoded constants when env vars are unset**
  - Evidence: `auth.js:16`, `admin-auth.js:12`, `admin-api.js:42-44`, and duplicated fallbacks in `admin-users.js:11`, `admin-features.js:9`, `admin-medications.js:10`, `admin-impact.js:21`, `admin-compliance.js:19`, `admin-login-stats.js:23`, `admin-sync-endpoints.js:21`, `organization.js`, `netlify-analytics.js`, `subscriber-auth.js:23`, `subscriber-data.js:23`.
  - Fallback strings include `'your-secret-key-change-in-production'`, `'admin-secret-change-me'`, `'subscriber-secret-change-in-production'` — all public in git history.
  - Risk: If `JWT_SECRET` / `ADMIN_PASSWORD` / `SUBSCRIBER_JWT_SECRET` / `MIGRATION_SECRET` is unset in Netlify, an attacker forges a `super_admin` token with a known string — no login needed.
  - Fix: **Confirm all four env vars are set in Netlify production.** Then make the code fail fast (throw at boot) if the secret is missing, instead of falling back.

- [ ] **3. `create-portal-session.js` — Stripe billing portal for any email, no auth**
  - Evidence: `netlify/functions/create-portal-session.js:60-91` — takes only `email` from the body; no token check (verified: only the CORS header references `Authorization`).
  - Risk: `POST {email:"victim@x.com"}` returns a Stripe Customer Portal URL where the attacker can view invoices/billing address and cancel/modify the victim's subscription. Account/billing IDOR.
  - Fix: Require the subscriber JWT; derive the customer from the token, not the request body.

- [ ] **4. `savings-tracker.js` — fully unauthenticated; identity is a client-supplied string**
  - Evidence: `netlify/functions/savings-tracker.js:23,46,88-98,194-209` — every operation keys off a caller-provided `userId` (a localStorage UUID); no auth of any kind.
  - Risk: `GET ?userId=<id>` returns another user's medication names, prices, and savings history; `DELETE ?id=&userId=` deletes their entries. Per-user health-adjacent data with zero access control (IDOR).
  - Fix: Require the subscriber JWT; scope every query to the token-derived user id. Copy the pattern already used correctly in `subscriber-data.js`.

- [ ] **5. `chat.js` LLM endpoint — no auth, no rate limiting, CORS `*`**
  - Evidence: `netlify/functions/chat.js` — handler dispatches straight to `handleAction`; Claude calls run with no per-caller throttling (verified: no `rateLimit`/`throttle`/`Authorization` present). CORS `*`.
  - Risk: Unauthenticated attacker loops `POST /api/chat` from any origin → unbounded Anthropic spend (financial DoS).
  - Fix: Add IP/token-based rate limiting and a per-session cap; lock CORS to the site origin.

---

## P1 — High (this month)

- [ ] **6. Password-reset token disclosed in response / logs**
  - Evidence: `netlify/functions/subscriber-auth.js:398` (logs reset URL unconditionally), `:410` (returns `resetUrl` with the live token when `NODE_ENV !== 'production'`).
  - Risk: If the function runtime lacks `NODE_ENV='production'`, `POST /forgot-password {email:victim}` returns the reset token directly → account takeover. Even otherwise, tokens land in logs.
  - Fix: Never return the token; never log it. Gate on an explicit debug flag, not `NODE_ENV`.

- [ ] **7. `migrate-savings-programs.js` — fail-open DDL/data-write endpoint**
  - Evidence: `netlify/functions/migrate-savings-programs.js` — auth enforced only `if (expectedKey && migrationKey !== expectedKey)`; skipped entirely if `MIGRATION_SECRET` is unset.
  - Risk: Anyone can trigger `ALTER TABLE` + bulk program writes (which drive the outbound redirect URLs users click).
  - Fix: Require the secret to be present; reject if unset. Ideally remove the public HTTP surface entirely (run migrations out-of-band).

- [ ] **8. Cross-org privilege / IDOR in role-gated admin endpoints**
  - Evidence: `admin-users.js:87,94` (`UPDATE users SET role WHERE id=${userId}` / deactivate) not scoped to `auth.orgId`; `admin-features.js:56` and `organization.js:58` use `targetOrgId = orgId || auth.orgId` with no ownership check.
  - Risk: An `org_admin` of org A can change roles / deactivate users / overwrite feature flags & branding in org B.
  - Fix: Scope every admin mutation to `auth.orgId`; reject cross-org `orgId` unless caller is a platform super-admin.

- [ ] **9. `epic-token-exchange.js` — SSRF via client-controlled URLs + token logging**
  - Evidence: `netlify/functions/epic-token-exchange.js:62,107-113,154,174` — `token_endpoint` / `fhir_base_url` come from the request body; server fetches them (carrying `EPIC_CLIENT_ID`) and reflects the response. Full token response logged at `:174`. The `fhir_endpoint_directory` table exists but is never used to allowlist targets.
  - Risk: SSRF / internal probing; secret leakage into logs.
  - Fix: Allowlist targets against `fhir_endpoint_directory`; stop logging tokens.

- [ ] **10. `get-subscription.js` and `medication-tracking.js` — unauthenticated PII/analytics**
  - Evidence: `get-subscription.js:46-61` returns plan/status for any email (enumeration); `medication-tracking.js:36-61,71-111` allows anyone to insert tracking rows (analytics poisoning) and read aggregate analytics.
  - Fix: Require auth; scope reads; validate/authenticate writes.

- [ ] **11. No CI exists**
  - Evidence: no `.github/workflows/` directory. The only deploy gate is `npm run build` (`package.json:8`), which runs a **non-strict** readability check (`scripts/check-readability.js` hard-fails only in `--strict`). Useful scripts `snapshot:verify`, `check:links`, `check:readability:strict` are manual-only.
  - Risk: Nothing runs tests/lint/link-checks/a11y on push. Regressions ship silently.
  - Fix: Add a GitHub Actions workflow: build + `snapshot:verify` + `check:readability:strict` on PR; scheduled `check:links` (see #15).

- [ ] **12. No tests on any money path**
  - Evidence: no test runner in `package.json` devDependencies (only `playwright-core` for snapshots). `tests/` is 21 static HTML baselines guarding i18n refactors only.
  - Risk: Checkout (`Subscribe.jsx` → `/create-checkout`), registration, patient-code redemption, and medication search have zero automated coverage. A broken Stripe checkout would ship undetected.
  - Fix: Add a test runner (vitest/Playwright) and smoke tests for checkout, auth, and search.

---

## P2 — Medium (near-term)

- [ ] **13. Production error tracking is a disarmed stub**
  - Evidence: `src/utils/errorLogger.js:18` (`SENTRY_DSN = ''`), Sentry init commented out (`:44-60`); `@sentry/react` not in `package.json`. `initErrorLogger()` (`main.jsx:10`) just prints a console line.
  - Risk: `ErrorBoundary` and all `logError()` calls resolve to `console.error` only. Production failures (checkout, DB, Stripe) are captured nowhere.
  - Fix: Install `@sentry/react`, set the DSN, uncomment the init block (infrastructure is already wired).

- [ ] **14. No funnel/conversion analytics**
  - Evidence: GA4 is live (`GoogleAnalytics.jsx:19`, `G-MRRECSDQWC`) but `trackEvent()` (`:126`) is never called anywhere in `src/`.
  - Risk: Page views visible; conversion and drop-off (Subscribe click → checkout → success, quiz completion, search) are invisible.
  - Fix: Instrument the money funnel with `trackEvent()` at the key steps.

- [ ] **15. No automated data-freshness safety net**
  - Evidence: the only scheduled function is `compliance-checks` every 6h (`netlify.toml:285-287`), which checks deploy/HTTPS/Epic/BAAs — never a program URL, copay amount, or eligibility rule. The real validator `scripts/check-links.js` is manual-only. Its own comment (`:19-24`) records that a July 2026 audit found 14 meds fixed in JSON but still broken in production because the DB was never synced.
  - Risk: "Link verified" trust badges silently age while claiming freshness; copay/eligibility figures have no automated verification at all.
  - Fix: Schedule `check:links` (cron/GitHub Action) against production; alert on failures. Consider a periodic re-verification reminder for copay amounts.

- [ ] **16. Three drifting stores of program data (no single source of truth)**
  - Evidence: `src/data/programs.json` (what users see — `App.jsx:127`, `MyMedications.jsx:7`, `MedicationDetail.jsx:17`) vs. Neon `programs` table (what `out-redirect.js:79-88` actually redirects to) vs. Neon `savings_programs` (sync target of `sync_programs_to_neon.js`). Meds sync Neon→JSON (`sync-medications-json.js:2-8`); programs sync JSON→Neon — opposite directions, differently-named tables. `programs.es.json` is a fourth hand-maintained copy.
  - Risk: The URL a patient sees can diverge from the URL the redirect sends them to. Drift already caused a production incident (#15).
  - Fix: Pick one source of truth (the table `out-redirect` reads), generate `programs.json` from it like medications, and add a parity check.

- [ ] **17. Privacy Policy materially understates data collection; no HIPAA stance**
  - Evidence: `src/pages/PrivacyPolicy.jsx` lists only email + payment + generic usage + "anonymous" surveys. Omits: medication tracking (`medication-tracking.js`), synced medication lists (`user_quiz_data`/`user_medications` per `docs/DATA_ARCHITECTURE.md:80-81`), quiz email leads (`quiz_email_leads`), GA, and **Epic FHIR EHR import (`epic-medications.js` — unambiguous PHI)**. The word "HIPAA" appears nowhere in the policy or Terms, yet the backend runs a full BAA-tracking compliance apparatus (`compliance-checks.js`, `admin-compliance.js`, `db/migrations/018_compliance_tracking.sql`).
  - Risk: Public policy says "email + analytics" while the product acts like a HIPAA-regulated entity collecting PHI. That gap is the legal exposure.
  - Fix: Rewrite the policy to match `DATA_ARCHITECTURE.md` reality, including Epic/medication data, and take an explicit covered-entity / business-associate stance.

---

## P3 — Low / hardening

- [ ] **18. i18n content drift risk** — parallel hand-maintained `.es.json` files (`faqs.es.json`, `glossary.es.json`, `programs.es.json`, `organ-medications.es.json`, `resources.es.json`, `application-checklist.es.json`) have no automated key-parity check. Add one. (UI strings in `en.json`/`es.json` are currently at parity — 1774 keys each.)
- [ ] **19. Weak admin password hashing** — `auth.js:40` uses 10,000 PBKDF2 iterations for admin/org users vs 100,000 for subscribers (`subscriber-auth.js:35`). Raise to match.
- [ ] **20. Homemade JWT** — non-constant-time signature comparison (`signature !== expected`) in every verifier (timing side-channel); no revocation. Move to a vetted library or use `crypto.timingSafeEqual`.
- [ ] **21. Verbose error leakage** — many handlers return `error.message` to the client (`auth.js:401`, `admin-users.js:101`, `organization.js:77`). Return generic messages; log details server-side.
- [ ] **22. CORS `*` on every endpoint** (`auth.js:31`, `admin-auth.js:15`, `subscriber-auth.js:26`, `lib/db.ts:60`). Bounded because tokens are in the body not cookies, but add an origin allowlist.
- [ ] **23. Glossary still 10 terms** despite `HEALTH_LITERACY_AUDIT_2026_02.md:214` recommending expansion to 25+. Expand `glossary.json`.
- [ ] **24. Dual-DB schema across three dirs** (`db/`, `neon/`, `supabase/`) with hand-run migrations and no tracking table — deployed schema is not provably equal to repo. Adopt a migration runner or drift check.
- [ ] **25. Copay anti-steering framing** — the Medicare copay-card warning exists and the quiz correctly gates cards on commercial insurance (`MyMedications.jsx:480,686`), but it's framed as "which helps you most," not the legal reason (federal anti-kickback). Consider stating the actual basis.

---

## What is already done well (so the picture is balanced)

- **Stripe webhook signatures are verified correctly** (`stripe-webhook.js:43-51`) before any DB write.
- **No SQL injection** — all Neon queries use tagged-template parameter binding; all Supabase calls use the query builder. Verified across chatbot search and interval math.
- **`out-redirect.js` is not an open redirect** — targets come from a DB/JSON allowlist keyed by validated `programType`/`programId`; the query substitution is `encodeURIComponent`-escaped.
- **`subscriber-data.js` is the model to copy** — every read/write/delete is scoped by the token-derived user id; 100k-iteration PBKDF2; enumeration-resistant forgot-password.
- **Medication browse/search survives a full DB/API outage** — `MedicationsContext.jsx:37-91` seeds from bundled JSON, merges DB-over-fallback, and degrades gracefully to `source: 'local'`.
- **Medicare copay-card gating** structurally avoids steering Medicare patients to manufacturer cards (the core OIG anti-kickback concern).
