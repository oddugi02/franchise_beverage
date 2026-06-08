const fs = require("fs");
const path = require("path");
const MANUAL = require("./starbucks-manual-steps");
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { filterCheaperAtHome } = require("./filter-cheaper-at-home");

const OUTPUT_PATH = path.join(__dirname, "../starbucks-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerPump: 20,
  syrupPerMl: 7,
  teaPerMl: 7,
  juicePerMl: 8,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  frappeBase: 200,
  javaChipPowderG: 9,
  javaChipG: 3.8,
  icecreamG: 8,
  coldBrewPerMl: 8,
  grapefruitSpoon: 45,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrupPump: 60,
  syrup15ml: 180,
  teaBag: 90,
  herbTeaBag: 120,
  lemon60ml: 280,
  passionPump: 200,
  berryJuice120ml: 450,
  ice: 50,
  water: 5,
  caramelDrizzle: 85,
  javaChipPowder: 280,
  javaChipCrunch: 120,
  iceCream4spoon: 320,
  chocoSyrup: 80,
  whip50g: 350,
  grapefruit2spoon: 400,
  coldBrew125ml: 650,
  vanilla15ml: 180,
};

const GRANDE_NOTE =
  "그란데(Grande) 사이즈 기준 · 톨/벤티는 샷·시럽 펌프 수가 달라질 수 있어요";

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

function baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients, difficulty = 1, time = "약 5분", note }) {
  return {
    id: `sb-${slug}`,
    brand: "스타벅스",
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
      note: note || `스타벅스 제조 매뉴얼 기준 · ${GRANDE_NOTE} · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

function espressoCoffee({
  slug,
  name,
  category,
  price,
  shots,
  shotLabel = "원두(에스프레소)",
  milkMl = 0,
  waterMl = 0,
  syrupPumps = 0,
  syrupName = "바닐라 시럽",
  emoji,
  photoBg,
  extraIng = [],
  extraHome = [],
}) {
  const ingredients = [];
  if (waterMl > 0) ingredients.push(ing("찬물(정수)", `${waterMl}ml`, waterMl * B2B.water));
  if (milkMl > 0) ingredients.push(ing("우유", `${milkMl}ml`, milkMl * B2B.milkPerMl));
  if (syrupPumps > 0) ingredients.push(ing(syrupName, `${syrupPumps}펌프`, syrupPumps * B2B.syrupPerPump));
  ingredients.push(ing(shotLabel, `${shots}샷`, shots * B2B.espressoPerShot), ing("얼음", "가득", B2B.ice), cup(), ...extraIng);

  const homeIngredients = [];
  if (waterMl > 0) homeIngredients.push(home("물", `${waterMl}ml`, 10, "찬물(정수)"));
  if (milkMl > 0) homeIngredients.push(home("우유", `${milkMl}ml`, milkMl * HOME.milkPerMl, "우유"));
  if (syrupPumps > 0) {
    homeIngredients.push(home(syrupName, `${syrupPumps}펌프`, syrupPumps * HOME.syrupPump, syrupName));
  }
  homeIngredients.push(
    home("에스프레소 액상스틱", `${shots}개`, shots * HOME.espressoLiquidStick, shotLabel),
    home("얼음", "가득", HOME.ice, "얼음"),
    ...extraHome,
  );

  return baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients });
}

function shakenTea({ slug, name, teaName, teaMl, waterMl, syrupPumps, price, emoji, photoBg, extraIng = [], extraHome = [] }) {
  const ingredients = [
    ing(teaName, `${teaMl}ml`, teaMl * B2B.teaPerMl),
    ing("찬물", `${waterMl}ml`, waterMl * B2B.water),
    ing("클래식 시럽", `${syrupPumps}펌프`, syrupPumps * B2B.syrupPerPump),
    ing("얼음", "가득", B2B.ice),
    cup(),
    ...extraIng,
  ];
  const teaHome = teaName.includes("그린") ? "녹차 티백" : teaName.includes("패션") ? "허브티 티백" : "홍차 티백";
  const homeIngredients = [
    home(teaHome, "2개", HOME.teaBag * 2, teaName),
    home("물", `${waterMl + 80}ml`, 15, ["찬물", teaName]),
    home("설탕시럽", `${syrupPumps}펌프`, syrupPumps * HOME.syrupPump, "클래식 시럽"),
    home("얼음", "가득", HOME.ice, "얼음"),
    ...extraHome,
  ];
  return baseMenu({ slug, name, category: "에이드·과일", price, emoji, photoBg, ingredients, homeIngredients, difficulty: 2, time: "약 8분" });
}

const menus = [];

menus.push(
  espressoCoffee({
    slug: "iced-americano",
    name: "아이스 아메리카노",
    category: "커피",
    price: 4700,
    shots: 3,
    waterMl: 280,
    emoji: "☕",
    photoBg: "#E8F5E9",
  }),
);

menus.push(
  espressoCoffee({
    slug: "iced-cafe-latte",
    name: "아이스 카페라떼",
    category: "라떼",
    price: 5500,
    shots: 2,
    milkMl: 300,
    emoji: "🥛",
    photoBg: "#EFEBE9",
  }),
);

menus.push(
  espressoCoffee({
    slug: "iced-caramel-macchiato",
    name: "아이스 카라멜 마끼아또",
    category: "라떼",
    price: 5900,
    shots: 2,
    milkMl: 300,
    syrupPumps: 3,
    syrupName: "바닐라 시럽",
    emoji: "🍮",
    photoBg: "#FFF3E0",
    extraIng: [ing("카라멜 드리즐", "토핑", 40)],
    extraHome: [home("카라멜 시럽", "드리즐", HOME.caramelDrizzle, "카라멜 드리즐")],
  }),
);

menus.push(
  espressoCoffee({
    slug: "iced-flat-white",
    name: "아이스 플랫 화이트",
    category: "라떼",
    price: 5900,
    shots: 3,
    shotLabel: "리스레토 샷",
    milkMl: 300,
    emoji: "☕",
    photoBg: "#D7CCC8",
  }),
);

menus.push(
  shakenTea({
    slug: "iced-black-tea-shaken",
    name: "아이스 블랙티",
    teaName: "블랙티 베이스",
    teaMl: 120,
    waterMl: 120,
    syrupPumps: 4,
    price: 5500,
    emoji: "🍵",
    photoBg: "#EFEBE9",
  }),
);

menus.push(
  shakenTea({
    slug: "iced-green-tea-shaken",
    name: "아이스 그린티",
    teaName: "그린티 베이스",
    teaMl: 120,
    waterMl: 120,
    syrupPumps: 4,
    price: 5500,
    emoji: "🌿",
    photoBg: "#E8F5E9",
  }),
);

menus.push(
  shakenTea({
    slug: "iced-passion-tango-shaken",
    name: "아이스 패션탱고 티",
    teaName: "패션탱고 티 베이스",
    teaMl: 120,
    waterMl: 120,
    syrupPumps: 4,
    price: 5700,
    emoji: "🌺",
    photoBg: "#FCE4EC",
    extraHome: [home("패션후르츠 시럽", "1펌프", HOME.passionPump, "패션탱고 티 베이스")],
  }),
);

menus.push(
  shakenTea({
    slug: "iced-black-tea-lemonade",
    name: "아이스 블랙티 레모네이드",
    teaName: "블랙티 베이스",
    teaMl: 120,
    waterMl: 0,
    syrupPumps: 4,
    price: 5900,
    emoji: "🍋",
    photoBg: "#FFFDE7",
    extraIng: [ing("레모네이드 베이스", "120ml", 120 * B2B.syrupPerMl)],
    extraHome: [home("레몬즙", "60ml", HOME.lemon60ml, "레모네이드 베이스")],
  }),
);

menus.push(
  shakenTea({
    slug: "iced-green-tea-lemonade",
    name: "아이스 그린티 레모네이드",
    teaName: "그린티 베이스",
    teaMl: 120,
    waterMl: 0,
    syrupPumps: 4,
    price: 5900,
    emoji: "🍋",
    photoBg: "#F1F8E9",
    extraIng: [ing("레모네이드 베이스", "120ml", 120 * B2B.syrupPerMl)],
    extraHome: [home("레몬즙", "60ml", HOME.lemon60ml, "레모네이드 베이스")],
  }),
);

menus.push(
  baseMenu({
    slug: "very-berry-hibiscus-refresher",
    name: "베리 베리 히비스커스 리프레셔",
    category: "에이드·과일",
    price: 6300,
    emoji: "🫐",
    photoBg: "#F3E5F5",
    difficulty: 2,
    time: "약 6분",
    ingredients: [
      ing("리프레셔 주스 베이스", "120ml", 120 * B2B.juicePerMl),
      ing("찬물", "120ml", 120 * B2B.water),
      ing("동결건조 블랙베리 칩", "1스푼", 30),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("크랜베리·히비스커스 주스", "120ml", HOME.berryJuice120ml, "리프레셔 주스 베이스"),
      home("물", "120ml", 10, "찬물"),
      home("설탕시럽", "2펌프", HOME.syrupPump * 2, "리프레셔 주스 베이스"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    slug: "cool-lime-refresher",
    name: "쿨 라임 리프레셔",
    category: "에이드·과일",
    price: 6300,
    emoji: "🍋",
    photoBg: "#E0F7FA",
    difficulty: 2,
    time: "약 7분",
    ingredients: [
      ing("리프레셔 주스 베이스", "120ml", 120 * B2B.juicePerMl),
      ing("찬물", "120ml", 120 * B2B.water),
      ing("라임 슬라이스 칩", "1조각", 25),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("레몬즙", "40ml", 200, "리프레셔 주스 베이스"),
      home("녹차 티백", "1개", HOME.teaBag, "리프레셔 주스 베이스"),
      home("설탕시럽", "2펌프", HOME.syrupPump * 2, "리프레셔 주스 베이스"),
      home("물", "120ml", 10, "찬물"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    slug: "javachip-frappuccino",
    name: "자바칩 프라푸치노",
    category: "프라페·프라푸치노",
    price: 6500,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    difficulty: 3,
    time: "약 8분",
    ingredients: [
      ing("프라푸치노 로스트(커피)", "1샷", B2B.espressoPerShot),
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("모카·초코 프라푸 시럽", "베이스", B2B.frappeBase),
      ing("자바칩 파우더", "50g", 50 * B2B.javaChipPowderG),
      ing("자바칩 토핑", "1~2스푼", 60),
      ing("휘핑크림", "토핑", 80),
      ing("얼음", "5개", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("에스프레소 액상스틱", "1개", HOME.espressoLiquidStick, "프라푸치노 로스트(커피)"),
      home("우유", "135ml", Math.round(135 * HOME.milkPerMl), "우유"),
      home("바닐라 아이스크림", "4큰술", HOME.iceCream4spoon, "모카·초코 프라푸 시럽"),
      home("자바칩 파우더", "50g", HOME.javaChipPowder, "자바칩 파우더"),
      home("초코 크런치", "2큰술", HOME.javaChipCrunch, "자바칩 토핑"),
      home("휘핑크림", "토핑", HOME.whip50g, "휘핑크림"),
      home("얼음", "5개", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    slug: "grapefruit-honey-black-tea",
    name: "자몽허니 블랙티",
    category: "에이드·과일",
    price: 5900,
    emoji: "🍊",
    photoBg: "#FFF3E0",
    difficulty: 2,
    time: "약 7분",
    ingredients: [
      ing("자몽허니 베이스", "2스푼", 2 * B2B.grapefruitSpoon),
      ing("블랙티 베이스", "150ml", 150 * B2B.teaPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "2큰술", HOME.grapefruit2spoon, "자몽허니 베이스"),
      home("홍차 티백", "2개", HOME.teaBag * 2, "블랙티 베이스"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  baseMenu({
    slug: "vanilla-cream-cold-brew",
    name: "바닐라 크림 콜드 브루",
    category: "커피",
    price: 5800,
    emoji: "🧊",
    photoBg: "#E3F2FD",
    difficulty: 2,
    time: "약 6분",
    ingredients: [
      ing("콜드브루 농축액", "125ml", 125 * B2B.coldBrewPerMl),
      ing("우유", "50ml", 50 * B2B.milkPerMl),
      ing("바닐라 크림(업체용)", "50g", 50 * B2B.whipPerG),
      ing("바닐라 시럽", "15ml", 15 * B2B.syrupPerMl),
      ing("얼음", "8~10개", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("콜드브루 원액", "125ml", HOME.coldBrew125ml, "콜드브루 농축액"),
      home("우유", "50ml", 50 * HOME.milkPerMl, "우유"),
      home("휘핑크림", "50g", HOME.whip50g, "바닐라 크림(업체용)"),
      home("바닐라 시럽", "15ml", HOME.vanilla15ml, "바닐라 시럽"),
      home("얼음", "8~10개", HOME.ice, "얼음"),
    ],
  }),
);

const outputMenus = filterCheaperAtHome(filterManualMenus(menus, "sb-", MANUAL));

if (outputMenus.length !== 14) {
  throw new Error(`Expected 14 manual menus but got ${outputMenus.length}`);
}

const minPrice = Math.min(...outputMenus.map((m) => m.price));
const maxPrice = Math.max(...outputMenus.map((m) => m.price));
if (minPrice < 4000 || maxPrice > 7000) {
  throw new Error(`Price out of range: ${minPrice} ~ ${maxPrice}`);
}

const out = `// generated by scripts/build-starbucks-menus.js
const STARBUCKS_MENUS = ${JSON.stringify(outputMenus, null, 2)};

if (typeof window !== "undefined") {
  window.STARBUCKS_MENUS = STARBUCKS_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { STARBUCKS_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${outputMenus.length}`);
console.log(`Price range: ${minPrice}~${maxPrice}`);
