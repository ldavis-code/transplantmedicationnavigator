# Website Compliance Review — July 6, 2026

Scope: full-repo review of legal pages, data flows, tracking/consent, security posture, and
marketing claims. This is an engineering review, not legal advice — have counsel confirm the
regulatory conclusions before relying on them.

**Bottom line:** the patient-facing architecture is genuinely privacy-conscious (localStorage-first,
PHI blocklist on the events endpoint), but several real data flows contradict the site's own public
claims, there is no consent mechanism for tracking, the commercial terms required for a paid
subscription are missing, and a handful of security defects rise to compliance level. The site's
own `ROADMAP.md` already flags two of these (Anthropic BAA, ToS update) as unchecked items.

---

## 1. Critical — fix first

### 1.1 Public privacy claims contradict actual data flows (FTC Act §5 deceptive-practices risk)

The site repeatedly promises no data leaves the device:

- Home page: "We do not save your info" (`index.html:479-483`)
- Pricing: "Transplant Medication Navigator does not store or access medication lists. Data stays on the device" (`src/pages/Pricing.jsx:116`)
- /for-hospitals: "No PHI collected, stored, or transmitted", "No BAA required", "Anonymous patient access, no accounts needed" (`src/pages/ForHospitalAdmin.jsx:311-328`)

But the code does the following:

| Flow | Health info + identifier | Where |
| --- | --- | --- |
| Quiz email results | Email + full quiz answers (organ, insurance, cost burden) + medication list | Supabase `quiz_email_leads` + Resend (`src/App.jsx:1752-1761`, `netlify/functions/quiz-email.js:287-298`) |
| Email signup | Email + full medication list | Supabase `email_signups` + Resend, med list rendered in the email body (`src/components/EmailSignup.jsx:77-88`, `netlify/functions/subscribe-alerts.js:82-152`) |
| Subscriber sync | Account-keyed quiz answers + medication lists | Supabase `user_quiz_data` / `user_medications` (`netlify/functions/subscriber-data.js`) |
| AI chatbot | Organ type, insurance, medications, cost burden + verbatim free text | Anthropic API, no BAA (`netlify/functions/chat.js:429-459, 707-728`; `ROADMAP.md:58,93` acknowledges) |
| Epic import | Access tokens + patient FHIR IDs written to Netlify function logs | `epic-token-exchange.js:174` (full token response logged), `epic-medications.js:143` (patient ID in logged URL), `epic-ehr-callback.js:217-221` |
| Price reports | Medication + location + "hashed" IP that is only base64-truncated (reversible) | `netlify/functions/price-reports.js:111-118` |
| Savings tracker | Medication fill history keyed to a stable device ID, readable via **unauthenticated** GET | `netlify/functions/savings-tracker.js`, ID generated in `src/lib/savingsApi.js:11-18` |

Because the site is (presumably) not a HIPAA covered entity for its direct-to-patient product, the
governing regimes are the **FTC Act** (deceptive claims — see GoodRx and BetterHelp consent
orders, both health platforms penalized for exactly this gap between privacy claims and data
flows), the **FTC Health Breach Notification Rule** (applies to non-HIPAA health apps), and state
consumer-health-data laws (below).

