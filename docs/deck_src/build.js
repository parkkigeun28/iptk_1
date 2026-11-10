const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const path = require("path");
const md = require("react-icons/md");
const { applyTheme } = require("/root/.claude/skills/synced/9825ed86-b83f-4dfc-bd4a-35db26a5e8a0_a85036a8-713d-4c8a-add8-7b48cae1a83e/pptx/scripts/apply_theme.js");

const OUT = process.argv[2] || "IPTK_MES_소개.pptx";
const HEX = { navy: "14213D", blue: "2B5BB3", sky: "00AEEF", ink: "1F2937", muted: "5B6B7A", tint: "EEF3FB", line: "D5DEEA", white: "FFFFFF", amber: "F59E0B" };
const THEME = {
  name: "IPTK MES",
  headFontFace: "Malgun Gothic", bodyFontFace: "Malgun Gothic",
  colors: { dk1: HEX.ink, lt1: HEX.white, dk2: HEX.navy, lt2: HEX.tint,
    accent1: HEX.blue, accent2: HEX.sky, accent3: HEX.amber, accent4: "16A34A", accent5: "7C3AED", accent6: "DC2626",
    hlink: HEX.blue, folHlink: "6B7280" },
};

async function icon(name, color, size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(md[name], { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "IPTK MES 시스템 소개";
  pres.author = "IPTK";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333, M = 0.6;
  const LOGO_C = path.join(__dirname, "logo_color.png");
  const LOGO_W = path.join(__dirname, "logo_white.png");
  const logoH = 0.34, logoW = logoH * 1628 / 565;

  pres.defineSlideMaster({
    title: "TITLE_DARK", background: { color: HEX.navy },
    objects: [
      { image: { path: LOGO_W, x: M, y: 0.55, w: logoW * 1.6, h: logoH * 1.6 } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 2.5, w: 11.5, h: 1.5, fontSize: 44, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 4.1, w: 11.5, h: 1.2, fontSize: 20, color: "C9D6EA", valign: "top", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "SECTION_DARK", background: { color: HEX.navy },
    objects: [
      { image: { path: LOGO_W, x: W - M - logoW, y: 6.75, w: logoW, h: logoH } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 2.9, w: 11, h: 1.0, fontSize: 40, bold: true, color: C.background1, align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 3.95, w: 11, h: 0.8, fontSize: 18, color: "9FC3E8", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: M, y: 6.8, w: 1, h: 0.3, fontSize: 10, color: "9FC3E8" },
  });
  pres.defineSlideMaster({
    title: "CONTENT", background: { color: HEX.white },
    margin: [0.6, 0.6, 0.8, 0.6],
    objects: [
      { image: { path: LOGO_C, x: W - M - logoW, y: 6.85, w: logoW, h: logoH } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.45, w: 12.1, h: 0.75, fontSize: 30, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: M, y: 6.88, w: 1, h: 0.3, fontSize: 10, color: HEX.muted },
  });

  const ic = {};
  for (const [k, n, col] of [
    ["sales", "MdOutlineRequestQuote", HEX.white], ["design", "MdOutlineDesignServices", HEX.white], ["buy", "MdOutlineShoppingCart", HEX.white],
    ["build", "MdOutlineHandyman", HEX.white], ["cost", "MdOutlineCalculate", HEX.white], ["base", "MdOutlineSettings", HEX.white],
    ["board", "MdOutlineForum", HEX.white], ["plan", "MdOutlineEventNote", HEX.white], ["make", "MdOutlinePrecisionManufacturing", HEX.white],
    ["auto", "MdOutlineAutoGraph", HEX.white], ["qr", "MdQrCode2", HEX.white], ["bell", "MdNotificationsNone", HEX.white],
    ["user", "MdOutlineManageAccounts", HEX.white], ["log", "MdOutlineBugReport", HEX.white], ["day", "MdOutlineWbSunny", HEX.white],
    ["week", "MdOutlineDateRange", HEX.white], ["month", "MdOutlineEventAvailable", HEX.white], ["search", "MdSearch", HEX.white],
    ["tab", "MdOutlineTab", HEX.white], ["lock", "MdLockOutline", HEX.white], ["input", "MdOutlineEditNote", HEX.white],
    ["check", "MdCheckCircleOutline", HEX.blue], ["warn", "MdWarningAmber", HEX.amber], ["arrow", "MdArrowForward", HEX.sky],
  ]) ic[k] = await icon(n, col);

  const T = (s, txt, o) => s.addText(txt, { isTextBox: true, fontFace: "Malgun Gothic", ...o });
  const circleIcon = (s, key, x, y, d, fill = HEX.blue, name) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: (name || key) + " circle" });
    s.addImage({ data: ic[key], x: x + d * 0.2, y: y + d * 0.2, w: d * 0.6, h: d * 0.6, altText: name || key });
  };
  const card = (s, x, y, w, h, name, fill = HEX.tint) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill }, objectName: name });
  const content = (title, section) => { const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section }); s.addText(title, { placeholder: "title" }); return s; };
  const bullets = (items, size = 15) => items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 6, fontSize: size } }));

  // ───────── 1. 표지
  pres.addSection({ title: "소개" });
  let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "소개" });
  s.addText("IPTK MES 시스템 소개", { placeholder: "title" });
  s.addText("금형 한 벌이 수주에서 납품까지 가는 모든 기록을 관리제번 하나로", { placeholder: "body" });
  T(s, "사용메뉴얼 기준 상세 설명서", { x: M, y: 6.6, w: 6, h: 0.4, fontSize: 14, color: "9FC3E8", margin: 0 });
  s.addNotes("IPTK MES 소개 자료입니다. 사용메뉴얼의 내용을 기준으로 시스템의 목적, 업무 흐름, 모듈별 기능, 운영 방법을 설명합니다.");

  // ───────── 2. 무엇을 하는가
  s = content("기록을 남기면 원가와 진척이 자동으로 나옵니다", "소개");
  T(s, "목적은 기록 자체가 아니라, 그 기록에서 관리제번별 실제 원가(금형원가내역)와 진척(수주진척현황)이 자동으로 나오게 하는 것입니다.",
    { x: M, y: 1.35, w: 12.1, h: 0.7, fontSize: 16, color: HEX.muted, margin: 0 });
  const steps = [
    ["plan", "① 계획을 세운다", "수주등록(개발유형 체크)\n→ 제작계획등록\n→ PartList 등록"],
    ["make", "② 실제로 만든다", "설계외주·SET외주 발주, 원재료·구매품·사내외가공 발주\n→ 입고 → 입고확정\n설계·조립·검사 실적"],
    ["auto", "③ 결과가 나온다", "금형원가내역 · 매입현황\n업체별 가공비 · 수주진척현황\n이 입력한 기록에서 자동 집계"],
  ];
  const cw = 3.75, cg = 0.425;
  steps.forEach(([k, h, b], i) => {
    const x = M + i * (cw + cg), y = 2.35;
    card(s, x, y, cw, 3.3, "단계 카드 " + (i + 1), i === 2 ? HEX.navy : HEX.tint);
    circleIcon(s, k, x + 0.3, y + 0.3, 0.75, i === 2 ? HEX.sky : HEX.blue, h);
    T(s, h, { x: x + 0.3, y: y + 1.2, w: cw - 0.6, h: 0.5, fontSize: 19, bold: true, color: i === 2 ? HEX.white : HEX.navy, margin: 0 });
    T(s, b, { x: x + 0.3, y: y + 1.75, w: cw - 0.6, h: 1.4, fontSize: 14, color: i === 2 ? "DCE6F5" : HEX.ink, margin: 0, valign: "top" });
    if (i < 2) s.addImage({ data: ic.arrow, x: x + cw + 0.05, y: y + 1.4, w: 0.32, h: 0.32, altText: "다음 단계" });
  });
  card(s, M, 5.95, 12.1, 0.65, "핵심 메시지", "FFF4E0");
  s.addImage({ data: ic.warn, x: M + 0.2, y: 6.07, w: 0.4, h: 0.4, altText: "주의" });
  T(s, [{ text: "②를 빠뜨리면 ③이 조용히 틀어집니다. ", options: { bold: true } }, { text: "그래서 「입고확정」과 「실적등록」이 가장 중요합니다." }],
    { x: M + 0.75, y: 5.95, w: 11.2, h: 0.65, fontSize: 15, color: HEX.ink, margin: 0, valign: "middle" });

  // ───────── 3. 관리제번
  s = content("모든 기록은 관리제번 하나로 묶입니다", "소개");
  card(s, M, 1.5, 5.6, 4.9, "관리제번 구조", HEX.tint);
  T(s, "관리제번", { x: M + 0.4, y: 1.75, w: 4.8, h: 0.4, fontSize: 15, color: HEX.muted, margin: 0 });
  T(s, "26DSA057", { x: M + 0.4, y: 2.15, w: 4.8, h: 0.9, fontSize: 48, bold: true, color: HEX.blue, margin: 0 });
  T(s, "금형 한 벌의 번호 — 수주·원가·진척이 이 번호로 묶입니다", { x: M + 0.4, y: 3.05, w: 4.8, h: 0.6, fontSize: 14, color: HEX.ink, margin: 0 });
  ["A", "B", "C"].forEach((g, i) => {
    const x = M + 0.4 + i * 1.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.0, w: 1.4, h: 0.9, rectRadius: 0.08, fill: { color: HEX.white }, line: { color: HEX.blue, width: 1.5 }, objectName: "공정 제번 " + g });
    T(s, "26DSA057" + g, { x, y: 4.0, w: 1.4, h: 0.9, fontSize: 13, bold: true, color: HEX.navy, align: "center", valign: "middle", margin: 0 });
  });
  T(s, "공정 제번: 수주등록의 공정수만큼 A~F가 자동 생성", { x: M + 0.4, y: 5.1, w: 4.8, h: 0.9, fontSize: 13, color: HEX.muted, margin: 0, valign: "top" });
  const terms = [
    ["관리제번", "금형 한 벌의 번호. 모든 화면이 이 번호(와 공정 제번)로 이어집니다."],
    ["입고확정", "입고 = 물건이 들어옴, 입고확정 = 금액을 확정함.\n확정된 금액만 원가에 들어갑니다."],
    ["실적", "작업자가 실제 투입한 작업시간(분).\n작업단가와 곱해 사내 노무비가 됩니다."],
  ];
  T(s, "처음 쓰는 분은 이 세 가지만 확실히 알면 됩니다", { x: 6.7, y: 1.5, w: 6, h: 0.45, fontSize: 16, bold: true, color: HEX.navy, margin: 0 });
  terms.forEach(([h, b], i) => {
    const y = 2.15 + i * 1.45;
    s.addImage({ data: ic.check, x: 6.7, y: y + 0.05, w: 0.42, h: 0.42, altText: h });
    T(s, h, { x: 7.3, y, w: 5.4, h: 0.45, fontSize: 18, bold: true, color: HEX.blue, margin: 0 });
    T(s, b, { x: 7.3, y: y + 0.48, w: 5.4, h: 0.85, fontSize: 14, color: HEX.ink, margin: 0, valign: "top" });
  });

  // ───────── 4. 시스템 구성
  s = content("6개 업무 모듈과 게시판으로 구성됩니다", "소개");
  const mods = [
    ["sales", "영업관리", "수주 · 제작계획 · 설계외주 · SET외주", "12개 화면"],
    ["design", "설계관리", "설계실적 · PartList(원재료·구매품)", "6개 화면"],
    ["buy", "생산구매관리", "발주 → 입고 → 입고확정 · 사내외가공", "15개 화면"],
    ["build", "조립관리", "조립실적 · 검사실적", "4개 화면"],
    ["cost", "원가관리", "금형원가내역 · 경비 · 매입/매출 · 재고", "7개 화면"],
    ["base", "기준정보", "업체 · 사용자 권한 · 공정 · 단가 · 알림", "20여 개 화면"],
  ];
  const gw = 3.8, gh = 2.2, gx = 0.35, gy = 0.35;
  mods.forEach(([k, h, b, n], i) => {
    const x = M + (i % 3) * (gw + gx), y = 1.5 + Math.floor(i / 3) * (gh + gy);
    card(s, x, y, gw, gh, h + " 카드");
    circleIcon(s, k, x + 0.3, y + 0.3, 0.7, HEX.blue, h);
    T(s, h, { x: x + 1.15, y: y + 0.3, w: gw - 1.4, h: 0.4, fontSize: 19, bold: true, color: HEX.navy, margin: 0 });
    T(s, n, { x: x + 1.15, y: y + 0.7, w: gw - 1.4, h: 0.3, fontSize: 12, color: HEX.blue, margin: 0 });
    T(s, b, { x: x + 0.3, y: y + 1.2, w: gw - 0.6, h: 0.8, fontSize: 14, color: HEX.ink, margin: 0, valign: "top" });
  });
  T(s, "＋ 게시판·조직도(수정요청게시판, 조직도) · 사용메뉴얼 — 상단 메뉴에서 바로 엽니다", { x: M, y: 6.25, w: 11.5, h: 0.4, fontSize: 13, color: HEX.muted, margin: 0 });

  // ───────── 5. 화면 사용법 공통
  s = content("어느 화면이든 같은 방식으로 씁니다", "소개");
  const howto = [
    ["lock", "로그인과 권한", "이름(또는 아이디) + 비밀번호로 로그인. 권한이 있는 메뉴만 보이며, 세션은 자동 연장됩니다."],
    ["tab", "화면 이동 · 탭", "상단 모듈 → 업무 묶음 → 화면 순서로 열고, 열린 화면은 탭으로 쌓입니다. ⌂ 홈에 바로가기·공지."],
    ["search", "Ctrl+K 메뉴 검색", "화면 이름을 쳐서 바로 엽니다. 🔔 알림, ✎ 수정요청 버튼도 상단에 있습니다."],
    ["input", "입력 화면 공통 규칙", "[…] 조회 팝업으로 코드 입력, 행 클릭 = 수정, [＋ 신규], [▣ 저장], [✖ 삭제]. 엑셀 붙여넣기로 대량 입력."],
  ];
  howto.forEach(([k, h, b], i) => {
    const x = M + (i % 2) * 6.15, y = 1.55 + Math.floor(i / 2) * 2.45;
    circleIcon(s, k, x, y, 0.8, i % 2 ? HEX.sky : HEX.blue, h);
    T(s, h, { x: x + 1.05, y: y + 0.02, w: 4.85, h: 0.45, fontSize: 19, bold: true, color: HEX.navy, margin: 0 });
    T(s, b, { x: x + 1.05, y: y + 0.52, w: 4.85, h: 1.4, fontSize: 14, color: HEX.ink, margin: 0, valign: "top" });
  });
  T(s, "저장 결과는 항상 화면 하단 메시지줄과 「저장됨」 팝업으로 확인합니다. 화면이 이상하면 Ctrl+F5로 새로고침하세요.",
    { x: M, y: 6.3, w: 11.8, h: 0.4, fontSize: 13, color: HEX.muted, margin: 0 });

  // ───────── 업무 흐름 섹션
  pres.addSection({ title: "업무 흐름" });
  s = pres.addSlide({ masterName: "SECTION_DARK", sectionTitle: "업무 흐름" });
  s.addText("업무 흐름", { placeholder: "title" });
  s.addText("무엇이 무엇으로 이어지는가", { placeholder: "body" });

  // ───────── 6. 표준 경로
  s = content("신규 수주 1건이 납품까지 가는 표준 경로", "업무 흐름");
  const flow = [
    ["기준정보", "업체·공정·작업단가 먼저 등록"],
    ["수주등록", "관리제번·공정수, 개발유형 체크"],
    ["제작계획등록", "요구/목표/가능 일정·목표원가"],
    ["외주 발주", "외주설계 → 설계외주, 사외조립 → SET외주"],
    ["PartList 등록", "원재료·구매품 소요 (엑셀 불러오기)"],
    ["입고확정", "발주 → 입고 → 확정, 단가·네고율로 확정가"],
    ["사내외가공 발주", "외주=발주·입고, 사내=가공시간"],
    ["실적등록", "설계·조립·검사 작업시간(분) = 노무비 근거"],
    ["금형원가내역", "재료비·가공비·공통비 자동 집계"],
  ];
  const fw = 2.2, fh = 1.95, fgx = 0.27;
  flow.forEach(([h, b], i) => {
    const row = i < 5 ? 0 : 1, col = row ? i - 5 : i;
    const x = M + col * (fw + fgx) + (row ? (fw + fgx) / 2 : 0), y = 1.5 + row * (fh + 0.45);
    const last = i === flow.length - 1;
    card(s, x, y, fw, fh, "단계 " + (i + 1), last ? HEX.navy : HEX.tint);
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.2, w: 0.5, h: 0.5, fill: { color: last ? HEX.sky : HEX.blue }, line: { color: last ? HEX.sky : HEX.blue }, objectName: "번호 " + (i + 1) });
    T(s, String(i + 1), { x: x + 0.2, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 15, bold: true, color: HEX.white, align: "center", valign: "middle", margin: 0 });
    T(s, h, { x: x + 0.2, y: y + 0.8, w: fw - 0.4, h: 0.45, fontSize: 15, bold: true, color: last ? HEX.white : HEX.navy, margin: 0, fit: "shrink" });
    T(s, b, { x: x + 0.2, y: y + 1.25, w: fw - 0.35, h: 0.65, fontSize: 12, color: last ? "DCE6F5" : HEX.ink, margin: 0, valign: "top" });
  });
  T(s, "진행 상황은 수주진척현황 한 화면에서 봅니다 — 카드마다 「다음 조치」와 바로가기 버튼이 있습니다.",
    { x: M, y: 6.3, w: 11.8, h: 0.4, fontSize: 13, color: HEX.muted, margin: 0 });

  // ───────── 7. 역할별 담당 화면
  s = content("역할별로 본인 줄의 화면만 챙기면 됩니다", "업무 흐름");
  const hdr = (t) => ({ text: t, options: { bold: true, color: HEX.white, fill: { color: HEX.navy }, fontSize: 13 } });
  const rows = [
    ["영업", "수주등록 · 수주현황 · 수주진척현황", "개발유형 미체크 → 외주 발주 목록에 제번이 안 나옴"],
    ["설계", "설계실적등록 · PartList 등록", "작업시간 미입력 → 사내 설계비 0원"],
    ["구매", "원재료·구매품 발주 → 입고 → 입고확정 · 사내외가공 발주", "입고확정 누락 → 그 금액이 원가에서 통째로 빠짐"],
    ["가공·조립", "사내외가공(사내 칸) · 조립실적 · 검사실적", "실적 미입력 → 노무비·진척이 안 잡힘"],
    ["원가·관리", "금형원가내역 · 매입현황", "월 마감 전 미확정 입고 → 원가가 실제와 달라짐"],
    ["관리자", "사용자정보 · 에러로그 · 수정요청게시판", "기준정보가 비면 다른 화면 목록이 비어 입력 불가"],
  ];
  s.addTable([[hdr("역할"), hdr("매일 여는 화면"), hdr("빠뜨리면 생기는 일")],
    ...rows.map((r, i) => r.map((c, j) => ({ text: c, options: { fontSize: 13, bold: j === 0, color: j === 2 ? "B45309" : HEX.ink, fill: { color: i % 2 ? HEX.white : HEX.tint } } })))],
    { x: M, y: 1.5, w: 12.1, colW: [1.6, 5.3, 5.2], rowH: 0.62, border: { type: "solid", pt: 0.5, color: HEX.line }, fontFace: "Malgun Gothic", valign: "middle", margin: [0.05, 0.12, 0.05, 0.12] });
  T(s, "필요한 메뉴가 안 보이면 권한 문제입니다 — 관리자가 기준정보 › 사용자정보에서 부여합니다.", { x: M, y: 6.25, w: 11.8, h: 0.4, fontSize: 13, color: HEX.muted, margin: 0 });

  // ───────── 모듈 상세 섹션
  pres.addSection({ title: "모듈별 기능" });
  s = pres.addSlide({ masterName: "SECTION_DARK", sectionTitle: "모듈별 기능" });
  s.addText("모듈별 주요 기능", { placeholder: "title" });
  s.addText("영업 · 설계 · 구매 · 조립 · 원가 · 기준정보", { placeholder: "body" });

  // ───────── 8. 영업관리
  s = content("영업관리 — 수주가 모든 화면의 출발점입니다", "모듈별 기능");
  const salesCols = [
    ["수주등록", ["관리제번 + 공정수 → A·B·C 공정 제번 자동 생성", "개발유형 4종 체크 — 외주 발주 화면의 필터", "고객사·양산처·설계업체, 견적가·수주가, 첨부파일(50MB)"]],
    ["제작계획등록", ["접수·설계·가공·조립·초품·완료 6단계 × 요구/목표/가능 3줄", "가능 > 목표면 노랑, 앞당기면 연두 — 엑셀 방식 그대로", "마우스 휠로 날짜 이동, 구성비 → 목표가·이익률 자동"]],
    ["수주진척현황", ["관리제번마다 카드 1장: 수주 → … → 납품 진행", "「다음 조치」 버튼으로 담당별 모아 보기, ⚠지연 표시", "카드의 ↗ 버튼으로 다음 조치 화면 바로 열기"]],
  ];
  salesCols.forEach(([h, items], i) => {
    const x = M + i * (cw + cg), y = 1.5;
    card(s, x, y, cw, 3.4, h);
    T(s, h, { x: x + 0.3, y: y + 0.25, w: cw - 0.6, h: 0.5, fontSize: 20, bold: true, color: HEX.blue, margin: 0 });
    T(s, bullets(items, 14), { x: x + 0.3, y: y + 0.9, w: cw - 0.5, h: 2.4, color: HEX.ink, margin: 0, valign: "top" });
  });
  T(s, "설계외주·SET외주는 관리제번 단위로 발주 → 진척률(%)로 입고 → 100%가 되면 자동 입고확정, 금형원가 공통비에 반영",
    { x: M, y: 5.2, w: 12.1, h: 0.5, fontSize: 14, color: HEX.muted, margin: 0 });

  // ───────── 9. 설계관리
  s = content("설계관리 — 설계 시간과 부품 소요를 기록합니다", "모듈별 기능");
  card(s, M, 1.5, 5.9, 4.9, "설계실적 카드");
  circleIcon(s, "design", M + 0.3, 1.8, 0.7, HEX.blue, "설계실적");
  T(s, "설계실적등록", { x: M + 1.2, y: 1.85, w: 4.4, h: 0.55, fontSize: 20, bold: true, color: HEX.navy, margin: 0 });
  T(s, bullets(["행 = 제번의 PartList 부품 + ★ 금형 전체, 칸 = 설계 공정", "칸 우클릭 → 설계자·인원·시간(분) 입력, 여러 날 누적", "외주설계는 설계외주 발주·입고에서 금액으로 잡힘"], 14),
    { x: M + 0.3, y: 2.75, w: 5.3, h: 1.9, color: HEX.ink, margin: 0, valign: "top" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.3, y: 4.9, w: 5.3, h: 1.2, rectRadius: 0.08, fill: { color: HEX.white }, line: { color: HEX.blue, width: 1 }, objectName: "설계비 공식" });
  T(s, [{ text: "사내 설계비\n", options: { fontSize: 12, color: HEX.muted } }, { text: "분 ÷ 60 × 인원 × 단가", options: { fontSize: 22, bold: true, color: HEX.blue } }],
    { x: M + 0.5, y: 4.9, w: 5, h: 1.2, margin: 0, valign: "middle" });
  card(s, 6.83, 1.5, 5.9, 4.9, "PartList 카드");
  circleIcon(s, "input", 7.13, 1.8, 0.7, HEX.sky, "PartList");
  T(s, "PartList 등록 (원재료 · 구매품)", { x: 8.03, y: 1.85, w: 4.5, h: 0.55, fontSize: 20, bold: true, color: HEX.navy, margin: 0, fit: "shrink" });
  T(s, bullets([
    "원재료·구매품 소요 목록 = 발주 화면의 자재표",
    "구매품은 PART LIST 엑셀파일을 그대로 불러오기(취소선 행 자동 제외)",
    "형태(사각·환봉·파이프·판재)별 중량 자동 계산",
    "📷 이미지 편집기: 캐드 캡처 붙여넣기 → 흰 바탕 A4 도면으로 자동 배치",
    "PartList 복사로 비슷한 금형을 빠르게 등록",
  ], 14), { x: 7.13, y: 2.75, w: 5.3, h: 3.5, color: HEX.ink, margin: 0, valign: "top" });

  // ───────── 10. 구매관리
  s = content("구매관리 — 입고확정된 금액만 원가에 들어갑니다", "모듈별 기능");
  const buy = [["발주", "PartList 자재표에서 품번 체크 → 협력업체 → 단가 → 저장. 발주서 메일 자동 작성"], ["입고", "미입고 발주 검색 → 입고일·입고수량 저장. 착오는 입고취소"], ["입고확정", "단가·네고율·확정가 입력 → 확정. 이때 금액이 원가에 반영"]];
  buy.forEach(([h, b], i) => {
    const x = M + i * 4.15, y = 1.5;
    card(s, x, y, 3.75, 2.3, h, i === 2 ? HEX.navy : HEX.tint);
    T(s, `${i + 1}  ${h}`, { x: x + 0.3, y: y + 0.25, w: 3.2, h: 0.5, fontSize: 21, bold: true, color: i === 2 ? HEX.white : HEX.blue, margin: 0 });
    T(s, b, { x: x + 0.3, y: y + 0.85, w: 3.2, h: 1.3, fontSize: 14, color: i === 2 ? "DCE6F5" : HEX.ink, margin: 0, valign: "top" });
    if (i < 2) s.addImage({ data: ic.arrow, x: x + 3.79, y: y + 0.95, w: 0.32, h: 0.32, altText: "다음 단계" });
  });
  T(s, "확정가 계산", { x: M, y: 4.15, w: 4, h: 0.4, fontSize: 15, bold: true, color: HEX.navy, margin: 0 });
  [["매입가", "입고수량 × 단가"], ["확정가", "매입가 × (1 − 네고율)"]].forEach(([h, f], i) => {
    const x = M + i * 4.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.6, w: 3.75, h: 1.25, rectRadius: 0.08, fill: { color: HEX.white }, line: { color: HEX.blue, width: 1 }, objectName: h + " 공식" });
    T(s, [{ text: h + "\n", options: { fontSize: 12, color: HEX.muted } }, { text: f, options: { fontSize: 20, bold: true, color: HEX.blue } }], { x: x + 0.25, y: 4.6, w: 3.3, h: 1.25, margin: 0, valign: "middle" });
  });
  T(s, bullets(["원재료·구매품은 같은 순서로 처리", "자재표 우클릭으로 발주·입고·확정 창 바로 열기", "다시 구매는 [↻ 신규진행]으로 새 차수 시작"], 13),
    { x: 8.9, y: 4.6, w: 3.8, h: 1.5, color: HEX.ink, margin: 0, valign: "top" });

  // ───────── 11. 사내외가공 · QR
  s = content("사내외가공 — 공정표 · 그림보드 · QR로 현장과 연결합니다", "모듈별 기능");
  T(s, "부품 × 공정 격자에서 칸을 우클릭해 발주 → 출고 → 입고 → 입고확정까지 처리합니다", { x: M, y: 1.35, w: 12.1, h: 0.45, fontSize: 15, color: HEX.muted, margin: 0 });
  const states = [["16A34A", "▶ 다음", "지금 발주할 공정"], ["7C3AED", "요청", "발주 요청"], ["F59E0B", "출고", "발주됨(업체 작업 중)"], ["2B5BB3", "입고", "입고 처리됨"], ["9CA3AF", "완료", "입고확정"], ["8B5A2B", "사내", "사내 가공시간 등록"]];
  states.forEach(([c, h, b], i) => {
    const x = M + i * 2.03;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.0, w: 1.85, h: 0.6, rectRadius: 0.06, fill: { color: c }, line: { color: c }, objectName: "상태 " + h });
    T(s, h, { x, y: 2.0, w: 1.85, h: 0.6, fontSize: 15, bold: true, color: HEX.white, align: "center", valign: "middle", margin: 0 });
    T(s, b, { x, y: 2.68, w: 1.85, h: 0.5, fontSize: 12, color: HEX.ink, align: "center", margin: 0 });
  });
  card(s, M, 3.45, 5.9, 2.8, "그림보드");
  circleIcon(s, "make", M + 0.3, 3.7, 0.65, HEX.blue, "그림보드");
  T(s, "그림보드 · 가공계획", { x: M + 1.15, y: 3.75, w: 4.5, h: 0.5, fontSize: 18, bold: true, color: HEX.navy, margin: 0 });
  T(s, bullets(["부품 그림 위에 공정 순서를 띠로 만들고 [가공계획 적용]", "다음 공정은 직전 외주 공정이 입고돼야 발주 가능", "사내 가공비 = 시간 ÷ 60 × 작업단가"], 13), { x: M + 0.3, y: 4.45, w: 5.4, h: 1.7, color: HEX.ink, margin: 0, valign: "top" });
  card(s, 6.83, 3.45, 5.9, 2.8, "QR", HEX.navy);
  circleIcon(s, "qr", 7.13, 3.7, 0.65, HEX.sky, "QR");
  T(s, "QR 작업완료", { x: 7.98, y: 3.75, w: 4.5, h: 0.5, fontSize: 18, bold: true, color: HEX.white, margin: 0 });
  T(s, bullets(["그림보드 QR을 인쇄해 부품에 부착", "현장·협력업체가 휴대폰으로 읽어 작업완료 등록", "외주 = 입고 처리, 사내 = 가공실적, 🔔 알림 발송"], 13), { x: 7.13, y: 4.45, w: 5.4, h: 1.7, color: "DCE6F5", margin: 0, valign: "top" });

  // ───────── 12. 조립·검사
  s = content("조립관리 — 조립·검사 시간이 노무비가 됩니다", "모듈별 기능");
  [["build", "조립실적등록", ["행 = PartList 부품 + ★ 금형 전체(합형·T/O)", "칸 우클릭 → 작업자·인원·시간(분) 등록", "여러 부품 체크 후 한 번에 등록(시간 나눔/같은 시간)", "[▣ 조립 완료]로 완료 목록 이동"]],
   ["check", "검사실적등록", ["조립실적등록과 같은 격자 구조", "검사 칸 우클릭 → 검사자·시간·단가 등록", "[검사시트 작성/수정]으로 검사 기록 보관", "검사비는 금형원가 공통비(검사)에 반영"]]].forEach(([k, h, items], i) => {
    const x = M + i * 6.23;
    card(s, x, 1.5, 5.87, 2.9, h);
    if (k === "check") { s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 1.8, w: 0.7, h: 0.7, fill: { color: HEX.sky }, line: { color: HEX.sky }, objectName: "검사 circle" }); s.addImage({ data: ic.log, x: x + 0.44, y: 1.94, w: 0.42, h: 0.42, altText: "검사" }); }
    else circleIcon(s, k, x + 0.3, 1.8, 0.7, HEX.blue, h);
    T(s, h, { x: x + 1.2, y: 1.85, w: 4.4, h: 0.55, fontSize: 20, bold: true, color: HEX.navy, margin: 0 });
    T(s, bullets(items, 14), { x: x + 0.3, y: 2.75, w: 5.3, h: 2.2, color: HEX.ink, margin: 0, valign: "top" });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 4.8, w: 12.1, h: 1.0, rectRadius: 0.08, fill: { color: HEX.white }, line: { color: HEX.blue, width: 1 }, objectName: "노무비 공식" });
  T(s, [{ text: "조립비 · 검사비 = ", options: { fontSize: 16, color: HEX.muted } }, { text: "분 ÷ 60 × 인원 × 작업단가", options: { fontSize: 22, bold: true, color: HEX.blue } }, { text: "   (단가 미등록 시 30,000원/h)", options: { fontSize: 13, color: HEX.muted } }],
    { x: M + 0.3, y: 4.8, w: 11.5, h: 1.0, margin: 0, valign: "middle" });

  // ───────── 13. 원가관리
  s = content("원가관리 — 금형 총원가가 자동으로 집계됩니다", "모듈별 기능");
  const eq = [["부품 합계", "원재료비 + 구매품비\n+ 공정별 가공비(사내·외주)"], ["금형 공통비", "외주설계 · SET외주 · 사내설계\n조립 · 검사 · 경비 · 기타"], ["금형 총원가", "관리제번별\n(A·B·C 공정 합산 가능)"]];
  eq.forEach(([h, b], i) => {
    const x = M + i * 4.15, last = i === 2;
    card(s, x, 1.5, 3.55, 2.3, h, last ? HEX.navy : HEX.tint);
    T(s, h, { x: x + 0.3, y: 1.75, w: 3, h: 0.55, fontSize: 22, bold: true, color: last ? HEX.white : HEX.blue, margin: 0 });
    T(s, b, { x: x + 0.3, y: 2.4, w: 3, h: 1.2, fontSize: 14, color: last ? "DCE6F5" : HEX.ink, margin: 0, valign: "top" });
    if (i < 2) T(s, i === 0 ? "+" : "=", { x: x + 3.55, y: 2.2, w: 0.6, h: 0.8, fontSize: 36, bold: true, color: HEX.navy, align: "center", valign: "middle", margin: 0 });
  });
  T(s, "금액은 모두 입고확정된 확정가 기준 — 확정 전 금액은 괄호(회색)로만 보이고 합계에 들어가지 않습니다", { x: M, y: 3.95, w: 12.1, h: 0.4, fontSize: 13, color: HEX.muted, margin: 0 });
  [["업체별 가공비 합계", "협력업체별 확정금액 합산 — 월 정산·단가 협상 자료"], ["매입현황", "원재료·구매품·외주가공·외주설계·SET외주 매입을 한 표로"], ["경비등록 · 매출 · 재고", "제번별 경비 귀속, 매출현황, 재고조회"]].forEach(([h, b], i) => {
    const x = M + i * 4.15;
    T(s, h, { x, y: 4.6, w: 3.75, h: 0.45, fontSize: 16, bold: true, color: HEX.navy, margin: 0 });
    T(s, b, { x, y: 5.1, w: 3.75, h: 0.9, fontSize: 13, color: HEX.ink, margin: 0, valign: "top" });
  });

  // ───────── 14. 기준정보 · 관리
  s = content("기준정보 — 모든 화면의 조회 목록이 여기서 나옵니다", "모듈별 기능");
  const base = [
    ["base", "업체관리", "고객사·협력업체 마스터. 취급분야(원재료/구매품/외주가공) 체크가 발주 화면의 업체 목록이 됩니다."],
    ["user", "사용자정보 · 권한", "계정 등록, 비밀번호 재설정, 메뉴별 조회/저장/수정/삭제 권한, 권한복사."],
    ["cost", "공정 · 기준공정 · 작업단가", "가공공정 코드, 부품 유형별 표준 공정 순서, 노무 단가(원/시간)."],
    ["bell", "알림등록", "QR 작업완료·계획 지연 알림 켜기/끄기, 휴대폰 ntfy 푸시."],
    ["log", "에러로그", "화면 오류가 자동 기록됨 — 「저장이 안 돼요」 신고 원인을 바로 확인."],
    ["board", "수정요청게시판", "화면 수정·오류·기능 요청 등록과 처리 상태 확인."],
  ];
  base.forEach(([k, h, b], i) => {
    const x = M + (i % 2) * 6.15, y = 1.5 + Math.floor(i / 2) * 1.6;
    circleIcon(s, k, x, y, 0.7, i % 2 ? HEX.sky : HEX.blue, h);
    T(s, h, { x: x + 0.95, y: y - 0.02, w: 5, h: 0.45, fontSize: 17, bold: true, color: HEX.navy, margin: 0 });
    T(s, b, { x: x + 0.95, y: y + 0.45, w: 5, h: 0.95, fontSize: 13, color: HEX.ink, margin: 0, valign: "top" });
  });

  // ───────── 운영 섹션
  pres.addSection({ title: "운영" });
  s = pres.addSlide({ masterName: "SECTION_DARK", sectionTitle: "운영" });
  s.addText("운영과 문제해결", { placeholder: "title" });
  s.addText("매일 · 매주 · 매월 무엇을 볼 것인가", { placeholder: "body" });

  // ───────── 15. 자동 처리 규칙
  s = content("저장하는 순간 시스템이 대신 처리하는 일", "운영");
  const auto = [
    ["수주등록 공정수 2 이상", "관리제번 + A·B·C 공정 제번 생성, 금액은 공정 수로 나눠 저장"],
    ["개발유형 외주설계 / 사외조립 체크", "설계외주발주 / SET외주발주 목록에 관리제번이 나타남"],
    ["설계외주·SET외주 진척률 100%", "자동 입고확정 → 금형원가내역 공통비에 반영"],
    ["입고확정 [네고율 적용]", "확정가 = 매입가 × (1 − 네고율), 확정가 직접 입력 시 네고율 역산"],
    ["직전 외주 공정 입고", "다음 공정 칸이 ▶ 다음(발주 가능)으로 바뀜"],
    ["QR에서 작업완료", "외주 = 입고 처리, 사내 = 가공 실적 등록, 🔔 알림"],
    ["화면에서 오류 발생", "기준정보 › 에러로그에 자동 기록"],
  ];
  s.addTable([[hdr("이 동작을 하면"), hdr("자동으로 일어나는 일")],
    ...auto.map((r, i) => r.map((c, j) => ({ text: c, options: { fontSize: 13, bold: j === 0, color: HEX.ink, fill: { color: i % 2 ? HEX.white : HEX.tint } } })))],
    { x: M, y: 1.5, w: 12.1, colW: [4.4, 7.7], rowH: 0.56, border: { type: "solid", pt: 0.5, color: HEX.line }, fontFace: "Malgun Gothic", valign: "middle", margin: [0.05, 0.12, 0.05, 0.12] });
  T(s, "같은 내용을 손으로 또 넣으면 중복이 됩니다.", { x: M, y: 6.25, w: 11.8, h: 0.4, fontSize: 13, color: HEX.muted, margin: 0 });

  // ───────── 16. 운영 루틴
  s = content("운영 루틴 — 매일 5분, 매주 30분, 월 마감", "운영");
  const rt = [
    ["day", "5분", "매일", ["수주진척현황에서 본인 담당 「다음 조치」 확인", "↗ 바로가기로 해당 화면 처리", "🔔 알림(QR 완료·계획 지연) 확인", "⚠ 지연 숫자가 0이 아니면 그 건부터"]],
    ["week", "30분", "매주", ["입고확정 「미완료」 목록 비우기", "외주가공 진척현황 「⚠ 지연만」으로 협력업체 독촉", "외주가공발주현황 「입고」(확정 대기) 확인", "설계·조립 실적 누락자에게 입력 요청"]],
    ["month", "마감", "매월", ["모든 미확정 입고를 0건으로", "실적·사내 가공시간·경비 누락 확인", "매입현황·업체별 가공비 정산", "금형원가내역 [▤ EXCEL]로 보고서"]],
  ];
  rt.forEach(([k, big, lab, items], i) => {
    const x = M + i * (cw + cg), dark = i === 2;
    card(s, x, 1.5, cw, 4.85, lab, dark ? HEX.navy : HEX.tint);
    circleIcon(s, k, x + 0.3, 1.8, 0.65, dark ? HEX.sky : HEX.blue, lab);
    T(s, big, { x: x + 1.1, y: 1.65, w: 2.4, h: 0.75, fontSize: 36, bold: true, color: dark ? HEX.white : HEX.blue, margin: 0 });
    T(s, lab, { x: x + 1.1, y: 2.4, w: 2.4, h: 0.35, fontSize: 13, color: dark ? "9FC3E8" : HEX.muted, margin: 0 });
    T(s, bullets(items, 14), { x: x + 0.3, y: 3.0, w: cw - 0.5, h: 3.2, color: dark ? "DCE6F5" : HEX.ink, margin: 0, valign: "top" });
  });

  // ───────── 17. 문제해결
  s = content("「목록에 안 떠요」는 대부분 앞 단계 입력 누락입니다", "운영");
  const tr = [
    ["외주 발주에 제번이 안 뜬다", "수주등록 › 개발유형(외주설계/사외조립) 체크"],
    ["협력업체가 목록에 안 뜬다", "업체관리 › 취급분야(원재료/구매품/외주가공) 체크"],
    ["발주 화면 자재표가 비어 있다", "설계관리 › PartList 등록을 먼저"],
    ["다음 가공 공정이 발주되지 않는다", "직전 외주 공정 칸을 우클릭해 입고 처리"],
    ["원가가 실제보다 적다", "입고확정 · 실적 · 사내 가공시간 · 경비 누락 확인"],
    ["필요한 메뉴가 안 보인다", "관리자에게 권한 요청 (사용자정보)"],
    ["수정했다는데 화면이 그대로다", "Ctrl+F5로 새로고침"],
  ];
  s.addTable([[hdr("증상"), hdr("원인과 조치")],
    ...tr.map((r, i) => r.map((c, j) => ({ text: c, options: { fontSize: 13, bold: j === 0, color: HEX.ink, fill: { color: i % 2 ? HEX.white : HEX.tint } } })))],
    { x: M, y: 1.5, w: 12.1, colW: [4.6, 7.5], rowH: 0.56, border: { type: "solid", pt: 0.5, color: HEX.line }, fontFace: "Malgun Gothic", valign: "middle", margin: [0.05, 0.12, 0.05, 0.12] });
  T(s, "오류 신고 때 「어느 화면에서, 몇 시에」만 알려주면 에러로그에서 바로 찾을 수 있습니다.", { x: M, y: 6.25, w: 11.8, h: 0.4, fontSize: 13, color: HEX.muted, margin: 0 });

  // ───────── 18. 마무리
  s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "운영" });
  s.addText("입력은 한 번, 원가와 진척은 자동으로", { placeholder: "title" });
  s.addText("관리제번 하나로 수주부터 납품까지 — 입고확정과 실적등록만 빠뜨리지 마세요", { placeholder: "body" });
  [["접속", "브라우저 또는 바탕화면 IPTK MES 아이콘"], ["도움말", "상단 사용메뉴얼 · Ctrl+K 메뉴 검색"], ["요청", "상단 ✎ 수정요청 → 수정요청게시판"]].forEach(([h, b], i) => {
    const x = M + i * 4.1;
    T(s, h, { x, y: 5.4, w: 3.8, h: 0.4, fontSize: 14, bold: true, color: HEX.sky, margin: 0 });
    T(s, b, { x, y: 5.8, w: 3.8, h: 0.7, fontSize: 14, color: HEX.white, margin: 0, valign: "top" });
  });

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
