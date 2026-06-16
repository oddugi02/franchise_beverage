#!/usr/bin/env node
/** 만드는 방법(표시)에 나온 재료 ↔ 장보기 목록 일치 감사 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadBrowserContext() {
  const ctx = { globalThis: {} };
  vm.createContext(ctx);
  for (const file of [
    "shopping-packs.js",
    "shopping-price-overrides.js",
    "mega-menus.js",
    "gongcha-menus.js",
    "paik-menus.js",
    "compose-menus.js",
    "starbucks-menus.js",
    "mammoth-menus.js",
    "ediya-menus.js",
    "pascucci-menus.js",
  ]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx);
  }
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, "data.js"), "utf8") +
      "\nthis.MENUS=MENUS;" +
      "\nthis.getHomeIngredients=getHomeIngredients;" +
      "\nthis.getHomeIngredientPrice=getHomeIngredientPrice;" +
      "\nthis.isHomeIngredientPriced=isHomeIngredientPriced;" +
      "\nthis.getHomePortionPrice=getHomePortionPrice;",
    ctx
  );
  vm.runInContext(fs.readFileSync(path.join(ROOT, "recipe-step-style.js"), "utf8"), ctx);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, "home-buy.js"), "utf8") +
      "\nthis.getHomeShoppingList=globalThis.getHomeShoppingList;" +
      "\nthis.getHomePortionList=globalThis.getHomePortionList;" +
      "\nthis.getRecipeStepsFromShopping=globalThis.getRecipeStepsFromShopping;",
    ctx
  );
  return ctx;
}

const INGREDIENT_AMOUNT =
  /(\d+(?:\.\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔)|적당량|약\s+\d+(?:\.\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔)|가득|토핑|드리즐)/;

function normKey(value) {
  return (value || "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .replace(/(?:약)?\d+(?:\.\d+)?(?:ml|l|g|kg|개|펌프|큰술|스푼|캔|컵|입|팩|샷)|적당량|가득|토핑|드리즐/g, "");
}

function extractMentions(text) {
  const mentions = [];
  const re = new RegExp(
    `([가-힣A-Za-z][가-힣A-Za-z0-9·\\s]{0,30}?)\\s*${INGREDIENT_AMOUNT.source}`,
    "g"
  );
  let m;
  while ((m = re.exec(text || ""))) {
    let name = m[1]
      .trim()
      .replace(/(?:을|를|과|와|의|에)\s*$/, "")
      .replace(/^(?:컵에|뚜껑\s*있는\s*컵(?:이나\s*빈\s*페트병)?(?:에)?|위에|다른\s*컵에|차가운|얼음이\s*가득\s*담긴\s*컵에|담긴\s*컵에)\s*/, "")
      .trim();
    if (/^(?:과|와|및)\s*물$/.test(name)) continue;
    if (/^(?:과|를|에|담긴\s*컵에|말차\s*가루를)$/.test(name) || name.length < 2) continue;
    if (/(?:한다|준다|넣는다|붓는다)$/.test(name)) continue;
    mentions.push({ name, amount: m[2] });
  }
  for (const bare of ["휘핑크림", "시나몬 가루"]) {
    if ((text || "").includes(bare) && !mentions.some((x) => normKey(x.name) === normKey(bare))) {
      mentions.push({ name: bare, amount: "토핑" });
    }
  }
  return mentions;
}

function shoppingKeys(menu, ctx) {
  const shop = ctx.getHomeShoppingList(menu);
  const portions = ctx.getHomePortionList(menu);
  const keys = [];
  for (const s of shop) {
    keys.push(normKey(s.buy));
    keys.push(normKey(s.buy.replace(/\s*\([^)]+\)/g, "").replace(/\s+\d+.*/, "")));
  }
  for (const p of portions) {
    for (const f of [p.recipeName, p.recipeDisplay, p.label]) {
      if (!f) continue;
      keys.push(normKey(f));
      keys.push(normKey(f.replace(/\s+\d+.*/, "")));
    }
  }
  return { shop, portions, keys: [...new Set(keys.filter(Boolean))] };
}

function matchesShopping(mention, keys, portions) {
  const n = normKey(mention);
  if (!n || n.length < 2) return true;
  const skip = new Set(["숟가락", "컵", "뚜껑", "페트병", "재료", "다른", "위에", "살짝", "부어", "넣고", "과", "를"]);
  if (skip.has(mention) || skip.has(n)) return true;
  if (mention === "바닐라 크림") {
    return keys.some((k) => /휘핑|바닐라|우유/.test(k)) || portions.some((p) => /휘핑|바닐라|우유/.test(p.label || ""));
  }
  if (mention.includes("말차") && keys.some((k) => /말차|녹차/.test(k)) && keys.some((k) => k === "물" || k.includes("물"))) {
    return true;
  }
  if (n === "물" || mention === "물" || /^과\s*물$/.test(mention)) {
    return keys.some((k) => k === "물" || k.includes("물"));
  }
  if (keys.some((k) => k.length >= 2 && (n === k || n.includes(k) || k.includes(n)))) return true;
  for (const p of portions) {
    for (const base of [p.recipeName, p.label?.replace(/\s*\([^)]+\)/g, "").replace(/\s+\d+.*/, "")]) {
      const bn = normKey(base);
      if (bn && bn.length >= 2 && (n === bn || n.includes(bn) || bn.includes(n))) return true;
    }
  }
  return false;
}

const ctx = loadBrowserContext();
const issues = [];

ctx.MENUS.filter((m) => m.recipeReady).forEach((menu) => {
  const steps = ctx.getRecipeStepsFromShopping(menu);
  const { shop, portions, keys } = shoppingKeys(menu, ctx);
  const stepText = steps.map((s) => s.body).join(" ");
  const mentions = extractMentions(stepText);
  const missing = [...new Map(mentions.filter((m) => !matchesShopping(m.name, keys, portions)).map((m) => [m.name, m])).values()];
  if (missing.length) {
    issues.push({
      menu: `${menu.brand} ${menu.name}`,
      missing,
      shop: shop.map((s) => s.buy),
      steps: steps.map((s) => s.body),
    });
  }
});

if (issues.length) {
  console.error(`만드는 방법 ↔ 장보기 불일치 ${issues.length}건:\n`);
  issues.forEach((i) => {
    console.error(`[${i.menu}]`);
    console.error(`  레시피 재료: ${i.missing.map((m) => `${m.name}(${m.amount})`).join(", ")}`);
    console.error(`  장보기: ${i.shop.join(" | ")}`);
    console.error(`  단계: ${i.steps.join(" / ")}\n`);
  });
  process.exit(1);
}

console.log(`OK — ${ctx.MENUS.filter((m) => m.recipeReady).length}개 메뉴 · 만드는 방법 재료 ⊆ 장보기`);
