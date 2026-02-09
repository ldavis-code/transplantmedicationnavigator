# Health Literacy Audit & Perceived Value Assessment

**Site:** Transplant Medication Navigator
**Date:** February 9, 2026
**Scope:** Full site audit across 45 routes, 184 medications, 100+ FAQs, glossary, knowledge base, appeals tools, and all user-facing content.

---

## PART 1: HEALTH LITERACY ASSESSMENT

### Reading Level: 4th-7th Grade (Target: 6th Grade) — MEETS TARGET

The site consistently delivers content at or below a 6th grade reading level. Here is the evidence across content categories:

### Glossary (`src/data/glossary.json`)

All 10 terms use single-clause, plain-language definitions:

| Term | Definition | Est. Grade |
|------|-----------|-----------|
| Deductible | "The amount you pay before insurance starts helping" | ~5th |
| Copay | "The amount you pay each time you get medicine" | ~4th |
| Coinsurance | "The percentage you pay after meeting your deductible" | ~6th |
| Out-of-pocket maximum | "The most you pay in one year" | ~4th |
| Prior authorization | "When insurance makes your doctor ask permission before covering a medicine" | ~6th |
| PAP | "Patient Assistance Program - free or low-cost medicine from drug companies" | ~5th |
| Formulary | "Your insurance's list of covered medicines" | ~5th |
| Generic | "A medicine that works the same as the brand name but costs less" | ~5th |
| Specialty pharmacy | "A mail-order pharmacy for expensive or special medicines" | ~5th |
| Foundation grant | "Money from a charity to help pay for medicine" | ~4th |

No term definition exceeds 15 words. No jargon is left undefined.

### FAQ Content (`src/data/faqs.json` — 85+ entries, 12 categories)

- Average sentence length: 8-12 words
- Uses contractions naturally ("don't," "you'll," "can't")
- Defines technical terms inline at first use: e.g., "specialty pharmacy (a mail-order pharmacy for expensive medicines)"
- Action-oriented phrasing: "Start by...", "Here's what to do...", "Step 1:"
- Empathetic tone: "Don't give up!", "You don't have to do this alone"

**Sample reading levels:**

| Sentence | Est. Grade |
|----------|-----------|
| "Generic drugs cost less, so insurance prefers them." | 4th |
| "The donut hole is a gap in Medicare drug coverage." | 6th |
| "For the first 30 months, your job insurance pays first." | 5th |
| "Drug companies give free medicine to people who qualify." | 5th |
| "Your quiz answers stay on your phone or computer." | 4th |

### Knowledge Base (`src/data/knowledge-base.json` — 12 response categories)

- Uses "medicine" not "medication," "drug companies" not "pharmaceutical manufacturers"
- Active voice dominant: "Drug companies give free medicine" not "Free medicine is provided"
- Bullet-pointed and numbered steps throughout
- Short sentences: "Most take 2-4 weeks. Need help finding a program?"

### Appeals Page (`src/pages/Appeals.jsx`)

- Headlines use emotional, plain language: "Got Denied? Don't Give Up."
- Step therapy explained as: "your insurance wants you to try a cheaper drug before they'll pay for the one your doctor picked"
- Denial reasons use colloquial headers: "Not on the List," "Try Something Else First"
- 6-step interactive appeal tracker: "Get It in Writing," "Watch the Clock"

### Home Page (`src/App.jsx`, Home component)

- Hero: "Compare medication prices and find verified assistance programs in one place."
- Mission: "We help transplant patients get the medicine they need."
- Core values: "We break down hard forms into easy steps so you don't need a college degree to get help with your medicine."

### Resources (`src/data/resources.json`)

- Every description in plain language: "Gives money to help dialysis and transplant patients pay for treatment if they qualify."
- Avoids institutional language

---

## Health Literacy Strengths

1. **Plain language is systemic, not incidental.** Every content layer — glossary, FAQs, chatbot, appeals, resources — maintains consistent 5th-7th grade language. This penetrates to the data layer, not just the UI layer.

