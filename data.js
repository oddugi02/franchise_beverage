// 매장 ingredients: 제조 매뉴얼·B2B 업체용 재료 (참고용, 매장 원재료 분석에만 표시)
// 집 recipe.homeIngredients: 마트·쿠팡에서 구하기 쉬운 재료로 치환 — price 필드
//
// [매장 B2B 단가 기준]
// - 우유 ~1,500원/L (1.5원/ml) · 원두 에스프레소 ~68원/샷(7g)
// - 시럽·농축액 ~7원/ml · 파우더·베이스 ~9원/g · 과일퓨레 ~3.5원/g
// - 타피오카·펄 ~3.8원/g · 휘핑·크림 ~5.5원/g · 컵 95~115원 · 얼음 25원
//
// [집 마트 판매가 기준] price = 1회 분량 소비자 실판매가
// - 우유 1L 1,680~2,300원 · 액상스틱 1,150원/개 (10입 11,500원) · 커피스틱 45원/개
// - 얼음 1잔 50원 · 투게더 3스푼 400원 · 죠리퐁 0.5컵 290원 (138g 팩 기준)
// - 냉동망고 150g 900원 · 황도통조림 국물 60ml 360원 · 자몽청 2스푼 400원
// - 설탕시럽 3펌프 180원 · 헤이즐넛시럽 1큰술 270원 · 포멜로 1개 2,800원
const MENUS = [
  ...(typeof MEGA_MENUS !== "undefined" ? MEGA_MENUS : []),
  ...(typeof GONGCHA_MENUS !== "undefined" ? GONGCHA_MENUS : []),
  ...(typeof PAIK_MENUS !== "undefined" ? PAIK_MENUS : []),
  ...(typeof COMPOSE_MENUS !== "undefined" ? COMPOSE_MENUS : []),
  ...(typeof STARBUCKS_MENUS !== "undefined" ? STARBUCKS_MENUS : []),
  ...(typeof MAMMOTH_MENUS !== "undefined" ? MAMMOTH_MENUS : []),
  ...(typeof EDIIYA_MENUS !== "undefined" ? EDIIYA_MENUS : []),
  ...(typeof PASCUCCI_MENUS !== "undefined" ? PASCUCCI_MENUS : []),
];

const VERIFICATION_LEVELS = {
  verified: {
    label: "검증 완료",
    badgeClass: "status-badge--verified",
    desc: "",
  },
  reported: {
    label: "제보 기반",
    badgeClass: "status-badge--cross",
    desc: "알바·현장 제보를 바탕으로 정리했어요. 추가 제보 환영",
  },
  estimated: {
    label: "추정·참고",
    badgeClass: "status-badge--crowd",
    desc: "공개자료·유사 레시피로 추정했어요. 참고용으로 봐 주세요",
  },
};

const HOME_RECIPE_SOURCE_NOTE =
  "유튜브·블로그 등 홈레시피 참고 · 컵·숟가락·뚜껑 컵(페트병)만으로 만들 수 있게 단계별로 정리했어요";

const HOME_SHOPPING_NOTE =
  "매장 원재료를 마트·네이버쇼핑에서 구할 수 있는 재료로 치환했어요. 재료를 누르면 네이버 쇼핑 최저가 구매 페이지가 새 창으로 열려요";

const STORE_INGREDIENT_NOTE =
  "제조 매뉴얼·업체 납품 기준 매장 원재료입니다 (참고용)";

const MENU_META = {
  verification: "verified",
  sources: ["알바생 메뉴 암기용 퀴즐렛", "유튜브·블로그 홈레시피"],
  updatedAt: "2026-06-08",
};

function getMenuMeta() {
  return { ...MENU_META, sources: [...MENU_META.sources] };
}

function getVerificationLevel(key) {
  return VERIFICATION_LEVELS[key] || VERIFICATION_LEVELS.estimated;
}

function formatMetaDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

const CATEGORIES = ["전체", "커피", "라떼", "프라페·프라푸치노", "버블티·밀크티", "에이드·과일", "스무디·쉐이크"];

const BRANDS = [
  { id: "mega", name: "메가커피", logo: "☕", logoImg: "assets/brands/mega.png", logoBg: "#FFFFFF", logoColor: "#333" },
  { id: "gongcha", name: "공차", logo: "🧋", logoImg: "assets/brands/gongcha.png", logoBg: "#FFFFFF", logoColor: "#fff" },
  { id: "paik", name: "빽다방", logo: "PAIK", logoImg: "assets/brands/paik.png", logoBg: "#FFFFFF", logoColor: "#1a1a1a" },
  { id: "ediya", name: "이디야", logo: "E", logoImg: "assets/brands/ediya.png", logoBg: "#FFFFFF", logoColor: "#003776" },
  { id: "pascucci", name: "파스쿠찌", logo: "P", logoImg: "assets/brands/pascucci.png", logoBg: "#FFFFFF", logoColor: "#fff" },
  { id: "mammoth", name: "매머드익스프레스", logo: "🦣", logoImg: "assets/brands/mammoth.png", logoBg: "#FFFFFF", logoColor: "#fff" },
  { id: "starbucks", name: "스타벅스", logo: "★", logoImg: "assets/brands/starbucks.png", logoBg: "#FFFFFF", logoColor: "#fff" },
  { id: "compose", name: "컴포즈커피", logo: "C", logoImg: "assets/brands/compose.png", logoBg: "#FFFFFF", logoColor: "#fff" },
];

