/**
 * 장보기 검색 링크 — 브라우저·Node 공용
 * 가격 기준: 해당 마트에서 검색어로 찾았을 때 인기순 1위 상품 판매가
 */
(function (root) {
  const SHOPPING_STORES = ["이마트", "홈플러스", "쿠팡"];

  const SHOPPING_PRICE_POLICY =
    "각 마트에서 재료 검색 시 인기순(판매량·추천) 1위 상품 가격";

  /**
   * @param {string} store 이마트 | 홈플러스 | 쿠팡
   * @param {string} query 검색어
   * @param {{ popular?: boolean }} [options] popular=false 이면 기본 정렬
   */
  function buildStoreSearchUrl(store, query, options = {}) {
    const q = encodeURIComponent(query || "");
    const s = (store || "").trim();
    const popular = options.popular !== false;

    if (s === "쿠팡") {
      const sorter = popular ? "saleCountDesc" : "scoreDesc";
      return `https://www.coupang.com/np/search?q=${q}&sorter=${sorter}`;
    }
    if (s === "이마트") {
      // 이마트몰: sort=best 판매량순 (미적용 시 결과 상단 인기순 탭 확인)
      return popular
        ? `https://emart.ssg.com/search.ssg?query=${q}&sort=best`
        : `https://emart.ssg.com/search.ssg?query=${q}`;
    }
    if (s === "홈플러스") {
      return popular
        ? `https://mfront.homeplus.co.kr/search?keyword=${q}&sortType=BEST`
        : `https://mfront.homeplus.co.kr/search?keyword=${q}`;
    }

    return `https://search.naver.com/search.naver?query=${encodeURIComponent(`${query || ""} ${s}`.trim())}`;
  }

  /** 네이버 쇼핑 검색 (가격 낮은순) — API 링크 없을 때 폴백 */
  function buildNaverShoppingSearchUrl(query) {
    const q = encodeURIComponent(query || "");
    return `https://search.shopping.naver.com/search/all?query=${q}&sort=price_asc`;
  }

  const api = {
    SHOPPING_STORES,
    SHOPPING_PRICE_POLICY,
    buildStoreSearchUrl,
    buildNaverShoppingSearchUrl,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.SHOPPING_STORES = SHOPPING_STORES;
  root.SHOPPING_PRICE_POLICY = SHOPPING_PRICE_POLICY;
  root.buildStoreSearchUrl = buildStoreSearchUrl;
  root.buildNaverShoppingSearchUrl = buildNaverShoppingSearchUrl;
})(typeof globalThis !== "undefined" ? globalThis : this);
