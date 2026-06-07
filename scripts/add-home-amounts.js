/**
 * 집 재료에 amount(함량) 필드 추가 · label에서 분리
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_PATH = path.join(__dirname, "../data.js");

function splitLabel(label) {
  const paren = label.match(/^(.+?)\(([^)]+)\)$/);
  if (paren) return { label: paren[1], amount: paren[2] };

  const patterns = [
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?ml)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?g)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?컵)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?스푼)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?큰술)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?펌프)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?개)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?샷)$/,
    /^(.+?)\s+(\d+(?:~\d+)?(?:\.\d+)?스쿱)$/,
  ];
  for (const re of patterns) {
    const m = label.match(re);
    if (m) return { label: m[1], amount: m[2] };
  }
  return { label, amount: null };
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFromSteps(label, steps) {
  const body = steps.map((s) => s.body).join(" ");
  const aliases = {
    "흰 우유": ["흰 우유", "우유"],
    "뜨거운 물 0.5컵": ["뜨거운 물"],
    "뜨거운 물 0.25컵": ["뜨거운 물"],
    "뜨거운 물 150ml": ["뜨거운 물"],
    "물 0.75컵": ["물"],
    "에스프레소 샷": ["에스프레소"],
    "에스프레소 1샷": ["에스프레소"],
    "쿠키베이스": ["쿠키베이스"],
    "복숭아 국물": ["복숭아 국물", "복숭아 베이스"],
    "시럽": ["시럽"],
    "딸기소스": ["딸기소스", "딸기 소스"],
  };
  const names = aliases[label] || [label.split(/\s+\d/)[0], label];

  for (const name of names) {
    if (!name) continue;
    const patterns = [
      new RegExp(`${esc(name)}\\s*(\\d+(?:~\\d+)?(?:\\.\\d+)?(?:ml|g|컵|스푼|큰술|펌프|개|샷|스쿱|봉|%)?)`),
      new RegExp(`(\\d+(?:~\\d+)?(?:\\.\\d+)?(?:ml|g|컵|스푼|큰술|펌프|개|샷|스쿱|봉))\\s*${esc(name)}`),
      new RegExp(`${esc(name)}\\s*(\\d+(?:~\\d+)?(?:\\.\\d+)?%)`),
    ];
    for (const re of patterns) {
      const m = body.match(re);
      if (m) return m[1];
    }
    if (body.includes(`${name} 1.5개`)) return "1.5개";
    if (name === "망고" && body.includes("1.5개")) return "1.5개";
    if (name === "포멜로" && /자몽|포멜로/.test(body)) return "적당량";
  }
  return null;
}

// menuId:label → amount (steps에 명시 없을 때)
const AMOUNT_OVERRIDE = {
  "mega-hal:커피믹스": "3봉",
  "mega-hal:프림": "1~2스푼",
  "mega-hal:설탕": "1스푼",
  "mega-hal:찬물": "나머지",
  "mega-hal:우유": "나머지",
  "mega-hal:얼음": "가득",
  "mega-unicorn:레몬주스": "컵 벽면 1바퀴",
  "mega-unicorn:얼음": "적당량",
  "mega-unicorn:휘핑크림": "토핑",
  "gongcha-black:티백": "1~2개",
  "gongcha-black:설탕": "1~2스푼",
  "gongcha-black:타피오카 펄": "40~80g",
  "gongcha-black:얼음": "가득",
  "gongcha-taro:얼음": "적당량",
  "gongcha-mango:냉동 망고": "150g",
  "gongcha-mango:드링킹 요거트": "150ml",
  "gongcha-mango:화이트 펄": "적당량",
  "gongcha-mango:얼음": "선택",
  "compose-shake:얼음": "액체 높이만큼",
  "compose-vanilla:에스프레소 액상스틱": "2개",
  "compose-vanilla:바닐라 시럽": "3~4펌프",
  "compose-vanilla:바닐라 빈 파우더": "0.5티스푼",
  "compose-vanilla:우유": "1컵",
  "compose-vanilla:얼음": "가득",
  "compose-grain:우유": "250ml",
  "compose-grain:곡물 파우더": "60g",
  "compose-grain:설탕 시럽": "1.5펌프",
  "compose-grain:얼음": "가득",
  "twosome-royal:투게더": "150g",
  "twosome-royal:얼음": "약간",
  "twosome-applemango:얼음": "적당량",
  "twosome-applemango:냉동 망고": "150g",
  "twosome-applemango:복숭아 국물": "60ml",
  "twosome-applemango:망고 주스": "60ml",
  "twosome-applemango:물": "적당량",
  "paik-cookie:시럽": "3~4펌프",
  "paik-cookie:얼음": "1컵",
  "paik-ashot:얼음": "컵 상기선",
  "paik-strawberry:우유": "200ml",
  "paik-strawberry:냉동 딸기": "100g",
  "paik-strawberry:딸기소스": "3펌프",
  "paik-strawberry:설탕 시럽": "1펌프",
  "paik-strawberry:바나나 파우더": "2스푼",
  "paik-strawberry:얼음": "200g",
  "mammoth-honey-coffee:꿀": "1~1.5큰술",
  "mammoth-honey-coffee:에스프레소": "1~2샷",
  "mammoth-honey-coffee:찬물": "적당량",
  "mammoth-honey-coffee:얼음": "적당량",
  "mammoth-honey-latte:꿀": "1~1.5큰술",
  "mammoth-honey-latte:에스프레소": "1~2샷",
  "mammoth-honey-latte:우유": "150ml",
  "mammoth-honey-latte:얼음": "가득",
  "chabaek-mango:사고 펄": "35g",
  "chabaek-mango:코코넛 밀크": "150ml",
  "chabaek-mango:우유": "50ml",
  "chabaek-mango:연유": "1~2큰술",
  "chabaek-mango:포멜로": "적당량",
  "chabaek-soybean:우롱찻잎": "티백 1~2개",
  "chabaek-soybean:설탕": "1~2스푼",
  "chabaek-soybean:연유": "1큰술",
  "chabaek-soybean:두유": "175ml",
  "chabaek-soybean:콩가루": "2큰술",
  "chabaek-soybean:찰떡": "30g",
  "ediya-toffee:땅콩버터": "1큰술",
  "ediya-toffee:토피넛 라떼 스틱": "1개",
  "ediya-toffee:땅콩": "토핑",
  "ediya-flat:토피넛 파우더": "3~4큰술",
  "ediya-flat:우유": "150ml",
  "ediya-flat:연유": "1큰술",
  "ediya-flat:헤이즐넛 시럽": "1큰술",
  "ediya-flat:얼음": "1.5컵",
  "ediya-flat:휘핑크림": "토핑",
  "ediya-flat:견과류": "토핑",
  "hasamdong-dalgona:달고나": "15~30g",
  "hasamdong-dalgona:에스프레소 샷": "1샷 (선택)",
  "hasamdong-dalgona:에스프레소": "1샷 (선택)",
  "hasamdong-dalgona:흰 우유": "컵 80%",
  "hasamdong-dalgona:얼음": "가득",
  "hasamdong-salt:생크림": "80ml",
  "hasamdong-salt:연유": "1큰술",
  "hasamdong-salt:히말라야 핑크솔트": "1꼬집",
  "hasamdong-salt:우유": "125ml",
  "hasamdong-salt:에스프레소": "1~2샷",
  "hasamdong-salt:얼음": "가득",
  "sb-javachip:얼음": "적당량",
  "sb-javachip:우유": "150ml",
  "sb-javachip:자바칩 파우더": "2~3큰술",
  "sb-javachip:에스프레소": "1샷",
  "sb-javachip:바닐라 아이스크림": "3~4큰술",
  "sb-javachip:통자바칩": "2~3큰술",
  "sb-javachip:휘핑크림": "토핑",
  "sb-javachip:초콜릿 시럽": "토핑",
  "sb-grapefruit:얼음": "가득",
  "sb-coldbrew:우유": "적당량",
  "sb-coldbrew:생크림": "50g",
  "sb-coldbrew:바닐라 시럽": "15~20ml",
  "sb-coldbrew:얼음": "8~10개",
  "sb-coldbrew:콜드브루 원액": "130ml",
  "d39-cream:휘핑크림": "65g",
  "d39-cream:설탕": "4g",
  "d39-cream:아몬드 시럽": "10ml",
  "d39-cream:얼음": "4~5개",
  "d39-cream:우유": "110ml",
  "d39-cream:에스프레소": "1~2샷",
  "pascucci-java:에스프레소": "1샷",
  "pascucci-java:우유": "115ml",
  "pascucci-java:초코 파우더": "2~3큰술",
  "pascucci-java:얼음": "10~12개",
  "pascucci-java:자바칩": "30g",
  "pascucci-java:휘핑크림": "1스쿱",
  "pascucci-yogurt:우유": "100ml",
  "pascucci-yogurt:요거트 파우더": "45g",
  "pascucci-yogurt:플레인 요거트": "2~3큰술",
  "pascucci-yogurt:얼음": "10~12개",
  "pascucci-yogurt:요거트 젤라또": "1스쿱",
  "pascucci-blueberry:우유": "110ml",
  "pascucci-blueberry:요거트 파우더": "35g",
  "pascucci-blueberry:얼음": "180g",
  "pascucci-blueberry:냉동 블루베리": "100g",
  "pascucci-blueberry:요거트 젤라또": "1스쿱",
};

const code = fs.readFileSync(DATA_PATH, "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code + "\nthis.MENUS = MENUS;", ctx);

let updated = 0;
let missing = [];

ctx.MENUS.forEach((menu) => {
  (menu.recipe?.homeIngredients || []).forEach((item) => {
    if (typeof item === "string") return;
    const split = splitLabel(item.label);
    let amount = split.amount;
    let label = split.label;

    if (!amount) {
      amount =
        AMOUNT_OVERRIDE[`${menu.id}:${label}`] ||
        AMOUNT_OVERRIDE[`${menu.id}:${item.label}`] ||
        extractFromSteps(label, menu.recipe.steps) ||
        extractFromSteps(item.label, menu.recipe.steps);
    }

    if (!amount) {
      missing.push(`${menu.id}: ${item.label}`);
      amount = "-";
    }

    item.label = label;
    item.amount = amount;
    updated++;
  });
});

const updateScript = fs.readFileSync(path.join(__dirname, "update-prices.js"), "utf8");
const serializePart = updateScript.slice(
  updateScript.indexOf("function j(s)"),
  updateScript.indexOf("const menusStr = serializeMenus")
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

console.log(`Updated ${updated} items`);
if (missing.length) {
  console.warn("Missing amounts:", missing);
} else {
  console.log("All amounts set");
}
