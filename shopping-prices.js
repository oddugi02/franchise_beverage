// 네이버 쇼핑 최저가 — Supabase / API / 정적 오버라이드 로드
(function () {
  const listeners = new Set();
  let overrides = {};
  let updatedAt = null;
  let ready = false;
  let source = "static";

  function getConfig() {
    return window.SITE_CONFIG || {};
  }

  function hasSupabase() {
    const cfg = getConfig();
    return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  }

  function hasShoppingApi() {
    return Boolean(getConfig().shoppingApiUrl);
  }

  function remoteHeaders() {
    const key = getConfig().supabaseAnonKey;
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
    };
  }

  function normalizeOverride(row, catalogKey) {
    if (!row) return null;
    const override = {
      price: row.price ?? row.pack_price ?? row.packPrice,
      link: row.link ?? row.product_link ?? row.productLink,
      productUrl: row.productUrl ?? row.link ?? row.product_link ?? row.productLink,
      productTitle: row.productTitle ?? row.product_title ?? row.productName,
      productName: row.productName ?? row.product_title ?? row.productTitle,
      mallName: row.mallName ?? row.mall_name ?? "네이버쇼핑",
      unitPrice: row.unitPrice ?? row.unit_price,
      packUnits: row.packUnits ?? row.pack_units,
      store: "네이버",
    };
    const entry =
      catalogKey && typeof SHOPPING_PACK_CATALOG !== "undefined"
        ? SHOPPING_PACK_CATALOG[catalogKey]
        : null;
    if (entry && globalThis.ProductFilter && !ProductFilter.isValidPriceOverride(override, entry)) {
      return null;
    }
    return override;
  }

  function mergeOverrides(map) {
    overrides = { ...overrides, ...map };
  }

  function apply() {
    if (typeof globalThis.applyShoppingPriceOverrides === "function") {
      globalThis.applyShoppingPriceOverrides(overrides);
    }
  }

  function notify() {
    listeners.forEach((fn) => fn({ overrides, updatedAt, source, ready }));
  }

  async function fetchFromSupabase() {
    const base = getConfig().supabaseUrl.replace(/\/$/, "");
    const res = await fetch(`${base}/rest/v1/shopping_prices?select=*&order=updated_at.desc`, {
      headers: remoteHeaders(),
    });
    if (!res.ok) throw new Error("shopping_prices fetch failed");
    const rows = await res.json();
    const map = {};
    rows.forEach((row) => {
      const item = normalizeOverride(row, row.catalog_key);
      if (item) map[row.catalog_key] = item;
    });
    updatedAt = rows[0]?.updated_at || updatedAt;
    return map;
  }

  async function fetchFromApi() {
    const base = getConfig().shoppingApiUrl.replace(/\/$/, "");
    const res = await fetch(`${base}/api/shopping/prices`);
    if (!res.ok) throw new Error("shopping API fetch failed");
    const json = await res.json();
    updatedAt = json.updatedAt || updatedAt;
    const map = {};
    Object.entries(json.items || {}).forEach(([key, row]) => {
      const item = normalizeOverride(row, key);
      if (item) map[key] = item;
    });
    return map;
  }

  function loadStatic() {
    if (typeof SHOPPING_PRICE_OVERRIDES === "undefined") return {};
    if (typeof SHOPPING_PRICE_UPDATED_AT !== "undefined" && SHOPPING_PRICE_UPDATED_AT) {
      updatedAt = SHOPPING_PRICE_UPDATED_AT;
    }
    const map = {};
    Object.entries(SHOPPING_PRICE_OVERRIDES).forEach(([key, row]) => {
      const item = normalizeOverride(row, key);
      if (item) map[key] = item;
    });
    return map;
  }

  async function init() {
    mergeOverrides(loadStatic());
    apply();

    if (hasSupabase()) {
      try {
        mergeOverrides(await fetchFromSupabase());
        source = "supabase";
      } catch {
        /* static 유지 */
      }
    } else if (hasShoppingApi()) {
      try {
        mergeOverrides(await fetchFromApi());
        source = "api";
      } catch {
        /* static 유지 */
      }
    }

    ready = true;
    apply();
    notify();
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function getOverrides() {
    return { ...overrides };
  }

  globalThis.ShoppingPrices = {
    init,
    onChange,
    getOverrides,
    isReady: () => ready,
    getUpdatedAt: () => updatedAt,
    getSource: () => source,
    refresh: init,
  };
})();
