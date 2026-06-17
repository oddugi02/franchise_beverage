const fs = require("fs");
const path = require("path");
const manualModule = require("./pascucci-manual-steps");
const PASCUCCI_MANUAL_SLUGS = new Set(manualModule.PASCUCCI_MANUAL_SLUGS);
const MANUAL = Object.fromEntries(Object.entries(manualModule).filter(([k]) => k !== "PASCUCCI_MANUAL_SLUGS"));
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { applyMenuFilters } = require("./apply-menu-filters");

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
  oatMilkPerMl: 2.2,
  pearlPerG: 5,
  milkTeaBasePerMl: 4,
  granitaPack: 400,
  yogurtPowderSpoon: 40,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrupPump: 60,
  lemonSpoon: 140,
  grapefruitSpoon: 400,
  greenGrapeJuice: 350,
  coconutMilk: 280,
  coldBrew50ml: 300,
  coldBrew70ml: 400,
  coldBrew100ml: 550,
  condensedSpoon: 95,
  yogurt: 130,
  yogurtIceCream: 480,
  vanillaIceCream: 450,
  whip: 350,
  herbTea: 120,
  cranberry: 200,
  ice: 50,
  hazelnutPump: 65,
  soyMilkPerMl: 2.4,
  strawberryJam: 80,
  frozenBerry100g: 180,
  frozenMango80g: 160,
  peachJuice: 860,
  cocoaSpoon: 90,
  matchaSpoon: 120,
  tapioca40g: 200,
  raspberryBase: 120,
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

