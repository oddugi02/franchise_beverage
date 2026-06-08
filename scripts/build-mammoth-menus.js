const fs = require("fs");
const path = require("path");
const MANUAL = require("./mammoth-manual-steps");
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { filterCheaperAtHome } = require("./filter-cheaper-at-home");

const OUTPUT_PATH = path.join(__dirname, "../mammoth-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerPump: 20,
  syrupPerSpoon: 45,
  powderPerSpoon: 45,
  powderPerG: 9,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  condensedPerG: 8,
  cookieEach: 70,
  chocolateSpoon: 90,
  teaBag: 35,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrupPump: 60,
  syrupSpoon: 180,
  powderSpoon: 100,
  hazelnutPump: 270,
  chocoSpoon: 180,
  ice: 50,
  water: 5,
  condensed50g: 320,
  jollypong: 290,
  whipServing: 350,
  chocoCrunch: 120,
  cookie2: 250,
  nuts: 150,
  teaBag: 90,
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

function baseMenu({
  slug,
  name,
  category,
  price,
  emoji,
  photoBg,
  ingredients,
  homeIngredients,
  difficulty = 1,
  time = "약 5분",
  note,
}) {
  return {
    id: `mammoth-${slug}`,
    brand: "매머드익스프레스",
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
      note: note || `매머드익스프레스 제조 매뉴얼 기준 · ${M_SIZE_NOTE} · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

const menus = [];

// ── 카테고리 1: 커피·에스프레소 ──
menus.push(
  baseMenu({
    slug: "iced-cafe-mocha",
    name: "아이스 카페모카",
    category: "라떼",
    price: 4500,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("초코소스", "2스푼", 2 * B2B.syrupPerSpoon),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("우유", "250ml", 250 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      ing("초코 파우더", "토핑", 45),
      cup(),
    ],
    homeIngredients: [
      home("코코아 파우더", "2큰술", 2 * HOME.powderSpoon, ["초코소스", "초코 파우더"]),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("우유", "250ml", 250 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 2,
    time: "약 5분",
  })
);

menus.push(
  baseMenu({
    slug: "iced-hazelnut-coffee",
    name: "아이스 헤이즐넛 커피",
    category: "커피",
    price: 3000,
    emoji: "🌰",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("헤이즐넛 파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("설탕시럽", "1펌프", B2B.syrupPerPump),
      ing("물", "250ml", 250 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("헤이즐넛 시럽", "2펌프", 2 * HOME.hazelnutPump, "헤이즐넛 파우더"),
      home("설탕시럽", "1펌프", HOME.syrupPump, "설탕시럽"),
      home("물", "250ml", 15, "물"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "iced-hazelnut-latte",
    name: "아이스 헤이즐넛 라떼",
    category: "라떼",
    price: 3800,
    emoji: "🌰",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("헤이즐넛 파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("우유", "250ml", 250 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("헤이즐넛 시럽", "2펌프", 2 * HOME.hazelnutPump, "헤이즐넛 파우더"),
      home("우유", "250ml", 250 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

// ── 카테고리 2: 논커피 라떼 ──
menus.push(
  baseMenu({
    slug: "iced-green-tea-latte",
    name: "아이스 녹차라떼",
    category: "라떼",
    price: 3800,
    emoji: "🍵",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("녹차파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("온수", "20ml", 20 * B2B.water),
      ing("우유", "250ml", 250 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("녹차 가루", "3큰술", 3 * HOME.powderSpoon, "녹차파우더"),
      home("뜨거운 물", "20ml", 5, "온수"),
      home("우유", "250ml", 250 * HOME.milkPerMl, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 2,
    time: "약 5분",
  })
);

// ── 카테고리 3: 프라페·퐁 ──
function frappeMenu({
  slug,
  name,
  price,
  emoji,
  photoBg,
  storeExtras = [],
  homeExtras = [],
  difficulty = 2,
  time = "약 8분",
  note,
}) {
  const ingredients = [
    ing("우유", "200ml", 200 * B2B.milkPerMl),
    ing("얼음", "가득", B2B.ice),
    ...storeExtras,
    cup(),
  ];
  const homeIngredients = [
    home("우유", "200ml", 200 * HOME.milkPerMl, "우유"),
    home("얼음", "가득", HOME.ice, "얼음"),
    ...homeExtras,
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
    difficulty,
    time,
    note,
  });
}

menus.push(
  frappeMenu({
    slug: "mint-choco-frappe",
    name: "민트초코 프라페",
    price: 5200,
    emoji: "🌿",
    photoBg: "#E0F2F1",
    storeExtras: [
      ing("민트초코 파우더", "5스푼", 5 * B2B.powderPerSpoon),
      ing("다크컬 초콜릿", "1스푼", B2B.chocolateSpoon),
      ing("휘핑크림", "토핑", 80),
      ing("초콜릿청크", "1스푼", B2B.chocolateSpoon),
    ],
    homeExtras: [
      home("코코아 파우더", "3큰술", 3 * HOME.powderSpoon, ["민트초코 파우더", "다크컬 초콜릿"]),
      home("휘핑크림", "토핑", HOME.whipServing, "휘핑크림"),
      home("초코 크런치", "1큰술", HOME.chocoCrunch, "초콜릿청크"),
    ],
    note: `매머드익스프레스 제조 매뉴얼 기준 · ${M_SIZE_NOTE} · 민트 맛은 민트 시럽·민트 초콜릿으로 보완 가능 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  })
);

