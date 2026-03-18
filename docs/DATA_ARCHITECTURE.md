# TMN Data Architecture & Admin Operations Guide

This document explains where data lives, how it flows, and how the admin dashboard works.

---

## 1. Where Patient Data Lives

TMN uses a **privacy-first** design. Patient data stays on the patient's device by default.

### Local Storage (Patient's Browser)

| Key | What It Stores |
|-----|----------------|
| `medication_navigator_progress` | Quiz answers and progress |
| `tmn_my_medications` | Saved medication list |
| `tmn_meds_commercial_insurance` | Insurance type selection |
| `tmn_savings_user_id` | Savings tracker user ID |
| `tmn_subscription` | Cached subscription status |
| `tmn_promo_codes` | Redeemed promo codes |
| `tmn_subscriber_token` | Auth token for subscribers |

**Key point:** Quiz answers, medication lists, and insurance selections are never sent to the server unless the patient explicitly subscribes and opts into data sync.

### What Gets Sent to the Server

Only **anonymized interaction events** are sent. These contain no patient names, emails, SSNs, or any PHI:

| Data | Endpoint | Database Table |
|------|----------|----------------|
| Page views | `/.netlify/functions/event` | `events` |
| Quiz start/complete | `/.netlify/functions/event` | `events` |
| Medication searches | `/.netlify/functions/event` + `/.netlify/functions/medication-tracking` | `events` + `medication_tracking` |
| Program link clicks (copay, PAP, foundation) | `/.netlify/functions/out-redirect` | `events` |
| Helpful votes | `/.netlify/functions/event` | `events` |
| Survey responses | `/.netlify/functions/admin-surveys` | Neon DB |
| Subscriber data sync (opt-in only) | `/.netlify/functions/subscriber-data` | Neon DB |

### PHI Protection

The `event.js` endpoint has a strict blocklist. It rejects any request containing fields like: `name`, `ssn`, `email`, `dob`, `address`, `phone`, `mrn`, `medical_record_number`, or `medication_text`. If any PHI field is detected, the entire request is rejected.

---

## 2. Database Tables (Neon PostgreSQL)

### Core Tables

| Table | Purpose | Written By |
|-------|---------|-----------|
| `medications` | 152 base medications (brand, generic, category, PAP URLs) | Migrations only |
| `events` | Anonymized user interaction events | `event.js`, `out-redirect.js` |
| `medication_tracking` | Medication search/view/click analytics | `medication-tracking.js` |
| `organizations` | Licensed hospital/org records | `admin-licenses.js` |
| `org_medication_configs` | Per-org medication customizations (featured, hidden) | `admin-medications.js` |
| `org_users` | Staff accounts with roles | `admin-users.js`, `auth.js` |
| `user_savings` | Savings tracker entries | `savings-tracker.js` |
| `quiz_email_leads` | Email addresses submitted during quiz | `quiz-email.js` |
| `programs` | Assistance programs (copay cards, PAPs, foundations) | Migrations |
| `user_subscriptions` | Subscriber payment records | `stripe-webhook.js` |
| `community_price_reports` | User-submitted price reports | `price-reports.js` |
| `survey_responses` | Patient survey submissions | Survey functions |

### What the Events Table Captures

```
id | ts | event_name | partner | page_source | program_type | program_id | meta_json
```

Event names (whitelist):
- `page_view` — every page load
- `quiz_start` — user begins My Path Quiz
- `quiz_complete` — user reaches quiz results
- `med_search` — user searches for a medication
- `resource_view` — user views a resource
- `copay_card_click` — user clicks a copay card link
- `foundation_click` — user clicks a foundation link
- `pap_click` — user clicks a PAP link
- `helpful_vote_yes` / `helpful_vote_no` — user votes on helpfulness

---

## 3. How Data Flows to the Admin Dashboard

```
Patient's browser
  │
  ├── Page load ──────────────────→ POST /event (page_view)
  ├── Starts quiz ────────────────→ POST /event (quiz_start)
  ├── Finishes quiz ──────────────→ POST /event (quiz_complete)
  ├── Searches medication ────────→ POST /event (med_search)
  │                                 POST /medication-tracking
  ├── Clicks copay/PAP/foundation → GET /out-redirect → logs event → redirects to external site
  │
  └── All local data (quiz answers, med list, insurance) stays in browser
       │
       └── Only synced if patient subscribes and opts in
```

```
Admin Dashboard
  │
  ├── /admin (Dashboard) ────────→ GET /admin-api/stats
  ├── /admin/analytics ──────────→ GET /admin-api/funnel
  │                                GET /admin-api/events/by-partner
  │                                GET /admin-api/events/by-program
  │                                GET /admin-api/export/csv
  ├── /admin/impact-report ──────→ GET /admin-impact (DB + Netlify Analytics API)
  ├── /admin/medications ────────→ GET /medications + GET/PUT /admin-medications
  ├── /admin/users ──────────────→ GET/POST/PUT/DELETE /admin-users
  ├── /admin/surveys ────────────→ GET /admin-surveys
  ├── /admin/features ───────────→ PUT /admin-features
  └── /admin/organization ───────→ PUT /organization/update
```

---

## 4. Admin Pages — What Each One Does

### Dashboard (`/admin`)
- **Shows:** Total events, events this month, quiz completions, unique sessions
- **Source:** `events` table aggregated by `admin-api.js`

