#!/usr/bin/env node
/**
 * Genera public/assets/og-image.png (1200×630) con branding SiSi para Open Graph.
 * Se ejecuta on-demand — no en cada build (la imagen es estable y se sube al repo).
 *
 * Uso:
 *   node scripts/generate-og-image.mjs
 */
import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'src', 'assets');
const OUT_FILE = resolve(OUT_DIR, 'og-image.png');
const LOGO_PATH = resolve(ROOT, 'src', 'assets', 'icon', 'web-app-manifest-512x512.png');

const logoDataUri = (() => {
  const buf = readFileSync(LOGO_PATH);
  return `data:image/png;base64,${buf.toString('base64')}`;
})();

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #005f73 0%, #0a7a8c 55%, #0b3d6f 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    padding: 0 90px;
    position: relative;
    overflow: hidden;
  }
  .wave {
    position: absolute;
    bottom: -40px;
    left: 0;
    right: 0;
    height: 220px;
    background:
      radial-gradient(60% 100% at 20% 50%, rgba(255,255,255,0.10), transparent 70%),
      radial-gradient(60% 100% at 80% 40%, rgba(255,255,255,0.08), transparent 70%);
  }
  .content {
    position: relative;
    display: flex;
    align-items: center;
    gap: 60px;
    z-index: 2;
  }
  .logo {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: #ffffff;
    padding: 18px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
    flex-shrink: 0;
  }
  .logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .text {
    max-width: 720px;
    display: flex;
    align-items: center;
    min-height: 260px;
  }
  .tagline {
    font-size: 62px;
    font-weight: 700;
    line-height: 1.15;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.30);
  }
  .domain {
    position: absolute;
    bottom: 40px;
    right: 90px;
    font-size: 22px;
    letter-spacing: 2px;
    opacity: 0.75;
    z-index: 2;
  }
</style>
</head>
<body>
  <div class="wave"></div>
  <div class="content">
    <div class="logo"><img src="${logoDataUri}" alt=""/></div>
    <div class="text">
      <div class="tagline">Travesías a nado en aguas abiertas · Previsión marítima de playas españolas</div>
    </div>
  </div>
  <div class="domain">consisi.com</div>
</body>
</html>`;

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: OUT_FILE, type: 'png', omitBackground: false });
    console.log(`[og-image] generado: ${OUT_FILE}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[og-image] error:', err);
  process.exit(1);
});
