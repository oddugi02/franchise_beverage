const fs = require("fs");
const path = require("path");
const MANUAL = require("./mega-manual-steps");
const { consumerHome } = require("./consumer-home");
const { filterManualMenus } = require("./manual-menu-filter");
const { filterCheaperAtHome } = require("./filter-cheaper-at-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");

const OUTPUT_PATH = path.join(__dirname, "../mega-menus.js");

const B2B = {
  milkPerMl: 1.5,
  espressoPerShot: 68,
  syrupPerMl: 7,
  powderPerG: 9,
  water: 5,
  ice: 25,
  cup: 95,
  cupStraw: 115,
  whipPerG: 5.5,
  honeyPerG: 12,
  condensedPerMl: 8,
  cookieBasePerMl: 2.8,
};

const HOME = {
  milkPerMl: 2.5,
  espressoLiquidStick: 1150,
  syrup15ml: 240,
  hazelnut15ml: 270,
  honey15g: 200,
  condensed15ml: 95,
  powder30g: 290,
  powder20g: 200,
  powder40g: 380,
  yogurtDrink150ml: 550,
  ice: 50,
  water: 5,
  whip30g: 174,
  fruitPack: 700,
  fruitLarge: 900,
  lemonBase: 250,
  teaBag: 90,
  sodaCanPart: 300,
  together3spoon: 400,
  jollypongHalf: 290,
  jollypongTop: 150,
  coffeeMix3: 450,
  sugarSpoon: 15,
  cream2spoon: 40,
  milk300ml: 750,
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

function step(title, body) {
  return { title, body };
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

function stepsFromManual(slug, _fallbackStore, fallbackHome, topping, homeIngredients = []) {
  const manual = MANUAL[slug];
  if (!manual) {
    return [{ title: "", body: fallbackHome }];
  }
  const bodies = stepsFromManualHome(
    { home: manual.home, topping: manual.topping || topping },
    homeIngredients
  );
  return bodies.map((body) => ({ title: "", body }));
}

function slugifyAscii(input) {
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "");
}

function formatAmountMl(ml) {
  return `${ml}ml`;
}

function coffeeMenu({
  name,
  slug,
  iced,
  shots,
  milkMl = 0,
  waterMl = 0,
  syrupMl = 0,
  syrupName = "시럽",
  honeyG = 0,
  condensedMl = 0,
  powderG = 0,
  powderName = "파우더",
  whipG = 0,
  category,
  price,
  topping,
  homeExtra = [],
}) {
  const ingredients = [
    ing("원두(에스프레소)", `${shots}샷`, shots * B2B.espressoPerShot),
  ];
  if (waterMl > 0) ingredients.push(ing("물", formatAmountMl(waterMl), B2B.water));
  if (milkMl > 0) ingredients.push(ing("우유", formatAmountMl(milkMl), milkMl * B2B.milkPerMl));
  if (syrupMl > 0) ingredients.push(ing(syrupName, formatAmountMl(syrupMl), syrupMl * B2B.syrupPerMl));
  if (honeyG > 0) ingredients.push(ing("꿀", `${honeyG}g`, honeyG * B2B.honeyPerG));
  if (condensedMl > 0) {
    ingredients.push(ing("연유", formatAmountMl(condensedMl), condensedMl * B2B.condensedPerMl));
  }
  if (powderG > 0) ingredients.push(ing(powderName, `${powderG}g`, powderG * B2B.powderPerG));
  if (whipG > 0) ingredients.push(ing("휘핑크림", `${whipG}g`, whipG * B2B.whipPerG));
  if (iced) ingredients.push(ing("얼음", "컵 가득", B2B.ice));
  ingredients.push(ing(iced ? "컵·뚜껑·빨대" : "컵·뚜껑", "1세트", iced ? B2B.cupStraw : B2B.cup));

  const homeIngredients = [
    home("에스프레소 액상스틱", `${shots}개`, shots * HOME.espressoLiquidStick, "원두(에스프레소)"),
  ];
  if (waterMl > 0) {
    homeIngredients.push(home(iced ? "물" : "뜨거운 물", formatAmountMl(waterMl), HOME.water, "물"));
  }
  if (milkMl > 0) homeIngredients.push(home("우유", formatAmountMl(milkMl), milkMl * HOME.milkPerMl, "우유"));
  if (syrupMl > 0) {
    const syrupPrice = syrupName.includes("헤이즐넛") ? HOME.hazelnut15ml : HOME.syrup15ml;
    homeIngredients.push(home(syrupName, formatAmountMl(syrupMl), syrupPrice, syrupName));
  }
  if (honeyG > 0) homeIngredients.push(home("꿀", `${honeyG}g`, HOME.honey15g, "꿀"));
  if (condensedMl > 0) homeIngredients.push(home("연유", formatAmountMl(condensedMl), HOME.condensed15ml, "연유"));
  if (powderG > 0) homeIngredients.push(home(powderName, `${powderG}g`, HOME.powder20g, powderName));
  if (whipG > 0) homeIngredients.push(home("휘핑크림", `${whipG}g`, HOME.whip30g, "휘핑크림"));
  if (iced) homeIngredients.push(home("얼음", "적당량", HOME.ice, "얼음"));
  homeIngredients.push(...homeExtra);

  const recipeSteps = stepsFromManual(
    slug,
    `에스프레소 ${shots}샷 추출 후 정량 조합`,
    `액상스틱 ${shots}개와 우유·시럽을 집에서 대체`,
    topping,
    homeIngredients,
  );

  return {
    id: `mega-${slug || slugifyAscii(name)}`,
    brand: "메가커피",
    name,
    category,
    price,
    emoji: iced ? "🧊" : "☕",
    photoBg: iced ? "#E3F2FD" : "#EFEBE9",
    recipeReady: true,
    ingredients,
    recipe: {
      homeIngredients,
      steps: recipeSteps,
      difficulty: milkMl > 0 ? 2 : 1,
      time: iced ? "약 4분" : "약 5분",
      note: `메가커피 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

function latteNoCoffeeMenu({ name, slug, iced, powderName, powderG, milkMl, syrupMl = 0, price, topping, sugarPumps = 0, homeExtra = [] }) {
  const ingredients = [
    ing(powderName, `${powderG}g`, powderG * B2B.powderPerG),
    ing("우유", `${milkMl}ml`, milkMl * B2B.milkPerMl),
  ];
  if (syrupMl > 0) ingredients.push(ing("시럽", `${syrupMl}ml`, syrupMl * B2B.syrupPerMl));
  ingredients.push(ing("물", "30ml", B2B.water));
  if (iced) ingredients.push(ing("얼음", "컵 가득", B2B.ice));
  ingredients.push(ing(iced ? "컵·뚜껑·빨대" : "컵·뚜껑", "1세트", iced ? B2B.cupStraw : B2B.cup));

  const homeIngredients = [
    home(powderName, `${powderG}g`, HOME.powder30g, powderName),
    home("우유", `${milkMl}ml`, milkMl * HOME.milkPerMl, "우유"),
    home("뜨거운 물", "30ml", HOME.water, "물"),
  ];
  if (syrupMl > 0) homeIngredients.push(home("시럽", `${syrupMl}ml`, HOME.syrup15ml, "시럽"));
  if (sugarPumps > 0) homeIngredients.push(home("설탕시럽", `${sugarPumps}펌프`, sugarPumps * HOME.syrupPump, "슈가시럽"));
  if (iced) homeIngredients.push(home("얼음", "적당량", HOME.ice, "얼음"));
  homeIngredients.push(...homeExtra);

  return {
    id: `mega-${slug || slugifyAscii(name)}`,
    brand: "메가커피",
    name,
    category: "라떼",
    price,
    emoji: iced ? "🥛" : "🍵",
    photoBg: iced ? "#E1F5FE" : "#FFF8E1",
    recipeReady: true,
    ingredients,
    recipe: {
      homeIngredients,
      steps: stepsFromManual(slug, `${powderName} 베이스 + 우유 조합`, "전자레인지 우유 + 술로 휘젓기", topping, homeIngredients),
      difficulty: 1,
      time: "약 4분",
      note: `메가커피 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

function smoothieMenu({ name, slug, fruitLabel, price, cheese = false, topping }) {
  const ingredients = [
    ing("요거트 베이스", "150ml", 150 * B2B.syrupPerMl),
    ing(fruitLabel, "100g", 100 * B2B.powderPerG * 0.6),
    ing("얼음", "0.5컵", B2B.ice),
    ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
  ];
  if (cheese) ingredients.push(ing("치즈 베이스", "25g", 25 * B2B.powderPerG));

  const homeIngredients = [
    home("드링킹 요거트", "150ml", HOME.yogurtDrink150ml, "요거트 베이스"),
    home(fruitLabel, "100g", fruitLabel.includes("망고") ? HOME.fruitLarge : HOME.fruitPack, fruitLabel),
    home("얼음", "적당량", HOME.ice, "얼음"),
  ];
  if (cheese) homeIngredients.push(home("크림치즈", "1스푼", 260, "치즈 베이스"));

  return {
    id: `mega-${slug || slugifyAscii(name)}`,
    brand: "메가커피",
    name,
    category: "스무디·쉐이크",
    price,
    emoji: "🥤",
    photoBg: "#F1F8E9",
    recipeReady: true,
    ingredients,
    recipe: {
      homeIngredients,
      steps: stepsFromManual(slug, "요거트 베이스 블렌딩", "믹서기 20~30초 블렌딩", topping, homeIngredients),
      difficulty: 1,
      time: "약 5분",
      note: `메가커피 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

function unicornFrappeMenu() {
  const slug = "unicorn-frappe";
  const ingredients = [
    ing("쿠키 베이스", "100ml", 100 * B2B.cookieBasePerMl),
    ing("우유", "100ml", 100 * B2B.milkPerMl),
    ing("그라데이션 파우더", "20g", 20 * B2B.powderPerG),
    ing("얼음", "0.5컵", B2B.ice),
    ing("휘핑크림", "30g", 30 * B2B.whipPerG),
    ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
  ];
  const homeIngredients = [
    home("우유", "100ml", 100 * HOME.milkPerMl, "우유"),
    home("카라멜 시럽", "40g", 320, "쿠키 베이스"),
    home("얼음", "280g", 80, "얼음"),
    home("바닐라 시럽", "2~3펌프", HOME.syrup15ml, "그라데이션 파우더"),
    home("휘핑크림", "취향껏", HOME.whip30g, "휘핑크림"),
  ];
  return {
    id: "mega-unicorn-frappe",
    brand: "메가커피",
    name: "유니콘 프라페",
    category: "프라페·프라푸치노",
    price: 4900,
    emoji: "🦄",
    photoBg: "#F3E5F5",
    recipeReady: true,
    ingredients,
    recipe: {
      homeIngredients,
      steps: stepsFromManual(slug, "프라페 베이스 블렌딩", "믹서기 블렌딩", "휘핑크림 취향껏", homeIngredients),
      difficulty: 1,
      time: "약 5분",
      note: "집 레시피는 홈카페 실험 기준 · 그라데이션 파우더 없으면 유니콘/바닐라 시럽으로 대체",
    },
  };
}

function frappeMenu({ name, slug, flavor, price, topping }) {
  const ingredients = [
    ing("쿠키 베이스", "100ml", 100 * B2B.cookieBasePerMl),
    ing("우유", "100ml", 100 * B2B.milkPerMl),
    ing(`${flavor} 파우더`, "30g", 30 * B2B.powderPerG),
    ing("얼음", "0.5컵", B2B.ice),
    ing("휘핑크림", "30g", 30 * B2B.whipPerG),
    ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
  ];

  const homeIngredients = [
    home("쿠키베이스", "100ml", 260, "쿠키 베이스"),
    home("우유", "100ml", 100 * HOME.milkPerMl, "우유"),
    home(`${flavor} 파우더`, "30g", HOME.powder30g, `${flavor} 파우더`),
    home("얼음", "적당량", HOME.ice, "얼음"),
    home("휘핑크림", "30g", HOME.whip30g, "휘핑크림"),
  ];

  return {
    id: `mega-${slug || slugifyAscii(name)}`,
    brand: "메가커피",
    name,
    category: "프라페·프라푸치노",
    price,
    emoji: "🍧",
    photoBg: "#FCE4EC",
    recipeReady: true,
    ingredients,
    recipe: {
      homeIngredients,
      steps: stepsFromManual(slug, "프라페 베이스 블렌딩", "믹서기 블렌딩 + 토핑", topping, homeIngredients),
      difficulty: 2,
      time: "약 6분",
      note: `메가커피 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

function adeMenu({ name, slug, hot = false, tea = false, juice = false, flavor = "레몬", price, topping }) {
  const ingredients = [];
  const homeIngredients = [];
  if (tea) {
    ingredients.push(ing("티백/티베이스", "1개", B2B.syrupPerMl * 8));
    ingredients.push(ing(flavor.includes("유자") || flavor.includes("레몬") || flavor.includes("자몽") ? `${flavor}청` : "정수", "20ml", 20 * B2B.syrupPerMl));
    ingredients.push(ing("물", hot ? "200ml" : "120ml", B2B.water));
    if (!hot) ingredients.push(ing("얼음", "컵 가득", B2B.ice));
    ingredients.push(ing(hot ? "컵·뚜껑" : "컵·뚜껑·빨대", "1세트", hot ? B2B.cup : B2B.cupStraw));

    homeIngredients.push(home("티백", "1개", HOME.teaBag, "티백/티베이스"));
    if (flavor.includes("유자") || flavor.includes("레몬") || flavor.includes("자몽")) {
      homeIngredients.push(home(`${flavor}청`, "20ml", HOME.lemonBase, `${flavor}청`));
    }
    homeIngredients.push(home(hot ? "뜨거운 물" : "물", hot ? "200ml" : "120ml", HOME.water, "물"));
    if (!hot) homeIngredients.push(home("얼음", "적당량", HOME.ice, "얼음"));
  } else if (juice) {
    ingredients.push(ing(`${flavor} 베이스`, "120ml", 120 * B2B.syrupPerMl));
    ingredients.push(ing("물", "60ml", B2B.water));
    ingredients.push(ing("얼음", "0.5컵", B2B.ice));
    ingredients.push(ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw));

    homeIngredients.push(home(`${flavor}`, "120ml", HOME.fruitLarge, `${flavor} 베이스`));
    homeIngredients.push(home("물", "60ml", HOME.water, "물"));
    homeIngredients.push(home("얼음", "적당량", HOME.ice, "얼음"));
  } else {
    ingredients.push(ing(`${flavor} 베이스`, "45ml", 45 * B2B.syrupPerMl));
    ingredients.push(ing("탄산수", "180ml", B2B.water));
    ingredients.push(ing("얼음", "컵 가득", B2B.ice));
    ingredients.push(ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw));

    if (flavor === "레몬") {
      homeIngredients.push(home("레몬즙", "1.5펌프", HOME.lemonBase, "레몬 베이스"));
      homeIngredients.push(home("설탕시럽", "1펌프", HOME.syrupPump, "슈가시럽"));
    } else if (flavor === "블루레몬") {
      homeIngredients.push(home("레몬즙", "1.5펌프", HOME.lemonBase, "레몬 베이스"));
      homeIngredients.push(home("블루 레몬 시럽", "2펌프", HOME.syrup15ml, "블루큐라소 시럽"));
    } else if (flavor === "자몽") {
      homeIngredients.push(home("자몽청", "1펌프", HOME.lemonBase, "자몽 베이스"));
      homeIngredients.push(home("설탕시럽", "1펌프", HOME.syrupPump, "슈가시럽"));
    } else if (flavor === "메가믹스") {
      homeIngredients.push(home("자몽청", "1펌프", HOME.lemonBase, "후르티자몽 퓨레"));
      homeIngredients.push(home("라임", "85ml", HOME.lemonBase, "라임 베이스"));
    } else if (flavor === "라임") {
      homeIngredients.push(home("라임", "슬라이스 4개", 200, "라임"));
      homeIngredients.push(home("설탕시럽", "7펌프", 7 * HOME.syrupPump, "모히또 시럽"));
    } else if (flavor.includes("유니콘")) {
      homeIngredients.push(home("바닐라 시럽", "2펌프", HOME.syrup15ml, "유니콘 파우더"));
    } else if (flavor === "체리") {
      homeIngredients.push(home("체리시럽", "100ml", HOME.lemonBase, "체리 베이스"));
    } else {
      homeIngredients.push(home(`${flavor} 베이스`, "45ml", HOME.lemonBase, `${flavor} 베이스`));
    }
    homeIngredients.push(home("사이다", "250ml", HOME.sodaCanPart, "탄산수"));
    homeIngredients.push(home("얼음", "적당량", HOME.ice, "얼음"));
  }

  return {
    id: `mega-${slug || slugifyAscii(name)}`,
    brand: "메가커피",
    name,
    category: "에이드·과일",
    price,
    emoji: tea ? (hot ? "🍵" : "🫖") : juice ? "🍹" : "🍋",
    photoBg: tea ? "#FFFDE7" : "#E8F5E9",
    recipeReady: true,
    ingredients,
    recipe: {
      homeIngredients,
      steps: stepsFromManual(slug, `${flavor} 베이스 조합`, "시판 재료로 집에서 재현", topping, homeIngredients),
      difficulty: 1,
      time: hot ? "약 3분" : "약 4분",
      note: `메가커피 제조 매뉴얼 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`,
    },
  };
}

const menus = [];

// COFFEE HOT
menus.push(coffeeMenu({ name: "핫 아메리카노", slug: "hot-americano", iced: false, shots: 2, waterMl: 180, category: "커피", price: 1800 }));
menus.push(coffeeMenu({ name: "핫 꿀아메리카노", slug: "hot-honey-americano", iced: false, shots: 2, waterMl: 170, honeyG: 15, category: "커피", price: 2300 }));
menus.push(coffeeMenu({ name: "핫 헤이즐넛 아메리카노", slug: "hot-hazelnut-americano", iced: false, shots: 2, waterMl: 170, syrupMl: 15, syrupName: "헤이즐넛 시럽", category: "커피", price: 2400 }));
menus.push(coffeeMenu({ name: "핫 바닐라 아메리카노", slug: "hot-vanilla-americano", iced: false, shots: 2, waterMl: 170, syrupMl: 15, syrupName: "바닐라 시럽", category: "커피", price: 2400 }));
menus.push(coffeeMenu({ name: "핫 카페라떼", slug: "hot-cafe-latte", iced: false, shots: 2, milkMl: 180, category: "라떼", price: 2900 }));
menus.push(coffeeMenu({ name: "핫 카푸치노", slug: "hot-cappuccino", iced: false, shots: 2, milkMl: 160, whipG: 10, category: "라떼", price: 3000, topping: "시나몬 파우더" }));
menus.push(coffeeMenu({ name: "핫 카라멜마끼아또", slug: "hot-caramel-macchiato", iced: false, shots: 2, milkMl: 170, syrupMl: 20, syrupName: "카라멜 시럽", category: "라떼", price: 3300, topping: "카라멜 드리즐" }));
menus.push(coffeeMenu({ name: "핫 바닐라라떼", slug: "hot-vanilla-latte", iced: false, shots: 2, milkMl: 180, syrupMl: 15, syrupName: "바닐라 시럽", category: "라떼", price: 3200 }));
menus.push(coffeeMenu({ name: "핫 헤이즐넛라떼", slug: "hot-hazelnut-latte", iced: false, shots: 2, milkMl: 180, syrupMl: 15, syrupName: "헤이즐넛 시럽", category: "라떼", price: 3200 }));
menus.push(coffeeMenu({ name: "핫 연유라떼", slug: "hot-condensed-latte", iced: false, shots: 2, milkMl: 170, condensedMl: 20, category: "라떼", price: 3400, homeExtra: [home("설탕시럽", "1펌프", HOME.syrupPump, "슈가시럽")] }));
menus.push(coffeeMenu({ name: "핫 카페모카", slug: "hot-cafe-mocha", iced: false, shots: 2, milkMl: 170, powderG: 20, powderName: "초코 파우더", whipG: 20, category: "라떼", price: 3600, topping: "휘핑크림, 초코 드리즐" }));
menus.push(coffeeMenu({ name: "핫 티라미수라떼", slug: "hot-tiramisu-latte", iced: false, shots: 2, milkMl: 170, powderG: 20, powderName: "티라미수 파우더", category: "라떼", price: 3900, topping: "티라미수 크림, 코코아 파우더", homeExtra: [home("설탕시럽", "1펌프", HOME.syrupPump, "슈가시럽")] }));

// COFFEE ICE
menus.push(coffeeMenu({ name: "아이스 아메리카노", slug: "iced-americano", iced: true, shots: 2, waterMl: 170, category: "커피", price: 2000 }));
menus.push(coffeeMenu({ name: "아이스 메가리카노", slug: "iced-megaricano", iced: true, shots: 3, waterMl: 260, category: "커피", price: 2500 }));
menus.push(coffeeMenu({ name: "아이스 꿀아메리카노", slug: "iced-honey-americano", iced: true, shots: 2, waterMl: 160, honeyG: 15, category: "커피", price: 2600 }));
menus.push(coffeeMenu({ name: "아이스 헤이즐넛 아메리카노", slug: "iced-hazelnut-americano", iced: true, shots: 2, waterMl: 160, syrupMl: 15, syrupName: "헤이즐넛 시럽", category: "커피", price: 2600 }));
menus.push(coffeeMenu({ name: "아이스 바닐라 아메리카노", slug: "iced-vanilla-americano", iced: true, shots: 2, waterMl: 160, syrupMl: 15, syrupName: "바닐라 시럽", category: "커피", price: 2600 }));
menus.push(coffeeMenu({ name: "아이스 카페라떼", slug: "iced-cafe-latte", iced: true, shots: 2, milkMl: 180, category: "라떼", price: 3200 }));
menus.push(coffeeMenu({ name: "아이스 바닐라라떼", slug: "iced-vanilla-latte", iced: true, shots: 2, milkMl: 180, syrupMl: 15, syrupName: "바닐라 시럽", category: "라떼", price: 3500 }));

// NON-COFFEE LATTE HOT
menus.push(latteNoCoffeeMenu({ name: "핫 녹차라떼", slug: "hot-green-tea-latte", iced: false, powderName: "녹차 파우더", powderG: 30, milkMl: 180, price: 3400, topping: "녹차 파우더" }));
menus.push(latteNoCoffeeMenu({ name: "핫 로얄밀크티", slug: "hot-royal-milk-tea", iced: false, powderName: "홍차 베이스", powderG: 25, milkMl: 180, price: 3400 }));
menus.push(latteNoCoffeeMenu({ name: "핫초코", slug: "hot-choco", iced: false, powderName: "초코 파우더", powderG: 35, milkMl: 180, price: 3200, topping: "코코아 파우더" }));
menus.push(latteNoCoffeeMenu({ name: "핫 메가초코", slug: "hot-mega-choco", iced: false, powderName: "초코 파우더", powderG: 45, milkMl: 220, price: 3900, topping: "휘핑크림, 초코·카라멜 드리즐, 딸기 분태" }));
menus.push(latteNoCoffeeMenu({ name: "핫 토피넛라떼", slug: "hot-toffee-nut-latte", iced: false, powderName: "토피넛 파우더", powderG: 30, milkMl: 180, price: 3700, topping: "카라멜 소스 드리즐" }));
menus.push(latteNoCoffeeMenu({ name: "핫 고구마라떼", slug: "hot-sweet-potato-latte", iced: false, powderName: "고구마 파우더", powderG: 30, milkMl: 180, price: 3600, topping: "아몬드 슬라이스", sugarPumps: 1 }));
menus.push(latteNoCoffeeMenu({ name: "핫 곡물라떼", slug: "hot-grain-latte", iced: false, powderName: "곡물 파우더", powderG: 30, milkMl: 180, price: 3300, topping: "아몬드 슬라이스", sugarPumps: 1 }));

// NON-COFFEE ICE
menus.push(latteNoCoffeeMenu({ name: "아이스 녹차라떼", slug: "iced-green-tea-latte", iced: true, powderName: "녹차 파우더", powderG: 30, milkMl: 180, price: 3600 }));
menus.push(latteNoCoffeeMenu({ name: "아이스 초코", slug: "iced-choco", iced: true, powderName: "초코 파우더", powderG: 35, milkMl: 180, price: 3500 }));
menus.push(latteNoCoffeeMenu({ name: "아이스 메가초코", slug: "iced-mega-choco", iced: true, powderName: "초코 파우더", powderG: 45, milkMl: 220, price: 4100, topping: "휘핑크림, 초코·카라멜 드리즐, 딸기 분태" }));
menus.push(latteNoCoffeeMenu({ name: "아이스 곡물라떼", slug: "iced-grain-latte", iced: true, powderName: "곡물 파우더", powderG: 30, milkMl: 180, price: 3600, sugarPumps: 1 }));
menus.push(latteNoCoffeeMenu({ name: "아이스 로얄밀크티", slug: "iced-royal-milk-tea", iced: true, powderName: "홍차 베이스", powderG: 25, milkMl: 180, price: 3600 }));
menus.push(latteNoCoffeeMenu({ name: "아이스 고구마라떼", slug: "iced-sweet-potato-latte", iced: true, powderName: "고구마 파우더", powderG: 30, milkMl: 180, price: 3700, sugarPumps: 1 }));
menus.push(latteNoCoffeeMenu({ name: "아이스 토피넛라떼", slug: "iced-toffee-nut-latte", iced: true, powderName: "토피넛 파우더", powderG: 30, milkMl: 180, price: 3800 }));

// SMOOTHIE
menus.push(smoothieMenu({ name: "플레인 요거트스무디", slug: "plain-yogurt-smoothie", fruitLabel: "플레인 요거트 파우더", price: 3900 }));

// FRAPPE
menus.push(frappeMenu({ name: "쿠키프라페", slug: "cookie-frappe", flavor: "쿠키", price: 4500 }));
menus.push(frappeMenu({ name: "민트프라페", slug: "mint-frappe", flavor: "민트", price: 4500 }));
menus.push(frappeMenu({ name: "리얄초코프라페", slug: "real-choco-frappe", flavor: "리얼초코", price: 4700 }));
menus.push(frappeMenu({ name: "녹차프라페", slug: "green-tea-frappe", flavor: "녹차", price: 4500 }));
menus.push(frappeMenu({ name: "커피프라페", slug: "coffee-frappe", flavor: "커피", price: 4600 }));
menus.push(unicornFrappeMenu());

// ADE/JUICE/TEA
menus.push(adeMenu({ name: "체리콕", slug: "cherry-coke", flavor: "체리", price: 3300 }));
menus.push(adeMenu({ name: "레몬에이드", slug: "lemon-ade", flavor: "레몬", price: 3200 }));
menus.push(adeMenu({ name: "블루레몬에이드", slug: "blue-lemon-ade", flavor: "블루레몬", price: 3500 }));
menus.push(adeMenu({ name: "자몽에이드", slug: "grapefruit-ade", flavor: "자몽", price: 3500 }));
menus.push(adeMenu({ name: "메가에이드", slug: "mega-ade", flavor: "메가믹스", price: 3900 }));
menus.push(adeMenu({ name: "라임모히또", slug: "lime-mojito", flavor: "라임", price: 3900 }));
menus.push(adeMenu({ name: "유니콘 매직에이드(블루)", slug: "unicorn-magic-ade-blue", flavor: "유니콘 블루", price: 4200 }));
menus.push(adeMenu({ name: "유니콘 매직에이드(핑크)", slug: "unicorn-magic-ade-pink", flavor: "유니콘 핑크", price: 4200 }));

menus.push({
  id: "mega-plain-pong-crush",
  brand: "메가커피",
  name: "플레인퐁크러쉬",
  category: "프라페·프라푸치노",
  price: 3900,
  emoji: "🧇",
  photoBg: "#FFF8E1",
  recipeReady: true,
  ingredients: [
    ing("우유", "0.5컵", 100 * B2B.milkPerMl),
    ing("프라페 베이스 시럽", "35ml", 35 * B2B.syrupPerMl),
    ing("와플 크럼", "30g", 30 * B2B.powderPerG),
    ing("휘핑크림", "30g", 30 * B2B.whipPerG),
    ing("얼음", "8개", B2B.ice),
    ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
  ],
  recipe: {
    homeIngredients: [
      home("우유", "100ml", 100 * HOME.milkPerMl, "우유"),
      home("투게더", "3큰술", HOME.together3spoon, ["프라페 베이스 시럽", "휘핑크림"]),
      home("얼음", "8개", HOME.ice, "얼음"),
      home("죠리퐁", "0.5컵", HOME.jollypongHalf, "와플 크럼"),
      home("죠리퐁", "토핑", HOME.jollypongTop, "와플 크럼"),
    ],
    steps: stepsFromManual("plain-pong-crush", "", "", "죠리퐁", []),
    difficulty: 2,
    time: "약 6분",
    note: `메가커피 홈레시피 · ${POOR_KITCHEN_RECIPE_NOTE}`,
  },
});

menus.push({
  id: "mega-hal-mega-coffee",
  brand: "메가커피",
  name: "할메가커피",
  category: "커피",
  price: 2100,
  emoji: "☕",
  photoBg: "#EFEBE9",
  recipeReady: true,
  ingredients: [
    ing("원두(에스프레소)", "1샷", B2B.espressoPerShot),
    ing("물", "400ml", 400 * B2B.water),
    ing("얼음", "가득", B2B.ice),
    ing("컵·뚜껑·빨대", "1세트", B2B.cupStraw),
  ],
  recipe: {
    homeIngredients: [
      home("커피믹스", "3봉", HOME.coffeeMix3, "원두(에스프레소)"),
      home("설탕", "1큰술", HOME.sugarSpoon, "원두(에스프레소)"),
      home("프림", "2큰술", HOME.cream2spoon, "원두(에스프레소)"),
      home("물", "100ml", 10, "물"),
      home("얼음", "가득", HOME.ice, "얼음"),
      home("우유", "300ml", HOME.milk300ml, "물"),
    ],
    steps: stepsFromManual("hal-mega-coffee", "", "", "", []),
    difficulty: 1,
    time: "약 5분",
    note: `메가커피 홈레시피 · 찬물로 대체해도 OK · ${POOR_KITCHEN_RECIPE_NOTE}`,
  },
});

const outputMenus = filterCheaperAtHome(filterManualMenus(menus, "mega-", MANUAL));
const minPrice = Math.min(...outputMenus.map((m) => m.price));
const maxPrice = Math.max(...outputMenus.map((m) => m.price));
if (outputMenus.length !== 44) {
  throw new Error(`Expected 44 manual menus but got ${outputMenus.length}`);
}
if (minPrice < 1500 || maxPrice > 5200) {
  throw new Error(`Price out of range: ${minPrice} ~ ${maxPrice}`);
}

const out = `// generated by scripts/build-mega-menus.js
const MEGA_MENUS = ${JSON.stringify(outputMenus, null, 2)};

if (typeof window !== "undefined") {
  window.MEGA_MENUS = MEGA_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { MEGA_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${outputMenus.length}`);
console.log(`Price range: ${minPrice}~${maxPrice}`);
