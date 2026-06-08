/**
 * 실제 시장가 기준 원가 일괄 반영 (2025~2026 한국 기준)
 * - 매장(B2B): 프랜차이즈 도매·업체 납품 단가 추정
 * - 집(home): 이마트·쿠팡·다이소 등 소비자 1회 분량
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_PATH = path.join(__dirname, "../data.js");

// ── 공통 단가 (원) ──────────────────────────────────────────
const B2B = {
  milkPerMl: 1.5, // 우유 도매 ~1,500원/L
  espressoPerShot: 68, // 원두 7g/샷, ~10,000원/kg
  cup: 95,
  cupStraw: 115,
  ice: 25,
  water: 5,
  syrupPerMl: 7, // 농축 시럽 B2B
  powderPerG: 9, // 파우더·베이스 B2B
  pureePerG: 3.5, // 과일 퓨레 B2B
  pearlPerG: 3.8, // 타피오카·펄 B2B
  whipPerG: 5.5,
  creamPerG: 6,
  cookieCrumbPerG: 8,
  javaChipPerG: 9,
  icecreamPerG: 4.5,
  gelatoScoop: 220,
  condensedPerMl: 8,
  coconutMilkPerMl: 2.2,
  teaBasePerMl: 1.8,
  coldBrewPerMl: 2.5,
  honeyPerG: 12,
  dalgonaPerG: 15,
  cookieBasePerMl: 2.8,
  fruitFrozenPerG: 5.5,
  sagolPerG: 8,
  soybeanPowderPerSpoon: 45,
  ricecakePerG: 7,
  soyMilkPerMl: 1.4,
};

const HOME = {
  // ── 마트 실판매가 → 1회 분량 (2025~2026 이마트·홈플·쿠팡 기준) ──
  milkPerMl: 2.5, // 우유 1L 2,480~2,980원
  soyMilkPerMl: 2.4, // 두유 190ml 430~480원
  coconutMilkPerMl: 3.7, // 코코넛밀크 400ml 1,180~1,580원
  creamPerMl: 6.4, // 생크림 500ml 2,800~3,400원
  whipPerG: 5.8, // 식물성 휘핑 500g 2,700~3,200원
  water100ml: 5,
  ice: 50,
  coffeeMixStick: 38, // 믹스 20입 720~800원
  coffeeMix3: 114,
  primTsp: 40, // 프림 500g 7,500~8,500원, 1~2tsp(5g)
  sugarTbsp: 10, // 설탕 1kg 1,500~1,900원, 1큰술(4g)
  honeyTbsp: 200, // 꿀 500g 10,000~14,000원, 1큰술(15g)
  espressoLiquidStick: 1150, // 액상스틱 10입 11,500원 (로카에스프레소 등)
  coffeeInstantStick: 45, // 커피스틱 10입 430~480원
  syrupPump15ml: 60, // 시럽 500ml 1,800~2,200원
  syrup3Pump: 180,
  vanillaSyrup15ml: 240, // 바닐라 750ml 11,000~13,000원
  hazelnutSyrup15ml: 270, // 500ml 8,000~9,500원
  almondSyrup10ml: 65,
  chocoSyrup15ml: 85,
  condensedTbsp: 95, // 연유 380g 3,200~3,800원, 1큰술(15ml)
  togetherTubG: 400, // 투게더 473ml
  togetherTubPrice: 3980,
  together3Spoon: 400, // 3큰술 ~45g
  jollypongHalfCup: 290, // 138g 1,700~2,500원, 0.5컵
  tapioca40g: 200, // 건타피오카 1kg 4,500~6,000원
  pearlPortion: 200,
  whitePearl35g: 230,
  sagolPearl35g: 290,
  teaBag: 90, // 홍차 티백 1개(20~25입 2,000~2,500원)
  teaBag2: 180,
  blackTea150ml: 130,
  oolongTeaBrew: 130,
  frozenMango150g: 900, // 1kg 5,500~6,500원
  frozenStrawberry100g: 700,
  frozenBlueberry100g: 900,
  mango2pc200g: 980,
  peachCanJuice60ml: 360, // 황도 820g 2,500~3,200원
  mangoJuice60ml: 270, // 200ml 850~950원
  pomelo1pc: 2800,
  yogurtDrink150ml: 550, // 150ml 480~620원
  plainYogurt50g: 140, // 400g 2,500~3,200원, 2~3큰술
  yogurtPowder35g: 180,
  yogurtPowder45g: 230,
  yogurtGelatoScoop: 520,
  yogurtIcecreamScoop: 480, // 요거트 아이스크림 473ml 4,500~5,500원, 1스쿱
  milkshakePowder5Spoon: 460, // 테너 950g 11,000~13,000원, 5스푼(35g)
  grainPowder60g: 230, // 미숫가루 1kg 3,500~4,200원
  taroPowder3Spoon: 290,
  vanillaPowder2Spoon: 100,
  vanillaBeanPowder: 90,
  chocoPowder30g: 290,
  javaChip30g: 380,
  javaChipTop15g: 130,
  cookie3pc: 250,
  chocoCrunch3Spoon: 190,
  bananaPowder: 100,
  peachTeaPowder65g: 240,
  toffeeNutStick: 225, // 20입 4,000~4,800원
  toffeePowder3Spoon: 230,
  peanutButterTbsp: 115,
  peanutTop: 55,
  nutsTop: 290,
  dalgonaPortion: 160,
  cookieBase100ml: 260,
  unicornPowder2Pump: 340,
  lemonJuiceCoat: 160,
  pinkSaltPinch: 15,
  coldBrew130ml: 680, // 1L 4,500~5,500원
  icecream3Spoon: 340,
  icecreamScoop: 520,
  oreoCookieBase: 260,
};

function parseMl(amount) {
  if (!amount) return 0;
  const m = amount.match(/([\d.]+)\s*ml/i);
  if (m) return parseFloat(m[1]);
  if (amount.includes("1컵") && !amount.includes("반")) return 200;
  if (amount.includes("1.5컵")) return 300;
  if (amount.includes("0.75컵")) return 150;
  if (amount.includes("0.5컵")) return 100;
  return 0;
}

function parseG(amount) {
  if (!amount) return 0;
  const m = amount.match(/([\d.]+)\s*g/i);
  return m ? parseFloat(m[1]) : 0;
}

function parseShots(amount) {
  if (!amount) return 1;
  if (amount.includes("3샷") || amount.includes("21g")) return 3;
  if (amount.includes("1~2") || amount.includes("1-2")) return 1.5;
  if (amount.includes("2샷") || amount.includes("60ml")) return 2;
  if (amount.includes("1샷")) return 1;
  return 1;
}

function parseIceCount(amount) {
  if (!amount) return 5;
  if (amount.includes("180g") || amount.includes("190g") || amount.includes("290g")) return 10;
  if (amount.includes("1.5컵") || amount.includes("10~12")) return 11;
  if (amount.includes("8~10")) return 9;
  if (amount.includes("7개")) return 7;
  if (amount.includes("8개")) return 8;
  if (amount.includes("6개")) return 6;
  if (amount.includes("5개") || amount.includes("컵 가득")) return 5;
  if (amount.includes("4~5")) return 4;
  if (amount.includes("4개")) return 4;
  if (amount.includes("0.5컵")) return 4;
  return 5;
}

function storeCost(name, amount) {
  const ml = parseMl(amount);
  const g = parseG(amount);
  const n = name;

  if (n.includes("우유") && !n.includes("두유") && !n.includes("코코넛")) {
    const milkMl = ml || (amount.includes("0.75컵") ? 150 : amount.includes("0.5컵") ? 100 : amount.includes("1컵") ? 200 : 150);
    return Math.round(milkMl * B2B.milkPerMl);
  }
  if (n.includes("두유")) return Math.round((ml || 175) * B2B.soyMilkPerMl);
  if (n.includes("코코넛")) return Math.round((ml || 150) * B2B.coconutMilkPerMl);
  if (n.includes("원두") || n.includes("프라푸치노 로스트")) return Math.round(parseShots(amount) * B2B.espressoPerShot);
  if (n.includes("컵·뚜껑·빨대")) return B2B.cupStraw;
  if (n.includes("컵·뚜껑")) return B2B.cup;
  if (n === "얼음") return B2B.ice;
  if (n === "물" || n.includes("정수")) return B2B.water;
  if (n.includes("시럽") || n.includes("허니")) return Math.round((ml || g || 20) * (n.includes("꿀") ? B2B.honeyPerG : B2B.syrupPerMl));
  if (n.includes("파우더") || (n.includes("베이스") && !n.includes("쿠키"))) {
    const grams = g || (amount.includes("스푼") ? 25 : 35);
    if (n.includes("쉐이크 베이스") || n.includes("테너")) return Math.round(grams * 4);
    if (grams >= 100) return Math.round(grams * 3.5);
    if (grams >= 50) return Math.round(grams * 6);
    return Math.round(grams * 9);
  }
  if (n.includes("퓨레") || n.includes("원액") && n.includes("자몽")) return Math.round((g || ml || 100) * (g ? B2B.pureePerG : 4.5));
  if (n.includes("타피오카") || n.includes("펄") || n.includes("사고")) return Math.round((g || 70) * (n.includes("사고") ? B2B.sagolPerG : B2B.pearlPerG));
  if (n.includes("휘핑") || n.includes("크림") && n.includes("업체")) return Math.round((g || 40) * B2B.whipPerG);
  if (n.includes("크림 베이스")) return Math.round((g || 65) * B2B.creamPerG);
  if (n.includes("쿠키") && n.includes("크럼")) return Math.round((g || 35) * B2B.cookieCrumbPerG);
  if (n.includes("자바칩")) return Math.round((g || 30) * B2B.javaChipPerG);
  if (n.includes("아이스크림") || n.includes("젤라또")) return n.includes("스쿱") ? B2B.gelatoScoop : Math.round((g || 60) * B2B.icecreamPerG);
  if (n.includes("연유")) return Math.round((ml || 15) * B2B.condensedPerMl);
  if (n.includes("농축") || n.includes("티") && n.includes("베이스")) return Math.round((ml || 150) * B2B.teaBasePerMl);
  if (n.includes("콜드브루")) return Math.round((ml || 130) * B2B.coldBrewPerMl);
  if (n.includes("달고나")) return Math.round((g || 15) * B2B.dalgonaPerG);
  if (n.includes("쿠키 베이스")) return Math.round((ml || 100) * B2B.cookieBasePerMl);
  if (n.includes("냉동") || n.includes("애플망고")) return Math.round((g || 50) * B2B.fruitFrozenPerG);
  if (n.includes("찰떡") || n.includes("인절미")) return Math.round((g || 30) * B2B.ricecakePerG);
  if (n.includes("와플") || n.includes("크럼") && n.includes("초코")) return Math.round((g || 30) * B2B.cookieCrumbPerG);
  if (n.includes("레몬")) return Math.round((ml || 15) * 8);
  if (n.includes("소이빈")) return B2B.soybeanPowderPerSpoon * 2;
  return null;
}

// 메뉴별 분량이 다른 동일 라벨 (만드는 방법 기준 추정 ml/g)
const HOME_MENU_OVERRIDE = {
  "mega-hal": { 우유: Math.round(150 * HOME.milkPerMl) },
  "compose-vanilla": { 우유: Math.round(200 * HOME.milkPerMl) },
  "compose-grain": { 우유: Math.round(250 * HOME.milkPerMl) },
  "paik-strawberry": { 우유: Math.round(200 * HOME.milkPerMl) },
  "mammoth-honey-latte": { 우유: Math.round(150 * HOME.milkPerMl) },
  "chabaek-mango": { 우유: Math.round(50 * HOME.milkPerMl) },
  "ediya-flat": { 우유: Math.round(150 * HOME.milkPerMl) },
  "hasamdong-salt": { 우유: Math.round(125 * HOME.milkPerMl), 에스프레소: HOME.espressoLiquidStick * 2 },
  "sb-javachip": { 우유: Math.round(180 * HOME.milkPerMl), 에스프레소: HOME.espressoLiquidStick },
  "sb-coldbrew": { 우유: Math.round(40 * HOME.milkPerMl), 생크림: Math.round(50 * HOME.creamPerMl) },
  "d39-cream": {
    우유: Math.round(110 * HOME.milkPerMl),
    휘핑크림: Math.round(65 * HOME.whipPerG),
    에스프레소: HOME.espressoLiquidStick * 1.5,
  },
  "pascucci-java": { 우유: Math.round(100 * HOME.milkPerMl), 에스프레소: HOME.espressoLiquidStick },
  "pascucci-yogurt": { 우유: Math.round(100 * HOME.milkPerMl) },
  "pascucci-blueberry": { 우유: Math.round(110 * HOME.milkPerMl) },
  "mammoth-honey-coffee": { 에스프레소: HOME.espressoLiquidStick * 1.5 },
};

function together150g() {
  return Math.round((HOME.togetherTubPrice * 150) / HOME.togetherTubG);
}

function parseCupMl(label) {
  if (/0\.25컵/.test(label)) return 50;
  if (/0\.5컵/.test(label)) return 100;
  if (/0\.75컵/.test(label)) return 150;
  if (/1컵/.test(label)) return 200;
  const ml = label.match(/([\d.]+)\s*ml/);
  if (ml) return parseFloat(ml[1]);
  return 0;
}

function homeCost(menuId, label, amount) {
  const qualitative = !amount || amount === "-" || !/[\d]/.test(amount);
  const combined = qualitative ? null : `${label} ${amount}`.replace(/\s+/g, " ").trim();
  if (combined) {
    const fromCombined = homeCostByKey(menuId, combined);
    if (fromCombined !== null) return fromCombined;
    const ml = parseCupMl(combined) || parseCupMl(amount || "");
    if (ml && (label === "우유" || label.startsWith("우유"))) {
      return Math.round(ml * HOME.milkPerMl);
    }
  }

  return homeCostByKey(menuId, label);
}

function homeCostByKey(menuId, label) {
  const override = HOME_MENU_OVERRIDE[menuId]?.[label];
  if (override !== undefined) return Math.round(override);

  const L = label;

  // ── 정확 라벨 매칭 ──
  const exact = {
    "커피믹스": HOME.coffeeMix3,
    "프림": HOME.primTsp,
    "설탕": HOME.sugarTbsp,
    "뜨거운 물 0.5컵": HOME.water100ml,
    "뜨거운 물 0.25컵": 5,
    "뜨거운 물 150ml": 5,
    "따뜻한 물 50ml": 5,
    "찬물": HOME.water100ml,
    "차가운 물 250ml": 10,
    "물": 10,
    "물 0.75컵": 5,
    "쿠키베이스": HOME.cookieBase100ml,
    "유니콘 파우더 2펌프": HOME.unicornPowder2Pump,
    "레몬주스": HOME.lemonJuiceCoat,
    "티백": HOME.teaBag,
    "홍차 티백 2개": HOME.teaBag2,
    "타피오카 펄": HOME.pearlPortion,
    "타피오카 펼 40g": HOME.tapioca40g,
    "타피오카 펄 40g": HOME.tapioca40g,
    "냉동 망고": HOME.frozenMango150g,
    "드링킹 요거트": HOME.yogurtDrink150ml,
    "화이트 펄": HOME.whitePearl35g,
    "파우더 5스푼": HOME.milkshakePowder5Spoon,
    "에스프레소 액상스틱": HOME.espressoLiquidStick * 2,
    "바닐라 시럽": HOME.vanillaSyrup15ml,
    "바닐라 빈 파우더": HOME.vanillaBeanPowder,
    "곡물 파우더": HOME.grainPowder60g,
    "설탕 시럽": HOME.syrupPump15ml,
    "투게더(150g)": together150g(),
    "투게더 150g": together150g(),
    "투게더 3스푼": HOME.together3Spoon,
    "아이스크림 1스쿱": HOME.icecreamScoop,
    "복숭아 국물": HOME.peachCanJuice60ml,
    "망고 주스": HOME.mangoJuice60ml,
    "시럽": HOME.syrup3Pump,
    "딸기소스": HOME.syrup3Pump,
    "꿀": HOME.honeyTbsp,
    "에스프레소": HOME.espressoLiquidStick * 1.5,
    "에스프레소 샷": HOME.espressoLiquidStick,
    "에스프레소 1샷": HOME.espressoLiquidStick,
    "커피 스틱 5개": HOME.coffeeInstantStick * 5,
    "사고 펄": HOME.sagolPearl35g,
    "망고": HOME.mango2pc200g,
    "코코넛 밀크": Math.round(150 * HOME.coconutMilkPerMl),
    "연유": HOME.condensedTbsp,
    "포멜로": HOME.pomelo1pc,
    "우롱찻잎": HOME.oolongTeaBrew,
    "콩가루": Math.round(20 * (2800 / 200)),
    "찰떡": Math.round(30 * (3500 / 400)),
    "두유": Math.round(175 * HOME.soyMilkPerMl),
    "땅콩버터": HOME.peanutButterTbsp,
    "토피넛 라떼 스틱": HOME.toffeeNutStick,
    "땅콩": HOME.peanutTop,
    "토피넛 파우더": HOME.toffeePowder3Spoon,
    "헤이즐넛 시럽": HOME.hazelnutSyrup15ml,
    "견과류": HOME.nutsTop,
    "달고나": HOME.dalgonaPortion,
    "흰 우유": Math.round(200 * HOME.milkPerMl),
    "생크림": Math.round(80 * HOME.creamPerMl),
    "히말라야 핑크솔트": HOME.pinkSaltPinch,
    "자바칩 파우더": HOME.chocoPowder30g,
    "바닐라 아이스크림": HOME.icecream3Spoon,
    "통자바칩": HOME.javaChipTop15g,
    "초콜릿 시럽": HOME.chocoSyrup15ml,
    "자몽청 2스푼": Math.round((9980 * 40) / 1000),
    "홍차 150ml": HOME.blackTea150ml,
    "콜드브루 원액": HOME.coldBrew130ml,
    "휘핑크림": Math.round(40 * HOME.whipPerG),
    "아몬드 시럽": HOME.almondSyrup10ml,
    "초코 파우더": HOME.chocoPowder30g,
    "자바칩": HOME.javaChip30g,
    "요거트 파우더": HOME.yogurtPowder35g,
    "플레인 요거트": HOME.plainYogurt50g,
    "요거트 젤라또": HOME.yogurtGelatoScoop,
    "요거트 아이스크림": HOME.yogurtIcecreamScoop,
    "냉동 딸기": HOME.frozenStrawberry100g,
    "냉동 블루베리": HOME.frozenBlueberry100g,
    "얼음": HOME.ice,
    "얼음 5개": HOME.ice,
    "죠리퐁 0.5컵": HOME.jollypongHalfCup,
    "타로 파우더 3큰술": HOME.taroPowder3Spoon,
    "설탕 1큰술": HOME.sugarTbsp,
    "바닐라 파우더 2큰술": HOME.vanillaPowder2Spoon,
    "초코 쿠키 3개": HOME.cookie3pc,
    "초코 크런치 3큰술": HOME.chocoCrunch3Spoon,
    "바나나 파우더": HOME.bananaPowder,
    "복숭아 아이스티 파우더 65g": HOME.peachTeaPowder65g,
  };
  if (exact[L] !== undefined) return Math.round(exact[L]);

  // ── 우유 (용량 표기) ──
  if (L.startsWith("우유")) {
    const ml = parseCupMl(L) || 200;
    return Math.round(ml * HOME.milkPerMl);
  }

  return null;
}

// ── 실행 ──────────────────────────────────────────────────
const code = fs.readFileSync(DATA_PATH, "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code + "\nthis.MENUS = MENUS;", ctx);
const MENUS = ctx.MENUS;

let storeUpdated = 0;
let homeUpdated = 0;
let homeManual = 0;

ctx.MENUS.forEach((menu) => {
  (menu.ingredients || []).forEach((ing) => {
    const calc = storeCost(ing.name, ing.amount);
    if (calc !== null) {
      ing.cost = calc;
      storeUpdated++;
    }
  });

  (menu.recipe?.homeIngredients || []).forEach((item) => {
    if (typeof item === "string") return;
    const calc = homeCost(menu.id, item.label, item.amount);
    if (calc !== null) {
      item.price = calc;
      delete item.cost;
      homeUpdated++;
    } else {
      homeManual++;
      console.warn(`[home manual] ${menu.id}: ${item.label}`);
    }
  });
});

// 컴팩트 형식 직렬화 (기존 data.js 스타일 유지)
function j(s) {
  return JSON.stringify(s);
}

function fmtReplaces(r) {
  if (Array.isArray(r)) return `[${r.map(j).join(", ")}]`;
  if (r) return j(r);
  return '""';
}

function fmtMenu(m) {
  const lines = [
    "  {",
    `    id: ${j(m.id)},`,
    `    brand: ${j(m.brand)},`,
    `    name: ${j(m.name)},`,
    `    category: ${j(m.category)},`,
    `    price: ${m.price},`,
    `    emoji: ${j(m.emoji)},`,
    `    photoBg: ${j(m.photoBg)},`,
  ];
  if (m.discontinued) lines.push("    discontinued: true,");
  lines.push(`    recipeReady: ${m.recipeReady},`);
  lines.push("    ingredients: [");
  m.ingredients.forEach((ing) => {
    lines.push(`      { name: ${j(ing.name)}, amount: ${j(ing.amount)}, cost: ${ing.cost} },`);
  });
  lines.push("    ],");
  lines.push("    recipe: {");
  lines.push("      homeIngredients: [");
  m.recipe.homeIngredients.forEach((h) => {
    if (typeof h === "string") {
      lines.push(`        ${j(h)},`);
    } else {
      lines.push(`        { label: ${j(h.label)}, amount: ${j(h.amount || "")}, price: ${h.price ?? h.cost ?? 0}, replaces: ${fmtReplaces(h.replaces)} },`);
    }
  });
  lines.push("      ],");
  lines.push("      steps: [");
  m.recipe.steps.forEach((s) => {
    lines.push(`        { title: ${j(s.title)}, body: ${j(s.body)} },`);
  });
  lines.push("      ],");
  lines.push(`      difficulty: ${m.recipe.difficulty},`);
  lines.push(`      time: ${j(m.recipe.time)},`);
  lines.push(`      note: ${j(m.recipe.note)},`);
  lines.push("    },");
  lines.push("  },");
  return lines.join("\n");
}

function serializeMenus(menus) {
  return menus.map(fmtMenu).join("\n");
}

const menusStr = serializeMenus(ctx.MENUS);
const footerStart = code.indexOf("];\n\nconst CATEGORIES");
const footer = code.slice(footerStart + 3); // from ];

const newHeader = `// 매장 ingredients: 프랜차이즈 B2B·업체용 재료(알바 제보·원가 추정)
// 집 recipe.homeIngredients: 마트·쿠팡 등 소비자 실판매가(1회 분량) — price 필드
//
// [매장 B2B 단가 기준]
// - 우유 ~1,500원/L (1.5원/ml) · 원두 에스프레소 ~68원/샷(7g)
// - 시럽·농축액 ~7원/ml · 파우더·베이스 ~9원/g · 과일퓨레 ~3.5원/g
// - 타피오카·펄 ~3.8원/g · 휘핑·크림 ~5.5원/g · 컵 95~115원 · 얼음 25원
//
// [집 마트 판매가 기준] price = 1회 분량 소비자 실판매가
// - 우유 1L 2,480~2,980원 (2.5원/ml) · 액상스틱 99원/개 · 커피스틱 45원/개
// - 얼음 1잔 50원 · 투게더 3스푼 400원 · 죠리퐁 0.5컵 290원
// - 냉동망고 150g 900원 · 황도통조림 국물 60ml 360원 · 자몽청 2스푼 400원
// - 설탕시럽 3펌프 180원 · 헤이즐넛시럽 1큰술 270원 · 포멜로 1개 2,800원
`;

const newCode = newHeader + "const MENUS = [\n" + serializeMenus(ctx.MENUS) + "\n];\n" + footer;
fs.writeFileSync(DATA_PATH, newCode, "utf8");

console.log(`Store costs updated: ${storeUpdated}`);
console.log(`Home prices updated: ${homeUpdated}`);
console.log(`Home needs manual review: ${homeManual}`);
console.log("Done. Written to data.js");
