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

// Home-page stat tiles, computed from the data files so the static fallback
// can never drift from the app (same formula as Home in src/App.jsx).
const PROGRAMS = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'programs.json'), 'utf8')
);
const countGroup = (group) => (group ? Object.keys(group).length : 0);
const HOME_STATS = {
  medications: null, // filled in after MEDICATIONS loads below
  assistancePrograms: countGroup(PROGRAMS.papPrograms) + countGroup(PROGRAMS.foundationPrograms),
  copayCards: countGroup(PROGRAMS.copayPrograms),
};

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
HOME_STATS.medications = MEDICATIONS.length;

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const medicationPages = MEDICATIONS.map((m) => {
  const brand = esc(m.brandName);
  const generic = esc(m.genericName);
  const cat = esc((m.category || 'medication').toLowerCase());
  // "Brand (Generic)" unless the generic is already part of the brand name.
  const nameWithGeneric = (m.genericName && !m.brandName.toLowerCase().includes(m.genericName.toLowerCase()))
    ? `${brand} (${generic})` : brand;
  const hasCopay = !!(m.copayUrl || m.copayProgramId);
  const ways = [
    hasCopay ? 'a manufacturer copay card (for commercial insurance)' : null,
    'patient assistance programs that can provide it for free if you qualify',
    'foundation grants',
    m.generic_available ? 'a lower-cost generic version' : null,
    'discount cards and cash-price comparison (GoodRx, Cost Plus Drugs, and more)',
  ].filter(Boolean);

  // Spanish variant: names localized the way the app displays them, the
  // intro assembled from the same locale strings the component renders,
  // and the category translated via medications.categories.
  const brandEs = esc(localizeMedNameEs(m.brandName));
  const genericEs = esc(localizeMedNameEs(m.genericName));
  const nameWithGenericEs = (m.genericName && !m.brandName.toLowerCase().includes(m.genericName.toLowerCase()))
    ? `${brandEs} (${genericEs})` : brandEs;
  const catEs = esc((ES_CATEGORIES[m.category] || m.category || 'medicamento').toLowerCase());
  const waysEs = [
    hasCopay ? 'Una tarjeta de copago del fabricante (para seguro comercial)' : null,
    'Programas de Asistencia al Paciente que pueden darlo gratis si usted califica',
    'Ayudas económicas de fundaciones',
    m.generic_available ? 'Una versión genérica de menor costo' : null,
    'Tarjetas de descuento y comparación de precios en efectivo (GoodRx, Cost Plus Drugs y más)',
  ].filter(Boolean);

  return {
    route: `/medications/${m.id}`,
    title: `How to Afford ${nameWithGeneric}: Copay Cards & Assistance | Transplant Medication Navigator™`,
    description: `Find copay cards, patient assistance programs, and foundation grants for ${nameWithGeneric}. See ways to lower the cost of your transplant medication.`,
    ogTitle: `How to Afford ${brand}: Copay Cards & Patient Assistance`,
    ogDescription: `Ways to save on ${nameWithGeneric}: copay cards, free-medication programs, foundation grants, and price comparison.`,
    bodyHtml: `<h1 style="color:#0f172a;margin-bottom:12px;">How to Afford ${brand}</h1>
      <p style="color:#475569;margin-bottom:16px;">${brand} (${generic}) is ${/^[aeiou]/i.test(cat) ? 'an' : 'a'} ${cat} used by transplant patients. Here are the ways to lower what you pay:</p>
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
 * Static Spanish homepage body for dist/es/index.html, built from the same
 * locale strings the app renders (src/locales/es.json) plus the computed
 * stat tiles, so crawlers and no-JS visitors get real Spanish content.
 */
function spanishHomeBody() {
  // Built from the CURRENT home locale structure (task-first redesign,
  // Aug 2026). If a key is renamed in es.json this throws, the caller's
  // catch logs it, and the errors counter fails the build — a missing
  // dist/es/index.html turns the sitemap-listed /es/ into a hard 404.
  const h = ES_LOCALE.home;
  const trustLine = h.trust.replace('{{count}}', HOME_STATS.medications);
  return `<div style="text-align: center;">
      <h1 style="font-size: 2rem; font-weight: 800; color: #064e3b; margin: 24px 0 16px; line-height: 1.25;">
        ${h.hero.title1}<br />${h.hero.title2}
      </h1>
      <p style="font-size: 1.125rem; color: #64748b; max-width: 620px; margin: 0 auto 24px;">${h.hero.subtitle}</p>
      <p style="margin-bottom: 12px;">
        <a href="/es/medications" style="display: inline-block; padding: 14px 28px; background: #047857; color: white; font-weight: 700; border-radius: 12px; text-decoration: none;">${h.steps.searchPlaceholder.replace(/\.\.\.$/, '')}</a>
      </p>
      <p style="color: #475569; margin-bottom: 24px;">
        ${h.steps.multiplePre} <a href="/es/wizard" style="color: #047857; font-weight: 600;">${h.steps.multipleLink}</a>
      </p>
      <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 32px;">${trustLine}</p>
      <section style="text-align: left; max-width: 640px; margin: 0 auto 24px;">
        <h2 style="font-size: 1.375rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${h.explainer.title}</h2>
        <p style="color: #475569; margin-bottom: 16px;">${h.explainer.intro}</p>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 12px;">
          <h3 style="font-size: 1.0625rem; font-weight: 700; color: #0f172a; margin: 0 0 6px;">${h.explainer.genericTitle}</h3>
          <p style="color: #475569; font-size: 0.9375rem; margin: 0 0 8px;">${h.explainer.genericText}</p>
          <p style="color: #065f46; font-weight: 700; font-size: 0.9375rem; margin: 0;">→ ${h.explainer.genericAction}</p>
        </div>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 12px;">
          <h3 style="font-size: 1.0625rem; font-weight: 700; color: #0f172a; margin: 0 0 6px;">${h.explainer.brandTitle}</h3>
          <p style="color: #475569; font-size: 0.9375rem; margin: 0 0 8px;">${h.explainer.brandText}</p>
          <p style="color: #b45309; font-weight: 700; font-size: 0.9375rem; margin: 0;">→ ${h.explainer.brandAction}</p>
        </div>
        <p style="color: #334155; margin: 16px 0 0;"><strong>${h.explainer.neverTitle}</strong> ${h.explainer.neverText}</p>
      </section>
      <section style="background: linear-gradient(to bottom right, #f8fafc, #ecfdf5); border: 2px solid #a7f3d0; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: left;">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${h.founder.name}</h2>
        <p style="color: #047857; font-size: 0.875rem; margin-bottom: 10px;">${h.founder.role}</p>
        <p style="color: #334155; font-style: italic; line-height: 1.7; margin: 0 0 10px;">${h.founder.quote}</p>
        <p style="color: #334155; line-height: 1.7; margin: 0;">${h.founder.bio}</p>
      </section>
      <section style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; text-align: left;">
        <p style="color: #0f172a; font-weight: 700; font-size: 1.0625rem; margin: 0 0 4px;">
          ${h.hotline.title} Llame o envíe un mensaje de texto al <a href="tel:988" style="color: #be123c;">988</a> (para atención en español, oprima el 2)
        </p>
        <p style="color: #64748b; font-size: 0.875rem; margin: 0;">${h.hotline.lifeline} — 24/7, confidencial y también en español</p>
      </section>
    </div>`;
}

/**
 * Static Spanish <noscript> fallback for dist/es/index.html. The English
 * homepage (index.html) ships a hand-written noscript block with the core
 * medication, PAP, and copay-foundation tables; this is its Spanish
 * counterpart so no-JS Spanish visitors (older phones, locked-down hospital
 * browsers, slow connections) get the same substance. Program names, phone
 * numbers, and URLs are identical to the English block — only prose is
 * translated. Keep the two blocks' row sets in sync when editing either.
 */
function spanishHomeNoscript() {
  return `
    <!-- Noscript fallback - displays core content when JavaScript is disabled -->
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
            <p style="color: #92400e; font-weight: 700; margin: 0 0 4px;">JavaScript está desactivado</p>
            <p style="color: #78350f; margin: 0; font-size: 0.875rem;">La búsqueda interactiva de medicamentos y el cuestionario necesitan JavaScript. El contenido principal sigue disponible abajo.</p>
        </div>

        <div class="noscript-section">

            <!-- Core Transplant Medications -->
            <h2>Medicamentos de trasplante comunes</h2>
            <table>
                <tr>
                    <th>Medicamento (genérico)</th>
                    <th>Marca(s)</th>
                    <th>Fabricante</th>
                    <th>Asistencia al paciente</th>
                </tr>
                <tr>
                    <td>Tacrolimus</td>
                    <td>Prograf / Astagraf XL</td>
                    <td>Astellas</td>
                    <td><a href="https://www.astellaspharmasupportsolutions.com/">Astellas Support</a></td>
                </tr>
                <tr>
                    <td>Tacrolimus de liberación prolongada</td>
                    <td>Envarsus XR</td>
                    <td>Veloxis</td>
                    <td><a href="https://www.envarsusxr.com/savings-support">Envarsus XR Support</a></td>
                </tr>
                <tr>
                    <td>Ciclosporina</td>
                    <td>Neoral / Sandimmune</td>
                    <td>Novartis</td>
                    <td><a href="https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance">Novartis PAF</a></td>
                </tr>
                <tr>
                    <td>Ciclosporina (modificada)</td>
                    <td>Gengraf</td>
                    <td>AbbVie</td>
                    <td><a href="https://www.abbvie.com/patients/patient-support/patient-assistance.html">myAbbVie Assist</a></td>
                </tr>
                <tr>
                    <td>Micofenolato de mofetilo</td>
                    <td>CellCept</td>
                    <td>Genentech</td>
                    <td><a href="https://www.genentech-access.com/patient.html">Genentech Access</a></td>
                </tr>
                <tr>
                    <td>Ácido micofenólico</td>
                    <td>Myfortic</td>
                    <td>Novartis</td>
                    <td><a href="https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance">Novartis PAF</a></td>
                </tr>
                <tr>
                    <td>Azatioprina</td>
                    <td>Imuran</td>
                    <td>Genérico</td>
                    <td>Hay genérico de bajo costo</td>
                </tr>
                <tr>
                    <td>Sirolimus</td>
                    <td>Rapamune</td>
                    <td>Pfizer</td>
                    <td><a href="https://www.pfizerrxpathways.com/">Pfizer RxPathways</a></td>
                </tr>
                <tr>
                    <td>Everolimus</td>
                    <td>Zortress</td>
                    <td>Novartis</td>
                    <td><a href="https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance">Novartis PAF</a></td>
                </tr>
                <tr>
                    <td>Belatacept</td>
                    <td>Nulojix</td>
                    <td>Bristol Myers Squibb</td>
                    <td><a href="https://www.bmspaf.org/">BMS Patient Assistance</a></td>
                </tr>
                <tr>
                    <td>Prednisona</td>
                    <td>Deltasone (genérico ampliamente disponible)</td>
                    <td>Genérico</td>
                    <td>Hay genérico de bajo costo</td>
                </tr>
                <tr>
                    <td>Valganciclovir</td>
                    <td>Valcyte</td>
                    <td>Genentech</td>
                    <td><a href="https://www.genentech-access.com/patient.html">Genentech Access</a></td>
                </tr>
            </table>

            <!-- Patient Assistance Programs (PAPs) - Free Medications -->
            <h2>Programas de Asistencia al Paciente (medicamentos gratis)</h2>
            <p>Estos programas dan <strong>medicamentos gratis</strong> a pacientes sin seguro o con Medicare que cumplen con los límites de ingresos.</p>
            <table>
                <tr>
                    <th>Programa</th>
                    <th>Teléfono</th>
                    <th>Cubre</th>
                    <th>Sitio web</th>
                </tr>
                <tr>
                    <td><strong>Astellas Patient Assistance</strong></td>
                    <td><a href="tel:1-800-477-6472">1-800-477-6472</a></td>
                    <td>Tacrolimus (Prograf), Cresemba</td>
                    <td><a href="https://www.astellaspharmasupportsolutions.com/">astellaspharmasupportsolutions.com</a></td>
                </tr>
                <tr>
                    <td><strong>Novartis Patient Assistance Foundation</strong></td>
                    <td><a href="tel:1-800-277-2254">1-800-277-2254</a></td>
                    <td>Ciclosporina, Myfortic, Zortress, Simulect, Entresto</td>
                    <td><a href="https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance">novartis.com</a></td>
                </tr>
                <tr>
                    <td><strong>Genentech Patient Foundation</strong></td>
                    <td><a href="tel:1-866-422-2377">1-866-422-2377</a></td>
                    <td>CellCept, Valcyte, Rituxan</td>
                    <td><a href="https://www.genentech-access.com/patient.html">genentech-access.com</a></td>
                </tr>
                <tr>
                    <td><strong>BMS Patient Assistance Foundation</strong></td>
                    <td><a href="tel:1-800-736-0003">1-800-736-0003</a></td>
                    <td>Nulojix (Belatacept), Eliquis</td>
                    <td><a href="https://www.bmspaf.org/">bmspaf.org</a></td>
                </tr>
                <tr>
                    <td><strong>Pfizer RxPathways</strong></td>
                    <td><a href="tel:1-844-989-7284">1-844-989-7284</a></td>
                    <td>Rapamune (Sirolimus), Diflucan, Vfend</td>
                    <td><a href="https://www.pfizerrxpathways.com/">pfizerrxpathways.com</a></td>
                </tr>
                <tr>
                    <td><strong>Sanofi Patient Connection</strong></td>
                    <td><a href="tel:1-888-847-4877">1-888-847-4877</a></td>
                    <td>Thymoglobulin, Renvela</td>
                    <td><a href="https://www.sanofipatientconnection.com/">sanofipatientconnection.com</a></td>
                </tr>
                <tr>
                    <td><strong>Gilead Advancing Access</strong></td>
                    <td><a href="tel:1-800-226-2056">1-800-226-2056</a></td>
                    <td>Vemlidy, Epclusa, Harvoni</td>
                    <td><a href="https://www.gileadadvancingaccess.com/">gileadadvancingaccess.com</a></td>
                </tr>
                <tr>
                    <td><strong>Merck Patient Assistance</strong></td>
                    <td><a href="tel:1-800-727-5400">1-800-727-5400</a></td>
                    <td>Prevymis, Noxafil, Januvia</td>
                    <td><a href="https://www.merckhelps.com/">merckhelps.com</a></td>
                </tr>
            </table>

            <!-- Copay Foundations -->
            <h2>Fundaciones de copago y ayuda económica</h2>
            <p>Estas fundaciones ayudan a pagar copagos, primas y otros costos de medicamentos. Muchas ayudan a pacientes con Medicare.</p>
            <table>
                <tr>
                    <th>Organización</th>
                    <th>Teléfono / Sitio web</th>
                    <th>Cómo ayudan</th>
                </tr>
                <tr>
                    <td><strong>HealthWell Foundation</strong></td>
                    <td><a href="https://www.healthwellfoundation.org/">healthwellfoundation.org</a></td>
                    <td>Copagos, costos de viaje y primas de seguro</td>
                </tr>
                <tr>
                    <td><strong>TotalAssist</strong></td>
                    <td><a href="tel:1-866-512-3861">1-866-512-3861</a> · <a href="https://totalassist.org/">totalassist.org</a></td>
                    <td>Casi 150 fondos para copagos, primas y costos de tratamiento, más gestores de casos gratis para apelaciones de seguro y acceso</td>
                </tr>
                <tr>
                    <td><strong>American Kidney Fund</strong></td>
                    <td><a href="https://www.kidneyfund.org/">kidneyfund.org</a></td>
                    <td>Ayudas económicas para pacientes de diálisis y trasplante</td>
                </tr>
                <tr>
                    <td><strong>American Transplant Foundation</strong></td>
                    <td><a href="https://www.americantransplantfoundation.org/">americantransplantfoundation.org</a></td>
                    <td>Ayudas para medicamentos y mentoría para pacientes de trasplante</td>
                </tr>
                <tr>
                    <td><strong>NORD RareCare</strong></td>
                    <td><a href="https://rarediseases.org/">rarediseases.org</a></td>
                    <td>Ayuda con medicamentos, primas de seguro y copagos</td>
                </tr>
                <tr>
                    <td><strong>Accessia Health</strong></td>
                    <td><a href="https://www.accessiahealth.org/">accessiahealth.org</a></td>
                    <td>Costos de medicamentos, ayuda con el seguro y consejos legales</td>
                </tr>
            </table>

            <!-- Additional Resources -->
            <h2>Recursos adicionales</h2>
            <ul>
                <li><a href="https://medicineassistancetool.org/">PhRMA Medicine Assistance Tool (MAT)</a> &mdash; Buscador de programas de asistencia al paciente de las compañías farmacéuticas</li>
                <li><a href="https://www.medicare.gov">Medicare.gov</a> &mdash; Compare planes de medicamentos y vea si califica para Ayuda Adicional (Extra Help)</li>
                <li><a href="https://costplusdrugs.com/">Cost Plus Drugs</a> &mdash; Farmacia en línea de bajo costo con precios transparentes</li>
                <li><a href="https://rxoutreach.org/">Rx Outreach</a> &mdash; Farmacia sin fines de lucro con medicamentos de bajo costo</li>
                <li><a href="https://totalassist.org/">TotalAssist</a> &mdash; Casi 150 fondos para copagos y costos de tratamiento</li>
                <li><a href="https://donatelife.net/">Donate Life America</a> &mdash; Recursos locales de trasplante, eventos y grupos de apoyo</li>
            </ul>

            <!-- Contact Information -->
            <h2>Contacto y apoyo</h2>
            <h3>TRIO (Transplant Recipients International Organization)</h3>
            <p>
                El grupo más grande para pacientes de trasplante, donantes y familias. Ofrece grupos locales, mentoría y recursos educativos.<br>
                Sitio web: <a href="https://www.trioweb.org/">trioweb.org</a>
            </p>

            <h3>Creado por Lorrinda Gray-Davis</h3>
            <p>
                Receptora de un trasplante de hígado y presidenta de TRIO.<br>
                Sitio web: <a href="https://www.lorrindagraydavis.com">lorrindagraydavis.com</a>
            </p>

            <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); border-radius: 12px; padding: 20px; text-align: center; margin-top: 24px;">
                <p style="color: white; font-weight: 700; font-size: 1.125rem; margin: 0 0 4px;">
                    ¿Crisis de salud mental? Llame o envíe un mensaje de texto al <a href="tel:988" style="color: white;">988</a> (para atención en español, oprima el 2)
                </p>
                <p style="color: #bfdbfe; font-size: 0.875rem; margin: 0;">
                    Línea de Prevención del Suicidio y Crisis 988 &mdash; 24/7, confidencial y también en español
                </p>
            </div>

            <p style="color: #64748b; font-size: 0.8125rem; text-align: center; margin-top: 24px;">
                Esta herramienta es solo para fines educativos y no es consejo médico ni legal. No guardamos su información personal.
            </p>
        </div>
    </noscript>
`;
}

/**
 * Merge a page definition with its Spanish metadata for the ?lang=es variant.
 */
function spanishPage(page) {
  const es = page.es || SPANISH_META[page.route] || {};
  return {
    ...page,
    title: es.title || page.title,
    description: es.description || page.description,
    ogTitle: (es.title || page.title).split(' | ')[0],
    ogDescription: es.description || page.description,
    aiSummary: undefined,
    bodyHtml: page.route === '/' ? spanishHomeBody() : es.bodyHtml,
    noscriptHtml: page.route === '/' ? spanishHomeNoscript() : undefined,
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

  // Homepage: refresh the static stat tiles in dist/index.html from the data
  // files (they are hand-written in index.html and would otherwise go stale),
  // then emit the Spanish homepage at dist/es/index.html.
  try {
    const homePath = path.join(distDir, 'index.html');
    if (fs.existsSync(homePath)) {
      let homeHtml = fs.readFileSync(homePath, 'utf8');
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
      console.log('  ✅ / stats refreshed; /es/ -> es/index.html');
      created += 1;
    }
  } catch (error) {
    console.error('  ❌ Error creating homepage language variants:', error.message);
    errors++;
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
