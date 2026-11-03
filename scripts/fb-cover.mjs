// Gera brand/capa-facebook.jpg (1640x624) a partir de uma imagem do banco.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './posts-lib.mjs';

const img = path.join(ROOT, process.argv[2] || 'brand/v2/105-status-suma/s07.jpg');
const uri = `data:image/jpeg;base64,${(await readFile(img)).toString('base64')}`;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Libre+Caslon+Text:ital@0;1&display=block" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1640px;height:624px;overflow:hidden;background:#000}
.c{position:relative;width:1640px;height:624px;background:url('${uri}') center 45%/cover}
.sh{position:absolute;inset:0;background:radial-gradient(60% 90% at 50% 50%,rgba(0,0,0,.35) 0%,rgba(0,0,0,.75) 100%)}
.t{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;color:#fff}
h1{font-family:'Montserrat',sans-serif;font-weight:900;font-size:92px;letter-spacing:.02em;text-transform:uppercase;text-shadow:0 4px 24px rgba(0,0,0,.7)}
p{margin-top:14px;font-family:'Libre Caslon Text',serif;font-style:italic;font-size:34px;color:rgba(255,255,255,.9);text-shadow:0 2px 12px rgba(0,0,0,.8)}
.h{margin-top:22px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:24px;letter-spacing:.2em;color:rgba(255,255,255,.75)}</style></head>
<body><div class="c"><div class="sh"></div><div class="t"><h1>O Homem Respeitado</h1>
<p>Reflexões, histórias e verdades que todo homem precisa ouvir.</p><div class="h">@OHOMEMRESPEITADO</div></div></div></body></html>`;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1640, height: 624 } });
await pg.setContent(html, { waitUntil: 'networkidle' }); await pg.evaluate(() => document.fonts.ready);
await pg.screenshot({ path: path.join(ROOT, 'brand', 'capa-facebook.jpg'), type: 'jpeg', quality: 92 }); await b.close();
console.log('brand/capa-facebook.jpg');
