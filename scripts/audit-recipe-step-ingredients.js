#!/usr/bin/env node
/** 1회 사용 재료가 만드는 방법 단계에 언급되는지 감사 */
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
    "product-filter.js",
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
      "\nthis.getHomeIngredients=getHomeIngredients;",
    ctx
  );
  vm.runInContext(fs.readFileSync(path.join(ROOT, "recipe-step-style.js"), "utf8"), ctx);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, "home-buy.js"), "utf8") +
      "\nthis.getHomePortionList=globalThis.getHomePortionList;" +
      "\nthis.getRecipeStepsFromShopping=globalThis.getRecipeStepsFromShopping;",
    ctx
  );
  return ctx;
}

const ALIASES = {
  물: ["물", "뜨거운물", "차가운물"],
  꿀: ["꿀"],
  우유: ["우유"],
  휘핑크림: ["휘핑"],
  "홍차 티백": ["홍차", "블랙티", "우려"],
  "녹차 티백": ["녹차", "그린티", "말차"],
  "녹차/말차 가루": ["녹차", "말차"],
  "우롱차 티백": ["우롱"],
  "얼그레이 티백": ["얼그레이"],
  "자스민 티백": ["자스민"],
  "에스프레소 액상스틱": ["에스프레소"],
  "타피오카 펄": ["타피오카", "펄"],
  "플레인 요거트": ["요거트"],
  딸기시럽: ["딸기"],
  "카라멜 시럽": ["카라멜"],
  "코코아 파우더": ["코코아", "초코"],
  오레오: ["오레오", "쿠키"],
  사이다: ["사이다"],
  설탕시럽: ["설탕시럽", "슈가시럽"],
};

function norm(value) {
  return (value || "").replace(/\s+/g, "").toLowerCase();
}

function stepMentionsIngredient(stepNorm, recipeName, homeItem) {
  const keys = [recipeName, ...(homeItem?.replaces || [])].map(norm).filter((k) => k.length >= 2);
  if (keys.some((k) => stepNorm.includes(k))) return true;
  const alias = ALIASES[recipeName] || [];
  return alias.some((a) => stepNorm.includes(norm(a)));
}

const ctx = loadBrowserContext();
const issues = [];

ctx.MENUS.filter((m) => m.recipeReady).forEach((menu) => {
  const portions = ctx.getHomePortionList(menu).filter((p) => p.amount && p.amount !== "-");
  const homeItems = ctx.getHomeIngredients(menu);
  const steps = ctx.getRecipeStepsFromShopping(menu).map((s) => s.body).join(" ");
  const stepNorm = norm(steps);
  const missing = portions.filter((p) => {
    const homeItem = homeItems.find((h) => h.label === p.recipeName);
    return !stepMentionsIngredient(stepNorm, p.recipeName, homeItem);
  });
  if (missing.length) {
    issues.push({
      menu: `${menu.brand} ${menu.name}`,
      missing: missing.map((p) => p.recipeDisplay || p.recipeName),
      steps,
    });
  }
});

if (issues.length) {
  console.error(`만드는 방법에 빠진 재료 ${issues.length}건:\n`);
  issues.forEach((i) => {
    console.error(`[${i.menu}]`);
    console.error(`  빠짐: ${i.missing.join(", ")}`);
    console.error(`  단계: ${i.steps.slice(0, 120)}${i.steps.length > 120 ? "…" : ""}\n`);
  });
  process.exit(1);
}

console.log(`OK — ${ctx.MENUS.filter((m) => m.recipeReady).length}개 메뉴 · 단계에 재료 반영`);
