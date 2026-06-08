/**
 * 장보기 PACK 가격·구매처·판매 규격 감사
 * 실행: node scripts/audit-shopping-packs.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const {
  SHOPPING_VERIFIED_AT,
  SHOPPING_PACK_CATALOG,
  SHOPPING_POWDER_CATALOG,
} = require(path.join(ROOT, "shopping-packs.js"));

const MENU_FILES = [
  "mega-menus.js",
  "gongcha-menus.js",
  "paik-menus.js",
  "compose-menus.js",
  "starbucks-menus.js",
  "mammoth-menus.js",
];

/** 쿠팡 등에서 단종·미판매로 확인된 규격 (buy/searchQuery에 있으면 실패) */
const DISCONTINUED_SPECS = [
  { pattern: /죠리퐁\s*108\s*g/i, note: "쿠팡 미판매 · 138g로 갱신 필요" },
];

function extractPackSpec(text) {
  if (!text) return null;
  const m = text.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|L|입|팩)/i);
  if (!m) return null;
  return `${m[1]}${m[2].toLowerCase()}`;
}

function auditCatalog(catalog, label) {
  const issues = [];
  for (const [key, entry] of Object.entries(catalog)) {
    if (!entry.searchQuery) {
      issues.push({ kind: "missing-search", key, label, msg: "searchQuery 없음" });
    }
    if (!entry.store) {
      issues.push({ kind: "missing-store", key, label, msg: "store 없음" });
    }
    if (entry.price < entry.priceMin || entry.price > entry.priceMax) {
      issues.push({
        kind: "price-range",
        key,
        label,
        msg: `price ${entry.price}원이 범위 ${entry.priceMin}~${entry.priceMax}원 밖`,
        buy: entry.buy,
        store: entry.store,
      });
    }

    const buySpec = extractPackSpec(entry.buy);
    const searchSpec = extractPackSpec(entry.searchQuery);
    if (buySpec && searchSpec && buySpec !== searchSpec) {
      issues.push({
        kind: "spec-mismatch",
        key,
        label,
        msg: `buy(${buySpec}) ≠ searchQuery(${searchSpec}) — 검색어와 구매명 규격 불일치`,
        buy: entry.buy,
      });
    }

    const specText = `${entry.buy} ${entry.searchQuery} ${entry.exampleProduct || ""}`;
    DISCONTINUED_SPECS.forEach(({ pattern, note }) => {
      if (pattern.test(specText)) {
        issues.push({
          kind: "discontinued-spec",
          key,
          label,
          msg: note,
          buy: entry.buy,
        });
      }
    });
  }
  return issues;
}

function loadBrowserContext() {
  const ctx = { globalThis: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "shopping-packs.js"), "utf8"), ctx);
  for (const file of MENU_FILES) {
    const filePath = path.join(ROOT, file);
    if (fs.existsSync(filePath)) {
      vm.runInContext(fs.readFileSync(filePath, "utf8"), ctx);
    }
  }
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, "data.js"), "utf8") +
      "\nthis.MENUS = MENUS;" +
      "\nthis.getHomeIngredients = getHomeIngredients;" +
      "\nthis.getHomeIngredientPrice = getHomeIngredientPrice;" +
      "\nthis.isHomeIngredientPriced = isHomeIngredientPriced;",
    ctx
  );
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, "home-buy.js"), "utf8") +
      "\nthis.getHomeShoppingList = globalThis.getHomeShoppingList;" +
      "\nthis.getHomeShoppingPrice = globalThis.getHomeShoppingPrice;",
    ctx
  );
  return ctx;
}

const catalogIssues = [
  ...auditCatalog(SHOPPING_PACK_CATALOG, "PACK"),
  ...auditCatalog(SHOPPING_POWDER_CATALOG, "POWDER"),
];

const ctx = loadBrowserContext();
const menuIssues = [];
const seen = new Set();

ctx.MENUS.forEach((menu) => {
  if (!menu.recipeReady) return;
  const list = ctx.getHomeShoppingList(menu);
  list.forEach((item) => {
    if (!item.priced) return;
    const sig = `${item.buy}|${item.store}|${item.price}`;
    if (seen.has(sig)) return;
    seen.add(sig);

    DISCONTINUED_SPECS.forEach(({ pattern, note }) => {
      if (pattern.test(item.buy || "")) {
        menuIssues.push({
          kind: "discontinued-spec",
          menu: menu.name,
          buy: item.buy,
          store: item.store,
          msg: note,
        });
      }
    });

    const packEntry = Object.values(SHOPPING_PACK_CATALOG).find(
      (p) => p.buy === item.buy && p.store === item.store
    );
    const powderEntry = Object.values(SHOPPING_POWDER_CATALOG).find(
      (p) => p.buy === item.buy && p.store === item.store
    );
    const entry = packEntry || powderEntry;

    if (!entry) {
      menuIssues.push({
        kind: "unknown-item",
        menu: menu.name,
        buy: item.buy,
        store: item.store,
        price: item.price,
        msg: "카탈로그에 없는 장보기 항목",
      });
      return;
    }

    if (item.price !== entry.price) {
      menuIssues.push({
        kind: "price-mismatch",
        menu: menu.name,
        buy: item.buy,
        store: item.store,
        price: item.price,
        expected: entry.price,
        msg: `표시 ${item.price}원 ≠ 카탈로그 ${entry.price}원`,
      });
    }
  });
});

const allIssues = [...catalogIssues, ...menuIssues];

console.log(`장보기 PACK 감사 (${SHOPPING_VERIFIED_AT} 기준)`);
console.log(
  `카탈로그: PACK ${Object.keys(SHOPPING_PACK_CATALOG).length} · POWDER ${Object.keys(SHOPPING_POWDER_CATALOG).length}`
);
console.log(`메뉴 장보기 고유 항목: ${seen.size}개\n`);

if (allIssues.length === 0) {
  console.log("✓ 이슈 없음");
  process.exit(0);
}

allIssues.forEach((issue) => {
  const prefix = issue.menu ? `[${issue.menu}]` : `[${issue.label}:${issue.key}]`;
  console.log(`${prefix} ${issue.msg}`);
  if (issue.buy) console.log(`  → ${issue.buy} @ ${issue.store || ""} ${issue.price ?? ""}원`);
});

console.log(`\n총 ${allIssues.length}건`);
process.exit(1);
