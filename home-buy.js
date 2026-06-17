// 장보기 목록 — shopping-packs.js 검증 카탈로그 기준 (마트별 검색 인기순 1위 가격)
// 가격 갱신 후: node scripts/audit-shopping-packs.js · node scripts/audit-online-prices.js
(function () {
  const PACK = { ...SHOPPING_PACK_CATALOG };

  function applyShoppingPriceOverrides(map) {
    if (!map) return;
    const PF = globalThis.ProductFilter;
    for (const [key, override] of Object.entries(map)) {
      if (!override) continue;
      const entry = PACK[key] || POWDER_BUY[key];
      if (!entry) continue;
      if (PF && !PF.isValidPriceOverride(override, entry)) continue;
      if (override.price != null) {
        entry.price = override.price;
      }
      const link = override.productUrl || override.link;
      if (link) entry.productUrl = link;
      const name = override.productName || override.productTitle;
      if (name) entry.productName = name;
      if (override.mallName) entry.mallName = override.mallName;
      if (override.store) entry.store = override.store;
    }
  }

  const POWDER_BUY = Object.fromEntries(
    Object.entries(SHOPPING_POWDER_CATALOG).map(([label, pack]) => [
      label,
      { ...pack, mergeKey: `powder:${label}` },
    ])
  );

  if (typeof SHOPPING_PRICE_OVERRIDES !== "undefined") {
    applyShoppingPriceOverrides(SHOPPING_PRICE_OVERRIDES);
  }
  globalThis.applyShoppingPriceOverrides = applyShoppingPriceOverrides;

  const STEP_ALIASES = {
    정수: "물",
    온수: "물",
    "차가운 물": "물",
    얼음물: "물",
    "초코 파우더": "코코아 파우더",
    "초콜릿 파우더": "코코아 파우더",
    "요거트 파우더": "플레인 요거트",
    "플레인 요거트 파우더": "플레인 요거트",
    "스무디 파우더": "플레인 요거트",
    레몬퓨레: "레몬즙",
    자몽퓨레: "자몽청",
    자몽시럽: "자몽청",
    "참외·멜론 시럽": "참외 시럽",
    "참외·멜론 설탕시럽": "설탕시럽",
    "흑설탕 시럽": "설탕시럽",
    슈가시럽: "설탕시럽",
    "모카 시럽": "초코 시럽",
    "시나몬 시럽": "시나몬 돌체 시럽",
    "화이트 초코 시럽": "화이트 모카 시럽",
    "블루큐라소 시럽": "블루 레몬 시럽",
    탄산수: "사이다",
    "고구마 페이스트": "고구마",
    쿠키베이스: "오레오",
    "쿠키 베이스": "오레오",
    초코베이스: "코코아 파우더",
    "초코 베이스": "코코아 파우더",
    녹차베이스: "녹차 파우더",
    "녹차 베이스": "녹차 파우더",
    카라멜소스: "카라멜 시럽",
    "카라멜 드리즐": "카라멜 시럽",
    카라멜베이스: "카라멜 시럽",
    "카라멜 소스": "카라멜 시럽",
    "티라미수 소스": "코코아 파우더",
    "티라미수 크림": "휘핑크림",
    "민트 시럽": "코코아 파우더",
    "민트 휘핑크림": "휘핑크림",
    "망고 시럽": "망고 주스",
    "딸기 시럽": "딸기잼",
    "쿠키 크럼": "오레오",
    "쿠키 분태": "오레오",
    "홍차 파우더": "홍차 티백",
    "말차 가루": "녹차/말차 가루",
  };

  function resolveBuyLabel(label) {
    let L = (label || "").trim();
    for (let i = 0; i < 6 && STEP_ALIASES[L]; i++) L = STEP_ALIASES[L];
    return L;
  }

  const RECIPE_DISPLAY_NAMES = {
    건타피오카: "타피오카 펄",
    "휘핑크림 스프레이": "휘핑크림",
    "바닐라 아이스크림": "바닐라 아이스크림",
    "바닐라 크림": "휘핑크림",
    "녹차/말차 가루": "녹차/말차 가루",
    "플레인 요거트": "떠먹는 요거트",
    "달고나 크런치": "달고나",
  };

  function cleanupRecipeStepText(text) {
    return (text || "")
      .replace(/건타피오카을/g, "타피오카 펄을")
      .replace(/건타피오카를/g, "타피오카 펄을")
      .replace(/건타피오카(?=\s|,|$|과|와|을|를)/g, "타피오카 펄")
      .replace(/페트병로/g, "페트병으로")
      .replace(/부은한다/g, "붓는다")
      .replace(/토핑한다/g, "토핑으로 올린다")
      .replace(/요거트을/g, "요거트를")
      .replace(/섞은한다/g, "섞는다")
      .replace(/(스프레이|폼|펄|크럼|시럽|슬라이스|시리얼)\s*과\s+(?=[가-힣]*[aeiouAEIOUㅏ-ㅣ])/g, "$1와 ")
      .replace(/시리얼를/g, "시리얼을")
      .replace(/포크로\s*으깨\s+(?:오레오|쿠키\s*베이스)를?\s*만들고/g, "포크로 으깨고")
      .replace(/숟가락으로\s*으깨\s+([가-힣]+)\s*베이스를?\s*만든다/g, "숟가락으로 $1를 으깬다")
      .replace(/으깨는다/g, "으깬다")
      .replace(/(\d+잎)를/g, "$1을")
      .replace(/숟가락으로\s*으깨(?![간다고])/g, "숟가락으로 으깬")
      .replace(/\b([가-힣A-Za-z·]{2,})\s+\1\b/g, "$1")
      .replace(/\.을\s+올려/g, "을 올려")
      .replace(/\.를\s+올려/g, "를 올려")
      .replace(/,\s*에\s*,/g, ", ")
      .replace(/컵에\s*,\s*/g, "컵에 ")
      .replace(/,\s*,+/g, ",")
      .replace(/(을|를)(\s*,)/g, "$2")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function normalizeToppingStep(text) {
    const m = (text || "").trim().match(/^토핑\s*:\s*(.+)$/);
    if (!m) return text;
    const item = m[1]
      .replace(/\s*(?:한다|준다)\.?$/, "")
      .replace(/\./g, "")
      .trim();
    if (!item) return "";
    const endsVowel = /[aeiouAEIOUㅏ-ㅣ]$/.test(item.slice(-1));
    const particle = endsVowel ? "를" : "을";
    return `${item}${particle} 올려 마무리한다.`;
  }

  function powderPack(label) {
    const pack = POWDER_BUY[label];
    if (pack) return pack;
    return {
      buy: `${label} 500g`,
      price: 5200,
      store: "쿠팡",
      searchQuery: label,
      mergeKey: `powder:${label}`,
    };
  }

  function sanitizePackProduct(pack) {
    const PF = globalThis.ProductFilter;
    if (!PF || !pack?.productName) return pack;
    const strip = { ...pack, productUrl: undefined, productName: undefined, mallName: undefined };
    if (!PF.isRelevantProduct(pack.productName, pack)) return strip;
    if (pack.productUrl && !PF.isTrustedMall(pack.productUrl, pack.mallName)) return strip;
    return pack;
  }

  function packItem(pack, extra = {}) {
    const safe = sanitizePackProduct(pack);
    return {
      buy: safe.buy,
      price: safe.price,
      store: safe.store,
      searchQuery: safe.searchQuery,
      exampleProduct: safe.exampleProduct,
      productUrl: safe.productUrl,
      productName: safe.productName,
      mallName: safe.mallName,
      priced: true,
      usage: "-",
      ...extra,
    };
  }

  /** 장보기 팩 규격 파싱 (ml, g, 입 등) */
  function parsePackUnit(buyText) {
    const t = buyText || "";
    const can = t.match(/(\d+)\s*캔/);
    if (can) return { kind: "ea", amount: parseInt(can[1], 10) };
    const ea = t.match(/(\d+)\s*개/);
    if (ea) return { kind: "ea", amount: parseInt(ea[1], 10) };
    const ml = t.match(/(\d+(?:\.\d+)?)\s*ml/i);
    if (ml) return { kind: "ml", amount: parseFloat(ml[1]) };
    const L = t.match(/(\d+(?:\.\d+)?)\s*L(?!\w)/i);
    if (L) return { kind: "ml", amount: parseFloat(L[1]) * 1000 };
    const g = t.match(/(\d+(?:\.\d+)?)\s*g(?!\w)/i);
    if (g) return { kind: "g", amount: parseFloat(g[1]) };
    const kg = t.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kg) return { kind: "g", amount: parseFloat(kg[1]) * 1000 };
    const sticks = t.match(/(\d+)\s*입/);
    if (sticks) return { kind: "ea", amount: parseInt(sticks[1], 10) };
    return null;
  }

  function isIcecreamLabel(label) {
    return /아이스크림|젤라|투게더/i.test(label || "");
  }

  function parseUsageUnit(amount, label) {
    const a = amount || "";
    const ml = parseUsageMl(a);
    if (ml > 0 && !isIcecreamLabel(label)) return { kind: "ml", amount: ml };
    const g = parseUsageG(a);
    if (g > 0) return { kind: "g", amount: g };
    const scoop = a.match(/(\d+(?:\.\d+)?)\s*스쿱/);
    if (scoop) {
      const n = parseFloat(scoop[1]);
      return isIcecreamLabel(label)
        ? { kind: "g", amount: n * 65 }
        : { kind: "ml", amount: n * 65 };
    }
    const bigSpoon = a.match(/(\d+(?:\.\d+)?)\s*큰술/);
    if (bigSpoon && (isIcecreamLabel(label) || /달고나/.test(label || ""))) {
      return { kind: "g", amount: parseFloat(bigSpoon[1]) * spoonGrams(label, "", "큰술") };
    }
    if (ml > 0) return { kind: "ml", amount: ml };
    const sticks = a.match(/(\d+(?:\.\d+)?)\s*(?:개입|개|입|봉|샷|스틱|펌프|스푼|큰술|티백|캔)/);
    if (sticks) return { kind: "ea", amount: parseFloat(sticks[1]) };
    if (/1~2|1-2/.test(a)) return { kind: "ea", amount: 1.5 };
    if (/2샷|2입|2개|2스틱|2봉/.test(a)) return { kind: "ea", amount: 2 };
    if (/3샷|3입|3봉/.test(a)) return { kind: "ea", amount: 3 };
    if (/1샷|1입|1개|1스틱|1펌프|1큰술|1티백/.test(a)) return { kind: "ea", amount: 1 };
    if (/0\.5컵/.test(a)) return { kind: "ml", amount: 100 };
    if (/티백/.test(label) && !a) return { kind: "ea", amount: 1 };
    return null;
  }

  /** 팩 가격 ÷ 규격 × 1회 사용량 → 1회 원가 */
  function portionCostFromPack(pack, amount, label) {
    if (!pack?.price || !pack.priced) return null;
    const packUnit = parsePackUnit(pack.buy);
    const usageUnit = parseUsageUnit(amount, label);
    if (!packUnit || !usageUnit) return null;
    if (packUnit.kind === usageUnit.kind) {
      if (packUnit.amount <= 0 || usageUnit.amount <= 0) return null;
      return Math.max(1, Math.round((pack.price / packUnit.amount) * usageUnit.amount));
    }
    // 투게더 등 아이스크림: 팩은 g, 예전 ml 표기는 무게(g)로 동일 환산
    if (packUnit.kind === "g" && usageUnit.kind === "ml" && isIcecreamLabel(label)) {
      if (packUnit.amount <= 0 || usageUnit.amount <= 0) return null;
      return Math.max(1, Math.round((pack.price / packUnit.amount) * usageUnit.amount));
    }
    // 1캔 팩 × ml 사용량 (콜라 355ml 등)
    if (packUnit.kind === "ea" && usageUnit.kind === "ml" && packUnit.amount === 1) {
      const canMl = (pack.buy || "").match(/(\d+(?:\.\d+)?)\s*ml/i);
      const volume = canMl ? parseFloat(canMl[1]) : 355;
      if (volume > 0 && usageUnit.amount > 0) {
        return Math.max(1, Math.round((pack.price / volume) * usageUnit.amount));
      }
    }
    // 시럽·소스 펌프(회) × ml/L 팩
    if (packUnit.kind === "ml" && usageUnit.kind === "ea") {
      const pumpMl = /잼|청/.test(label || "") ? 15 : 10;
      const isPump =
        /펌프/.test(amount || "") || /시럽|소스|청|잼/.test(label || "") || /시럽/.test(pack.buy || "");
      if (isPump && pumpMl > 0) {
        return Math.max(1, Math.round((pack.price / packUnit.amount) * usageUnit.amount * pumpMl));
      }
    }
    return null;
  }

  function parseUsageMl(amount) {
    if (!amount) return 0;
    const ml = amount.match(/([\d.]+)\s*ml/i);
    if (ml) return parseFloat(ml[1]);
    if (/0\.25컵/.test(amount)) return 50;
    if (/0\.5컵/.test(amount)) return 100;
    if (/0\.75컵/.test(amount)) return 150;
    if (/1\.5컵/.test(amount)) return 300;
    if (/1컵/.test(amount)) return 200;
    return 0;
  }

  function parseUsageG(amount) {
    if (!amount) return 0;
    const g = amount.match(/([\d.]+)\s*g/i);
    return g ? parseFloat(g[1]) : 0;
  }

  function milkPack(totalMl) {
    if (totalMl <= 500) return PACK.milk500;
    return PACK.milk1L;
  }

  function applyPackFields(group, pack) {
    const safe = sanitizePackProduct(pack);
    group.buy = safe.buy;
    group.price = safe.price;
    group.store = safe.store;
    group.searchQuery = safe.searchQuery;
    group.exampleProduct = safe.exampleProduct;
    group.productUrl = safe.productUrl;
    group.productName = safe.productName;
    group.mallName = safe.mallName;
    group.priced = true;
  }

  function suggestHomeBuy(label, amount) {
    const L = resolveBuyLabel(label);
    const a = amount || "";

    if (L === "얼음") {
      return { buy: "얼음 (집에서)", priced: false, usage: a || "적당량" };
    }

    if (L === "우유" || L === "흰 우유") {
      const ml = parseUsageMl(a);
      const pack = milkPack(ml || 200);
      return packItem(pack, { usage: a || "-", needMl: ml || 200, mergeKey: "milk" });
    }

    if (L === "두유") {
      return packItem(PACK.soy190, { usage: a, mergeKey: "soy" });
    }

    if (L === "생크림") {
      return packItem(PACK.cream500, { usage: a });
    }

    if (L === "휘핑크림") {
      return packItem(PACK.whip500, { usage: a });
    }

    if (L === "연유") {
      return packItem(PACK.condensed380, { usage: a });
    }

    if (L === "설탕") {
      return packItem(PACK.sugar1kg, { usage: a });
    }

    if (L === "커피믹스") {
      return packItem(PACK.coffeeMix20, { usage: a });
    }

    if (L === "프림") {
      return packItem(PACK.prim500, { usage: a });
    }

    if (L === "에스프레소" || L === "에스프레소 샷" || L === "에스프레소 액상스틱") {
      return packItem(PACK.espresso10, { usage: a, mergeKey: "espresso" });
    }

    if (L === "커피 스틱") {
      return packItem(PACK.espresso10, { usage: a, mergeKey: "espresso" });
    }

    if (L === "투게더") {
      return packItem(PACK.together473, { usage: a });
    }

    if (L === "죠리퐁") {
      return packItem(PACK.jollypong138, { usage: a });
    }

    if (L === "카라멜 시럽") {
      return packItem(PACK.caramel500, { usage: a, mergeKey: "caramel" });
    }

    if (L === "설탕시럽" || L === "슈가시럽") {
      return packItem(PACK.sugarSyrup500, { usage: a, mergeKey: "sugarSyrup" });
    }

    if (L === "바닐라 시럽") {
      return packItem(PACK.syrup500, { usage: a, mergeKey: "vanillaSyrup" });
    }

    if (L === "초코 시럽" || L === "초코소스" || L === "모카 시럽") {
      return packItem(PACK.chocoSyrup500, { usage: a, mergeKey: "chocoSyrup" });
    }

    if (L === "민트 시럽") {
      return packItem(PACK.blueSyrup500, { usage: a, mergeKey: "mintSyrup" });
    }

    if (L === "허브티 티백") {
      return packItem(PACK.tea25, { usage: a, mergeKey: "herbTea" });
    }

    if (L === "참외 시럽" || L === "멜론 시럽") {
      return packItem(PACK.melonSyrup500, { usage: a, mergeKey: "melonSyrup" });
    }

    if (/시럽/.test(L) || L === "시럽" || L === "딸기소스") {
      if (L.includes("블루")) return packItem(PACK.blueSyrup500, { usage: a, mergeKey: "blueSyrup" });
      if (L.includes("체리")) return packItem(PACK.cherrySyrup250, { usage: a, mergeKey: "cherry" });
      if (L.includes("라임")) return packItem(PACK.syrup500, { usage: a, mergeKey: "limeSyrup" });
      if (L.includes("헤이즐넛")) return packItem(PACK.hazelnut500, { usage: a, mergeKey: "hazelnut" });
      if (L.includes("바닐라")) return packItem(PACK.syrup500, { usage: a, mergeKey: "vanillaSyrup" });
      return packItem(PACK.sugarSyrup500, { usage: a, mergeKey: "sugarSyrup" });
    }

    if (L === "사이다" || L === "탄산수") {
      return packItem(PACK.soda15L, { usage: a, mergeKey: "soda" });
    }

    if (L === "마시멜로") {
      return packItem(PACK.marshmallow300, { usage: a, mergeKey: "marshmallow" });
    }

    if (L === "코코아 파우더" || L === "초코 파우더") {
      return packItem(PACK.cocoa500, { usage: a, mergeKey: "cocoa" });
    }

    if (L === "녹차 가루" || L === "말차") {
      return packItem(PACK.matcha100, { usage: a, mergeKey: "matcha" });
    }

    if (L === "오레오" || L === "쿠키 크럼") {
      return packItem(PACK.cookiePack, { usage: a, mergeKey: "cookie" });
    }

    if (L === "딸기잼" || L === "딸기 소스") {
      return packItem(PACK.strawberryJam500, { usage: a, mergeKey: "strawberryJam" });
    }

    if (L === "블루베리 잼") {
      return packItem(PACK.strawberryJam500, { usage: a, mergeKey: "blueberryJam" });
    }

    if (L === "딸기 요거트") {
      return packItem(PACK.yogurtDrink150, { usage: a, mergeKey: "strawberryYogurt" });
    }

    if (L === "고구마" || L === "고구마 청") {
      return packItem(PACK.sweetPotato500, { usage: a, mergeKey: "sweetPotato" });
    }

    if (L === "약과") {
      return packItem(PACK.yakgwa200, { usage: a, mergeKey: "yakgwa" });
    }

    if (L === "청귤청") {
      return packItem(PACK.lemonJuice200, { usage: a, mergeKey: "citrus" });
    }

    if (L === "유자청") {
      return packItem(PACK.yujaTea500, { usage: a, mergeKey: "yuja" });
    }

    if (L === "티백" || L === "홍차 티백" || L === "홍차" || L === "진한 홍차" || L === "사과 티백") {
      return packItem(PACK.tea25, { usage: a, mergeKey: "tea" });
    }

    if (L === "자스민 티백") {
      return packItem(PACK.jasmine25, { usage: a, mergeKey: "jasmine" });
    }

    if (L === "얼그레이 티백") {
      return packItem(PACK.earlGrey25, { usage: a, mergeKey: "earlgrey" });
    }

    if (L === "녹차 티백") {
      return packItem(PACK.greenTea25, { usage: a, mergeKey: "greentea" });
    }

    if (L === "우롱찻잎" || L === "우롱차 티백") {
      return packItem(PACK.oolongTea25, { usage: a, mergeKey: "oolong" });
    }

    if (/타피오카|화이트 펄|사고 펄/.test(L)) {
      return packItem(PACK.tapioca1kg, { usage: a, mergeKey: "tapioca" });
    }

    if (L === "냉동 망고" || L === "망고") {
      return packItem(PACK.frozenMango1kg, { usage: a, mergeKey: "mango" });
    }

    if (L === "냉동 과일") {
      return packItem(PACK.frozenBerry500, { usage: a, mergeKey: "frozenFruit" });
    }

    if (L === "냉동 딸기" || L === "냉동 블루베리") {
      return packItem(PACK.frozenBerry500, { usage: a, mergeKey: "berry" });
    }

    if (L === "망고 주스") {
      return packItem(PACK.mangoJuice200, { usage: a });
    }

    if (L === "복숭아 국물") {
      return packItem(PACK.peachCan820, { usage: a });
    }

    if (L === "드링킹 요거트") {
      return packItem(PACK.yogurtDrink150, { usage: a });
    }

    if (L === "플레인 요거트" || L === "플레인 요거트 파우더") {
      return packItem(PACK.yogurt400, { usage: a, mergeKey: "plainYogurt" });
    }

    if (L === "요거트 파우더") {
      const pack = powderPack(L);
      return packItem(pack, { usage: a, mergeKey: pack.mergeKey });
    }

    if (L === "코코넛 밀크") {
      return packItem(PACK.coconut400, { usage: a });
    }

    if (L === "콜드브루 원액") {
      return packItem(PACK.coldBrew1L, { usage: a });
    }

    if (L === "꿀") {
      return packItem(PACK.honey500, { usage: a });
    }

    if (L === "바닐라 빈 파우더") {
      return packItem(PACK.vanillaBean100, { usage: a });
    }

    if (L === "곡물 파우더" || L === "미숫가루") {
      return packItem(powderPack("곡물 파우더"), { usage: a, mergeKey: "grain" });
    }

    if (L === "식혜") {
      return packItem(PACK.sikhye900, { usage: a || "-", mergeKey: "sikhye" });
    }

    if (/미초/.test(L)) {
      return packItem(PACK.micho500, { usage: a || "-", mergeKey: "micho" });
    }

    if (L === "쑥가루") {
      return packItem(powderPack("곡물 파우더"), { usage: a, mergeKey: "mugwort" });
    }

    if (L === "흑설탕 시럽") {
      return packItem(PACK.caramel500, { usage: a, mergeKey: "brownSugar" });
    }

    if (L === "밀크 파우더") {
      return packItem(PACK.condensed380, { usage: a, mergeKey: "milkPowder" });
    }

    if (L === "레몬즙" || L === "레몬 베이스" || (L.includes("레몬") && !L.includes("블루"))) {
      return packItem(PACK.lemonJuice200, { usage: a, mergeKey: "lemon" });
    }

    if (/파우더|베이스/.test(L)) {
      if (/녹차|말차|호지|그린/.test(L)) return packItem(PACK.matcha100, { usage: a, mergeKey: "matcha" });
      if (/초코|초콜|티라미수|레드벨벳|리얼/.test(L)) return packItem(PACK.cocoa500, { usage: a, mergeKey: "cocoa" });
      if (/요거트|플랜트|스무디/.test(L)) return packItem(PACK.yogurt400, { usage: a, mergeKey: "yogurt" });
      if (/토피/.test(L)) return packItem(PACK.toffeeStick20, { usage: a, mergeKey: "toffee" });
      if (/곡물/.test(L)) return packItem(powderPack("곡물 파우더"), { usage: a, mergeKey: "grain" });
      if (/고구마/.test(L)) return packItem(PACK.sweetPotato500, { usage: a, mergeKey: "sweetPotato" });
      if (/쿠키|오레오/.test(L)) return packItem(PACK.cookiePack, { usage: a, mergeKey: "cookie" });
      if (/타로/.test(L)) return packItem(powderPack("타로 파우더"), { usage: a, mergeKey: "taro" });
      return packItem(PACK.cocoa500, { usage: a, mergeKey: "cocoa" });
    }

    if (L === "초코 쿠키") {
      return packItem(PACK.cookiePack, { usage: a });
    }

    if (L === "초코 크런치") {
      return packItem(PACK.chocoCrunch250, { usage: a });
    }

    if (L === "포멜로") {
      return packItem(PACK.pomelo1, { usage: a });
    }

    if (L === "자몽청") {
      return packItem(PACK.pomeloJam1kg, { usage: a });
    }

    if (L.includes("소금") || L.includes("솔트")) {
      return packItem(PACK.salt100, { usage: a });
    }

    if (L === "땅콩버터") {
      return packItem(PACK.peanutButter500, { usage: a });
    }

    if (L === "땅콩") {
      return packItem(PACK.peanut200, { usage: a });
    }

    if (L === "견과류") {
      return packItem(PACK.nuts200, { usage: a });
    }

    if (L === "찰떡") {
      return packItem(PACK.ricecake400, { usage: a });
    }

    if (L === "콩가루") {
      return packItem(PACK.soyPowder200, { usage: a });
    }

    if (L === "토피넛 라떼 스틱") {
      return packItem(PACK.toffeeStick20, { usage: a });
    }

    if (L === "요거트 아이스크림") {
      return packItem(PACK.yogurtIce473, { usage: a });
    }

    if (/아이스크림|젤라또/.test(L)) {
      return packItem(PACK.icecream1L, { usage: a, mergeKey: "icecream" });
    }

    if (/자바칩/.test(L)) {
      return packItem(PACK.javaChip200, { usage: a, mergeKey: "javachip" });
    }

    if (L === "달고나") {
      return packItem(PACK.dalgonaKit, { usage: a });
    }

    if (L === "복숭아 아이스티 파우더") {
      return packItem(PACK.peachTea500, { usage: a });
    }

    if (/물|찬물|차가운 물|뜨거운 물|따뜻한 물/.test(L)) {
      return { buy: "물", priced: false, usage: a || "적당량" };
    }

    if (L === "레몬주스") {
      return packItem(PACK.lemonJuice200, { usage: a });
    }

    if (L === "포도 주스") {
      return packItem(PACK.grapeJuice1L, { usage: a, mergeKey: "grapeJuice" });
    }

    if (L === "청포도 주스") {
      return packItem(PACK.greenGrapeJuice500, { usage: a, mergeKey: "greenGrape" });
    }

    if (L === "복숭아 주스") {
      return packItem(PACK.peachJuice200, { usage: a, mergeKey: "peachJuice" });
    }

    if (L === "알로에") {
      return packItem(PACK.aloeDrink500, { usage: a, mergeKey: "aloe" });
    }

    if (L === "과일 젤리") {
      return packItem(PACK.fruitJellyCup, { usage: a, mergeKey: "fruitJelly" });
    }

    if (L === "디카페인 콜드브루 원액") {
      return packItem(PACK.decafColdBrew1L, { usage: a, mergeKey: "decafColdBrew" });
    }

    if (L === "유자차") {
      return packItem(PACK.yujaTea500, { usage: a, mergeKey: "yuja" });
    }

    if (L === "팥" || L === "팥앙금") {
      return packItem(PACK.redBean500, { usage: a, mergeKey: "redBean" });
    }

    if (L === "보라색 고구마 가루") {
      return packItem(PACK.purpleSweetPotato500, { usage: a, mergeKey: "ube" });
    }

    if (L === "콜라") {
      return packItem(PACK.cola355, { usage: a, mergeKey: "cola" });
    }

    if (L === "크랜베리·히비스커스 주스" || L.includes("크랜베리")) {
      return packItem(PACK.cranberryJuice1L, { usage: a, mergeKey: "cranberry" });
    }

    if (L === "사과 농축액") {
      return packItem(PACK.appleConcentrate500, { usage: a, mergeKey: "apple" });
    }

    if (L === "타로 가루") {
      const pack = powderPack("타로 파우더");
      return packItem(pack, { usage: a, mergeKey: pack.mergeKey });
    }

    if (L === "냉동 크랜베리") {
      return packItem(PACK.frozenCranberry200, { usage: a, mergeKey: "frozenCranberry" });
    }

    if (L === "라임" || L === "라임 시럽") {
      return packItem(PACK.limeJuice200, { usage: a, mergeKey: "lime" });
    }

    const fallbackBuy = itemBuyFallback(L, a);
    return {
      buy: fallbackBuy.buy,
      price: fallbackBuy.price,
      store: fallbackBuy.priced ? "쿠팡" : undefined,
      searchQuery: fallbackBuy.priced ? L : undefined,
      priced: fallbackBuy.priced,
      usage: a || "-",
    };
  }

  function itemBuyFallback(label, amount) {
    const g = parseUsageG(amount);
    if (g > 0 && g <= 100) {
      return { buy: `${label} 200g`, price: Math.max(1280, Math.round(g * 12)), priced: true };
    }
    return { buy: label, price: 0, priced: false };
  }

  function getHomeShoppingList(menu) {
    const raw = getHomeIngredients(menu);
    const groups = new Map();

    raw.forEach((item) => {
      const suggested = suggestHomeBuy(item.label, item.amount);
      const fromPack = portionCostFromPack(suggested, item.amount, item.label);
      const portionCost =
        item.label === "얼음" ? 0 : fromPack ?? getHomeIngredientPrice(item);
      const base = item.buy
        ? {
            buy: item.buy,
            price: suggested.price ?? portionCost,
            store: suggested.store,
            searchQuery: suggested.searchQuery,
            productUrl: suggested.productUrl,
            productName: suggested.productName,
            mallName: suggested.mallName,
            exampleProduct: suggested.exampleProduct,
            priced: isHomeIngredientPriced(item),
            usage: item.amount || "-",
            needMl: parseUsageMl(item.amount),
            portionCost,
          }
        : { ...suggested, portionCost };

      const mergeKey = base.mergeKey || base.buy;
      if (!groups.has(mergeKey)) {
        groups.set(mergeKey, {
          buy: base.buy,
          price: base.price,
          store: base.store,
          searchQuery: base.searchQuery,
          exampleProduct: base.exampleProduct,
          productUrl: base.productUrl,
          productName: base.productName,
          mallName: base.mallName,
          priced: base.priced,
          usages: [],
          portionCosts: [],
          needMl: 0,
        });
      }

      const group = groups.get(mergeKey);
      if (base.usage && base.usage !== "-") group.usages.push(base.usage);
      group.portionCosts.push(base.portionCost || 0);
      if (base.needMl) group.needMl += base.needMl;
    });

    return [...groups.values()].map((group) => {
      if (group.needMl > 0 && group.buy.startsWith("우유")) {
        applyPackFields(group, milkPack(group.needMl));
      }
      if (group.buy.includes("에스프레소 액상스틱")) {
        applyPackFields(group, PACK.espresso10);
      }
      group.usage = group.usages.length ? group.usages.join(" + ") : "-";
      group.portionPrice = group.portionCosts.reduce((sum, n) => sum + n, 0);
      delete group.usages;
      delete group.portionCosts;
      delete group.needMl;
      return group;
    });
  }

  function portionDisplay(label, amount) {
    if (!amount || amount === "-") return label;
    if (label.includes(amount)) return label;
    return `${label} ${amount}`;
  }

  function stepDisplayName(buy) {
    if (!buy) return buy;
    if (buy.startsWith("얼음")) return "얼음";
    const stripped = stripBuyPackSuffix(buy);
    return RECIPE_DISPLAY_NAMES[stripped] || RECIPE_DISPLAY_NAMES[buy] || stripped || buy;
  }

  /** 장보기 구매명에서 포장 단위만 제거 (레시피·1회 사용 표기용) */
  function stripBuyPackSuffix(buy) {
    if (!buy) return buy;
    let name = buy.replace(/\s*\([^)]+\)/g, "").trim();
    name = name
      .replace(/\s+\d+(?:\.\d+)?\s*(?:ml|L|g|kg|입|팩)(?=\s*$)/gi, "")
      .replace(/\s+\d+개(?=\s*$)/g, "")
      .trim();
    return name || buy;
  }

  function formatAmountNumber(n) {
    if (n == null || Number.isNaN(n)) return "";
    if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
    return String(Math.round(n * 10) / 10);
  }

  /** 장보기 buy 문자열에서 1회 사용 표기 단위 추출 */
  function getPackDisplaySpec(buy) {
    const t = buy || "";
    const packUnit = parsePackUnit(t);
    if (!packUnit) return null;
    if (/\d+\s*티백/.test(t) || /티백\s*\d+\s*입/.test(t)) {
      return { kind: "ea", unit: "티백", packAmount: packUnit.amount };
    }
    const canPack = t.match(/(\d+(?:\.\d+)?)\s*ml[^0-9]*(\d+)\s*입/i);
    if (canPack) {
      return { kind: "ml", unit: "ml", packAmount: parseFloat(canPack[1]) };
    }
    if (/\d+\s*입/.test(t)) return { kind: "ea", unit: "개입", packAmount: packUnit.amount };
    if (/\d+\s*봉/.test(t) && packUnit.kind === "ea") {
      return { kind: "ea", unit: "개입", packAmount: packUnit.amount };
    }
    if (packUnit.kind === "ml") return { kind: "ml", unit: "ml", packAmount: packUnit.amount };
    if (packUnit.kind === "g") return { kind: "g", unit: "g", packAmount: packUnit.amount };
    if (/\d+\s*개/.test(t) && packUnit.kind === "ea") {
      return { kind: "ea", unit: "개", packAmount: packUnit.amount };
    }
    return null;
  }

  function pumpMlPerUnit(label, buy) {
    if (/잼|청/.test(label || "") || /잼|청/.test(buy || "")) return 15;
    return 10;
  }

  function spoonGrams(label, buy, spoonKind) {
    if (/설탕/.test(label || "") || /설탕/.test(buy || "")) return spoonKind === "큰술" ? 15 : 5;
    if (/연유|코코아|파우더|가루|말차|녹차/.test(label || "") || /파우더|가루/.test(buy || "")) {
      return spoonKind === "큰술" ? 15 : 5;
    }
    if (/아이스크림|요거트|젤라/.test(label || "")) return spoonKind === "큰술" ? 15 : 5;
    return spoonKind === "큰술" ? 15 : 5;
  }

  /** 1회 사용량 — 장보기 목록(buy)에 표기된 팩 단위와 동일하게 환산 */
  function formatPortionAmountForPack(buy, rawAmount, label) {
    const text = String(rawAmount || "").trim();
    if (!text || text === "-") return text;
    if (!/[\d.]/.test(text) && /드리즐|토핑|적당|가득|슬라이스|분태|소량|약간|줄/.test(text)) {
      return text;
    }
    if (/슬라이스/.test(text) && /라임|레몬|오렌지|자몽/.test(`${label} ${buy}`)) {
      return text;
    }
    if (/반\s*개/.test(text) && /약과/.test(`${label} ${buy}`)) {
      return "20g";
    }
    if (text.includes(" + ")) {
      return text
        .split(" + ")
        .map((part) => formatPortionAmountForPack(buy, part.trim(), label))
        .join(" + ");
    }

    const range = text.match(/^([\d.]+)~([\d.]+)\s*(.+)$/);
    if (range) {
      const low = formatPortionAmountForPack(buy, `${range[1]}${range[3]}`, label);
      const high = formatPortionAmountForPack(buy, `${range[2]}${range[3]}`, label);
      const unit = low.replace(/^[\d.]+/, "");
      if (unit && high.endsWith(unit)) {
        return `${low.replace(unit, "")}~${high.replace(unit, "")}${unit}`;
      }
    }

    const spec = getPackDisplaySpec(buy);
    const usage = parseUsageUnit(text, label);
    if (!spec || !usage) return text;

    if (spec.unit === "개입") {
      if (usage.kind === "ea") return `${formatAmountNumber(usage.amount)}개입`;
      if (usage.kind === "g" && /토피넛|스틱/.test(`${label} ${buy}`)) {
        return `${Math.max(1, Math.round(usage.amount / 30))}개입`;
      }
    }

    if (spec.unit === "티백") {
      if (usage.kind === "ea") return `${formatAmountNumber(usage.amount)}티백`;
      if (usage.kind === "g") return `${formatAmountNumber(Math.max(1, Math.round(usage.amount / 25)))}티백`;
      if (usage.kind === "ml") {
        const bags = Math.max(1, Math.round(usage.amount / 120));
        return `${formatAmountNumber(bags)}티백`;
      }
    }

    if (spec.unit === "개" && usage.kind === "ea") {
      return `${formatAmountNumber(usage.amount)}개`;
    }

    if (spec.unit === "ml") {
      let ml = 0;
      if (usage.kind === "ml") ml = usage.amount;
      else if (usage.kind === "ea" && /펌프/.test(text)) {
        ml = usage.amount * pumpMlPerUnit(label, buy);
      } else if (usage.kind === "g" && /시럽|소스|청|잼/.test(`${label} ${buy}`)) {
        ml = usage.amount;
      } else if (/큰술/.test(text)) ml = usage.amount * 15;
      else if (/스푼/.test(text)) ml = usage.amount * 5;
      if (ml > 0) return `${formatAmountNumber(ml)}ml`;
    }

    if (spec.unit === "g") {
      let grams = 0;
      if (usage.kind === "g") grams = usage.amount;
      else if (usage.kind === "ml") {
        if (/오레오|쿠키/.test(`${label} ${buy}`) && /분량|오레오/.test(text)) {
          grams = usage.amount;
        } else {
          grams = usage.amount;
        }
      } else if (usage.kind === "ea") {
        if (/펌프/.test(text)) grams = usage.amount * pumpMlPerUnit(label, buy);
        else if (/큰술/.test(text)) grams = usage.amount * spoonGrams(label, buy, "큰술");
        else if (/스푼/.test(text)) grams = usage.amount * spoonGrams(label, buy, "스푼");
        else if (/개/.test(text) && /오레오|쿠키/.test(`${label} ${buy}`)) {
          grams = usage.amount * 15;
        } else if (/개/.test(text) && /마시멜로/.test(`${label} ${buy}`)) {
          grams = usage.amount * 5;
        }
      }
      if (grams > 0) return `${formatAmountNumber(grams)}g`;
    }

    return text;
  }

  /** 1회 사용 함량 문구 (만드는 방법·재료 요약) */
  function recipePortionPhrase(label, amount) {
    const name = stepDisplayName(stripBuyPackSuffix(label));
    const usage = formatPortionAmountForPack(label, amount, name);
    if (!usage || usage === "-") return name;
    if (name.includes(usage)) return name;
    return `${name} ${usage}`;
  }

  function isIcePortion(item) {
    const name = stepDisplayName(stripBuyPackSuffix(item.buy || item.label || ""));
    return name === "얼음" || (item.buy || item.label || "").startsWith("얼음");
  }

  /** 장보기 목록 기준 1회 사용 (구매명은 label, 재료명은 recipeName) */
  function getHomePortionList(menu) {
    return getHomeShoppingList(menu).map((item) => {
      const isIce = isIcePortion(item);
      const portionPrice = isIce ? 0 : item.portionPrice ?? 0;
      const recipeName = stepDisplayName(stripBuyPackSuffix(item.buy));
      const amount = formatPortionAmountForPack(item.buy, item.usage, recipeName);
      return {
        label: item.buy,
        recipeName,
        amount,
        display: portionDisplay(item.buy, amount),
        recipeDisplay: recipePortionPhrase(item.buy, amount),
        price: portionPrice,
        priced: !isIce && portionPrice > 0,
      };
    });
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function ensurePeriod(text) {
    const t = (text || "").trim();
    if (!t) return t;
    return /[.!?]$/.test(t) ? t : `${t}.`;
  }

  function friendlyHadaStep(text) {
    const fn = globalThis.toFriendlyHadaStep;
    return typeof fn === "function" ? fn(text) : ensurePeriod(text);
  }

  const MAX_RECIPE_STEPS = 10;

  function isActionStep(body) {
    const t = (body || "").trim();
    if (!t || t.startsWith("재료:")) return false;
    return true;
  }

  /** 만드는 방법 — 단계 수 상한만 적용 (병합하지 않음) */
  function limitRecipeSteps(steps, max = MAX_RECIPE_STEPS) {
    return (steps || [])
      .map((s) => ({
        title: s.title || "",
        body: ensurePeriod(s.body || ""),
      }))
      .filter((s) => s.body && s.body.length > 4)
      .slice(0, max);
  }

  /** 긴 단계 문장을 행동 단위로 분리 */
  function splitRecipeStepBody(text) {
    const t = (text || "").trim();
    if (!t) return [];

    const sentences = t
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 4);
    if (sentences.length > 1) {
      return sentences.flatMap((s) => splitRecipeStepBody(s));
    }

    const mixedThen = t.match(/^(.+?섞(?:어|은|인)?)\s+뒤\s+(.+)$/);
    if (mixedThen && mixedThen[2].length >= 6) {
      return [mixedThen[1].trim(), ...splitRecipeStepBody(mixedThen[2].trim())];
    }

    const addThenAct = t.match(/^(.+?)\s+넣고\s+(.+)$/);
    if (addThenAct) {
      const prep = addThenAct[1].trim();
      const action = addThenAct[2].trim();
      const openParens = (prep.match(/\(/g) || []).length;
      const closeParens = (prep.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        return [t];
      }
      const isFinishAction = /^(?:뚜껑|흔들|섞|저어|마무리|올려|드리즐|완성)|뚜껑|흔들|섞어|저어/.test(
        action
      );
      if (prep.length >= 8 && isFinishAction) {
        const addStep = /(?:을|를)$/.test(prep) ? `${prep} 넣는다` : `${prep}를 넣는다`;
        return [addStep, ...splitRecipeStepBody(action)];
      }
    }

    return [t];
  }

  function resolveAliasToBuy(alias, portions) {
    const labels = portions.map((p) => p.label);
    const hint = STEP_ALIASES[alias] || alias;
    const direct = labels.find((l) => l === hint || l.includes(hint) || hint.includes(l));
    if (direct) return direct;
    const buy = suggestHomeBuy(hint, "").buy;
    if (buy && labels.includes(buy)) return buy;
    return null;
  }

  /** 장보기 구매명 ↔ 레시피 단계 재료명 매핑 */
  function buildIngredientBuyMap(menu) {
    const map = new Map();
    const portions = getHomePortionList(menu);
    const homeItems = getHomeIngredients(menu);
    const homeLabels = new Set(homeItems.map((item) => item.label).filter(Boolean));

    homeItems.forEach((item) => {
      const buy = item.buy || suggestHomeBuy(item.label, item.amount).buy;
      if (!buy) return;
      const replaces = Array.isArray(item.replaces)
        ? item.replaces
        : typeof item.replaces === "string" && item.replaces
          ? [item.replaces]
          : [];
      [item.label].filter(Boolean).forEach((name) => map.set(name, buy));
      replaces.filter(Boolean).forEach((name) => {
        if (homeLabels.has(name)) return;
        map.set(name, buy);
      });
    });

    portions.forEach((p) => map.set(p.label, p.label));

    Object.keys(STEP_ALIASES).forEach((alias) => {
      const buy = resolveAliasToBuy(alias, portions);
      if (buy) map.set(alias, buy);
    });

    const waterBuy = portions.find((p) => p.label === "물" || p.label.startsWith("물"))?.label;
    if (waterBuy) {
      ["뜨거운 물", "정수", "온수", "차가운 물", "얼음물"].forEach((w) => map.set(w, waterBuy));
    }

    return map;
  }

  function recipeStepName(buy) {
    return stripBuyPackSuffix(stepDisplayName(buy)) || stepDisplayName(buy);
  }

  function applyBuyMapToText(text, buyMap) {
    let t = text || "";
    const entries = [...buyMap.entries()]
      .map(([from, to]) => ({ from, to: recipeStepName(to) }))
      .filter((e) => e.from && e.to && e.from !== e.to)
      .sort((a, b) => b.from.length - a.from.length);

    entries.forEach(({ from, to }) => {
      const longer = entries.filter((e) => e.from.length > from.length && e.from.startsWith(from));
      const re =
        from.length <= 2
          ? new RegExp(`(?<![가-힣A-Za-z0-9])${escapeRegExp(from)}(?![가-힣A-Za-z0-9])`, "g")
          : new RegExp(escapeRegExp(from), "g");
      t = t.replace(re, (match, offset, str) => {
        const at = str.slice(offset);
        if (longer.some((e) => at.startsWith(e.from))) return match;
        const rest = str.slice(offset + match.length);
        if (
          longer.some((e) => {
            const tail = e.from.slice(from.length).split(/\d/)[0];
            return tail && rest.startsWith(tail);
          })
        ) {
          return match;
        }
        if (to.includes(match) && str.includes(to)) return match;
        return to;
      });
    });
    return t.replace(/\s{2,}/g, " ").trim();
  }

  const PORTION_AMOUNT_SUFFIX =
    "(?:\\s+(?:약\\s+)?[\\d.]+\\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔)|\\s+적당량)";

  function cleanupRedundantAlternatives(text) {
    return (text || "").replace(
      /([가-힣·\s]+?)(\s+(?:약\s+)?[\d.]+\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|캔))?\(또는\s+\1\2?\)/g,
      "$1$2"
    );
  }

  function dedupeRepeatedAmounts(text) {
    return (text || "")
      .replace(
        /([\d.]+(?:개|ml|L|g|kg|펌프|컵|입|팩|큰술|스푼|캔)|적당량)\s+(?:약\s+)?\1\b/g,
        "$1"
      )
      .replace(
        /((?:약\s+)?[\d.]+(?:개|ml|L|g|kg|펌프|컵|입|팩|큰술|스푼|캔))\s+\1\b/g,
        "$1"
      );
  }

  function cleanupOrphanPackHints(text) {
    return (text || "")
      .replace(/\s*\(PB·갓밀크\)/g, "")
      .replace(/\s*\(1팩\)/g, "");
  }

  function packAmountTokens(buy) {
    return (buy.match(/\d+(?:\.\d+)?\s*(?:ml|L|g|kg|입|팩|개)/gi) || []).map((s) =>
      s.replace(/\s+/g, "")
    );
  }

  function isPackAmountMatch(match, buy) {
    const normalized = (match || "").replace(/\s+/g, "");
    return packAmountTokens(buy).some((token) => normalized.includes(token));
  }

  function removePhraseOrphanTails(text, portions) {
    let t = text || "";
    portions.forEach((p) => {
      const phrase = p.recipeDisplay || recipePortionPhrase(p.label, p.amount);
      const base = stripBuyPackSuffix(p.label);
      if (!phrase || !base || phrase === base) return;
      if (!t.includes(phrase)) return;
      const tailWords = base.split(/\s+/).slice(1).map((w) => escapeRegExp(w));
      if (!tailWords.length) return;
      let pattern = `(${escapeRegExp(phrase)})\\s+(?:${escapeRegExp(base)}\\s*)?`;
      pattern += `(?:${tailWords.map((w) => `${w}\\s*`).join("|")})?`;
      pattern += `(?:약\\s+)?[\\d.]+\\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|캔)`;
      t = t.replace(new RegExp(pattern, "g"), "$1");
    });
    return t;
  }

  /** 구매명을 1회 사용 함량 문구로 치환 */
  function applyPortionPhrasesToText(text, portions) {
    let t = text || "";
    const entries = portions
      .map((p) => ({
        from: p.label,
        base: stripBuyPackSuffix(p.label),
        phrase: p.recipeDisplay || recipePortionPhrase(p.label, p.amount),
      }))
      .filter((e) => e.from && e.phrase)
      .sort((a, b) => b.from.length - a.from.length);

    entries.forEach(({ from, base, phrase }) => {
      const fullSuffix = from.length > 3 ? `${PORTION_AMOUNT_SUFFIX}?` : PORTION_AMOUNT_SUFFIX;
      const fullRe = new RegExp(escapeRegExp(from) + fullSuffix, "g");
      t = t.replace(fullRe, phrase);

      if (base && base !== from && base !== phrase) {
        const baseRe = new RegExp(
          `(?<![가-힣A-Za-z0-9])${escapeRegExp(base)}${PORTION_AMOUNT_SUFFIX}`,
          "g"
        );
        t = t.replace(baseRe, (match) => {
          if (isPackAmountMatch(match, from)) return match;
          if (phrase && (match.includes(phrase) || phrase.includes(match.trim()))) return match;
          return phrase;
        });
      }
    });

    t = removePhraseOrphanTails(t, portions);
    return cleanupOrphanPackHints(
      cleanupRedundantAlternatives(dedupeRepeatedAmounts(t))
    ).replace(/\s{2,}/g, " ").trim();
  }

  /** 장보기·1회 사용에 있는 재료명만 허용 */
  function normalizeIngredientKey(value) {
    return (value || "").replace(/\s+/g, "").toLowerCase();
  }

  function buildAllowedRecipeIngredients(menu, portions) {
    const names = new Set();
    const add = (value) => {
      if (!value) return;
      const v = String(value).trim();
      if (v) {
        names.add(v);
        names.add(normalizeIngredientKey(v));
      }
    };

    portions.forEach((p) => {
      add(p.label);
      add(stripBuyPackSuffix(p.label));
      add(p.recipeName);
      add(p.recipeDisplay);
    });

    Object.keys(STEP_ALIASES).forEach((alias) => {
      if (resolveAliasToBuy(alias, portions)) add(alias);
    });

    const hasWater = portions.some((p) => {
      const base = stripBuyPackSuffix(p.label);
      return base === "물" || base === "뜨거운 물" || p.label.startsWith("물");
    });
    if (hasWater) ["물", "뜨거운 물", "정수", "온수", "차가운 물", "얼음물"].forEach(add);
    else ["물", "뜨거운 물"].forEach(add);

    const labels = portions.map((p) => stripBuyPackSuffix(p.label));
    if (labels.some((l) => /에스프레소/.test(l))) {
      ["에스프레소", "에스프레소 액상스틱", "커피 베이스"].forEach(add);
    }
    if (labels.some((l) => /사이다|콜라|탄산/.test(l))) {
      ["사이다", "콜라", "탄산수"].forEach(add);
    }
    if (labels.some((l) => /자몽/.test(l))) {
      add("자몽 슬라이스");
      add("애플민트");
    }
    if (labels.some((l) => /라임/.test(l))) {
      add("라임 슬라이스");
      add("애플민트");
    }
    if (labels.some((l) => /(?:홍차|녹차|티백|허브티|얼그레이|우롱)/.test(l))) {
      ["우려낸 홍차", "우려낸 차", "홍차", "블랙티"].forEach(add);
    }
    if (labels.some((l) => /(?:코코아|초코)/.test(l))) {
      ["초코 베이스", "초코베이스"].forEach(add);
    }
    if (labels.some((l) => /휘핑/.test(l))) {
      ["휘핑", "휘핑크림"].forEach(add);
    }
    if (labels.some((l) => /시럽/.test(l))) {
      add("드리즐");
    }
    if (
      labels.some((l) => /우유/.test(l)) &&
      labels.some((l) => /휘핑/.test(l)) &&
      labels.some((l) => /바닐라\s*시럽/.test(l))
    ) {
      add("바닐라 크림");
    }

    return names;
  }

  const INGREDIENT_AMOUNT =
    /(\d+(?:\.\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔)|적당량|약\s+\d+(?:\.\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔))/;

  const NON_INGREDIENT = new Set([
    "숟가락",
    "포크",
    "뚜껑",
    "페트병",
    "컵",
    "재료",
    "토핑",
    "상기선",
    "가볍게",
    "세게",
    "식혀서",
    "뚜껑 있는 컵",
    "뚜껑 있는 컵이나 빈 페트병",
    "빈 페트병",
  ]);

  function cleanMentionName(name) {
    let n = (name || "")
      .trim()
      .replace(/(?:을|를|과|와|의|에)\s*$/, "")
      .replace(/^(?:을|를|과|와|의|에)\s+/, "")
      .replace(
        /^(?:토핑:|컵에|뚜껑\s*있는\s*컵(?:이나\s*빈\s*페트병)?(?:에)?|껑\s*있는\s*컵(?:이나\s*빈\s*페트병)?(?:에)?|페트병(?:에)?|그리고|나머지|위에|에)\s*/g,
        ""
      )
      .trim();

    const afterVerb = n.split(/(?:넣고|붓고|넣어|부어|채우고|섞고|저어|풀어|만들고|채운)\s+/).pop();
    n = (afterVerb || n).trim();

    const afterParticle = n.split(/(?:을|를|과|와|에)\s+/).pop();
    return (afterParticle || n).trim();
  }

  function syncStepTextToPortions(text, portions) {
    let t = text || "";
    const recipeNames = new Set(portions.map((p) => p.recipeName).filter(Boolean));
    const has = (name) => recipeNames.has(name);

    if (has("설탕시럽")) {
      t = t
        .replace(/설탕\s*\(또는\s*꿀\)\s*1?~?2?큰술?/g, "설탕시럽 2~3펌프")
        .replace(/설탕\s*1큰술/g, "설탕시럽 1~2펌프")
        .replace(/설탕\s*1~2큰술/g, "설탕시럽 2~3펌프")
        .replace(/모히또·라임\s*(?:즙\s*)?(?:설탕)?시럽/g, "설탕시럽");
    }
    if (has("플레인 요거트")) {
      t = t.replace(/플랜트(?:\(또는\s*요거트\))?\s*파우더/g, "플레인 요거트");
    }
    if (has("자몽청")) {
      t = t.replace(/자몽·오렌지[^.,·]*/g, "자몽청");
      t = t.replace(/오렌지칩/g, "자몽청");
    }
    if (has("블루 레몬 시럽")) {
      t = t.replace(/블루큐라소\s*시럽/g, "블루 레몬 시럽");
      t = t.replace(/민트초코\s*파우더/g, "블루 레몬 시럽");
    }
    if (has("초코 크런치 시리얼")) {
      t = t.replace(/초코칩/g, "초코 크런치 시리얼");
    }
    if (has("바닐라 시럽")) {
      t = t.replace(/바닐라\s*파우더/g, "바닐라 시럽");
    }
    if (has("딸기잼")) {
      t = t.replace(/쥬얼리/g, "딸기잼");
    }
    if (has("오레오")) {
      t = t.replace(/코코아\+베이킹파우더\s*믹스/g, "오레오");
    }
    if (has("복숭아 주스")) {
      t = t.replace(/복숭아\s*소스/g, "복숭아 주스");
    }
    if (has("토피넛 라떼 스틱")) {
      const stickAmt =
        portions.find((p) => p.recipeName === "토피넛 라떼 스틱")?.amount || "1개입";
      t = t
        .replace(/토피넛\s*파우더\s*[\d.]+\s*(?:큰술|g|그램)/g, `토피넛 라떼 스틱 ${stickAmt}`)
        .replace(/토피넛\s*라떼\s*스틱\s*1개\b/g, `토피넛 라떼 스틱 ${stickAmt}`);
    }
    if (has("사이다") && has("자스민 티백") && !/사이다/.test(t)) {
      t = t.replace(/(뚜껑\s*닫고\s*흔든다)\./, "뚜껑 닫고 흔든 뒤 사이다 150ml를 넣는다.");
    }
    if (has("물") && has("콜드브루 원액") && !/물/.test(t)) {
      t = t.replace(/컵에\s+얼음을,\s*/, "컵에 얼음을, 물을, ");
    }
    if (has("설탕시럽") && /바닐라\s*카페라떼|바닐라\s*시럽를/.test(t) && !/설탕시럽/.test(t)) {
      t = t.replace(/컵에/, "컵에 설탕시럽 2~3펌프,");
    }
    if (
      has("설탕시럽") &&
      has("녹차 티백") &&
      has("레몬즙") &&
      !/설탕시럽/.test(t)
    ) {
      t = t.replace(/^/, "설탕시럽 2~3펌프, ");
    }
    if (has("얼음") && has("딸기잼") && !/얼음/.test(t)) {
      t = `${t.replace(/\.$/, "")}. 얼음을 넣는다.`;
    }
    if (has("물") && /제주그린|그린티 베이스/.test(t) && !/물\s*\d/.test(t)) {
      t = t.replace(/(그린티 베이스에)/, "물 20ml에");
    }
    return t.replace(/\s{2,}/g, " ").trim();
  }

  function expandSharedAmountPhrases(text) {
    return (text || "").replace(
      /([가-힣][가-힣·\s/]{1,40}?)\s+각\s+((?:약\s+)?[\d.]+\s*(?:펌프|큰술|스푼|ml|L|g|kg|개|입|샷|캔))/g,
      (_, names, amount) =>
        names
          .split(/·/)
          .map((n) => n.trim())
          .filter((n) => n.length >= 1)
          .map((n) => `${n} ${amount}`)
          .join(", ")
    );
  }

  function mentionPartNames(name) {
    return (name || "")
      .split(/·/)
      .map((p) => cleanMentionName(p))
      .filter((p) => p.length >= 2);
  }

  function mentionIncludesListed(name, allowed) {
    const parts = mentionPartNames(name);
    if (!parts.length) return isListedIngredient(name, allowed);
    return parts.some((p) => isListedIngredient(p, allowed));
  }

  function stripBareUnlistedIngredientNames(text, allowed) {
    let t = text || "";
    const prep = t.match(/^(컵(?:\s+바닥)?에[^.]*?)(?=(?:넣고|붓고|섞고|저어|우려|풀어|만들))/);
    if (!prep) return t;

    let head = prep[1];
    const tail = t.slice(head.length);
    head = head.replace(
      /([가-힣][가-힣·\s]{0,20}?)(을|를)(?=\s*(?:[,·+]|$))/g,
      (full, name, particle) => {
        const n = cleanMentionName(name);
        if (!n || n.length < 2 || NON_INGREDIENT.has(n)) return full;
        if (mentionIncludesListed(n, allowed)) return full;
        return "";
      }
    );
    return (head + tail)
      .replace(/컵(?:\s+바닥)?에\s*(?:[,·+]\s*)+/g, (m) => m.replace(/[,·+]\s*$/, " "))
      .replace(/,\s*,+/g, ",")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function stripUnlistedIngredientPhrases(text, allowed) {
    let t = text || "";
    const mentions = extractIngredientMentions(t, allowed)
      .filter((m) => !/(?:넣고|붓고|넣어|부어|채우|섞|저어|만든|위에)$/.test(m.name))
      .filter((m) => !mentionIncludesListed(m.name, allowed));
    mentions
      .sort((a, b) => b.index - a.index)
      .forEach(({ name, amount }) => {
        if (!name || !amount) return;
        const pattern = new RegExp(
          `(?:^|[\\s,·+])${escapeRegExp(name)}\\s*${escapeRegExp(amount)}(?:을|를|과|와|에)?\\s*`,
          "g"
        );
        t = t.replace(pattern, " ");
        const barePattern = new RegExp(
          `${escapeRegExp(name)}\\s*${escapeRegExp(amount)}(?:을|를|과|와|에)?\\s*`,
          "g"
        );
        t = t.replace(barePattern, " ");
      });
    return t
      .replace(/\s+(?:에|을|를|과|와)\s+(?=3분|우려|풀어|녹)/g, " ")
      .replace(/,\s*에\s*,/g, ", ")
      .replace(/컵에\s*,\s*/g, "컵에 ")
      .replace(/,\s*,/g, ",")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function resolveMentionName(raw, allowed) {
    const n = cleanMentionName(raw);
    if (!n || !allowed?.size) return n;
    for (const a of allowed) {
      if (ingredientNamesMatch(n, a)) return n;
    }
    return n
      .split(/(?:을|를|과|와|에)\s+/)
      .pop()
      .trim()
      .replace(/\s+(?:넣고|붓고|넣어|부어|채우고|섞고)$/g, "")
      .trim();
  }

  function extractIngredientMentions(text, allowed) {
    const mentions = [];
    const re = new RegExp(
      `([가-힣A-Za-z][가-힣A-Za-z0-9·\\s]{0,24}?)\\s*${INGREDIENT_AMOUNT.source}`,
      "g"
    );
    let match;
    while ((match = re.exec(text || ""))) {
      const raw = cleanMentionName(match[1]);
      const name = resolveMentionName(raw, allowed);
      mentions.push({ name, amount: match[2], index: match.index });
    }
    return mentions.filter(
      (m) => m.name && m.name.length >= 2 && !/(?:한다|준다|넣는다|붓는다)$/.test(m.name)
    );
  }

  function stripAmountFromPhrase(value) {
    return normalizeIngredientKey(value).replace(
      /(?:약)?\d+(?:\.\d+)?(?:ml|l|g|kg|개|펌프|큰술|스푼|캔|컵|입|팩|샷)|적당량|소량|약간|가득|상기선/g,
      ""
    );
  }

  function ingredientNamesMatch(mention, allowedName) {
    const n = stripAmountFromPhrase(mention);
    const a = stripAmountFromPhrase(allowedName);
    if (n.length < 2 || a.length < 2) return false;
    if (n === a) return true;
    return n.includes(a) || a.includes(n);
  }

  function isListedIngredient(name, allowed) {
    const n = cleanMentionName(name);
    if (!n || n.length < 2) return true;
    if (NON_INGREDIENT.has(n)) return true;

    for (const allowedName of allowed) {
      if (ingredientNamesMatch(n, allowedName)) return true;
    }

    const aliasHint = STEP_ALIASES[n];
    if (aliasHint) {
      for (const allowedName of allowed) {
        if (ingredientNamesMatch(aliasHint, allowedName)) return true;
      }
    }

    for (const [alias, hint] of Object.entries(STEP_ALIASES)) {
      if (!ingredientNamesMatch(n, alias)) continue;
      for (const allowedName of allowed) {
        if (ingredientNamesMatch(hint, allowedName)) return true;
      }
    }

    return false;
  }

  function stripUnlistedFinishToppings(text, allowed) {
    return (text || "").replace(
      /([가-힣][가-힣·\s/]{0,20}?)(?:을|를)?\s*(?:로\s+)?마무리(?:해준다|한다)?\.?/g,
      (full, items) => {
        const parts = items
          .split(/\s*(?:,|·|\+)\s*/)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length <= 1) return full;
        const kept = parts.filter((p) => mentionIncludesListed(p, allowed));
        if (!kept.length) return "";
        if (kept.length === parts.length) return full;
        const joined = kept.join(", ");
        const particle = /[aeiouAEIOUㅏ-ㅣ]$/.test(joined.slice(-1)) ? "를" : "을";
        return `${joined}${particle} 올려 마무리한다.`;
      }
    );
  }

  function cleanupUnlistedWaterPhrases(text, allowed) {
    const hasWater = [...allowed].some((a) => {
      const base = stripAmountFromPhrase(a);
      return base === "물" || base === "뜨거운물";
    });
    if (hasWater) return text || "";
    return (text || "")
      .replace(/(?:,\s*)?(?:소량|약간)?\s*뜨거운\s*물(?:\s*\d+(?:ml|L)?)?(?:로|에|을|를)?/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function segmentHasUnlistedIngredient(segment, allowed) {
    const mentions = extractIngredientMentions(segment, allowed);
    if (!mentions.length) return false;
    return mentions.every((m) => !mentionIncludesListed(m.name, allowed));
  }

  function filterSegmentList(clause, allowed) {
    // 쉼표(,)는 재료 나열용 — 잘라내면 '프림·물' 등이 빠지는 오류가 남
    const parts = clause.split(/\s*(?:·|\+)\s*/);
    if (parts.length <= 1) return clause;
    // 휘핑·드리즐 같은 토핑 나열은 분리하지 않음
    const withAmount = parts.filter((p) => INGREDIENT_AMOUNT.test(p));
    if (withAmount.length < 2) return clause;

    const kept = parts.filter((part) => !segmentHasUnlistedIngredient(part, allowed));
    if (!kept.length) return "";
    return kept.join(" · ");
  }

  /** 장보기·1회 사용에 없는 재료 언급 제거 */
  function restrictStepToListedIngredients(text, menu, portions) {
    const allowed = buildAllowedRecipeIngredients(menu, portions);
    let t = (text || "").trim();
    if (!t) return "";

    if (/^토핑\s*:/.test(t)) {
      const body = t.replace(/^토핑\s*:\s*/, "").replace(/\s*(?:한다|준다)\.?$/, "");
      const mentions = extractIngredientMentions(body, allowed);
      if (mentions.length && mentions.every((m) => !isListedIngredient(m.name, allowed))) return "";
      if (!mentions.length && body && !isListedIngredient(body, allowed)) return "";
    }

    const clauses = t.split(/(?<=[.!])\s+/).filter(Boolean);
    const kept = clauses
      .map((clause) => {
        let         c = expandSharedAmountPhrases(clause);
        c = filterSegmentList(c, allowed);
        c = stripBareUnlistedIngredientNames(c, allowed);
        c = stripUnlistedIngredientPhrases(c, allowed);
        c = stripUnlistedFinishToppings(c, allowed);
        const mentions = extractIngredientMentions(c, allowed);
        if (!mentions.length) return c;
        if (mentions.every((m) => mentionIncludesListed(m.name, allowed))) return c;
        if (mentions.every((m) => !mentionIncludesListed(m.name, allowed))) return "";
        c = stripUnlistedIngredientPhrases(c, allowed);
        const left = extractIngredientMentions(c, allowed);
        if (left.some((m) => !mentionIncludesListed(m.name, allowed))) return c;
        return c;
      })
      .filter(Boolean);

    return cleanupUnlistedWaterPhrases(
      kept.join(" ").replace(/\s{2,}/g, " ").trim(),
      allowed
    );
  }

  function stepReferencesListedIngredient(text, portions, allowed) {
    const t = (text || "").trim();
    if (!t) return false;

    const mentions = extractIngredientMentions(t, allowed);
    if (mentions.length) {
      return mentions.some((m) => mentionIncludesListed(m.name, allowed));
    }

    const normalized = normalizeIngredientKey(t);
    if (
      portions.some((p) => {
        const base = stripAmountFromPhrase(p.recipeName || stripBuyPackSuffix(p.label));
        return base.length >= 2 && normalized.includes(base);
      })
    ) {
      return true;
    }

    return /(?:저어|섞|흔들|채우|완성|마무리|데우|옮|준다|채운)/.test(t);
  }

  function isNearDuplicateStep(next, prev) {
    const a = (next || "").replace(/\s/g, "");
    const b = (prev || "").replace(/\s/g, "");
    if (!a || !b) return false;
    if (a === b || b.includes(a) || a.includes(b)) return true;
    return /올린다|올려\s*마무리/.test(next) && /올린다|올려\s*마무리/.test(prev);
  }

  /** 만드는 방법 — 행동만 (재료는 1회 사용·요약에 표시) */
  function getRecipeStepsFromShopping(menu) {
    const portions = getHomePortionList(menu).filter((p) => p.amount && p.amount !== "-");
    const buyMap = buildIngredientBuyMap(menu);

    const steps = [];

    const manual = (menu.recipe?.steps || [])
      .filter((s) => !/^매장/.test(s.title || "") && s.title !== "토핑")
      .map((s) => s.body || "")
      .filter(Boolean);

    manual.forEach((body) => {
      splitRecipeStepBody(body).forEach((chunk) => {
        let aligned = expandSharedAmountPhrases(chunk);
        aligned = syncStepTextToPortions(aligned, portions);
        aligned = applyBuyMapToText(aligned, buyMap);
        aligned = applyPortionPhrasesToText(aligned, portions);
        aligned = restrictStepToListedIngredients(aligned, menu, portions);
        aligned = cleanupRecipeStepText(aligned);
        if (/^토핑\s*:/.test(aligned.trim())) {
          aligned = normalizeToppingStep(aligned);
        }
        if (aligned.trim().length > 6 && isActionStep(aligned)) {
          const styled = friendlyHadaStep(aligned);
          const prev = steps[steps.length - 1]?.body || "";
          if (styled && !isNearDuplicateStep(styled, prev)) {
            steps.push({ title: "", body: styled });
          }
        }
      });
    });

    if (steps.length === 0) {
      steps.push({
        title: "",
        body: friendlyHadaStep("컵에 재료를 넣고 숟가락으로 섞거나, 뚜껑 닫고 30초~1분 흔들어 완성한다."),
      });
    }

    return limitRecipeSteps(steps);
  }

  /** @deprecated getRecipeStepsFromShopping 사용 */
  function alignRecipeStepsToShopping(menu) {
    return getRecipeStepsFromShopping(menu);
  }

  function getHomeShoppingPrice(menu) {
    return getHomeShoppingList(menu).reduce((sum, item) => sum + (item.priced ? item.price : 0), 0);
  }

  globalThis.suggestHomeBuy = suggestHomeBuy;
  globalThis.getHomeShoppingList = getHomeShoppingList;
  globalThis.getHomePortionList = getHomePortionList;
  globalThis.getRecipeStepsFromShopping = getRecipeStepsFromShopping;
  globalThis.restrictStepToListedIngredients = restrictStepToListedIngredients;
  globalThis.alignRecipeStepsToShopping = alignRecipeStepsToShopping;
  globalThis.getHomeShoppingPrice = getHomeShoppingPrice;

  if (typeof MENUS !== "undefined" && typeof getHomePrice === "function") {
    for (let i = MENUS.length - 1; i >= 0; i--) {
      const menu = MENUS[i];
      if (menu.recipeReady && menu.price && getHomePrice(menu) >= menu.price) {
        MENUS.splice(i, 1);
      }
    }
  }
})();