const MENU_DEFS = [
  {
    slug: "hibiscus-bangso",
    name: "히비스커스 뱅쇼",
    category: "에이드·과일",
    price: 7000,
    emoji: "🍷",
    photoBg: "#FCE4EC",
    ingredients: [
      ing("프루티히피베이스", "150ml", 350),
      ing("윈터프룻펀치", "1ea", 80),
      ing("냉동크랜베리", "6ea", 60),
      ing("시나몬스틱", "1개", 30),
      ing("얼음", "2/3스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("허브티 티백", "1개", HOME.herbTea, "윈터프룻펀치"),
      home("크랜베리·히비스커스 주스", "150ml", HOME.cranberry, "프루티히피베이스"),
      home("물", "80ml", 10, "물"),
      home("냉동 크랜베리", "6개", HOME.cranberry, "냉동크랜베리"),
      home("얼음", "2/3컵", HOME.ice, "얼음"),
    ],
    difficulty: 3,
    time: "약 8분",
  },
  {
    slug: "plain-yogurt-granita",
    name: "플레인 요거트 그라니따",
    category: "프라페·프라푸치노",
    price: 6300,
    emoji: "🍦",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("우유", "100ml", 100 * B2B.milkPerMl),
      ing("요거트파우더", "4스푼", 4 * B2B.yogurtPowderSpoon),
      ing("심플시럽", "3펌프", 3 * B2B.syrupPerPump),
      ing("요거트 젤라또", "1스쿱", B2B.gelato),
      ing("얼음", "1스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("우유", "100ml", 100 * HOME.milkPerMl, "우유"),
      home("플레인 요거트", "2큰술", HOME.yogurt, "요거트파우더"),
      home("설탕시럽", "3펌프", 3 * HOME.syrupPump, "심플시럽"),
      home("요거트 아이스크림", "1스쿱", HOME.yogurtIceCream, "요거트 젤라또"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "berry-yogurt-granita",
    name: "블루베리 요거트 그라니따",
    category: "프라페·프라푸치노",
    price: 6900,
    emoji: "🫐",
    photoBg: "#FCE4EC",
    ingredients: [
      ing("냉동딸기요거트/블루베리", "1팩", 420),
      ing("우유", "125ml", 125 * B2B.milkPerMl),
      ing("요거트 젤라또", "1스쿱", B2B.gelato),
      ing("얼음", "7개", B2B.ice * 0.7),
      cup(),
    ],
    homeIngredients: [
      home("냉동 딸기", "100g", HOME.frozenBerry100g, "냉동딸기요거트/블루베리"),
      home("우유", "125ml", 125 * HOME.milkPerMl, "우유"),
      home("요거트 아이스크림", "1스쿱", HOME.yogurtIceCream, "요거트 젤라또"),
      home("얼음", "7개", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "mango-yogurt-granita",
    name: "망고요거트 그라니따",
    category: "프라페·프라푸치노",
    price: 6900,
    emoji: "🥭",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("망고패션그라니따", "1팩", B2B.granitaPack),
      ing("요거트파우더", "1스푼", B2B.yogurtPowderSpoon),
      ing("정수", "125ml", 125 * B2B.water),
      ing("요거트 젤라또", "1스쿱", B2B.gelato),
      ing("얼음", "7개", B2B.ice * 0.7),
      cup(),
    ],
    homeIngredients: [
      home("냉동 망고", "80g", HOME.frozenMango80g, "망고패션그라니따"),
      home("플레인 요거트", "1큰술", HOME.yogurt, "요거트파우더"),
      home("물", "125ml", 10, "정수"),
      home("요거트 아이스크림", "1스쿱", HOME.yogurtIceCream, "요거트 젤라또"),
      home("얼음", "7개", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "peach-shine-granita",
    name: "남작복숭아 그라니따",
    category: "프라페·프라푸치노",
    price: 7200,
    emoji: "🍑",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("복숭&샤머 그라니따", "1팩", B2B.granitaPack),
      ing("정수", "110ml", 110 * B2B.water),
      ing("요거트 젤라또", "1스쿱", B2B.gelato),
      cup(),
    ],
    homeIngredients: [
      home("복숭아 주스", "100ml", HOME.peachJuice, "복숭&샤머 그라니따"),
      home("물", "110ml", 10, "정수"),
      home("요거트 아이스크림", "1스쿱", HOME.yogurtIceCream, "요거트 젤라또"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "strawberry-granita",
    name: "딸기 그라니따",
    category: "프라페·프라푸치노",
    price: 6900,
    emoji: "🍓",
    photoBg: "#FFEBEE",
    ingredients: [
      ing("냉동딸기 그라니따", "1팩", B2B.granitaPack),
      ing("정수", "110ml", 110 * B2B.water),
      ing("딸기 젤라또", "1스쿱", B2B.gelato),
      cup(),
    ],
    homeIngredients: [
      home("냉동 딸기", "100g", HOME.frozenBerry100g, "냉동딸기 그라니따"),
      home("물", "110ml", 10, "정수"),
      home("바닐라 아이스크림", "1스쿱", HOME.vanillaIceCream, "딸기 젤라또"),
      home("딸기시럽", "1큰술", HOME.strawberryJam, "딸기 젤라또"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "sicilian-lemon-granita",
    name: "시칠리아 레몬 그라니따",
    category: "프라페·프라푸치노",
    price: 7500,
    emoji: "🍋",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("시칠리아레몬베이스", "70ml", 140),
      ing("정수", "80ml", 80 * B2B.water),
      ing("심플시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("요거트 젤라또", "1스쿱", B2B.gelato),
      ing("얼음", "1스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("레몬즙", "3큰술", 3 * HOME.lemonSpoon, "시칠리아레몬베이스"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "심플시럽"),
      home("물", "150ml", 10, "정수"),
      home("요거트 아이스크림", "1스쿱", HOME.yogurtIceCream, "요거트 젤라또"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "java-chip-granita",
    name: "자바칩 초코 그라니따",
    category: "프라페·프라푸치노",
    price: 6900,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("우유", "100ml", 100 * B2B.milkPerMl),
      ing("자바칩파우더", "60g", 180),
      ing("초콜릿시럽", "1펌프", B2B.syrupPerPump),
      ing("천일염젤라또", "1스쿱", B2B.gelato),
      ing("얼음", "1스쿱", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("우유", "100ml", 100 * HOME.milkPerMl, "우유"),
      home("코코아 파우더", "4큰술", 4 * HOME.cocoaSpoon, "자바칩파우더"),
      home("초코 시럽", "1펌프", HOME.syrupPump, "초콜릿시럽"),
      home("바닐라 아이스크림", "1스쿱", HOME.vanillaIceCream, "천일염젤라또"),
      home("초코 크런치", "한 줌", 80, "자바칩파우더"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "coconut-coffee-granita",
    name: "코코넛커피 그라니따",
    category: "프라페·프라푸치노",
    price: 7800,
    emoji: "🥥",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("코코넛 그라니따", "1팩", B2B.granitaPack),
      ing("우유", "125ml", 125 * B2B.milkPerMl),
      ing("콜드브루커피", "50ml", 50 * B2B.coldBrewPerMl),
      cup(),
    ],
    homeIngredients: [
      home("코코넛 밀크", "125ml", HOME.coconutMilk, "코코넛 그라니따"),
      home("우유", "50ml", 50 * HOME.milkPerMl, "우유"),
      home("콜드브루 원액", "50ml", HOME.coldBrew50ml, "콜드브루커피"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  },
];

const menus = MENU_DEFS.map((def) =>
  baseMenu({
    slug: def.slug,
    name: def.name,
    category: def.category,
    price: def.price,
    emoji: def.emoji,
    photoBg: def.photoBg,
    ingredients: def.ingredients,
    homeIngredients: def.homeIngredients,
    difficulty: def.difficulty,
    time: def.time,
  })
);

const pascucciMenus = applyMenuFilters(
  filterManualMenus(
    menus.filter((m) => PASCUCCI_MANUAL_SLUGS.has(m.id.replace(/^pascucci-/, ""))),
    "pascucci-",
    MANUAL
  ),
  "pascucci"
);

if (pascucciMenus.length !== PASCUCCI_MANUAL_SLUGS.size) {
  const got = new Set(pascucciMenus.map((m) => m.id.replace(/^pascucci-/, "")));
  const missing = [...PASCUCCI_MANUAL_SLUGS].filter((s) => !got.has(s));
  throw new Error(`Expected ${PASCUCCI_MANUAL_SLUGS.size} menus but got ${pascucciMenus.length}. Missing: ${missing.join(", ")}`);
}

const out = `// generated by scripts/build-pascucci-menus.js — 파스쿠찌 Quizlet 레시피 (${pascucciMenus.length}종)
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
