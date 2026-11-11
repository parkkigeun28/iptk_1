const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [src, out, shots] = process.argv.slice(2);
  const map = JSON.parse(fs.readFileSync(shots + '/map.json', 'utf8'));
  const figs = {};
  for (const [aid, file] of Object.entries(map)) figs[aid] = [[file.replace(/[^a-z0-9_]/g, '_'), null]];
  figs['g0_s1'] = [['login', '로그인 화면']];
  figs['g0_s2'] = [['menu', '상단 모듈에 마우스를 올리면 펼쳐지는 메뉴판'], ['search', 'Ctrl+K 메뉴 검색']];
  figs['g0_s0'] = [['home', '로그인 후 첫 화면(홈)']];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  await p.goto('file://' + src, { waitUntil: 'load' });
  await p.evaluate(({ figs, dir }) => {
    document.querySelectorAll('.hide').forEach(e => e.classList.remove('hide'));
    document.querySelectorAll('button.open').forEach(e => e.remove());
    for (const [aid, list] of Object.entries(figs)) {
      const art = document.getElementById(aid); if (!art) continue;
      const title = art.querySelector('h3').textContent.trim();
      const anchor = art.querySelector('p.intro') || art.querySelector('h3');
      let after = anchor;
      for (const [img, cap] of list) {
        const f = document.createElement('figure'); f.className = 'shot';
        f.innerHTML = `<img src="file://${dir}/img/${img}.jpg"><figcaption>▲ ${cap || '화면: ' + title}</figcaption>`;
        after.after(f); after = f;
      }
    }
    const toc = document.getElementById('toc');
    const cover = document.createElement('section'); cover.className = 'pdfcover';
    let h = `<img class="clogo" src="file://${dir}/../deck/logo_color.png"><div class="ctitle">IPTK MES System<br>사용 매뉴얼</div><div class="csub">메뉴 항목별 화면과 사용 순서</div><div class="cdate">${new Date().toISOString().slice(0,10)}</div><div class="ctoc"><h3>목차</h3>`;
    toc.querySelectorAll('.tgroup').forEach(g => {
      const head = g.querySelector('.thead .tw').textContent, id = g.querySelector('.thead').getAttribute('href');
      h += `<div class="tg"><a href="${id}">${head}</a><div class="ts">`;
      g.querySelectorAll('.tsub').forEach(s => h += `<a href="${s.getAttribute('href')}">${s.textContent.replace('▸','').trim()}</a>`);
      h += '</div></div>';
    });
    cover.innerHTML = h + '</div>';
    const c = document.querySelector('.content'); c.insertBefore(cover, c.firstChild);
    const st = document.createElement('style');
    st.textContent = `*{font-family:"NanumGothic","Nanum Gothic",sans-serif!important}.title,.mtoc,.toc{display:none!important}
      article.scr{page-break-inside:auto!important} article.scr h3,article.scr p.intro{break-after:avoid;page-break-after:avoid}
      figure.shot{margin:10px 0 14px;break-inside:avoid;page-break-inside:avoid}
      figure.shot img{width:100%;border:1px solid #b9c6d2;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
      figure.shot figcaption{font-size:11px;color:#5b6b7a;margin-top:4px;text-align:center}
      .pdfcover{page-break-after:always}.clogo{width:200px;margin:90px 0 30px}
      .ctitle{font-size:36px;font-weight:800;color:#1d3d5e;line-height:1.35}
      .csub{font-size:16px;color:#2b5bb3;margin-top:10px}.cdate{color:#6b7885;margin:8px 0 40px}
      .ctoc{page-break-before:always}.ctoc h3{font-size:20px;border-bottom:2px solid #2f75b5;padding-bottom:6px}
      .tg{margin:10px 0 4px;break-inside:avoid}.tg>a{font-weight:700;color:#1d3d5e;text-decoration:none;font-size:14px}
      .ts{columns:2;margin:4px 0 0 14px}.ts a{display:block;font-size:12px;color:#333;text-decoration:none;line-height:1.7}`;
    document.head.appendChild(st);
  }, { figs, dir: shots });
  await p.waitForLoadState('networkidle'); await p.waitForTimeout(800);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: true, headerTemplate: '<div></div>',
    footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#888">IPTK MES System 사용 매뉴얼 · <span class="pageNumber"></span> / <span class="totalPages"></span></div>' });
  await b.close();
})();
