const fs = require("fs");
const path = require("path");
const MANUAL = require("./gongcha-manual-steps");
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { filterCheaperAtHome } = require("./filter-cheaper-at-home");

const OUTPUT_PATH = path.join(__dirname, "../gongcha-menus.js");

const B2B = {
  milkPerMl: 1.5,
  teaPerMl: 7,
  syrupPerMl: 7,
  powderPerG: 9,
  pureePerG: 3.5,
  tapiocaPerG: 3.8,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  marshmallowEach: 80,
  cookieCrumbPerG: 8,
};

const HOME = {
  milkPerMl: 2.5,
  syrup15ml: 180,
  teaBag: 90,
  water: 5,
  ice: 50,
  powder30g: 290,
  powder20g: 200,
  mango150g: 900,
  yogurt150ml: 550,
  yogurt55ml: 220,
  strawberrySauce: 200,
  cookieCrumb: 150,
  marshmallow: 120,
  tapioca80g: 200,
  sodaCanPart: 300,
  greenTangerine: 350,
  creamCheese: 280,
  yakgwa: 200,
  tapioca40g: 100,
  taroPowder3: 280,
  sugarSpoon: 15,
  whitePearl: 220,
};

function round(v) {
  return Math.round(v);
}

function ing(name, amount, cost) {
  return { name, amount, cost: round(cost) };
}

function home(label, amount, price, replaces) {
  return consumerHome(label, amount, price, replaces);
}

function appendTopping(body, top) {
  if (!top) return body;
  const compact = (s) => s.replace(/\s/g, "");
  const bodyCompact = compact(body);
  const topWords = top.replace(/^토핑:?\s*/, "").split(/[\s,·]+/).filter((w) => w.length >= 2);
  if (topWords.some((w) => bodyCompact.includes(compact(w)))) return body;
  const suffix = top.startsWith("토핑") ? top : `토핑: ${top}`;
  return `${body.replace(/\.$/, "")}. ${suffix}`;
}

function stepsFromManual(slug, homeIngredients = []) {
  const manual = MANUAL[slug];
  if (!manual) return [];
  return stepsFromManualHome(manual, homeIngredients).map((body) => ({ title: "", body }));
}

