const fs = require("fs");
const path = require("path");
const manualModule = require("./starbucks-manual-steps");
const STARBUCKS_MANUAL_SLUGS = manualModule.STARBUCKS_MANUAL_SLUGS;
const STARBUCKS_SIGNATURE_SLUGS = new Set(manualModule.STARBUCKS_SIGNATURE_SLUGS || []);
const MANUAL = Object.fromEntries(
  Object.entries(manualModule).filter(
    ([k]) => k !== "STARBUCKS_SIGNATURE_SLUGS" && k !== "STARBUCKS_MANUAL_SLUGS",
  ),
);
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { applyMenuFilters } = require("./apply-menu-filters");

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
  frappRoastPerPump: 35,
  powderPerSpoon: 45,
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
  condensed2spoon: 190,
  chocoPowder30g: 290,
  chocoBase150ml: 350,
  yogurt150ml: 550,
  yogurt100ml: 380,
  strawberryMix80g: 320,
  grapefruit2spoon: 400,
  chocoSyrup: 80,
  coldBrew125ml: 650,
  vanilla15ml: 180,
  matcha3Spoon: 300,
  chai2Spoon: 200,
  strawberryJuice120ml: 480,
  frozenStrawberry: 350,
  iceCream3spoon: 250,
};

const GRANDE_NOTE =
  "그란데(Grande) 사이즈 기준 · 톨/벤티는 샷·시럽 펌프 수가 달라질 수 있어요";

const SIGNATURE_HOME_NOTE = "유튜브·블로그 홈레시피 참고";

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
  const isSignature = STARBUCKS_SIGNATURE_SLUGS.has(slug);
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
      note:
        note ||
        (isSignature
          ? `${SIGNATURE_HOME_NOTE} · ${GRANDE_NOTE} · ${POOR_KITCHEN_RECIPE_NOTE}`
          : `스타벅스 제조 매뉴얼 기준 · ${GRANDE_NOTE} · ${POOR_KITCHEN_RECIPE_NOTE}`),
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

function frappeMenu({
  slug,
  name,
  price,
  emoji,
  photoBg,
  flavorPumps = 0,
  flavorName = "",
  flavorHomeLabel = "",
  flavorHomePrice = 0,
  withEspressoHome = false,
  withWhip = true,
  drizzleIng = null,
  drizzleHome = null,
}) {
  const ingredients = [
    ing("프라푸치노 로스트(커피)", "3펌프", 3 * B2B.frappRoastPerPump),
    ing("우유", "150ml", 150 * B2B.milkPerMl),
    ing("프라푸치노 베이스", "3펌프", 3 * B2B.frappRoastPerPump),
    ...(flavorPumps > 0 ? [ing(flavorName, `${flavorPumps}펌프`, flavorPumps * B2B.syrupPerPump)] : []),
    ing("얼음", "그란데 1스쿱", B2B.ice * 1.5),
    ...(withWhip ? [ing("휘핑크림", "토핑", 80)] : []),
    ...(drizzleIng ? [drizzleIng] : []),
    cup(),
  ];
  const homeIngredients = [
    home("우유", "150ml", 150 * HOME.milkPerMl, "우유"),
    home("바닐라 아이스크림", "3큰술", HOME.iceCream3spoon, ["프라푸치노 로스트(커피)", "프라푸치노 베이스"]),
    ...(withEspressoHome
      ? [home("에스프레소 액상스틱", "1개", HOME.espressoLiquidStick, "프라푸치노 로스트(커피)")]
      : []),
    ...(flavorPumps > 0
      ? [home(flavorHomeLabel || flavorName, `${flavorPumps}펌프`, flavorHomePrice || flavorPumps * HOME.syrupPump, flavorName)]
      : []),
    home("얼음", "5개", HOME.ice, "얼음"),
    ...(withWhip ? [home("휘핑크림", "토핑", HOME.whip50g, "휘핑크림")] : []),
    ...(drizzleHome ? [drizzleHome] : []),
  ];
  return baseMenu({
    slug,
    name,
    category: "프라페·프라푸치노",
    price,
    emoji,
    photoBg,
    ingredients,
    homeIngredients,
    difficulty: 3,
    time: "약 8분",
  });
}

const menus = [];

