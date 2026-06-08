const fs = require("fs");
const path = require("path");
const manualModule = require("./pascucci-manual-steps");
const PASCUCCI_MANUAL_SLUGS = new Set(manualModule.PASCUCCI_MANUAL_SLUGS);
const MANUAL = Object.fromEntries(Object.entries(manualModule).filter(([k]) => k !== "PASCUCCI_MANUAL_SLUGS"));
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { filterCheaperAtHome } = require("./filter-cheaper-at-home");

const OUTPUT_PATH = path.join(__dirname, "../pascucci-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerPump: 20,
  powderPerSpoon: 45,
  pureePerG: 3.5,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  condensedPerG: 8,
  coldBrewPerMl: 8,
  coconutPerMl: 6,
  gelato: 450,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrupPump: 60,
  matchaSpoon: 120,
  misutgaruSpoon: 80,
  honeySpoon: 200,
  lemonSpoon: 140,
  yujaSpoon: 120,
  grapefruitSpoon: 400,
  grapeJuice: 350,
  coconutMilk: 280,
  coldBrew80ml: 450,
  condensedSpoon: 95,
  beanPowder: 90,
  redBean: 120,
  riceCake: 200,
  yogurt: 130,
  whip: 350,
  ubePowder: 180,
  herbTea: 120,
  cranberry: 200,
  ice: 50,
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

function cup() {
  return ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw);
}

function stepsFromManual(slug, homeIngredients = []) {
  const manual = MANUAL[slug];
  if (!manual) return [];
  return stepsFromManualHome(manual, homeIngredients).map((body) => ({ title: "", body }));
}

function baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients, difficulty = 2, time = "약 6분" }) {
  return {
    id: `pascucci-${slug}`,
    brand: "파스쿠찌",
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
      note: `파스쿠찌 Quizlet 레시피 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

const menus = [];

menus.push(
  baseMenu({
    slug: "coconut-coffee-granita",
    name: "코코넛 커피 그라니따",
    category: "프라페·프라푸치노",
    price: 7800,
    emoji: "🥥",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("코코넛 그라니따", "1팩", 400),
      ing("우유", "100ml", 100 * B2B.milkPerMl),
      ing("콜드브루커피", "80ml", 80 * B2B.coldBrewPerMl),
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("코코넛 밀크", "150ml", HOME.coconutMilk, "코코넛 그라니따"),
      home("우유", "100ml", 100 * HOME.milkPerMl, "우유"),
      home("콜드브루 원액", "80ml", HOME.coldBrew80ml, "콜드브루커피"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "ube-coco",
    name: "우베 코코",
    category: "에이드·과일",
    price: 7200,
    emoji: "💜",
    photoBg: "#F3E5F5",
    ingredients: [
      ing("우베베이스", "20g", 70),
      ing("휘핑크림", "25g", 25 * B2B.whipPerG),
      ing("코코넛워터", "200ml", 200 * B2B.coconutPerMl),
      ing("얼음", "1/2스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("보라색 고구마 가루", "1큰술", HOME.ubePowder, "우베베이스"),
      home("휘핑크림", "2큰술", HOME.whip, "휘핑크림"),
      home("우유", "1큰술", 40, "우유"),
      home("코코넛 밀크", "200ml", HOME.coconutMilk, "코코넛워터"),
      home("얼음", "반 컵", HOME.ice, "얼음"),
    ],
    difficulty: 3,
  })
);

menus.push(
  baseMenu({
    slug: "ube-cream-cafe-latte",
    name: "우베크림 카페라떼",
    category: "라떼",
    price: 7500,
    emoji: "☕",
    photoBg: "#EDE7F6",
    ingredients: [
      ing("우베베이스", "20g", 70),
      ing("휘핑크림", "25g", 25 * B2B.whipPerG),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("바닐라빈 시럽", "1펌프", B2B.syrupPerPump),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("얼음", "1/2스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("보라색 고구마 가루", "1큰술", HOME.ubePowder, "우베베이스"),
      home("휘핑크림", "2큰술", HOME.whip, "휘핑크림"),
      home("우유", "1큰술", 40, "우유"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("바닐라 시럽", "1펌프", HOME.syrupPump, "바닐라빈 시럽"),
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("얼음", "반 컵", HOME.ice, "얼음"),
    ],
    difficulty: 3,
  })
);

menus.push(
  baseMenu({
    slug: "sicilian-lemon-granita",
    name: "시칠리아 레몬 그라니따",
    category: "프라페·프라푸치노",
    price: 7500,
    emoji: "🍋",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("시칠리아 레몬 베이스", "2oz", 140),
      ing("냉수", "5oz", 150),
      ing("심플시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("요거트 젤라또", "1스쿱", B2B.gelato),
      ing("얼음", "1스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("레몬즙", "3큰술", 3 * HOME.lemonSpoon, "시칠리아 레몬 베이스"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "심플시럽"),
      home("물", "150ml", 10, "냉수"),
      home("플레인 요거트", "2큰술", HOME.yogurt, "요거트 젤라또"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "pomelo-granita",
    name: "자몽 포멜로 그라니따",
    category: "프라페·프라푸치노",
    price: 7800,
    emoji: "🍊",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("포멜로베이스", "1팩", 450),
      ing("정수", "150ml", 150 * B2B.water),
      ing("자몽쌕", "2스푼", 60),
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "3큰술", 3 * HOME.grapefruitSpoon, "포멜로베이스"),
      home("물", "150ml", 10, "정수"),
      home("자몽청", "1큰술", HOME.grapefruitSpoon, "자몽쌕"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "red-bean-injeolmi-granita",
    name: "팥 인절미 그라니따",
    category: "프라페·프라푸치노",
    price: 7800,
    emoji: "🫘",
    photoBg: "#FBE9E7",
    ingredients: [
      ing("우유", "80ml", 80 * B2B.milkPerMl),
      ing("연유", "40g", 40 * B2B.condensedPerG),
      ing("콩가루", "3스쿱", 90),
      ing("팥", "1스쿱", 80),
      ing("인절미 떡", "3개", 120),
      ing("얼음", "1스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("우유", "80ml", 80 * HOME.milkPerMl, "우유"),
      home("연유", "2큰술", 2 * HOME.condensedSpoon, "연유"),
      home("콩가루", "2큰술", 2 * HOME.beanPowder, "콩가루"),
      home("팥", "2큰술", HOME.redBean, "팥"),
      home("찰떡", "3조각", HOME.riceCake, "인절미 떡"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
    difficulty: 3,
  })
);

menus.push(
  baseMenu({
    slug: "iced-hibiscus-vin-brulé",
    name: "아이스 히비스커스 뱅쇼",
    category: "에이드·과일",
    price: 7000,
    emoji: "🍷",
    photoBg: "#FCE4EC",
    ingredients: [
      ing("프루티히비베이스", "150ml", 350),
      ing("윈터프룻펀치", "1ea", 80),
      ing("냉동크랜베리", "6ea", 60),
      ing("레몬슬라이스", "4ea", 40),
      ing("시나몬스틱", "1개", 30),
      ing("얼음", "2/3스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("허브티 티백", "1개", HOME.herbTea, "윈터프룻펀치"),
      home("레몬즙", "2큰술", 2 * HOME.lemonSpoon, "프루티히비베이스"),
      home("냉동 크랜베리", "한 줌", HOME.cranberry, "냉동크랜베리"),
      home("물", "170ml", 15, "물"),
      home("얼음", "2/3컵", HOME.ice, "얼음"),
    ],
    difficulty: 3,
    time: "약 8분",
  })
);

menus.push(
  baseMenu({
    slug: "iced-matcha-latte",
    name: "아이스 제주말차라떼",
    category: "라떼",
    price: 6500,
    emoji: "🍵",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("말차그린티파우더", "20g", 20 * B2B.powderPerG),
      ing("우유", "220ml", 220 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("녹차 가루", "2큰술", 2 * HOME.matchaSpoon, "말차그린티파우더"),
      home("우유", "220ml", 220 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "iced-k-misutgaru-latte",
    name: "아이스 K오곡미숫가루 라떼",
    category: "라떼",
    price: 6200,
    emoji: "🌾",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("미숫가루 베이스", "250ml", 350),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("미숫가루", "3큰술", 3 * HOME.misutgaruSpoon, "미숫가루 베이스"),
      home("우유", "250ml", 250 * HOME.milkPerMl, "미숫가루 베이스"),
      home("꿀", "1큰술", HOME.honeySpoon, "미숫가루 베이스"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "grape-yogurt-cream-tea",
    name: "포도 요거 크림티",
    category: "버블티·밀크티",
    price: 6800,
    emoji: "🍇",
    photoBg: "#F3E5F5",
    ingredients: [
      ing("포도자스민베이스", "75ml", 200),
      ing("우유", "125ml", 125 * B2B.milkPerMl),
      ing("요거트", "30g", 35),
      ing("휘핑크림", "25g", 25 * B2B.whipPerG),
      ing("나타데코코", "2스푼", 40),
      ing("얼음", "2/3스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("코코넛 밀크", "1큰술", 50, "나타데코코"),
      home("포도 주스", "80ml", HOME.grapeJuice, "포도자스민베이스"),
      home("우유", "125ml", 125 * HOME.milkPerMl, "우유"),
      home("드링킹 요거트", "2큰술", HOME.yogurt, "요거트"),
      home("휘핑크림", "1큰술", HOME.whip, "휘핑크림"),
      home("얼음", "2/3컵", HOME.ice, "얼음"),
    ],
    difficulty: 3,
  })
);

menus.push(
  baseMenu({
    slug: "grapefruit-sparkling",
    name: "자몽 스파클링",
    category: "에이드·과일",
    price: 6500,
    emoji: "🫧",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("자몽퓨레", "60g", 60 * B2B.pureePerG),
      ing("심플시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("탄산수", "1캔", 300),
      ing("레몬슬라이스", "1ea", 15),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "3큰술", 3 * HOME.grapefruitSpoon, "자몽퓨레"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "심플시럽"),
      home("사이다", "1캔", 300, "탄산수"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "iced-lemon-yuzu-tea",
    name: "아이스 레몬 유자차",
    category: "에이드·과일",
    price: 6200,
    emoji: "🍋",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("리얼유자퓨레", "65ml", 230),
      ing("냉수", "150ml", 150 * B2B.water),
      ing("레몬슬라이스", "1ea", 15),
      ing("얼음", "2/3스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("유자차", "3큰술", 3 * HOME.yujaSpoon, "리얼유자퓨레"),
      home("물", "150ml", 10, "냉수"),
      home("레몬즙", "1큰술", HOME.lemonSpoon, "레몬슬라이스"),
      home("얼음", "2/3컵", HOME.ice, "얼음"),
    ],
  })
);

const pascucciMenus = filterCheaperAtHome(
  filterManualMenus(
    menus.filter((m) => PASCUCCI_MANUAL_SLUGS.has(m.id.replace(/^pascucci-/, ""))),
    "pascucci-",
    MANUAL
  )
);

if (pascucciMenus.length !== PASCUCCI_MANUAL_SLUGS.size) {
  const got = new Set(pascucciMenus.map((m) => m.id.replace(/^pascucci-/, "")));
  const missing = [...PASCUCCI_MANUAL_SLUGS].filter((s) => !got.has(s));
  throw new Error(`Expected ${PASCUCCI_MANUAL_SLUGS.size} menus but got ${pascucciMenus.length}. Missing: ${missing.join(", ")}`);
}

const out = `// generated by scripts/build-pascucci-menus.js — 파스쿠찌 특색 메뉴 (${pascucciMenus.length}종)
const PASCUCCI_MENUS = ${JSON.stringify(pascucciMenus, null, 2)};

if (typeof window !== "undefined") {
  window.PASCUCCI_MENUS = PASCUCCI_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { PASCUCCI_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${pascucciMenus.length}`);
