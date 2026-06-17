const fs = require("fs");
const path = require("path");
const manualModule = require("./ediya-manual-steps");
const EDIIYA_MANUAL_SLUGS = new Set(manualModule.EDIIYA_MANUAL_SLUGS);
const MANUAL = Object.fromEntries(Object.entries(manualModule).filter(([k]) => k !== "EDIIYA_MANUAL_SLUGS"));

const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { applyMenuFilters } = require("./apply-menu-filters");

const OUTPUT_PATH = path.join(__dirname, "../ediya-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerPump: 20,
  powderPerSpoon: 45,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrupPump: 60,
  powderSpoon: 100,
  chocoSpoon: 180,
  toffeeStick: 220,
  grainPowder: 200,
  yujaSpoon: 120,
  appleSyrup: 150,
  grapefruitSpoon: 400,
  condensedSpoon: 95,
  iceCream: 320,
  oreo2: 250,
  ice: 50,
  whip: 350,
  mintPowder: 200,
  mangoSyrup: 150,
  yogurtPowder: 120,
  blueberryJam: 140,
  strawberrySyrup: 150,
  coffeeMix: 200,
  chocoChip: 80,
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

function baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients, difficulty = 2, time = "약 5분" }) {
  return {
    id: `ediya-${slug}`,
    brand: "이디야",
    name,
    category,
    price,
    emoji,
    photoBg,
    recipeReady: true,
    listHidden: false,
    ingredients,
    recipe: {
      homeIngredients,
      steps: stepsFromManual(slug, homeIngredients),
      difficulty,
      time,
      note: `이디야 Quizlet 레시피 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

const flatccinoIce = ing("얼음", "1컵", B2B.ice * 1.5);
const flatccinoIceHome = home("얼음", "1컵", HOME.ice, "얼음");

const menus = [
  baseMenu({
    slug: "iced-igok-latte",
    name: "이곡 라떼",
    category: "라떼",
    price: 4200,
    emoji: "🌾",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("이곡파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("곡물 파우더", "2큰술", 2 * HOME.grainPowder, "이곡파우더"),
      home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
  baseMenu({
    slug: "iced-toffeenut-latte",
    name: "토피넛 라떼",
    category: "라떼",
    price: 4200,
    emoji: "🥜",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("토피넛파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("토피넛 라떼 스틱", "1개", HOME.toffeeStick, "토피넛파우더"),
      home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
  baseMenu({
    slug: "iced-mint-mocha",
    name: "민트 모카",
    category: "라떼",
    price: 4800,
    emoji: "🌿",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("원두(에스프레소)", "1샷", B2B.espressoPerShot),
      ing("모카시럽", "1펌프", B2B.syrupPerPump),
      ing("민트초코렛파우더", "1스푼", B2B.powderPerSpoon),
      ing("우유", "180ml", 180 * B2B.milkPerMl),
      ing("휘핑크림", "토핑", 80),
      ing("얼음", "9부", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("에스프레소 액상스틱", "1개", HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("초코 시럽", "1펌프", HOME.syrupPump, "모카시럽"),
      home("민트 초코 파우더", "1큰술", HOME.mintPowder, "민트초코렛파우더"),
      home("우유", "180ml", 180 * HOME.milkPerMl, "우유"),
      home("휘핑크림", "토핑", HOME.whip, "휘핑크림"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 3,
  }),
  baseMenu({
    slug: "mango-flatccino",
    name: "망고 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🥭",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("망고시럽", "3펌프", 3 * B2B.syrupPerPump),
      ing("물", "80ml", 80 * B2B.water),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("망고 시럽", "3펌프", 3 * HOME.mangoSyrup, "망고시럽"),
      home("물", "80ml", 10, "물"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "grapefruit-flatccino",
    name: "자몽 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🍊",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("자몽시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("카페시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("물", "80ml", 80 * B2B.water),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "2큰술", 2 * HOME.grapefruitSpoon, "자몽시럽"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "카페시럽"),
      home("물", "80ml", 10, "물"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "yuja-flatccino",
    name: "유자 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🍋",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("유자시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("카페시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("물", "80ml", 80 * B2B.water),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("유자차", "2큰술", 2 * HOME.yujaSpoon, "유자시럽"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "카페시럽"),
      home("물", "80ml", 10, "물"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "green-apple-flatccino",
    name: "그린애플 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🍏",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("그린애플시럽", "시럽선", 3 * B2B.syrupPerPump),
      ing("카페시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("물", "100ml", 100 * B2B.water),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("사과 농축액", "2큰술", 2 * HOME.appleSyrup, "그린애플시럽"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "카페시럽"),
      home("물", "100ml", 10, "물"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "choco-chip-flatccino",
    name: "초콜릿 칩 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("자바칩파우더", "1스푼", B2B.powderPerSpoon),
      ing("모카시럽", "3펌프", 3 * B2B.syrupPerPump),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("휘핑크림", "토핑", 80),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("코코아 파우더", "2큰술", 2 * HOME.chocoSpoon, "자바칩파우더"),
      home("초코 시럽", "3펌프", 3 * HOME.syrupPump, "모카시럽"),
      home("휘핑크림", "토핑", HOME.whip, "휘핑크림"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "mint-choco-chip-flatccino",
    name: "민트 초콜릿 칩 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🌿",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("민트초코렛파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("초콜렛칩", "1스푼", 45),
      ing("모카시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("휘핑크림", "토핑", 80),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("민트 초코 파우더", "2큰술", 2 * HOME.mintPowder, "민트초코렛파우더"),
      home("초코 시럽", "2펌프", 2 * HOME.syrupPump, "모카시럽"),
      home("초코칩", "1큰술", HOME.chocoChip, "초콜렛칩"),
      home("휘핑크림", "토핑", HOME.whip, "휘핑크림"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "plain-yogurt-flatccino",
    name: "플레인 요거트 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🥛",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("요거트파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("요거트 파우더", "2큰술", 2 * HOME.yogurtPowder, "요거트파우더"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "blueberry-yogurt-flatccino",
    name: "블루베리 요거트 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🫐",
    photoBg: "#E3F2FD",
    ingredients: [
      ing("요거트파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("블루베리시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("요거트 파우더", "2큰술", 2 * HOME.yogurtPowder, "요거트파우더"),
      home("블루베리 잼", "2큰술", 2 * HOME.blueberryJam, "블루베리시럽"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "strawberry-yogurt-flatccino",
    name: "딸기요거트 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🍓",
    photoBg: "#FCE4EC",
    ingredients: [
      ing("요거트파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("딸기시럽", "1펌프", B2B.syrupPerPump),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      flatccinoIce,
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("요거트 파우더", "2큰술", 2 * HOME.yogurtPowder, "요거트파우더"),
      home("딸기시럽", "1펌프", HOME.strawberrySyrup, "딸기시럽"),
      flatccinoIceHome,
    ],
  }),
  baseMenu({
    slug: "origin-shake",
    name: "오리진 쉐이크",
    category: "스무디·쉐이크",
    price: 4500,
    emoji: "🥛",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("밀크메이트", "1", 40),
      ing("쉐이크 베이스", "1팩", 200),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("얼음", "반 컵", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
      home("연유", "2큰술", 2 * HOME.condensedSpoon, ["밀크메이트", "쉐이크 베이스"]),
      home("바닐라 아이스크림", "1스쿱", HOME.iceCream, "쉐이크 베이스"),
      home("얼음", "반 컵", HOME.ice, "얼음"),
    ],
  }),
  baseMenu({
    slug: "espresso-shake",
    name: "에스프레소 쉐이크",
    category: "스무디·쉐이크",
    price: 4500,
    emoji: "☕",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("비니스트 마일드", "1봉", 120),
      ing("쉐이크 베이스", "1팩", 200),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("얼음", "반 컵", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
      home("커피믹스", "1봉", HOME.coffeeMix, "비니스트 마일드"),
      home("바닐라 아이스크림", "1스쿱", HOME.iceCream, "쉐이크 베이스"),
      home("얼음", "반 컵", HOME.ice, "얼음"),
    ],
  }),
  baseMenu({
    slug: "choco-cookie-shake",
    name: "초코쿠키 쉐이크",
    category: "스무디·쉐이크",
    price: 4500,
    emoji: "🍪",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("밀크메이트", "1", 40),
      ing("쿠키분태", "1", 70),
      ing("쉐이크 베이스", "1팩", 200),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("얼음", "반 컵", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
      home("연유", "1큰술", HOME.condensedSpoon, "밀크메이트"),
      home("오레오", "2개", HOME.oreo2, "쿠키분태"),
      home("바닐라 아이스크림", "1스쿱", HOME.iceCream, "쉐이크 베이스"),
      home("얼음", "반 컵", HOME.ice, "얼음"),
    ],
  }),
];

const ediyaMenus = applyMenuFilters(
  filterManualMenus(
    menus.filter((m) => EDIIYA_MANUAL_SLUGS.has(m.id.replace(/^ediya-/, ""))),
    "ediya-",
    MANUAL
  ),
  "ediya"
);

if (ediyaMenus.length < 1) {
  throw new Error("No Ediya menus with photos");
}

const out = `// generated by scripts/build-ediya-menus.js — 이디야 특색 메뉴 (${ediyaMenus.length}종)
const EDIIYA_MENUS = ${JSON.stringify(ediyaMenus, null, 2)};

if (typeof window !== "undefined") {
  window.EDIIYA_MENUS = EDIIYA_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { EDIIYA_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${ediyaMenus.length}`);
