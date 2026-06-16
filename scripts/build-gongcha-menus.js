const fs = require("fs");
const path = require("path");
const { GONGCHA_QUIZLET_RECIPES } = require("./gongcha-quizlet-recipes");
const MANUAL = require("./gongcha-manual-steps");
const { consumerHome } = require("./consumer-home");
const { POOR_KITCHEN_RECIPE_NOTE, stepsFromManualHome } = require("./home-recipe-utils");
const { filterManualMenus } = require("./manual-menu-filter");
const { applyMenuFilters } = require("./apply-menu-filters");
const { getMenuHomePrice } = require("./filter-cheaper-at-home");

const OUTPUT_PATH = path.join(__dirname, "../gongcha-menus.js");
const PREVIOUS_SLUGS = new Set([
  "choco-mello-smoothie",
  "strawberry-earlgrey-cookie-smoothie",
  "mango-smoothie",
  "strawberry-jewelry-crush",
  "sparkling-tea",
  "green-tangerine-sparkling",
  "jasmine-tea",
  "red-velvet-milk-tea",
  "yakgwa-milk-tea",
  "hadong-hoji-milk-tea",
  "jeju-green-milk-tea",
  "vanilla-bean-cream-milk-tea",
  "earlgrey-choco-milk-tea",
  "black-milk-tea",
  "taro-milk-tea",
  "mango-yogurt-white-pearl",
  "chocolate-milk-tea",
]);

/** 브랜드 목록·검색에 노출할 인기 메뉴 (나머지는 URL 직접 접근만 가능) */
const GONGCHA_FEATURED_SLUGS = new Set([
  "black-milk-tea",
  "brown-sugar-jewelry-milk-tea",
  "mango-smoothie",
  "strawberry-jewelry-crush",
  "red-velvet-milk-tea",
  "taro-milk-tea",
  "vanilla-bean-cream-milk-tea",
  "black-tea-cafe-smoothie",
  "grapefruit-green-tea",
  "green-grape-green-tea",
  "mango-juice",
  "passion-fruit-hibiscus",
  "americano-ice",
  "cafe-latte",
  "caramel-cafe-latte",
  "mocha-cafe-latte",
  "chocolate-milk-tea",
  "brown-sugar-jewelry-oolong-smoothie",
  "double-peach-smoothie",
  "mango-yogurt-white-pearl",
  "original-kombucha-aloe",
  "sparkling-tea",
  "grapefruit-juice",
  "black-sapphire-grape-milk-tea",
  "strawberry-jewelry-milk-tea",
  "red-velvet-smoothie",
  "chocolate-cookie-smoothie",
  "green-grape-green-tea-smoothie",
  "jasmine-tea",
]);

const B2B = {
  milkPerMl: 1.5,
  teaPerMl: 7,
  syrupPerMl: 7,
  powderPerG: 9,
  pureePerG: 3.5,
  tapiocaPerG: 3.8,
  water: 5,
  ice: 25,
  cupStraw: 115,
  whipPerG: 5.5,
  marshmallowEach: 80,
  cookieCrumbPerG: 8,
  espressoPerShot: 68,
  cornBasePerMl: 6,
  fruitSaucePerMl: 8,
  yogurtPerMl: 2,
  kombuchaPerMl: 10,
};