function baseMenu({ id, name, category, price, emoji, photoBg, ingredients, homeIngredients, slug, difficulty = 1, time = "약 5분", note }) {
  return {
    id: `gongcha-${id}`,
    brand: "공차",
    name,
    category,
    price,
    emoji,
    photoBg,
    recipeReady: true,
    ingredients,
    recipe: {
      homeIngredients,
      steps: stepsFromManual(slug, homeIngredients),
      difficulty,
      time,
      note: note || `공차 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

const menus = [];

// 스무디 & 크러쉬
menus.push(
  baseMenu({
    id: "choco-mello-smoothie",
    slug: "choco-mello-smoothie",
    name: "초코멜로 블랙티스무디",
    category: "스무디·쉐이크",
    price: 6200,
    emoji: "🍫",
    photoBg: "#3E2723",
    difficulty: 2,
    time: "약 7분",
    ingredients: [
      ing("흑당·과당 시럽", "20ml", 20 * B2B.syrupPerMl),
      ing("블랙티 농축 베이스", "60ml", 60 * B2B.teaPerMl),
      ing("초코 포션", "30g", 30 * B2B.powderPerG),
      ing("얼음", "1.5스쿱", B2B.ice),
      ing("마시멜로", "2.5개", 2.5 * B2B.marshmallowEach),
      ing("밀크폼", "30ml", 45),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("설탕시럽", "2~3펌프", HOME.syrup15ml, "흑당·과당 시럽"),
      home("진한 홍차", "60ml", HOME.teaBag, "블랙티 농축 베이스"),
      home("초코 파우더", "2큰술", HOME.powder20g, "초코 포션"),
      home("얼음", "한 컵", HOME.ice, "얼음"),
      home("마시멜로", "2~3개", HOME.marshmallow, "마시멜로"),
      home("우유", "30ml(거품용)", 75, "밀크폼"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "strawberry-earlgrey-cookie-smoothie",
    slug: "strawberry-earlgrey-cookie-smoothie",
    name: "딸기얼그레이 쿠키스무디",
    category: "스무디·쉐이크",
    price: 6100,
    emoji: "🍓",
    photoBg: "#FCE4EC",
    difficulty: 2,
    ingredients: [
      ing("과당 시럽", "25ml", 25 * B2B.syrupPerMl),
      ing("얼그레이 티", "40ml", 40 * B2B.teaPerMl),
      ing("물", "40ml", B2B.water),
      ing("스무디 포션", "25g", 25 * B2B.powderPerG),
      ing("쿠키 분태", "20g", 20 * B2B.cookieCrumbPerG),
      ing("딸기 소스", "20ml", 20 * B2B.syrupPerMl),
      ing("얼음", "2스쿱", B2B.ice * 1.5),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("설탕시럽", "3~4펌프", HOME.syrup15ml, "과당 시럽"),
      home("얼그레이 티", "40ml", HOME.teaBag, "얼그레이 티"),
      home("물", "40ml", HOME.water, "물"),
      home("요거트 파우더", "1스푼", HOME.powder20g, "스무디 포션"),
      home("쿠키 크럼", "1.5스푼", HOME.cookieCrumb, "쿠키 분태"),
      home("딸기 소스", "1~2펌프", HOME.strawberrySauce, "딸기 소스"),
      home("얼음", "2스쿱", HOME.ice, "얼음"),
    ],
  }),
);

// 스파클링 티
menus.push(
  baseMenu({
    id: "sparkling-tea",
    slug: "sparkling-tea",
    name: "기본 스파클링티 (ICE)",
    category: "에이드·과일",
    price: 5200,
    emoji: "✨",
    photoBg: "#E0F7FA",
    ingredients: [
      ing("티 베이스", "100ml", 100 * B2B.teaPerMl),
      ing("얼음물", "100ml", B2B.water),
      ing("과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("탄산", "적정량", 30),
      ing("얼음", "Less Ice", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("티 베이스", "100ml", HOME.teaBag, "티 베이스"),
      home("물", "100ml", HOME.water, "얼음물"),
      home("설탕시럽", "1펌프", HOME.syrup15ml, "과당 시럽"),
      home("탄산수", "150ml", HOME.sodaCanPart, "탄산"),
      home("얼음", "적당량", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "green-tangerine-sparkling",
    slug: "green-tangerine-sparkling",
    name: "청귤 스파클링티",
    category: "에이드·과일",
    price: 5500,
    emoji: "🍊",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("그린티", "80ml", 80 * B2B.teaPerMl),
      ing("물", "80ml", B2B.water),
      ing("청귤 소스", "80ml", 80 * B2B.syrupPerMl),
      ing("탄산", "적정량", 30),
      ing("청귤칩", "1개", 50),
      ing("얼음", "Less Ice", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("그린티", "80ml", HOME.teaBag, "그린티"),
      home("물", "80ml", HOME.water, "물"),
      home("청귤 소스", "80ml", HOME.greenTangerine, "청귤 소스"),
      home("탄산수", "150ml", HOME.sodaCanPart, "탄산"),
      home("얼음", "적당량", HOME.ice, "얼음"),
    ],
  }),
);

// 밀크티
menus.push(
  baseMenu({
    id: "jasmine-tea",
    slug: "jasmine-tea",
    name: "자스민티",
    category: "버블티·밀크티",
    price: 4500,
    emoji: "🌸",
    photoBg: "#F3E5F5",
    ingredients: [
      ing("자스민 티 베이스", "120ml", 120 * B2B.teaPerMl),
      ing("과당 시럽", "12ml", 12 * B2B.syrupPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("자스민 티백", "1~2개", HOME.teaBag, "자스민 티 베이스"),
      home("설탕시럽", "2~3펌프", HOME.syrup15ml, "과당 시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "red-velvet-milk-tea",
    slug: "red-velvet-milk-tea",
    name: "레드벨벳 밀크티 (ICE)",
    category: "버블티·밀크티",
    price: 5800,
    emoji: "❤️",
    photoBg: "#FFEBEE",
    difficulty: 2,
    time: "약 8분",
    ingredients: [
      ing("블랙티", "150ml", 150 * B2B.teaPerMl),
      ing("과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("레드벨벳 포션", "30g", 30 * B2B.powderPerG),
      ing("치즈폼", "40g", 40 * B2B.whipPerG),
      ing("레드벨벳 크럼블", "15g", 15 * B2B.cookieCrumbPerG),
      ing("얼음", "Less Ice", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("블랙티", "150ml", HOME.teaBag, "블랙티"),
      home("설탕시럽", "1펌프", HOME.syrup15ml, "과당 시럽"),
      home("레드벨벳 파우더", "1포션", HOME.powder30g, "레드벨벳 포션"),
      home("크림치즈 폼", "1.5국자", HOME.creamCheese, "치즈폼"),
      home("쿠키 크럼", "적당량", HOME.cookieCrumb, "레드벨벳 크럼블"),
      home("얼음", "적당량", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "yakgwa-milk-tea",
    slug: "yakgwa-milk-tea",
    name: "쫀득 약과 밀크티",
    category: "버블티·밀크티",
    price: 5600,
    emoji: "🍯",
    photoBg: "#FFF8E1",
    difficulty: 2,
    ingredients: [
      ing("우유", "100ml", 100 * B2B.milkPerMl),
      ing("우롱티", "100ml", 100 * B2B.teaPerMl),
      ing("약과 파우더", "30g", 30 * B2B.powderPerG),
      ing("약과", "1개", 120),
      ing("과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("우유", "100ml", 250, "우유"),
      home("우롱티", "100ml", HOME.teaBag, "우롱티"),
      home("약과 파우더", "3스푼", HOME.powder30g, "약과 파우더"),
      home("약과", "1개(잘게)", HOME.yakgwa, "약과"),
      home("설탕시럽", "1펌프", HOME.syrup15ml, "과당 시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "hadong-hoji-milk-tea",
    slug: "hadong-hoji-milk-tea",
    name: "하동 호지 밀크티",
    category: "버블티·밀크티",
    price: 5400,
    emoji: "🍵",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("티 베이스", "100ml", 100 * B2B.teaPerMl),
      ing("하동 호지 파우더", "25g", 25 * B2B.powderPerG),
      ing("우유", "120ml", 120 * B2B.milkPerMl),
      ing("과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("녹차/티 베이스", "100ml", HOME.teaBag, "티 베이스"),
      home("호지(녹차) 파우더", "2스푼", HOME.powder20g, "하동 호지 파우더"),
      home("우유", "120ml", 300, "우유"),
      home("설탕시럽", "1펌프", HOME.syrup15ml, "과당 시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "jeju-green-milk-tea",
    slug: "jeju-green-milk-tea",
    name: "제주 그린 밀크티",
    category: "버블티·밀크티",
    price: 5100,
    emoji: "🌿",
    photoBg: "#C8E6C9",
    ingredients: [
      ing("그린티 베이스", "100ml", 100 * B2B.teaPerMl),
      ing("제주 녹차 파우더", "20g", 20 * B2B.powderPerG),
      ing("우유", "120ml", 120 * B2B.milkPerMl),
      ing("과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("그린티", "100ml", HOME.teaBag, "그린티 베이스"),
      home("녹차 파우더", "2스푼", HOME.powder20g, "제주 녹차 파우더"),
      home("우유", "120ml", 300, "우유"),
      home("설탕시럽", "1펌프", HOME.syrup15ml, "과당 시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "vanilla-bean-cream-milk-tea",
    slug: "vanilla-bean-cream-milk-tea",
    name: "바닐라빈 크림 밀크티",
    category: "버블티·밀크티",
    price: 5500,
    emoji: "🤍",
    photoBg: "#FFFDE7",
    difficulty: 2,
    ingredients: [
      ing("블랙티 베이스", "100ml", 100 * B2B.teaPerMl),
      ing("바닐라빈 파우더/시럽", "20ml", 20 * B2B.syrupPerMl),
      ing("밀크 크림/치즈폼", "40g", 40 * B2B.whipPerG),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("블랙티", "100ml", HOME.teaBag, "블랙티 베이스"),
      home("바닐라 시럽", "1~2펌프", HOME.syrup15ml, "바닐라빈 파우더/시럽"),
      home("생크림/크림치즈 폼", "토핑", HOME.creamCheese, "밀크 크림/치즈폼"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "earlgrey-choco-milk-tea",
    slug: "earlgrey-choco-milk-tea",
    name: "얼그레이 초콜릿 밀크티",
    category: "버블티·밀크티",
    price: 5400,
    emoji: "🍫",
    photoBg: "#D7CCC8",
    ingredients: [
      ing("얼그레이 티 베이스", "100ml", 100 * B2B.teaPerMl),
      ing("초콜릿 파우더/소스", "30g", 30 * B2B.powderPerG),
      ing("우유", "120ml", 120 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("얼그레이 티", "100ml", HOME.teaBag, "얼그레이 티 베이스"),
      home("초코 파우더/소스", "3스푼", HOME.powder30g, "초콜릿 파우더/소스"),
      home("우유", "120ml", 300, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "black-milk-tea",
    slug: "black-milk-tea",
    name: "블랙 밀크티 + 펄",
    category: "버블티·밀크티",
    price: 5100,
    emoji: "🧋",
    photoBg: "#EFEBE9",
    difficulty: 2,
    time: "약 20분",
    ingredients: [
      ing("블랙티 농축 베이스", "150ml", 150 * B2B.teaPerMl),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("흑당·과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("타피오카 펄", "40g", 40 * B2B.tapiocaPerG),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("홍차 티백", "2개", HOME.teaBag * 2, "블랙티 농축 베이스"),
      home("물", "150ml", 10, "블랙티 농축 베이스"),
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("설탕", "1~2큰술", HOME.sugarSpoon * 2, "흑당·과당 시럽"),
      home("타피오카 펄", "40g", HOME.tapioca40g, "타피오카 펄"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    note: `Large 1잔 기준 · 펄 생략 가능 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  }),
);