**Fix:** two-sided — (a) stop the flows that shouldn't exist: remove token/PHI logging from all
`epic-*` functions, replace the price-reports IP encoding with a salted SHA-256 or drop IP
entirely, put auth on savings-tracker GET/DELETE; and (b) make every public claim accurate:
rewrite the home/Pricing/for-hospitals copy to say what is true ("your quiz answers and medication
list stay on your device *unless you email yourself results, sign up for alerts, subscribe, or use
the chat assistant*").

### 1.2 No consent mechanism for tracking

GA4 (`G-MRRECSDQWC`) loads unconditionally on mount with no banner, no Consent Mode, no
opt-out, and no Global Privacy Control handling (`src/components/GoogleAnalytics.jsx:92-94`,
mounted `src/App.jsx:7226`). GA receives page paths, which include per-medication URLs — on a
health site that is "consumer health data" under the **Washington My Health My Data Act** and
similar laws (Nevada SB 370, Connecticut), which require *opt-in consent* before collection and
sharing, plus a dedicated Consumer Health Data Privacy Policy linked from the homepage. The
Privacy Policy even tells users they can refuse cookies (`PrivacyPolicy.jsx:101`) but the site
never asks. Google Fonts also loads from Google's CDN on every page (`index.html:343-345`),
leaking visitor IPs pre-interaction.

**Fix:** add a consent banner; load GA only after consent (Consent Mode v2 with default-denied);
honor GPC; self-host the fonts; add the MHMDA health-data policy + homepage link if you have
Washington/Nevada users (you almost certainly do).

### 1.3 CAN-SPAM: dead unsubscribe link

Both outgoing email templates link to `https://transplantmedicationnavigator.com/unsubscribe?email=...`
(`quiz-email.js:228`, `subscribe-alerts.js:146`) — **no `/unsubscribe` route or function exists**
anywhere in the app, and there is no suppression list checked before sending. A non-functional
opt-out is a per-email CAN-SPAM violation. CAN-SPAM also requires a valid physical postal address
in commercial email; the templates have none.

**Fix:** build the `/unsubscribe` page + backend (set a `unsubscribed` flag in Supabase, check it
in both send paths), and add TRIO's postal address to the email footer.

### 1.4 Security defects with compliance consequences

- **Unauthenticated seed endpoint with hardcoded credentials** — `/api/admin-seed`
  (`netlify/functions/admin-seed.js:91-92`, password `change-me-immediately`, returned in the
  HTTP response). The file itself says "DELETE THIS FILE after first use." Delete it.
- **Forgeable tokens** — 12+ functions fall back to publicly-known signing secrets if env vars are
  unset (`'your-secret-key-change-in-production'` in `auth.js:16` and others,
  `'admin-secret-change-me'`, `'subscriber-secret-change-in-production'` in
  `subscriber-auth.js:23`). Fail closed instead: throw if the env var is missing.
- **Committed admin password hash + salt** for a real account in
  `db/migrations/030_seed_admin_user.sql` — offline-crackable; rotate the password and purge.
- **Unauthenticated compliance endpoint** — `/api/compliance-checks`
  (`compliance-checks.js:113-121`) returns internal posture (Epic config, BAA gaps) to any caller.
- **Admin role in `user_metadata`** (`src/middleware/adminGuard.jsx:10`) — user-editable in
  default Supabase; move to `app_metadata`.
- **No rate limiting** on any auth endpoint; reporting portal uses one shared password with a
  non-constant-time compare (`admin-auth.js:101`).
- **Committed patient/promo codes** (`redeem-patient-code.js:22-27`, `src/lib/promoCodes.js`).

---

## 2. High priority

### 2.1 Privacy Policy is materially incomplete (`src/pages/PrivacyPolicy.jsx`, dated 2026-01-01)

Missing entirely: Google Analytics by name; the Epic/MyChart FHIR import (the single most
sensitive feature on the site); every actual processor (Supabase, Neon, Resend, Netlify,
Anthropic) — only Stripe is named; any HIPAA position statement; any state-law rights section
(CCPA/CPRA, WA MHMDA, etc.) with a verified-request process; concrete retention periods; a postal
address. It also names the operator as "TransplantNav LLC" — confirm that is the correct legal
entity given TRIO's involvement.

**Fix:** rewrite to describe the real flows in §1.1, name all processors, state the HIPAA position
("we are not a covered entity; information you share with us is protected by this policy and the
FTC Health Breach Notification Rule, not HIPAA" — counsel to confirm), add a state-rights section
and a working deletion workflow (there is currently no way to actually delete a
`quiz_email_leads` row on request).

### 2.2 Terms of Service missing all commerce terms (`src/pages/TermsAndConditions.jsx`)

The site sells $8.99/mo and $79.99/yr subscriptions, and the paywall promises a "30-Day Money Back
Guarantee" (`PaywallModal.jsx:242-246`) that appears in no policy document. The Terms contain no
auto-renewal disclosure, no cancellation terms, no refund policy, and the governing-law clause
names no state ("laws of the United States", `:104`). California's Automatic Renewal Law (and ~20
state equivalents, plus FTC click-to-cancel) require clear-and-conspicuous renewal terms at
checkout, affirmative consent, and an online cancellation path.

**Fix:** add a Subscriptions section (price, billing cadence, renewal, how to cancel, refund
conditions matching the 30-day promise), pick a governing state, and add renewal-terms language
next to the Subscribe button. `ROADMAP.md:100` already lists this as pending.

### 2.3 HIPAA posture for the hospital product

`/for-hospitals` markets "HIPAA-Compliant by Design" while the Epic standalone flow passes tokens
and patient FHIR IDs through your functions (and currently into logs), the EHR-launch flow puts
access token + patient ID into a session cookie, and migration `018_compliance_tracking.sql`
defines `compliance_events`/`compliance_scores` tables keyed by `patient_id` with adherence
events — a PHI-grade design, even if dormant. If hospitals deploy this for their patients, they
will (correctly) treat you as a **business associate** and demand a BAA; "No BAA required" is not
a defensible claim for the integrated product.

**Fix:** decide the posture explicitly. Either (a) keep the patient-direct product genuinely
PHI-free server-side (kill the logging, keep tokens client-only, drop the patient_id adherence
schema) and scope the hospital pitch to "patient-directed, HIPAA right-of-access flow — your
patients pull their own records; we never store PHI"; or (b) accept BA status: sign BAAs with
Netlify, Supabase, Neon, Resend, and Anthropic (Anthropic offers a BAA/zero-retention arrangement;
already on your roadmap) and stand up the required safeguards. Option (a) is far cheaper and
matches your current architecture — but only after the log leaks are fixed.

---

## 3. Medium priority

1. **Chatbot has zero user-facing disclosure** (`MedicationAssistantChat.jsx`): the only
   "never give medical advice" guardrail is the hidden system prompt (`chat.js:82-117`). Add a
   visible line in the widget: AI-generated, educational only, not medical advice, may contain
   errors — several states now require AI-chat disclosure, and it also cuts liability on the
   specific dollar-figure claims the bot makes (`chatbotGuidance.js:118, 250, 272`).
2. **Disclaimer modal never re-surfaces** — one-time `localStorage` flag with no version key
   (`DisclaimerModal.jsx:5,93`). Add a version so material changes re-prompt.
3. **Accessibility claims vs. testing** — `index.html:175` schema markup claims WCAG 2.1 AA while
   the accessibility statement honestly says "partially conformant" and there is no automated a11y
   testing. Align the schema claim with the statement, and add axe/pa11y to CI. The Section 504
   statement and grievance procedure (`src/pages/Accessibility.jsx`) are a genuine strength — keep
   them current, and verify the `504coordinator@` mailbox actually exists.
4. **Security headers** — CSP includes `unsafe-inline` + `unsafe-eval` (`netlify.toml:300`);
   `vercel.json` lacks CSP/HSTS/Referrer-Policy entirely (delete it if Vercel is unused).
5. **Unauthenticated, CORS-`*` event endpoint** (`event.js`) — fine for privacy (good PHI
   blocklist), but spammable; add basic rate limiting so partner analytics stay trustworthy.
6. **Feedback widget** writes directly to Supabase with a hardcoded anon key
   (`FeedbackWidget.jsx:14-17`) — world-writable table; route through a function or verify RLS.
7. **Retention** — policy says "as long as necessary" with no periods and no deletion job for
   email leads, savings rows, or `patient_login_tracking`. Define and enforce periods.

---

## 4. Remediation order

**Week 1 (stop the bleeding):**
1. Build `/unsubscribe` + suppression check; add postal address to email templates.
2. Strip token/patient-ID logging from `epic-token-exchange.js`, `epic-medications.js`,
   `epic-ehr-callback.js`; stop logging emails in `quiz-email.js`.
3. Delete `admin-seed.js`; remove fallback secrets (fail closed); rotate the seeded admin
   password; purge `030_seed_admin_user.sql` hash; move admin role to `app_metadata`;
   auth-gate `compliance-checks.js` and savings-tracker reads; fix price-reports IP handling.
4. Correct the false claims on home, Pricing, and /for-hospitals pages.

**Weeks 2–4 (policies and consent):**
5. Consent banner + GA Consent Mode v2 + GPC; self-host Google Fonts.
6. Rewritten Privacy Policy (all processors, Epic flow, HIPAA position, state rights,
   retention, postal address) + MHMDA consumer-health-data policy if applicable.
7. Terms: subscription/auto-renewal/refund/cancellation section; governing law; renewal
   disclosure at checkout.
8. Chatbot user-facing disclosure; disclaimer-modal versioning.

**Ongoing:**
9. Decide HIPAA/BAA posture for the hospital product; sign the Anthropic BAA or strip profile
   data from chat requests (both already on `ROADMAP.md`).
10. DSAR/deletion workflow; retention jobs; vendor + BAA register in the existing admin
    compliance dashboard; axe/pa11y in CI; tighten CSP.
