// IPTK MES 화면 캡처: Supabase 요청은 가짜 응답으로 막고(오프라인), 등록 화면은 MESSAMPLE 예시값을 채운다.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const OUT = process.argv[2];
const BASE = 'http://localhost:8765/';
const map = JSON.parse(fs.readFileSync(OUT + '/map.json', 'utf8'));

async function mock(ctx) {
  await ctx.route(/supabase\.co/, (route) => {
    const u = route.request().url();
    const json = (b, s = 200) => route.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(b) });
    if (u.includes('rpc/my_permissions')) return json([{ role: 'master', name: '관리자', menu_name: null }]);
    if (u.includes('/auth/v1/')) return json({ access_token: 'x', refresh_token: 'x', expires_at: 4102444800, user: { email: 'admin@iptk' } });
    if (u.includes('/storage/v1/')) return json([]);
    return json([]);
  });
  await ctx.route(/ntfy|googleapis|gstatic/, (r) => r.abort());
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ viewport: { width: 1400, height: 820 }, deviceScaleFactor: 1.5, locale: 'ko-KR' });
  await mock(ctx);
  const p = await ctx.newPage();
  const shot = async (name) => p.screenshot({ path: `${OUT}/img/${name}.jpg`, type: 'jpeg', quality: 82 });
  fs.mkdirSync(OUT + '/img', { recursive: true });

  // 1) 로그인 화면
  await p.goto(BASE + 'index.html', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  await shot('login');
  // 2) 로그인 후 홈 · 메뉴 · 검색
  await p.evaluate(() => localStorage.setItem('ipmes.session', JSON.stringify({ access_token: 'x', refresh_token: 'x', expires_at: 4102444800, user: { email: 'admin@iptk' } })));
  await p.goto(BASE + 'index.html', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  await shot('home');
  try {
    const mod = p.locator('text=영업관리').first(); await mod.hover(); await p.waitForTimeout(700); await shot('menu');
  } catch (e) { console.log('menu fail', e.message); }
  try {
    await p.mouse.move(700, 600); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.keyboard.press('Control+K'); await p.waitForTimeout(500); await p.keyboard.type('입고확정'); await p.waitForTimeout(700); await shot('search');
    await p.keyboard.press('Escape');
  } catch (e) { console.log('search fail', e.message); }

  // 3) 메뉴얼 항목별 화면
  const done = {};
  for (const [aid, file] of Object.entries(map)) {
    const key = file.replace(/[^a-z0-9_]/g, '_');
    if (done[key]) continue; done[key] = 1;
    try {
      await p.goto(BASE + file, { waitUntil: 'load', timeout: 20000 }); await p.waitForTimeout(1800);
      const id = file.split('.')[0];
      const filled = await p.evaluate((id) => { try { if (window.MESSAMPLE && MESSAMPLE.has(id)) { MESSAMPLE.fill(id); return true } } catch (e) {} return false }, id);
      if (filled) await p.waitForTimeout(900);
      await p.evaluate(() => document.querySelectorAll('.mesdemo-tip').forEach(e => e.remove()));
      await shot(key);
      console.log('ok', key, filled ? '(예시값)' : '');
    } catch (e) { console.log('FAIL', key, e.message.slice(0, 80)); }
  }
  await b.close();
})();
