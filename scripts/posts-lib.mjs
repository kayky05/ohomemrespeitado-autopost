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

// Every image a post needs: [{ slot, prompt }]
export function imageSlots(post, style) {
  const p = (desc) => `${style} ${post.visual} ${desc}`;
  const out = [];
  if (post.cover?.image) out.push({ slot: 'cover', prompt: `${style} ${desc(post.cover.image)}` });
  post.slides.forEach((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    if (post.format === 'meme') {
      const wide = (d) => p(d).replace('Vertical 2:3 portrait image.', 'Wide horizontal 3:2 landscape image, generous empty space at the top for a caption.');
      out.push({ slot: `s${n}a`, prompt: wide(s.imageTop) });
      out.push({ slot: `s${n}b`, prompt: wide(s.imageBottom) });
    } else {
      out.push({ slot: `s${n}`, prompt: p(s.image) });
    }
  });
  if (post.end?.variant === 'image') out.push({ slot: 'end', prompt: `${style} ${post.visual} ${post.end.image}` });
  return out;
}
const desc = (s) => s;

export function missingImages(post, style) {
  return imageSlots(post, style).filter((s) => !findImage(path.join(IMG_DIR(post.id), s.slot)));
}
