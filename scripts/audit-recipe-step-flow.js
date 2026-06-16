#!/usr/bin/env node
/** 만드는 방법 단계 간 도약(앞 단계 없이 녹여둔·우려낸·만든 등) 감사 */
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
      "\nthis.getHomeIngredients=getHomeIngredients;",
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

const FORWARD_PATTERNS = [
  { re: /녹여둔|녹인\s+(?:에스프레소|커피)/, needs: /녹이|녹일|녹여|녹았/ },
  { re: /우려낸/, needs: /우려/ },
  { re: /만든\s+(?:커피\s*베이스|초코\s*베이스|베이스)/, needs: /만든|만들/ },
  { re: /식힌\s+(?:에스프레소|샷|애플티|차)/, needs: /식히|식힌|식혀|식을/ },
  { re: /흔들어\s+만든/, needs: /흔든|흔들/ },
  { re: /쉐이킹한/, needs: /쉐이킹|흔든|흔들/ },
  { re: /준비한/, needs: /준비/ },
  { re: /데워둔|데쳐\s+준비/, needs: /데우|데워|데친|데친/ },
];

function hasForwardJump(steps) {
  const issues = [];
  for (let i = 0; i < steps.length; i++) {
    const body = steps[i].body || steps[i];
    const prior = steps
      .slice(0, i)
      .map((s) => (s.body || s))
      .join(" ");
    for (const { re, needs } of FORWARD_PATTERNS) {
      if (!re.test(body)) continue;
      if (!needs.test(prior) && !needs.test(body)) {
        issues.push({ step: i + 1, body, pattern: re.source });
      }
    }
  }
  return issues;
}

const ctx = loadBrowserContext();
const menus = ctx.MENUS.filter((m) => m.homeBuy);
let total = 0;

for (const menu of menus) {
  const steps = ctx.getRecipeStepsFromShopping(menu);
  const issues = hasForwardJump(steps);
  if (!issues.length) continue;
  total += issues.length;
  console.log(`\n[${menu.brand}] ${menu.name} (${menu.slug})`);
  for (const issue of issues) {
    console.log(`  step ${issue.step}: ${issue.body.slice(0, 80)}${issue.body.length > 80 ? "…" : ""}`);
  }
}

if (!total) {
  console.log("OK — 도약 없음");
} else {
  console.log(`\n총 ${total}건`);
  process.exit(1);
}
