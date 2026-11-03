// HTML templates for 1080x1350 carousel slides (@ohomemrespeitado).
export const HANDLE = '@ohomemrespeitado';
export const W = 1080;
export const H = 1350;

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const BASE_CSS = `
  :root{--bg:#0b0b0c;--ink:#f1ece2;--gold:#c8a96a;--muted:#8d877c;--line:rgba(200,169,106,.55)}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;background:var(--bg);overflow:hidden}
  body{font-family:'Cormorant Garamond',Georgia,serif;color:var(--ink);-webkit-font-smoothing:antialiased}
  .slide{position:relative;width:${W}px;height:${H}px;
    background:radial-gradient(120% 90% at 50% 40%,#1a1a1c 0%,#0e0e10 55%,#060607 100%)}
  .slide::after{content:'';position:absolute;inset:0;background-image:${GRAIN};opacity:.07;mix-blend-mode:screen;pointer-events:none}
  .frame{position:absolute;inset:44px;border:1px solid var(--line)}
  .frame::before,.frame::after{content:'';position:absolute;width:22px;height:22px;border-color:var(--gold);border-style:solid}
  .frame::before{top:-6px;left:-6px;border-width:2px 0 0 2px}
  .frame::after{bottom:-6px;right:-6px;border-width:0 2px 2px 0}
  .label{font-family:'Inter',system-ui,sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:.32em;color:var(--gold);font-size:22px}
  .handle{position:absolute;left:0;right:0;bottom:84px;text-align:center;font-family:'Inter',sans-serif;
    font-size:22px;letter-spacing:.18em;color:var(--muted)}
  .content{position:absolute;left:120px;right:120px;top:150px;bottom:190px;display:flex;flex-direction:column;justify-content:center}
`;

const page = (body, extraCss = '') => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@500;600&display=block" rel="stylesheet">
<style>${BASE_CSS}${extraCss}</style></head><body>${body}
<script>
  // Shrink [data-fit] text until its container stops overflowing.
  window.__fit = async () => {
    await document.fonts.ready;
    for (const el of document.querySelectorAll('[data-fit]')) {
      const box = el.closest('.content');
      let size = parseFloat(getComputedStyle(el).fontSize);
      const min = parseFloat(el.dataset.min || 34);
      while (box.scrollHeight > box.clientHeight && size > min) { size -= 2; el.style.fontSize = size + 'px'; }
    }
    return true;
  };
</script></body></html>`;

export function coverSlide(c) {
  const css = `
    .kicker{margin-bottom:46px}
    .title{font-weight:700;font-size:104px;line-height:1.04;letter-spacing:-.01em}
    .rule{width:96px;height:2px;background:var(--gold);margin:56px 0 0}
    .swipe{position:absolute;right:96px;bottom:132px;font-family:'Inter',sans-serif;font-size:22px;letter-spacing:.24em;
      text-transform:uppercase;color:var(--ink);opacity:.85}
    .mark{position:absolute;right:70px;top:40px;font-size:420px;line-height:1;color:var(--gold);opacity:.07;font-weight:700}`;
  return page(
    `<div class="slide"><div class="frame"></div><div class="mark">&ldquo;</div>
      <div class="content">
        <div class="label kicker">${esc(c.kicker)}</div>
        <h1 class="title" data-fit data-min="64">${esc(c.title)}</h1>
        <div class="rule"></div>
      </div>
      <div class="swipe">Arraste &rarr;</div>
      <div class="handle">${HANDLE}</div></div>`,
    css
  );
}

export function quoteSlide(q, i, total) {
  const len = q.text.length;
  const size = len < 60 ? 86 : len < 110 ? 74 : len < 170 ? 62 : 54;
  const css = `
    .num{position:absolute;left:120px;top:122px}
    .open{font-size:190px;line-height:.6;color:var(--gold);font-weight:700;height:84px}
    .quote{font-style:italic;font-weight:600;font-size:${size}px;line-height:1.18}
    .rule{width:72px;height:2px;background:var(--gold);margin:54px 0 30px}
    .author{font-family:'Inter',sans-serif;font-weight:600;font-size:26px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold)}
    .source{margin-top:12px;font-style:italic;font-size:30px;color:var(--muted)}`;
  return page(
    `<div class="slide"><div class="frame"></div>
      <div class="label num">${String(i).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
      <div class="content">
        <div class="open">&ldquo;</div>
        <p class="quote" data-fit data-min="40">${esc(q.text)}</p>
        <div class="rule"></div>
        <div class="author">${esc(q.author)}</div>
        ${q.source ? `<div class="source">${esc(q.source)}</div>` : ''}
      </div>
      <div class="handle">${HANDLE}</div></div>`,
    css
  );
}

export function ctaSlide() {
  const css = `
    .content{align-items:center;text-align:center}
    .big{font-weight:700;font-size:92px;line-height:1.05}
    .rule{width:96px;height:2px;background:var(--gold);margin:56px auto}
    .steps{font-family:'Inter',sans-serif;font-size:30px;line-height:2.1;letter-spacing:.06em;color:var(--ink)}
    .steps b{color:var(--gold);font-weight:600}
    .follow{margin-top:70px;font-family:'Inter',sans-serif;font-weight:600;font-size:34px;letter-spacing:.14em;color:var(--gold)}`;
  return page(
    `<div class="slide"><div class="frame"></div>
      <div class="content">
        <div class="label">O Homem Respeitado</div>
        <div class="rule"></div>
        <h2 class="big" data-fit data-min="60">Se isso te fez pensar, não deixe se perder.</h2>
        <div class="rule"></div>
        <div class="steps"><b>Salve</b> para reler quando precisar<br><b>Envie</b> para um homem que precisa ler<br><b>Siga</b> para mais todos os dias</div>
        <div class="follow">${HANDLE}</div>
      </div></div>`,
    css
  );
}

export function profileHtml() {
  const css = `
    html,body{width:1080px;height:1080px}
    .p{position:relative;width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;
      background:radial-gradient(70% 70% at 50% 45%,#1d1d20 0%,#0b0b0c 70%)}
    .p::after{content:'';position:absolute;inset:0;background-image:${GRAIN};opacity:.08;mix-blend-mode:screen}
    .ring{position:absolute;width:860px;height:860px;border-radius:50%;border:3px solid var(--gold)}
    .ring2{position:absolute;width:820px;height:820px;border-radius:50%;border:1px solid var(--line)}
    .mono{font-weight:700;font-size:430px;line-height:1;color:var(--ink);letter-spacing:-.02em;transform:translateY(-14px)}
    .mono span{color:var(--gold)}`;
  return page(`<div class="p"><div class="ring"></div><div class="ring2"></div><div class="mono">H<span>R</span></div></div>`, css);
}
