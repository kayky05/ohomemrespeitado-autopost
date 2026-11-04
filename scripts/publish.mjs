// Publish the next unposted carousel to Instagram via the Graph API.
// Env: IG_ACCESS_TOKEN, IG_USER_ID, IMAGE_BASE_URL (public base where out/<id>/NN.jpg is served),
//      GRAPH_API_VERSION (default v26.0). Reads .env when present.
// Usage: node scripts/publish.mjs [--dry-run] [--id <carouselId>]
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const STATE = path.join(ROOT, 'state', 'posted.json');

async function loadDotEnv() {
  try {
    const txt = await readFile(path.join(ROOT, '.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

const redact = (s) => String(s).replace(/(EAA|IGAA)[A-Za-z0-9]+/g, '<token>');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function graph(method, endpoint, params = {}) {
  const v = process.env.GRAPH_API_VERSION || 'v26.0';
  const url = new URL(`https://graph.facebook.com/${v}/${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: process.env.IG_ACCESS_TOKEN });
  let res;
  if (method === 'GET') {
    for (const [k, val] of body) url.searchParams.set(k, val);
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${method} ${endpoint} -> ${redact(JSON.stringify(json.error || json))}`);
  return json;
}

async function waitReady(containerId) {
  for (let i = 0; i < 30; i++) {
    const { status_code } = await graph('GET', containerId, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`container ${containerId} ${status_code}`);
    await sleep(4000);
  }
  throw new Error(`container ${containerId} not ready in time`);
}

async function main() {
  await loadDotEnv();
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const forced = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;

  // Fila = content/posts.json (formato v2), na ordem do arquivo.
  const { hashtags, posts } = JSON.parse(await readFile(path.join(ROOT, 'content', 'posts.json'), 'utf8'));
  let state = { posted: [] };
  try { state = JSON.parse(await readFile(STATE, 'utf8')); } catch {}
  const done = new Set(state.posted.map((p) => p.id));

  // Disparo agendado: cada horário tem tentativas extras; só posta se o último post tiver mais de 2h.
  const last = state.posted.at(-1);
  const gapMin = last ? (Date.now() - Date.parse(last.at)) / 60000 : Infinity;
  if (process.env.GITHUB_EVENT_NAME === 'schedule' && !forced && gapMin < 120) {
    console.log(`Último post há ${Math.round(gapMin)} min (${last.id}); esta tentativa não posta.`);
    return;
  }

  // Só entra na fila quem já foi renderizado (o render só gera posts com todas as imagens).
  const rendered = (x) => existsSync(path.join(ROOT, 'out', x.id, '01.jpg'));
  const c = forced ? posts.find((x) => x.id === forced) : posts.find((x) => !done.has(x.id) && rendered(x));
  if (!c) { console.log('Fila vazia: nenhum carrossel novo pronto para postar.'); process.exitCode = 2; return; }

  const dir = path.join(ROOT, 'out', c.id);
  await access(dir).catch(() => { throw new Error(`Slides não renderizados: out/${c.id} (rode scripts/render.mjs)`); });
  const files = (await readdir(dir)).filter((f) => f.endsWith('.jpg')).sort();
  if (files.length < 2 || files.length > 10) throw new Error(`Carrossel precisa de 2 a 10 imagens (tem ${files.length})`);

  const base = (process.env.IMAGE_BASE_URL || '').replace(/\/$/, '');
  const urls = files.map((f) => `${base}/out/${c.id}/${f}`);
  const caption = [c.caption, hashtags].filter(Boolean).join('\n\n');

  console.log(`Carrossel: ${c.id} (${files.length} slides)`);
  if (dry) { console.log(urls.join('\n')); console.log('---\n' + caption); return; }
  if (!base) throw new Error('IMAGE_BASE_URL não definido');
  for (const k of ['IG_ACCESS_TOKEN', 'IG_USER_ID']) if (!process.env[k]) throw new Error(`${k} não definido`);

  const ig = process.env.IG_USER_ID;
  const children = [];
  for (const image_url of urls) {
    const { id } = await graph('POST', `${ig}/media`, { image_url, is_carousel_item: 'true' });
    children.push(id);
  }
  for (const id of children) await waitReady(id);
  const { id: container } = await graph('POST', `${ig}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption });
  await waitReady(container);
  const { id: mediaId } = await graph('POST', `${ig}/media_publish`, { creation_id: container });
  const { permalink } = await graph('GET', mediaId, { fields: 'permalink' });

  state.posted.push({ id: c.id, mediaId, permalink, at: new Date().toISOString() });
  await writeFile(STATE, JSON.stringify(state, null, 2) + '\n');
  console.log(`Publicado: ${permalink}`);
}

main().catch((e) => { console.error(redact(e.stack || e)); process.exit(1); });
