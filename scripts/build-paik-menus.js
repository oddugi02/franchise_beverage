const fs = require("fs");
const path = require("path");
const MANUAL = require("./paik-manual-steps");
const PAIK_HOME = require("./paik-home-steps");
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome, alignStepToIngredients, ensurePeriod } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { applyMenuFilters } = require("./apply-menu-filters");

const OUTPUT_PATH = path.join(__dirname, "../paik-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerMl: 7,
  syrupPerPump: 20,
  powderPerG: 9,
  powderPerSpoon: 45,
  basePerG: 3.5,
  pureePerG: 3.5,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  condensedPerG: 8,
  tapiocaPack: 280,
  sodaCan: 200,
  juicePerMl: 2.5,
  teaPerMl: 7,
  creamPerMl: 4,
  cookieEach: 70,
  chocolateSpoon: 90,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrup15ml: 180,
  syrupPump: 60,
  powder20g: 200,
  powder30g: 290,
  powderSpoon: 100,
  ice: 50,
  water: 5,
  fruit100g: 700,
  fruit250g: 900,
  fruit150g: 850,
  yogurtPowder: 200,
  condensed50g: 320,
  condensed70g: 450,
  tapioca80g: 200,
  sodaCan: 300,
  juice275ml: 780,
  teaBag: 90,
  cream50ml: 250,
  whipServing: 350,
  cookie3: 250,
  honeyDrizzle: 200,
  misutgaru60g: 350,
  misutgaru48g: 280,
  jollypong: 290,
  coldBrew100ml: 650,
  coldBrew50ml: 350,
  chocoBase300ml: 450,
  milkTea100ml: 120,
  peachTeaPowder35g: 200,
  frozenMango85g: 510,
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
  const labels = homeIngredients.map((i) => i.label).filter(Boolean);
  const raw = PAIK_HOME[slug];
  if (raw) {
    const bodies = raw.map((s) => alignStepToIngredients(ensurePeriod(s), labels));
    const withTop = manual?.topping
      ? [...bodies, ...(bodies[bodies.length - 1]?.includes("토핑") ? [] : [`토핑: ${manual.topping.replace(/^토핑:?\s*/, "")}`])]
      : bodies;
    return withTop.map((body) => ({ title: "", body }));
  }
  const bodies = stepsFromManualHome(manual, homeIngredients);
  return bodies.map((body) => ({ title: "", body }));
}

