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
    title: 'Resources & Education for Transplant Patients | Transplant Medication Navigator™',
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
    route: '/pricing',
    title: 'Pricing | Transplant Medication Navigator™',
    description: 'Free access to education, subscription options for patients, and partnership options for organizations. View our clear pricing.',
    ogTitle: 'Clear Pricing',
    ogDescription: 'Free educational resources for all. Subscription and partnership options for patients and healthcare organizations.',
  },
  {
    route: '/my-medications',
    title: 'My Medications | Transplant Medication Navigator™',
    description: 'Track your transplant medications, renewal dates, and costs. Manage your medication list privately on your device with export and import options.',
    ogTitle: 'My Medications - Track Your Prescriptions',
    ogDescription: 'Track your transplant medications, renewal dates, and costs. Manage your medication list privately on your device.',
  },
  {
    route: '/savings-tracker',
    title: 'Savings Calculator | Transplant Medication Navigator™',
    description: 'Calculate how much you could save on transplant medications with assistance programs. Track actual savings and see your total benefits over time.',
    ogTitle: 'Medication Savings Calculator',
    ogDescription: 'See how much you could save on transplant medications with assistance programs.',
  },
  {
    route: '/subscribe',
    title: 'Subscribe to Pro | Transplant Medication Navigator™',
    description: 'Unlock unlimited features with a Pro subscription. Save medications, track savings, and get personalized assistance recommendations.',
    ogTitle: 'Subscribe to Pro - Unlock All Features',
    ogDescription: 'Get unlimited access to My Path Quiz, medication tracking, savings calculator, and more.',
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

/**
 * Generate HTML content for a page with proper meta tags
 * This version includes the main SPA script so React can take over after initial render
 */
function generatePageHTML(page, mainScriptPath) {
  const canonical = `${BASE_URL}${page.route}`;
  const pageTitle = page.title.split(' | ')[0];

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
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${page.ogTitle || page.title}" />
    <meta property="og:description" content="${page.ogDescription || page.description}" />
    <meta property="og:image" content="${BASE_URL}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@TRIOweb" />
    <meta name="twitter:url" content="${canonical}" />
    <meta name="twitter:title" content="${page.ogTitle || page.title}" />
    <meta name="twitter:description" content="${page.ogDescription || page.description}" />
    <meta name="twitter:image" content="${BASE_URL}/twitter-image.png" />

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
        <!-- Note: No <h1> here to avoid duplicate h1 tags when React renders -->
        <main id="main-content" style="max-width: 600px; margin: 40px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center;">
            <p style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 16px;">${pageTitle}</p>
            <p style="color: #475569; margin-bottom: 24px;">${page.description}</p>
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

  for (const page of pages) {
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
