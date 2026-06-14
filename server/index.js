/**
 * 네이버 쇼핑 API 프록시 + Supabase 가격 캐시
 *
 *   cd server && cp .env.example .env
 *   npm install && npm start
 *
 * 엔드포인트:
 *   GET  /api/health
 *   GET  /api/shopping/search?query=...&buy=...   — 단일 검색 (sort=asc 최저가)
 *   GET  /api/shopping/prices                     — DB 캐시 전체
 *   POST /api/shopping/refresh                    — 카탈로그 일괄 갱신 (ADMIN_SECRET)
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { searchLowestWithEconomics } = require("../scripts/lib/naver-shopping");
const { calcPackEconomics } = require("../scripts/lib/pack-unit");

const {
  SHOPPING_PACK_CATALOG,
  SHOPPING_POWDER_CATALOG,
} = require(path.join(__dirname, "../shopping-packs.js"));

const app = express();
const PORT = Number(process.env.PORT || 8787);

const corsOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.includes("*") ? true : corsOrigins,
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json());

function naverCreds() {
  return {
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
  };
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && key ? { url, key } : null;
}

function catalogEntries() {
  const rows = [];
  for (const [key, entry] of Object.entries(SHOPPING_PACK_CATALOG)) {
    rows.push({ catalog: "PACK", key, ...entry });
  }
  for (const [key, entry] of Object.entries(SHOPPING_POWDER_CATALOG)) {
    rows.push({ catalog: "POWDER", key, ...entry });
  }
  return rows;
}

function rowToOverride(row) {
  return {
    price: row.pack_price,
    link: row.product_link,
    productUrl: row.product_link,
    productTitle: row.product_title,
    productName: row.product_title,
    mallName: row.mall_name || "네이버쇼핑",
    unitPrice: row.unit_price,
    packUnits: row.pack_units,
    store: "네이버",
  };
}

async function supabaseFetch(path, options = {}) {
  const cfg = supabaseConfig();
  if (!cfg) throw new Error("Supabase 미설정");

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const msg = typeof json === "object" ? json.message || JSON.stringify(json) : text;
    throw new Error(`Supabase ${res.status}: ${msg}`);
  }
  return json;
}

async function upsertShoppingPrice(row) {
  return supabaseFetch("shopping_prices", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([row]),
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    naver: Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
    supabase: Boolean(supabaseConfig()),
  });
});

/** 단일 재료 네이버 최저가 검색 */
app.get("/api/shopping/search", async (req, res) => {
  const query = (req.query.query || "").trim();
  const buy = (req.query.buy || query).trim();
  if (!query) return res.status(400).json({ error: "query 파라미터가 필요합니다." });

  try {
    const result = await searchLowestWithEconomics(query, buy, {
      ...naverCreds(),
      catalogEntry: { buy, priceMin: req.query.priceMin, priceMax: req.query.priceMax },
    });
    if (!result) return res.status(404).json({ error: "검색 결과 없음", query });
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/** DB에 저장된 전체 재료 가격 (프론트 페이지 로드용) */
app.get("/api/shopping/prices", async (_req, res) => {
  const cfg = supabaseConfig();
  if (!cfg) {
    return res.status(503).json({ error: "Supabase 미설정 — shopping-price-overrides.js 정적 파일 사용" });
  }

  try {
    const rows = await supabaseFetch("shopping_prices?select=*&order=updated_at.desc");
    const items = {};
    (rows || []).forEach((row) => {
      items[row.catalog_key] = rowToOverride(row);
    });
    res.json({ updatedAt: rows[0]?.updated_at || null, items });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/** 카탈로그 전체 네이버 조회 → Supabase upsert */
app.post("/api/shopping/refresh", async (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return res.status(503).json({ error: "ADMIN_SECRET 미설정" });
  if (req.headers["x-admin-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const delayMs = Number(process.env.NAVER_DELAY_MS || 350);
  const entries = catalogEntries();
  const results = [];
  const errors = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const keyword = entry.searchQuery || entry.buy;
    try {
      const hit = await searchLowestWithEconomics(keyword, entry.buy, {
        ...naverCreds(),
        catalogEntry: entry,
      });
      if (!hit) {
        errors.push({ key: entry.key, error: "결과 없음" });
        continue;
      }

      const row = {
        catalog_key: entry.key,
        search_query: keyword,
        buy_label: entry.buy,
        product_title: hit.productTitle,
        product_link: hit.productLink,
        pack_price: hit.packPrice,
        pack_units: hit.packUnits,
        unit_kind: hit.unitKind,
        unit_price: hit.unitPrice,
        mall_name: hit.mallName,
        updated_at: new Date().toISOString(),
      };

      if (supabaseConfig()) await upsertShoppingPrice(row);
      results.push({ key: entry.key, packPrice: hit.packPrice, link: hit.productLink });
    } catch (err) {
      errors.push({ key: entry.key, error: err.message });
    }
    if (i < entries.length - 1) await new Promise((r) => setTimeout(r, delayMs));
  }

  res.json({ ok: true, updated: results.length, results, errors });
});

app.listen(PORT, () => {
  console.log(`shopping API http://localhost:${PORT}`);
  console.log(`  GET  /api/shopping/prices`);
  console.log(`  GET  /api/shopping/search?query=에스프레소+액상스틱+10입`);
});
