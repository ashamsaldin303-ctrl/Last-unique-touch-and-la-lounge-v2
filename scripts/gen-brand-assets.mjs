/**
 * One-shot brand asset generator (audit P0.5 / P1.6 / P1.13).
 *
 * Produces, from pure vector sources (zero photography required):
 *   public/apple-touch-icon.png   180×180
 *   public/og-lut.png             1200×630
 *   public/og-lalounge.png        1200×630
 *   public/og-birthday.png        1200×630
 *
 * Run:  node scripts/gen-brand-assets.mjs
 */
import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUB = join(ROOT, 'public')

const BRANDS = {
  lut: { bg1: '#1a1408', bg2: '#0f0c07', accent: '#e5c878', accent2: '#b8915a', name: 'LAST UNIQUE TOUCH', tag: 'HERITAGE LUXURY RENTAL' },
  lalounge: { bg1: '#2a0f22', bg2: '#150912', accent: '#ff5ca8', accent2: '#c9a24b', name: 'LA LOUNGE', tag: 'LOUNGE & MOOD LIGHTING' },
  birthday: { bg1: '#2a1531', bg2: '#17081f', accent: '#ffd147', accent2: '#ff8fab', name: 'YOUR BIRTHDAY', tag: 'CELEBRATION ATELIER' },
}

function diamond(cx, cy, s, accent, accent2) {
  return `
  <path d="M${cx} ${cy - s} L${cx + s} ${cy} L${cx} ${cy + s * 1.4} L${cx - s} ${cy} Z"
        fill="none" stroke="${accent}" stroke-width="${s * 0.09}" stroke-linejoin="round"/>
  <path d="M${cx - s} ${cy} H${cx + s} M${cx} ${cy - s} L${cx - s * 0.42} ${cy} L${cx} ${cy + s * 1.4} L${cx + s * 0.42} ${cy} L${cx} ${cy - s} Z"
        fill="none" stroke="${accent2}" stroke-width="${s * 0.05}" stroke-linejoin="round"/>`
}

/** XML-escape text nodes (& < >) so brand strings can never break the SVG. */
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function ogSvg(b) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="${b.bg1}"/>
      <stop offset="100%" stop-color="${b.bg2}"/>
    </radialGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${b.accent}" stop-opacity="0"/>
      <stop offset=".5" stop-color="${b.accent}"/>
      <stop offset="1" stop-color="${b.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g opacity=".16">
    ${[...Array(7)].map((_, i) => `<circle cx="${120 + i * 160}" cy="${560 - (i % 3) * 40}" r="2.4" fill="${b.accent}"/>`).join('')}
  </g>
  ${diamond(930, 250, 120, b.accent, b.accent2)}
  <rect x="90" y="252" width="520" height="2.4" fill="url(#hair)"/>
  <text x="90" y="220" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="10" fill="${b.accent2}">${esc(b.tag)}</text>
  <text x="90" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="76" fill="#faf6ef">${esc(b.name)}</text>
  <text x="90" y="392" font-family="Georgia, serif" font-size="30" fill="${b.accent}" opacity=".9">Kuwait · Luxury Event Rental</text>
  <rect x="90" y="430" width="520" height="2.4" fill="url(#hair)"/>
</svg>`
}

function appleSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="40" fill="#0f0c07"/>
  <path d="M90 28 146 73 90 152 34 73 90 28Z" fill="none" stroke="#e5c878" stroke-width="7" stroke-linejoin="round"/>
  <path d="M34 73h112M90 28 66 73 90 152 114 73 90 28Z" fill="none" stroke="#b8915a" stroke-width="4" stroke-linejoin="round"/>
</svg>`
}

await sharp(Buffer.from(appleSvg())).png().toFile(join(PUB, 'apple-touch-icon.png'))
for (const [key, b] of Object.entries(BRANDS)) {
  await sharp(Buffer.from(ogSvg(b))).png().toFile(join(PUB, `og-${key}.png`))
}
// keep a neutral default pointing at LUT
await sharp(Buffer.from(ogSvg(BRANDS.lut))).png().toFile(join(PUB, 'og-default.png'))
console.log('brand assets generated:', ['apple-touch-icon.png', 'og-lut.png', 'og-lalounge.png', 'og-birthday.png', 'og-default.png'].join(', '))
