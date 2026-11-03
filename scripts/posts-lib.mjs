// Shared helpers for content/posts.json (formato v2).
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
export const IMG_DIR = (id) => path.join(ROOT, 'brand', 'v2', id);

export async function loadPosts() {
  return JSON.parse(await readFile(path.join(ROOT, 'content', 'posts.json'), 'utf8'));
}

export const findImage = (base) => ['jpg', 'jpeg', 'png'].map((e) => `${base}.${e}`).find((f) => existsSync(f)) || null;

// Tipo de slide padrão por formato do post.
export const DEFAULT_KIND = {
  lista: 'plain', imagens: 'plain', historia: 'plain', frases: 'serif', status: 'small', maturidade: 'truth',
  noticias: 'boxed', meme: 'meme', duo: 'duo', anos: 'years', bichos: 'bubbles', nokia: 'nokia',
};
export const kindOf = (post, s) => s.kind || DEFAULT_KIND[post.format] || 'plain';
const TWO_IMAGES = new Set(['meme', 'duo']);
const NO_IMAGE = new Set(['nokia', 'verse']);
const END_WITH_IMAGE = new Set(['image', 'teacher']);

// Every image a post needs: [{ slot, prompt }]
export function imageSlots(post, style) {
  const p = (d) => `${style} ${post.visual} ${d}`;
  const wide = (d) => p(d).replace('Vertical 2:3 portrait image.', 'Wide horizontal 3:2 landscape image, generous empty space at the top for a caption.');
  const out = [];
  if (post.cover?.image) out.push({ slot: 'cover', prompt: `${style} ${post.cover.image}` });
  post.slides.forEach((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    const kind = kindOf(post, s);
    if (NO_IMAGE.has(kind)) return;
    if (TWO_IMAGES.has(kind)) {
      out.push({ slot: `s${n}a`, prompt: wide(s.imageTop) });
      out.push({ slot: `s${n}b`, prompt: wide(s.imageBottom) });
    } else {
      out.push({ slot: `s${n}`, prompt: p(s.image) });
    }
  });
  if (END_WITH_IMAGE.has(post.end?.variant)) out.push({ slot: 'end', prompt: `${style} ${post.visual} ${post.end.image}` });
  return out;
}
const desc = (s) => s;

export function missingImages(post, style) {
  return imageSlots(post, style).filter((s) => !findImage(path.join(IMG_DIR(post.id), s.slot)));
}
