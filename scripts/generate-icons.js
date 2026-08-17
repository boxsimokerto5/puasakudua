import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SVG_PATH = path.resolve(process.cwd(), 'assets', 'logo.svg');
const ANDROID_RES_PATH = path.resolve(process.cwd(), 'android', 'app', 'src', 'main', 'res');
const PUBLIC_PATH = path.resolve(process.cwd(), 'public');

const ANDROID_ICONS = [
  { folder: 'mipmap-mdpi', size: 48, foregroundSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, foregroundSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, foregroundSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, foregroundSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, foregroundSize: 432 },
];

const WEB_ICONS = [
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'pwa-icon.png', size: 512 },
];

async function generateIcons() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`SVG source not found at: ${SVG_PATH}`);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  console.log('Generating web icons and favicons...');
  if (!fs.existsSync(PUBLIC_PATH)) {
    fs.mkdirSync(PUBLIC_PATH, { recursive: true });
  }

  for (const icon of WEB_ICONS) {
    const dest = path.join(PUBLIC_PATH, icon.name);
    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(dest);
    console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Also check if android res folder exists (or create it for capacitor sync)
  if (fs.existsSync(ANDROID_RES_PATH)) {
    console.log('Generating Android native mipmap icons...');
    for (const icon of ANDROID_ICONS) {
      const folderPath = path.join(ANDROID_RES_PATH, icon.folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Standard App Launcher Icon
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(folderPath, 'ic_launcher.png'));

      // Round Launcher Icon
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(folderPath, 'ic_launcher_round.png'));

      // Adaptive Foreground Icon
      await sharp(svgBuffer)
        .resize(icon.foregroundSize, icon.foregroundSize)
        .png()
        .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

      console.log(`✓ Generated ${icon.folder} icons`);
    }
  } else {
    console.log('ℹ Android res folder not found yet (will be populated during "npx cap add android").');
  }

  console.log('🎉 All icons successfully generated from assets/logo.svg!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
