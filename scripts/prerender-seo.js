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

// Routes with a full Spanish translation (reached via ?lang=es). Each gets
// hreflang alternates and a prerendered Spanish variant (index-es.html,
// served by the lang=:lang redirect rules in public/_redirects) so search
// engines and link previews see Spanish text without running JavaScript.
const SPANISH_ROUTES = new Set(['/', '/wizard', '/education', '/application-help', '/faq']);

// Spanish titles/descriptions come from the same source the app uses
// (seoMetadata imported at the top of the file).
const SPANISH_META = {
  '/': seoMetadata.home.es,
  '/wizard': seoMetadata.wizard.es,
  '/education': seoMetadata.education.es,
  '/application-help': seoMetadata.applicationHelp.es,
  '/faq': seoMetadata.faq.es,
};
const ES_LOCALE = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'locales', 'es.json'), 'utf8')
);

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
  };
});

/**
 * Generate HTML content for a page with proper meta tags
 * This version includes the main SPA script so React can take over after initial render
 */
function generatePageHTML(page, mainScriptPath, stylesheetTags, lang = 'en') {
  const canonical = `${BASE_URL}${page.route}`;
  const isEs = lang === 'es';
  // The Spanish version of a page lives at the same route with ?lang=es;
  // it is its own canonical so both language versions can be indexed.
  const pageUrl = isEs ? `${canonical}?lang=es` : canonical;
  const pageTitle = page.title.split(' | ')[0];
  const aiSummaryTag = page.aiSummary
    ? `\n    <meta name="ai-content-summary" content="${page.aiSummary}" />`
    : '';

  const hreflangTags = SPANISH_ROUTES.has(page.route)
    ? `
    <!-- Language alternates -->
    <link rel="alternate" hreflang="en" href="${canonical}" />
    <link rel="alternate" hreflang="es" href="${canonical}?lang=es" />
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
    <!-- Skip to main content for accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-emerald-700 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-xl">
        Skip to main content
    </a>

    <div id="root">
        <!-- Static content for SEO - React will replace this when it loads -->
        <main id="main-content" style="max-width: 600px; margin: 40px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center;">
            ${page.bodyHtml || `<h1 style="color: #0f172a; margin-bottom: 16px;">${pageTitle}</h1>
            <p style="color: #475569; margin-bottom: 24px;">${page.description}</p>`}
            <p style="color: #64748b; margin-bottom: 16px;">${isEs ? 'Cargando la página... <span lang="en">/ Loading interactive features...</span>' : 'Loading interactive features... <span lang="es">/ Cargando la página...</span>'}</p>
            <a href="${isEs ? '/?lang=es' : '/'}" style="color: #059669; text-decoration: underline;">${isEs ? 'Ir a la página principal' : 'Go to Homepage'}</a>
        </main>
    </div>

    <!-- Load the SPA - React will take over and render the full page -->
    <script type="module" src="${mainScriptPath}"></script>
</body>
</html>`;
}

/**
 * Static Spanish homepage body for dist/index-es.html, built from the same
 * locale strings the app renders (src/locales/es.json) plus the computed
 * stat tiles, so crawlers and no-JS visitors get real Spanish content.
 */
