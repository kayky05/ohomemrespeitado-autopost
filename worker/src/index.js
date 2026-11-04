// Postagem automática do @ohomemrespeitado na Cloudflare.
// - Cron (horário de Brasília 08h, 12h, 18h, 21h) publica o próximo carrossel da fila.
// - As imagens são servidas por este mesmo Worker (pasta public/), então a Meta baixa daqui.
// - Estado (o que já foi postado) fica no KV "STATE", chave "posted".
// Secrets: IG_ACCESS_TOKEN, IG_USER_ID, RUN_KEY (para disparo manual em /run?key=...).

const V = 'v26.0';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const redact = (s) => String(s).replace(/(EAA|IGAA)[A-Za-z0-9]+/g, '<token>');

async function graph(env, method, endpoint, params = {}) {
  const url = new URL(`https://graph.facebook.com/${V}/${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: env.IG_ACCESS_TOKEN });
  let res;
  if (method === 'GET') {
    for (const [k, v] of body) url.searchParams.set(k, v);
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${method} ${endpoint.split('/').pop()} -> ${redact(JSON.stringify(json.error || json))}`);
  return json;
}

async function waitReady(env, id, tries = 12) {
  for (let i = 0; i < tries; i++) {
    const { status_code } = await graph(env, 'GET', id, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`container ${status_code}`);
    await sleep(5000);
  }
  throw new Error('container não ficou pronto a tempo');
}

async function loadState(env) {
  return JSON.parse((await env.STATE.get('posted')) || '[]');
}

async function loadQueue(env, origin) {
  const res = await env.ASSETS.fetch(new Request(`${origin}/queue.json`));
  return res.json();
}

// Cria um item do carrossel; tenta de novo se a Meta não conseguir baixar a imagem.
async function createChild(env, image_url) {
  let err;
  for (let i = 0; i < 3; i++) {
    try {
      return (await graph(env, 'POST', `${env.IG_USER_ID}/media`, { image_url, is_carousel_item: 'true' })).id;
    } catch (e) { err = e; await sleep(4000); }
  }
  throw err;
}

async function publishNext(env, origin, { force = false } = {}) {
  const posted = await loadState(env);
  const last = posted.at(-1);
  // Trava contra post duplo: nada de dois posts com menos de 90 min entre eles (exceto disparo manual forçado).
  if (!force && last && Date.now() - Date.parse(last.at) < 90 * 60000) {
    return { skipped: `último post há ${Math.round((Date.now() - Date.parse(last.at)) / 60000)} min` };
  }
  const done = new Set(posted.map((p) => p.id));
  const { posts } = await loadQueue(env, origin);
  const c = posts.find((p) => !done.has(p.id));
  if (!c) return { skipped: 'fila vazia' };

  const urls = c.slides.map((f) => `${origin}/${f}`);
  const children = [];
  for (const u of urls) children.push(await createChild(env, u));
  const { id: container } = await graph(env, 'POST', `${env.IG_USER_ID}/media`, {
    media_type: 'CAROUSEL', children: children.join(','), caption: c.caption,
  });
  await waitReady(env, container);
  const { id: mediaId } = await graph(env, 'POST', `${env.IG_USER_ID}/media_publish`, { creation_id: container });
  const { permalink } = await graph(env, 'GET', mediaId, { fields: 'permalink' });
  posted.push({ id: c.id, mediaId, permalink, at: new Date().toISOString() });
  await env.STATE.put('posted', JSON.stringify(posted));
  return { posted: c.id, permalink };
}

async function log(env, entry) {
  const logs = JSON.parse((await env.STATE.get('log')) || '[]');
  logs.push({ at: new Date().toISOString(), ...entry });
  await env.STATE.put('log', JSON.stringify(logs.slice(-50)));
}

export default {
  async scheduled(event, env, ctx) {
    const origin = env.PUBLIC_ORIGIN;
    try {
      const r = await publishNext(env, origin);
      await log(env, { cron: event.cron, ...r });
    } catch (e) {
      await log(env, { cron: event.cron, error: redact(e.message) });
      throw e;
    }
  },

  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/status') {
      const posted = await loadState(env);
      const logs = JSON.parse((await env.STATE.get('log')) || '[]');
      return Response.json({ posted, log: logs.slice(-15) });
    }
    if (url.pathname === '/run') {
      if (!env.RUN_KEY || url.searchParams.get('key') !== env.RUN_KEY) return new Response('não autorizado', { status: 401 });
      try {
        const r = await publishNext(env, url.origin, { force: url.searchParams.get('force') === '1' });
        await log(env, { manual: true, ...r });
        return Response.json(r);
      } catch (e) {
        await log(env, { manual: true, error: redact(e.message) });
        return Response.json({ error: redact(e.message) }, { status: 500 });
      }
    }
    return env.ASSETS.fetch(req);
  },
};
