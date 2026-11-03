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

// CAPA: imagem-isca + título na parte de baixo.
// style: 'sans' (padrão, Montserrat grossa), 'condensed' (Anton, tipo "INDIRETAS BEM DIRETAS..."),
//        'serif' (tipo "Coloque isso no status e suma..."). sub = linha pequena vermelha embaixo.
export function cover({ text, style = 'sans', sub = '' }, img) {
  const len = text.length;
  const base = style === 'condensed' ? 104 : style === 'serif' ? 92 : 82;
  const size = len < 40 ? base : len < 70 ? base - 10 : len < 100 ? base - 20 : base - 28;
  const font = {
    sans: `font-family:'Montserrat',sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-.005em;line-height:1.08`,
    condensed: `font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;line-height:1.02`,
    serif: `font-family:'Libre Caslon Text',serif;font-weight:400;letter-spacing:-.02em;line-height:1.05`,
  }[style];
  return page(
    `<div class="s">${bg(img, 'center 30%')}
      <div class="shade"></div>
      <div class="box-area" style="bottom:${sub ? 128 : 118}px">
        <h1 class="t" data-fit data-maxh="520" data-min="44">${lines(text)}</h1>
        ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
      </div>
      <div class="wm" style="bottom:52px;right:88px">${HANDLE}</div></div>`,
    `.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.65) 63%,rgba(0,0,0,.96) 80%,#000 100%)}
     .t{${font};font-size:${size}px;color:#fff}
     .sub{margin-top:18px;font-family:'Figtree',sans-serif;font-weight:600;font-size:24px;color:#e0262b}`
  );
}

// FRASE CURTA PEQUENA: serifada branca, pequena, no meio-baixo da foto (formato "status/indiretas").
export function small({ text }, img) {
  return page(
    `<div class="s">${bg(img)}<div class="shade"></div>
      <div class="wm" style="top:34px;right:44px;font-size:18px">${HANDLE}</div>
      <div class="box-area" style="top:56%;left:200px;right:200px">
        <p class="t" data-fit data-maxh="380" data-min="26">${lines(text)}</p></div></div>`,
    `.shade{position:absolute;inset:0;background:rgba(0,0,0,.18)}
     .t{font-family:'Libre Caslon Text',serif;font-size:38px;line-height:1.3;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.85),0 0 2px rgba(0,0,0,.8)}`
  );
}

// VERDADE DURA: caixa alta serifada, pequena, embaixo (formato "maturidade para ler isso").
export function truth({ text }, img) {
  return page(
    `<div class="s">${bg(img)}<div class="shade"></div>
      <div class="wm" style="top:34px;right:44px;font-size:18px">${HANDLE}</div>
      <div class="box-area" style="bottom:120px;left:150px;right:150px">
        <p class="t" data-fit data-maxh="380" data-min="26">${lines(text)}</p></div></div>`,
    `.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.55) 75%,rgba(0,0,0,.8) 100%)}
     .t{font-family:'Libre Caslon Text',serif;font-size:36px;line-height:1.25;letter-spacing:.03em;text-transform:uppercase;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.8)}`
  );
}

// DOIS QUADROS COM RÓTULO: "PRESSÃO / FOCO" (labelStyle 'caps') ou "1 hora ruim / Você ainda tem 23" ('sentence').
export function duo({ top, bottom, labelStyle = 'caps' }, imgTop, imgBottom) {
  const half = H / 2;
  const cap = labelStyle === 'caps'
    ? `font-family:'Montserrat',sans-serif;font-weight:800;font-size:30px;letter-spacing:.08em;text-transform:uppercase;top:46%`
    : `font-family:'Figtree',sans-serif;font-weight:600;font-size:40px;top:44%`;
  return page(
    `<div class="s">
      <div class="p" style="top:0">${bg(imgTop)}<div class="cap">${lines(top)}</div></div>
      <div class="p" style="top:${half}px">${bg(imgBottom)}<div class="cap">${lines(bottom)}</div></div>
      <div class="wm" style="top:${half - 32}px;right:30px;font-size:16px">${HANDLE}</div></div>`,
    `.p{position:absolute;left:0;right:0;height:${half}px;overflow:hidden}
     .cap{position:absolute;left:60px;right:60px;text-align:center;color:#fff;${cap};text-shadow:0 2px 12px rgba(0,0,0,.85)}`
  );
}

// ANOS: imagem com 3 versões de um objeto empilhadas + etiquetas de ano (formato "a mediocridade não surge de repente").
export function years({ labels = ['1975', '2000', '2026'] }, img) {
  const tops = [17, 47, 77];
  return page(
    `<div class="s">${bg(img)}
      ${labels.map((y, i) => `<div class="tag" style="top:${tops[i]}%">${esc(y)}</div>`).join('')}
      <div class="wm" style="bottom:30px;right:40px;font-size:18px">${HANDLE}</div></div>`,
    `.tag{position:absolute;left:46px;background:#fff;color:#111;font-family:'Montserrat',sans-serif;font-weight:800;font-size:34px;
       padding:8px 16px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.35)}`
  );
}

