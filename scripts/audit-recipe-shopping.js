#!/usr/bin/env node
/** 장보기 ↔ 1회 사용 ↔ 만드는 방법 일치 감사 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadBrowserContext() {
  const ctx = { globalThis: {} };
  vm.createContext(ctx);
  for (const file of ["shopping-packs.js", "shopping-price-overrides.js", "mega-menus.js", "gongcha-menus.js", "paik-menus.js", "compose-menus.js", "starbucks-menus.js", "mammoth-menus.js", "ediya-menus.js", "pascucci-menus.js"]) {
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

const ctx = loadBrowserContext();
const issues = [];

ctx.MENUS.filter((m) => m.recipeReady).forEach((menu) => {
  const shop = ctx.getHomeShoppingList(menu);
  const portion = ctx.getHomePortionList(menu);
  const steps = ctx.getRecipeStepsFromShopping(menu);

  shop.forEach((s, i) => {
    if (portion[i]?.label !== s.buy) {
      issues.push({ menu: `${menu.brand} ${menu.name}`, type: "portion≠shop", detail: `${portion[i]?.label} vs ${s.buy}` });
    }
    const skipLink = s.buy === "물" || s.buy.startsWith("얼음");
    if (!skipLink && s.priced && !s.productUrl) {
      issues.push({ menu: `${menu.brand} ${menu.name}`, type: "no-product-url", detail: s.buy });
    }
  });

  if (steps.length === 0) {
    issues.push({ menu: `${menu.brand} ${menu.name}`, type: "no-steps", detail: "행동 단계 없음" });
  }

  if (steps.some((s) => (s.body || "").startsWith("재료:"))) {
    issues.push({ menu: `${menu.brand} ${menu.name}`, type: "prep-in-steps", detail: "재료 목록이 단계에 포함됨" });
  }

  if (steps.length > 5) {
    issues.push({ menu: `${menu.brand} ${menu.name}`, type: "steps>5", detail: `${steps.length} steps` });
  }
});

if (issues.length) {
  console.error(`Found ${issues.length} issues:\n`);
  issues.slice(0, 50).forEach((i) => console.error(`- [${i.type}] ${i.menu}: ${i.detail}`));
  process.exit(1);
}

console.log(`OK — ${ctx.MENUS.filter((m) => m.recipeReady).length} menus · 장보기=1회=레시피`);