menus.push(
  frappeMenu({
    slug: "pistachio-almond-frappe",
    name: "피스타치오 아몬드 프라페",
    price: 5300,
    emoji: "💚",
    photoBg: "#E8F5E9",
    storeExtras: [
      ing("피스타치오 파우더", "4.5스푼", 4.5 * B2B.powderPerSpoon),
      ing("초코 소스", "드리즐", 40),
      ing("휘핑크림", "토핑", 80),
      ing("슬라이스 아몬드", "토핑", 60),
    ],
    homeExtras: [
      home("피스타치오 파우더", "4.5큰술", 4.5 * HOME.powderSpoon, "피스타치오 파우더"),
      home("초코 소스", "드리즐", HOME.chocoSpoon, "초코 소스"),
      home("휘핑크림", "토핑", HOME.whipServing, "휘핑크림"),
      home("견과류", "토핑", HOME.nuts, "슬라이스 아몬드"),
    ],
  })
);

menus.push(
  frappeMenu({
    slug: "milk-pong-frappe",
    name: "밀크퐁프라페",
    price: 4900,
    emoji: "🥣",
    photoBg: "#FFF8E1",
    storeExtras: [
      ing("연유", "50g", 50 * B2B.condensedPerG),
      ing("프라페 파우더", "4스푼", 4 * B2B.powderPerSpoon),
      ing("죠리퐁", "4스푼", 4 * B2B.powderPerSpoon),
      ing("죠리퐁", "토핑 6스푼", 6 * B2B.powderPerSpoon),
    ],
    homeExtras: [
      home("연유", "50g", HOME.condensed50g, "연유"),
      home("바닐라 시럽", "2펌프", 2 * HOME.syrupPump, "프라페 파우더"),
      home("죠리퐁", "4큰술", HOME.jollypong, "죠리퐁"),
      home("죠리퐁", "6큰술", HOME.jollypong, "죠리퐁"),
    ],
  })
);

