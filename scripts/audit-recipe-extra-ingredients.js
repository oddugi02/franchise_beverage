#!/usr/bin/env node
/** 1회 사용에 없는 재료가 만드는 방법에 언급되는지 감사 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function loadContext() {
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
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + "\nthis.MENUS=MENUS;", ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "recipe-step-style.js"), "utf8"), ctx);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, "home-buy.js"), "utf8") +
      "\nthis.getHomePortionList=globalThis.getHomePortionList;" +
      "\nthis.getRecipeStepsFromShopping=globalThis.getRecipeStepsFromShopping;" +
      "\nthis.restrictStepToListedIngredients=globalThis.restrictStepToListedIngredients;",
    ctx
  );
  return ctx;
}

const ALIASES = {
  "코코아 파우더": ["초코", "코코아", "초콜릿", "초코칩", "초코크런치", "초코크런치시리얼"],
  "민트 시럽": ["민트"],
  "휘핑크림": ["휘핑", "크림", "치즈폼", "밀크폼"],
  오레오: ["쿠키", "쿠키베이스", "쿠키크럼", "쿠키분태"],
  "설탕시럽": ["슈가시럽", "시럽"],
  "에스프레소 액상스틱": ["에스프레소", "샷"],
  "플레인 요거트": ["요거트", "플랜트"],
  "딸기잼": ["쥬얼리", "딸기"],
  "홍차 티백": ["홍차", "블랙티", "티백"],
  "녹차 티백": ["녹차", "그린티", "말차"],
  "우롱차 티백": ["우롱"],
  "얼그레이 티백": ["얼그레이"],
  "자스민 티백": ["자스민"],
  "카라멜 시럽": ["카라멜"],
  "초코 시럽": ["초코시럽"],
  "바닐라 시럽": ["바닐라"],
  "헤이즐넛 시럽": ["헤이즐넛"],
  "블루 레몬 시럽": ["블루큐라소"],
  "자몽청": ["자몽", "후르티자몽"],
  "레몬즙": ["레몬", "레몬베이스", "레몬퓨레"],
  "라임 시럽": ["라임", "모히또"],
  사이다: ["탄산수", "탄산"],
  콜라: ["콜라"],
  "타피오카 펄": ["타피오카", "펄", "블랙펄"],
  "콜드브루 원액": ["콜드브루", "더치"],
  "토피넛 라떼 스틱": ["토피넛"],
  "고구마": ["고구마페이스트"],
  "녹차 가루": ["녹차파우더", "말차"],
  "바닐라 아이스크림": ["아이스크림"],
  "초코 크런치 시리얼": ["자바칩", "초코크런치"],
  "냉동 망고": ["망고"],
  "냉동 딸기": ["딸기"],
  "연유": ["연유"],
  꿀: ["꿀"],
  우유: ["우유"],
  물: ["물", "정수", "뜨거운물", "차가운물"],
  얼음: ["얼음"],
};

function norm(value) {
  return (value || "").replace(/\s+/g, "").toLowerCase();
}

function buildAllowed(portions, homeItems) {
  const allowed = new Set();
  const add = (v) => {
    const n = norm(v);
    if (n.length >= 2) allowed.add(n);
  };
  portions.forEach((p) => {
    add(p.recipeName);
    add(p.label);
    add(p.recipeDisplay?.split(/\s+\d/)[0]);
  });
  (homeItems || []).forEach((h) => {
    add(h.label);
    const reps = Array.isArray(h.replaces) ? h.replaces : h.replaces ? [h.replaces] : [];
    reps.forEach(add);
  });
  return allowed;
}

function matchesAllowed(name, allowed) {
  const n = norm(name);
  if (n.length < 2) return true;
  for (const a of allowed) {
    if (n === a || n.includes(a) || a.includes(n)) return true;
  }
  for (const [key, aliases] of Object.entries(ALIASES)) {
    const kn = norm(key);
    if (![...allowed].some((a) => a.includes(kn) || kn.includes(a))) continue;
    if (aliases.some((al) => n.includes(norm(al)) || norm(al).includes(n))) return true;
    if (n.includes(kn) || kn.includes(n)) return true;
  }
  return false;
}

const INGREDIENT_MENTION =
  /([가-힣][가-힣·\s]{1,24}?)\s*(?:\d+(?:\.\d+)?(?:~\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔|봉|티백|잎|분량|스쿱|국자|개입)|적당량|가득|토핑|드리즐)/g;

const SKIP = new Set([
  "뚜껑",
  "페트병",
  "컵",
  "병",
  "쉐이커",
  "믹서",
  "블렌더",
  "분태",
  "슬라이스",
  "조각",
  "토핑용",
  "마실",
  "제공",
  "한",
  "약",
  "소량",
  "더",
  "위",
  "바닥",
  "가볍게",
  "세게",
  "골고루",
  "짧게",
  "천천히",
  "부드럽게",
  "민트휘핑",
]);

const ctx = loadContext();
const issues = [];

ctx.MENUS.filter((m) => m.recipeReady).forEach((menu) => {
  const portions = ctx.getHomePortionList(menu).filter((p) => p.amount && p.amount !== "-");
  const allowed = buildAllowed(portions, menu.recipe?.homeIngredients);
  const steps = ctx.getRecipeStepsFromShopping(menu).map((s) => s.body).join(" ");
  const extras = [];
  let match;
  const re = new RegExp(INGREDIENT_MENTION.source, "g");
  while ((match = re.exec(steps))) {
    const name = match[1].trim().replace(/^(뜨거운|차가운|소량|약간|더|위에|바닥)\s*/, "");
    if (SKIP.has(norm(name))) continue;
    if (!matchesAllowed(name, allowed)) extras.push(name);
  }
  const uniq = [...new Set(extras)];
  if (uniq.length) {
    issues.push({ menu: `${menu.brand} ${menu.name}`, extras: uniq, steps });
  }
});

if (issues.length) {
  console.error(`1회 사용에 없는 재료가 레시피에 포함됨 ${issues.length}건:\n`);
  issues.forEach((i) => {
    console.error(`[${i.menu}]`);
    console.error(`  목록 외: ${i.extras.join(", ")}`);
    console.error(`  단계: ${i.steps.slice(0, 120)}${i.steps.length > 120 ? "…" : ""}\n`);
  });
  process.exit(1);
}

console.log(`OK — ${ctx.MENUS.filter((m) => m.recipeReady).length}개 메뉴 · 레시피 ⊆ 1회 사용`);
