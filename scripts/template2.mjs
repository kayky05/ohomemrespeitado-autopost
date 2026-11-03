// Modelos v2: imitam o padrão visual das páginas virais de carrossel (ex.: @ohomemsilencioso).
// Todo slide = imagem em tela cheia + texto simples. 1080x1350.
export const HANDLE = '@ohomemrespeitado';
export const W = 1080;
export const H = 1350;

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lines = (s = '') => esc(s).replace(/\n/g, '<br>');

const page = (body, css = '') => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Figtree:wght@500;600;700&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Gochi+Hand&display=block" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
  body{-webkit-font-smoothing:antialiased;color:#fff}
  .s{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#000}
  .img{position:absolute;inset:0;background-position:center;background-size:cover;background-repeat:no-repeat}
  .wm{position:absolute;font-family:'Libre Caslon Text',serif;font-style:italic;font-size:21px;color:rgba(255,255,255,.55);letter-spacing:.01em}
  .box-area{position:absolute;left:56px;right:56px;display:flex;flex-direction:column;align-items:center;text-align:center}
  ${css}
</style></head><body>${body}
<script>
  window.__fit = async () => {
    await document.fonts.ready;
    for (const el of document.querySelectorAll('[data-fit]')) {
      const max = parseFloat(el.dataset.maxh || 9999);
      let size = parseFloat(getComputedStyle(el).fontSize);
      const min = parseFloat(el.dataset.min || 30);
      while (el.getBoundingClientRect().height > max && size > min) { size -= 2; el.style.fontSize = size + 'px'; }
    }
    return true;
  };
</script></body></html>`;

const bg = (uri, pos = 'center') => `<div class="img" style="background-image:url('${uri}');background-position:${pos}"></div>`;

// CAPA: imagem-isca + título branco grosso em caixa alta na parte de baixo.
export function cover({ text }, img) {
  const len = text.length;
  const size = len < 40 ? 82 : len < 70 ? 72 : len < 100 ? 62 : 54;
  return page(
    `<div class="s">${bg(img, 'center 30%')}
      <div class="shade"></div>
      <div class="box-area" style="bottom:118px">
        <h1 class="t" data-fit data-maxh="520" data-min="44">${lines(text)}</h1>
      </div>
      <div class="wm" style="bottom:52px;right:88px">${HANDLE}</div></div>`,
    `.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.65) 63%,rgba(0,0,0,.96) 80%,#000 100%)}
     .t{font-family:'Montserrat',sans-serif;font-weight:800;font-size:${size}px;line-height:1.08;text-transform:uppercase;letter-spacing:-.005em;color:#fff}`
  );
}

// LISTA / TEXTO SIMPLES: texto branco médio, centralizado, na parte de baixo.
export function plain({ text }, img) {
  const len = text.length;
  const size = len < 70 ? 50 : len < 120 ? 44 : len < 180 ? 40 : 36;
  return page(
    `<div class="s">${bg(img)}
      <div class="shade"></div>
      <div class="wm" style="top:34px;right:44px;font-size:18px">${HANDLE}</div>
      <div class="box-area" style="bottom:150px;left:120px;right:120px">
        <p class="t" data-fit data-maxh="420" data-min="30">${lines(text)}</p>
      </div></div>`,
    `.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.45) 70%,rgba(0,0,0,.7) 100%)}
     .t{font-family:'Figtree',sans-serif;font-weight:600;font-size:${size}px;line-height:1.3;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.75),0 0 2px rgba(0,0,0,.6)}`
  );
}

// NOTÍCIA / FATO: texto preto em caixa branca arredondada.
export function boxed({ text }, img) {
  const len = text.length;
  const size = len < 90 ? 48 : len < 150 ? 42 : len < 220 ? 37 : 33;
  return page(
    `<div class="s">${bg(img)}
      <div class="wm" style="top:34px;right:44px;font-size:18px">${HANDLE}</div>
      <div class="box-area" style="bottom:110px">
        <p class="t" data-fit data-maxh="520" data-min="28">${lines(text)}</p>
      </div></div>`,
    `.t{font-family:'Figtree',sans-serif;font-weight:700;font-size:${size}px;line-height:1.2;color:#111;background:#fff;
        padding:26px 34px;border-radius:30px;box-shadow:0 8px 30px rgba(0,0,0,.35)}`
  );
}