menus.push(
  baseMenu({
    id: "taro-milk-tea",
    slug: "taro-milk-tea",
    name: "타로 밀크티",
    category: "버블티·밀크티",
    price: 5200,
    emoji: "🟣",
    photoBg: "#F3E5F5",
    difficulty: 3,
    time: "약 25분",
    ingredients: [
      ing("타로 파우더", "30g", 30 * B2B.powderPerG),
      ing("과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("타피오카 펄", "40g", 40 * B2B.tapiocaPerG),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("타피오카 펄", "40g", HOME.tapioca40g, "타피오카 펄"),
      home("타로 파우더", "3큰술", HOME.taroPowder3, "타로 파우더"),
      home("설탕", "1큰술", HOME.sugarSpoon, "과당 시럽"),
      home("물", "50ml", 10, "타로 파우더"),
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "mango-yogurt-white-pearl",
    slug: "mango-yogurt-white-pearl",
    name: "망고 요구르트 + 화이트 펄",
    category: "스무디·쉐이크",
    price: 5900,
    emoji: "🥭",
    photoBg: "#FFF3E0",
    difficulty: 2,
    time: "약 8분",
    ingredients: [
      ing("망고 퓨레", "150ml", 150 * B2B.teaPerMl),
      ing("요거트 베이스", "150ml", 150 * B2B.milkPerMl),
      ing("화이트 펄", "40g", 40 * B2B.tapiocaPerG),
      ing("얼음", "0.5컵", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("냉동 망고", "150g", HOME.mango150g, "망고 퓨레"),
      home("드링킹 요거트", "150ml", HOME.yogurt150ml, "요거트 베이스"),
      home("화이트 펄", "40g", HOME.whitePearl, "화이트 펄"),
      home("얼음", "0.5컵", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    id: "chocolate-milk-tea",
    slug: "chocolate-milk-tea",
    name: "초콜렛 밀크티",
    category: "버블티·밀크티",
    price: 5200,
    emoji: "🍫",
    photoBg: "#4E342E",
    ingredients: [
      ing("초콜릿 파우더", "30g", 30 * B2B.powderPerG),
      ing("초코 소스", "15ml", 15 * B2B.syrupPerMl),
      ing("티 베이스", "80ml", 80 * B2B.teaPerMl),
      ing("우유", "120ml", 120 * B2B.milkPerMl),
      ing("과당 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
    ],
    homeIngredients: [
      home("초코 파우더", "3스푼", HOME.powder30g, "초콜릿 파우더"),
      home("초코 소스", "1펌프", HOME.syrup15ml, "초코 소스"),
      home("홍차/티", "80ml", HOME.teaBag, "티 베이스"),
      home("우유", "120ml", 300, "우유"),
      home("설탕시럽", "1펌프", HOME.syrup15ml, "과당 시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

const outputMenus = filterCheaperAtHome(filterManualMenus(menus, "gongcha-", MANUAL));

if (outputMenus.length !== 15) {
  throw new Error(`Expected 15 manual menus but got ${outputMenus.length}`);
}

const out = `// generated by scripts/build-gongcha-menus.js
const GONGCHA_MENUS = ${JSON.stringify(outputMenus, null, 2)};

if (typeof window !== "undefined") {
  window.GONGCHA_MENUS = GONGCHA_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { GONGCHA_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${outputMenus.length}`);
