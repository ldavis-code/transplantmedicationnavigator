/**
 * Prerender SEO Script
 * Generates static HTML files for each route with proper meta tags
 * This ensures search engines (like Bing) that don't execute JavaScript
 * can still see page-specific titles, descriptions, and meta tags.
 *
 * Run after build: node scripts/prerender-seo.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seoMetadata } from '../src/data/seo-metadata.js';
import { isGenericRecord, medPageName, medNameWithGeneric } from '../src/utils/medIdentity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// SEO metadata for each page (copied from src/data/seo-metadata.js)
const BASE_URL = 'https://transplantmedicationnavigator.com';
const SITE_NAME = 'Transplant Medication Navigator™';

// Routes with a full Spanish translation, served at the /es/ path prefix
// (dist/es/<route>/index.html — Netlify resolves the static file directly,
// no query parameter involved). Each gets hreflang alternates and a
// prerendered Spanish variant so search engines, link previews, and no-JS
// visitors see Spanish text without running JavaScript. Legacy ?lang=es
// URLs 301 to /es/<route> (see public/_redirects).
// The per-medication pages (/medications/:id) are Spanish-capable too but
// are generated dynamically — see hasSpanishVariant below.
const SPANISH_ROUTES = new Set([
  '/', '/wizard', '/education', '/application-help', '/faq',
  '/medications', '/evidence', '/my-medications', '/savings-tracker',
  '/survey', '/survey/transplant', '/survey/general', '/pilot',
  '/terms-and-conditions', '/privacy', '/accessibility',
  '/about', '/feedback', '/education/appeals',
]);

// Spanish titles/descriptions come from the same source the app uses
// (seoMetadata imported at the top of the file).
const SPANISH_META = {
  '/': seoMetadata.home.es,
  '/wizard': seoMetadata.wizard.es,
  '/education': seoMetadata.education.es,
  '/application-help': seoMetadata.applicationHelp.es,
  '/faq': seoMetadata.faq.es,
  '/medications': seoMetadata.medications.es,
  '/evidence': seoMetadata.evidence.es,
  '/my-medications': seoMetadata.myMedications.es,
  '/savings-tracker': seoMetadata.savingsTracker.es,
  '/survey': seoMetadata.survey.es,
  '/survey/transplant': seoMetadata.surveyTransplant.es,
  '/survey/general': seoMetadata.surveyGeneral.es,
  '/pilot': seoMetadata.pilot.es,
  '/terms-and-conditions': seoMetadata.termsAndConditions.es,
  '/privacy': seoMetadata.privacyPolicy.es,
  '/accessibility': seoMetadata.accessibility.es,
  '/about': seoMetadata.about.es,
  '/feedback': seoMetadata.feedback.es,
  '/education/appeals': seoMetadata.appeals.es,
};
const ES_LOCALE = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'locales', 'es.json'), 'utf8')
);
const EN_LOCALE = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'locales', 'en.json'), 'utf8')
);
const FAQS_EN = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'faqs.json'), 'utf8')
);
const FAQS_ES = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'faqs.es.json'), 'utf8')
);

// Spanish medication-detail strings — same source the app renders
// (src/pages/MedicationDetail.jsx via t('medications.detail.*')), so the
// static Spanish body cannot drift from the hydrated page.
const ES_DETAIL = ES_LOCALE.medications.detail;
const ES_CATEGORIES = ES_LOCALE.medications.categories || {};

// Mirror of src/utils/medNames.js localizeMedName: brand names stay in
// English (they must match the bottle), but qualifiers are labels and
// localize in Spanish.
const localizeMedNameEs = (name) => String(name || '')
  .replace(/\(generic\)/gi, '(genérico)')
  .replace(/Extended-Release/gi, 'de liberación prolongada');

// i18next-style {{var}} interpolation for locale strings used at build time.
const fill = (tpl, vars) => String(tpl || '').replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');

// Every /medications/:id page has a full Spanish translation (the component
// is entirely t()-driven), so each gets hreflang alternates and a
// prerendered /es/ variant just like the fixed SPANISH_ROUTES.
const hasSpanishVariant = (route) => SPANISH_ROUTES.has(route) || route.startsWith('/medications/');

// Path-based Spanish URL for a route: /es/<route> (the homepage is /es/).
const esPath = (route) => (route === '/' ? '/es/' : `/es${route}`);

// Home-page stat tiles. Read from the file scripts/generate-home-stats.js
// writes at the start of the build — the same module Home.jsx imports — so
// the static fallback cannot drift from the app. Recomputing the formulas
// here is what made the no-JS homepage claim 220 medications while every
// other surface said 259.
const PROGRAMS = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'programs.json'), 'utf8')
);
const countGroup = (group) => (group ? Object.keys(group).length : 0);
const HOME_STATS = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'home-stats.json'), 'utf8')
);

const pages = [
  {
    route: '/faq',
    title: 'Frequently Asked Questions | Transplant Medication Navigator™',
    description: 'Find answers to common questions about Patient Assistance Programs, copay foundations, medication costs, and financial help for transplant patients.',
    ogTitle: 'Transplant Medication Assistance FAQs',
    ogDescription: 'Get answers to common questions about medication assistance, Patient Assistance Programs, copay support, and financial help for transplant patients.',
  },
  {
    route: '/wizard',
    title: 'My Path Quiz - Find Free Medication Help | Transplant Medication Navigator™',
    description: 'Take our free 2-minute quiz to find Patient Assistance Programs for your transplant medications. Get personalized recommendations for free tacrolimus, mycophenolate, and copay help based on your insurance and income.',
    ogTitle: 'Find Your Path to Free Transplant Medications',
    ogDescription: 'Answer a few questions to get personalized recommendations for FREE medications through Patient Assistance Programs. Takes 2 minutes.',
  },
  {
    route: '/medications',
    title: 'Search Transplant Medications & Prices | Transplant Medication Navigator™',
    description: 'Compare transplant medication prices and find FREE assistance programs. Search tacrolimus (Prograf), mycophenolate (CellCept), prednisone, sirolimus (Rapamune), and more. Find copay cards, PAPs, and foundation grants.',
    ogTitle: 'Search Transplant Medications - Compare Prices & Find Free Help',
    ogDescription: 'Search transplant medications, compare retail prices, and find Patient Assistance Programs offering FREE medications.',
  },
  {
    route: '/education',
    title: 'Education & Resources for Transplant Patients | Transplant Medication Navigator™',
    description: 'Educational guides on transplant medication coverage: Medicare Part D, Medicaid, insurance appeals, specialty pharmacies, the deductible trap, and copay foundation eligibility. Learn before you apply.',
    ogTitle: 'Transplant Medication Education & Resources',
    ogDescription: 'Learn about Medicare, Medicaid, insurance coverage, specialty pharmacies, and how to avoid the deductible trap.',
  },
  {
    route: '/application-help',
    title: 'How to Apply for Medication Assistance | Transplant Medication Navigator™',
    description: 'Step-by-step guide to applying for Patient Assistance Programs. Learn what documents you need, how to complete applications, and get approval faster.',
    ogTitle: 'Apply for Patient Assistance Programs',
    ogDescription: 'Complete guide to applying for medication assistance. Get templates, checklists, and step-by-step instructions.',
  },
  {
    route: '/for-hospitals',
    title: 'For Hospital Administrators: IOTA & Graft Survival | Transplant Medication Navigator™',
    description: 'IOTA downside risk went live July 1, 2026. Graft survival is 20% of your score, and medication non-adherence is its leading modifiable threat. Privacy-first patient education with Epic integration — no PHI stored.',
    ogTitle: 'IOTA Performance Year 2 Is Here: Patient Education Is Your Fastest Lever',
    ogDescription: 'CMS IOTA downside risk began July 1, 2026. Protect your composite graft survival score by removing medication cost barriers. Privacy-first, Epic-integrated, deployable in a 90-day pilot.',
    ogImage: '/og-image-hospitals.png',
    aiSummary: 'B2B page for transplant hospital administrators and coordinators. Transplant Medication Navigator is a privacy-first patient medication-assistance and education platform (no PHI stored on its servers) that supports IOTA Model quality performance (composite graft survival, 20 of 100 points) by reducing cost-driven immunosuppressant non-adherence. IOTA Performance Year 2 downside risk (up to $2,000 per kidney transplant) began July 1, 2026. Features: Epic MyChart integration via Connection Hub, discharge workflow tools, white-label admin dashboard with aggregate analytics, no PHI stored, 90-day pilot program. Founder is a liver transplant recipient and Vice Chair of the OPTN Patient Affairs Committee, with a 20-year enterprise operations background.',
    bodyHtml: `<h1 style="color:#0f172a;margin-bottom:12px;">For Hospital Administrators &amp; Transplant Coordinators</h1>
      <p style="color:#475569;margin-bottom:16px;">Transplant Medication Navigator is a privacy-first medication assistance platform for transplant programs, built by a liver transplant recipient who serves as Vice Chair of the OPTN Patient Affairs Committee. It connects patients to copay cards, patient assistance programs, and foundation grants before cost becomes a barrier to adherence.</p>
      <ul style="color:#475569;text-align:left;max-width:560px;margin:0 auto 20px;line-height:1.8;">
        <li>IOTA Performance Year 2 began July 1, 2026: participating kidney transplant hospitals now carry downside risk of up to $2,000 per kidney transplant, and composite graft survival is the model's entire quality domain, worth up to 20 of 100 points (CMS IOTA Model, June 2026 final rule).</li>
        <li>Patient education is the fastest lever a program controls: medication cost education at discharge, a standardized tool for coordinators and social workers, and aggregate engagement reporting for QAPI and IOTA strategy reviews.</li>
        <li>Improve SRTR outcomes: medication non-adherence is the leading modifiable cause of graft loss, associated with ~36% of graft losses (Dew MA et al., Transplantation, 2007).</li>
        <li>Reduce preventable readmissions driven by cost-related non-adherence &mdash; 40% of recipients report skipping doses due to cost (AST Therapeutic Needs Study, Taber DJ et al., American Journal of Transplantation, 2025).</li>
        <li>Strengthen CMS Conditions of Participation documentation with a trackable, standardized patient education resource.</li>
        <li>Privacy-first by design: no accounts, no PHI stored on our servers &mdash; health details stay in the patient's browser, and analytics are aggregate-only.</li>
        <li>Epic MyChart integration via Epic Connection Hub, discharge workflow support, and a white-label admin dashboard with aggregate, privacy-safe analytics.</li>
        <li>Typical patient impact: monthly out-of-pocket immunosuppressant costs drop from $624 without assistance to about $10 with copay card enrollment.</li>
      </ul>
      <p style="margin-bottom:16px;"><a href="mailto:info@transplantmedicationnavigator.com?subject=Hospital%20Partnership%20Inquiry" style="color:#059669;font-weight:600;text-decoration:underline;">Schedule a demo</a> or <a href="/pilot" style="color:#059669;font-weight:600;text-decoration:underline;">view the 90-day pilot program</a>.</p>`,
  },
  {
    route: '/evidence',
    title: 'The Evidence: Why Medication & Financial Navigation Matters | Transplant Medication Navigator™',
    description: 'Peer-reviewed research: 23% of liver transplant candidates face high financial burden, and nearly 40% of recipients miss medication fills due to cost. See why financial navigation is the targeted strategy the research calls for.',
    ogTitle: 'The Evidence: Cost Is a Clinical Problem in Transplantation',
    ogDescription: 'Two national peer-reviewed studies document financial burden across the transplant journey — before transplant it threatens candidacy, after transplant it threatens the graft.',
    aiSummary: 'Evidence page summarizing two peer-reviewed studies on financial burden in transplantation. (1) Aby ES et al., Hepatology Communications 2026 (13 U.S. centers, 453 liver transplant candidates): 23.3% reported high financial burden (out-of-pocket costs ≥10% of household income); high-burden patients had 4-6x adjusted odds of material, psychological, and behavioral financial distress; 66.4% delayed or went without care; only 27.6% were still employed. The authors conclude routine financial burden screening is critical and should be paired with targeted mitigation strategies. (2) Taber DJ et al., American Journal of Transplantation 2025 (AST patient survey, 10,091 recipients, 232 centers, all organs): nearly 40% missed a medication fill in the past year due to cost, and more than 1 in 4 skipped or reduced immunosuppressant doses due to cost. Transplant Medication Navigator is presented as the targeted strategy: a SMART on FHIR app on the Epic Connection Hub (500+ organizational downloads) providing insurance-aware routing to copay cards, patient assistance programs, and charitable foundations.',
  },
  {
    route: '/pricing',
    title: 'Pricing | Transplant Medication Navigator™',
    description: 'Free access to education for patients, and partnership options for organizations. View our clear pricing.',
    ogTitle: 'Clear Pricing',
    ogDescription: 'Free educational resources for all patients. Partnership options for healthcare organizations.',
  },
  {
    route: '/my-medications',
    title: 'My Medications | Transplant Medication Navigator™',
    description: 'Keep a private list of your transplant medications, track renewal dates, and see matching copay cards and patient assistance programs. Stored on your device only.',
    ogTitle: 'My Medication List',
    ogDescription: 'Track your transplant medications and renewal dates, and find matching assistance programs. Private: your list stays on your device.',
  },
  {
    route: '/savings-tracker',
    title: 'Savings Calculator | Transplant Medication Navigator™',
    description: 'Calculate how much you could save on transplant medications with assistance programs. Track actual savings and see your total benefits over time.',
    ogTitle: 'Medication Savings Calculator',
    ogDescription: 'See how much you could save on transplant medications with assistance programs.',
  },
  {
    route: '/survey',
    title: 'Share Your Journey | Transplant Medication Navigator™',
    description: 'Share your medication experience to help improve access for all patients. Anonymous surveys for transplant recipients and anyone managing chronic conditions.',
    ogTitle: 'Share Your Medication Journey',
    ogDescription: 'Your experience can change the system. Take our anonymous survey to help improve medication access.',
  },
  {
    route: '/survey/transplant',
    title: 'Transplant Medication Survey | Transplant Medication Navigator™',
    description: 'Share your transplant medication journey. Help us understand challenges with anti-rejection drugs, pharmacies, insurance, and assistance programs.',
    ogTitle: 'Transplant Medication Journey Survey',
    ogDescription: 'Share your experience with transplant medications. Your anonymous feedback helps improve access for all transplant patients.',
  },
  {
    route: '/survey/general',
    title: 'General Medication Survey | Transplant Medication Navigator™',
    description: 'Share your experience managing medications for chronic conditions. Help us advocate for better medication access and affordability.',
    ogTitle: 'General Medication Survey',
    ogDescription: 'Share your medication experience. Your anonymous feedback helps advocate for better access and affordability.',
  },
  {
    route: '/pilot',
    title: 'Partner Pilot Program | Transplant Medication Navigator™',
    description: 'Welcome to the pilot program. Find medication assistance programs, search transplant medications, and access verified financial resources.',
    ogTitle: 'Partner Pilot Program',
    ogDescription: 'Your healthcare provider has partnered with us to help you find medication assistance programs.',
  },
  {
    route: '/terms-and-conditions',
    title: 'Terms and Conditions | Transplant Medication Navigator™',
    description: 'Read the Terms and Conditions for using the Transplant Medication Navigator website. Understand your rights, responsibilities, and our disclaimer about medical advice.',
    ogTitle: 'Terms and Conditions - Transplant Medication Navigator™',
    ogDescription: 'Terms and Conditions governing the use of Transplant Medication Navigator.',
  },
  {
    route: '/privacy',
    title: 'Privacy Policy | Transplant Medication Navigator™',
    description: 'Read our Privacy Policy to understand how Transplant Medication Navigator collects, uses, and protects your personal information.',
    ogTitle: 'Privacy Policy - Transplant Medication Navigator™',
    ogDescription: 'Learn how Transplant Medication Navigator collects, uses, and safeguards your personal information.',
  },
  {
    route: '/about',
    title: seoMetadata.about.title,
    description: seoMetadata.about.description,
    ogTitle: seoMetadata.about.ogTitle,
    ogDescription: seoMetadata.about.ogDescription,
  },
  {
    route: '/feedback',
    title: seoMetadata.feedback.title,
    description: seoMetadata.feedback.description,
    ogTitle: seoMetadata.feedback.ogTitle,
    ogDescription: seoMetadata.feedback.ogDescription,
  },
  {
    route: '/education/appeals',
    title: seoMetadata.appeals.title,
    description: seoMetadata.appeals.description,
    ogTitle: seoMetadata.appeals.ogTitle,
    ogDescription: seoMetadata.appeals.ogDescription,
  },
  {
    route: '/accessibility',
    title: 'Accessibility Statement | Transplant Medication Navigator™',
    description: 'Our commitment to making Transplant Medication Navigator accessible to all users, including those with disabilities.',
    ogTitle: 'Accessibility Statement - Transplant Medication Navigator™',
    ogDescription: 'Learn about our commitment to accessibility and the features we provide.',
  },
];

// One SEO landing page per medication at /medications/:id. Each gets a unique
// title/description plus a real static body (H1 + ways to save) so crawlers that
// don't run JavaScript still see substance. React hydrates over it on load.
const MEDICATIONS = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'medications.json'), 'utf8')
);
const MED_BY_ID = Object.fromEntries(MEDICATIONS.map((m) => [m.id, m]));

// Resource directory entries feed the homepage <noscript> foundation table
// and resource list (see homeNoscript below) — the same files the Education
// page's directory renders, so the two cannot disagree.
const RESOURCES_EN = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'resources.json'), 'utf8')
);
const RESOURCES_ES = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'resources.es.json'), 'utf8')
);

// Static no-JS bodies for the content/list pages (the data files load
// above, after the pages array is declared, so attach them here).
const medsIndexPage = pages.find((p) => p.route === '/medications');
medsIndexPage.bodyHtml = medicationsIndexBody(false);
medsIndexPage.es = { bodyHtml: medicationsIndexBody(true) };
const programsPage = pages.find((p) => p.route === '/application-help');
programsPage.bodyHtml = programsDirectoryBody(false);
programsPage.es = { bodyHtml: programsDirectoryBody(true) };
const faqPage = pages.find((p) => p.route === '/faq');
faqPage.bodyHtml = faqBody(false);
faqPage.es = { bodyHtml: faqBody(true) };
const educationPage = pages.find((p) => p.route === '/education');
educationPage.bodyHtml = educationBody(false);
educationPage.es = { bodyHtml: educationBody(true) };

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Static no-JS bodies for the two directory pages, so a blocked-JavaScript
// browser (or a crawler) still gets the actual lists instead of a loading
// line. Built from the same data files as the app, so they cannot drift.

// /medications — every medication as a link to its own page (which carries
// its own static body). "Brand (Generic)" unless the generic is already in
// the brand name, names localized for the Spanish variant.
function medicationsIndexBody(isEs) {
  const items = MEDICATIONS.map((m) => {
    const brand = isEs ? localizeMedNameEs(m.brandName) : m.brandName;
    const generic = isEs ? localizeMedNameEs(m.genericName) : m.genericName;
    const label = (m.genericName && !m.brandName.toLowerCase().includes(m.genericName.toLowerCase()))
      ? `${esc(brand)} <span style="color:#64748b;">(${esc(generic)})</span>` : esc(brand);
    return `<li style="margin:2px 0;"><a href="${isEs ? '/es' : ''}/medications/${m.id}" style="color:#047857;">${label}</a></li>`;
  }).join('');
  return `<h1 style="color:#0f172a;margin-bottom:12px;">${isEs ? 'Busque medicamentos de trasplante y precios' : 'Search Transplant Medications &amp; Prices'}</h1>
      <p style="color:#475569;margin-bottom:16px;">${isEs
        ? `La búsqueda interactiva necesita JavaScript. La lista completa de ${MEDICATIONS.length} medicamentos está abajo — cada enlace lleva a los precios y programas de asistencia de ese medicamento.`
        : `The interactive search needs JavaScript. The full list of ${MEDICATIONS.length} medications is below — each link goes to that medication's prices and assistance programs.`}</p>
      <ul style="color:#334155;text-align:left;max-width:640px;margin:0 auto 20px;list-style:none;padding:0;columns:2;column-gap:24px;font-size:0.9375rem;line-height:1.6;">${items}</ul>`;
}

// /faq — the actual questions and answers from the same data files the app
// renders, so no-JS visitors and crawlers get the real content, not a
// loading line. (The interactive tools on the page still need JavaScript.)
function faqBody(isEs) {
  const faqs = isEs ? FAQS_ES : FAQS_EN;
  const sections = faqs.map((cat) => {
    const qas = (cat.questions || []).map((qa) =>
      `<h3 style="color:#0f172a;font-size:1rem;margin:14px 0 4px;">${esc(qa.q)}</h3>
       <p style="margin:0;color:#334155;">${esc(qa.a)}</p>`
    ).join('');
    return `<h2 style="color:#047857;font-size:1.25rem;margin:24px 0 4px;border-bottom:1px solid #d1fae5;padding-bottom:6px;">${esc(cat.category)}</h2>${qas}`;
  }).join('');
  return `<h1 style="color:#0f172a;margin-bottom:12px;">${isEs ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}</h1>
      <div style="text-align:left;max-width:640px;margin:0 auto 20px;font-size:0.9375rem;line-height:1.65;">${sections}</div>`;
}

// /education — a directory of the education topics, each deep-linking to
// its tab, with titles from the same locale strings the app renders.
// [?topic= param, education.tabs.* locale key] — params from Education.jsx.
function educationBody(isEs) {
  const EDUCATION_TOPICS = [
    ['EMERGENCY', 'emergency'],
    ['GENERICS', 'generics'],
    ['DEDUCTIBLE_TRAP', 'deductibleTrap'],
    ['INSURANCE', 'insurance'],
    ['DIVERSION', 'diversion'],
    ['OOP', 'oop'],
    ['DIRECTORY', 'directory'],
    ['MENTAL', 'mental'],
  ];
  const tabs = (isEs ? ES_LOCALE : EN_LOCALE).education.tabs;
  const items = EDUCATION_TOPICS
    .filter(([, key]) => tabs[key])
    .map(([param, key]) =>
      `<li style="margin:6px 0;"><a href="${isEs ? '/es' : ''}/education?topic=${param}" style="color:#047857;font-weight:600;">${esc(tabs[key])}</a></li>`
    ).join('');
  return `<h1 style="color:#0f172a;margin-bottom:12px;">${isEs ? 'Educación y recursos' : 'Education &amp; Resources'}</h1>
      <p style="color:#475569;margin-bottom:12px;">${isEs
        ? 'Guías sobre cómo pagar sus medicamentos de trasplante. Elija un tema:'
        : 'Guides on paying for your transplant medications. Choose a topic:'}</p>
      <ul style="list-style:none;padding:0;max-width:520px;margin:0 auto 20px;text-align:left;font-size:1rem;">${items}</ul>`;
}

// /application-help — the program directory: every PAP, foundation, and
// copay program with its direct link and phone number.
function programsDirectoryBody(isEs) {
  const group = (progs, title) => {
    const rows = Object.values(progs || {}).map((p) => {
      const phone = p.phone ? ` &middot; <a href="tel:${esc(String(p.phone).replace(/[^\d+]/g, ''))}" style="color:#334155;">${esc(p.phone)}</a>` : '';
      return `<li style="margin:3px 0;"><a href="${esc(p.url)}" style="color:#047857;">${esc(p.name)}</a>${phone}</li>`;
    }).join('');
    return `<h2 style="color:#0f172a;font-size:1.125rem;margin:20px 0 8px;">${title}</h2>
      <ul style="list-style:disc;padding-left:20px;margin:0;font-size:0.9375rem;line-height:1.6;">${rows}</ul>`;
  };
  const nPap = countGroup(PROGRAMS.papPrograms);
  const nFound = countGroup(PROGRAMS.foundationPrograms);
  const nCopay = countGroup(PROGRAMS.copayPrograms);
  return `<h1 style="color:#0f172a;margin-bottom:12px;">${isEs ? 'Cómo solicitar asistencia para medicamentos' : 'How to Apply for Medication Assistance'}</h1>
      <p style="color:#475569;margin-bottom:8px;">${isEs
        ? `La guía interactiva necesita JavaScript. El directorio completo está abajo: ${nPap} Programas de Asistencia al Paciente (medicamento gratis), ${nFound} fundaciones caritativas y ${nCopay} tarjetas de copago del fabricante, con enlaces directos y teléfonos.`
        : `The interactive guide needs JavaScript. The full directory is below: ${nPap} Patient Assistance Programs (free medication), ${nFound} charitable foundations, and ${nCopay} manufacturer copay cards, with direct links and phone numbers.`}</p>
      <div style="color:#334155;text-align:left;max-width:640px;margin:0 auto 20px;">
        ${group(PROGRAMS.papPrograms, isEs ? 'Programas de Asistencia al Paciente (medicamento gratis)' : 'Patient Assistance Programs (free medication)')}
        ${group(PROGRAMS.foundationPrograms, isEs ? 'Fundaciones caritativas' : 'Charitable foundations')}
        ${group(PROGRAMS.copayPrograms, isEs ? 'Tarjetas de copago del fabricante (solo seguro comercial)' : 'Manufacturer copay cards (commercial insurance only)')}
      </div>`;
}

const medicationPages = MEDICATIONS.map((m) => {
  // Names via src/utils/medIdentity.js — the same helpers the page component
  // uses, so a record that IS the generic ("Tacrolimus (generic)") is named
  // once here too instead of prerendering "Tacrolimus (generic) (Tacrolimus)"
  // into the title and body crawlers read.
  const isGeneric = isGenericRecord(m);
  const brand = esc(medPageName(m));
  const cat = esc((m.category || 'medication').toLowerCase());
  const nameWithGeneric = esc(medNameWithGeneric(m));
  const hasCopay = !!(m.copayUrl || m.copayProgramId);
  const ways = [
    hasCopay ? 'a manufacturer copay card (for commercial insurance)' : null,
    'patient assistance programs that can provide it for free if you qualify',
    'foundation grants',
    isGeneric
      ? 'the generic price — this is the generic, which usually costs far less than the brand'
      : (m.generic_available ? 'a lower-cost generic version' : null),
    'discount cards and cash-price comparison (GoodRx, Cost Plus Drugs, and more)',
  ].filter(Boolean);

  // Spanish variant: names localized the way the app displays them, the
  // intro assembled from the same locale strings the component renders,
  // and the category translated via medications.categories.
  const brandEs = esc(localizeMedNameEs(medPageName(m)));
  const nameWithGenericEs = esc(localizeMedNameEs(medNameWithGeneric(m)));
  const catEs = esc((ES_CATEGORIES[m.category] || m.category || 'medicamento').toLowerCase());
  const waysEs = [
    hasCopay ? 'Una tarjeta de copago del fabricante (para seguro comercial)' : null,
    'Programas de Asistencia al Paciente que pueden darlo gratis si usted califica',
    'Ayudas económicas de fundaciones',
    isGeneric
      ? 'El precio del genérico: este es el genérico, que normalmente cuesta mucho menos que la marca'
      : (m.generic_available ? 'Una versión genérica de menor costo' : null),
    'Tarjetas de descuento y comparación de precios en efectivo (GoodRx, Cost Plus Drugs y más)',
  ].filter(Boolean);

  return {
    route: `/medications/${m.id}`,
    title: `How to Afford ${nameWithGeneric}: Copay Cards & Assistance | Transplant Medication Navigator™`,
    description: `Find copay cards, patient assistance programs, and foundation grants for ${nameWithGeneric}. See ways to lower the cost of your transplant medication.`,
    ogTitle: `How to Afford ${brand}: Copay Cards & Patient Assistance`,
    ogDescription: `Ways to save on ${nameWithGeneric}: copay cards, free-medication programs, foundation grants, and price comparison.`,
    bodyHtml: `<h1 style="color:#0f172a;margin-bottom:12px;">How to Afford ${brand}</h1>
      <p style="color:#475569;margin-bottom:16px;">${nameWithGeneric} is ${/^[aeiou]/i.test(cat) ? 'an' : 'a'} ${cat} medication used by transplant patients. Here are the ways to lower what you pay:</p>
      <ul style="color:#475569;text-align:left;max-width:520px;margin:0 auto 20px;line-height:1.8;">
        ${ways.map((w) => `<li>${esc(w[0].toUpperCase() + w.slice(1))}</li>`).join('')}
      </ul>
      <p style="margin-bottom:16px;"><a href="/wizard" style="color:#059669;font-weight:600;text-decoration:underline;">Take the free 2-minute quiz</a> to find the programs you qualify for.</p>`,
    es: {
      title: fill(ES_DETAIL.meta.title, { name: nameWithGenericEs }),
      description: fill(ES_DETAIL.meta.description, { name: nameWithGenericEs }),
      bodyHtml: `<h1 style="color:#0f172a;margin-bottom:12px;">${fill(ES_DETAIL.heading, { name: brandEs })}</h1>
      <p style="color:#475569;margin-bottom:16px;">${nameWithGenericEs}${esc(ES_DETAIL.introIs)}${catEs}${esc(ES_DETAIL.introUsedBy)}${esc(ES_DETAIL.introTail)}</p>
      <ul style="color:#475569;text-align:left;max-width:520px;margin:0 auto 20px;line-height:1.8;">
        ${waysEs.map((w) => `<li>${esc(w)}</li>`).join('')}
      </ul>
      <p style="margin-bottom:16px;"><a href="/es/wizard" style="color:#059669;font-weight:600;text-decoration:underline;">${esc(ES_DETAIL.ctaQuiz.trim())}</a> para encontrar los programas para los que usted califica.</p>`,
    },
  };
});

/**
 * Generate HTML content for a page with proper meta tags
 * This version includes the main SPA script so React can take over after initial render
 */