2. **Technical terms are always defined at point of use.** Three definition mechanisms:
   - `TermTooltip`: hover/click/focus tooltips with dotted-underline visual cues
   - `DefineInline`: parenthetical definitions in text flow
   - `GlossaryLink`: expandable "What's this?" blocks

3. **Action-oriented structure.** Content tells users what to do, not just what things are. The FAQ on appeals doesn't explain what an appeal is — it says "Step 1: Find out why it was denied. Get it in writing."

4. **Emotional resonance without condescension.** Content acknowledges fear and frustration ("This is urgent. Stopping your anti-rejection drugs can cause problems.") while maintaining directness.

5. **Scam awareness baked in.** Multiple touchpoints: "Never pay to apply for help. If a site asks for money, that's a scam."

6. **Read-aloud functionality.** `ReadAloudButton` component provides browser-native text-to-speech at 0.95x speed with proper start/stop controls and 44px touch targets.

7. **Simple View toggle.** Site-wide content simplification mode in the navigation.

---

## Health Literacy Gaps

1. **Copay card FAQ entry is the longest and most complex.** The entry for "What is a copay card?" contains dense paragraphs with multiple nested concepts (commercial insurance, Medicare exclusion, federal anti-kickback laws). Reads at ~8th-9th grade level — notably higher than the rest. The copay accumulator explanation is similarly complex.

2. **Medication regimen FAQs shift register.** The "Medication Regimens by Transplant Type" category uses clinical language ("Calcineurin Inhibitor," "Antimetabolite," "maintenance therapy," "immunological properties") that reads at a 10th+ grade level. These entries feel like they were written for a different audience.

3. **No automated readability scoring in CI/CD.** Content quality depends entirely on author discipline. No automated gate to catch regressions.

4. **Glossary is limited to 10 terms.** The site uses many more domain-specific terms (copay accumulator, step therapy, narrow therapeutic index, formulary tier) that appear in content but are not covered by tooltip definitions.

5. **Some long-form content lacks chunking.** A few FAQ answers exceed 150 words with multiple concepts. Health literacy best practice recommends one concept per answer or breaking into sub-questions.

6. **No visual/video content for complex processes.** Appeals, PAP applications, and insurance coordination concepts would benefit from flowcharts or short video walkthroughs.

---

## PART 2: PERCEIVED VALUE ASSESSMENT

### Overall Perceived Value: HIGH

This site addresses a genuine, critical need — transplant patients navigating a fragmented, high-stakes medication affordability landscape — with unusual clarity and completeness.

### Core Value Propositions

#### 1. Aggregation of fragmented information (HIGH VALUE)

184 medications, 60+ assistance programs, 65+ copay cards, and 50+ external resources in a single searchable interface. This information is otherwise scattered across dozens of manufacturer websites, government portals, and nonprofit organizations. For a transplant patient or social worker, this consolidation alone justifies the tool.

#### 2. "My Path" personalization quiz (HIGH VALUE)

Tailors results to organ type, transplant status, insurance type, financial situation, and current medications. Transforms a generic directory into personalized guidance — "here are the 5 programs most likely to help you" instead of "here are 200 programs."

#### 3. Insurance denial appeal toolkit (VERY HIGH VALUE)

The Appeals page is the site's standout feature:
- Interactive step tracker with progress visualization
- Denial reason categorization with plain-language explanations
- Patient-to-doctor letter builder generating customized appeal request letters
- Downloadable appeal guide and medical necessity letter template
- Step therapy exception guidance
- Generic vs. brand advocacy resources

This tool could directly prevent graft loss. Insurance denials for immunosuppressants are common and the consequences of non-adherence are severe (organ rejection). A tool that helps patients navigate appeals at a 6th grade reading level has tangible life-or-death value.

#### 4. Copay diversion education (HIGH VALUE)

The "When Insurance Sends You Away" section educates about copay accumulators, maximizers, and alternative funding programs — practices poorly understood by patients that can result in thousands in unexpected costs. Timely (many states actively legislating) and directly protective.

#### 5. Price comparison and savings tools (MODERATE-HIGH VALUE)

Medication search with estimates across GoodRx, Cost Plus, Walmart, Amazon, SingleCare. Savings Calculator and tracker add ongoing utility. The "Deductible Trap" education (warning transplant patients not to use discount cards for daily medications) is a nuanced, genuinely helpful insight most discount card sites would never mention.

