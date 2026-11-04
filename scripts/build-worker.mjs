// Monta worker/public: queue.json (fila com legenda pronta) + imagens dos slides renderizados.
// Posts com "hold": true ficam de fora (aguardando aprovação).
// Uso: node scripts/build-worker.mjs && cd worker && npx wrangler deploy
import { readFile, writeFile, mkdir, rm, readdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './posts-lib.mjs';

const PUB = path.join(ROOT, 'worker', 'public');
const { hashtags, posts } = JSON.parse(await readFile(path.join(ROOT, 'content', 'posts.json'), 'utf8'));
await rm(PUB, { recursive: true, force: true });
const queue = [];
for (const p of posts) {
  const dir = path.join(ROOT, 'out', p.id);
  if (p.hold || !existsSync(path.join(dir, '01.jpg'))) continue;
  const files = (await readdir(dir)).filter((f) => f.endsWith('.jpg')).sort();
  if (files.length < 2 || files.length > 10) throw new Error(`${p.id}: ${files.length} slides`);
  await mkdir(path.join(PUB, 'img', p.id), { recursive: true });
  for (const f of files) await copyFile(path.join(dir, f), path.join(PUB, 'img', p.id, f));
  queue.push({ id: p.id, caption: [p.caption, hashtags].filter(Boolean).join('\n\n'), slides: files.map((f) => `img/${p.id}/${f}`) });
}
await writeFile(path.join(PUB, 'queue.json'), JSON.stringify({ posts: queue }, null, 1));
console.log(`${queue.length} carrosséis na fila do worker: ${queue.map((q) => q.id).join(', ')}`);
