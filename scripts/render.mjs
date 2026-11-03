// Render carousels from content/carousels.json into out/<id>/NN.jpg
// Usage: node scripts/render.mjs [carouselId ...] [--missing] [--force] [--profile]
//   Uses AI images when present: brand/covers/<id>, brand/quotes/<id>-<n>, brand/bg/* (jpg or png).
//   Without images it falls back to the typographic slides.
import { chromium } from 'playwright';
import { readFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  coverSlide, quoteSlide, ctaSlide, hookCover, imageQuoteSlide, followSlide, profileHtml, W, H,
} from './template.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

async function dataUri(base) {
  for (const ext of ['jpg', 'jpeg', 'png']) {
    const f = `${base}.${ext}`;
    if (existsSync(f)) return `data:image/${ext === 'png' ? 'png' : 'jpeg'};base64,${(await readFile(f)).toString('base64')}`;
  }
  return null;
}

const hasImage = (base) => ['jpg', 'jpeg', 'png'].some((e) => existsSync(`${base}.${e}`));

// Carrossel "pronto" = tem imagem de capa e uma imagem para cada frase.
export function imagesReady(c) {
  return hasImage(path.join(ROOT, 'brand', 'covers', c.id)) &&
    c.quotes.every((_, i) => hasImage(path.join(ROOT, 'brand', 'quotes', `${c.id}-${i + 1}`)));
}

async function backgrounds() {
  const dir = path.join(ROOT, 'brand', 'bg');
  if (!existsSync(dir)) return [];
  return (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort().map((f) => path.join(dir, f.replace(/\.[^.]+$/, '')));
}

export async function renderHtml(page, html, file, size = { width: W, height: H }) {
  await page.setViewportSize(size);
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.__fit());
  await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
}

export async function renderCarousel(page, c, index, bgs) {
  const dir = path.join(ROOT, 'out', c.id);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const coverImg = await dataUri(path.join(ROOT, 'brand', 'covers', c.id));
  const slides = [coverImg && c.cover.hook ? hookCover({ title: c.cover.hook }, coverImg) : coverSlide(c.cover)];
  for (let i = 0; i < c.quotes.length; i++) {
    const img = await dataUri(path.join(ROOT, 'brand', 'quotes', `${c.id}-${i + 1}`));
    slides.push(img ? imageQuoteSlide(c.quotes[i], i + 1, c.quotes.length, img) : quoteSlide(c.quotes[i], i + 1, c.quotes.length));
  }
  const bg = bgs.length ? await dataUri(bgs[index % bgs.length]) : null;
  slides.push(bg ? followSlide(bg) : ctaSlide());

  const files = [];
  for (let i = 0; i < slides.length; i++) {
    const file = path.join(dir, `${String(i + 1).padStart(2, '0')}.jpg`);
    await renderHtml(page, slides[i], file);
    files.push(file);
  }
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const { carousels } = JSON.parse(await readFile(path.join(ROOT, 'content', 'carousels.json'), 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  if (args.includes('--profile')) {
    await mkdir(path.join(ROOT, 'brand'), { recursive: true });
    await renderHtml(page, profileHtml(), path.join(ROOT, 'brand', 'perfil-html.jpg'), { width: 1080, height: 1080 });
    console.log('brand/perfil-html.jpg');
  }

  const want = args.filter((a) => !a.startsWith('--'));
  const missingOnly = args.includes('--missing');
  const all = args.includes('--force') || want.length > 0 || missingOnly;
  if (all) {
    const bgs = await backgrounds();
    for (const [index, c] of carousels.entries()) {
      if (want.length && !want.includes(c.id)) continue;
      if (missingOnly && existsSync(path.join(ROOT, 'out', c.id, '01.jpg'))) continue;
      if (missingOnly && !imagesReady(c)) { console.log(`${c.id}: aguardando imagens`); continue; }
      const files = await renderCarousel(page, c, index, bgs);
      console.log(`${c.id}: ${files.length} slides`);
    }
  }
  await browser.close();
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(ROOT, 'scripts', 'render.mjs')) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
