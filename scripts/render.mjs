// Render carousels from content/carousels.json into out/<id>/NN.jpg
// Usage: node scripts/render.mjs [carouselId ...]   (no ids = render all)
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { coverSlide, quoteSlide, ctaSlide, profileHtml, W, H } from './template.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

export async function renderHtml(page, html, file, size = { width: W, height: H }) {
  await page.setViewportSize(size);
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.__fit());
  await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
}

export async function renderCarousel(page, c) {
  const dir = path.join(ROOT, 'out', c.id);
  await mkdir(dir, { recursive: true });
  const slides = [coverSlide(c.cover), ...c.quotes.map((q, i) => quoteSlide(q, i + 1, c.quotes.length)), ctaSlide()];
  const files = [];
  for (let i = 0; i < slides.length; i++) {
    const file = path.join(dir, `${String(i + 1).padStart(2, '0')}.jpg`);
    await renderHtml(page, slides[i], file);
    files.push(file);
  }
  return files;
}

async function main() {
  const ids = process.argv.slice(2);
  const { carousels } = JSON.parse(await readFile(path.join(ROOT, 'content', 'carousels.json'), 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  if (ids.includes('--profile')) {
    await mkdir(path.join(ROOT, 'brand'), { recursive: true });
    await renderHtml(page, profileHtml(), path.join(ROOT, 'brand', 'perfil-html.jpg'), { width: 1080, height: 1080 });
    console.log('brand/perfil-html.jpg');
  }
  const want = ids.filter((i) => !i.startsWith('--'));
  const missingOnly = ids.includes('--missing');
  for (const c of carousels) {
    if (want.length && !want.includes(c.id)) continue;
    if (!want.length && ids.includes('--profile') && !missingOnly) break;
    if (missingOnly && existsSync(path.join(ROOT, 'out', c.id, '01.jpg'))) continue;
    const files = await renderCarousel(page, c);
    console.log(`${c.id}: ${files.length} slides`);
  }
  await browser.close();
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(ROOT, 'scripts', 'render.mjs')) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