function storeStepsFromManual(slug) {
  const manual = MANUAL[slug];
  if (!manual) return [];
  const steps = [...manual.store];
  if (manual.topping) steps.push(`토핑: ${manual.topping.replace(/^토핑:?\s*/, "")}`);
  return steps;
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
  difficulty = 2,
  time = "약 5분",
  note,
}) {
  return {
    id: `paik-${slug}`,
    brand: "빽다방",
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
      note: note || `빽다방 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
    _storeSteps: storeStepsFromManual(slug),
  };
}

const menus = [];

// ── 카테고리 1: 에이드·주스·티 ──
menus.push(
  baseMenu({
    slug: "samlabong-ade",
    name: "삼라봉에이드",
    category: "에이드·과일",
    price: 3800,
    emoji: "🍊",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("삼라봉 베이스", "80g", 80 * B2B.basePerG),
      ing("탄산수", "1캔", B2B.sodaCan),
      ing("얼음", "컵 상기선", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "80g", 350, "삼라봉 베이스"),
      home("사이다", "1캔", HOME.sodaCan, "탄산수"),
      home("얼음", "컵 상기선", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "cherry-kokkok",
    name: "체리콕콕",
    category: "에이드·과일",
    price: 3500,
    emoji: "🍒",
    photoBg: "#FFEBEE",
    ingredients: [
      ing("체리파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("온수", "30ml", B2B.water),
      ing("코카콜라", "1캔", B2B.sodaCan),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("체리시럽", "3큰술", 200, "체리파우더"),
      home("뜨거운 물", "30ml", HOME.water, "온수"),
      home("콜라", "1캔", HOME.sodaCan, "코카콜라"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "sikhye",
    name: "식혜",
    category: "에이드·과일",
    price: 3000,
    emoji: "🍚",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("식혜 원액", "100ml", 100 * B2B.juicePerMl),
      ing("정수", "200ml", 200 * B2B.water),
      ing("얼음", "간 얼음", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("식혜", "100ml", 350, "식혜 원액"),
      home("물", "200ml", 10, "정수"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 1,
    time: "약 2분",
  })
);

function juiceMenu({ slug, name, fruitName, fruitG, syrupPumps = 5, hotWaterMl = 150, extra = [], homeExtra = [], price = 4200, emoji = "🧃", photoBg = "#E8F5E9" }) {
  const ingredients = [
    ing(fruitName, `${fruitG}g`, fruitG * B2B.pureePerG),
  ];
  if (syrupPumps > 0) ingredients.push(ing("설탕시럽", `${syrupPumps}펌프`, syrupPumps * B2B.syrupPerPump));
  ingredients.push(
    ing("온수", `${hotWaterMl}ml`, hotWaterMl * B2B.water),
    ing("얼음", "가득", B2B.ice),
    cup(),
    ...extra,
  );
  const homeIngredients = [
    home(fruitName.replace(/냉동/, "냉동 "), `${fruitG}g`, fruitG >= 200 ? HOME.fruit250g : HOME.fruit100g, fruitName),
  ];
  if (syrupPumps > 0) homeIngredients.push(home("설탕시럽", `${syrupPumps}펌프`, syrupPumps * HOME.syrupPump, "설탕시럽"));
  homeIngredients.push(
    home("뜨거운 물", `${hotWaterMl}ml`, HOME.water, "온수"),
    home("얼음", "가득", HOME.ice, "얼음"),
    ...homeExtra,
  );
  return baseMenu({ slug, name, category: "에이드·과일", price, emoji, photoBg, ingredients, homeIngredients });
}

menus.push(
  baseMenu({
    slug: "samlabong-tea",
    name: "삼라봉티",
    category: "에이드·과일",
    price: 3800,
    emoji: "🍊",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("삼라봉베이스", "100g", 100 * B2B.basePerG),
      ing("정수", "250ml", 250 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "100g", 400, "삼라봉베이스"),
      home("물", "250ml", 10, "정수"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "micho",
    name: "미초",
    category: "에이드·과일",
    price: 3200,
    emoji: "🍶",
    photoBg: "#F3E5F5",
    ingredients: [
      ing("미초원액", "100ml", 100 * B2B.juicePerMl),
      ing("냉수", "250ml", 250 * B2B.water),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("미초(식초음료)", "100ml", 350, "미초원액"),
      home("차가운 물", "250ml", 10, "냉수"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 1,
  })
);

menus.push(
  baseMenu({
    slug: "grapefruit-ade",
    name: "자몽에이드",
    category: "에이드·과일",
    price: 3800,
    emoji: "🍊",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("자몽 베이스", "5펌프(100g)", 100 * B2B.basePerG),
      ing("탄산수", "1캔", B2B.sodaCan),
      ing("얼음", "컵 상기선", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("자몽청", "5펌프", 400, "자몽 베이스"),
      home("사이다", "1캔", HOME.sodaCan, "탄산수"),
      home("얼음", "컵 상기선", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "blue-candy-soda",
    name: "블루캔디소다",
    category: "에이드·과일",
    price: 3800,
    emoji: "💙",
    photoBg: "#E3F2FD",
    ingredients: [
      ing("블루캔디소다 베이스", "120g", 120 * B2B.basePerG),
      ing("탄산수", "1캔", B2B.sodaCan),
      ing("얼음", "컵 상기선", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("블루 레몬 시럽", "120g", 450, "블루캔디소다 베이스"),
      home("사이다", "1캔", HOME.sodaCan, "탄산수"),
      home("얼음", "컵 상기선", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "misutgaru-drink",
    name: "미숫가루",
    category: "에이드·과일",
    price: 4000,
    emoji: "🌾",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("물", "300ml", 300 * B2B.water),
      ing("미숫가루", "60g", 60 * B2B.powderPerG),
      ing("설탕시럽", "6펌프", 6 * B2B.syrupPerPump),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("물", "300ml", 15, "물"),
      home("미숫가루", "60g", HOME.misutgaru60g, "미숫가루"),
      home("설탕시럽", "6펌프", 6 * HOME.syrupPump, "설탕시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "amangchu",
    name: "아망추",
    category: "에이드·과일",
    price: 4800,
    emoji: "🥭",
    photoBg: "#FFE0B2",
    difficulty: 1,
    time: "약 3분",
    note: `16온스(대용량) 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    ingredients: [
      ing("복숭아 아이스티 분말", "35g", 35 * B2B.powderPerG),
      ing("온수", "30ml", 30 * B2B.water),
      ing("냉수", "150ml", 150 * B2B.water),
      ing("얼음", "각얼음", B2B.ice),
      ing("냉동 망고", "85g", 85 * B2B.pureePerG),
      cup(),
    ],
    homeIngredients: [
      home("복숭아 아이스티 파우더", "35g(약 2.5스푼)", HOME.peachTeaPowder35g, "복숭아 아이스티 분말"),
      home("뜨거운 물", "30ml", HOME.water * 6, "온수"),
      home("차가운 물", "150ml", 10, "냉수"),
      home("얼음", "적당량", HOME.ice, "얼음"),
      home("냉동 망고", "80~90g", HOME.frozenMango85g, "냉동 망고"),
    ],
  })
);

