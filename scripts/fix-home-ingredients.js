/**
 * 집 재료: 만드는 방법(steps)에 나온 명칭으로 1항목씩 분리
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_PATH = path.join(__dirname, "../data.js");

const HOME_BY_ID = {
  "mega-pong": [
    { label: "우유 0.5컵", cost: 125, replaces: "우유" },
    { label: "투게더 3스푼", cost: 380, replaces: ["프라페 베이스 시럽", "휘핑크림"] },
    { label: "얼음 5개", cost: 50, replaces: "얼음" },
    { label: "죠리퐁 0.5컵", cost: 280, replaces: "와플 크럼" },
  ],
  "mega-hal": [
    { label: "커피믹스", cost: 105, replaces: "원두(에스프레소)" },
    { label: "프림", cost: 20, replaces: "원두(에스프레소)" },
    { label: "설탕", cost: 15, replaces: "원두(에스프레소)" },
    { label: "뜨거운 물 0.5컵", cost: 5, replaces: "물" },
    { label: "찬물", cost: 5, replaces: "물" },
    { label: "우유", cost: 190, replaces: "물" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "mega-unicorn": [
    { label: "쿠키베이스", amount: "100ml", cost: 260, replaces: "쿠키 베이스(업체용)" },
    { label: "우유", amount: "100ml", cost: 250, replaces: "우유" },
    { label: "유니콘 파우더", amount: "2펌프", cost: 340, replaces: "유니콘 파우더·시럽" },
    { label: "레몬주스", amount: "컵 벽면 1바퀴", cost: 160, replaces: "레몬주스" },
    { label: "얼음", amount: "적당량", cost: 50, replaces: "얼음" },
    { label: "휘핑크림", amount: "토핑", cost: 232, replaces: "휘핑크림" },
  ],
  "gongcha-black": [
    { label: "티백", cost: 90, replaces: "블랙티 농축 베이스" },
    { label: "물 0.75컵", cost: 30, replaces: "블랙티 농축 베이스" },
    { label: "우유 0.75컵", cost: 190, replaces: "우유" },
    { label: "설탕", cost: 15, replaces: "흑당·과당 시럽" },
    { label: "타피오카 펄", cost: 180, replaces: "타피오카 펄" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "gongcha-taro": [
    { label: "타피오카 펄 40g", cost: 180, replaces: "타피오카 펼" },
    { label: "타로 파우더 3큰술", cost: 280, replaces: "타로 파우더(업체용)" },
    { label: "뜨거운 물 0.25컵", cost: 5, replaces: "타로 파우더(업체용)" },
    { label: "설탕 1큰술", cost: 15, replaces: "과당 시럽" },
    { label: "우유 0.75컵", cost: 190, replaces: "우유" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "gongcha-mango": [
    { label: "냉동 망고", cost: 890, replaces: "망고 퓨레(업체용)" },
    { label: "드링킹 요거트", cost: 580, replaces: "요거트 베이스(업체용)" },
    { label: "화이트 펄", cost: 220, replaces: "화이트 펄(업체용)" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "compose-shake": [
    { label: "우유 1컵", cost: 250, replaces: "우유" },
    { label: "파우더 5스푼", cost: 350, replaces: "테너 파우더 밀크쉐이크" },
    { label: "커피 스틱 5개", cost: 225, replaces: "원두(에스프레소)" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "compose-vanilla": [
    { label: "에스프레소 액상스틱", cost: 190, replaces: "원두(에스프레소)" },
    { label: "바닐라 시럽", cost: 180, replaces: "바닐라 시럽(업체용)" },
    { label: "바닐라 빈 파우더", cost: 85, replaces: "바닐라 빈 파우더" },
    { label: "우유", cost: 250, replaces: "우유" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "compose-grain": [
    { label: "우유", cost: 250, replaces: "우유" },
    { label: "곡물 파우더", cost: 220, replaces: "곡물라떼 파우더(업체용)" },
    { label: "설탕 시럽", cost: 85, replaces: "과당 시럽" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "twosome-royal": [
    { label: "우유 150ml", cost: 190, replaces: "얼그레이 농축액" },
    { label: "홍차 티백 2개", cost: 90, replaces: "얼그레이 농축액" },
    { label: "투게더(150g)", cost: 420, replaces: "쉐이크 베이스(바닐라)" },
    { label: "우유 50ml", cost: 65, replaces: "우유" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "아이스크림 1스쿱", cost: 450, replaces: "소프트 아이스크림(토핑)" },
  ],
  "twosome-applemango": [
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "냉동 망고", cost: 520, replaces: "냉동 애플망고 다이스(업체용)" },
    { label: "복숭아 국물", cost: 380, replaces: "복숭아 제조 베이스" },
    { label: "망고 주스", cost: 240, replaces: "망고 패션후르츠 농축액" },
    { label: "물", cost: 10, replaces: "정수 물" },
  ],
  "paik-cookie": [
    { label: "우유 200ml", cost: 250, replaces: "우유" },
    { label: "바닐라 파우더 2큰술", cost: 95, replaces: "빽스치노 베이스 파우더" },
    { label: "시럽", cost: 165, replaces: "바닐라·슈가 시럽" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "초코 쿠키 3개", cost: 240, replaces: "쿠키 크럼(업체용)" },
    { label: "초코 크런치 3큰술", cost: 180, replaces: "초코 크럼 토핑" },
  ],
  "paik-ashot": [
    { label: "복숭아 아이스티 파우더 65g", cost: 220, replaces: "복숭아 아이스티 원액" },
    { label: "따뜻한 물 50ml", cost: 5, replaces: "복숭아 아이스티 원액" },
    { label: "차가운 물 250ml", cost: 10, replaces: "복숭아 아이스티 원액" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "에스프레소 1샷", cost: 95, replaces: "원두(에스프레소)" },
  ],
  "paik-strawberry": [
    { label: "우유", cost: 250, replaces: "우유" },
    { label: "냉동 딸기", cost: 680, replaces: "딸기 퓨레(업체용)" },
    { label: "딸기소스", cost: 165, replaces: "딸기 시럽" },
    { label: "설탕 시럽", cost: 55, replaces: "과당 시럽" },
    { label: "바나나 파우더", cost: 95, replaces: "바나나 베이스 파우더" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "mammoth-honey-coffee": [
    { label: "꿀", cost: 180, replaces: "꿀" },
    { label: "에스프레소 액상스틱", cost: 2300, replaces: "원두(에스프레소)" },
    { label: "물", cost: 10, replaces: "물" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "chabaek-mango": [
    { label: "사고 펄", cost: 280, replaces: "사고(사가)" },
    { label: "망고", cost: 950, replaces: "망고 퓨레(업체용)" },
    { label: "코코넛 밀크", cost: 480, replaces: "코코넛밀크(농축)" },
    { label: "우유", cost: 65, replaces: "우유" },
    { label: "연유", cost: 95, replaces: "연유" },
    { label: "포멜로", cost: 2200, replaces: "포멜로·자몽 과육(냉동)" },
  ],
  "chabaek-soybean": [
    { label: "뜨거운 물 150ml", cost: 10, replaces: "우롱차 농축액" },
    { label: "우롱찻잎", cost: 110, replaces: "우롱차 농축액" },
    { label: "설탕", cost: 15, replaces: "과당·연유 시럽" },
    { label: "연유", cost: 95, replaces: "과당·연유 시럽" },
    { label: "두유", cost: 350, replaces: "두유 베이스(매장용)" },
    { label: "콩가루", cost: 90, replaces: "소이빈 파우더(업체용)" },
    { label: "찰떡", cost: 200, replaces: "찰떡·인절미 토핑" },
  ],
  "ediya-toffee": [
    { label: "땅콩버터", cost: 110, replaces: "" },
    { label: "토피넛 라떼 스틱", cost: 220, replaces: ["토피·헤이즐넛 시럽", "원두(에스프레소)"] },
    { label: "우유 50ml", cost: 65, replaces: "우유" },
    { label: "우유 150ml", cost: 190, replaces: "우유" },
    { label: "땅콩", cost: 50, replaces: "" },
  ],
  "ediya-flat": [
    { label: "토피넛 파우더", cost: 220, replaces: "원두(에스프레소)" },
    { label: "우유", cost: 125, replaces: "우유" },
    { label: "연유", cost: 95, replaces: "연유(업체용)" },
    { label: "헤이즐넛 시럽", cost: 240, replaces: "토피·헤이즐넛 시럽" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "휘핑크림", cost: 220, replaces: "휘핑크림(업체용)" },
    { label: "견과류", cost: 280, replaces: "휘핑크림(업체용)" },
  ],
  "hasamdong-dalgona": [
    { label: "달고나", cost: 150, replaces: "달고나 토핑(업체용)" },
    { label: "흰 우유", cost: 250, replaces: "우유" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "에스프레소 샷", cost: 95, replaces: "원두(에스프레소)" },
  ],
  "hasamdong-salt": [
    { label: "생크림", cost: 280, replaces: "히말라야 소금 크림(업체용)" },
    { label: "연유", cost: 95, replaces: "히말라야 소금 크림(업체용)" },
    { label: "히말라야 핑크솔트", cost: 15, replaces: "히말라야 소금 크림(업체용)" },
    { label: "우유", cost: 125, replaces: "우유" },
    { label: "에스프레소", cost: 190, replaces: "원두(에스프레소)" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "sb-javachip-frappuccino": [
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "우유", cost: 338, replaces: "우유" },
    { label: "자바칩 파우더", cost: 280, replaces: "자바칩 파우더" },
    { label: "에스프레소 액상스틱", cost: 1150, replaces: "프라푸치노 로스트(커피)" },
    { label: "바닐라 아이스크림", cost: 320, replaces: "모카·초코 프라푸 시럽" },
    { label: "초코 크런치", cost: 120, replaces: "자바칩 토핑" },
    { label: "휘핑크림", cost: 350, replaces: "휘핑크림" },
  ],
  "sb-grapefruit-honey-black-tea": [
    { label: "자몽청", cost: 400, replaces: "자몽허니 베이스" },
    { label: "홍차 티백", cost: 180, replaces: "블랙티 베이스" },
    { label: "얼음", cost: 50, replaces: "얼음" },
  ],
  "sb-vanilla-cream-cold-brew": [
    { label: "우유", cost: 125, replaces: "우유" },
    { label: "휘핑크림", cost: 350, replaces: "바닐라 크림(업체용)" },
    { label: "바닐라 시럽", cost: 180, replaces: "바닐라 시럽" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "콜드브루 원액", cost: 650, replaces: "콜드브루 농축액" },
  ],
  "d39-cream": [
    { label: "휘핑크림", cost: 380, replaces: "크림 베이스(업체용)" },
    { label: "설탕", cost: 15, replaces: "크림 베이스(업체용)" },
    { label: "아몬드 시럽", cost: 60, replaces: "크림 베이스(업체용)" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "우유", cost: 125, replaces: "우유" },
    { label: "에스프레소", cost: 145, replaces: "원두(에스프레소)" },
  ],
  "pascucci-java": [
    { label: "에스프레소", cost: 95, replaces: "원두(에스프레소)" },
    { label: "우유", cost: 125, replaces: "우유" },
    { label: "초코 파우더", cost: 280, replaces: "초코 시럽(업체용)" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "자바칩", cost: 350, replaces: "자바칩 토핑(업체용)" },
    { label: "휘핑크림", cost: 220, replaces: "휘핑크림(업체용)" },
  ],
  "pascucci-yogurt": [
    { label: "우유", cost: 125, replaces: "우유" },
    { label: "요거트 파우더", cost: 220, replaces: "요거트 그라니따 베이스(업체용)" },
    { label: "플레인 요거트", cost: 130, replaces: "요거트 그라니따 베이스(업체용)" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "요거트 젤라또", cost: 480, replaces: "요거트 젤라또(토핑)" },
  ],
  "pascucci-blueberry": [
    { label: "우유", cost: 140, replaces: "우유" },
    { label: "요거트 파우더", cost: 170, replaces: "요거트 그라니따 베이스(업체용)" },
    { label: "얼음", cost: 50, replaces: "얼음" },
    { label: "냉동 블루베리", cost: 750, replaces: "블루베리 퓨레(업체용)" },
    { label: "요거트 젤라또", cost: 480, replaces: "요거트 젤라또(토핑)" },
  ],
};

// typo fix gongcha-taro
HOME_BY_ID["gongcha-taro"][0].replaces = "타피오카 펄";

const code = fs.readFileSync(DATA_PATH, "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code + "\nthis.MENUS = MENUS;", ctx);

let updated = 0;
ctx.MENUS.forEach((menu) => {
  const items = HOME_BY_ID[menu.id];
  if (!items) {
    console.warn("Missing:", menu.id);
    return;
  }
  menu.recipe.homeIngredients = items;
  updated++;
});

// Reuse serialize from update-prices.js
const updateScript = fs.readFileSync(path.join(__dirname, "update-prices.js"), "utf8");
const serializePart = updateScript.slice(
  updateScript.indexOf("function j(s)"),
  updateScript.indexOf('const newHeader = `')
);

eval(serializePart);

const footerStart = code.indexOf("];\n\nconst CATEGORIES");
const footer = code.slice(footerStart + 3);
const header = code.slice(0, code.indexOf("const MENUS = ["));

fs.writeFileSync(
  DATA_PATH,
  header + "const MENUS = [\n" + serializeMenus(ctx.MENUS) + "\n];\n" + footer,
  "utf8"
);

console.log(`Updated ${updated} menus`);

// validate replaces
const issues = [];
ctx.MENUS.forEach((m) => {
  const storeNames = new Set(m.ingredients.map((i) => i.name));
  (m.recipe?.homeIngredients || []).forEach((h) => {
    const reps = Array.isArray(h.replaces) ? h.replaces : h.replaces ? [h.replaces] : [];
    reps.forEach((r) => {
      if (r && !storeNames.has(r)) issues.push(`${m.id}: ${r} <- ${h.label}`);
    });
  });
});
if (issues.length) {
  console.warn("Replace issues:", issues);
} else {
  console.log("All replaces OK");
}
