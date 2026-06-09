import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../assets');

// Main app icon SVG — dark bg + purple W
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1C1535"/>
      <stop offset="100%" stop-color="#0B0B12"/>
    </linearGradient>
    <linearGradient id="wGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6B5EEF"/>
      <stop offset="100%" stop-color="#B8ADFF"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="55%" r="40%">
      <stop offset="0%" stop-color="#7B6EF6" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#7B6EF6" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="28"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>

  <!-- Glow -->
  <ellipse cx="512" cy="560" rx="300" ry="220" fill="#7B6EF6" opacity="0.22" filter="url(#blur)"/>

  <!-- W stroke -->
  <polyline
    points="168,308 328,694 512,414 696,694 856,308"
    fill="none"
    stroke="url(#wGrad)"
    stroke-width="88"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

// Foreground only (transparent bg) for Android adaptive icon
const foregroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="wGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6B5EEF"/>
      <stop offset="100%" stop-color="#B8ADFF"/>
    </linearGradient>
  </defs>
  <polyline
    points="168,308 328,694 512,414 696,694 856,308"
    fill="none"
    stroke="url(#wGrad)"
    stroke-width="88"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

// Splash icon — just the W, no background
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="wGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6B5EEF"/>
      <stop offset="100%" stop-color="#B8ADFF"/>
    </linearGradient>
  </defs>
  <polyline
    points="30,58 62,142 100,78 138,142 170,58"
    fill="none"
    stroke="url(#wGrad)"
    stroke-width="17"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

async function generate() {
  console.log('Generating icons...');

  // icon.png — 1024x1024
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✓ icon.png');

  // favicon.png — 64x64
  await sharp(Buffer.from(iconSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✓ favicon.png');

  // splash-icon.png — 200x200
  await sharp(Buffer.from(splashSvg))
    .resize(200, 200)
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png');

  // android-icon-foreground.png — 1024x1024 transparent bg
  await sharp(Buffer.from(foregroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png');

  console.log('\nDone! All icons generated in assets/');
}

generate().catch(console.error);
