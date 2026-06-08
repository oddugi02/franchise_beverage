// 장보기 목록 — shopping-packs.js 검증 카탈로그 기준 (마트별 검색 인기순 1위 가격)
// 가격 갱신 후: node scripts/audit-shopping-packs.js · node scripts/audit-online-prices.js
(function () {
  const PACK = SHOPPING_PACK_CATALOG;

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
    "블루큐라소 시럽": "블루 레몬 시럽",
    탄산수: "사이다",
    "고구마 페이스트": "고구마",
  };

  const RECIPE_DISPLAY_NAMES = {
    건타피오카: "타피오카 펄",
    "휘핑크림 스프레이": "휘핑크림",
    "바닐라 아이스크림": "바닐라 아이스크림",
  };

  function cleanupRecipeStepText(text) {
    return (text || "")
      .replace(/건타피오카을/g, "타피오카 펄을")
      .replace(/건타피오카를/g, "타피오카 펄을")
      .replace(/건타피오카(?=\s|,|$|과|와|을|를)/g, "타피오카 펄")
      .replace(/페트병로/g, "페트병으로")
      .replace(/요거트을/g, "요거트를")
      .replace(/넣고한다/g, "넣고 완성한다")
      .replace(/(\d+(?:\.\d+)?(?:ml|g|kg|국자|스푼|큰술|바퀴|스쿱|컵|개|펌프|입|팩|캔))\s*과\s+/g, "$1와 ")
      .replace(/(스프레이|폼|펄|크럼|시럽|슬라이스|시리얼)\s*과\s+/g, "$1와 ")
      .replace(/시리얼를/g, "시리얼을")
      .replace(/\b([가-힣A-Za-z·]{2,})\s+\1\b/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function normalizeToppingStep(text) {
    const m = (text || "").trim().match(/^토핑\s*:\s*(.+)$/);
    if (!m) return text;
    const item = m[1].replace(/\s*(?:한다|준다)\.?$/, "").trim();
    if (!item) return "";
    const endsVowel = /[aeiouAEIOUㅏ-ㅣ]$/.test(item.slice(-1));
    const particle = endsVowel ? "를" : "을";
    return `${item}${particle} 올려 마무리한다.`;
  }

  const POWDER_BUY = Object.fromEntries(
    Object.entries(SHOPPING_POWDER_CATALOG).map(([label, pack]) => [
      label,
      { ...pack, mergeKey: `powder:${label}` },
    ])
  );

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

  function packItem(pack, extra = {}) {
    return {
      buy: pack.buy,
      price: pack.price,
      store: pack.store,
      searchQuery: pack.searchQuery,
      exampleProduct: pack.exampleProduct,
      priced: true,
      usage: "-",
      ...extra,
    };
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

  function suggestHomeBuy(label, amount) {
    const L = label;
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
      return packItem(PACK.coffeeStick10, { usage: a });
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

    if (L === "초코 시럽" || L === "초코소스") {
      return packItem(PACK.caramel500, { usage: a, mergeKey: "chocoSyrup" });
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

    if (L === "티백" || L === "홍차 티백" || L === "홍차" || L === "진한 홍차") {
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
      return { buy: "식혜 900ml", price: 2980, store: "이마트", searchQuery: "식혜", priced: true, usage: a || "-" };
    }

    if (/미초/.test(L)) {
      return { buy: "미초 500ml", price: 3480, store: "쿠팡", searchQuery: "미초", priced: true, usage: a || "-" };
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
      const portionCost = getHomeIngredientPrice(item);
      const base = item.buy
        ? {
            buy: item.buy,
            price: portionCost,
            priced: isHomeIngredientPriced(item),
            usage: item.amount || "-",
            needMl: parseUsageMl(item.amount),
            portionCost,
          }
        : { ...suggestHomeBuy(item.label, item.amount), portionCost };

      const mergeKey = base.mergeKey || base.buy;
      if (!groups.has(mergeKey)) {
        groups.set(mergeKey, {
          buy: base.buy,
          price: base.price,
          store: base.store,
          searchQuery: base.searchQuery,
          exampleProduct: base.exampleProduct,
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
        const pack = milkPack(group.needMl);
        group.buy = pack.buy;
        group.price = pack.price;
        group.store = pack.store;
        group.searchQuery = pack.searchQuery;
        group.exampleProduct = pack.exampleProduct;
      }
      if (group.buy.includes("에스프레소 액상스틱")) {
        const pack = PACK.espresso10;
        group.buy = pack.buy;
        group.price = pack.price;
        group.store = pack.store;
        group.searchQuery = pack.searchQuery;
        group.exampleProduct = pack.exampleProduct;
        group.priced = true;
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

  /** 1회 사용 함량 문구 (만드는 방법·재료 요약) */
  function recipePortionPhrase(label, amount) {
    const name = stripBuyPackSuffix(label);
    if (!amount || amount === "-") return stepDisplayName(name);
    if (name.includes(amount)) return name;
    return `${name} ${amount}`;
  }

  /** 장보기 목록 기준 1회 사용 (구매명은 label, 재료명은 recipeName) */
  function getHomePortionList(menu) {
    return getHomeShoppingList(menu).map((item) => ({
      label: item.buy,
      recipeName: stepDisplayName(stripBuyPackSuffix(item.buy)),
      amount: item.usage,
      display: portionDisplay(item.buy, item.usage),
      recipeDisplay: recipePortionPhrase(item.buy, item.usage),
      price: item.portionPrice ?? 0,
      priced: item.priced && (item.portionPrice ?? 0) > 0,
    }));
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

  const MAX_RECIPE_STEPS = 5;

  function isActionStep(body) {
    const t = (body || "").trim();
    if (!t || t.startsWith("재료:")) return false;
    return true;
  }

  /** 만드는 방법 — 행동 단계만, 최대 5단계 */
  function limitRecipeSteps(steps, max = MAX_RECIPE_STEPS) {
    if (!steps?.length || steps.length <= max) return steps;

    const result = steps.map((s) => ({
      title: s.title || "",
      body: ensurePeriod(s.body || ""),
    }));

    while (result.length > max) {
      let idx = 0;
      if (idx >= result.length - 1) idx = Math.max(0, result.length - 2);
      const a = result[idx].body.replace(/[.!?]$/, "");
      const b = result[idx + 1].body;
      result[idx] = { title: result[idx].title, body: ensurePeriod(`${a} ${b}`.trim()) };
      result.splice(idx + 1, 1);
    }
    return result;
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
      const tailWords = base.split(/\s+/).slice(1).map((w) => escapeRegExp(w));
      let pattern = `(${escapeRegExp(phrase)})\\s+(?:${escapeRegExp(base)}\\s*)?`;
      if (tailWords.length) {
        pattern += `(?:${tailWords.map((w) => `${w}\\s*`).join("|")})?`;
      }
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

    const afterParticle = n.split(/(?:을|를|과|와|에)\s+/).pop();
    return (afterParticle || n).trim();
  }

  function stripUnlistedIngredientPhrases(text, allowed) {
    let t = text || "";
    const mentions = extractIngredientMentions(t, allowed).filter((m) => !isListedIngredient(m.name, allowed));
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
    return n.length >= 2 && a.length >= 2 && n === a;
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
    return mentions.some((m) => !isListedIngredient(m.name, allowed));
  }

  function filterSegmentList(clause, allowed) {
    const parts = clause.split(/\s*[,·+]\s*/);
    if (parts.length <= 1) return clause;

    const kept = parts.filter((part) => !segmentHasUnlistedIngredient(part, allowed));
    if (!kept.length) return "";
    return kept.join(", ");
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
        let c = filterSegmentList(clause, allowed);
        c = stripUnlistedIngredientPhrases(c, allowed);
        const mentions = extractIngredientMentions(c, allowed);
        if (!mentions.length) return c;
        if (mentions.every((m) => isListedIngredient(m.name, allowed))) return c;
        if (mentions.every((m) => !isListedIngredient(m.name, allowed))) return "";
        c = stripUnlistedIngredientPhrases(c, allowed);
        const left = extractIngredientMentions(c, allowed);
        if (left.some((m) => !isListedIngredient(m.name, allowed))) return "";
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
      return mentions.some((m) => isListedIngredient(m.name, allowed));
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
      let aligned = applyBuyMapToText(body, buyMap);
      aligned = applyPortionPhrasesToText(aligned, portions);
      aligned = restrictStepToListedIngredients(aligned, menu, portions);
      aligned = cleanupRecipeStepText(aligned);
      if (/^토핑\s*:/.test(aligned.trim())) {
        aligned = normalizeToppingStep(aligned);
      }
      const allowed = buildAllowedRecipeIngredients(menu, portions);
      if (
        aligned.trim().length > 6 &&
        isActionStep(aligned) &&
        stepReferencesListedIngredient(aligned, portions, allowed)
      ) {
        const styled = friendlyHadaStep(aligned);
        const prev = steps[steps.length - 1]?.body || "";
        if (styled && !isNearDuplicateStep(styled, prev)) {
          steps.push({ title: "", body: styled });
        }
      }
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
