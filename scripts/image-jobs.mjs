// Write content/image-jobs.json with every image still missing for content/posts.json.
// Usage: node scripts/image-jobs.mjs [postId ...]
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadPosts, missingImages } from './posts-lib.mjs';

const want = process.argv.slice(2);
const { imageStyle, posts } = await loadPosts();
const jobs = [];
for (const post of posts) {
  if (want.length && !want.includes(post.id)) continue;
  for (const s of missingImages(post, imageStyle)) {
    jobs.push({ file: `brand/v2/${post.id}/${s.slot}.png`, prompt: s.prompt });
  }
}
await writeFile(path.join(ROOT, 'content', 'image-jobs.json'), JSON.stringify(jobs, null, 2) + '\n');
console.log(`${jobs.length} imagens faltando -> content/image-jobs.json`);