// ── 카테고리 2: 빽스치노·스무디·쉐이크 ──
function chinoMenu({ slug, name, milkMl = 200, iceG = 290, extras = [], homeExtras = [], price = 4200, emoji = "🥤", photoBg = "#EFEBE9", difficulty = 2, note }) {
  const ingredients = [
    ing("우유", `${milkMl}ml`, milkMl * B2B.milkPerMl),
    ing("얼음", `${iceG}g`, B2B.ice),
    ...extras,
    cup(),
  ];
  const homeIngredients = [
    home("우유", `${milkMl}ml`, milkMl * HOME.milkPerMl, "우유"),
    home("얼음", `${iceG}g`, HOME.ice, "얼음"),
    ...homeExtras,
  ];
  return baseMenu({ slug, name, category: "프라페·프라푸치노", price, emoji, photoBg, ingredients, homeIngredients, difficulty, note });
}

menus.push(
  chinoMenu({
    slug: "green-tea-paiks-chino",
    name: "말차빽스치노",
    emoji: "🍵",
    photoBg: "#E8F5E9",
    extras: [
      ing("녹차 파우더", "4스푼", 4 * B2B.powderPerSpoon),
      ing("바닐라 파우더", "1스푼", B2B.powderPerSpoon),
    ],
    homeExtras: [
      home("녹차 가루", "4큰술", HOME.powderSpoon * 4, "녹차 파우더"),
      home("바닐라 파우더", "1큰술", HOME.powderSpoon, "바닐라 파우더"),
    ],
  })
);

menus.push(
  chinoMenu({
    slug: "original-paiks-chino",
    name: "원조빽스치노",
    milkMl: 150,
    iceG: 270,
    extras: [
      ing("원조커피 원액", "100ml", 100 * B2B.juicePerMl),
      ing("바닐라 파우더", "1스푼", B2B.powderPerSpoon),
      ing("설탕시럽", "2펌프", 2 * B2B.syrupPerPump),
    ],
    homeExtras: [
      home("콜드브루 원액", "100ml", HOME.coldBrew100ml, "원조커피 원액"),
      home("콜드브루 원액", "드리즐", 50, "원조커피 원액 드리즐"),
      home("바닐라 파우더", "1큰술", HOME.powderSpoon, "바닐라 파우더"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "설탕시럽"),
    ],
    emoji: "☕",
    photoBg: "#EFEBE9",
  })
);

