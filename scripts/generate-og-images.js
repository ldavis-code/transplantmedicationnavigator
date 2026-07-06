/**
 * Generate Open Graph / Twitter share images (1200x630) from the site logo.
 *
 * Outputs:
 *   public/og-image.png            - site-wide share card (light, patient-facing)
 *   public/twitter-image.png       - same design (Twitter uses the same 1200x630)
 *   public/og-image-hospitals.png  - /for-hospitals share card (dark, institutional)
 *
 * Run: node scripts/generate-og-images.js
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const W = 1200;
const H = 630;
const FONT = 'DejaVu Sans, Arial, sans-serif';

// The official brand mark (heart + leaf) lives at photos/logo.png with a
// transparent background; logo.svg is a simplified favicon variant.
async function renderLogo(size) {
  return sharp(path.join(publicDir, 'photos', 'logo.png'))
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Light, patient-facing card used site-wide.
function siteBackgroundSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f0fdf4"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect y="${H - 14}" width="${W}" height="14" fill="#105f47"/>
  <text x="430" y="255" font-family="${FONT}" font-size="54" font-weight="bold" fill="#105f47">Transplant Medication</text>
  <text x="430" y="325" font-family="${FONT}" font-size="54" font-weight="bold" fill="#105f47">Navigator™</text>
  <text x="430" y="395" font-family="${FONT}" font-size="30" fill="#475569">Free help affording transplant medications</text>
  <text x="430" y="448" font-family="${FONT}" font-size="26" font-style="italic" fill="#105f47">transplantmedicationnavigator.com</text>
</svg>`);
}

// Dark, institutional card for /for-hospitals.
function hospitalBackgroundSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#065f46"/>
      <stop offset="1" stop-color="#134e4a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect y="${H - 14}" width="${W}" height="14" fill="#34d399"/>
  <rect x="70" y="60" width="110" height="110" rx="24" fill="#ffffff"/>
  <text x="205" y="112" font-family="${FONT}" font-size="28" font-weight="bold" fill="#ffffff">Transplant Medication Navigator™</text>
  <text x="205" y="150" font-family="${FONT}" font-size="22" fill="#a7f3d0">transplantmedicationnavigator.com/for-hospitals</text>
  <text x="70" y="295" font-family="${FONT}" font-size="24" font-weight="bold" letter-spacing="3" fill="#6ee7b7">FOR HOSPITAL ADMINISTRATORS &amp; TRANSPLANT COORDINATORS</text>
  <text x="70" y="375" font-family="${FONT}" font-size="58" font-weight="bold" fill="#ffffff">IOTA Downside Risk Is Now Live</text>
  <text x="70" y="440" font-family="${FONT}" font-size="29" fill="#d1fae5">Patient education is your fastest lever to protect graft survival.</text>
  <text x="70" y="530" font-family="${FONT}" font-size="24" fill="#a7f3d0">Privacy-first · Epic MyChart integration · No PHI stored</text>
</svg>`);
}

async function generate() {
  // Site-wide card: logo on the left, wordmark and tagline on the right.
  const siteLogo = await renderLogo(300);
  const siteCard = await sharp(siteBackgroundSvg())
    .composite([{ input: siteLogo, left: 80, top: 160 }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), siteCard);
  fs.writeFileSync(path.join(publicDir, 'twitter-image.png'), siteCard);
  console.log('  ✅ og-image.png / twitter-image.png (1200x630)');

  // Hospital card: small logo badge top-left, IOTA headline below.
  const hospitalLogo = await renderLogo(86);
  const hospitalCard = await sharp(hospitalBackgroundSvg())
    .composite([{ input: hospitalLogo, left: 82, top: 72 }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image-hospitals.png'), hospitalCard);
  console.log('  ✅ og-image-hospitals.png (1200x630)');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