function spanishHomeBody() {
  const h = ES_LOCALE.home;
  return `<div style="text-align: center;">
      <p style="background: linear-gradient(135deg, #047857 0%, #059669 40%, #10B981 100%); color: white; padding: 12px 24px; border-radius: 12px; font-size: 0.9375rem;">
        <strong>${h.updateBanner.verified}</strong> — ${h.updateBanner.totalAssist.replace(/<\/?strong>/g, '')}
      </p>
      <h1 style="font-size: 2rem; font-weight: 800; color: #0f172a; margin: 24px 0 16px; line-height: 1.2;">
        ${h.hero.titlePre}<span style="color: #059669;">${h.hero.titleHighlight}</span>
      </h1>
      <p style="font-size: 1.25rem; font-weight: 600; color: #059669; margin-bottom: 12px;">${h.hero.tagline}</p>
      <p style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-bottom: 24px;">${h.hero.subtitle}</p>
      <p style="margin-bottom: 24px;">
        <a href="/wizard?lang=es" style="display: inline-block; padding: 14px 28px; background: #047857; color: white; font-weight: 700; border-radius: 12px; text-decoration: none;">${h.hero.quizButton}</a>
      </p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 560px; margin: 0 auto 32px;">
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: 1.5rem; font-weight: 800; color: #047857; margin: 0;">${HOME_STATS.medications}</p>
          <p style="font-size: 0.8125rem; color: #475569; margin: 4px 0 0;">${h.stats.medications}</p>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: 1.5rem; font-weight: 800; color: #b45309; margin: 0;">${HOME_STATS.assistancePrograms}</p>
          <p style="font-size: 0.8125rem; color: #475569; margin: 4px 0 0;">${h.stats.assistancePrograms}</p>
        </div>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; text-align: center;">
          <p style="font-size: 1.5rem; font-weight: 800; color: #047857; margin: 0;">${HOME_STATS.copayCards}</p>
          <p style="font-size: 0.8125rem; color: #475569; margin: 4px 0 0;">${h.stats.copayCards}</p>
        </div>
      </div>
      <section style="background: #064e3b; color: white; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">${h.mission.missionTitle}</h2>
        <p style="color: #d1fae5; line-height: 1.7; margin: 0;">${h.mission.missionText}</p>
      </section>
      <section style="background: linear-gradient(to bottom right, #f8fafc, #ecfdf5); border: 2px solid #a7f3d0; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: left;">
        <h2 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${h.founder.title}</h2>
        <h3 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${h.founder.name}</h3>
        <p style="color: #047857; font-size: 0.875rem; margin-bottom: 10px;">${h.founder.role}</p>
        <p style="color: #334155; line-height: 1.7; margin: 0;">${h.founder.bio}</p>
      </section>
      <section style="background: linear-gradient(to right, #2563eb, #1d4ed8); border-radius: 12px; padding: 20px;">
        <p style="color: white; font-weight: 700; font-size: 1.0625rem; margin: 0 0 4px;">
          ¿Crisis de salud mental? Llame o envíe un mensaje de texto al <a href="tel:988" style="color: white;">988</a> (para atención en español, oprima el 2)
        </p>
        <p style="color: #bfdbfe; font-size: 0.875rem; margin: 0;">${h.hotline.lifeline} — 24/7, confidencial y también en español</p>
      </section>
    </div>`;
}

/**
 * Merge a page definition with its Spanish metadata for the ?lang=es variant.
 */
function spanishPage(page) {
  const es = SPANISH_META[page.route] || {};
  return {
    ...page,
    title: es.title || page.title,
    description: es.description || page.description,
    ogTitle: (es.title || page.title).split(' | ')[0],
    ogDescription: es.description || page.description,
    aiSummary: undefined,
    bodyHtml: page.route === '/' ? spanishHomeBody() : undefined,
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

      // Spanish variant (?lang=es), plus an English twin so the
      // "lang=:lang -> index-:lang.html" redirect resolves for both values.
      if (SPANISH_ROUTES.has(page.route)) {
        const esHtml = generatePageHTML(spanishPage(page), mainScriptPath, stylesheetTags, 'es');
        fs.writeFileSync(path.join(pageDir, 'index-es.html'), esHtml, 'utf8');
        fs.writeFileSync(path.join(pageDir, 'index-en.html'), html, 'utf8');
        console.log(`  ✅ ${page.route}?lang=es -> ${routePath}/index-es.html`);
        created++;
      }
    } catch (error) {
      console.error(`  ❌ Error creating ${page.route}:`, error.message);
      errors++;
    }
  }

  // Homepage: refresh the static stat tiles in dist/index.html from the data
  // files (they are hand-written in index.html and would otherwise go stale),
  // then emit the language variants for the lang=:lang redirect.
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
      fs.writeFileSync(path.join(distDir, 'index-en.html'), homeHtml, 'utf8');
      const esHome = generatePageHTML(
        spanishPage({ route: '/', title: SITE_NAME, description: '' }),
        mainScriptPath,
        stylesheetTags,
        'es'
      );
      fs.writeFileSync(path.join(distDir, 'index-es.html'), esHome, 'utf8');
      console.log('  ✅ / stats refreshed; /?lang=es -> index-es.html');
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
  }
  console.log(`\n✅ Prerendering complete!`);
  console.log(`   Search engines will now see unique titles and descriptions for each page.\n`);
}

// Run the script
prerenderPages();