// BALÕES DE FALA sobre a imagem: bubbles = [{text, x, y}] em % da tela. title = texto serifado no topo.
export function bubbles({ title = '', bubbles: list = [] }, img) {
  return page(
    `<div class="s">${bg(img)}
      ${title ? `<div class="title">${lines(title)}</div>` : ''}
      ${list.map((b) => `<div class="b" style="left:${b.x}%;top:${b.y}%">${lines(b.text)}</div>`).join('')}
      <div class="wm" style="bottom:30px;right:40px;font-size:18px">${HANDLE}</div></div>`,
    `.title{position:absolute;top:46px;left:70px;right:70px;text-align:center;font-family:'Libre Caslon Text',serif;font-weight:700;font-size:46px;line-height:1.15;color:#1a140c;text-shadow:0 0 22px rgba(255,240,215,.9)}
     .b{position:absolute;transform:translate(-50%,-50%);max-width:420px;background:#fff;color:#111;font-family:'Figtree',sans-serif;font-weight:700;font-size:34px;line-height:1.2;
        padding:18px 26px;border-radius:40px;border:3px solid #111;text-align:center;box-shadow:0 4px 0 #111}`
  );
}

// NOKIA: memo na tela de celular antigo (100% HTML).
export function nokia({ text, title = 'Memo' }) {
  return page(
    `<div class="s phone"><div class="screen">
       <div class="bar"><span>934</span><b>${esc(title)}</b><span>abc</span></div>
       <p class="t" data-fit data-maxh="620" data-min="30">${lines(text)}</p>
       <div class="foot"><span>Opções</span><span>Voltar</span></div></div>
       <div class="wm" style="bottom:30px;right:40px;font-size:18px">${HANDLE}</div></div>`,
    `.phone{background:radial-gradient(90% 70% at 50% 45%,#2b2b2e 0%,#111 70%,#000 100%)}
     .screen{position:absolute;left:110px;right:110px;top:230px;height:860px;border-radius:26px;padding:26px 34px;
       background:linear-gradient(180deg,#bfe4ff 0%,#9fd3f7 100%);box-shadow:inset 0 0 40px rgba(0,40,80,.35),0 0 0 18px #1a1a1a,0 0 0 22px #333;
       font-family:'VT323','Courier New',monospace;color:#0b1f33}
     .bar{display:flex;justify-content:space-between;align-items:center;font-size:30px;border-bottom:3px solid #0b1f33;padding-bottom:8px;margin-bottom:22px}
     .bar b{background:#0b5fa8;color:#fff;padding:2px 22px;border-radius:6px;font-weight:400}
     .t{font-family:'Figtree',sans-serif;font-weight:600;font-size:46px;line-height:1.28}
     .foot{position:absolute;left:34px;right:34px;bottom:20px;display:flex;justify-content:space-between;font-size:34px;font-weight:700;font-family:'Figtree',sans-serif}`
  );
}

// VERSÍCULO: tela escura estilo app de Bíblia com texto destacado (100% HTML).
export function verse({ ref, text }) {
  return page(
    `<div class="s dark"><div class="area">
       <div class="ref">${esc(ref)}</div>
       <p class="t" data-fit data-maxh="760" data-min="30"><span>${lines(text)}</span></p></div>
       <div class="wm" style="bottom:40px;right:44px;font-size:18px">${HANDLE}</div></div>`,
    `.dark{background:#0d0d0e}
     .area{position:absolute;left:90px;right:90px;top:240px}
     .ref{font-family:'Figtree',sans-serif;font-weight:600;font-size:30px;color:#bdbdbd;margin-bottom:34px}
     .t{font-family:'Libre Caslon Text',serif;font-size:48px;line-height:1.55;color:#111}
     .t span{background:#f3f3f3;box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:2px 10px}`
  );
}

// FINAL "SEJA BEM-VINDO": letra de mão em papel cinza (100% HTML).
export function endGrey({ text }) {
  const NOISE =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .4 0 0 0 0 .4 0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
  return page(
    `<div class="s g"><div class="box-area" style="top:0;bottom:0;justify-content:center;left:140px;right:140px">
       <p class="t">${lines(text)}</p></div></div>`,
    `.g{background:${NOISE},radial-gradient(110% 90% at 50% 45%,#dcdcd7 0%,#cfcfca 65%,#bdbdb7 100%)}
     .t{font-family:'Gochi Hand',cursive;font-size:62px;line-height:1.35;color:#232323;text-transform:uppercase;letter-spacing:.02em}`
  );
}

// FINAL "OBRIGADO POR ESTAR AQUI": cartão claro com vinheta (100% HTML).
export function endThanks({ text = 'Obrigado\npor estar\naqui.', sub = 'Se isso te ajudou,\nsiga a página.' }) {
  return page(
    `<div class="s l"><div class="box-area" style="top:0;bottom:0;justify-content:center">
       <h2 class="t">${lines(text)}</h2><p class="sub">${lines(sub)}</p></div></div>`,
    `.l{background:radial-gradient(60% 55% at 50% 45%,#f4f5f7 0%,#d9dce1 55%,#6b7078 100%)}
     .t{font-family:'Libre Caslon Text',serif;font-size:104px;line-height:1.08;color:#141b2a}
     .sub{margin-top:60px;font-family:'Libre Caslon Text',serif;font-size:36px;line-height:1.3;color:#2a3242}`
  );
}

// FINAL PROFESSOR: personagem no quadro-negro + texto de giz (imagem + HTML).
export function endTeacher({ text }, img) {
  return page(
    `<div class="s">${bg(img)}
      <div class="board"><p class="t">${lines(text)}</p></div>
      <div class="wm" style="bottom:30px;right:40px;font-size:18px">${HANDLE}</div></div>`,
    `.board{position:absolute;left:70px;top:70px;width:560px;padding:34px 36px;background:#1f3a2c;border:14px solid #6b4423;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
     .t{font-family:'Gochi Hand',cursive;font-size:50px;line-height:1.2;color:#f1f1e8}`
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
