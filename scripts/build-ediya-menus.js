const fs = require("fs");
const path = require("path");
const manualModule = require("./ediya-manual-steps");
const EDIIYA_MANUAL_SLUGS = new Set(manualModule.EDIIYA_MANUAL_SLUGS);
const MANUAL = Object.fromEntries(Object.entries(manualModule).filter(([k]) => k !== "EDIIYA_MANUAL_SLUGS"));
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { filterCheaperAtHome } = require("./filter-cheaper-at-home");

const OUTPUT_PATH = path.join(__dirname, "../ediya-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerPump: 20,
  powderPerSpoon: 45,
  powderPerG: 9,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  pearlPerG: 3.8,
  condensedPerG: 8,
  fruitPack: 350,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrupPump: 60,
  powderSpoon: 100,
  chocoSpoon: 180,
  toffeeStick: 220,
  grainPowder: 200,
  taroPowder: 150,
  yujaSpoon: 120,
  appleSyrup: 150,
  grapefruitSpoon: 400,
  blueLemonPump: 120,
  lemonSpoon: 140,
  tapioca: 350,
  condensedSpoon: 95,
  iceCream: 320,
  oreo2: 250,
  ice: 50,
  whip: 350,
  mintPowder: 200,
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

const menus = [];

menus.push(
  baseMenu({
    slug: "iced-igok-latte",
    name: "아이스 이곡 라떼",
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
  })
);

menus.push(
  baseMenu({
    slug: "iced-toffeenut-latte",
    name: "아이스 토피넛 라떼",
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
  })
);

menus.push(
  baseMenu({
    slug: "iced-mint-mocha",
    name: "아이스 민트 모카",
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
  })
);

menus.push(
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
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "2큰술", 2 * HOME.grapefruitSpoon, "자몽시럽"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "카페시럽"),
      home("물", "80ml", 10, "물"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
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
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("유자차", "2큰술", 2 * HOME.yujaSpoon, "유자시럽"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "카페시럽"),
      home("물", "80ml", 10, "물"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
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
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("사과 농축액", "2큰술", 2 * HOME.appleSyrup, "그린애플시럽"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "카페시럽"),
      home("물", "100ml", 10, "물"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "red-bean-flatccino",
    name: "레드빈 플랫치노",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🫘",
    photoBg: "#FBE9E7",
    ingredients: [
      ing("플랫치노파우더", "1스푼", B2B.powderPerSpoon),
      ing("팥", "3스푼", 90),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("연유", "1큰술", HOME.condensedSpoon, "플랫치노파우더"),
      home("팥", "3큰술", 120, "팥"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
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
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
      home("코코아 파우더", "2큰술", 2 * HOME.chocoSpoon, "자바칩파우더"),
      home("초코 시럽", "3펌프", 3 * HOME.syrupPump, "모카시럽"),
      home("휘핑크림", "토핑", HOME.whip, "휘핑크림"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "taro-bubble-tea",
    name: "타로 버블티",
    category: "버블티·밀크티",
    price: 5200,
    emoji: "🟣",
    photoBg: "#F3E5F5",
    ingredients: [
      ing("밀크메이트", "2", 80),
      ing("타로파우더", "1스푼", B2B.powderPerSpoon),
      ing("카페시럽", "1펌프", B2B.syrupPerPump),
      ing("타피오카펄", "1인분", 150),
      ing("물", "150ml", 150 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("연유", "2큰술", 2 * HOME.condensedSpoon, "밀크메이트"),
      home("타로 가루", "1큰술", HOME.taroPowder, "타로파우더"),
      home("설탕시럽", "1펌프", HOME.syrupPump, "카페시럽"),
      home("타피오카 펄", "1인분", HOME.tapioca, "타피오카펄"),
      home("물", "150ml", 10, "물"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 3,
    time: "약 8분",
  })
);

menus.push(
  baseMenu({
    slug: "toffeenut-bubble-tea",
    name: "토피넛 버블티",
    category: "버블티·밀크티",
    price: 5200,
    emoji: "🧋",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("밀크메이트", "2", 80),
      ing("토피넛파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("타피오카펄", "1인분", 150),
      ing("물", "150ml", 150 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("연유", "2큰술", 2 * HOME.condensedSpoon, "밀크메이트"),
      home("토피넛 라떼 스틱", "1개", HOME.toffeeStick, "토피넛파우더"),
      home("타피오카 펄", "1인분", HOME.tapioca, "타피오카펄"),
      home("물", "150ml", 10, "물"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 3,
    time: "약 8분",
  })
);

menus.push(
  baseMenu({
    slug: "blue-lemon-ade",
    name: "블루레몬 에이드",
    category: "에이드·과일",
    price: 4000,
    emoji: "💙",
    photoBg: "#E3F2FD",
    ingredients: [
      ing("레몬베이스", "2펌프", 2 * B2B.syrupPerPump),
      ing("블루큐라소시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("탄산수", "1캔", 300),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("레몬즙", "2큰술", 2 * HOME.lemonSpoon, "레몬베이스"),
      home("블루 레몬 시럽", "2펌프", 2 * HOME.blueLemonPump, "블루큐라소시럽"),
      home("사이다", "1캔", 300, "탄산수"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
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
  })
);

menus.push(
  baseMenu({
    slug: "choco-cookie-shake",
    name: "초코 쿠키 쉐이크",
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
  })
);

const ediyaMenus = filterCheaperAtHome(
  filterManualMenus(
    menus.filter((m) => EDIIYA_MANUAL_SLUGS.has(m.id.replace(/^ediya-/, ""))),
    "ediya-",
    MANUAL
  )
);

if (ediyaMenus.length !== EDIIYA_MANUAL_SLUGS.size) {
  const got = new Set(ediyaMenus.map((m) => m.id.replace(/^ediya-/, "")));
  const missing = [...EDIIYA_MANUAL_SLUGS].filter((s) => !got.has(s));
  throw new Error(`Expected ${EDIIYA_MANUAL_SLUGS.size} menus but got ${ediyaMenus.length}. Missing: ${missing.join(", ")}`);
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
