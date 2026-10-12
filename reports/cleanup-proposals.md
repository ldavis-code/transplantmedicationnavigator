# Cleanup proposals: awaiting approval

Nothing in this file has been applied. The redirects and SQL below are proposals. Each one needs Lorrinda's approval before it goes into `public/_redirects` or Neon.

Changing or removing a medication `id` changes the page URL. It also affects other tables that store the id: `savings_programs.medication_id` (a foreign key with `ON DELETE SET NULL`), the `medication_tracking` table, and stored analytics events. Each merge below therefore updates those tables in the same transaction.

Every redirect needs both the English and the Spanish URL. Netlify serves the pages with a trailing slash, so the redirect source is matched with and without it.

---

## 1. Campath duplicate

| Field | `/medications/campath` | `/medications/3e7d60c8-9882-4077-9fb5-848abaaf47fe` |
|---|---|---|
| brandName | Campath / Lemtrada | Campath |
| genericName | Alemtuzumab | alemtuzumab |
| commonOrgans | Heart, Intestine, Kidney, Liver, Lung, Pancreas | Kidney |
| PAP | sanofi-pap | none |
| Copay card | sanofi-copay | none |
| cost_tier / copay tier | high / Specialty | none |

The two records have different brand names, so the app's duplicate check doesn't catch them. As a result, both pages are live and both appear in the sitemap.

**Proposal:** keep `campath` and 301 the UUID page to it. Delete the UUID row only after the redirect is live.

```
/medications/3e7d60c8-9882-4077-9fb5-848abaaf47fe     /medications/campath/     301!
/medications/3e7d60c8-9882-4077-9fb5-848abaaf47fe/    /medications/campath/     301!
/es/medications/3e7d60c8-9882-4077-9fb5-848abaaf47fe  /es/medications/campath/  301!
/es/medications/3e7d60c8-9882-4077-9fb5-848abaaf47fe/ /es/medications/campath/  301!
```

**Conflicts for you to decide:**
- **Which organs?** The UUID record says Kidney only, and the slug record lists every organ.
- **One product per page:** "Campath / Lemtrada" combines two brands. Lemtrada is the MS brand of alemtuzumab, which has its own program. Should this page be Campath only?

---

## 2. Renvela / sevelamer

| Field | `/medications/renvela` | `/medications/sevelamer` |
|---|---|---|
| brandName | Renvela | Renvela / Renagel |
| genericName | Sevelamer | Sevelamer |
| cost_tier | medium | high |
| typical_copay_tier | 2 | Specialty |

Everything else is the same, including the programs. The cost tier and copay tier disagree, so you'll need to say which values are right.

**Option A (recommended, fits "one page = one product"):** keep `/renvela` as the brand page, and turn `/sevelamer` into the generic page: brandName "Sevelamer (generic)", with no manufacturer programs. Then the two pages link to each other through "check your bottle", and no redirect is needed.

**Option B:** merge `/sevelamer` into `/renvela`:

```
/medications/sevelamer      /medications/renvela/     301!
/medications/sevelamer/     /medications/renvela/     301!
/es/medications/sevelamer   /es/medications/renvela/  301!
/es/medications/sevelamer/  /es/medications/renvela/  301!
```

---

## 3. Readable slugs for UUID ids

| Current id | Record | Proposed slug |
|---|---|---|
| `0455fed9-a5d3-4aec-bb95-5200d077c92e` | Mounjaro / Zepbound (tirzepatide) | `tirzepatide` |
| `7b75e9cc-d355-43de-91a3-f7330c9409fd` | ProAmatine (midodrine) | `midodrine` |
| `3e7d60c8-9882-4077-9fb5-848abaaf47fe` | Campath | merged per section 1 |

Neither proposed slug is taken. Other multi-brand records already use the generic name as their slug (`sevelamer`, `tacrolimus`), so the proposals follow that convention.

Proposed SQL, not run. Neon does not allow updating a primary key that other tables reference, so it inserts a copy under the new id, moves the references, then deletes the old row:

```sql
BEGIN;
INSERT INTO medications SELECT 'tirzepatide', brand_name, generic_name, rxcui, category, manufacturer, stage,
       common_organs, pap_url, created_at, NOW() /* + remaining columns */
  FROM medications WHERE id = '0455fed9-a5d3-4aec-bb95-5200d077c92e';
UPDATE savings_programs SET medication_id = 'tirzepatide' WHERE medication_id = '0455fed9-a5d3-4aec-bb95-5200d077c92e';
-- same for medication_tracking and any table keyed by medication id
DELETE FROM medications WHERE id = '0455fed9-a5d3-4aec-bb95-5200d077c92e';
COMMIT;
-- repeat for midodrine
```

Redirects:

```
/medications/0455fed9-a5d3-4aec-bb95-5200d077c92e     /medications/tirzepatide/     301!
/es/medications/0455fed9-a5d3-4aec-bb95-5200d077c92e  /es/medications/tirzepatide/  301!
/medications/7b75e9cc-d355-43de-91a3-f7330c9409fd     /medications/midodrine/       301!
/es/medications/7b75e9cc-d355-43de-91a3-f7330c9409fd  /es/medications/midodrine/    301!
```
(plus trailing-slash versions of each)

**Also found:** Neon has a second, UUID-keyed row for each of **Ofev**, **Esbriet** and **Ventavis**:
- `41be035c-…`
- `42f1cad0-…`
- `a9c229b4-…`

The site hides them today: the sync script keeps the slug id, and the app removes duplicates at runtime. Proposal: delete those three UUID rows in Neon after checking that nothing references them.

---

## 4. Zantac (ranitidine): flagged

`/medications/ranitidine` is live, indexed, and in the sitemap. The FDA asked manufacturers to withdraw all ranitidine products from the US market in April 2020.

The page has no programs, so it shows foundations and discount cards only. A patient could read it as a medication they can still fill.

**Options:**
- **A:** keep the page and add a notice at the top: "Ranitidine (Zantac) was withdrawn from the US market in 2020. Ask your transplant team what to take instead." Mark it noindex.
- **B:** remove the record and 301 the page to `/medications/famotidine/`, which exists. Note that a redirect quietly suggests famotidine as the substitute. Medication choices belong to the transplant team, so this option is in tension with the site's rule.

Option A keeps the "we never tell you to change your medication" rule intact.

---

## 5. Medication count: 260 on the home page vs 259 on /medications

**Today (October 12, 2026) both pages say 260.** I checked three places:
- the static HTML: "list of 260 medications" and "260 transplant medications"
- the live pages rendered in a real browser after JavaScript ran: "Browse all 260 medications, A to Z" on both
- the live database API: `count: 260`

**How each number is produced:**
- **Home page:** counts the rows in `src/data/medications.json` (scripts/generate-home-stats.js, at build time).
- **/medications:** uses the runtime list. That list merges the database with the same file, and then removes duplicates that share a brand + generic name (src/context/MedicationsContext.jsx).

The two counts agree only while every duplicate is a UUID copy of a slug record, as with Ofev, Esbriet and Ventavis.

**Most likely source of the 259 you saw:** a cached copy of the site from before the last medication sync. The site installs as a PWA, and a returning browser can keep serving the old app files until it refreshes. The build log already records an earlier mismatch of 220 vs 259 that came from the JSON file falling behind Neon. A check added since then stops the build when that happens again.

**To close it for good (proposed):** have both pages read the same count, from the build-time file, instead of the runtime list length. It would also help to know which device and browser showed 259.
