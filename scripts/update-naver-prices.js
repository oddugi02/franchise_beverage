#!/usr/bin/env node
/**
 * 네이버 쇼핑 검색 API → 장보기 카탈로그 최저가·구매 링크 갱신
 *
 * 환경 변수:
 *   NAVER_CLIENT_ID, NAVER_CLIENT_SECRET  (필수)
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (--sync-supabase 시)
 *
 * 실행:
 *   NAVER_CLIENT_ID=... NAVER_CLIENT_SECRET=... node scripts/update-naver-prices.js
 *   node scripts/update-naver-prices.js --dry-run
 *   node scripts/update-naver-prices.js --key espresso10
 *   node scripts/update-naver-prices.js --sync-supabase
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");
try {
  require(path.join(ROOT, "server/node_modules/dotenv")).config({ path: path.join(ROOT, ".env") });
} catch {
  try {
    require("dotenv").config({ path: path.join(ROOT, ".env") });
  } catch {
    /* dotenv 없으면 환경 변수 직접 export */
  }
}
const { searchLowestWithEconomics, sleep } = require("./lib/naver-shopping");
const { isPricePlausible } = require("./lib/naver-product-filter");
const {
  SHOPPING_PACK_CATALOG,
  SHOPPING_POWDER_CATALOG,
} = require(path.join(ROOT, "shopping-packs.js"));

const PACKS_PATH = path.join(ROOT, "shopping-packs.js");
const OVERRIDES_PATH = path.join(ROOT, "shopping-price-overrides.js");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const syncSupabase = args.includes("--sync-supabase");
const singleKey = args.includes("--key") ? args[args.indexOf("--key") + 1] : null;
const delayMs = Number(process.env.NAVER_DELAY_MS || 350);

function loadExistingOverrides() {
  if (!fs.existsSync(OVERRIDES_PATH)) return {};
  try {
    const ctx = { SHOPPING_PRICE_OVERRIDES: {} };
    vm.createContext(ctx);
    vm.runInContext(
      fs.readFileSync(OVERRIDES_PATH, "utf8") +
        "\nglobalThis.SHOPPING_PRICE_OVERRIDES = typeof SHOPPING_PRICE_OVERRIDES !== 'undefined' ? SHOPPING_PRICE_OVERRIDES : {};",
      ctx
    );
    return { ...(ctx.SHOPPING_PRICE_OVERRIDES || {}) };
  } catch {
    return {};
  }
}
function allCatalogEntries() {
  const rows = [];
  for (const [key, entry] of Object.entries(SHOPPING_PACK_CATALOG)) {
    rows.push({ catalog: "PACK", key, ...entry });
  }
  for (const [key, entry] of Object.entries(SHOPPING_POWDER_CATALOG)) {
    rows.push({ catalog: "POWDER", key, ...entry });
  }
  return rows;
}

async function upsertSupabase(row) {
  const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");

  const res = await fetch(`${url}/rest/v1/shopping_prices`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([
      {
        catalog_key: row.key,
        search_query: row.searchQuery,
        buy_label: row.buy,
        product_title: row.productTitle,
        product_link: row.productLink,
        pack_price: row.packPrice,
        pack_units: row.packUnits,
        unit_kind: row.unitKind,
        unit_price: row.unitPrice,
        mall_name: row.mallName,
        updated_at: new Date().toISOString(),
      },
    ]),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert 실패: ${text.slice(0, 200)}`);
  }
}

function writeOverridesJs(overrides, updatedAt) {
  const lines = [
    "// 네이버 쇼핑 API로 갱신 — node scripts/update-naver-prices.js",
    "// 페이지 로드 시 shopping-prices.js 가 shopping-packs.js 에 덮어씁니다",
    `const SHOPPING_PRICE_UPDATED_AT = ${JSON.stringify(updatedAt)};`,
    "const SHOPPING_PRICE_OVERRIDES = {",
  ];

  for (const [key, item] of Object.entries(overrides)) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(item, null, 2).replace(/\n/g, "\n  ")},`);
  }

  lines.push("};");
  fs.writeFileSync(OVERRIDES_PATH, lines.join("\n") + "\n", "utf8");
}

