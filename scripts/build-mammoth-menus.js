const fs = require("fs");
const path = require("path");
const manualModule = require("./mammoth-manual-steps");
const MAMMOTH_MANUAL_SLUGS = new Set(manualModule.MAMMOTH_MANUAL_SLUGS);
const MANUAL = Object.fromEntries(Object.entries(manualModule).filter(([k]) => k !== "MAMMOTH_MANUAL_SLUGS"));
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { applyMenuFilters } = require("./apply-menu-filters");

const OUTPUT_PATH = path.join(__dirname, "../mammoth-menus.js");
const BRAND = "매머드 커피";

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  honeyPerG: 12,
  syrupPerPump: 20,
  syrupPerSpoon: 45,
  powderPerSpoon: 45,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  condensedPerG: 8,
  cookieEach: 70,
  chocolateSpoon: 90,
  teaBag: 35,
  milkTeaBasePerMl: 4,
  energyDrink: 1800,
  cheesePowder10g: 80,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  coffeeStick2: 230,
  honeySpoon: 180,
  syrupPump: 60,
  syrupSpoon: 180,
  powderSpoon: 100,
  ice: 50,
  condensed50g: 320,
  jollypong: 290,
  whipServing: 350,
  chocoCrunch: 120,
  cookie2: 250,
  nuts: 150,
  teaBag: 90,
  yogurt: 130,
  grapefruitSpoon: 400,
  lemonSpoon: 140,
  cider: 300,
  energyDrink: 1500,
  creamCheese: 120,
  caramelPump: 65,
  condensed90g: 580,
  condensed100g: 640,
  condensedDrizzle30g: 190,
  hazelnutPowder3: 300,
  bananaPowder2: 200,
  yuja2spoon: 280,
  lemonBalmBase5: 250,
  milkTeaBase50ml: 200,
  almondSlices: 150,
  mintSyrup4Pump: 240,
};

const M_SIZE_NOTE = "M(미디엄) 아이스 기준 · S/M만 있는 메뉴는 M 분량 적용";

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

function baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients, difficulty = 2, time = "약 6분", note }) {
  return {
    id: `mammoth-${slug}`,
    brand: BRAND,
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
      note: note || `${BRAND} Quizlet 레시피 기준 · ${M_SIZE_NOTE} · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

const frappeBase = (extras = []) => [
  ing("우유", "200ml", 200 * B2B.milkPerMl),
  ing("얼음", "가득+2알", B2B.ice * 1.2),
  ...extras,
  cup(),
];

const frappeHomeBase = (extras = []) => [
  home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
  home("얼음", "가득", HOME.ice, "얼음"),
  ...extras,
];

const MENU_DEFS = [
  {
    slug: "honey-coffee",
    name: "꿀커피",
    category: "커피",
    price: 3200,
    emoji: "🍯",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("꿀", "15g", 15 * B2B.honeyPerG),
      ing("물", "150ml", 150 * B2B.water),
      ing("얼음", "적당량", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("꿀", "1~2큰술", 1.5 * HOME.honeySpoon, "꿀"),
      home("물", "150ml", 10, "물"),
      home("얼음", "적당량", HOME.ice, "얼음"),
    ],
    difficulty: 1,
    time: "약 4분",
    note: `매머드 스타일 꿀커피 · 꿀은 뜨거운 커피에 먼저 녹인 뒤 얼음·물에 붓기 · ${M_SIZE_NOTE} · ${POOR_KITCHEN_RECIPE_NOTE}`,
  },
  {
    slug: "mint-choco-frappe",
    name: "민트초코프라페",
    category: "프라페·프라푸치노",
    price: 5200,
    emoji: "🌿",
    photoBg: "#E0F2F1",
    ingredients: frappeBase([
      ing("민트초코 파우더", "5스푼", 5 * B2B.powderPerSpoon),
      ing("다크컬 초콜릿", "1스푼", B2B.chocolateSpoon),
      ing("휘핑크림", "기본", 80),
      ing("초콜릿청크", "1스푼", B2B.chocolateSpoon),
    ]),
    homeIngredients: frappeHomeBase([
      home("코코아 파우더", "3큰술", 3 * HOME.powderSpoon, ["민트초코 파우더", "다크컬 초콜릿"]),
      home("민트 시럽", "1펌프", HOME.syrupPump, "민트초코 파우더"),
      home("휘핑크림", "토핑", HOME.whipServing, "휘핑크림"),
      home("초코 크런치", "1큰술", HOME.chocoCrunch, "초콜릿청크"),
    ]),
    note: `${BRAND} Quizlet 레시피 기준 · ${M_SIZE_NOTE} · 민트 맛은 민트 시럽으로 보완 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  },
  {
    slug: "pistachio-frappe",
    name: "피스타치오 프라페",
    category: "프라페·프라푸치노",
    price: 5300,
    emoji: "💚",
    photoBg: "#E8F5E9",
    ingredients: frappeBase([
      ing("피스타치오 파우더", "5스푼", 5 * B2B.powderPerSpoon),
      ing("휘핑크림", "토핑", 80),
    ]),
    homeIngredients: frappeHomeBase([
      home("피스타치오 파우더", "5큰술", 5 * HOME.powderSpoon, "피스타치오 파우더"),
      home("휘핑크림", "토핑", HOME.whipServing, "휘핑크림"),
    ]),
  },
  {
    slug: "java-chip-frappe",
    name: "자바칩 프라페",
    category: "프라페·프라푸치노",
    price: 5200,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    ingredients: frappeBase([
      ing("초코소스", "컵벽 1", 45),
      ing("모카자바파우더", "5스푼", 5 * B2B.powderPerSpoon),
      ing("초콜릿청크", "2스푼", 2 * B2B.chocolateSpoon),
      ing("휘핑크림", "토핑", 80),
    ]),
    homeIngredients: frappeHomeBase([
      home("초코 시럽", "컵벽", HOME.syrupSpoon, "초코소스"),
      home("코코아 파우더", "3큰술", 3 * HOME.powderSpoon, "모카자바파우더"),
      home("초코 크런치", "2큰술", 2 * HOME.chocoCrunch, "초콜릿청크"),
      home("휘핑크림", "토핑", HOME.whipServing, "휘핑크림"),
    ]),
  },
  {
    slug: "oreo-choco-frappe",
    name: "오레오 초코 프라페",
    category: "프라페·프라푸치노",
    price: 5100,
    emoji: "🍪",
    photoBg: "#EFEBE9",
    ingredients: frappeBase([
      ing("쿠앤크파우더", "5스푼", 5 * B2B.powderPerSpoon),
      ing("오레오 쿠키", "4개", 4 * B2B.cookieEach),
      ing("휘핑크림", "토핑", 80),
    ]),
    homeIngredients: frappeHomeBase([
      home("코코아 파우더", "2큰술", 2 * HOME.powderSpoon, "쿠앤크파우더"),
      home("오레오", "4개", HOME.cookie2 * 2, "오레오 쿠키"),
      home("휘핑크림", "토핑", HOME.whipServing, "휘핑크림"),
    ]),
  },
  {
    slug: "plain-yogurt-smoothie",
    name: "플레인 요거트 스무디",
    category: "프라페·프라푸치노",
    price: 4500,
    emoji: "🥛",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("요거트 파우더", "4스푼", 4 * B2B.powderPerSpoon),
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
      home("플레인 요거트", "3큰술", HOME.yogurt, "요거트 파우더"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "incredbull",
    name: "인크레드불",
    category: "에이드·과일",
    price: 5500,
    emoji: "⚡",
    photoBg: "#FFEBEE",
    ingredients: [
      ing("패션후르츠시럽", "1펌프", B2B.syrupPerPump),
      ing("블루베리시럽", "1펌프", B2B.syrupPerPump),
      ing("레드불", "1캔", B2B.energyDrink),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("패션후르츠 시럽", "1펌프", HOME.syrupPump, "패션후르츠시럽"),
      home("설탕시럽", "1펌프", HOME.syrupPump, "블루베리시럽"),
      home("에너지음료", "250ml", HOME.energyDrink, "레드불"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  },
  {
    slug: "hazelnut-coffee-ice",
    name: "헤이즐넷 커피",
    category: "커피",
    price: 4000,
    emoji: "🌰",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("헤이즐넛 파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("설탕시럽", "1펌프", B2B.syrupPerPump),
      ing("물", "물-얼-물", 2 * 80 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("헤이즐넛 시럽", "2펌프", 2 * HOME.syrupPump, "헤이즐넛 파우더"),
      home("설탕시럽", "1펌프", HOME.syrupPump, "설탕시럽"),
      home("물", "150ml", 10, "물"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 1,
    time: "약 4분",
  },
  {
    slug: "banana-sweet-coffee-ice",
    name: "바나나달달커피",
    category: "커피",
    price: 4500,
    emoji: "🍌",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("연유", "90g", 90 * B2B.condensedPerG),
      ing("바나나 파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("원두(에스프레소)", "3샷", 3 * B2B.espressoPerShot),
      ing("물", "물-얼-물", 2 * 80 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("연유", "3큰술", HOME.condensed90g, "연유"),
      home("바나나 우유", "100ml", 180, "바나나 파우더"),
      home("에스프레소 액상스틱", "3개", 3 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("물", "100ml", 10, "물"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    note: `${BRAND} Quizlet 레시피 기준 · ${M_SIZE_NOTE} · 샷은 섞지 않고 부어 제공 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  },
  {
    slug: "vietnamese-condensed-coffee",
    name: "베트남연유커피",
    category: "커피",
    price: 4800,
    emoji: "🇻🇳",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("연유", "100g", 100 * B2B.condensedPerG),
      ing("물", "녹이기용", 40 * B2B.water),
      ing("원두(에스프레소)", "3샷", 3 * B2B.espressoPerShot),
      ing("연유 드리즐", "30g", 30 * B2B.condensedPerG),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("연유", "4큰술+드리즐", HOME.condensed100g + HOME.condensedDrizzle30g, ["연유", "연유 드리즐"]),
      home("물", "30ml", 5, "물"),
      home("에스프레소 액상스틱", "3개", 3 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    note: `${BRAND} Quizlet 레시피 기준 · 아이스만 · ${M_SIZE_NOTE} · 샷은 섞지 않고 부어 제공 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  },
  {
    slug: "lemon-balm-mint-tea",
    name: "레몬밤민트티",
    category: "에이드·과일",
    price: 3900,
    emoji: "🌿",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("레몬밤 티 베이스", "5펌프", 5 * B2B.syrupPerPump),
      ing("멘타쿠바노 시럽", "4펌프", 4 * B2B.syrupPerPump),
      ing("얼음", "가득", B2B.ice),
      ing("물", "채움", 120 * B2B.water),
      cup(),
    ],
    homeIngredients: [
      home("허브티 티백", "1개", HOME.teaBag, "레몬밤 티 베이스"),
      home("민트 시럽", "4펌프", HOME.mintSyrup4Pump, "멘타쿠바노 시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
      home("물", "120ml", 10, "물"),
    ],
  },
  {
    slug: "hibiscus-citron-tea",
    name: "히비스커스유자티",
    category: "에이드·과일",
    price: 4000,
    emoji: "🍋",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("유자 베이스", "80", 80 * B2B.syrupPerSpoon / 10),
      ing("애플티", "150ml", 150 * B2B.teaPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("유자청", "2큰술", HOME.yuja2spoon, "유자 베이스"),
      home("사과 티백", "1개", HOME.teaBag, "애플티"),
      home("물", "150ml", 10, "애플티"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    note: `${BRAND} Quizlet 레시피 기준 · ${M_SIZE_NOTE} · 애플티는 온수 150ml + 애플티백 1개 우려 후 chilling · ${POOR_KITCHEN_RECIPE_NOTE}`,
  },
  {
    slug: "almond-milk-tea",
    name: "아몬드밀크티",
    category: "버블티·밀크티",
    price: 4200,
    emoji: "🥜",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("밀크티 베이스", "50", 50 * B2B.milkTeaBasePerMl),
      ing("아몬드 시럽", "1펌프", B2B.syrupPerPump),
      ing("우유", "우-얼-우", 200 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("아몬드 슬라이스", "토핑", 40),
      cup(),
    ],
    homeIngredients: [
      home("홍차 티백", "1개", HOME.teaBag, "밀크티 베이스"),
      home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
      home("아몬드 시럽", "1펌프", HOME.syrupPump, "아몬드 시럽"),
      home("아몬드 슬라이스", "토핑", HOME.almondSlices, "아몬드 슬라이스"),
      home("얼음", "가득", HOME.ice, "얼음"),
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
    note: def.note,
  })
);

const manualFiltered = filterManualMenus(
  menus.filter((m) => MAMMOTH_MANUAL_SLUGS.has(m.id.replace(/^mammoth-/, ""))),
  "mammoth-",
  MANUAL
);
const outputMenus = applyMenuFilters(manualFiltered, "mammoth");

if (manualFiltered.length !== MAMMOTH_MANUAL_SLUGS.size) {
  const got = new Set(manualFiltered.map((m) => m.id.replace(/^mammoth-/, "")));
  const missing = [...MAMMOTH_MANUAL_SLUGS].filter((s) => !got.has(s));
  throw new Error(`Expected ${MAMMOTH_MANUAL_SLUGS.size} menus but got ${manualFiltered.length}. Missing: ${missing.join(", ")}`);
}

const out = `// generated by scripts/build-mammoth-menus.js — 매머드 커피 대표 메뉴 (${outputMenus.length}종)
const MAMMOTH_MENUS = ${JSON.stringify(outputMenus, null, 2)};

if (typeof window !== "undefined") {
  window.MAMMOTH_MENUS = MAMMOTH_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { MAMMOTH_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Wrote ${outputMenus.length} menus → ${OUTPUT_PATH}`);
