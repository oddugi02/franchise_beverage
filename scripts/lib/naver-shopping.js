/**
 * 네이버 쇼핑 검색 API — Node 전용 (Client Secret은 서버·CI에서만 사용)
 * @see https://developers.naver.com/docs/serviceapi/shopping/shopping.md
 */
const { calcPackEconomics } = require("./pack-unit");
const { pickBestProduct, isPricePlausible } = require("./naver-product-filter");

const NAVER_SHOP_URL = "https://openapi.naver.com/v1/search/shop.json";

function stripHtml(text) {
  return (text || "").replace(/<[^>]+>/g, "").trim();
}

/**
 * @param {string} query 검색어
 * @param {{ clientId: string, clientSecret: string, display?: number, start?: number }} opts
 */
async function searchProducts(query, opts = {}) {
  const clientId = opts.clientId || process.env.NAVER_CLIENT_ID;
  const clientSecret = opts.clientSecret || process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경 변수가 필요합니다.");
  }

  const params = new URLSearchParams({
    query: query || "",
    display: String(Math.min(Math.max(opts.display ?? 10, 1), 100)),
    start: String(Math.max(opts.start ?? 1, 1)),
    sort: "asc",
  });

  const res = await fetch(`${NAVER_SHOP_URL}?${params}`, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`네이버 API 응답 파싱 실패 (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(`네이버 API 오류 (${res.status}): ${json.errorMessage || text.slice(0, 200)}`);
  }

  return {
    total: json.total ?? 0,
    items: (json.items || []).map((item) => ({
      title: stripHtml(item.title),
      link: item.link,
      lprice: parseInt(item.lprice, 10) || 0,
      hprice: parseInt(item.hprice, 10) || 0,
      mallName: item.mallName || "",
      productId: item.productId,
      brand: item.brand || "",
      maker: item.maker || "",
    })),
  };
}

/**
 * sort=asc 결과에서 식재료·가격 범위 필터 후 최저가 선택
 * @param {object} [catalogEntry] shopping-packs 항목 (priceMin/Max, buy 등)
 */
async function searchLowestProduct(query, opts = {}) {
  const display = opts.display ?? 50;
  const { items } = await searchProducts(query, { ...opts, display, start: 1 });
  const best = pickBestProduct(items, opts.catalogEntry);
  if (!best) return null;
  return {
    query,
    productTitle: best.title,
    productLink: best.link,
    packPrice: best.lprice,
    mallName: best.mallName,
    productId: best.productId,
    brand: best.brand,
    priceInRange: isPricePlausible(best.lprice, opts.catalogEntry),
  };
}

/**
 * 최저가 + 팩 규격 기반 개당 원가
 */
async function searchLowestWithEconomics(query, buyText, opts = {}) {
  const catalogEntry = opts.catalogEntry || { buy: buyText, priceMin: opts.priceMin, priceMax: opts.priceMax };
  const product = await searchLowestProduct(query, { ...opts, catalogEntry });
  if (!product) return null;
  const economics = calcPackEconomics(product.packPrice, buyText || query);
  return { ...product, ...economics, buy: buyText || query };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = {
  NAVER_SHOP_URL,
  stripHtml,
  searchProducts,
  searchLowestProduct,
  searchLowestWithEconomics,
  sleep,
  isPricePlausible,
  pickBestProduct,
};