#### 6. Privacy-first design (MODERATE VALUE, HIGH TRUST)

Quiz answers stored locally, no PHI collection, clear privacy statements. For a health tool targeting a vulnerable population, this builds essential trust. Disclaimer modal on first visit and repeated "your data stays on your device" messaging reinforce this.

#### 7. Emergency and crisis resources (HIGH VALUE)

"Friday night ran out of medicine" FAQ, 988 mental health crisis line banner, "In an emergency, call 911" disclaimer address real acute scenarios. Integrated into the site's flow, not afterthoughts.

---

### Value by User Persona

| Persona | Perceived Value | Why |
|---------|----------------|-----|
| **Newly post-transplant patient** | Very High | Overwhelmed, unfamiliar with assistance landscape. Personalized quiz + plain-language guidance addresses core need. |
| **Stable, long-term patient** | High | Annual renewal reminders, copay diversion awareness, Medicare Part B-ID education, insurance appeal tools. |
| **Young adult aging off parent's insurance** | Very High | Dedicated FAQ, clear options breakdown (marketplace, Medicaid, COBRA, employer). |
| **Caregiver/family member** | High | Can research on behalf of patient. Plain language helps explain complex topics to patient. |
| **Social worker** | Very High | Aggregated resource directory, printable guides, letter templates. Saves significant research time per patient. |
| **Hospital/transplant program (enterprise)** | High | White-label capability, analytics dashboard, HIPAA-compliant deployment. Supports patient retention. |

### Value Differentiators vs. Alternatives

| Feature | This Site | NeedyMeds | RxAssist | GoodRx |
|---------|-----------|-----------|----------|--------|
| Transplant-specific focus | Yes | No | No | No |
| Health literacy (6th grade) | Yes | Partial | Partial | No |
| Personalized wizard | Yes | No | No | No |
| Appeal letter builder | Yes | No | No | No |
| Copay diversion education | Yes | No | No | No |
| Organ-specific medication guides | Yes | No | No | No |
| Medicare Part B-ID guidance | Yes | No | No | No |
| Privacy (local storage only) | Yes | No | No | No |

---

### Potential Value Concerns

1. **Data currency.** Price estimates, program eligibility rules, and Medicare costs change frequently. The "last updated" timestamp helps, but stale information is a risk. The 2026 Medicare numbers appear current.

2. **Medication database completeness.** 184 medications is strong but not exhaustive. Users whose medications are not listed may lose confidence.

3. **No direct enrollment.** The site links to programs but does not facilitate direct applications. Appropriate (avoids PHI handling) but creates a gap between discovery and action.

4. **Enterprise model dependency.** Free patient access depends on enterprise revenue. If enterprise partnerships underperform, patient tools could be at risk.

---

## PART 3: SUMMARY

### Health Literacy Grade: A-

Content consistently meets the 6th grade readability target across the majority of the site. Exceptions (medication regimen FAQs, some copay card content) are limited. The three-layer tooltip system, read-aloud functionality, and scam-awareness messaging are standout features.

### Perceived Value Grade: A

The site fills a genuine gap in the transplant medication affordability space. No other publicly available tool combines transplant-specific medication databases, personalized assistance matching, insurance appeal toolkits, copay diversion education, and 6th-grade-level health literacy in a single interface. The appeal letter builder and "Deductible Trap" education have direct, measurable impact on patient outcomes.

### Key Recommendations

1. Add automated readability scoring (Flesch-Kincaid) to the content pipeline
2. Rewrite the medication regimen FAQ entries to match the site's plain-language standard
3. Expand the glossary from 10 to 25+ terms (add: step therapy, copay accumulator, narrow therapeutic index, formulary tier, etc.)
4. Break the longest FAQ answers (copay cards, accumulators) into multiple shorter Q&A pairs
5. Add visual flowcharts for the PAP application process and appeals workflow
6. Consider audio/video content for the most complex topics (appeals process, insurance coordination)

---

**Report Generated:** February 9, 2026
**Next Review:** Recommended quarterly