// FRASE DE STATUS: texto serifado grande e branco (estilo "coloque isso no status").
export function serif({ text }, img) {
  const len = text.length;
  const size = len < 40 ? 84 : len < 80 ? 70 : len < 130 ? 58 : 50;
  return page(
    `<div class="s">${bg(img)}
      <div class="shade"></div>
      <div class="wm" style="top:34px;right:44px;font-size:18px">${HANDLE}</div>
      <div class="box-area" style="bottom:130px;left:90px;right:90px">
        <p class="t" data-fit data-maxh="560" data-min="40">${lines(text)}</p>
      </div></div>`,
    `.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 42%,rgba(0,0,0,.6) 66%,rgba(0,0,0,.88) 100%)}
     .t{font-family:'Libre Caslon Text',serif;font-weight:400;font-size:${size}px;line-height:1.12;color:#fff;letter-spacing:-.01em;text-shadow:0 3px 16px rgba(0,0,0,.7)}`
  );
}

// MEME DE 2 QUADROS: pergunta em cima, resposta embaixo, texto serifado sobre cada imagem.
export function meme({ top, bottom, ink = 'dark' }, imgTop, imgBottom) {
  const color = ink === 'light' ? '#fff' : '#141414';
  const shadow = ink === 'light' ? 'text-shadow:0 2px 10px rgba(0,0,0,.7)' : 'text-shadow:0 0 18px rgba(255,255,255,.55)';
  const half = H / 2;
  return page(
    `<div class="s">
      <div class="p" style="top:0">${bg(imgTop)}<div class="cap">${lines(top)}</div></div>
      <div class="p" style="top:${half}px">${bg(imgBottom)}<div class="cap">${lines(bottom)}</div></div>
      <div class="wm" style="top:${half - 34}px;right:30px;font-size:16px;color:rgba(255,255,255,.6)">${HANDLE}</div></div>`,
    `.p{position:absolute;left:0;right:0;height:${half}px;overflow:hidden}
     .p + .p{border-top:3px solid #fff}
     .cap{position:absolute;top:44px;left:60px;right:60px;text-align:center;font-family:'Libre Caslon Text',serif;font-size:50px;line-height:1.15;color:${color};${shadow}}`
  );
}

// FINAL COM IMAGEM: frase de "siga ou nunca mais vai ver" em caixa alta branca.
export function endImage({ text }, img) {
  return page(
    `<div class="s">${bg(img)}
      <div class="shade"></div>
      <div class="box-area" style="bottom:200px">
        <h2 class="t" data-fit data-maxh="420" data-min="44">${lines(text)}</h2>
      </div>
      <div class="wm" style="bottom:52px;right:88px">${HANDLE}</div></div>`,
    `.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.7) 65%,rgba(0,0,0,.92) 100%)}
     .t{font-family:'Montserrat',sans-serif;font-weight:800;font-size:60px;line-height:1.1;text-transform:uppercase;color:#fff;text-shadow:0 3px 16px rgba(0,0,0,.6)}`
  );
}

// FINAL EM PAPEL: letra de mão em papelão (100% HTML, sem imagem).
export function endPaper({ text }) {
  const PAPER =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/><feColorMatrix values='0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .12 0 0 0 .35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
  return page(
    `<div class="s paper"><div class="box-area" style="top:0;bottom:0;justify-content:center;left:120px;right:120px">
       <p class="t" data-fit data-maxh="900" data-min="50">${lines(text)}</p></div></div>`,
    `.paper{background:${PAPER},radial-gradient(120% 90% at 50% 40%,#c9a776 0%,#b8935f 60%,#9c7848 100%)}
     .t{font-family:'Gochi Hand',cursive;font-size:96px;line-height:1.2;color:#2a2219;transform:rotate(-4deg);text-transform:uppercase}`
  );
}