menus.push(
  baseMenu({
    slug: "vanilla-cream-cold-brew",
    name: "바닐라크림콜드브루",
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

menus.push(
  espressoCoffee({
    slug: "iced-americano",
    name: "아이스 아메리카노",
    category: "커피",
    price: 4500,
    shots: 2,
    waterMl: 200,
    emoji: "☕",
    photoBg: "#EFEBE9",
  }),
);

menus.push(
  espressoCoffee({
    slug: "iced-cafe-latte",
    name: "아이스 카페 라떼",
    category: "커피",
    price: 5500,
    shots: 2,
    milkMl: 300,
    emoji: "🥛",
    photoBg: "#FFF8E1",
  }),
);

menus.push(
  baseMenu({
    slug: "cold-brew",
    name: "콜드브루",
    category: "커피",
    price: 5400,
    emoji: "🧊",
    photoBg: "#E8EAF6",
    difficulty: 1,
    time: "약 3분",
    ingredients: [
      ing("콜드브루 농축액", "125ml", 125 * B2B.coldBrewPerMl),
      ing("찬물(정수)", "125ml", 125 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("콜드브루 원액", "125ml", HOME.coldBrew125ml, "콜드브루 농축액"),
      home("물", "125ml", 10, "찬물(정수)"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  espressoCoffee({
    slug: "cafe-mocha",
    name: "카페 모카",
    category: "커피",
    price: 5900,
    shots: 2,
    milkMl: 300,
    syrupPumps: 4,
    syrupName: "모카 시럽",
    emoji: "🍫",
    photoBg: "#D7CCC8",
    extraIng: [ing("휘핑크림", "토핑", 80)],
    extraHome: [home("휘핑크림", "토핑", HOME.whip50g, "휘핑크림")],
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
      home("초코 시럽", "토핑", HOME.chocoSyrup, "초코 드리즐"),
      home("얼음", "5개", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  espressoCoffee({
    slug: "iced-caramel-macchiato",
    name: "아이스 카라멜 마키아또",
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
  baseMenu({
    slug: "cool-lime-refresher",
    name: "쿨라임 리프레셔",
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
  frappeMenu({
    slug: "caramel-frappuccino",
    name: "캬라멜 프라푸치노",
    price: 6500,
    emoji: "🍮",
    photoBg: "#FFF3E0",
    flavorPumps: 3,
    flavorName: "카라멜 시럽",
    flavorHomeLabel: "카라멜 시럽",
    drizzleIng: ing("카라멜 드리즐", "토핑", 40),
    drizzleHome: home("카라멜 시럽", "드리즐", HOME.caramelDrizzle, "카라멜 드리즐"),
  }),
);

menus.push(
  baseMenu({
    slug: "strawberry-acai-refresher",
    name: "딸기 아사이 레모네이드 리프레셔",
    category: "에이드·과일",
    price: 6300,
    emoji: "🍓",
    photoBg: "#FCE4EC",
    difficulty: 2,
    time: "약 7분",
    ingredients: [
      ing("스트로베리 아사이 주스 베이스", "120ml", 120 * B2B.juicePerMl),
      ing("레모네이드 베이스", "120ml", 120 * B2B.syrupPerMl),
      ing("동결건조 딸기 칩", "1스푼", 30),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("딸기 주스", "120ml", HOME.strawberryJuice120ml, "스트로베리 아사이 주스 베이스"),
      home("레몬즙", "60ml", HOME.lemon60ml, "레모네이드 베이스"),
      home("설탕시럽", "2펌프", HOME.syrupPump * 2, "스트로베리 아사이 주스 베이스"),
      home("냉동 딸기", "2~3조각", HOME.frozenStrawberry, "동결건조 딸기 칩"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  frappeMenu({
    slug: "espresso-frappuccino",
    name: "에스프레소 프라푸치노",
    price: 6300,
    emoji: "☕",
    photoBg: "#EFEBE9",
    withEspressoHome: true,
    withWhip: false,
  }),
);

menus.push(
  espressoCoffee({
    slug: "iced-vanilla-latte",
    name: "아이스 바닐라 라떼",
    category: "라떼",
    price: 5900,
    shots: 2,
    milkMl: 300,
    syrupPumps: 4,
    syrupName: "바닐라 시럽",
    emoji: "🍦",
    photoBg: "#FFFDE7",
  }),
);

menus.push(
  espressoCoffee({
    slug: "cinnamon-dolce-latte",
    name: "시나몬 돌체 라떼",
    category: "라떼",
    price: 6300,
    shots: 2,
    milkMl: 300,
    syrupPumps: 4,
    syrupName: "시나몬 돌체 시럽",
    emoji: "🍯",
    photoBg: "#FFF8E1",
    extraIng: [ing("돌체 토핑", "토핑", 40), ing("휘핑크림", "토핑", 80)],
    extraHome: [
      home("휘핑크림", "토핑", HOME.whip50g, "휘핑크림"),
      home("시나몬 가루", "토핑", 30, "돌체 토핑"),
    ],
  }),
);

menus.push(
  baseMenu({
    slug: "iced-dolce-latte",
    name: "아이스 스타벅스 돌체라떼",
    category: "라떼",
    price: 6300,
    emoji: "🍯",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("돌체 소스(연유)", "3펌프", 3 * B2B.syrupPerPump),
      ing("무지방 우유", "300ml", 300 * B2B.milkPerMl),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("연유", "2큰술", HOME.condensed2spoon, "돌체 소스(연유)"),
      home("우유", "300ml", 300 * HOME.milkPerMl, "무지방 우유"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  }),
);

menus.push(
  espressoCoffee({
    slug: "white-mocha",
    name: "아이스 화이트 초콜릿 모카",
    category: "라떼",
    price: 6300,
    shots: 2,
    milkMl: 300,
    syrupPumps: 4,
    syrupName: "화이트 모카 시럽",
    emoji: "🤍",
    photoBg: "#FAFAFA",
    extraIng: [ing("휘핑크림", "토핑", 80)],
    extraHome: [home("휘핑크림", "토핑", HOME.whip50g, "휘핑크림")],
  }),
);

menus.push(
  baseMenu({
    slug: "signature-hot-chocolate",
    name: "시그니처 핫 초콜릿",
    category: "스무디·쉐이크",
    price: 6300,
    emoji: "🍫",
    photoBg: "#3E2723",
    difficulty: 2,
    time: "약 7분",
    ingredients: [
      ing("시그니처 초코 베이스", "피처 하단선", 150 * B2B.syrupPerMl),
      ing("우유", "상단선까지", 300 * B2B.milkPerMl),
      ing("휘핑크림", "토핑", 80),
      ing("초코 파우더", "토핑", 25),
      cup(),
    ],
    homeIngredients: [
      home("우유", "300ml", 300 * HOME.milkPerMl, "우유"),
      home("코코아 파우더", "3큰술", HOME.chocoPowder30g, "시그니처 초코 베이스"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "시그니처 초코 베이스"),
      home("휘핑크림", "토핑", HOME.whip50g, "휘핑크림"),
      home("코코아 파우더", "토핑", 30, "초코 파우더"),
    ],
  }),
);

menus.push(
  baseMenu({
    slug: "iced-signature-chocolate",
    name: "아이스 시그니처 초콜릿",
    category: "스무디·쉐이크",
    price: 6300,
    emoji: "🧊",
    photoBg: "#4E342E",
    ingredients: [
      ing("시그니처 초코 베이스", "로고 아래선", 120 * B2B.syrupPerMl),
      ing("우유", "상단선까지", 300 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("휘핑크림", "토핑", 80),
      ing("초코 파우더", "토핑", 25),
      cup(),
    ],
    homeIngredients: [
      home("코코아 파우더", "2큰술", HOME.chocoPowder30g, "시그니처 초코 베이스"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "시그니처 초코 베이스"),
      home("우유", "300ml", 300 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
      home("휘핑크림", "토핑", HOME.whip50g, "휘핑크림"),
      home("코코아 파우더", "토핑", 30, "초코 파우더"),
    ],
  }),
);

menus.push(
  baseMenu({
    slug: "strawberry-yogurt-blended",
    name: "딸기 요거트 블렌디드",
    category: "스무디·쉐이크",
    price: 6500,
    emoji: "🍓",
    photoBg: "#FCE4EC",
    difficulty: 3,
    time: "약 8분",
    ingredients: [
      ing("저지방 요거트", "하단선", 150 * B2B.milkPerMl),
      ing("무지방 우유", "중간선까지", 100 * B2B.milkPerMl),
      ing("클래식 시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("딸기 믹스", "1회", 120 * B2B.juicePerMl),
      ing("얼음", "그란데 1스쿱", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("드링킹 요거트", "150ml", HOME.yogurt150ml, "저지방 요거트"),
      home("우유", "100ml", HOME.yogurt100ml, "무지방 우유"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "클래식 시럽"),
      home("냉동 딸기", "80g", HOME.strawberryMix80g, "딸기 믹스"),
      home("얼음", "5개", HOME.ice, "얼음"),
    ],
  }),
);

const filtered = applyMenuFilters(filterManualMenus(menus, "sb-", MANUAL, STARBUCKS_MANUAL_SLUGS), "starbucks");
const order = new Map(STARBUCKS_MANUAL_SLUGS.map((slug, i) => [slug, i]));
const outputMenus = filtered.sort((a, b) => order.get(a.id.slice(3)) - order.get(b.id.slice(3)));

if (outputMenus.length < 1) {
  throw new Error("No Starbucks menus with photos");
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
