// 금형 MES 카탈로그 (A4 2쪽) — 기업 명칭 없음
const path = require('path');
const DECK = path.join(__dirname, '..', 'deck', 'node_modules');
const React = require(DECK + '/react');
const RDS = require(DECK + '/react-dom/server');
const md = require(DECK + '/react-icons/md');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const OUT = process.argv[2];

const I = (n, c = '#fff', s = 26) => RDS.renderToStaticMarkup(React.createElement(md[n], { color: c, size: String(s) }));

const pains = [
  ['MdOutlineFolderOff', '기록이 흩어져 있다', '수주는 엑셀, 발주는 메신저, 실적은 수기 장부. 금형 한 벌의 이력을 모으려면 여러 사람에게 물어야 합니다.'],
  ['MdOutlineMoneyOff', '금형별 실제 원가를 모른다', '재료비·외주가공비·사내 노무비가 따로 관리되어, 납품 후에도 그 금형이 남았는지 손해였는지 알기 어렵습니다.'],
  ['MdOutlineVisibilityOff', '진행 상황이 보이지 않는다', '부품이 어느 협력업체에 나가 있는지, 어느 공정에서 멈췄는지 확인하려면 전화를 돌려야 합니다.'],
  ['MdOutlineAlarmOff', '납기 지연을 늦게 안다', '계획 대비 지연이 누적되어도 조립·T/O 직전에야 드러나 대응할 시간이 없습니다.'],
];
const steps = [
  ['MdOutlineEventNote', '계획', '수주 등록 · 제작계획 · PartList'],
  ['MdOutlinePrecisionManufacturing', '실행 기록', '발주 → 입고 → 입고확정 · 설계/가공/조립/검사 실적'],
  ['MdOutlineAutoGraph', '자동 집계', '금형 원가 · 진척 현황 · 업체별 정산'],
];
const mods = [
  ['MdOutlineRequestQuote', '영업관리', '수주 등록, 제작계획(요구·목표·가능 일정), 설계·조립 외주 발주와 진척률 입고'],
  ['MdOutlineDesignServices', '설계관리', '설계 작업시간 실적, 원재료·구매품 PartList(엑셀 파일 그대로 불러오기)'],
  ['MdOutlineShoppingCart', '구매관리', '원재료·구매품 발주 → 입고 → 입고확정, 발주서 메일 자동 작성'],
  ['MdOutlineHandyman', '가공·조립', '부품 × 공정 격자에서 외주 발주와 사내 가공시간 등록, 조립·검사 실적'],
  ['MdOutlineCalculate', '원가관리', '금형별 재료비·가공비·공통비 자동 집계, 업체별 가공비, 매입·매출'],
  ['MdOutlineSettings', '기준정보', '업체·공정·작업단가, 사용자별 메뉴 권한, 알림, 오류 로그'],
];
const effects = [
  ['MdOutlinePaid', '원가가 보입니다', '입고확정·실적만 쌓이면 금형별 총원가가 자동으로 계산되어, 견적과 실적을 비교할 수 있습니다.'],
  ['MdOutlineSchedule', '납기를 지킵니다', '목표 대비 늦어지는 공정이 노랗게 표시되고 알림이 와서, 지연을 미리 잡습니다.'],
  ['MdOutlineHub', '부서가 같은 정보를 봅니다', '영업·설계·구매·현장이 같은 관리번호로 같은 화면을 보며 일합니다.'],
  ['MdOutlineTaskAlt', '업무가 표준화됩니다', '입력 순서와 담당 화면이 정해져 있어 사람이 바뀌어도 업무가 이어집니다.'],
];
const feats = [
  ['MdOutlineLanguage', '웹 기반 · 설치 불필요', 'PC·태블릿 브라우저로 접속'],
  ['MdQrCode2', '현장 QR', '휴대폰으로 읽어 작업완료 등록'],
  ['MdNotificationsNone', '모바일 알림', 'QR 완료·계획 지연 푸시'],
  ['MdOutlineTableView', '엑셀 연계', '붙여넣기·불러오기·내보내기'],
  ['MdOutlineLock', '권한 관리', '사용자별 조회/저장/수정/삭제'],
  ['MdOutlineMenuBook', '내장 매뉴얼', '화면별 사용 순서 안내'],
];

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0;font-family:"NanumGothic","Nanum Gothic",sans-serif}
:root{--navy:#14213D;--blue:#2B5BB3;--sky:#00AEEF;--ink:#1F2937;--muted:#5B6B7A;--tint:#EEF3FB;--line:#D5DEEA}
body{color:var(--ink)}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:#fff}
.page:last-child{page-break-after:auto}
.hero{background:var(--navy);color:#fff;padding:13mm 16mm 9mm}
.tag{display:inline-block;font-size:10pt;color:var(--sky);border:1px solid rgba(0,174,239,.5);border-radius:20px;padding:3px 12px;margin-bottom:5mm;letter-spacing:.5px}
.hero h1{font-size:25pt;line-height:1.3;font-weight:800}
.hero h1 em{font-style:normal;color:var(--sky)}
.hero p{font-size:11.5pt;color:#C9D6EA;margin-top:5mm;line-height:1.6;max-width:160mm}
.sec{padding:0 16mm}
h2{font-size:15pt;color:var(--navy);font-weight:800;margin:6.5mm 0 1.5mm}
.lead{font-size:10pt;color:var(--muted);margin-bottom:4mm}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm}
.card{background:var(--tint);border-radius:3mm;padding:3.5mm 4.5mm;display:flex;gap:4mm;align-items:flex-start}
.ic{flex:none;width:11mm;height:11mm;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center}
.ic.sky{background:var(--sky)}.ic.warn{background:#C2410C}
.card h3{font-size:11.5pt;color:var(--navy);margin-bottom:1.2mm}
.card p{font-size:9.3pt;line-height:1.55;color:var(--ink)}
.flow{display:flex;align-items:stretch;gap:3mm}
.step{flex:1;border:1.4px solid var(--blue);border-radius:3mm;padding:4mm 4.5mm;display:flex;gap:3mm;align-items:center}
.step.last{background:var(--navy);border-color:var(--navy)}
.step b{display:block;font-size:12pt;color:var(--blue)}.step.last b{color:var(--sky)}
.step span{font-size:9pt;color:var(--ink);line-height:1.45}.step.last span{color:#DCE6F5}
.arrow{align-self:center;color:var(--sky);font-size:16pt;font-weight:800}
.key{margin-top:4mm;background:#FFF4E0;border-radius:3mm;padding:3.5mm 5mm;font-size:10pt;line-height:1.55}
.key b{color:#B45309}
.shot{margin-top:4mm}
.shot img{width:100%;border:1px solid var(--line);border-radius:2mm}
.shot figcaption{font-size:8.5pt;color:var(--muted);margin-top:1.5mm}
.id{display:flex;gap:6mm;align-items:center;margin-top:3mm}
.id>div{flex:none}.id .no{white-space:nowrap;margin-bottom:2mm;font-size:20pt;font-weight:800;color:var(--blue);letter-spacing:.5px}
.id .subs span{display:inline-block;border:1.2px solid var(--blue);border-radius:2mm;padding:1.5mm 3mm;font-size:9.5pt;font-weight:700;color:var(--navy);margin-right:2mm}
.id p{font-size:9.3pt;color:var(--muted);line-height:1.5}
.mod{background:var(--tint);border-radius:3mm;padding:4.5mm}
.mod .hd{display:flex;align-items:center;gap:3mm;margin-bottom:2mm}
.mod h3{font-size:12pt;color:var(--navy)}
.mod p{font-size:9pt;line-height:1.55}
.eff{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.eff .card{background:#fff;border:1px solid var(--line)}
.feat{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}
.f{display:flex;gap:3mm;align-items:center;padding:3mm 0}
.f b{display:block;font-size:10.5pt;color:var(--navy)}.f span{font-size:8.8pt;color:var(--muted)}
.band{position:absolute;left:0;right:0;bottom:0;background:var(--navy);color:#fff;padding:7mm 16mm;display:flex;align-items:center;gap:8mm}
.band .t{font-size:13pt;font-weight:800;flex:none}
.band ol{list-style:none;display:flex;gap:3mm;flex:1}
.band li{flex:1;font-size:9pt;color:#DCE6F5;line-height:1.4;border-left:2px solid var(--sky);padding-left:2.5mm}
.band li b{display:block;color:var(--sky);font-size:9.5pt}
.pno{position:absolute;right:16mm;top:8mm;font-size:8pt;color:#9FB3CC}
</style></head><body>

<section class="page">
  <div class="hero"><span class="pno">1 / 2</span>
    <span class="tag">금형 제조 기업을 위한 MES</span>
    <h1>금형 한 벌의 수주부터 납품까지,<br><em>기록은 한 번, 원가와 진척은 자동으로</em></h1>
    <p>엑셀과 메신저, 수기 장부에 흩어진 금형 제작 기록을 하나의 관리번호로 묶습니다. 현장이 입력한 기록에서 금형별 실제 원가와 진행 상황이 자동으로 나옵니다.</p>
  </div>
  <div class="sec">
    <h2>왜 MES가 필요한가</h2>
    <p class="lead">다품종 단품 생산인 금형 제조는 한 벌마다 설계·가공·외주·조립 경로가 달라, 기록이 흩어지기 쉽습니다.</p>
    <div class="grid2">${pains.map(([i, h, p]) => `<div class="card"><div class="ic warn">${I(i)}</div><div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}</div>

    <h2>해결 방식 — 하나의 관리번호로 묶는다</h2>
    <div class="id">
      <div><div class="no">관리번호 26-057</div><div class="subs"><span>26-057A</span><span>26-057B</span><span>26-057C</span></div></div>
      <p>금형 한 벌에 관리번호 하나를 붙이고, 공정 수만큼 하위 번호를 자동으로 만듭니다.<br>수주·설계·발주·실적·원가의 모든 화면이 이 번호로 이어집니다.</p>
    </div>
    <div class="flow" style="margin-top:4mm">${steps.map(([i, h, p], k) => `${k ? '<div class="arrow">→</div>' : ''}<div class="step${k === 2 ? ' last' : ''}"><div class="ic${k === 2 ? ' sky' : ''}">${I(i)}</div><div><b>${h}</b><span>${p}</span></div></div>`).join('')}</div>
    <div class="key"><b>핵심 원칙</b> — 입고확정된 금액과 등록된 작업시간만 원가에 들어갑니다. 현장이 기록을 남기면, 집계는 시스템이 합니다.</div>
    <figure class="shot"><img src="file://${__dirname}/event.jpg"><figcaption>▲ 제작계획 화면 — 접수·설계·가공·조립·초품·완료 6단계를 요구/목표/가능 일정으로 관리하고, 목표보다 늦으면 노랗게 표시합니다.</figcaption></figure>
  </div>
</section>

<section class="page">
  <div class="sec" style="padding-top:12mm"><span class="pno">2 / 2</span>
    <h2 style="margin-top:0">주요 기능</h2>
    <p class="lead">영업부터 원가까지 6개 업무 모듈이 하나의 데이터로 연결됩니다.</p>
    <div class="grid3">${mods.map(([i, h, p], k) => `<div class="mod"><div class="hd"><div class="ic${k % 2 ? ' sky' : ''}">${I(i, '#fff', 24)}</div><h3>${h}</h3></div><p>${p}</p></div>`).join('')}</div>

    <h2>도입 효과</h2>
    <div class="eff">${effects.map(([i, h, p]) => `<div class="card"><div class="ic">${I(i)}</div><div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}</div>

    <h2>시스템 특징</h2>
    <div class="feat">${feats.map(([i, h, p], k) => `<div class="f"><div class="ic${k % 2 ? '' : ' sky'}">${I(i, '#fff', 22)}</div><div><b>${h}</b><span>${p}</span></div></div>`).join('')}</div>

    <h2>현장과 사무실을 잇는 QR</h2>
    <div class="card" style="background:#fff;border:1px solid var(--line)"><div class="ic sky">${I('MdQrCode2')}</div><div><p style="font-size:9.8pt">부품 그림 위에 가공 순서를 표시한 도면에 QR을 인쇄해 부품에 붙입니다. 현장 작업자와 협력업체가 휴대폰으로 QR을 읽어 작업완료를 등록하면, 외주 공정은 입고로, 사내 공정은 가공 실적으로 바로 반영되고 담당자에게 알림이 갑니다.</p></div></div>
  </div>
  <div class="band"><div class="t">도입 절차</div><ol>
    <li><b>1. 기준정보</b>업체·공정·작업단가 등록</li>
    <li><b>2. 진행 금형 등록</b>수주·계획·PartList 입력</li>
    <li><b>3. 역할별 교육</b>본인 담당 화면 3~5개</li>
    <li><b>4. 월 마감 적용</b>원가·정산 보고서 활용</li>
  </ol></div>
</section>
</body></html>`;

(async () => {
  const fs = require('fs');
  fs.writeFileSync(path.join(__dirname, 'catalog.html'), html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'catalog.html'), { waitUntil: 'load' });
  await p.pdf({ path: OUT, format: 'A4', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await b.close();
})();
