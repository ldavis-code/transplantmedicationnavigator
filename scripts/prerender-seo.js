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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// SEO metadata for each page (copied from src/data/seo-metadata.js)
const BASE_URL = 'https://transplantmedicationnavigator.com';
const SITE_NAME = 'Transplant Medication Navigator™';

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
    description: 'IOTA downside risk went live July 1, 2026. Graft survival is 20% of your score, and medication non-adherence is its leading modifiable threat. HIPAA-compliant patient education with Epic integration.',
    ogTitle: 'IOTA Performance Year 2 Is Here: Patient Education Is Your Fastest Lever',
    ogDescription: 'CMS IOTA downside risk began July 1, 2026. Protect your composite graft survival score by removing medication cost barriers. HIPAA-compliant, Epic-integrated, deployable in a 90-day pilot.',
    ogImage: '/og-image-hospitals.png',
    aiSummary: 'B2B page for transplant hospital administrators and coordinators. Transplant Medication Navigator is a HIPAA-compliant patient medication-assistance and education platform that supports IOTA Model quality performance (composite graft survival, 20 of 100 points) by reducing cost-driven immunosuppressant non-adherence. IOTA Performance Year 2 downside risk (up to $2,000 per kidney transplant) began July 1, 2026. Features: Epic MyChart integration via Connection Hub, discharge workflow tools, white-label admin dashboard with aggregate analytics, no PHI collected, 90-day pilot program. Founder is a liver transplant recipient and Vice Chair of the OPTN Patient Affairs Committee, with a 20-year enterprise operations background.',
    bodyHtml: `<h1 style="color:#0f172a;margin-bottom:12px;">For Hospital Administrators &amp; Transplant Coordinators</h1>
      <p style="color:#475569;margin-bottom:16px;">Transplant Medication Navigator is a HIPAA-compliant medication assistance platform for transplant programs, built by a liver transplant recipient who serves as Vice Chair of the OPTN Patient Affairs Committee. It connects patients to copay cards, patient assistance programs, and foundation grants before cost becomes a barrier to adherence.</p>
      <ul style="color:#475569;text-align:left;max-width:560px;margin:0 auto 20px;line-height:1.8;">
        <li>IOTA Performance Year 2 began July 1, 2026: participating kidney transplant hospitals now carry downside risk of up to $2,000 per kidney transplant, and composite graft survival is the model's entire quality domain, worth up to 20 of 100 points (CMS IOTA Model, June 2026 final rule).</li>
        <li>Patient education is the fastest lever a program controls: medication cost education at discharge, a standardized tool for coordinators and social workers, and aggregate engagement reporting for QAPI and IOTA strategy reviews.</li>
        <li>Improve SRTR outcomes: medication non-adherence is the leading modifiable cause of graft loss, associated with ~36% of graft losses (Dew MA et al., Transplantation, 2007).</li>
        <li>Reduce preventable readmissions driven by cost-related non-adherence &mdash; 40% of recipients report skipping doses due to cost (AST Therapeutic Needs Study, Taber DJ et al., American Journal of Transplantation, 2025).</li>
        <li>Strengthen CMS Conditions of Participation documentation with a trackable, standardized patient education resource.</li>
        <li>HIPAA-compliant by design: no PHI collected, stored, or transmitted; no BAA required for educational use.</li>
        <li>Epic MyChart integration via Epic Connection Hub, discharge workflow support, and a white-label admin dashboard with aggregate, privacy-safe analytics.</li>
        <li>Typical patient impact: monthly out-of-pocket immunosuppressant costs drop from $624 without assistance to about $10 with copay card enrollment.</li>
      </ul>
      <p style="margin-bottom:16px;"><a href="mailto:info@transplantmedicationnavigator.com?subject=Hospital%20Partnership%20Inquiry" style="color:#059669;font-weight:600;text-decoration:underline;">Schedule a demo</a> or <a href="/pilot" style="color:#059669;font-weight:600;text-decoration:underline;">view the 90-day pilot program</a>.</p>`,
  },
  {
    route: '/pricing',
    title: 'Pricing | Transplant Medication Navigator™',
    description: 'Free access to education, subscription options for patients, and partnership options for organizations. View our clear pricing.',
    ogTitle: 'Clear Pricing',
    ogDescription: 'Free educational resources for all. Subscription and partnership options for patients and healthcare organizations.',
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
function generatePageHTML(page, mainScriptPath) {
  const canonical = `${BASE_URL}${page.route}`;
  const pageTitle = page.title.split(' | ')[0];
  const aiSummaryTag = page.aiSummary
    ? `\n    <meta name="ai-content-summary" content="${page.aiSummary}" />`
    : '';

  // Routes with a full Spanish translation (reached via ?lang=es) get
  // hreflang alternates so search engines index both language versions.
  const SPANISH_ROUTES = new Set(['/', '/wizard', '/education', '/application-help', '/faq']);
  const hreflangTags = SPANISH_ROUTES.has(page.route)
    ? `
    <!-- Language alternates -->
    <link rel="alternate" hreflang="en" href="${canonical}" />
    <link rel="alternate" hreflang="es" href="${canonical}?lang=es" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags - Unique per page for SEO -->
    <title>${page.title}</title>
    <meta name="title" content="${page.title}" />
    <meta name="description" content="${page.description}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />${aiSummaryTag}${hreflangTags}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${page.ogTitle || page.title}" />
    <meta property="og:description" content="${page.ogDescription || page.description}" />
    <meta property="og:image" content="${BASE_URL}${page.ogImage || '/og-image.png'}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@TRIOweb" />
    <meta name="twitter:url" content="${canonical}" />
    <meta name="twitter:title" content="${page.ogTitle || page.title}" />
    <meta name="twitter:description" content="${page.ogDescription || page.description}" />
    <meta name="twitter:image" content="${BASE_URL}${page.ogImage || '/twitter-image.png'}" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />

    <!-- PWA -->
    <meta name="theme-color" content="#059669" />
    <link rel="manifest" href="/manifest.json" />
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
            <p style="color: #64748b; margin-bottom: 16px;">Loading interactive features...</p>
            <a href="/" style="color: #059669; text-decoration: underline;">Go to Homepage</a>
        </main>
    </div>

    <!-- Load the SPA - React will take over and render the full page -->
    <script type="module" src="${mainScriptPath}"></script>
</body>
</html>`;
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
  console.log(`📦 Main script: ${mainScriptPath}`);
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
      const html = generatePageHTML(page, mainScriptPath);
      const htmlPath = path.join(pageDir, 'index.html');
      fs.writeFileSync(htmlPath, html, 'utf8');

      console.log(`  ✅ ${page.route} -> ${routePath}/index.html`);
      created++;
    } catch (error) {
      console.error(`  ❌ Error creating ${page.route}:`, error.message);
      errors++;
    }
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
