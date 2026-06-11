import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(__dirname, '../assets');
const source = path.join(assets, 'icon.png');

async function generate() {
  // splash-icon.png — 200x200
  await sharp(source).resize(200, 200).png().toFile(path.join(assets, 'splash-icon.png'));
  console.log('✓ splash-icon.png');

  // favicon.png — 64x64
  await sharp(source).resize(64, 64).png().toFile(path.join(assets, 'favicon.png'));
  console.log('✓ favicon.png');

  // android-icon-foreground.png — 1024x1024 (icon centered on transparent canvas)
  await sharp(source)
    .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 112, bottom: 112, left: 112, right: 112, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(assets, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png');

  // android-icon-background.png — dark purple solid 1024x1024
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 13, g: 10, b: 30, alpha: 1 } } })
    .png()
    .toFile(path.join(assets, 'android-icon-background.png'));
  console.log('✓ android-icon-background.png');

  // android-icon-monochrome.png — grayscale version for Android 13+
  await sharp(source).resize(1024, 1024).grayscale().png().toFile(path.join(assets, 'android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png');

  console.log('\nDone!');
}

generate().catch(console.error);
