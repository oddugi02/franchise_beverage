#!/usr/bin/env node
/** 만드는 방법 맞춤법·문장 검사 (장보기 기준 최종 표시 문구) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadContext() {
  const ctx = { globalThis: {} };
  vm.createContext(ctx);
  for (const file of [
    "shopping-packs.js",
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
      "\nthis.getRecipeStepsFromShopping=globalThis.getRecipeStepsFromShopping;",
    ctx
  );
  return ctx;
}

const CHECKS = [
  { id: "갈->간다", test: (s) => /간다/.test(s) && /갈/.test(s) },
  { id: "괄호+한다", test: (s) => /\)\s*한다/.test(s) },
  { id: "부은한다", test: (s) => /부은한다/.test(s) },
  { id: "페트병로", test: (s) => /페트병로/.test(s) },
  { id: "토핑한다", test: (s) => /토핑한다/.test(s) },
  { id: "OK잔존", test: (s) => /\bOK\b/.test(s) },
  { id: "건타피오카", test: (s) => /건타피오카/.test(s) },
  { id: "조사오류", test: (s) => /(?:국자|스프레이|시리얼)과\s+[가-힣]/.test(s) || /시리얼를/.test(s) },
  { id: "존댓말", test: (s) => /(?:습니다|해요|하세요|드립니다|주세요)/.test(s) },
  { id: "중복어", test: (s) => /\b([가-힣A-Za-z·]{2,})\s+\1\b/.test(s) },
  { id: "목적격없음", test: (s) => {
    const AMOUNT = /(?:\d+(?:\.\d+)?(?:~\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔|봉|바퀴|스쿱)|\d+\/\d+컵|0\.\d+컵|적당량|토핑|드리즐)/;
    const ACTION = /(?:넣|붓|부|섞|저|흔들|깔|올|뿌|갈|담|데|우|풀|만)/;
    const reAmt = new RegExp(`([가-힣A-Za-z][가-힣A-Za-z0-9·\\s]{1,30}?)${AMOUNT.source}(?![을를])(?=\\s+${ACTION.source})`);
    if (reAmt.test(s)) return true;
    const reNoun = /([가-힣A-Za-z][가-힣A-Za-z0-9·\s]{1,30})(?<![을를])(?=\s+(?:올린|깔고|깔아|올려|뿌려)\b)/;
    if (reNoun.test(s)) return true;
    return /(?<!을 )얼음(?![을를])(?=\s+(?:채우|채|넣))/.test(s);
  }},
  { id: "마침표없음", test: (s) => s.length > 0 && !/[.!?]$/.test(s) },
];

const ctx = loadContext();
const issues = [];

ctx.MENUS.filter((m) => m.recipeReady).forEach((menu) => {
  ctx.getRecipeStepsFromShopping(menu).forEach((step, i) => {
    const body = (step.body || "").trim();
    CHECKS.forEach((check) => {
      if (check.test(body)) {
        issues.push({ check: check.id, menu: `${menu.brand} ${menu.name}`, step: i + 1, body });
      }
    });
  });
});

if (issues.length) {
  console.error(`Found ${issues.length} grammar issues:\n`);
  issues.slice(0, 50).forEach((i) => console.error(`- [${i.check}] ${i.menu}: ${i.body}`));
  process.exit(1);
}

console.log(`OK — ${ctx.MENUS.filter((m) => m.recipeReady).length} menus · 만드는 방법 맞춤법`);