function generatePageHTML(page, mainScriptPath, stylesheetTags, lang = 'en') {
  const canonical = `${BASE_URL}${page.route}`;
  const isEs = lang === 'es';
  // The Spanish version of a page lives at the /es/ path prefix;
  // it is its own canonical so both language versions can be indexed.
  const pageUrl = isEs ? `${BASE_URL}${esPath(page.route)}` : canonical;
  const pageTitle = page.title.split(' | ')[0];
  const aiSummaryTag = page.aiSummary
    ? `\n    <meta name="ai-content-summary" content="${page.aiSummary}" />`
    : '';

  const hreflangTags = hasSpanishVariant(page.route)
    ? `
    <!-- Language alternates -->
    <link rel="alternate" hreflang="en" href="${canonical}" />
    <link rel="alternate" hreflang="es" href="${BASE_URL}${esPath(page.route)}" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />`
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags - Unique per page for SEO -->
    <title>${page.title}</title>
    <meta name="title" content="${page.title}" />
    <meta name="description" content="${page.description}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${pageUrl}" />${aiSummaryTag}${hreflangTags}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${isEs ? 'es_US' : 'en_US'}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${page.ogTitle || page.title}" />
    <meta property="og:description" content="${page.ogDescription || page.description}" />
    <meta property="og:image" content="${BASE_URL}${page.ogImage || '/og-image.png'}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageUrl}" />
    <meta name="twitter:title" content="${page.ogTitle || page.title}" />
    <meta name="twitter:description" content="${page.ogDescription || page.description}" />
    <meta name="twitter:image" content="${BASE_URL}${page.ogImage || '/twitter-image.png'}" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />

    <!-- PWA -->
    <meta name="theme-color" content="#059669" />
    <link rel="manifest" href="/manifest.json" />

    <!-- App stylesheets - without these, direct visits to prerendered routes
         render the hydrated app unstyled (the SPA script alone does not load
         the extracted CSS) -->
    ${stylesheetTags}
</head>
<body class="bg-slate-50">
    <div id="root">
        <!-- Skip link lives INSIDE #root (in the page language): React
             replaces the root's children on mount, so this pre-hydration
             copy disappears when the app renders its own localized skip
             link — one skip link on the page at all times, never two. -->
        <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-emerald-700 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-xl">
            ${isEs ? 'Saltar al contenido principal' : 'Skip to main content'}
        </a>
        <!-- Static content for SEO - React will replace this when it loads -->
        <main id="main-content" style="max-width: 600px; margin: 40px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center;">
            ${page.bodyHtml || `<h1 style="color: #0f172a; margin-bottom: 16px;">${pageTitle}</h1>
            <p style="color: #475569; margin-bottom: 24px;">${page.description}</p>`}
            <p style="color: #64748b; margin-bottom: 16px;">${isEs ? 'Cargando la página... <span lang="en">/ Loading interactive features...</span>' : 'Loading interactive features... <span lang="es">/ Cargando la página...</span>'}</p>
            <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 16px;">${isEs
              ? 'Si esta página no carga, todavía puede ver la <a href="/es/medications" style="color:#059669;">lista de medicamentos</a> y el <a href="/es/application-help" style="color:#059669;">directorio de programas de asistencia</a>.'
              : 'If this page doesn\'t load, you can still browse the <a href="/medications" style="color:#059669;">medication list</a> and the <a href="/application-help" style="color:#059669;">assistance program directory</a>.'}</p>
            ${hasSpanishVariant(page.route) ? (isEs
              ? `<p style="margin-bottom: 16px;"><a href="${page.route}" lang="en" style="color: #047857; font-weight: 600;">View this page in English</a></p>`
              : `<p lang="es" style="margin-bottom: 16px;"><a href="${esPath(page.route)}" style="color: #047857; font-weight: 600;">Ver esta página en español</a></p>`) : ''}
            <a href="${isEs ? '/es/' : '/'}" style="color: #059669; text-decoration: underline;">${isEs ? 'Ir a la página principal' : 'Go to Homepage'}</a>
        </main>
    </div>