const HOME = {
  milkPerMl: 2.5,
  syrup15ml: 180,
  teaBag: 90,
  water: 5,
  ice: 50,
  powder30g: 290,
  powder20g: 200,
  mango150g: 900,
  yogurt150ml: 550,
  yogurt55ml: 220,
  strawberrySauce: 200,
  cookieCrumb: 150,
  marshmallow: 120,
  tapioca80g: 200,
  sodaCanPart: 300,
  greenTangerine: 350,
  creamCheese: 280,
  yakgwa: 200,
  tapioca40g: 100,
  taroPowder3: 280,
  sugarSpoon: 15,
  whitePearl: 220,
  espressoLiquidStick: 1150,
  fruitSauce: 250,
  grapeSauce: 250,
  peachSauce: 220,
  cornSyrup: 200,
  passionSyrup: 280,
  kombuchaBase: 350,
  grapefruitSpoon: 200,
  greenGrapeJuice: 220,
  whip30g: 174,
  caramelDrizzle: 80,
  aloe: 150,
  jellyTop: 120,
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

function iceAmount(lessIce, half) {
  if (half) return "0.5컵";
  if (lessIce) return "Less Ice";
  return "가득";
}

function iceCost(lessIce, half, scoops) {
  if (half) return B2B.ice;
  if (scoops) return round(B2B.ice * (scoops >= 2 ? 1.5 : scoops >= 1.5 ? 1.2 : 1));
  return lessIce ? B2B.ice : B2B.ice;
}

function buildFromPack(pack) {
  if (!pack) return { ingredients: [cup()], homeIngredients: [home("얼음", "적당량", HOME.ice, "얼음")] };

  const ingredients = [];
  const homeIngredients = [];
  const lessIce = pack.lessIce;
  const iced = pack.hot !== true;

  const addSyrup = (ml = 15, name = "과당 시럽") => {
    if (!ml) return;
    ingredients.push(ing(name, `${ml}ml`, ml * B2B.syrupPerMl));
    homeIngredients.push(home("설탕시럽", ml <= 12 ? "1~2펌프" : "2~3펌프", HOME.syrup15ml, name));
  };

  const addTea = (ml, name = "티 베이스") => {
    if (!ml) return;
    ingredients.push(ing(name, `${ml}ml`, ml * B2B.teaPerMl));
    const label =
      name.includes("얼그레이") ? "얼그레이 티백" :
      name.includes("우롱") ? "우롱차 티백" :
      name.includes("그린") || name.includes("녹차") ? "녹차 티백" :
      name.includes("자스민") ? "자스민 티백" :
      "홍차 티백";
    homeIngredients.push(home(label, `${ml}ml`, HOME.teaBag, name));
  };

  const addMilk = (ml) => {
    if (!ml) return;
    ingredients.push(ing("우유", `${ml}ml`, ml * B2B.milkPerMl));
    homeIngredients.push(home("우유", `${ml}ml`, ml * HOME.milkPerMl, "우유"));
  };

  const addWater = (ml, hot = false) => {
    if (!ml) return;
    ingredients.push(ing(hot ? "뜨거운 물" : "물", `${ml}ml`, ml * B2B.water));
    homeIngredients.push(home(hot ? "뜨거운 물" : "물", `${ml}ml`, hot ? 10 : HOME.water, hot ? "뜨거운 물" : "물"));
  };

  const addPowder = (g, name = "스무디 포션") => {
    if (!g) return;
    ingredients.push(ing(name, `${g}g`, g * B2B.powderPerG));
    const label =
      name.includes("타로") ? "타로 파우더" :
      name.includes("레드벨벳") ? "레드벨벳 파우더" :
      name.includes("약과") ? "약과" :
      name.includes("호지") || name.includes("녹차") ? "녹차 가루" :
      name.includes("초코") || name.includes("초콜") ? "코코아 파우더" :
      name.includes("바닐라") ? "바닐라 시럽" :
      "플레인 요거트";
    const price =
      name.includes("타로") ? HOME.taroPowder3 :
      g >= 30 ? HOME.powder30g : HOME.powder20g;
    homeIngredients.push(home(label, g >= 30 ? "3스푼" : "2스푼", price, name));
  };

  const addPearl = (g = 40) => {
    ingredients.push(ing("타피오카 펄", `${g}g`, g * B2B.tapiocaPerG));
    homeIngredients.push(home("타피오카 펄", `${g}g`, HOME.tapioca40g, "타피오카 펄"));
  };

  const addIce = (opts = {}) => {
    if (opts.hot) return;
    ingredients.push(ing("얼음", iceAmount(opts.lessIce, opts.half), iceCost(opts.lessIce, opts.half, opts.scoops)));
    homeIngredients.push(home("얼음", opts.lessIce ? "적당량" : opts.half ? "0.5컵" : "가득", HOME.ice, "얼음"));
  };

  const addWhip = (g = 40, name = "밀크 크림/치즈폼") => {
    ingredients.push(ing(name, `${g}g`, g * B2B.whipPerG));
    homeIngredients.push(home("휘핑크림", "토핑", HOME.creamCheese, name));
  };

  const addEspresso = (shots = 1) => {
    ingredients.push(ing("에스프레소", `${shots}샷`, shots * B2B.espressoPerShot));
    homeIngredients.push(home("에스프레소 액상스틱", `${shots}개`, shots * HOME.espressoLiquidStick, "에스프레소"));
  };

  switch (pack.kind) {
    case "smoothie": {
      addSyrup(pack.syrupMl);
      if (pack.blackTeaMl) addTea(pack.blackTeaMl, "블랙티 농축 베이스");
      if (pack.earlgreyMl) addTea(pack.earlgreyMl, "얼그레이 티");
      if (pack.oolongMl) addTea(pack.oolongMl, "우롱티");
      if (pack.greenTeaMl) addTea(pack.greenTeaMl, "그린티");
      if (pack.mangoBaseMl) {
        ingredients.push(ing("망고 물 베이스", `${pack.mangoBaseMl}ml`, pack.mangoBaseMl * B2B.teaPerMl));
        homeIngredients.push(home("냉동 망고", "150g", HOME.mango150g, "망고 물 베이스"));
      }
      if (pack.waterMl) addWater(pack.waterMl);
      if (pack.hotWaterMl) addWater(pack.hotWaterMl, true);
      if (pack.plantPowderG) addPowder(pack.plantPowderG, "플랜트 파우더");
      if (pack.smoothiePowderG) addPowder(pack.smoothiePowderG, "스무디 포션");
      if (pack.chocoPowderG) addPowder(pack.chocoPowderG, "초코 포션");
      if (pack.redVelvetPowderG) addPowder(pack.redVelvetPowderG, "레드벨벳 포션");
      if (pack.hojiPowderG) addPowder(pack.hojiPowderG, "하동 호지 파우더");
      if (pack.greenPowderG) addPowder(pack.greenPowderG, "제주 녹차 파우더");
      if (pack.vanillaPowderG) addPowder(pack.vanillaPowderG, "바닐라빈 파우더/시럽");
      if (pack.strawberryYogurtMl) {
        ingredients.push(ing("딸기 요구르트 소스", `${pack.strawberryYogurtMl}ml`, pack.strawberryYogurtMl * B2B.milkPerMl));
        homeIngredients.push(home("딸기 요거트", "55ml", HOME.yogurt55ml, "딸기 요구르트 소스"));
      }
      if (pack.milkMl) addMilk(pack.milkMl);
      if (pack.milkFoamMl) {
        ingredients.push(ing("밀크폼", `${pack.milkFoamMl}ml`, 45));
        homeIngredients.push(home("우유", "30ml(거품용)", 75, "밀크폼"));
      }
      if (pack.whipMl) {
        ingredients.push(ing("휘핑", `${pack.whipMl}ml`, pack.whipMl * B2B.milkPerMl));
        homeIngredients.push(home("휘핑크림", "적당량", HOME.whip30g, "휘핑"));
      }
      if (pack.whipG) addWhip(pack.whipG);
      if (pack.cheeseFoamG) addWhip(pack.cheeseFoamG, "치즈폼");
      if (pack.cookieCrumbG) {
        ingredients.push(ing("쿠키 분태", `${pack.cookieCrumbG}g`, pack.cookieCrumbG * B2B.cookieCrumbPerG));
        homeIngredients.push(home("쿠키 크럼", "적당량", HOME.cookieCrumb, "쿠키 분태"));
      }
      if (pack.strawberrySauceMl) {
        ingredients.push(ing("딸기 소스", `${pack.strawberrySauceMl}ml`, pack.strawberrySauceMl * B2B.syrupPerMl));
        homeIngredients.push(home("딸기잼", "1~2펌프", HOME.strawberrySauce, "딸기 소스"));
      }
      if (pack.brownSugarSauceMl) {
        ingredients.push(ing("브라운슈가 소스", `${pack.brownSugarSauceMl}ml`, pack.brownSugarSauceMl * B2B.syrupPerMl));
        homeIngredients.push(home("설탕시럽", "2펌프", HOME.syrup15ml, "브라운슈가 소스"));
      }
      if (pack.jewelryG) {
        ingredients.push(ing("쥬얼리 토핑", `${pack.jewelryG}g`, pack.jewelryG * B2B.pureePerG));
        homeIngredients.push(home("딸기잼", "적당량", HOME.strawberrySauce, "쥬얼리 토핑"));
      }
      if (pack.greenGrapeMl) {
        ingredients.push(ing("청포도 소스", `${pack.greenGrapeMl}ml`, pack.greenGrapeMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("청포도 주스", `${pack.greenGrapeMl}ml`, HOME.greenGrapeJuice, "청포도 소스"));
      }
      if (pack.peachBaseMl) {
        ingredients.push(ing("피치 스무디 베이스", `${pack.peachBaseMl}ml`, pack.peachBaseMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("복숭아 주스", `${pack.peachBaseMl}ml`, HOME.peachSauce, "피치 스무디 베이스"));
      }
      if (pack.peachSauceMl) {
        ingredients.push(ing("피치 소스", `${pack.peachSauceMl}ml`, pack.peachSauceMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("복숭아 주스", `${pack.peachSauceMl}ml`, HOME.peachSauce, "피치 소스"));
      }
      if (pack.cornBaseMl) {
        ingredients.push(ing("초당 옥수수", `${pack.cornBaseMl}ml`, pack.cornBaseMl * B2B.cornBasePerMl));
        homeIngredients.push(home("옥수수 시럽", `${pack.cornBaseMl}ml`, HOME.cornSyrup, "초당 옥수수"));
      }
      if (pack.brownSugarMl) {
        ingredients.push(ing("브라운슈가", `${pack.brownSugarMl}ml`, pack.brownSugarMl * B2B.syrupPerMl));
        homeIngredients.push(home("설탕시럽", "1펌프", HOME.syrup15ml, "브라운슈가"));
      }
      if (pack.espressoShots) addEspresso(pack.espressoShots);
      if (pack.pearlG) addPearl(pack.pearlG);
      if (pack.marshmallow) {
        ingredients.push(ing("마시멜로", `${pack.marshmallow}개`, pack.marshmallow * B2B.marshmallowEach));
        homeIngredients.push(home("마시멜로", "2~3개", HOME.marshmallow, "마시멜로"));
      }
      if (pack.yakgwaHalf) {
        ingredients.push(ing("약과", "0.5개", 60));
        homeIngredients.push(home("약과", "반 개", HOME.yakgwa, "약과"));
      }
      if (pack.aloe) {
        ingredients.push(ing("알로에", "조금", 30));
        homeIngredients.push(home("알로에", "조금", HOME.aloe, "알로에"));
      }
      if (pack.jelly) {
        ingredients.push(ing("젤리", "적당량", 40));
        homeIngredients.push(home("과일 젤리", "적당량", HOME.jellyTop, "젤리"));
      }
      if (pack.chocoChipG) {
        ingredients.push(ing("초코 파삥", `${pack.chocoChipG}g`, pack.chocoChipG * B2B.cookieCrumbPerG));
        homeIngredients.push(home("초코 크런치", "적당량", HOME.cookieCrumb, "초코 파삥"));
      }
      if (pack.caramelDrizzle) {
        ingredients.push(ing("카라멜 드리즐", "7회", 35));
        homeIngredients.push(home("카라멜 시럽", "드리즐", HOME.caramelDrizzle, "카라멜 드리즐"));
      }
      addIce({ lessIce, scoops: pack.iceScoops });
      ingredients.push(cup());
      break;
    }

    case "layer-yogurt": {
      ingredients.push(
        ing("망고 퓨레", `${pack.mangoMl}ml`, pack.mangoMl * B2B.teaPerMl),
        ing("요거트 베이스", `${pack.yogurtMl}ml`, pack.yogurtMl * B2B.milkPerMl),
        ing("화이트 펄", `${pack.whitePearlG}g`, pack.whitePearlG * B2B.tapiocaPerG),
        ing("얼음", "0.5컵", B2B.ice),
        cup(),
      );
      homeIngredients.push(
        home("냉동 망고", "150g", HOME.mango150g, "망고 퓨레"),
        home("드링킹 요거트", "150ml", HOME.yogurt150ml, "요거트 베이스"),
        home("화이트 펄", "40g", HOME.whitePearl, "화이트 펄"),
        home("얼음", "0.5컵", HOME.ice, "얼음"),
      );
      break;
    }

    case "coffee-shaker":
    case "coffee-latte":
    case "coffee-americano": {
      if (pack.syrupMl) addSyrup(pack.syrupMl);
      if (pack.espressoShots) addEspresso(pack.espressoShots);
      if (pack.waterMl) addWater(pack.waterMl, !pack.iced);
      if (pack.earlgreyMl) addTea(pack.earlgreyMl, "얼그레이 티");
      if (pack.milkMl) addMilk(pack.milkMl);
      if (pack.whipMl) {
        ingredients.push(ing("휘핑", `${pack.whipMl}ml`, pack.whipMl * B2B.milkPerMl));
        homeIngredients.push(home("휘핑크림", "적당량", HOME.whip30g, "휘핑"));
      }
      if (pack.vanillaPowderG) addPowder(pack.vanillaPowderG, "바닐라 파우더");
      if (pack.chocoPowderG) addPowder(pack.chocoPowderG, "초콜릿 파우더");
      if (pack.milkFoamMl) {
        ingredients.push(ing("밀크폼", `${pack.milkFoamMl}ml`, 45));
        homeIngredients.push(home("우유", "거품", 75, "밀크폼"));
      }
      if (pack.caramelDrizzle) {
        ingredients.push(ing("카라멜 드리즐", "10~15회", 40));
        homeIngredients.push(home("카라멜 시럽", "드리즐", HOME.caramelDrizzle, "카라멜 드리즐"));
      }
      if (pack.pearlG) addPearl(pack.pearlG);
      addIce({ hot: !pack.iced });
      ingredients.push(cup());
      break;
    }

    case "milk-tea-seal":
    case "milk-tea-blender":
    case "milk-tea-yakgwa":
    case "milk-tea-powder":
    case "milk-tea-vanilla-cream":
    case "milk-tea-black-pearl":
    case "milk-tea-choco":
    case "milk-tea-taro":
    case "milk-tea-hot-red-velvet": {
      addSyrup(pack.syrupMl || 15);
      if (pack.blackTeaMl) addTea(pack.blackTeaMl, pack.hot ? "블랙티" : "블랙티 농축 베이스");
      if (pack.earlgreyMl) addTea(pack.earlgreyMl, "얼그레이 티 베이스");
      if (pack.oolongMl) addTea(pack.oolongMl, "우롱티");
      if (pack.teaMl) addTea(pack.teaMl, "티 베이스");
      if (pack.milkMl) addMilk(pack.milkMl);
      if (pack.hotWaterMl) addWater(pack.hotWaterMl, true);
      if (pack.cornBaseMl) {
        ingredients.push(ing("초당 옥수수", `${pack.cornBaseMl}ml`, pack.cornBaseMl * B2B.cornBasePerMl));
        homeIngredients.push(home("옥수수 시럽", `${pack.cornBaseMl}ml`, HOME.cornSyrup, "초당 옥수수"));
      }
      if (pack.strawberryJewelryMl) {
        ingredients.push(ing("딸기 쥬얼리 소스", `${pack.strawberryJewelryMl}ml`, pack.strawberryJewelryMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("딸기잼", `${pack.strawberryJewelryMl}ml`, HOME.strawberrySauce, "딸기 쥬얼리 소스"));
      }
      if (pack.grapeSauceMl) {
        ingredients.push(ing("포도 소스", `${pack.grapeSauceMl}ml`, pack.grapeSauceMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("포도 주스", `${pack.grapeSauceMl}ml`, HOME.grapeSauce, "포도 소스"));
      }
      if (pack.peachMilkTeaMl) {
        ingredients.push(ing("피치 밀크티 소스", `${pack.peachMilkTeaMl}ml`, pack.peachMilkTeaMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("복숭아 주스", `${pack.peachMilkTeaMl}ml`, HOME.peachSauce, "피치 밀크티 소스"));
      }
      if (pack.redVelvetPowderG) addPowder(pack.redVelvetPowderG, "레드벨벳 포션");
      if (pack.yakgwaPowderG) addPowder(pack.yakgwaPowderG, "약과 파우더");
      if (pack.yakgwaEach) {
        ingredients.push(ing("약과", `${pack.yakgwaEach}개`, 120));
        homeIngredients.push(home("약과", "1개(잘게)", HOME.yakgwa, "약과"));
      }
      if (pack.hojiPowderG) addPowder(pack.hojiPowderG, "하동 호지 파우더");
      if (pack.greenPowderG) addPowder(pack.greenPowderG, "제주 녹차 파우더");
      if (pack.chocoPowderG) addPowder(pack.chocoPowderG, "초콜릿 파우더");
      if (pack.chocoSauceMl) {
        ingredients.push(ing("초코 소스", `${pack.chocoSauceMl}ml`, pack.chocoSauceMl * B2B.syrupPerMl));
        homeIngredients.push(home("초코 시럽", "1펌프", HOME.syrup15ml, "초코 소스"));
      }
      if (pack.taroPowderG) addPowder(pack.taroPowderG, "타로 파우더");
      if (pack.vanillaPowderSpoon) {
        ingredients.push(ing("바닐라 파우더", `${pack.vanillaPowderSpoon}스푼`, 25));
        homeIngredients.push(home("바닐라 시럽", "1~2펌프", HOME.syrup15ml, "바닐라 파우더"));
      }
      if (pack.whipG) addWhip(pack.whipG);
      if (pack.cheeseFoamG) addWhip(pack.cheeseFoamG, "치즈폼");
      if (pack.cookieCrumbG) {
        ingredients.push(ing("레드벨벳 크럼블", `${pack.cookieCrumbG}g`, pack.cookieCrumbG * B2B.cookieCrumbPerG));
        homeIngredients.push(home("쿠키 크럼", "적당량", HOME.cookieCrumb, "레드벨벳 크럼블"));
      }
      if (pack.caramelDrizzle) {
        ingredients.push(ing("카라멜 드리즐", "7회", 35));
        homeIngredients.push(home("카라멜 시럽", "드리즐", HOME.caramelDrizzle, "카라멜 드리즐"));
      }
      if (pack.pearlG) addPearl(pack.pearlG);
      if (pack.jewelryHalf || pack.jewelryFull) {
        ingredients.push(ing("쥬얼리 토핑", pack.jewelryFull ? "1봉지" : "0.5봉지", 80));
        homeIngredients.push(home("딸기잼", "적당량", HOME.strawberrySauce, "쥬얼리 토핑"));
      }
      if (pack.brownSugarSauce) {
        ingredients.push(ing("브라운슈가 소스", "두르기", 30));
        homeIngredients.push(home("설탕시럽", "2펌프", HOME.syrup15ml, "브라운슈가 소스"));
      }
      if (pack.jelly) {
        ingredients.push(ing("젤리", "2국자", 50));
        homeIngredients.push(home("과일 젤리", "2국자", HOME.jellyTop, "젤리"));
      }
      if (pack.kind === "milk-tea-black-pearl") {
        homeIngredients.unshift(
          home("홍차 티백", "2개", HOME.teaBag * 2, "블랙티 농축 베이스"),
          home("물", "150ml", 10, "블랙티 농축 베이스"),
          home("설탕", "1~2큰술", HOME.sugarSpoon * 2, "과당 시럽"),
        );
      }
      addIce({ lessIce: pack.lessIce, hot: pack.hot });
      ingredients.push(cup());
      break;
    }

    case "fruit-drink":
    case "fruit-tea":
    case "layer-fruit": {
      addSyrup(pack.syrupMl);
      if (pack.fruitSauceMl) {
        ingredients.push(ing("과일 소스", `${pack.fruitSauceMl}ml`, pack.fruitSauceMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("패션후르츠 시럽", `${pack.fruitSauceMl}ml`, HOME.passionSyrup, "과일 소스"));
      }
      if (pack.grapefruitJuiceMl) {
        ingredients.push(ing("자몽 주스", `${pack.grapefruitJuiceMl}ml`, pack.grapefruitJuiceMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("자몽청", `${pack.grapefruitJuiceMl}ml`, HOME.grapefruitSpoon, "자몽 주스"));
      }
      if (pack.mangoSauceMl || pack.mangoJuiceMl) {
        const ml = pack.mangoSauceMl || pack.mangoJuiceMl;
        ingredients.push(ing("망고 베이스", `${ml}ml`, ml * B2B.fruitSaucePerMl));
        homeIngredients.push(home("망고 주스", `${ml}ml`, HOME.fruitSauce, "망고 베이스"));
      }
      if (pack.grapefruitSauceMl) {
        ingredients.push(ing("자몽 소스", `${pack.grapefruitSauceMl}ml`, pack.grapefruitSauceMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("자몽청", `${pack.grapefruitSauceMl}ml`, HOME.grapefruitSpoon, "자몽 소스"));
      }
      if (pack.greenGrapeMl) {
        ingredients.push(ing("청포도 소스", `${pack.greenGrapeMl}ml`, pack.greenGrapeMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("청포도 주스", `${pack.greenGrapeMl}ml`, HOME.greenGrapeJuice, "청포도 소스"));
      }
      if (pack.grapeMl) {
        ingredients.push(ing("얼티 포도", `${pack.grapeMl}ml`, pack.grapeMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("포도 주스", `${pack.grapeMl}ml`, HOME.grapeSauce, "얼티 포도"));
      }
      if (pack.mangoMl && pack.kind === "layer-fruit") {
        ingredients.push(ing("얼티 망고", `${pack.mangoMl}ml`, pack.mangoMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("망고 주스", `${pack.mangoMl}ml`, HOME.fruitSauce, "얼티 망고"));
      }
      if (pack.yogurtMl) {
        ingredients.push(ing("요구르트", `${pack.yogurtMl}ml`, pack.yogurtMl * B2B.yogurtPerMl));
        homeIngredients.push(home("드링킹 요거트", `${pack.yogurtMl}ml`, HOME.yogurt150ml, "요구르트"));
      }
      if (pack.greenTeaMl) addTea(pack.greenTeaMl, "그린티");
      if (pack.waterFill) {
        ingredients.push(ing("정수", "채움", B2B.water * 10));
        homeIngredients.push(home("물", "채움", HOME.water * 5, "정수"));
      }
      addIce({ lessIce: pack.lessIce });
      ingredients.push(cup());
      break;
    }

    case "kombucha": {
      addSyrup(pack.syrupMl);
      if (pack.fruitSauceMl) {
        ingredients.push(ing("히비스커스 소스", `${pack.fruitSauceMl}ml`, pack.fruitSauceMl * B2B.fruitSaucePerMl));
        homeIngredients.push(home("패션후르츠 시럽", `${pack.fruitSauceMl}ml`, HOME.passionSyrup, "히비스커스 소스"));
      }
      if (pack.kombuchaMl) {
        ingredients.push(ing("콤부차 베이스", `${pack.kombuchaMl}ml`, pack.kombuchaMl * B2B.kombuchaPerMl));
        homeIngredients.push(home("미초(식초음료)", `${pack.kombuchaMl}ml`, HOME.kombuchaBase, "콤부차 베이스"));
      }
      ingredients.push(ing("탄산", "주입", 30));
      homeIngredients.push(home("사이다", "150ml", HOME.sodaCanPart, "탄산"));
      if (pack.aloe) {
        ingredients.push(ing("알로에", "토핑", 30));
        homeIngredients.push(home("알로에", "조금", HOME.aloe, "알로에"));
      }
      addIce({ lessIce: pack.lessIce });
      ingredients.push(cup());
      break;
    }

    case "sparkling":
    case "sparkling-sauce":
    case "tea-shaker": {
      if (pack.jasmineMl) {
        addTea(pack.jasmineMl, "자스민 티 베이스");
      } else if (pack.earlgrey) {
        addTea(pack.teaMl || 30, "얼그레이 티");
      } else {
        addTea(pack.teaMl || pack.greenTeaMl || 100, pack.greenTeaMl ? "그린티" : "티 베이스");
      }
      if (pack.waterMl) addWater(pack.waterMl);
      addSyrup(pack.syrupMl || 15);
      if (pack.sauceMl) {
        ingredients.push(ing("청귤 소스", `${pack.sauceMl}ml`, pack.sauceMl * B2B.syrupPerMl));
        homeIngredients.push(home("청귤청", `${pack.sauceMl}ml`, HOME.greenTangerine, "청귤 소스"));
      }
      if (pack.raspberry) {
        ingredients.push(ing("라즈베리", "0.5", 40));
        homeIngredients.push(home("딸기잼", "0.5스푼", HOME.strawberrySauce, "라즈베리"));
      }
      if (pack.tangerineChip) {
        ingredients.push(ing("청귤칩", "1개", 50));
        homeIngredients.push(home("청귤청", "1조각", 50, "청귤칩"));
      }
      ingredients.push(ing("탄산", "적정량", 30));
      homeIngredients.push(home("사이다", "150ml", HOME.sodaCanPart, "탄산"));
      addIce({ lessIce: pack.lessIce });
      ingredients.push(cup());
      break;
    }

    default:
      ingredients.push(cup());
  }

  return { ingredients, homeIngredients };
}

function stepsFromManual(slug, homeIngredients = []) {
  const manual = MANUAL[slug];
  if (!manual) return [];
  return stepsFromManualHome(manual, homeIngredients).map((body) => ({ title: "", body }));
}

/** 만드는 방법 토핑(젤리·펄 등) → 장보기 homeIngredients 보강 */
function isJewelryToppingMention(text) {
  return /쥬얼리/.test(text) || /딸기·젤리|딸기잼·젤리|젤리·타피오카|포도 주스·젤리/.test(text);
}

function ensureStepToppingsInHome(slug, homeIngredients) {
  const manual = MANUAL[slug];
  if (!manual) return homeIngredients;
  const text = [...(manual.home || []), manual.topping || ""].join(" ");
  const out = [...homeIngredients];
  const has = (re) => out.some((h) => re.test(h.label || ""));
  if (/젤리/.test(text) && !isJewelryToppingMention(text) && !has(/젤리/)) {
    out.push(home("과일 젤리", "토핑", HOME.jellyTop, "젤리"));
  }
  if (/타피오카|펄\s*토핑/.test(text) && !has(/타피오카|펄/)) {
    out.push(home("타피오카 펄", "토핑", HOME.tapioca40g, "타피오카 펄"));
  }
  if (/과일\s*토핑/.test(text) && !has(/냉동\s*과일/)) {
    out.push(home("냉동 과일", "토핑", HOME.mango150g, "과일"));
  }
  return out;
}

function buildMenu(recipe) {
  const { slug, name, category, price, emoji, photoBg, difficulty = 1, time = "약 5분", pack } = recipe;
  const built = buildFromPack(pack);
  const ingredients = recipe.ingredients || built.ingredients;
  let homeIngredients = recipe.homeIngredients || built.homeIngredients;
  homeIngredients = ensureStepToppingsInHome(slug, homeIngredients);
  const noteExtra = slug === "black-milk-tea" ? `Large 1잔 기준 · 펄 생략 가능 · ${POOR_KITCHEN_RECIPE_NOTE}` : `공차 Quizlet 레시피 기준 · ${POOR_KITCHEN_RECIPE_NOTE}`;

  return {
    id: `gongcha-${slug}`,
    brand: "공차",
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
      note: noteExtra,
    },
  };
}

const allMenus = GONGCHA_QUIZLET_RECIPES.map(buildMenu);
const manualFiltered = filterManualMenus(allMenus, "gongcha-", MANUAL);
const filteredOutByPrice = manualFiltered.filter((m) => getMenuHomePrice(m) >= m.price);
const outputMenus = applyMenuFilters(manualFiltered, "gongcha");

const newSlugs = GONGCHA_QUIZLET_RECIPES.map((r) => r.slug).filter((s) => !PREVIOUS_SLUGS.has(s));

const out = `// generated by scripts/build-gongcha-menus.js
const GONGCHA_MENUS = ${JSON.stringify(outputMenus, null, 2)};

if (typeof window !== "undefined") {
  window.GONGCHA_MENUS = GONGCHA_MENUS;
}

if (typeof module !== "undefined") {
  module.exports = { GONGCHA_MENUS };
}
`;

fs.writeFileSync(OUTPUT_PATH, out, "utf8");
console.log(`Created ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Menu count: ${outputMenus.length} (source recipes: ${GONGCHA_QUIZLET_RECIPES.length})`);
console.log(`Featured (listed): ${outputMenus.filter((m) => !m.listHidden).length} · hidden: ${outputMenus.filter((m) => m.listHidden).length}`);
console.log(`New slugs added: ${newSlugs.length}`);
if (newSlugs.length) console.log(newSlugs.join(", "));
if (filteredOutByPrice.length) {
  console.log(`Filtered by filterCheaperAtHome (${filteredOutByPrice.length}):`);
  filteredOutByPrice.forEach((m) => {
    console.log(`  - ${m.id} (store ${m.price} vs home ${getMenuHomePrice(m)})`);
  });
} else {
  console.log("Filtered by filterCheaperAtHome: none");
}
