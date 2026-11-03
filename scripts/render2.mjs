// Render posts from content/posts.json into out/<id>/NN.jpg (formato v2, padrão viral).
// Usage: node scripts/render2.mjs [postId ...] [--missing]
//   Only renders posts whose images are all present in brand/v2/<id>/.
import { chromium } from 'playwright';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, IMG_DIR, loadPosts, findImage, missingImages } from './posts-lib.mjs';
import { cover, plain, boxed, serif, meme, endImage, endPaper, W, H } from './template2.mjs';

async function uri(id, slot) {
  const f = findImage(path.join(IMG_DIR(id), slot));
  if (!f) throw new Error(`imagem faltando: brand/v2/${id}/${slot}`);
  return `data:image/${f.endsWith('.png') ? 'png' : 'jpeg'};base64,${(await readFile(f)).toString('base64')}`;
}

export async function buildSlides(post) {
  const html = [];
  if (post.cover) html.push(cover(post.cover, await uri(post.id, 'cover')));
  for (let i = 0; i < post.slides.length; i++) {
    const s = post.slides[i];
    const n = String(i + 1).padStart(2, '0');
    if (post.format === 'meme') {
      html.push(meme(s, await uri(post.id, `s${n}a`), await uri(post.id, `s${n}b`)));
      continue;
    }
    const img = await uri(post.id, `s${n}`);
    const text = s.text || post.captions?.[i] || '';
    if (post.format === 'frases') html.push(serif({ text }, img));
    else if (s.box || post.format === 'noticias') html.push(boxed({ text }, img));
    else html.push(plain({ text }, img));
  }
  if (post.end?.variant === 'image') html.push(endImage(post.end, await uri(post.id, 'end')));
  else if (post.end) html.push(endPaper(post.end));
  if (html.length > 10) throw new Error(`${post.id}: ${html.length} slides (máximo do Instagram é 10)`);
  return html;
}

async function main() {
  const args = process.argv.slice(2);
  const want = args.filter((a) => !a.startsWith('--'));
  const missingOnly = args.includes('--missing');
  const { imageStyle, posts } = await loadPosts();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const post of posts) {
    if (want.length && !want.includes(post.id)) continue;
    const dir = path.join(ROOT, 'out', post.id);
    if (missingOnly && existsSync(path.join(dir, '01.jpg'))) continue;
    const missing = missingImages(post, imageStyle);
    if (missing.length) { console.log(`${post.id}: aguardando ${missing.length} imagens`); continue; }
    const slides = await buildSlides(post);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    for (let i = 0; i < slides.length; i++) {
      await page.setContent(slides[i], { waitUntil: 'networkidle' });
      await page.evaluate(() => window.__fit());
      await page.screenshot({ path: path.join(dir, `${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90 });
    }
    console.log(`${post.id}: ${slides.length} slides`);
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