${page.noscriptHtml || ''}
    <!-- Load the SPA - React will take over and render the full page -->
    <script type="module" src="${mainScriptPath}"></script>
</body>
</html>`;
}

/**
 * Static homepage body — ONE builder for both languages, built from the
 * same locale strings the app renders (src/locales/en.json / es.json) plus
 * the computed stat tiles, so crawlers and no-JS visitors get real content
 * that cannot drift from the hydrated page. English replaces the trimmed
 * placeholder between the home-static-body markers in dist/index.html;
 * Spanish becomes the body of dist/es/index.html. If a locale key is
 * renamed this throws, the caller's catch logs it, and the errors counter
 * fails the build — drift now breaks the build instead of shipping.
 */
function homeBody(isEs) {
  const h = (isEs ? ES_LOCALE : EN_LOCALE).home;
  const pre = isEs ? '/es' : '';
  const trustLine = fill(h.trust, { count: HOME_STATS.medications });
  const browseAll = fill(h.steps.browseAll, { count: HOME_STATS.medications });
  const statLabels = isEs
    ? ['Medicamentos', 'Programas de asistencia', 'Tarjetas de copago']
    : ['Medications', 'Assistance Programs', 'Copay Cards'];
  return `<div style="text-align: center;">
      <h1 style="font-size: 2rem; font-weight: 800; color: #064e3b; margin: 24px 0 16px; line-height: 1.25;">
        ${h.hero.title1}<br />${h.hero.title2}
      </h1>
      <p style="font-size: 1.125rem; color: #64748b; max-width: 620px; margin: 0 auto 24px;">${h.hero.subtitle}</p>
      <p style="margin-bottom: 12px;">
        <a href="${pre}/medications" style="display: inline-block; padding: 14px 28px; background: #047857; color: white; font-weight: 700; border-radius: 12px; text-decoration: none;">${browseAll}</a>
      </p>
      <p style="color: #475569; margin-bottom: 24px;">
        ${h.steps.multiplePre} <a href="${pre}/wizard" style="color: #047857; font-weight: 600;">${h.steps.multipleLink}</a>
      </p>
      <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 24px;">${trustLine}</p>
      ${isEs ? '' : `<p lang="es" style="font-size: 0.875rem; color: #475569; margin-bottom: 24px;">
        Este sitio está disponible en español: <a href="/es/" style="color: #047857; font-weight: 600;">transplantmedicationnavigator.com/es</a>
      </p>`}
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 600px; margin: 0 auto 32px;">
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 1.75rem; font-weight: 800; color: #047857; margin: 0;"><span data-stat="medications">${HOME_STATS.medications}</span></p>
          <p style="font-size: 0.8125rem; color: #475569; font-weight: 500; margin: 4px 0 0;">${statLabels[0]}</p>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 1.75rem; font-weight: 800; color: #b45309; margin: 0;"><span data-stat="assistancePrograms">${HOME_STATS.assistancePrograms}</span></p>
          <p style="font-size: 0.8125rem; color: #475569; font-weight: 500; margin: 4px 0 0;">${statLabels[1]}</p>
        </div>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 1.75rem; font-weight: 800; color: #047857; margin: 0;"><span data-stat="copayCards">${HOME_STATS.copayCards}</span></p>
          <p style="font-size: 0.8125rem; color: #475569; font-weight: 500; margin: 4px 0 0;">${statLabels[2]}</p>
        </div>
      </div>
      <section style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left;" aria-label="${h.story.ariaLabel}">
        <p style="color: #b45309; font-weight: 700; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.4px; margin: 0 0 8px;">${h.story.badge}</p>
        <p style="color: #0f172a; font-size: 1.0625rem; line-height: 1.7; margin: 0 0 8px;">${h.story.quotePre}<strong>${h.story.price1}</strong>${h.story.quoteMid1}<strong>${h.story.price2}</strong>${h.story.quoteMid2}<strong style="color: #047857;">${h.story.price3}</strong>${h.story.quotePost}</p>
        <p style="color: #64748b; font-size: 0.8125rem; margin: 0;">${h.story.attribution}</p>
      </section>
      <section style="text-align: left; max-width: 640px; margin: 0 auto 24px;">
        <h2 style="font-size: 1.375rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${h.explainer.title}</h2>
        <p style="color: #475569; margin-bottom: 16px;">${h.explainer.intro}</p>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 12px;">
          <h3 style="font-size: 1.0625rem; font-weight: 700; color: #0f172a; margin: 0 0 6px;">${h.explainer.genericTitle}</h3>
          <p style="color: #475569; font-size: 0.9375rem; margin: 0 0 8px;">${h.explainer.genericText}</p>
          <p style="color: #065f46; font-weight: 700; font-size: 0.9375rem; margin: 0;">&rarr; ${h.explainer.genericAction}</p>
        </div>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 12px;">
          <h3 style="font-size: 1.0625rem; font-weight: 700; color: #0f172a; margin: 0 0 6px;">${h.explainer.brandTitle}</h3>
          <p style="color: #475569; font-size: 0.9375rem; margin: 0 0 8px;">${h.explainer.brandText}</p>
          <p style="color: #b45309; font-weight: 700; font-size: 0.9375rem; margin: 0;">&rarr; ${h.explainer.brandAction}</p>
        </div>
        <p style="color: #334155; margin: 16px 0 0;"><strong>${h.explainer.neverTitle}</strong> ${h.explainer.neverText}</p>
      </section>
      <section style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: left;">
        <p style="color: #1e293b; font-size: 1.0625rem; line-height: 1.7; margin: 0 0 14px;">${h.testimonial.quote}</p>
        <p style="color: #0f172a; font-weight: 700; margin: 0;">${h.testimonial.name}</p>
        <p style="color: #475569; font-size: 0.875rem; margin: 2px 0 0;">${h.testimonial.role}</p>
        <p style="color: #64748b; font-size: 0.8125rem; margin: 8px 0 0;">${h.testimonial.disclaimer}</p>
      </section>
      <section style="background: linear-gradient(to bottom right, #f8fafc, #ecfdf5); border: 2px solid #a7f3d0; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: left;">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${h.founder.name}</h2>
        <p style="color: #047857; font-size: 0.875rem; margin-bottom: 10px;">${h.founder.role}</p>
        <p style="color: #334155; line-height: 1.7; margin: 0 0 10px;">${h.founder.bio}</p>
        <p style="margin: 0;"><a href="${pre}/about" style="color: #047857; font-weight: 600;">${h.founder.link}</a></p>
      </section>
      <section style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; text-align: left;">
        <p style="color: #0f172a; font-weight: 700; font-size: 1.0625rem; margin: 0 0 4px;">${h.hotline.title}</p>
        <p style="color: #334155; margin: 0 0 8px;">${h.hotline.intro}</p>
        <p style="color: #334155; margin: 0 0 4px;"><strong>${h.hotline.callTitle}:</strong> ${h.hotline.callText}</p>
        <p style="color: #64748b; font-size: 0.875rem; margin: 0;">${h.hotline.lifeline} &mdash; ${h.hotline.availability}</p>
      </section>
    </div>`;
}

// The homepage <noscript> tables are built from the same data files the app
// renders — medications.json, programs.json, resources.json (+ .es) — so a
// program renamed, a phone corrected, or a resource added (e.g. TrumpRx in
// the directory) flows into the no-JS fallback on the next build instead of
// silently drifting. The ROW SELECTION below is editorial and stays a fixed
// id list; every id must exist in its data file or the build fails.
const NOSCRIPT_MED_IDS = [
  'tacrolimus', 'prograf', 'mycophenolate', 'myfortic', 'cyclosporine',
  'envarsus-xr', 'sirolimus', 'everolimus', 'belatacept', 'imuran',
  'prednisone', 'valcyte',
];
const NOSCRIPT_PAP_IDS = [
  'astellas-pap', 'novartis-pap', 'genentech-pap', 'bms-pap',
  'pfizer-pap', 'sanofi-pap', 'gilead-pap', 'merck-pap',
];
// Spanish display names for generic drug names in the noscript med table.
// Brand names stay in English (they must match the bottle).
const ES_GENERIC_NAMES = {
  'Cyclosporine': 'Ciclosporina',
  'Cyclosporine (modified)': 'Ciclosporina (modificada)',
  'Mycophenolate Mofetil': 'Micofenolato de mofetilo',
  'Mycophenolic Acid': 'Ácido micofenólico',
  'Azathioprine': 'Azatioprina',
  'Prednisone': 'Prednisona',
};

function homeNoscript(isEs) {
  const RESOURCES = isEs ? RESOURCES_ES : RESOURCES_EN;
  const LOCALE = isEs ? ES_LOCALE : EN_LOCALE;
  const pap = PROGRAMS.papPrograms;
  const medName = (id) => (MED_BY_ID[id] && MED_BY_ID[id].brandName) || (id.charAt(0).toUpperCase() + id.slice(1));

  const medRows = NOSCRIPT_MED_IDS.map((id) => {
    const m = MED_BY_ID[id];
    if (!m) throw new Error(`noscript med id "${id}" missing from medications.json`);
    const generic = m.genericName || m.brandName;
    const genericShown = isEs ? (ES_GENERIC_NAMES[generic] || generic) : generic;
    const program = m.papProgramId ? pap[m.papProgramId] : null;
    if (m.papProgramId && !program) throw new Error(`noscript med "${id}" points at missing PAP "${m.papProgramId}"`);
    const assist = program
      ? `<a href="${program.url}">${program.name}</a>`
      : (isEs ? 'Genérico de bajo costo disponible' : 'Low-cost generic available');
    return `                <tr>
                    <td>${genericShown}</td>
                    <td>${m.brandName}</td>
                    <td>${m.manufacturer}</td>
                    <td>${assist}</td>
                </tr>`;
  }).join('\n');

  const papRows = NOSCRIPT_PAP_IDS.map((id) => {
    const program = pap[id];
    if (!program) throw new Error(`noscript PAP id "${id}" missing from programs.json`);
    const covers = (program.medications || []).slice(0, 3).map(medName).join(', ');
    const host = new URL(program.url).host.replace(/^www\./, '');
    return `                <tr>
                    <td><strong>${program.name}</strong></td>
                    <td><a href="tel:${program.phone.replace(/[^\d+]/g, '')}">${program.phone}</a></td>
                    <td>${covers}</td>
                    <td><a href="${program.url}">${host}</a></td>
                </tr>`;
  }).join('\n');

  // Phones shown next to directory resources come from the locale strings
  // the app renders for that program (only TotalAssist has one today).
  const resourcePhones = { TotalAssist: LOCALE.education.totalAssist.phone };
  // A paused resource carries the same warning here as on the directory card;
  // the no-JS reader is the one who can least afford to fill in a form that
  // is not being read.
  const pausedNote = (r) =>
    (r.status === 'paused'
      ? ` <strong>${LOCALE.education.directory.statusPaused}.</strong> ${LOCALE.education.directory.statusPausedNote}`
      : '');
  const foundationRows = RESOURCES.filter((r) => r.category === 'Foundation').map((r) => {
    const phone = resourcePhones[r.name];
    const contact = phone
      ? `<a href="tel:${phone.replace(/[^\d+]/g, '')}">${phone}</a> &middot; <a href="${r.url}">${r.name}</a>`
      : `<a href="${r.url}">${r.name}</a>`;
    return `                <tr>
                    <td><strong>${r.name}</strong></td>
                    <td>${contact}</td>
                    <td>${r.description}${pausedNote(r)}</td>
                </tr>`;
  }).join('\n');

  const otherResources = RESOURCES.filter((r) => r.category !== 'Foundation').map((r) =>
    `                <li><a href="${r.url}">${r.name}</a> &mdash; ${r.description}${pausedNote(r)}</li>`
  ).join('\n');

  const T = isEs ? {
    noticeTitle: 'JavaScript está desactivado',
    noticeText: 'La búsqueda interactiva de medicamentos y el cuestionario necesitan JavaScript. El contenido principal sigue disponible abajo.',
    medsTitle: 'Medicamentos de trasplante comunes',
    medsTh: ['Medicamento (genérico)', 'Marca(s)', 'Fabricante', 'Asistencia al paciente'],
    papTitle: 'Programas de Asistencia al Paciente (medicamentos gratis)',
    papIntro: 'Estos programas dan <strong>medicamentos gratis</strong> a pacientes sin seguro o con Medicare que cumplen los requisitos de ingresos.',
    papTh: ['Programa', 'Teléfono', 'Cubre', 'Sitio web'],
    fndTitle: 'Fundaciones de copago y ayuda financiera',
    fndIntro: 'Estas fundaciones ayudan a pagar copagos, primas y otros costos de los medicamentos. Muchas ayudan a pacientes con Medicare.',
    fndTh: ['Organización', 'Teléfono / Sitio web', 'Cómo ayudan'],
    moreTitle: 'Más recursos',
    contactTitle: 'Contacto y apoyo',
    trioText: 'El grupo más grande para pacientes de trasplante, donantes y familias. Ofrece capítulos locales, mentores y recursos de aprendizaje.<br>Sitio web: <a href="https://www.trioweb.org/">trioweb.org</a>',
    founderTitle: 'Creado por Lorrinda Gray-Davis',
    founderText: 'Receptora de un trasplante de hígado y vicepresidenta del Comité de Asuntos del Paciente de la OPTN.<br>Sitio web: <a href="https://www.lorrindagraydavis.com">lorrindagraydavis.com</a>',
    crisisTitle: '¿Crisis de salud mental? Llame o envíe un texto al',
    crisisSub: 'Línea de Prevención del Suicidio y Crisis, 24/7 &mdash; No está solo',
    disclaimer: 'Esta herramienta es solo para fines educativos y no es consejo médico ni legal. No guardamos su información personal.',
  } : {
    noticeTitle: 'JavaScript is disabled',
    noticeText: 'The interactive medication search and quiz require JavaScript. The core content below is still available.',
    medsTitle: 'Common Transplant Medications',
    medsTh: ['Medication (Generic)', 'Brand Name(s)', 'Manufacturer', 'Patient Assistance'],
    papTitle: 'Patient Assistance Programs (Free Medications)',
    papIntro: 'These programs provide <strong>free medications</strong> to patients who are uninsured or on Medicare and meet income requirements.',
    papTh: ['Program', 'Phone', 'Covers', 'Website'],
    fndTitle: 'Copay Foundations &amp; Financial Help',
    fndIntro: 'These foundations help patients pay copays, premiums, and other medication costs. Many help Medicare patients.',
    fndTh: ['Organization', 'Phone / Website', 'How They Help'],
    moreTitle: 'Additional Resources',
    contactTitle: 'Contact &amp; Support',
    trioText: 'The largest group for transplant patients, donors, and families. Offers local chapters, mentoring, and learning resources.<br>Website: <a href="https://www.trioweb.org/">trioweb.org</a>',
    founderTitle: 'Created by Lorrinda Gray-Davis',
    founderText: 'Liver transplant recipient and Vice Chair of the OPTN Patient Affairs Committee.<br>Website: <a href="https://www.lorrindagraydavis.com">lorrindagraydavis.com</a>',
    crisisTitle: 'Mental Health Crisis? Call or Text',
    crisisSub: '24/7 Suicide &amp; Crisis Lifeline &mdash; You are not alone',
    disclaimer: 'This tool is for educational purposes only and is not medical or legal advice. We do not save your personal information.',
  };
  const th = (cols) => cols.map((c) => `<th>${c}</th>`).join('\n                    ');

  return `
    <!-- Noscript fallback — GENERATED at build time by scripts/prerender-seo.js
         from medications.json, programs.json, resources.json and the locale
         files. Do not hand-edit in dist; change the data files instead. -->
    <noscript>
        <style>
            #root > main > p:last-child { display: none; }
            .noscript-section { max-width: 900px; margin: 0 auto; padding: 0 20px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
            .noscript-section h2 { color: #059669; font-size: 1.5rem; font-weight: 700; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; margin-top: 32px; margin-bottom: 16px; }
            .noscript-section h3 { color: #0f172a; font-size: 1.125rem; font-weight: 700; margin-top: 20px; margin-bottom: 8px; }
            .noscript-section p, .noscript-section li { color: #334155; line-height: 1.7; }
            .noscript-section a { color: #059669; text-decoration: underline; }
            .noscript-section ul { list-style: disc; padding-left: 20px; margin: 8px 0; }
            .noscript-section table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            .noscript-section th, .noscript-section td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
            .noscript-section th { background: #f0fdf4; color: #059669; font-weight: 700; }
            .noscript-section tr:nth-child(even) { background: #f8fafc; }
            .noscript-notice { max-width: 900px; margin: 0 auto; padding: 16px 20px; text-align: center; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
        </style>

        <div class="noscript-notice">
            <p style="color: #92400e; font-weight: 700; margin: 0 0 4px;">${T.noticeTitle}</p>
            <p style="color: #78350f; margin: 0; font-size: 0.875rem;">${T.noticeText}</p>
        </div>

        <div class="noscript-section">
            <h2>${T.medsTitle}</h2>
            <table>
                <tr>
                    ${th(T.medsTh)}
                </tr>
${medRows}
            </table>

            <h2>${T.papTitle}</h2>
            <p>${T.papIntro}</p>
            <table>
                <tr>
                    ${th(T.papTh)}
                </tr>
${papRows}
            </table>

            <h2>${T.fndTitle}</h2>
            <p>${T.fndIntro}</p>
            <table>
                <tr>
                    ${th(T.fndTh)}
                </tr>
${foundationRows}
            </table>

            <h2>${T.moreTitle}</h2>
            <ul>
${otherResources}
            </ul>

            <h2>${T.contactTitle}</h2>
            <h3>TRIO (Transplant Recipients International Organization)</h3>
            <p>${T.trioText}</p>

            <h3>${T.founderTitle}</h3>
            <p>${T.founderText}</p>

            <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); border-radius: 12px; padding: 20px; text-align: center; margin-top: 24px;">
                <p style="color: white; font-weight: 700; font-size: 1.125rem; margin: 0 0 4px;">
                    ${T.crisisTitle} <a href="tel:988" style="color: white;">988</a>
                </p>
                <p style="color: #bfdbfe; font-size: 0.875rem; margin: 0;">${T.crisisSub}</p>
            </div>

            <p style="color: #64748b; font-size: 0.8125rem; text-align: center; margin-top: 24px;">${T.disclaimer}</p>
        </div>
    </noscript>
`;
}

/**
 * Merge a page definition with its Spanish metadata for the ?lang=es variant.
 */
function spanishPage(page) {
  // Route-level Spanish meta merged with any page-supplied fields (the
  // medication pages carry full es objects; the directory pages carry
  // only es.bodyHtml on top of their SPANISH_META titles).
  const es = { ...(SPANISH_META[page.route] || {}), ...(page.es || {}) };
  return {
    ...page,
    title: es.title || page.title,
    description: es.description || page.description,
    ogTitle: (es.title || page.title).split(' | ')[0],
    ogDescription: es.description || page.description,
    aiSummary: undefined,
    bodyHtml: page.route === '/' ? homeBody(true) : es.bodyHtml,
    noscriptHtml: page.route === '/' ? homeNoscript(true) : undefined,
  };
}

/**
 * Find the main entry script from the built index.html
 */
function findMainScript(distDir) {
  const indexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.log('⚠️  dist/index.html not found, using default script path');
    return '/src/main.jsx';
  }

  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Look for the main module script (Vite generates something like /assets/index-abc123.js)
  const scriptMatch = indexHtml.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/);

  if (scriptMatch && scriptMatch[1]) {
    return scriptMatch[1];
  }

  // Fallback to development path
  return '/src/main.jsx';
}

/**
 * Collect all stylesheet <link> tags from the built index.html so prerendered
 * pages load the same CSS as the SPA shell.
 */
function findStylesheetTags(distDir) {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) return '';
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const tags = indexHtml.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
  return tags.join('\n    ');
}

/**
 * Main function to generate all prerendered pages
 */
function prerenderPages() {
  const distDir = path.join(projectRoot, 'dist');

  // Check if dist directory exists
  if (!fs.existsSync(distDir)) {
    console.log('📁 Creating dist directory...');
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Find the main script path from the built index.html
  const mainScriptPath = findMainScript(distDir);
  const stylesheetTags = findStylesheetTags(distDir);
  console.log(`📦 Main script: ${mainScriptPath}`);
  console.log(`🎨 Stylesheets: ${(stylesheetTags.match(/<link/g) || []).length} tag(s)`);
  console.log('🔄 Prerendering pages for SEO...\n');

  let created = 0;
  let errors = 0;

  for (const page of [...pages, ...medicationPages]) {
    try {
      // Create directory for the route
      const routePath = page.route.startsWith('/') ? page.route.slice(1) : page.route;
      const pageDir = path.join(distDir, routePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }

      // Generate and write HTML with the correct script path
      const html = generatePageHTML(page, mainScriptPath, stylesheetTags);
      const htmlPath = path.join(pageDir, 'index.html');
      fs.writeFileSync(htmlPath, html, 'utf8');

      console.log(`  ✅ ${page.route} -> ${routePath}/index.html`);
      created++;

      // Spanish variant, served path-based at /es/<route> (Netlify resolves
      // dist/es/<route>/index.html directly; legacy ?lang=es URLs 301 here).
      // Covers the fixed SPANISH_ROUTES and every /medications/:id page.
      if (hasSpanishVariant(page.route)) {
        const esHtml = generatePageHTML(spanishPage(page), mainScriptPath, stylesheetTags, 'es');
        const esDir = path.join(distDir, 'es', routePath);
        fs.mkdirSync(esDir, { recursive: true });
        fs.writeFileSync(path.join(esDir, 'index.html'), esHtml, 'utf8');
        console.log(`  ✅ ${esPath(page.route)} -> es/${routePath}/index.html`);
        created++;
      }
    } catch (error) {
      console.error(`  ❌ Error creating ${page.route}:`, error.message);
      errors++;
    }
  }

  // Homepage: replace the trimmed placeholders in dist/index.html with the
  // full static body and <noscript> tables GENERATED from the locale and
  // data files (homeBody/homeNoscript — the same sources the app renders),
  // then emit the Spanish homepage at dist/es/index.html from the same
  // builders. Missing markers throw, which fails the build: the fallback
  // can no longer drift from the live page.
  try {
    const homePath = path.join(distDir, 'index.html');
    if (fs.existsSync(homePath)) {
      let homeHtml = fs.readFileSync(homePath, 'utf8');
      const replaceBetween = (html, start, end, content, label) => {
        const i = html.indexOf(start);
        const j = html.indexOf(end);
        if (i === -1 || j === -1 || j < i) {
          throw new Error(`${label} markers (${start} ... ${end}) missing from index.html`);
        }
        return `${html.slice(0, i + start.length)}\n${content}\n            ${html.slice(j)}`;
      };
      homeHtml = replaceBetween(
        homeHtml, '<!-- home-static-body -->', '<!-- /home-static-body -->',
        homeBody(false), 'home body'
      );
      homeHtml = replaceBetween(
        homeHtml, '<!-- home-noscript -->', '<!-- /home-noscript -->',
        homeNoscript(false), 'home noscript'
      );
      for (const [key, value] of Object.entries(HOME_STATS)) {
        homeHtml = homeHtml.replace(
          new RegExp(`(<span data-stat="${key}">)[^<]*(</span>)`, 'g'),
          `$1${value}$2`
        );
      }
      fs.writeFileSync(homePath, homeHtml, 'utf8');
      const esHome = generatePageHTML(
        spanishPage({ route: '/', title: SITE_NAME, description: '' }),
        mainScriptPath,
        stylesheetTags,
        'es'
      );
      fs.mkdirSync(path.join(distDir, 'es'), { recursive: true });
      fs.writeFileSync(path.join(distDir, 'es', 'index.html'), esHome, 'utf8');
      console.log('  ✅ / static body + noscript generated; /es/ -> es/index.html');
      created += 1;
    }
  } catch (error) {
    console.error('  ❌ Error creating homepage language variants:', error.message);
    errors++;
  }

  // Neutral SPA-fallback shells. Unknown routes used to fall back to the
  // homepage files, so /es/anything statically served the Spanish HOME
  // content (a soft-404 that reads as "this page shows the wrong thing"
  // to crawlers and no-JS visitors). These shells carry no page content —
  // just the loading note, the directory links, and the app scripts so
  // React can render the real page (or its localized 404). No canonical
  // and no robots directive: real non-prerendered routes are also served
  // through them, and hydration supplies the correct head tags.
  try {
    const shell = (isEs) => `<!DOCTYPE html>
<html lang="${isEs ? 'es' : 'en'}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${SITE_NAME}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <meta name="theme-color" content="#059669" />
    <link rel="manifest" href="/manifest.json" />
    ${stylesheetTags}
</head>
<body class="bg-slate-50">
    <div id="root">
        <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-emerald-700 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-xl">
            ${isEs ? 'Saltar al contenido principal' : 'Skip to main content'}
        </a>
        <main id="main-content" style="max-width: 600px; margin: 40px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center;">
            <p style="color: #64748b; margin-bottom: 16px;">${isEs ? 'Cargando la página...' : 'Loading...'}</p>
            <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 16px;">${isEs
              ? 'Si esta página no carga, todavía puede ver la <a href="/es/medications" style="color:#059669;">lista de medicamentos</a> y el <a href="/es/application-help" style="color:#059669;">directorio de programas de asistencia</a>.'
              : 'If this page doesn\'t load, you can still browse the <a href="/medications" style="color:#059669;">medication list</a> and the <a href="/application-help" style="color:#059669;">assistance program directory</a>.'}</p>
            <a href="${isEs ? '/es/' : '/'}" style="color: #059669; text-decoration: underline;">${isEs ? 'Ir a la página principal' : 'Go to Homepage'}</a>
        </main>
    </div>

    <script type="module" src="${mainScriptPath}"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(distDir, 'app-shell.html'), shell(false), 'utf8');
    fs.mkdirSync(path.join(distDir, 'es'), { recursive: true });
    fs.writeFileSync(path.join(distDir, 'es', 'app-shell.html'), shell(true), 'utf8');
    console.log('  ✅ SPA fallback shells -> app-shell.html, es/app-shell.html');
    created += 2;
  } catch (error) {
    console.error('  ❌ Error creating SPA fallback shells:', error.message);
    errors++;
  }

  // Assertion: every medication in medications.json must have a prerendered
  // page ON DISK in both languages (dist/medications/<id>/index.html and
  // dist/es/medications/<id>/index.html). The routes are enumerated from
  // MEDICATIONS itself, so a mismatch means a write silently failed or the
  // layout changed — either way a missed page would ship as a soft-404
  // shell. Count real files rather than trusting the loop, the same way
  // the home-page markers fail the build on drifted copy.
  const countMedPages = (dir) => (fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'index.html')))
        .length
    : 0);
  const medPagesOnDisk = countMedPages(path.join(distDir, 'medications'))
    + countMedPages(path.join(distDir, 'es', 'medications'));
  const medPagesExpected = MEDICATIONS.length * 2;
  if (medPagesOnDisk !== medPagesExpected) {
    console.error(`❌ Medication page count mismatch: ${medPagesOnDisk} on disk vs ${medPagesExpected} expected (${MEDICATIONS.length} medications × 2 languages).`);
    errors++;
  } else {
    console.log(`  ✅ Medication page count verified: ${medPagesOnDisk} files = ${MEDICATIONS.length} medications × 2 languages`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created} pages`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
    // A missing prerendered file is a hard 404 for its /es/ URL (and
    // those URLs are in the sitemap), so a prerender error must fail
    // the build instead of shipping silently.
    process.exitCode = 1;
  }
  console.log(`\n✅ Prerendering complete!`);
  console.log(`   Search engines will now see unique titles and descriptions for each page.\n`);
}

// Run the script
prerenderPages();