### Analytics (`/admin/analytics`)
- **Shows:** Conversion funnel (page views → quiz starts → quiz completes → med searches → program clicks), events by partner, events by program type
- **Actions:** Filter by partner, export CSV
- **Source:** `events` table

### Impact Report (`/admin/impact-report`)
- **Shows:** Funder-ready report with traffic, funnel, top pages, referral sources, program connections, medication interest, weekly growth
- **Source:** `events` table + Netlify Analytics API (if `NETLIFY_API_TOKEN` is set)
- **Actions:** Change time range (30/90/180/365 days), print to PDF

### Medication Config (`/admin/medications`)
- **Shows:** All 152 medications with search and category filters
- **Actions:** Toggle "Featured" or "Hidden" per medication for your organization
- **Source:** `medications` table + `org_medication_configs` table
- **Does NOT** edit core medication data (names, categories). Those are managed via database migrations.

### User Management (`/admin/users`)
- **Shows:** Staff accounts with name, email, role, status
- **Actions:** Add users, change roles, deactivate accounts
- **Roles:** Viewer (read-only), Editor, Org Admin (full org), Super Admin (full system)

### Survey Responses (`/admin/surveys`)
- **Shows:** Patient survey submissions with expandable details
- **Actions:** Filter by survey type

### Feature Settings (`/admin/features`)
- **Actions:** Toggle organizational features on/off (price reports, surveys, quiz, education, custom meds, analytics)
- **Note:** Feature availability may depend on your plan tier

### Organization Settings (`/admin/organization`)
- **Actions:** Set org name, logo, brand colors, contact info

---

## 5. Medications: Database vs. Local JSON

TMN uses a two-layer approach for medication data:

### Layer 1: Local JSON Fallback (`src/data/medications.json`)
- 152 medications bundled into the app build
- Always available, even if the database is unreachable
- Includes cost tiers, copay info, program IDs

### Layer 2: Database (`medications` table via `/.netlify/functions/medications`)
- Same 152 medications stored in Neon PostgreSQL
- Served via API with caching (1hr browser, 6hr CDN)
- Can be extended with new medications via migrations

### How They Merge (`MedicationsContext`)
1. App loads → fetches from database API
2. Merges database results over JSON fallback (DB values take priority)
3. Any medication in JSON but missing from DB is still included
4. Caches merged result for 5 minutes
5. If API fails entirely, falls back to bundled JSON

### Organization Customizations
Admins configure medications via `org_medication_configs`:
- **Featured:** Highlighted medications for their hospital
- **Hidden:** Removed from patient search results
- **Custom notes:** Hospital-specific instructions
- **Custom PAP URL:** Override the default assistance program link

---

## 6. Authentication & Roles

### Admin Auth Flow
1. Admin goes to `/admin/login`
2. Enters email + password
3. Backend verifies credentials → returns signed JWT (24hr expiry)
4. Token stored in browser, sent as `Authorization: Bearer <token>` on all admin API calls
5. Each admin endpoint verifies the token before returning data

### First-Time Setup
- Hit the admin-seed endpoint to create the first super_admin account
- Change the password immediately after first login

### Role Permissions

| Role | View Data | Edit Content | Manage Users | Manage Org | System Settings |
|------|-----------|-------------|-------------|------------|-----------------|
| Viewer | Yes | No | No | No | No |
| Editor | Yes | Yes | No | No | No |
| Org Admin | Yes | Yes | Yes | Yes | No |
| Super Admin | Yes | Yes | Yes | Yes | Yes |

---

## 7. External Integrations

| Service | Purpose | Env Variable |
|---------|---------|-------------|
| Neon PostgreSQL | Primary database | `DATABASE_URL` |
| Stripe | Subscription payments | `STRIPE_SECRET_KEY` |
| Resend | Transactional email | `RESEND_API_KEY` |
| Google Analytics 4 | Client-side analytics (in addition to DB tracking) | Hardcoded `G-MRRECSDQWC` |
| Netlify Analytics API | Traffic data for Impact Report | `NETLIFY_API_TOKEN` |
| Epic FHIR | EHR integration for hospitals | `EPIC_CLIENT_ID`, `EPIC_REDIRECT_URI` |

---

## 8. Reporting Portal

Separate from admin, the reporting portal (`/reporting`) provides read-only analytics access for partners:

| Page | Shows |
|------|-------|
| Dashboard | Summary stats, event trends |
| Events | Paginated event log with filters |
| Funnel | Visual conversion funnel |
| Partners | Events broken down by partner |
| Programs | Events broken down by program type |
| Partner Report | Deep-dive report for a specific partner |

---

## 9. Privacy Summary

| Data Type | Where It Lives | Sent to Server? |
|-----------|---------------|-----------------|
| Quiz answers | Patient's localStorage | No (unless subscribed) |
| Medication list | Patient's localStorage | No (unless subscribed) |
| Insurance selection | Patient's localStorage | No |
| Page views | Server `events` table | Yes (anonymized) |
| Quiz start/complete | Server `events` table | Yes (anonymized, no answers) |
| Medication search queries | Server `medication_tracking` table | Yes (medication name only, no patient ID) |
| Program clicks | Server `events` table | Yes (program name only) |
| Email (quiz opt-in) | Server `quiz_email_leads` table | Yes (only if patient submits it) |