menus.push(
  chinoMenu({
    slug: "pistachio-paiks-chino",
    name: "피스타치오 빽스치노",
    note: `리뉴얼 전 메뉴 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    extras: [ing("피스타치오 파우더", "7스푼", 7 * B2B.powderPerSpoon)],
    homeExtras: [home("피스타치오 파우더", "7큰술", 7 * HOME.powderSpoon, "피스타치오 파우더")],
    emoji: "💚",
    photoBg: "#E8F5E9",
  })
);

menus.push(
  chinoMenu({
    slug: "mint-choco-paiks-chino",
    name: "민트초코빽스치노",
    extras: [ing("민트초코 파우더", "7스푼", 7 * B2B.powderPerSpoon)],
    homeExtras: [home("민트초코 파우더", "7큰술", 7 * HOME.powderSpoon, "민트초코 파우더")],
    emoji: "🌿",
    photoBg: "#E0F2F1",
  })
);

menus.push(
  chinoMenu({
    slug: "choco-paiks-chino",
    name: "초코빽스치노",
    extras: [
      ing("초콜릿 소스", "5펌프", 5 * B2B.syrupPerPump),
      ing("다크컬스 초콜릿", "3스푼", 3 * B2B.chocolateSpoon),
      ing("설탕시럽", "2펌프", 2 * B2B.syrupPerPump),
    ],
    homeExtras: [
      home("초코 시럽", "5펌프", 5 * HOME.syrupPump, "초콜릿 소스"),
      home("코코아 파우더", "3큰술", HOME.powder30g, "다크컬스 초콜릿"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "설탕시럽"),
    ],
    emoji: "🍫",
    photoBg: "#D7CCC8",
  })
);

menus.push(
  chinoMenu({
    slug: "cookie-crunch-paiks-chino",
    name: "쿠키크런치빽스치노",
    extras: [
      ing("바닐라 파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("오레오초코", "4개", 4 * B2B.cookieEach),
      ing("설탕시럽", "4펌프", 4 * B2B.syrupPerPump),
      ing("초코크런치", "3스푼", 3 * B2B.powderPerSpoon),
    ],
    homeExtras: [
      home("바닐라 파우더", "2큰술", 2 * HOME.powderSpoon, "바닐라 파우더"),
      home("오레오", "4개", 350, "오레오초코"),
      home("설탕시럽", "4펌프", 4 * HOME.syrupPump, "설탕시럽"),
      home("초코 크런치", "3큰술", 190, "초코크런치"),
    ],
    emoji: "🍪",
    photoBg: "#EFEBE9",
  })
);

menus.push(
  chinoMenu({
    slug: "hotteok-paiks-chino",
    name: "호떡빽스치노",
    milkMl: 250,
    iceG: 250,
    extras: [
      ing("미숫가루", "48g", 48 * B2B.powderPerG),
      ing("호떡시럽", "60g", 60 * B2B.basePerG),
    ],
    homeExtras: [
      home("미숫가루", "48g", HOME.misutgaru48g, "미숫가루"),
      home("호떡시럽", "60g", 350, "호떡시럽"),
    ],
    emoji: "🥞",
    photoBg: "#FFF8E1",
  })
);

function pongdangMenu({ slug, name, milkMl = 200, iceG = 260, extras = [], homeExtras = [], price = 4500 }) {
  return chinoMenu({
    slug,
    name,
    milkMl,
    iceG,
    extras: [...extras, ing("죠리퐁", "2스푼+토핑", 2 * B2B.powderPerSpoon + 30)],
    homeExtras: [...homeExtras, home("죠리퐁", "2큰술+토핑", HOME.jollypong + 150, "죠리퐁")],
    price,
    emoji: "🍿",
    photoBg: "#FFFDE7",
  });
}

menus.push(
  pongdangMenu({
    slug: "pongdang-misutgaru",
    name: "퐁당치노 미숫가루",
    extras: [
      ing("미숫가루", "4스푼", 4 * B2B.powderPerSpoon),
      ing("연유", "50g", 50 * B2B.condensedPerG),
      ing("설탕시럽", "5펌프", 5 * B2B.syrupPerPump),
    ],
    homeExtras: [
      home("미숫가루", "4큰술", 4 * HOME.powderSpoon, "미숫가루"),
      home("연유", "50g", HOME.condensed50g, "연유"),
      home("설탕시럽", "5펌프", 5 * HOME.syrupPump, "설탕시럽"),
    ],
  })
);

menus.push(
  pongdangMenu({
    slug: "pongdang-vanilla",
    name: "퐁당치노 바닐라",
    extras: [
      ing("바닐라파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("죠리퐁", "30g", 30 * B2B.powderPerG),
      ing("설탕시럽", "4펌프", 4 * B2B.syrupPerPump),
    ],
    homeExtras: [
      home("바닐라 파우더", "2큰술", 2 * HOME.powderSpoon, "바닐라파우더"),
      home("죠리퐁", "30g", 150, "죠리퐁"),
      home("설탕시럽", "4펌프", 4 * HOME.syrupPump, "설탕시럽"),
    ],
  })
);

menus.push(
  pongdangMenu({
    slug: "pongdang-original",
    name: "퐁당치노 원조",
    milkMl: 150,
    extras: [
      ing("원조 원액", "50ml", 50 * B2B.juicePerMl),
      ing("설탕시럽", "2펌프", 2 * B2B.syrupPerPump),
    ],
    homeExtras: [
      home("콜드브루 원액", "50ml", HOME.coldBrew50ml, "원조 원액"),
      home("설탕시럽", "2펌프", 2 * HOME.syrupPump, "설탕시럽"),
    ],
    emoji: "☕",
    photoBg: "#EFEBE9",
  })
);

menus.push(
  chinoMenu({
    slug: "plain-yogurt-smoothie",
    name: "플레인 요거트 스무디",
    category: "스무디·쉐이크",
    extras: [ing("요거트 파우더", "5스푼", 5 * B2B.powderPerSpoon)],
    homeExtras: [home("요거트 파우더", "5큰술", 5 * HOME.powderSpoon, "요거트 파우더")],
    emoji: "🥛",
    photoBg: "#F3E5F5",
  })
);

menus.push(
  chinoMenu({
    slug: "samlabong-yogurt-smoothie",
    name: "삼라봉요거트스무디",
    category: "스무디·쉐이크",
    extras: [
      ing("요거트 파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("설탕시럽", "1펌프", B2B.syrupPerPump),
      ing("삼라봉 베이스", "60g", 60 * B2B.basePerG),
    ],
    homeExtras: [
      home("요거트 파우더", "2큰술", HOME.yogurtPowder, "요거트 파우더"),
      home("설탕시럽", "1펌프", HOME.syrupPump, "설탕시럽"),
      home("자몽청", "60g", 280, "삼라봉 베이스"),
    ],
    emoji: "🍊",
    photoBg: "#FFF3E0",
  })
);

menus.push(
  chinoMenu({
    slug: "milk-shake",
    name: "밀크쉐이크",
    category: "스무디·쉐이크",
    extras: [ing("밀크파우더", "6스푼", 6 * B2B.powderPerSpoon)],
    homeExtras: [home("밀크 파우더", "6큰술", 6 * HOME.powderSpoon, "밀크파우더")],
    emoji: "🥛",
    photoBg: "#FFFDE7",
  })
);

menus.push(
  chinoMenu({
    slug: "choco-cream-frappe",
    name: "초코크림프라페",
    iceG: 250,
    extras: [ing("초코 소스", "4펌프", 4 * B2B.syrupPerPump), ing("초코볼", "1스푼", B2B.chocolateSpoon)],
    homeExtras: [
      home("초코 시럽", "4펌프", 4 * HOME.syrupPump, "초코 소스"),
      home("초코볼", "1큰술", 120, "초코볼"),
      home("휘핑크림", "3.5바퀴", HOME.whipServing, "휘핑크림"),
    ],
    price: 4500,
    emoji: "🍫",
    photoBg: "#D7CCC8",
  })
);

// ── 카테고리 3: 라떼·블랙펄·커피 ──
menus.push(
  chinoMenu({
    slug: "choco-banana",
    name: "완전초코바나나",
    category: "스무디·쉐이크",
    iceG: 270,
    extras: [
      ing("초콜릿 소스", "3펌프", 3 * B2B.syrupPerPump),
      ing("바나나 파우더", "2스푼", 2 * B2B.powderPerSpoon),
      ing("다크컬스 초콜릿", "3스푼", 3 * B2B.chocolateSpoon),
    ],
    homeExtras: [
      home("초코 시럽", "3펌프", 3 * HOME.syrupPump, "초콜릿 소스"),
      home("바나나 파우더", "2큰술", 2 * HOME.powderSpoon, "바나나 파우더"),
      home("코코아 파우더", "3큰술", HOME.powder30g, "다크컬스 초콜릿"),
    ],
    emoji: "🍌",
    photoBg: "#FFF8E1",
  })
);

function blackPearlMenu({ slug, name, withEspresso = false, milkTea = false, price = 4300 }) {
  const ingredients = milkTea
    ? [
        ing("블랙펄", "1팩", B2B.tapiocaPack),
        ing("우유", "150ml", 150 * B2B.milkPerMl),
        ing("밀크티원액", "50ml", 50 * B2B.teaPerMl),
        ing("생크림", "50ml", 50 * B2B.creamPerMl),
        ing("얼음", "가득", B2B.ice),
        cup(),
      ]
    : [
        ing("블랙펄", "1팩", B2B.tapiocaPack),
        ing("우유", "250ml", 250 * B2B.milkPerMl),
        ing("흑당시럽", "5펌프", 5 * B2B.syrupPerPump),
        ing("얼음", "가득", B2B.ice),
        ...(withEspresso ? [ing("원두(에스프레소)", "1샷", B2B.espressoPerShot)] : []),
        cup(),
      ];
  const homeIngredients = milkTea
    ? [
        home("타피오카 펄", "1팩", HOME.tapioca80g, "블랙펄"),
        home("우유", "150ml", 375, "우유"),
        home("홍차 티백", "진하게 50ml", HOME.milkTea100ml, "밀크티원액"),
        home("생크림", "50ml", HOME.cream50ml, "생크림"),
        home("얼음", "가득", HOME.ice, "얼음"),
      ]
    : [
        home("타피오카 펄", "1팩", HOME.tapioca80g, "블랙펄"),
        home("우유", "250ml", 625, "우유"),
        home("설탕시럽", "5펌프", 5 * HOME.syrupPump, "흑당시럽"),
        home("얼음", "가득", HOME.ice, "얼음"),
        ...(withEspresso ? [home("에스프레소 액상스틱", "1개", HOME.espressoLiquidStick, "원두(에스프레소)")] : []),
      ];
  return baseMenu({
    slug,
    name,
    category: "버블티·밀크티",
    price,
    emoji: "🧋",
    photoBg: "#3E2723",
    ingredients,
    homeIngredients,
  });
}

menus.push(blackPearlMenu({ slug: "black-pearl-latte", name: "블랙펄라떼" }));
menus.push(blackPearlMenu({ slug: "black-pearl-cafe-latte", name: "블랙펄카페라떼", withEspresso: true }));
menus.push(blackPearlMenu({ slug: "black-pearl-milk-tea", name: "블랙펄밀크티", milkTea: true, price: 4500 }));

function icecreamLatteMenu({ slug, name, powderName, powderSpoons = 3, price = 4000 }) {
  return baseMenu({
    slug,
    name,
    category: "라떼",
    price,
    emoji: "🍦",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("우유", "200~300ml", 300 * B2B.milkPerMl),
      ing(powderName, `${powderSpoons}스푼`, powderSpoons * B2B.powderPerSpoon),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("얼음", "컵 상기선", B2B.ice),
      ing("아이스크림", "토핑", 350),
      cup(),
    ],
    homeIngredients: [
      home("우유", "300ml", 750, "우유"),
      home(powderName, `${powderSpoons}큰술`, powderSpoons * HOME.powderSpoon, powderName),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("얼음", "컵 상기선", HOME.ice, "얼음"),
      home("바닐라 아이스크림", "1스쿱", 350, "아이스크림"),
    ],
  });
}

menus.push(icecreamLatteMenu({ slug: "icecream-cafe-latte", name: "아이스크림 카페라떼", powderName: "—", powderSpoons: 0, price: 3800 }));
menus.push(icecreamLatteMenu({ slug: "icecream-vanilla-latte", name: "아이스크림 바닐라라떼", powderName: "바닐라 파우더" }));
menus.push(icecreamLatteMenu({ slug: "icecream-cafe-mocha", name: "아이스크림 카페모카", powderName: "모카 파우더" }));

menus.push(
  baseMenu({
    slug: "caramel-macchiato",
    name: "카라멜마끼아또",
    category: "라떼",
    price: 3800,
    emoji: "🍮",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("카라멜소스", "2펌프", 2 * B2B.syrupPerPump),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("우유", "300ml", 300 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("카라멜 시럽", "2펌프", 2 * HOME.syrupPump, "카라멜소스"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("우유", "300ml", 750, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "condensed-latte",
    name: "달달연유라떼",
    category: "라떼",
    price: 3500,
    emoji: "🥛",
    photoBg: "#FFFDE7",
    ingredients: [
      ing("연유", "70g", 70 * B2B.condensedPerG),
      ing("우유", "225ml", 225 * B2B.milkPerMl),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("연유", "70g", HOME.condensed70g, "연유"),
      home("우유", "225ml", 563, "우유"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  chinoMenu({
    slug: "hotteok-latte",
    name: "호떡라떼",
    category: "라떼",
    milkMl: 250,
    iceG: 0,
    extras: [
      ing("미숫가루", "24g", 24 * B2B.powderPerG),
      ing("호떡시럽", "40g", 40 * B2B.basePerG),
      ing("얼음", "가득", B2B.ice),
    ],
    homeExtras: [
      home("미숫가루", "24g", 140, "미숫가루"),
      home("호떡시럽", "40g", 250, "호떡시럽"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    price: 3800,
    emoji: "🥞",
    photoBg: "#FFF8E1",
  })
);

menus.push(
  baseMenu({
    slug: "mugwort-latte",
    name: "쑥쑥라떼",
    category: "라떼",
    price: 3800,
    emoji: "🌿",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("쑥파우더", "4스푼", 4 * B2B.powderPerSpoon),
      ing("온수", "30ml", B2B.water),
      ing("우유", "300ml", 300 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("쑥가루", "4큰술", 4 * HOME.powderSpoon, "쑥파우더"),
      home("뜨거운 물", "30ml", HOME.water, "온수"),
      home("우유", "300ml", 750, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  baseMenu({
    slug: "choco-latte",
    name: "완전초코라떼",
    category: "라떼",
    price: 3800,
    emoji: "🍫",
    photoBg: "#D7CCC8",
    ingredients: [
      ing("완전초코 베이스", "300ml", 300 * B2B.juicePerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("초코 파우더", "베이스 300ml", HOME.chocoBase300ml, "완전초코 베이스"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 1,
  })
);

menus.push(
  baseMenu({
    slug: "green-tea-latte",
    name: "녹차라떼",
    category: "라떼",
    price: 3500,
    emoji: "🍵",
    photoBg: "#E8F5E9",
    ingredients: [
      ing("녹차 파우더", "3스푼", 3 * B2B.powderPerSpoon),
      ing("온수", "30ml", B2B.water),
      ing("우유", "300ml", 300 * B2B.milkPerMl),
      ing("얼음", "가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("녹차 가루", "3큰술", 3 * HOME.powderSpoon, "녹차 파우더"),
      home("뜨거운 물", "30ml", HOME.water, "온수"),
      home("우유", "300ml", 750, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);

menus.push(
  chinoMenu({
    slug: "mint-choco-latte",
    name: "민트초코라떼",
    category: "라떼",
    iceG: 0,
    extras: [ing("민트초코파우더", "5스푼", 5 * B2B.powderPerSpoon), ing("얼음", "가득", B2B.ice)],
    homeExtras: [home("민트초코 파우더", "5큰술", 5 * HOME.powderSpoon, "민트초코파우더"), home("얼음", "가득", HOME.ice, "얼음")],
    price: 3800,
    emoji: "🌿",
    photoBg: "#E0F2F1",
  })
);

menus.push(
  baseMenu({
    slug: "milk-tea",
    name: "밀크티",
    category: "버블티·밀크티",
    price: 3200,
    emoji: "🧋",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("밀크티베이스", "100ml", 100 * B2B.teaPerMl),
      ing("우유", "250ml", 250 * B2B.milkPerMl),
      cup(),
    ],
    homeIngredients: [
      home("홍차 티백", "진하게 100ml", HOME.milkTea100ml, "밀크티베이스"),
      home("우유", "250ml", 625, "우유"),
    ],
    difficulty: 1,
    time: "약 4분",
  })
);

// icecream cafe latte has no powder - fix ingredients
const iceLatte = menus.find((m) => m.id === "paik-icecream-cafe-latte");
if (iceLatte) {
  iceLatte.ingredients = [
    ing("우유", "200ml", 200 * B2B.milkPerMl),
    ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
    ing("얼음", "컵 상기선", B2B.ice),
    ing("아이스크림", "토핑", 350),
    cup(),
  ];
  iceLatte.recipe.homeIngredients = [
    home("우유", "200ml", 500, "우유"),
    home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
    home("얼음", "컵 상기선", HOME.ice, "얼음"),
    home("바닐라 아이스크림", "1스쿱", 350, "아이스크림"),
  ];
}

// strip internal _storeSteps before output (keep in ingredients note via recipe note)
const outputMenus = applyMenuFilters(
  filterManualMenus(
  menus.map(({ _storeSteps, ...menu }) => menu),
  "paik-",
  MANUAL
  ),
  "paik"
);

const minPrice = Math.min(...outputMenus.map((m) => m.price));
const maxPrice = Math.max(...outputMenus.map((m) => m.price));

const out = `// generated by scripts/build-paik-menus.js
const PAIK_MENUS = ${JSON.stringify(outputMenus, null, 2)};

if (typeof window !== "undefined") {
  window.PAIK_MENUS = PAIK_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { PAIK_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${outputMenus.length}`);
console.log(`Price range: ${minPrice}~${maxPrice}`);