function patchShoppingPacksFile(updates) {
  let src = fs.readFileSync(PACKS_PATH, "utf8");
  const today = new Date().toISOString().slice(0, 10);

  for (const { key, packPrice, productTitle, productLink, mallName } of updates) {
    const blockRe = new RegExp(`(\\b${key}:\\s*\\{[^}]*?\\bprice:\\s*)\\d+`, "s");
    if (!blockRe.test(src)) {
      console.warn(`[skip patch] ${key}: price 필드 없음`);
      continue;
    }
    src = src.replace(blockRe, `$1${packPrice}`);

    const keyBlockRe = new RegExp(`(\\b${key}:\\s*\\{)([\\s\\S]*?)(\\n\\s*\\},)`, "m");
    src = src.replace(keyBlockRe, (match, open, body, close) => {
      let next = body;
      next = next.replace(/\n\s*productUrl:[^\n]*/g, "");
      next = next.replace(/\n\s*productName:[^\n]*/g, "");
      next = next.replace(/\n\s*mallName:[^\n]*/g, "");
      next = next.replace(/\n\s*naverUpdatedAt:[^\n]*/g, "");
      next = next.replace(/\n\s*coupangUpdatedAt:[^\n]*/g, "");
      next = next.replace(/\n\s*store:[^\n]*/g, "");
      next = next.replace(/,\s*$/, "");
      const extras = [
        `,\n    store: "네이버"`,
        `,\n    productUrl: ${JSON.stringify(productLink)}`,
        `,\n    productName: ${JSON.stringify(productTitle)}`,
        `,\n    mallName: ${JSON.stringify(mallName || "네이버쇼핑")}`,
        `,\n    naverUpdatedAt: ${JSON.stringify(today)}`,
      ].join("");
      return `${open}${next}${extras}${close}`;
    });
  }

  if (/const SHOPPING_VERIFIED_AT = "[^"]+"/.test(src)) {
    src = src.replace(/const SHOPPING_VERIFIED_AT = "[^"]+"/, `const SHOPPING_VERIFIED_AT = "${today}"`);
  }

  fs.writeFileSync(PACKS_PATH, src, "utf8");
}

async function main() {
  if (!dryRun && (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET)) {
    console.error(
      "NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 환경 변수를 설정하세요.\n" +
        "  export NAVER_CLIENT_ID=...\n" +
        "  export NAVER_CLIENT_SECRET=...\n" +
        "테스트: node scripts/update-naver-prices.js --dry-run"
    );
    process.exit(1);
  }

  let entries = allCatalogEntries();
  if (singleKey) {
    entries = entries.filter((e) => e.key === singleKey);
    if (!entries.length) {
      console.error(`카탈로그에 '${singleKey}' 없음`);
      process.exit(1);
    }
  }

  console.log(`네이버 쇼핑 ${entries.length}개${dryRun ? " (dry-run)" : ""} 조회…`);

  const overrides = loadExistingOverrides();
  const packUpdates = [];
  const updatedAt = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const keyword = entry.searchQuery || entry.buy;
    process.stdout.write(`[${i + 1}/${entries.length}] ${entry.key} "${keyword}" … `);

    if (dryRun) {
      console.log("(dry-run)");
      continue;
    }

    try {
      const hit = await searchLowestWithEconomics(keyword, entry.buy, { catalogEntry: entry });
      if (!hit?.packPrice) {
        console.log("적합한 결과 없음");
        continue;
      }

      const inRange = hit.priceInRange ?? isPricePlausible(hit.packPrice, entry);

      const override = {
        link: hit.productLink,
        productUrl: hit.productLink,
        productTitle: hit.productTitle,
        productName: hit.productTitle,
        mallName: hit.mallName || "네이버쇼핑",
        store: "네이버",
      };
      if (inRange) {
        override.price = hit.packPrice;
        override.unitPrice = hit.unitPrice;
        override.packUnits = hit.packUnits;
      }
      overrides[entry.key] = override;

      if (syncSupabase) {
        try {
          await upsertSupabase({
            key: entry.key,
            searchQuery: keyword,
            buy: entry.buy,
            ...hit,
          });
        } catch (syncErr) {
          console.log(`\n    [supabase] ${syncErr.message}`);
        }
      }

      if (inRange) {
        packUpdates.push({
          key: entry.key,
          packPrice: hit.packPrice,
          productTitle: hit.productTitle,
          productLink: hit.productLink,
          mallName: hit.mallName,
        });
        console.log(`${entry.price} → ${hit.packPrice}원 (개당 ${hit.unitPrice ?? "?"}원) ✓`);
      } else {
        console.log(`${hit.packPrice}원 · ${(hit.productTitle || "").slice(0, 28)}… (범위 밖 — 링크만)`);
      }
    } catch (err) {
      console.log(`오류: ${err.message}`);
    }

    if (i < entries.length - 1) await sleep(delayMs);
  }

  if (dryRun) {
    console.log("\n완료 (dry-run). API 키 설정 후 다시 실행하세요.");
    return;
  }

  writeOverridesJs(overrides, updatedAt);
  console.log(`\n쓰기: ${path.relative(ROOT, OVERRIDES_PATH)} (${Object.keys(overrides).length}건)`);

  if (packUpdates.length) {
    patchShoppingPacksFile(packUpdates);
    console.log(`쓰기: ${path.relative(ROOT, PACKS_PATH)} (${packUpdates.length}건)`);
  }

  console.log("\n다음: node scripts/audit-shopping-packs.js && node scripts/audit-recipe-shopping.js");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