function getBrands() {
  return BRANDS;
}

function getBrandByName(name) {
  return BRANDS.find((b) => b.name === name);
}

function getTotalCost(menu) {
  return (menu.ingredients || []).reduce((sum, i) => sum + i.cost, 0);
}

function isStoreIngredientReal(ing) {
  return ing.name && !/^컵/.test(ing.name);
}

function getStoreIngredients(menu) {
  return (menu.ingredients || []).filter(isStoreIngredientReal);
}

function isHomeIngredientPriced(item) {
  return item.label !== "얼음";
}

function getHomeIngredientPrice(item) {
  if (!isHomeIngredientPriced(item)) return 0;
  return item.price ?? item.cost ?? 0;
}

function getHomeIngredients(menu) {
  return (menu.recipe?.homeIngredients || []).map((item) =>
    typeof item === "string"
      ? { label: item, amount: "", price: 0, replaces: "" }
      : { ...item, price: getHomeIngredientPrice(item) }
  );
}

function getHomePortionPrice(menu) {
  if (typeof getHomePortionList === "function") {
    const sum = getHomePortionList(menu).reduce((s, item) => s + (item.price || 0), 0);
    if (sum > 0) return sum;
  }
  const items = getHomeIngredients(menu);
  const fallback = items.reduce((s, item) => s + getHomeIngredientPrice(item), 0);
  return fallback > 0 ? fallback : 0;
}

function getHomePrice(menu) {
  return getHomePortionPrice(menu);
}

function getStoreMarkupRatio(menu) {
  const totalCost = getTotalCost(menu);
  if (!totalCost || !menu.price) return 0;
  return menu.price / totalCost;
}

function getHomeSaveRatio(menu) {
  const homePrice = getHomePrice(menu);
  if (!homePrice || !menu.price) return 0;
  return menu.price / homePrice;
}

function getCostRatePct(menu) {
  const totalCost = getTotalCost(menu);
  if (!totalCost || !menu.price) return 0;
  return Math.round((totalCost / menu.price) * 100);
}

function getSavings(menu) {
  if (!menu.price) return 0;
  return menu.price - getHomePrice(menu);
}

const VILLAIN_GRADES = [
  {
    id: "kind",
    emoji: "😊",
    title: "착한 가격",
    range: "2.5배 미만",
    desc: "원가 대비 여유 있는 편이에요",
    maxRatio: 2.5,
  },
  {
    id: "normal",
    emoji: "😐",
    title: "평범한 자",
    range: "2.5~4배",
    desc: "업계 평균 수준이에요",
    maxRatio: 4,
  },
  {
    id: "small",
    emoji: "😏",
    title: "소소한 빌런",
    range: "4~6배",
    desc: "원가보다 꽤 올린 가격이에요",
    maxRatio: 6,
  },
  {
    id: "mid",
    emoji: "😈",
    title: "중급 빌런",
    range: "6~8배",
    desc: "마진이 꽤 큰 편이에요",
    maxRatio: 8,
  },
  {
    id: "final",
    emoji: "👹",
    title: "최종 빌런",
    range: "8배 이상",
    desc: "원가의 8배 이상 받는 메뉴예요",
    maxRatio: Infinity,
  },
];

function getVillainGrades() {
  return VILLAIN_GRADES;
}

function getVillainGradeByRatio(ratio) {
  return (
    VILLAIN_GRADES.find((grade) => ratio < grade.maxRatio) ||
    VILLAIN_GRADES[VILLAIN_GRADES.length - 1]
  );
}

function getVillainGrade(menu) {
  return getVillainGradeByRatio(getStoreMarkupRatio(menu));
}

function formatReplaces(replaces) {
  if (!replaces) return "";
  return Array.isArray(replaces) ? replaces.join(" · ") : replaces;
}

function formatWon(n) {
  return n.toLocaleString("ko-KR") + "원";
}

function getUniqueBrands() {
  const seen = new Set();
  return MENUS.filter((m) => {
    if (seen.has(m.brand)) return false;
    seen.add(m.brand);
    return true;
  }).map((m) => m.brand);
}

function getBrandCount(brand) {
  return MENUS.filter((m) => m.brand === brand && isMenuListed(m)).length;
}

function isMenuListed(menu) {
  return !menu?.listHidden;
}

function getRecipeReadyCount() {
  return MENUS.filter((m) => m.recipeReady && isMenuListed(m)).length;
}

function getMaxSavingsPercent() {
  let max = 0;
  MENUS.forEach((m) => {
    if (m.price && m.recipeReady) {
      const pct = Math.round((getSavings(m) / m.price) * 100);
      if (pct > max) max = pct;
    }
  });
  return max || 83;
}
