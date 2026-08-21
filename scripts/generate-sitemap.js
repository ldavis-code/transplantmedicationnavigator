import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://transplantmedicationnavigator.com';

// One SEO landing page per medication at /medications/:id
const MEDICATIONS = JSON.parse(
    readFileSync(join(__dirname, '..', 'src', 'data', 'medications.json'), 'utf8')
);
const medicationRoutes = MEDICATIONS.map((m) => ({
    path: `/medications/${m.id}`, changefreq: 'monthly', priority: 0.7,
}));

// Define all routes with their SEO metadata
// Note: Excludes redirect routes (/for-transplant-programs, /for-employers, /for-payers),
// admin routes (/reporting/*), auth pages, and confirmation pages
const routes = [
    { path: '/', changefreq: 'weekly', priority: 1.0 },
    { path: '/wizard', changefreq: 'monthly', priority: 0.9 },
    { path: '/medications', changefreq: 'monthly', priority: 0.9 },
    { path: '/education', changefreq: 'monthly', priority: 0.8 },
    { path: '/application-help', changefreq: 'monthly', priority: 0.8 },
    { path: '/pricing', changefreq: 'monthly', priority: 0.8 },
    { path: '/for-hospitals', changefreq: 'monthly', priority: 0.8 },
    { path: '/evidence', changefreq: 'monthly', priority: 0.7 },
    { path: '/savings-tracker', changefreq: 'monthly', priority: 0.8 },
    { path: '/faq', changefreq: 'monthly', priority: 0.7 },
    { path: '/survey', changefreq: 'monthly', priority: 0.7 },
    { path: '/pilot', changefreq: 'monthly', priority: 0.6 },
    { path: '/survey/transplant', changefreq: 'monthly', priority: 0.6 },
    { path: '/survey/general', changefreq: 'monthly', priority: 0.6 },
    { path: '/terms-and-conditions', changefreq: 'yearly', priority: 0.4 },
    { path: '/privacy', changefreq: 'yearly', priority: 0.4 },
    { path: '/accessibility', changefreq: 'yearly', priority: 0.4 },
];

// Routes with a full Spanish translation, reached via ?lang=es. Each is
// listed as its own URL (with hreflang alternates on both language versions)
// so the Spanish pages are discoverable by search engines.
const SPANISH_PATHS = new Set([
    '/', '/wizard', '/education', '/application-help', '/faq',
    '/medications', '/evidence', '/my-medications', '/savings-tracker',
    '/survey', '/survey/transplant', '/survey/general', '/pilot',
    '/terms-and-conditions', '/privacy', '/accessibility',
]);

function generateSitemap() {
    const today = new Date().toISOString().split('T')[0];

    const allRoutes = [...routes, ...medicationRoutes];
    const alternates = (path) => `
        <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${path}" />
        <xhtml:link rel="alternate" hreflang="es" href="${SITE_URL}${path}?lang=es" />
        <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${path}" />`;
    const urls = allRoutes.flatMap(route => {
        const hasEs = SPANISH_PATHS.has(route.path);
        const entries = [`    <url>
        <loc>${SITE_URL}${route.path}</loc>${hasEs ? alternates(route.path) : ''}
        <lastmod>${today}</lastmod>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
    </url>`];
        if (hasEs) {
            entries.push(`    <url>
        <loc>${SITE_URL}${route.path}?lang=es</loc>${alternates(route.path)}
        <lastmod>${today}</lastmod>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
    </url>`);
        }
        return entries;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

    const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
    writeFileSync(outputPath, sitemap);
    console.log(`Sitemap generated: ${outputPath}`);
    console.log(`Pages included: ${allRoutes.length} (${medicationRoutes.length} medication pages)`);
    console.log(`Last modified: ${today}`);
}

generateSitemap();
