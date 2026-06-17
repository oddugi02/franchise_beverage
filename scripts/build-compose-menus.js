const fs = require("fs");
const path = require("path");
const manualModule = require("./compose-manual-steps");
const COMPOSE_MANUAL_SLUGS = manualModule.COMPOSE_MANUAL_SLUGS;
const COMPOSE_MANUAL_SLUG_SET = new Set(COMPOSE_MANUAL_SLUGS);
const MANUAL = Object.fromEntries(Object.entries(manualModule).filter(([k]) => k !== "COMPOSE_MANUAL_SLUGS"));
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");

const OUTPUT_PATH = path.join(__dirname, "../compose-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerMl: 7,
  syrupPerPump: 20,
  powderPerG: 9,
  powderPerSpoon: 45,
  basePerMl: 7,
  basePerG: 3.5,
  pureePerG: 3.5,
  water: 5,
  ice: 25,
  cup: 95,
  cupStraw: 115,
  whipPerG: 5.5,
  honeyPerG: 12,
  condensedPerG: 8,
  juicePack: 350,
  dutchPerMl: 8,
  cookieBasePerMl: 2.8,
  teaPerMl: 7,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrup15ml: 180,
  syrupPump: 60,
  hazelnut15ml: 270,
  vanilla15ml: 240,
  honey15g: 200,
  condensed15ml: 95,
  powder20g: 200,
  powder30g: 290,
  powder60g: 230,
  ice: 50,
  water: 5,
  whip30g: 174,
  fruit80g: 600,
  fruit100g: 700,
  fruit150ml: 550,
  yogurt150ml: 550,
  teaBag: 90,
  sodaCanPart: 300,
  lemonBase: 250,
  coldBrew130ml: 650,
  coldBrew60ml: 350,
  decafColdBrew130ml: 700,
  decafColdBrew60ml: 380,
  oreo2: 200,
  oreo4: 350,
  cookieCrumb: 150,
  chocoChip: 120,
  dalgona: 510,
  redBean80g: 280,
  herbTeaBag: 120,
  peachIceTea200ml: 450,
  coffeeStick5: 225,
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

function cup(iced = true) {
  return ing(iced ? "컵·뚜껑·빨대" : "컵·뚜껑", "1세트", iced ? B2B.cupStraw : B2B.cup);
}

function stepsFromManual(slug, homeIngredients = []) {
  const manual = MANUAL[slug];
  if (!manual) return [];
  return stepsFromManualHome(manual, homeIngredients).map((body) => ({ title: "", body }));
}

function baseMenu({
  id,
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
    id: `compose-${id || slug}`,
    brand: "컴포즈커피",
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
      note: note || `컴포즈커피 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

function espressoCoffee({
  slug,
  name,
  category = "커피",
  price,
  shots = 2,
  waterMl = 0,
  milkMl = 0,
  syrups = [],
  powderG = 0,
  powderName = "파우더",
  whipG = 0,
  emoji = "🧊",
  photoBg = "#E3F2FD",
  homeExtra = [],
  difficulty = 1,
  time = "약 4분",
}) {
  const ingredients = [ing("원두(에스프레소)", `${shots}샷`, shots * B2B.espressoPerShot)];
  if (waterMl > 0) ingredients.push(ing("정수", `${waterMl}ml`, waterMl * B2B.water));
  if (milkMl > 0) ingredients.push(ing("우유", `${milkMl}ml`, milkMl * B2B.milkPerMl));
  syrups.forEach(({ name, ml, pumps }) => {
    const amt = ml ? `${ml}ml` : `${pumps}펌프`;
    const cost = ml ? ml * B2B.syrupPerMl : pumps * B2B.syrupPerPump;
    ingredients.push(ing(name, amt, cost));
  });
  if (powderG > 0) ingredients.push(ing(powderName, `${powderG}g`, powderG * B2B.powderPerG));
  if (whipG > 0) ingredients.push(ing("휘핑크림", `${whipG}g`, whipG * B2B.whipPerG));
  ingredients.push(ing("얼음", "컵 가득", B2B.ice), cup());

  const homeIngredients = [home("에스프레소 액상스틱", `${shots}개`, shots * HOME.espressoLiquidStick, "원두(에스프레소)")];
  if (waterMl > 0) homeIngredients.push(home("물", `${waterMl}ml`, waterMl * HOME.water, "정수"));
  if (milkMl > 0) homeIngredients.push(home("우유", `${milkMl}ml`, milkMl * HOME.milkPerMl, "우유"));
  syrups.forEach(({ name, ml, pumps, homePrice }) => {
    const amt = ml ? `${ml}ml` : `${pumps}펌프`;
    const price = homePrice || (pumps ? pumps * HOME.syrupPump : HOME.syrup15ml);
    homeIngredients.push(home(name, amt, price, name));
  });
  if (powderG > 0) homeIngredients.push(home(powderName, `${powderG}g`, HOME.powder20g, powderName));
  if (whipG > 0) homeIngredients.push(home("휘핑크림", `${whipG}g`, HOME.whip30g, "휘핑크림"));
  homeIngredients.push(home("얼음", "가득", HOME.ice, "얼음"), ...homeExtra);

  return baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients, difficulty, time });
}

function dutchMenu({ slug, name, price, decaf = false, latte = false, einspanner = false }) {
  const dutchName = decaf ? "디카페인 더치커피 원액" : "더치커피 원액";
  const dutchMl = latte ? 60 : 130;
  const ingredients = [ing("얼음", "컵 가득", B2B.ice)];
  if (latte) ingredients.push(ing("우유", "200ml", 200 * B2B.milkPerMl));
  ingredients.push(ing(dutchName, `${dutchMl}ml`, dutchMl * B2B.dutchPerMl));
  if (!latte) ingredients.push(ing("정수", "8부 선", B2B.water * 40));
  if (einspanner) ingredients.push(ing("휘핑크림", "30g", 30 * B2B.whipPerG));
  ingredients.push(cup());

  const homeIngredients = [home("얼음", "가득", HOME.ice, "얼음")];
  if (latte) homeIngredients.push(home("우유", "200ml", 500, "우유"));
  const coldLabel = decaf ? "디카페인 콜드브루 원액" : "콜드브루 원액";
  const coldPrice = decaf
    ? latte
      ? HOME.decafColdBrew60ml
      : HOME.decafColdBrew130ml
    : latte
      ? HOME.coldBrew60ml
      : HOME.coldBrew130ml;
  homeIngredients.push(home(coldLabel, `${dutchMl}ml`, coldPrice, dutchName));
  if (!latte) homeIngredients.push(home("물", "8부 선", HOME.water * 40, "정수"));
  if (einspanner) homeIngredients.push(home("휘핑크림", "30g", HOME.whip30g, "휘핑크림"));

  return baseMenu({
    slug,
    name,
    category: "커피",
    price,
    emoji: einspanner ? "☁️" : "🧊",
    photoBg: "#D7CCC8",
    ingredients,
    homeIngredients,
    difficulty: 1,
    time: "약 3분",
  });
}

function blendedLatte({
  slug,
  name,
  price,
  milkMl = 200,
  powderName,
  powderG = 0,
  baseMl = 0,
  baseName = "",
  syrupPumps = 0,
  syrupName = "과당 시럽",
  fruitG = 0,
  fruitName = "",
  oreo = 0,
  category = "라떼",
  emoji = "🥛",
  photoBg = "#FFF8E1",
  difficulty = 2,
  time = "약 6분",
}) {
  const ingredients = [ing("우유", `${milkMl}ml`, milkMl * B2B.milkPerMl)];
  if (powderG > 0) ingredients.push(ing(powderName, `${powderG}g`, powderG * B2B.powderPerG));
  if (baseMl > 0) ingredients.push(ing(baseName, `${baseMl}ml`, baseMl * B2B.basePerMl));
  if (fruitG > 0) ingredients.push(ing(fruitName, `${fruitG}g`, fruitG * B2B.pureePerG));
  if (syrupPumps > 0) ingredients.push(ing(syrupName, `${syrupPumps}펌프`, syrupPumps * B2B.syrupPerPump));
  if (oreo > 0) ingredients.push(ing("오레오", `${oreo}개`, oreo * 35));
  ingredients.push(ing("얼음", "컵 가득", B2B.ice), cup());

  const homeIngredients = [home("우유", `${milkMl}ml`, milkMl * HOME.milkPerMl, "우유")];
  if (powderG > 0) homeIngredients.push(home(powderName, `${powderG}g`, powderG >= 50 ? HOME.powder60g : HOME.powder30g, powderName));
  if (baseMl > 0) homeIngredients.push(home(baseName, `${baseMl}ml`, baseMl * 4, baseName));
  if (fruitG > 0) homeIngredients.push(home(fruitName, `${fruitG}g`, HOME.fruit80g, fruitName));
  if (syrupPumps > 0) homeIngredients.push(home("설탕시럽", `${syrupPumps}펌프`, syrupPumps * HOME.syrupPump, syrupName));
  if (oreo > 0) homeIngredients.push(home("오레오", `${oreo}개`, oreo >= 4 ? HOME.oreo4 : HOME.oreo2, "오레오"));
  homeIngredients.push(home("얼음", "가득", HOME.ice, "얼음"));

  return baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients, difficulty, time });
}

function baseOnly({ slug, name, price, ingredients, homeIngredients, category = "라떼", emoji = "🫗", photoBg = "#EFEBE9" }) {
  return baseMenu({ slug, name, category, price, emoji, photoBg, ingredients, homeIngredients, difficulty: 2, time: "약 5분" });
}

function juiceMenu({ slug, name, price, fruitName, emoji = "🍹", photoBg = "#E8F5E9" }) {
  const ingredients = [
    ing("물", "200ml", 200 * B2B.water),
    ing(`${fruitName} 원액`, "1팩", B2B.juicePack),
    ing("얼음", "8부 선", B2B.ice),
    cup(),
  ];
  const homeIngredients = [
    home(fruitName, "1팩", HOME.fruit150ml, `${fruitName} 원액`),
    home("물", "200ml", HOME.water, "물"),
    home("얼음", "8부 선", HOME.ice, "얼음"),
  ];
  return baseMenu({ slug, name, category: "에이드·과일", price, emoji, photoBg, ingredients, homeIngredients, difficulty: 2, time: "약 6분" });
}

function smoothieMenu({ slug, name, price, fruitName, yogurt = false, yuja = false }) {
  const ingredients = [
    ing(yogurt ? "요거트 파우더" : "우유", yogurt ? "3스푼(s)" : "150ml", yogurt ? 3 * B2B.powderPerSpoon : 150 * B2B.milkPerMl),
    ing(`${fruitName} 베이스`, "150ml", 150 * B2B.basePerMl),
    ing("과당 시럽", "1펌프", B2B.syrupPerPump),
    ing("얼음", "1컵", B2B.ice * 1.5),
    cup(),
  ];
  const homeIngredients = yogurt
    ? [home("드링킹 요거트", "150ml", HOME.yogurt150ml, "요거트 파우더")]
    : [home("우유", "150ml", 375, "우유")];
  if (yuja) {
    homeIngredients.push(home("유자청", "3큰술", HOME.lemonBase, `${fruitName} 베이스`));
  } else {
    homeIngredients.push(home(fruitName, "100g", HOME.fruit100g, `${fruitName} 베이스`));
  }
  homeIngredients.push(home("설탕시럽", "1펌프", HOME.syrupPump, "과당 시럽"), home("얼음", "1컵", HOME.ice, "얼음"));

  return baseMenu({
    slug,
    name,
    category: "스무디·쉐이크",
    price,
    emoji: "🥤",
    photoBg: "#F1F8E9",
    ingredients,
    homeIngredients,
    difficulty: 2,
    time: "약 6분",
  });
}

function adeMenu({ slug, name, price, bases, emoji = "🍋", photoBg = "#E8F5E9", topping }) {
  const ingredients = [];
  bases.forEach(({ name: n, pumps }) => ingredients.push(ing(n, `${pumps}펌프`, pumps * B2B.syrupPerPump)));
  ingredients.push(ing("얼음", "컵 가득", B2B.ice), ing("탄산", "250ml", B2B.water * 50), cup());

  const homeIngredients = bases.map(({ name: n, pumps, homeLabel, homePrice }) =>
    home(homeLabel || n, `${pumps}펌프`, homePrice || pumps * HOME.syrupPump, n)
  );
  homeIngredients.push(home("얼음", "가득", HOME.ice, "얼음"), home("사이다", "250ml", HOME.sodaCanPart, "탄산"));

  return baseMenu({ slug, name, category: "에이드·과일", price, emoji, photoBg, ingredients, homeIngredients });
}

function frappeMenu({ slug, name, price, bases, javaChip = false, oreo = 0, espresso = 0 }) {
  const ingredients = [];
  bases.forEach(({ name: n, ml }) => ingredients.push(ing(n, `${ml}ml`, ml * (n.includes("쿠키") ? B2B.cookieBasePerMl : B2B.basePerMl))));
  if (espresso > 0) ingredients.push(ing("에스프레소", `${espresso}샷`, espresso * B2B.espressoPerShot));
  if (javaChip) ingredients.push(ing("자바칩", "1스푼(s)", B2B.powderPerSpoon));
  if (oreo > 0) ingredients.push(ing("오레오", `${oreo}개`, oreo * 35));
  ingredients.push(ing("얼음", "1컵", B2B.ice * 1.5), ing("휘핑크림", "30g", 30 * B2B.whipPerG), cup());

  const homeIngredients = [];
  bases.forEach(({ name: n, ml, homeLabel, homePrice }) =>
    homeIngredients.push(home(homeLabel || n, `${ml}ml`, homePrice || ml * 3, n))
  );
  if (espresso > 0) homeIngredients.push(home("에스프레소 액상스틱", `${espresso}개`, espresso * HOME.espressoLiquidStick, "에스프레소"));
  if (javaChip) homeIngredients.push(home("초코 크런치", "1큰술", HOME.chocoChip, "자바칩"));
  if (oreo > 0) homeIngredients.push(home("오레오", `${oreo}개`, HOME.oreo2, "오레오"));
  homeIngredients.push(home("얼음", "1컵", HOME.ice, "얼음"), home("휘핑크림", "30g", HOME.whip30g, "휘핑크림"));

  return baseMenu({
    slug,
    name,
    category: "프라페·프라푸치노",
    price,
    emoji: "🍧",
    photoBg: "#FCE4EC",
    ingredients,
    homeIngredients,
    difficulty: 2,
    time: "약 7분",
  });
}

function teaMenu({ slug, name, price, hot = false, bases = [], honey = false, emoji = "🫖", photoBg = "#FFFDE7" }) {
  const ingredients = [];
  if (hot) {
    ingredients.push(ing("허브티 티백", "1개", B2B.teaPerMl * 8), ing("뜨거운 물", "475ml", B2B.water * 95), ing("컵·뚜껑", "1세트", B2B.cup));
  } else {
    bases.forEach(({ name: n, pumps, ml }) => {
      if (pumps) ingredients.push(ing(n, `${pumps}펌프`, pumps * B2B.syrupPerPump));
      if (ml) ingredients.push(ing(n, `${ml}ml`, ml * B2B.basePerMl));
    });
    ingredients.push(ing("홍차 베이스", "150ml", 150 * B2B.teaPerMl));
    if (honey) ingredients.push(ing("꿀", "1펌프", B2B.syrupPerPump));
    ingredients.push(ing("얼음", "컵 가득", B2B.ice), cup());
  }

  const homeIngredients = [];
  if (hot) {
    homeIngredients.push(home("허브티 티백", "1개", HOME.herbTeaBag, "허브티 티백"), home("뜨거운 물", "475ml", HOME.water * 95, "뜨거운 물"));
  } else {
    bases.forEach(({ name: n, pumps, ml, homeLabel, homePrice }) => {
      if (pumps) homeIngredients.push(home(homeLabel || n, `${pumps}펌프`, homePrice || pumps * HOME.syrupPump, n));
      if (ml) homeIngredients.push(home(homeLabel || n, `${ml}ml`, homePrice || ml * 4, n));
    });
    homeIngredients.push(home("홍차 티백", "1~2개", HOME.teaBag, "홍차 베이스"));
    if (honey) homeIngredients.push(home("꿀", "1큰술", HOME.honey15g, "꿀"));
    homeIngredients.push(home("얼음", "가득", HOME.ice, "얼음"));
  }

  return baseMenu({
    slug,
    name,
    category: "티",
    price,
    emoji,
    photoBg,
    ingredients,
    homeIngredients,
    difficulty: 1,
    time: hot ? "약 4분" : "약 5분",
  });
}

function milkshakeMenu({ slug, name, price, powderSpoons = 5, extras = [], oreo = 0, espresso = 0 }) {
  const ingredients = [
    ing("우유", "200ml", 200 * B2B.milkPerMl),
    ing("밀크쉐이크 파우더", `${powderSpoons}스푼(s)`, powderSpoons * B2B.powderPerSpoon),
  ];
  extras.forEach(({ name: n, g }) => ingredients.push(ing(n, `${g}g`, g * B2B.basePerG)));
  if (oreo > 0) ingredients.push(ing("오레오", `${oreo}개`, oreo * 35));
  if (espresso > 0) ingredients.push(ing("에스프레소", `${espresso}샷`, espresso * B2B.espressoPerShot));
  ingredients.push(ing("얼음", "1컵", B2B.ice * 1.5), cup());

  const homeIngredients = [
    home("우유", "200ml", 500, "우유"),
    home("연유", `${powderSpoons}큰술`, powderSpoons * 80, "밀크쉐이크 파우더"),
  ];
  extras.forEach(({ name: n, g, homeLabel, homePrice }) =>
    homeIngredients.push(home(homeLabel || n, `${g}g`, homePrice || g * 4, n))
  );
  if (oreo > 0) homeIngredients.push(home("오레오", `${oreo}개`, HOME.oreo4, "오레오"));
  if (espresso > 0) {
    homeIngredients.push(home("커피 스틱", "5개", HOME.coffeeStick5, "에스프레소"));
  }
  homeIngredients.push(home("얼음", "1컵", HOME.ice, "얼음"));

  return baseMenu({
    slug,
    name,
    category: "스무디·쉐이크",
    price,
    emoji: "🥛",
    photoBg: "#EFEBE9",
    ingredients,
    homeIngredients,
    difficulty: 2,
    time: "약 6분",
  });
}

const menus = [];

// ── Category 1: Coffee ──
menus.push(
  espressoCoffee({ slug: "iced-americano", name: "아이스 아메리카노", price: 1500, shots: 2, waterMl: 200 })
);
menus.push(
  espressoCoffee({ slug: "iced-cafe-latte", name: "아이스 카페라떼", category: "라떼", price: 1800, shots: 2, milkMl: 200 })
);
menus.push(
  baseMenu({
    slug: "iced-vanilla-latte",
    name: "아이스 바닐라 라떼",
    category: "라떼",
    price: 2500,
    emoji: "🤍",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("바닐라 시럽", "20g", 20 * B2B.syrupPerMl),
      ing("설탕시럽", "10g", 10 * B2B.syrupPerMl),
      ing("우유", "170g", 170 * B2B.milkPerMl),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("바닐라 시럽", "2펌프", HOME.vanilla15ml, "바닐라 시럽"),
      home("설탕시럽", "1펌프", HOME.syrupPump, "설탕시럽"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("우유", "170ml", 425, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 2,
    time: "약 5분",
  })
);
menus.push(
  baseMenu({
    slug: "iced-hazelnut-latte",
    name: "아이스 헤이즐넛라떼",
    category: "라떼",
    price: 2800,
    emoji: "🌰",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("헤이즐넛 시럽", "20g", 20 * B2B.syrupPerMl),
      ing("설탕시럽", "10g", 10 * B2B.syrupPerMl),
      ing("우유", "170g", 170 * B2B.milkPerMl),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("헤이즐넛 시럽", "2펌프", HOME.hazelnut15ml, "헤이즐넛 시럽"),
      home("설탕시럽", "1펌프", HOME.syrupPump, "설탕시럽"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("우유", "170ml", 425, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);
menus.push(
  baseMenu({
    slug: "iced-caramel-macchiato-base",
    name: "아이스 카라멜 마키아또",
    category: "라떼",
    price: 3000,
    emoji: "🍮",
    photoBg: "#FFF3E0",
    ingredients: [
      ing("바닐라 시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("카라멜 시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
    ],
    homeIngredients: [
      home("바닐라 시럽", "2펌프", HOME.syrupPump * 2, "바닐라 시럽"),
      home("카라멜 시럽", "2펌프", HOME.syrupPump * 2, "카라멜 시럽"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
    ],
    difficulty: 2,
  })
);
menus.push(
  baseMenu({
    slug: "iced-mocha",
    name: "아이스 모카",
    category: "라떼",
    price: 3200,
    emoji: "🍫",
    photoBg: "#3E2723",
    ingredients: [
      ing("초코 파우더", "2스푼(s)", 2 * B2B.powderPerSpoon),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("휘핑크림", "30g", 30 * B2B.whipPerG),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("코코아 파우더", "2큰술", HOME.powder20g, "초코 파우더"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("우유", "200ml", 500, "우유"),
      home("휘핑크림", "30g", HOME.whip30g, "휘핑크림"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 2,
  })
);
menus.push(
  baseMenu({
    slug: "iced-dolce-latte-base",
    name: "아이스 돌체라떼",
    category: "라떼",
    price: 3000,
    emoji: "🍯",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("연유", "30g", 30 * B2B.condensedPerG),
      ing("바닐라 시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
    ],
    homeIngredients: [
      home("연유", "2큰술", HOME.condensed15ml, "연유"),
      home("바닐라 시럽", "2펌프", HOME.syrupPump * 2, "바닐라 시럽"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
    ],
    difficulty: 2,
  })
);
menus.push(
  baseMenu({
    slug: "iced-brown-sugar-milk",
    name: "흑당밀크",
    category: "라떼",
    price: 3000,
    emoji: "🥛",
    photoBg: "#3E2723",
    ingredients: [
      ing("흑당소스", "45g", 45 * B2B.syrupPerMl),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("설탕시럽", "45g", HOME.syrup15ml, "흑당소스"),
      home("우유", "200ml", 500, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 1,
    time: "약 3분",
  })
);
menus.push(
  baseMenu({
    slug: "iced-brown-sugar-cafe-latte",
    name: "흑당카페라떼",
    category: "라떼",
    price: 3500,
    emoji: "🖤",
    photoBg: "#424242",
    ingredients: [
      ing("흑당소스", "45g", 45 * B2B.syrupPerMl),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("원두(에스프레소)", "1샷", B2B.espressoPerShot),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("설탕시럽", "45g", HOME.syrup15ml, "흑당소스"),
      home("우유", "200ml", 500, "우유"),
      home("에스프레소 액상스틱", "1개", HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 2,
  })
);
menus.push(
  espressoCoffee({
    slug: "iced-einspanner-latte",
    name: "아이스 아인슈페너 라떼",
    category: "라떼",
    price: 3800,
    shots: 2,
    milkMl: 180,
    whipG: 30,
    emoji: "☁️",
    photoBg: "#F5F5F5",
    difficulty: 2,
  })
);
menus.push(
  baseMenu({
    slug: "iced-dalgona-latte",
    name: "달고나 라떼",
    category: "라떼",
    price: 4000,
    emoji: "🍯",
    photoBg: "#FFF8E1",
    ingredients: [
      ing("달고나 토핑", "1스쿱", 80),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("원두(에스프레소)", "2샷", 2 * B2B.espressoPerShot),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("달고나", "1큰술", HOME.dalgona, "달고나 토핑"),
      home("우유", "200ml", 500, "우유"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "원두(에스프레소)"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
    difficulty: 2,
  })
);
menus.push(dutchMenu({ slug: "iced-dutch-coffee", name: "아이스 더치커피", price: 2000 }));
menus.push(dutchMenu({ slug: "iced-dutch-latte", name: "콜드브루 라떼", price: 2500, latte: true }));
menus.push(dutchMenu({ slug: "iced-einspanner", name: "아이스 아인슈페너", price: 3500, einspanner: true }));
menus.push(dutchMenu({ slug: "iced-decaf-dutch-coffee", name: "아이스 디카페인 더치커피", price: 2200, decaf: true }));
menus.push(dutchMenu({ slug: "iced-decaf-dutch-latte", name: "아이스 디카페인 더치라떼", price: 2700, decaf: true, latte: true }));

// ── Category 2: Non-coffee latte ──
menus.push(
  baseOnly({
    slug: "iced-grain-latte",
    name: "아이스 곡물라떼",
    price: 3000,
    emoji: "🌾",
    photoBg: "#F5F5DC",
    ingredients: [ing("곡물베이스", "250ml", 250 * B2B.basePerMl), ing("얼음", "컵 가득", B2B.ice), cup()],
    homeIngredients: [
      home("우유", "250ml", 625, "곡물베이스"),
      home("곡물 파우더", "60g", HOME.powder60g, "곡물베이스"),
      home("설탕 시럽", "1.5펌프", 90, "곡물베이스"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);
menus.push(
  blendedLatte({
    slug: "iced-sweet-potato-latte",
    name: "고구마라떼",
    price: 3200,
    milkMl: 200,
    powderName: "고구마 페이스트",
    powderG: 30,
    syrupPumps: 1,
    emoji: "🍠",
    photoBg: "#FFE0B2",
  })
);
menus.push(
  blendedLatte({
    slug: "iced-double-choco-latte",
    name: "아이스 더블초코라떼",
    price: 3300,
    baseMl: 130,
    baseName: "더블초코 베이스",
    milkMl: 150,
    emoji: "🍫",
    photoBg: "#3E2723",
  })
);
menus.push(
  blendedLatte({
    slug: "iced-green-tea-latte",
    name: "아이스 녹차라떼",
    price: 3000,
    baseMl: 75,
    baseName: "녹차 베이스",
    milkMl: 225,
    emoji: "🍵",
    photoBg: "#C8E6C9",
  })
);
menus.push(
  baseMenu({
    slug: "iced-cookie-choco-latte",
    name: "쿠키초코라떼",
    category: "라떼",
    price: 3400,
    emoji: "🍪",
    photoBg: "#4E342E",
    ingredients: [
      ing("우유", "150ml", 150 * B2B.milkPerMl),
      ing("쿠키초코 베이스", "130ml", 130 * B2B.basePerMl),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("우유", "150ml", 375, "우유"),
      home("오레오", "2~3개", HOME.oreo2, "쿠키초코 베이스"),
      home("코코아 파우더", "2~3큰술", HOME.powder20g, "쿠키초코 베이스"),
      home("초코 시럽", "2펌프", HOME.syrupPump * 2, "쿠키초코 베이스"),
      home("얼음", "1컵", HOME.ice, "얼음"),
      home("휘핑크림", "30g", HOME.whip30g, "휘핑크림"),
    ],
    difficulty: 2,
    time: "약 7분",
  })
);
menus.push(
  blendedLatte({
    slug: "iced-mint-choco-oreo-latte",
    name: "민트초코 오레오 라떼",
    price: 3600,
    milkMl: 200,
    powderName: "민트초코 파우더",
    powderG: 25,
    oreo: 2,
    emoji: "🌿",
    photoBg: "#E8F5E9",
  })
);
menus.push(
  baseMenu({
    slug: "iced-milk-tea",
    name: "아이스 밀크티",
    category: "라떼",
    price: 2800,
    emoji: "🧋",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("밀크티 베이스", "100ml", 100 * B2B.basePerMl),
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("얼음", "컵 가득", B2B.ice),
      cup(),
    ],
    homeIngredients: [
      home("홍차 티백", "2개", HOME.teaBag * 2, "밀크티 베이스"),
      home("우유", "200ml", 500, "우유"),
      home("얼음", "가득", HOME.ice, "얼음"),
    ],
  })
);
menus.push(
  baseOnly({
    slug: "iced-double-choco-base",
    name: "더블초코 베이스",
    price: 2500,
    ingredients: [
      ing("초코 파우더", "4스푼(s)", 4 * B2B.powderPerSpoon),
      ing("초코 시럽", "2펌프", 2 * B2B.syrupPerPump),
      ing("뜨거운 물", "50ml", 50 * B2B.water),
    ],
    homeIngredients: [
      home("코코아 파우더", "4큰술", HOME.powder30g, "초코 파우더"),
      home("초코 시럽", "2펌프", HOME.syrupPump * 2, "초코 시럽"),
      home("뜨거운 물", "50ml", HOME.water, "뜨거운 물"),
    ],
  })
);
menus.push(
  baseOnly({
    slug: "iced-cookie-choco-base",
    name: "쿠키초코 베이스",
    price: 2500,
    ingredients: [
      ing("쿠키 베이스", "65ml", 65 * B2B.cookieBasePerMl),
      ing("초코 베이스", "65ml", 65 * B2B.basePerMl),
    ],
    homeIngredients: [
      home("오레오", "2개", HOME.oreo2, "쿠키 베이스"),
      home("코코아 파우더", "2큰술", HOME.powder20g, "초코 베이스"),
      home("초코 시럽", "2펌프", HOME.syrupPump * 2, "초코 베이스"),
    ],
  })
);
menus.push(
  baseOnly({
    slug: "iced-grain-latte-base",
    name: "곡물라떼 베이스",
    price: 2500,
    ingredients: [
      ing("우유", "250ml", 250 * B2B.milkPerMl),
      ing("곡물라떼 파우더", "60g", 60 * B2B.powderPerG),
      ing("과당 시럽", "1.5펌프", 1.5 * B2B.syrupPerPump),
    ],
    homeIngredients: [
      home("우유", "250ml", 625, "우유"),
      home("곡물 파우더", "60g", HOME.powder60g, "곡물라떼 파우더"),
      home("설탕시럽", "1.5펌프", HOME.syrupPump * 1.5, "과당 시럽"),
    ],
  })
);
menus.push(
  baseOnly({
    slug: "iced-milk-tea-base",
    name: "밀크티 베이스",
    price: 2200,
    ingredients: [
      ing("밀크티 원액", "100ml", 100 * B2B.basePerMl),
      ing("우유", "100ml", 100 * B2B.milkPerMl),
    ],
    homeIngredients: [
      home("홍차 티백", "2개", HOME.teaBag * 2, "밀크티 원액"),
      home("우유", "100ml", 250, "우유"),
    ],
  })
);

// ── Category 3: Juice / smoothie / ade ──
menus.push(smoothieMenu({ slug: "yuja-smoothie", name: "유자스무디", price: 4200, fruitName: "유자", yuja: true }));
menus.push(
  baseMenu({
    slug: "plain-yogurt-smoothie",
    name: "플레인요거트스무디",
    category: "스무디·쉐이크",
    price: 3900,
    emoji: "🥤",
    photoBg: "#F1F8E9",
    ingredients: [
      ing("우유", "200ml", 200 * B2B.milkPerMl),
      ing("요거트 파우더", "5스푼(s)", 5 * B2B.powderPerSpoon),
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("드링킹 요거트", "150ml", HOME.yogurt150ml, "요거트 파우더"),
      home("플레인 요거트", "100g", 200, "우유"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
    difficulty: 2,
    time: "약 6분",
  })
);

menus.push(
  adeMenu({
    slug: "grapefruit-ade",
    name: "자몽에이드",
    price: 3300,
    bases: [
      { name: "자몽 베이스", pumps: 1, homeLabel: "자몽청" },
      { name: "자몽 시럽", pumps: 1, homeLabel: "자몽청" },
      { name: "과당 시럽", pumps: 1, homeLabel: "설탕시럽" },
    ],
    emoji: "🍊",
    photoBg: "#FFF3E0",
    topping: "자몽 슬라이스",
  })
);
menus.push(
  adeMenu({
    slug: "lemon-ade",
    name: "레몬에이드",
    price: 3300,
    bases: [
      { name: "레몬 베이스", pumps: 1.5, homeLabel: "레몬즙" },
      { name: "과당 시럽", pumps: 1, homeLabel: "설탕시럽" },
    ],
    emoji: "🍋",
    topping: "레몬 슬라이스",
  })
);
menus.push(
  adeMenu({
    slug: "yuja-ade",
    name: "유자에이드",
    price: 3300,
    bases: [{ name: "유자 베이스", pumps: 2, homeLabel: "유자청" }],
    emoji: "🍋",
    photoBg: "#FFFDE7",
  })
);
menus.push(
  adeMenu({
    slug: "blue-lemon-ade",
    name: "블루레몬에이드",
    price: 3500,
    bases: [
      { name: "레몬 베이스", pumps: 1.5, homeLabel: "레몬즙" },
      { name: "블루 레몬 시럽", pumps: 2, homeLabel: "블루 레몬 시럽" },
    ],
    emoji: "💙",
    photoBg: "#E3F2FD",
    topping: "레몬 슬라이스",
  })
);
menus.push(
  adeMenu({
    slug: "passion-fruit-ade",
    name: "패션후르츠에이드",
    price: 3600,
    bases: [{ name: "패션후르츠 베이스", pumps: 2, homeLabel: "패션후르츠 시럽" }],
    emoji: "🌺",
    photoBg: "#FFF8E1",
  })
);

// ── Category 4: Frappe / tea ──
menus.push(
  baseMenu({
    slug: "real-choco-java-frappe",
    name: "리얼초코자바칩프라페",
    category: "프라페·프라푸치노",
    price: 4500,
    emoji: "🍧",
    photoBg: "#FCE4EC",
    ingredients: [
      ing("쿠키 베이스", "100ml", 100 * B2B.cookieBasePerMl),
      ing("초코 베이스", "150ml", 150 * B2B.basePerMl),
      ing("자바칩", "1스푼(s)", B2B.powderPerSpoon),
      ing("얼음", "1컵", B2B.ice * 1.5),
      ing("휘핑크림", "30g", 30 * B2B.whipPerG),
      cup(),
    ],
    homeIngredients: [
      home("우유", "100ml", 250, "쿠키 베이스"),
      home("초코 시럽", "3펌프", HOME.syrupPump * 3, "초코 베이스"),
      home("초코 크런치", "1큰술", HOME.chocoChip, "자바칩"),
      home("바닐라 아이스크림", "2큰술", 220, "초코 베이스"),
      home("얼음", "1컵", HOME.ice, "얼음"),
      home("휘핑크림", "30g", HOME.whip30g, "휘핑크림"),
    ],
    difficulty: 2,
    time: "약 7분",
  })
);
menus.push(
  baseMenu({
    slug: "cookie-choco-frappe",
    name: "쿠키초코 프라페",
    category: "프라페·프라푸치노",
    price: 4500,
    emoji: "🍧",
    photoBg: "#FCE4EC",
    ingredients: [
      ing("쿠키 베이스", "250ml", 250 * B2B.cookieBasePerMl),
      ing("오레오", "2개", 70),
      ing("얼음", "1컵", B2B.ice * 1.5),
      ing("휘핑크림", "30g", 30 * B2B.whipPerG),
      cup(),
    ],
    homeIngredients: [
      home("오레오", "4~5개", HOME.oreo4, "쿠키 베이스"),
      home("우유", "110ml", round(110 * HOME.milkPerMl), "쿠키 베이스"),
      home("바닐라 아이스크림", "3큰술", 320, "쿠키 베이스"),
      home("초코 시럽", "2펌프", HOME.syrupPump * 2, "쿠키 베이스"),
      home("얼음", "1컵", HOME.ice, "얼음"),
      home("휘핑크림", "30g", HOME.whip30g, "휘핑크림"),
    ],
    difficulty: 2,
    time: "약 8분",
  })
);
menus.push(
  frappeMenu({
    slug: "mint-choco-oreo-frappe",
    name: "민트초코 오레오 프라페",
    price: 4500,
    bases: [{ name: "민트 베이스", ml: 250, homeLabel: "민트 시럽" }],
    oreo: 2,
  })
);
menus.push(
  frappeMenu({
    slug: "green-tea-frappe",
    name: "녹차 프라페",
    price: 4500,
    bases: [
      { name: "쿠키 베이스", ml: 125, homeLabel: "바닐라 시럽" },
      { name: "녹차 베이스", ml: 125, homeLabel: "녹차 가루" },
    ],
  })
);
menus.push(
  frappeMenu({
    slug: "mocha-java-frappe",
    name: "모카 자바칩 프라페",
    price: 4700,
    bases: [{ name: "쿠키 베이스", ml: 200, homeLabel: "바닐라 시럽" }],
    espresso: 2,
    javaChip: true,
  })
);

menus.push(teaMenu({ slug: "herb-tea", name: "허브티", price: 2800, hot: true, emoji: "🌿", photoBg: "#E8F5E9" }));
menus.push(
  teaMenu({
    slug: "grapefruit-tea",
    name: "자몽티",
    price: 3200,
    bases: [{ name: "자몽 베이스", pumps: 2, homeLabel: "자몽청" }],
    emoji: "🍊",
  })
);
menus.push(
  teaMenu({
    slug: "lemon-tea",
    name: "레몬티",
    price: 3000,
    bases: [{ name: "레몬 베이스", pumps: 1.5, homeLabel: "레몬즙" }],
    emoji: "🍋",
  })
);
menus.push(
  teaMenu({
    slug: "yuja-tea",
    name: "유자티",
    price: 3000,
    bases: [{ name: "유자 베이스", pumps: 2, homeLabel: "유자청" }],
    emoji: "🍋",
    photoBg: "#FFFDE7",
  })
);
menus.push(
  teaMenu({
    slug: "grapefruit-honey-black-tea",
    name: "자몽허니 블랙티",
    price: 3500,
    bases: [{ name: "자몽 베이스", pumps: 1, homeLabel: "자몽청" }],
    honey: true,
    emoji: "🍯",
    photoBg: "#FFF3E0",
  })
);

// ── Category 5: Milkshake ──
menus.push(milkshakeMenu({ slug: "plain-milkshake", name: "플레인 밀크쉐이크", price: 4900, powderSpoons: 6 }));
menus.push(
  milkshakeMenu({
    slug: "red-bean-milkshake",
    name: "팥 밀크쉐이크",
    price: 5200,
    powderSpoons: 4,
    extras: [{ name: "팥 베이스", g: 80, homeLabel: "팥앙금" }],
  })
);
menus.push(milkshakeMenu({ slug: "cookie-milkshake", name: "쿠키 밀크쉐이크", price: 5300, powderSpoons: 5, oreo: 2, extras: [{ name: "쿠키 베이스", g: 50, homeLabel: "오레오" }] }));
menus.push(
  milkshakeMenu({
    slug: "candy-soda-milkshake",
    name: "캔디소다 밀크쉐이크",
    price: 5400,
    powderSpoons: 5,
    extras: [{ name: "캔디소다 베이스", g: 80, homeLabel: "블루 레몬 시럽" }],
  })
);
menus.push(
  baseMenu({
    slug: "coffee-milkshake",
    name: "커피 밀크쉐이크",
    category: "스무디·쉐이크",
    price: 5500,
    emoji: "🥛",
    photoBg: "#EFEBE9",
    ingredients: [
      ing("밀크쉐이크 베이스", "150g", 150 * B2B.basePerG),
      ing("설탕시럽", "30g", 30 * B2B.syrupPerMl),
      ing("밀크쉐이크 파우더", "50g", 50 * B2B.powderPerG),
      ing("에스프레소", "2샷", 2 * B2B.espressoPerShot),
      ing("얼음", "1컵", B2B.ice * 1.5),
      cup(),
    ],
    homeIngredients: [
      home("우유", "200ml", 500, "밀크쉐이크 베이스"),
      home("연유", "5큰술", 400, "밀크쉐이크 파우더"),
      home("설탕시럽", "30g", 120, "설탕시럽"),
      home("에스프레소 액상스틱", "2개", 2 * HOME.espressoLiquidStick, "에스프레소"),
      home("얼음", "1컵", HOME.ice, "얼음"),
    ],
    difficulty: 2,
    time: "약 6분",
  })
);

if (menus.length !== 49) {
  throw new Error(`Expected 49 menus but got ${menus.length}`);
}

const { filterManualMenus } = require("./manual-menu-filter");
const { applyMenuFilters } = require("./apply-menu-filters");
const filtered = applyMenuFilters(
  filterManualMenus(
    menus.filter((m) => COMPOSE_MANUAL_SLUG_SET.has(m.id.replace(/^compose-/, ""))),
    "compose-",
    MANUAL,
    COMPOSE_MANUAL_SLUGS,
  ),
  "compose",
);
const order = new Map(COMPOSE_MANUAL_SLUGS.map((slug, i) => [slug, i]));
const composeMenus = filtered.sort((a, b) => order.get(a.id.slice(8)) - order.get(b.id.slice(8)));
if (composeMenus.length !== COMPOSE_MANUAL_SLUGS.length) {
  const got = new Set(composeMenus.map((m) => m.id.replace(/^compose-/, "")));
  const missing = COMPOSE_MANUAL_SLUGS.filter((s) => !got.has(s));
  throw new Error(`Expected ${COMPOSE_MANUAL_SLUGS.length} manual menus but got ${composeMenus.length}. Missing: ${missing.join(", ")}`);
}

const minPrice = Math.min(...composeMenus.map((m) => m.price));
const maxPrice = Math.max(...composeMenus.map((m) => m.price));

const out = `// generated by scripts/build-compose-menus.js — 실제 제조 매뉴얼 반영 메뉴만 (${composeMenus.length}종)
const COMPOSE_MENUS = ${JSON.stringify(composeMenus, null, 2)};

if (typeof window !== "undefined") {
  window.COMPOSE_MENUS = COMPOSE_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { COMPOSE_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${composeMenus.length} (manual-only, built ${menus.length} total)`);
console.log(`Price range: ${minPrice}~${maxPrice}`);
