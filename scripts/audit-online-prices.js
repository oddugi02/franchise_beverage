#!/usr/bin/env node
/**
 * 장보기 카탈로그 가격 ↔ 마트별 인기순 1위 스냅샷 대조
 *
 * 가격 기준: 각 재료의 catalog.store 에서 searchQuery 검색 시 인기순 1위 상품
 *
 * 실행:
 *   node scripts/audit-online-prices.js          # 스냅샷 대조 + 미검증 목록
 *   node scripts/audit-online-prices.js --list   # 전체 품목 검색 URL (인기순 정렬)
 *   node scripts/audit-online-prices.js --csv    # CSV 출력
 */
const fs = require("fs");
const path = require("path");
const {
  SHOPPING_VERIFIED_AT,
  SHOPPING_PACK_CATALOG,
  SHOPPING_POWDER_CATALOG,
} = require(path.join(__dirname, "../shopping-packs.js"));
const { SHOPPING_STORES, buildStoreSearchUrl } = require("../store-search.js");

const SNAPSHOT_PATH = path.join(__dirname, "../data/shopping-price-snapshots.json");
const TOLERANCE_PCT = 0.05;

const args = process.argv.slice(2);
const listMode = args.includes("--list");
const csvMode = args.includes("--csv");

function loadSnapshots() {
  if (!fs.existsSync(SNAPSHOT_PATH)) return { entries: {} };
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
}

function snapshotPrice(snap) {
  if (!snap) return null;
  return snap.popularRank1 ?? snap.marketLow ?? null;
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

function statusFor(entry, snapshot) {
  const snap = snapshot?.entries?.[entry.key];
  const ref = snapshotPrice(snap);
  if (ref == null) return { status: "unverified", snap, ref: null };

  const diff = entry.price - ref;
  const pct = ref > 0 ? diff / ref : 0;

  if (entry.price === ref) {
    return { status: "ok", snap, ref, diff: 0, pct: 0 };
  }
  if (diff > 0 && pct > TOLERANCE_PCT) {
    return { status: "high", snap, ref, diff, pct };
  }
  if (diff < 0) {
    return { status: "low", snap, ref, diff, pct };
  }
  return { status: "ok", snap, ref, diff, pct };
}

const snapshots = loadSnapshots();
const rows = allCatalogEntries();

if (listMode || csvMode) {
  const header = [
    "catalog",
    "key",
    "store",
    "buy",
    "catalogPrice",
    "popularRank1",
    "status",
    "product",
    "searchUrlPopular",
  ];
  const lines = rows.map((e) => {
    const { status, snap, ref } = statusFor(e, snapshots);
    const url = buildStoreSearchUrl(e.store, e.searchQuery, { popular: true });
    return [
      e.catalog,
      e.key,
      e.store,
      e.buy,
      e.price,
      ref ?? "",
      status,
      snap?.product ?? "",
      url,
    ];
  });

  if (csvMode) {
    console.log(header.join(","));
    lines.forEach((cols) => {
      console.log(cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    });
    process.exit(0);
  }

  console.log(`장보기 가격 확인 (${rows.length}품목 · ${SHOPPING_VERIFIED_AT})`);
  console.log(`기준: 각 마트 검색 인기순 1위 상품 가격\n`);

  rows.forEach((entry) => {
    const { status, snap, ref } = statusFor(entry, snapshots);
    const flag = status === "ok" ? "✓" : status === "unverified" ? "?" : "!";
    const url = buildStoreSearchUrl(entry.store, entry.searchQuery, { popular: true });
    console.log(`${flag} [${entry.key}] ${entry.buy}`);
    console.log(`   기준 마트 ${entry.store} · 카탈로그 ${entry.price}원 · 스냅샷 ${ref || "—"}원`);
    if (snap?.product) console.log(`   상품: ${snap.product}`);
    console.log(`   ★ ${url}`);
    SHOPPING_STORES.filter((s) => s !== entry.store).forEach((s) => {
      console.log(`   ${s}: ${buildStoreSearchUrl(s, entry.searchQuery, { popular: true })}`);
    });
    console.log("");
  });
  process.exit(0);
}

const issues = [];
let verified = 0;
let unverified = 0;

rows.forEach((entry) => {
  const { status, snap, ref, diff, pct } = statusFor(entry, snapshots);

  if (status === "unverified") {
    unverified++;
    return;
  }

  verified++;
  if (status === "high") {
    issues.push({
      kind: "catalog-high",
      key: entry.key,
      buy: entry.buy,
      store: entry.store,
      catalogPrice: entry.price,
      popularRank1: ref,
      diff,
      pct: Math.round(pct * 100),
      msg: `카탈로그 ${entry.price}원 > 인기순 1위 ${ref}원 (+${diff}원, +${Math.round(pct * 100)}%)`,
    });
  } else if (status === "low") {
    issues.push({
      kind: "catalog-low",
      key: entry.key,
      buy: entry.buy,
      store: entry.store,
      catalogPrice: entry.price,
      popularRank1: ref,
      diff,
      msg: `카탈로그 ${entry.price}원 < 인기순 1위 ${ref}원 (${diff}원) — 카탈로그 갱신 필요`,
    });
  }

  if (entry.price < entry.priceMin || entry.price > entry.priceMax) {
    issues.push({
      kind: "range",
      key: entry.key,
      buy: entry.buy,
      msg: `price ${entry.price}원이 priceMin~priceMax(${entry.priceMin}~${entry.priceMax}) 밖`,
    });
  }
});

console.log(`장보기 가격 대조 (${SHOPPING_VERIFIED_AT} · 인기순 1위 기준)`);
console.log(`카탈로그 ${rows.length}품목 · 스냅샷 검증 ${verified} · 미검증 ${unverified}`);
console.log(`스냅샷: data/shopping-price-snapshots.json\n`);

if (unverified > 0) {
  console.log(
    `⚠ 미검증 ${unverified}품목 — node scripts/audit-online-prices.js --list 로 인기순 검색 후 스냅샷 추가\n`
  );
}

if (issues.length === 0) {
  if (unverified === rows.length) {
    console.log("스냅샷이 비어 있습니다. --list로 확인 후 data/shopping-price-snapshots.json 을 채워 주세요.");
    process.exit(1);
  }
  console.log("✓ 스냅샷 대조 이슈 없음");
  process.exit(0);
}

issues.forEach((issue) => {
  console.log(`[${issue.kind}] ${issue.key}: ${issue.msg}`);
  if (issue.buy) console.log(`  → ${issue.buy} @ ${issue.store || ""}`);
});

console.log(
  `\n총 ${issues.length}건 불일치 · 갱신: shopping-packs.js price + data/shopping-price-snapshots.json`
);
process.exit(1);