menus.push(
  frappeMenu({
    slug: "choco-pong-frappe",
    name: "초코퐁프라페",
    price: 4900,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    storeExtras: [
      ing("프라페 파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("초코소스", "2스푼", 2 * B2B.syrupPerSpoon),
      ing("죠리퐁", "4스푼", 4 * B2B.powderPerSpoon),
      ing("죠리퐁", "토핑 6스푼", 6 * B2B.powderPerSpoon),
    ],
    homeExtras: [
      home("바닐라 시럽", "1.5펌프", HOME.syrupPump + 30, "프라페 파우더"),
      home("초코소스", "2큰술", HOME.chocoSpoon, "초코소스"),
      home("죠리퐁", "4큰술", HOME.jollypong, "죠리퐁"),
      home("죠리퐁", "6큰술", HOME.jollypong, "죠리퐁"),
    ],
  })
);

menus.push(
  frappeMenu({
    slug: "banana-pong-frappe",
    name: "바나나퐁프라페",
    price: 5000,
    emoji: "🍌",
    photoBg: "#FFFDE7",
    storeExtras: [
      ing("연유", "50g", 50 * B2B.condensedPerG),
      ing("바나나파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("프라페 파우더", "1스푼", B2B.powderPerSpoon),
      ing("죠리퐁", "4스푼", 4 * B2B.powderPerSpoon),
      ing("죠리퐁", "토핑", 4 * B2B.powderPerSpoon),
    ],
    homeExtras: [
      home("연유", "50g", HOME.condensed50g, "연유"),
      home("바나나파우더", "3큰술", 3 * HOME.powderSpoon, "바나나파우더"),
      home("바닐라 시럽", "1펌프", HOME.syrupPump, "프라페 파우더"),
      home("죠리퐁", "4큰술", HOME.jollypong, "죠리퐁"),
    ],
  })
);

menus.push(
  frappeMenu({
    slug: "oreo-choco-frappe",
    name: "오레오초코프라페",
    price: 5100,
    emoji: "🍪",
    photoBg: "#EFEBE9",
    storeExtras: [
      ing("쿠앤크파우더", "5스푼", 5 * B2B.powderPerSpoon),
      ing("오레오 쿠키", "2개", 2 * B2B.cookieEach),
      ing("휘핑크림", "토핑", 80),
      ing("오레오 쿠키", "토핑 2개", 2 * B2B.cookieEach),
    ],
    homeExtras: [
      home("코코아 파우더", "2큰술", 2 * HOME.powderSpoon, "쿠앤크파우더"),
      home("오레오", "4개", HOME.cookie2 * 2, "오레오 쿠키"),
      home("휘핑크림", "토핑", HOME.whipServing, "휘핑크림"),
    ],
  })
);

// ── 카테고리 4: 티 ──
function icedTeaMenu({ slug, name, teaName, price, emoji, photoBg, note }) {
  const ingredients = [
    ing(teaName, "2개", 2 * B2B.teaBag),
    ing("온수", "200ml", 200 * B2B.water),
    ing("얼음", "가득", B2B.ice),
    cup(),
  ];
  const teaHome =
    teaName.includes("얼그레이") ? "얼그레이 티백" : "허브티 티백";
  const homeIngredients = [
    home(teaHome, "2개", 2 * HOME.teaBag, teaName),
    home("뜨거운 물", "200ml", 10, "온수"),
    home("얼음", "가득", HOME.ice, "얼음"),
  ];
  return baseMenu({
    slug,
    name,
    category: "버블티·밀크티",
    price,
    emoji,
    photoBg,
    ingredients,
    homeIngredients,
    difficulty: 1,
    time: "약 10분",
    note,
  });
}

menus.push(
  icedTeaMenu({
    slug: "iced-earl-grey-tea",
    name: "아이스 얼그레이 티",
    teaName: "얼그레이 티백",
    price: 3500,
    emoji: "🫖",
    photoBg: "#EFEBE9",
  })
);

menus.push(
  icedTeaMenu({
    slug: "iced-lemon-orange-tea",
    name: "아이스 레몬&오렌지 티",
    teaName: "레몬&오렌지 티백",
    price: 3500,
    emoji: "🍊",
    photoBg: "#FFF3E0",
    note: `매머드익스프레스 제조 매뉴얼 기준 · ${M_SIZE_NOTE} · 레몬&오렌지 티백은 시중 허브티 티백으로 대체 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  })
);

menus.push(
  icedTeaMenu({
    slug: "iced-chamomile-tea",
    name: "아이스 캐모마일 티",
    teaName: "캐모마일 티백",
    price: 3500,
    emoji: "🌼",
    photoBg: "#FFFDE7",
    note: `매머드익스프레스 제조 매뉴얼 기준 · ${M_SIZE_NOTE} · 캐모마일 티백은 시중 허브티 티백으로 대체 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  })
);

menus.push(
  icedTeaMenu({
    slug: "iced-peppermint-tea",
    name: "아이스 페퍼민트 티",
    teaName: "페퍼민트 티백",
    price: 3500,
    emoji: "🌿",
    photoBg: "#E8F5E9",
    note: `매머드익스프레스 제조 매뉴얼 기준 · ${M_SIZE_NOTE} · 페퍼민트 티백은 시중 허브티 티백으로 대체 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  })
);

const outputMenus = filterCheaperAtHome(filterManualMenus(menus, "mammoth-", MANUAL));

const out = `// generated by scripts/build-mammoth-menus.js
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
