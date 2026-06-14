// 네이버 쇼핑 결과 — 식재료 vs 포장용품·비식품 (브라우저·Node 공용)
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.ProductFilter = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const PACKAGING_TITLE_PATTERNS = [
    /용기\b/,
    /우유통/,
    /페트\s*병|PET\s*병|페트병/i,
    /공병/,
    /링\s*마개|링마개/,
    /병\s*마개|병마개/,
    /뚜껑/,
    /보틀스\b/,
    /플라스틱\s*(?:병|보틀|용기)/,
    /(?:빈|공)\s*병/,
    /포장\s*(?:재|용|재료)/,
    /드림패키지/i,
    /맥스볼/i,
    /캔\s*통/,
    /라벨\s*(?:지|스티커)/,
    /스티커/,
    /튜브\s*병\s*용|튜브병용/,
    /(?:꿀|병)\s*포장(?!\s*(?:지|용))/,
    /박스\s*(?:만|공)/,
    /우유\s*(?:마개|팩클립|클립|거치)/,
    /\{보틀스\}/,
    /디저트\s*용기/,
    /페트병|플라스틱병/,
    /일회용\s*(?:식기|수저|스푼|포크|나이프)/,
    /스푼\s*\(1개\)/,
  ];

  const NON_FOOD_TITLE_PATTERNS = [
    /데코덴|탑꾸|탑로더|폰케이스|꾸미기\s*재료|공예\s*재료|14x\d+mm|레진\s*공예|미니어처/i,
    /브레이버스|쿠키런|TCG|트레이딩\s*카드|카드\s*BS\d|BS\d-\d+/i,
    /네일파츠|네일\s*(?:장식|아트|팁)|젤네일|큐티클/i,
    /주방세제|세정(?:제|력)|찌든때|클리너(?!\s*음료)/i,
    /반찬용기|견과류통|간식통|곡물통|젓갈용기|고추장용기|냉장고정리/i,
    /180mm|요거트스푼|스푼\s*종합|나이프\s*아이스크림/i,
    /사업자\s*샘플|샘플\s*신청|샘플러|체험팩\s*1포/i,
    /유로톨|식용색소\s*only/i,
    /뱅쇼\s*만들기|키트\s*재료\s*모음|한약재|약초\s*재료/i,
  ];

  const PLACEHOLDER_TITLE_PATTERNS = [
    /개별\s*결제/,
    /결제\s*주문\s*건/,
    /원산지\s*:\s*상세설명/,
  ];

  const FLAVORED_DRINK_TITLE =
    /초코|딸기|바나나|커피|말차|흑당|카라멜|민트|쿠키|수박|키위|요구르트|블루베리|복숭아|자몽|오렌지|춘식|카카오|케로로|흑임자|고구마|호두|헤이즐넛/i;

  function queryText(entry) {
    return `${entry?.buy || ""} ${entry?.searchQuery || ""} ${entry?.exampleProduct || ""}`;
  }

  function isPlainDairySearch(entry) {
    return /멸균\s*우유|우유\s*\d|두유|흰\s*우유|PB.*우유|갓밀크/i.test(queryText(entry));
  }

  function isHoneySearch(entry) {
    return /꿀|벌꿀|honey/i.test(queryText(entry));
  }

  function isHoneyAccessory(title, entry) {
    if (!isHoneySearch(entry)) return false;
    return /맛보기|샘플|꿀\s*스틱|허니\s*스틱|일회용|낱개|호떡|약밥|뚜껑|캡|답례품\s*세트/i.test(title || "");
  }

  function isFlavoredVariant(title, entry) {
    if (!isPlainDairySearch(entry)) return false;
    return FLAVORED_DRINK_TITLE.test(title || "");
  }

  function isPlaceholderProduct(title) {
    return PLACEHOLDER_TITLE_PATTERNS.some((re) => re.test(title || ""));
  }

  function isNonFoodProduct(title) {
    return NON_FOOD_TITLE_PATTERNS.some((re) => re.test(title || ""));
  }

  function isTapiocaSearch(entry) {
    return /타피오카|tapioca|버블티\s*펄|보바/i.test(queryText(entry));
  }

  function isYogurtDrinkSearch(entry) {
    return /드링킹\s*요거트|요구르트\s*\d|발효유/i.test(queryText(entry));
  }

  function isPlainYogurtDrinkSearch(entry) {
    if (!isYogurtDrinkSearch(entry)) return false;
    return !/딸기|바나나|망고|복숭아|블루베리|초코|키위|사과|포도/i.test(queryText(entry));
  }

  function isPlainYogurtSearch(entry) {
    const q = queryText(entry);
    return /플레인\s*요거트|요거트\s*\d+\s*g/i.test(q) && !/드링킹|아이스크림|쿠키런|카드/i.test(q);
  }

  function isPomeloJamSearch(entry) {
    return /자몽청|레드자몽|꿀레드자몽/i.test(queryText(entry));
  }

  function isSugarSyrupSearch(entry) {
    const q = queryText(entry);
    return /설탕\s*시럽|슈가\s*시럽|카페\s*시럽|무지향/i.test(q) && !/바닐라|멜론|체리|헤이즐넛/i.test(q);
  }

  function isFlavorSyrupSearch(entry) {
    const q = queryText(entry);
    return /시럽|syrup/i.test(q) && /바닐라|멜론|체리|헤이즐넛|블루|카라멜|민트|초코/i.test(q);
  }

  function isTeaBagSearch(entry) {
    return /티백/i.test(queryText(entry));
  }

  function isPlainBlackTeaBagSearch(entry) {
    if (!isTeaBagSearch(entry)) return false;
    const q = queryText(entry);
    return /홍차|블랙\s*티|black\s*tea/i.test(q) && !/얼그레이|자스민|녹차|우롱|허브|캐모마일|페퍼민트/i.test(q);
  }

  function isFlavoredTeaBagSearch(entry) {
    if (!isTeaBagSearch(entry)) return false;
    return /얼그레이|자스민|녹차|green\s*tea|earl/i.test(queryText(entry));
  }

  function isOreoSearch(entry) {
    return /오레오|oreo/i.test(queryText(entry));
  }

  function isNutsSearch(entry) {
    const q = queryText(entry);
    return /견과|아몬드|호두|땅콩|cashew/i.test(q) && !/버터|시럽|통(?!\s*밤)/i.test(q);
  }

  function isSoyPowderSearch(entry) {
    return /콩가루/i.test(queryText(entry));
  }

  function isJuiceSearch(entry) {
    return /주스|넥타|juice/i.test(queryText(entry));
  }

  function isJellySearch(entry) {
    const q = queryText(entry);
    return /젤리|jelly/i.test(q) && !/타피오카/i.test(q);
  }

  function isIcecreamSearch(entry) {
    return /아이스크림|소프트콘|투게더|젤라또/i.test(queryText(entry));
  }

  function isDalgonaSearch(entry) {
    return /달고나/i.test(queryText(entry));
  }

  function isFrozenFruitSearch(entry) {
    return /냉동\s*(?:딸기|망고|블루|베리|체리)/i.test(queryText(entry));
  }

  function isMichoSearch(entry) {
    return /미초|식초음료/i.test(queryText(entry));
  }

  function isCoffeeStickSearch(entry) {
    return /커피\s*스틱|커피스틱|에스프레소.*(?:액상\s*)?스틱|액상\s*스틱/i.test(queryText(entry));
  }

  function expectedTeaBagCount(entry) {
    const q = queryText(entry);
    const m = q.match(/(\d+)\s*(?:입|티백|t\b|T\b|개입)/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function titleTeaBagCounts(title) {
    const t = title || "";
    const vals = [];
    for (const m of t.matchAll(/(\d+)\s*(?:입|티백|티\s*백|t\b|T\b|개입|봉)/gi)) {
      vals.push(parseInt(m[1], 10));
    }
    return vals;
  }

  function matchesTeaBagCount(title, entry) {
    const expected = expectedTeaBagCount(entry);
    if (expected == null) return true;
    const found = titleTeaBagCounts(title);
    if (!found.length) return true;
    return found.some((n) => n === expected);
  }

  function matchesTeaType(title, entry) {
    if (!isFlavoredTeaBagSearch(entry)) return true;
    const t = title || "";
    const q = queryText(entry);
    if (/얼그레이|earl/i.test(q)) return /얼그레이|earl\s*grey/i.test(t);
    if (/자스민|jasmine/i.test(q)) return /자스민|jasmine/i.test(t);
    if (/녹차|green\s*tea/i.test(q)) return /녹차|green\s*tea/i.test(t);
    return true;
  }

  function isMultiSkuListing(title) {
    return (
      /외\s*\d+\s*종/.test(title || "") ||
      /400g.*500g.*600g|레몬청.*딧기청|딸기청.*오렌지청.*자몽청/i.test(title || "")
    );
  }

  function isWrongJamVariant(title, entry) {
    if (!isPomeloJamSearch(entry)) return false;
    if (isMultiSkuListing(title)) return true;
    if (/레몬차|레몬청|생강차|생강청|유자차|딸기청|오렌지청|라임청|오미자청/i.test(title || "")) {
      if (!/자몽|레드자몽|꿀레드자몽/i.test(title || "")) return true;
    }
    return false;
  }

  function isWrongSyrupVariant(title, entry) {
    if (!isSugarSyrupSearch(entry)) return false;
    if (/바닐라|바닐라향|멜론|체리|헤이즐넛|카라멜|민트|초코|블루큐라소/i.test(title || "")) return true;
    if (/시럽병|시럽통|용기|케찹병|드리즐|펌핑용기|투약병|소스병/i.test(title || "")) return true;
    return false;
  }

  function isWrongFlavorSyrup(title, entry) {
    if (!isFlavorSyrupSearch(entry)) return false;
    const t = title || "";
    if (/데코덴|네일|폰케이스|파츠|유로톨|꾸미기/i.test(t)) return true;
    if (/오일|oil/i.test(t) && !/시럽|syrup/i.test(t)) return true;
    return !/시럽|syrup|카페시럽|412|408|비셰프|다카|모닝/i.test(t);
  }

  function isWrongOreo(title) {
    const t = title || "";
    if (/푸딩\s*믹스|pudding\s*mix|디저트\s*믹스/i.test(t)) return true;
    if (/오레오/i.test(t) && /믹스|분말/i.test(t) && !/쿠키|cookie|오리지널|샌드/i.test(t)) return true;
    return false;
  }

  function isWrongNuts(title) {
    const t = title || "";
    if (/용기|통|보관|정리|플라스틱|아이보리/i.test(t) && !/아몬드|호두|견과|땅콩|cashew|nut/i.test(t)) return true;
    return false;
  }

  function isWrongSoyPowder(title) {
    const t = title || "";
    if (/커피|원두|로스팅|에스프레소|디카페인|ollcoffee/i.test(t) && !/두부|콩가루/i.test(t)) return true;
    if (/샘플|사업자/i.test(t)) return true;
    return false;
  }

  function isWrongJuice(title, entry) {
    const t = title || "";
    if (/뱅쇼|키트\s*재료|시나몬스틱|정향|한약재/i.test(t)) return true;
    if (/데코덴|파츠|탑꾸/i.test(t)) return true;
    if (isJuiceSearch(entry) && !/주스|넥타|juice|음료|히비스커스|포도|망고|복숭아|크랜베리|청포도/i.test(t)) return true;
    return false;
  }

  function isWrongJelly(title) {
    const t = title || "";
    if (/진주햄|햄\s*젤리/i.test(t)) return true;
    return false;
  }

  function isWrongIcecream(title) {
    const t = title || "";
    if (/데코덴|파츠|14x\d|공예|만들기\s*재료|미니어처/i.test(t)) return true;
    if (/일회용|용기|스푼|나이프|디저트\s*용/i.test(t)) return true;
    return false;
  }

  function isWrongDalgona(title) {
    const t = title || "";
    if (/베이킹소다|식소다/i.test(t) && !/당|설탕|뽑기|세트|키트|통|포/i.test(t)) return true;
    return false;
  }

  function isWrongFrozenFruit(title) {
    const t = title || "";
    if (/오일|oil/i.test(t) && !/냉동/i.test(t)) return true;
    return false;
  }

  function isWrongYogurt(title) {
    return /브레이버스|쿠키런|카드|TCG|맛\s*쿠키/i.test(title || "");
  }

  function isWoodenStirrer(title) {
    const t = title || "";
    if (!/일회용|180mm|나무|믹싱|저어|스터|스틱\s*\(/i.test(t)) return false;
    return !/에스프레소|espresso|커피\s*(?:믹스|맛)|액상|톡샷|스틱커피|로카|맥심|TOPS/i.test(t);
  }

  function isWrongMicho(title) {
    return /세제|세정|찌든때|클리너/i.test(title || "");
  }

  function isMilkAccessory(title, entry) {
    if (!isPlainDairySearch(entry)) return false;
    return /클립|마개|거치|냉장고|수납|용기|통(?!\s*우유)/i.test(title || "");
  }

  function isTeaBagAccessory(title, entry) {
    if (!isTeaBagSearch(entry)) return false;
    const t = title || "";
    if (/시럽|원액|베이스|분말|파우더|밀크티\s*(?:세트|키트)|사업자용.*티백|티백.*사업자용/i.test(t)) return true;
    if (/보관백|비닐팩|드립백\s*용|티백\s*용\s*봉|필터\s*용/i.test(t)) return true;
    if (/샘플러|맛보기|샘플\s*(?:신청|용)?|1\s*티백|1티백|1입(?!\d)|\(1입|1개입/i.test(t)) return true;
    if (/인형의\s*집|오비츠|촬영\s*소품|미니어처/i.test(t)) return true;
    if (/아이스티\s*스틱|스틱\s*티/i.test(t)) return true;
    if (isPlainBlackTeaBagSearch(entry)) {
      if (/녹차|현미|보이차|쑥차|허브|얼그레이|자스민|우롱|캐모마일|페퍼민트/i.test(t) && !/홍차|블랙\s*티|black\s*tea/i.test(t)) {
        return true;
      }
      if (/스트로베리|망고|복숭아|레몬|자몽|패션\s*후르츠|타임|thyme|두충/i.test(t)) return true;
    }
    if (isMultiSkuListing(t) && /백차.*홍차|홍차.*보이차/i.test(t)) return true;
    return false;
  }

  function isTapiocaAccessory(title) {
    return /장식|모형|팬던트|디오라마|미니어처|쿠키런|카드|브레이버스/i.test(title || "");
  }

  function matchesFoodKeyword(title, entry) {
    const t = title || "";
    if (isTapiocaSearch(entry)) {
      if (isTapiocaAccessory(t)) return false;
      return /타피오카|tapioca|보바/i.test(t);
    }
    if (isYogurtDrinkSearch(entry)) {
      if (isPlainYogurtDrinkSearch(entry) && /딸기|바나나|망고|복숭아|블루베리|초코|키위|사과|포도|골드키위/i.test(t)) {
        return false;
      }
      return /요거트|야쿠르트|요구르트|발효유|yogurt/i.test(t);
    }
    if (isPlainYogurtSearch(entry)) {
      if (isWrongYogurt(t)) return false;
      return /요거트|야쿠르트|요구르트|yogurt/i.test(t);
    }
    if (isPomeloJamSearch(entry)) {
      return /자몽|레드자몽|꿀레드자몽/i.test(t);
    }
    if (isSugarSyrupSearch(entry)) {
      return /시럽|카페시럽/i.test(t);
    }
    if (isFlavorSyrupSearch(entry)) {
      return /시럽|syrup|카페시럽/i.test(t);
    }
    if (isOreoSearch(entry)) {
      return /오레오|oreo|쿠키|cookie/i.test(t);
    }
    if (isNutsSearch(entry)) {
      return /견과|아몬드|호두|땅콩|cashew|nut|혼합/i.test(t);
    }
    if (isSoyPowderSearch(entry)) {
      return /콩가루|두부|soy/i.test(t);
    }
    if (isJuiceSearch(entry)) {
      return /주스|넥타|juice|음료|히비스커스/i.test(t);
    }
    if (isJellySearch(entry)) {
      return /젤리|jelly|콘크|뿌띠첼/i.test(t);
    }
    if (isIcecreamSearch(entry)) {
      return /아이스크림|ice\s*cream|소프트콘|투게더|젤라또/i.test(t);
    }
    if (isDalgonaSearch(entry)) {
      return /달고나|뽑기|세트|키트/i.test(t);
    }
    if (isFrozenFruitSearch(entry)) {
      return /냉동|frozen/i.test(t);
    }
    if (isMichoSearch(entry)) {
      return /미초|식초음료|홍초/i.test(t);
    }
    if (isCoffeeStickSearch(entry)) {
      return /에스프레소|espresso|커피|액상|스틱커피|톡샷|맥심|TOPS/i.test(t);
    }
    if (isPlainDairySearch(entry)) {
      return /우유/i.test(t);
    }
    if (isPlainBlackTeaBagSearch(entry)) {
      return /홍차|블랙\s*티|black\s*tea|티백/i.test(t);
    }
    if (isTeaBagSearch(entry)) {
      return /티백|tea\s*bag/i.test(t);
    }
    return true;
  }

  function isPackagingProduct(title) {
    return PACKAGING_TITLE_PATTERNS.some((re) => re.test(title || ""));
  }

  function expectedVolumeMl(entry) {
    const q = queryText(entry);
    const ml = q.match(/(\d+(?:\.\d+)?)\s*(?:ml|mL|ML|밀리)/i);
    if (ml) return parseFloat(ml[1]);
    const liter = q.match(/(\d+(?:\.\d+)?)\s*(?:L|l|리터)\b/i);
    if (liter) return parseFloat(liter[1]) * 1000;
    const g = q.match(/(\d+(?:\.\d+)?)\s*(?:g|G|그램|kg|킬로)/i);
    if (g) {
      const unit = g[0].toLowerCase();
      const n = parseFloat(g[1]);
      return /kg|킬로/.test(unit) ? n * 1000 : n;
    }
    return null;
  }

  function titleVolumes(title) {
    const t = title || "";
    const vals = [];
    for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*(?:ml|mL|ML|밀리)/gi)) {
      vals.push(parseFloat(m[1]));
    }
    for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*(?:L|l)\b/gi)) {
      vals.push(parseFloat(m[1]) * 1000);
    }
    for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*(?:g|G|그램)\b/gi)) {
      vals.push(parseFloat(m[1]));
    }
    for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*(?:kg|킬로)\b/gi)) {
      vals.push(parseFloat(m[1]) * 1000);
    }
    return vals;
  }

  function matchesPackVolume(title, entry) {
    const expected = expectedVolumeMl(entry);
    if (expected == null) return true;
    const found = titleVolumes(title);
    if (!found.length) return true;
    return found.some((v) => Math.abs(v - expected) <= Math.max(30, expected * 0.08));
  }

  function isRelevantProduct(title, entry) {
    if (isPackagingProduct(title)) return false;
    if (isPlaceholderProduct(title)) return false;
    if (isNonFoodProduct(title)) return false;
    if (isHoneyAccessory(title, entry)) return false;
    if (isFlavoredVariant(title, entry)) return false;
    if (isMilkAccessory(title, entry)) return false;
    if (isWrongJamVariant(title, entry)) return false;
    if (isWrongSyrupVariant(title, entry)) return false;
    if (isWrongFlavorSyrup(title, entry)) return false;
    if (isTeaBagAccessory(title, entry)) return false;
    if (isOreoSearch(entry) && isWrongOreo(title)) return false;
    if (isNutsSearch(entry) && isWrongNuts(title)) return false;
    if (isSoyPowderSearch(entry) && isWrongSoyPowder(title)) return false;
    if (isJuiceSearch(entry) && isWrongJuice(title, entry)) return false;
    if (isJellySearch(entry) && isWrongJelly(title)) return false;
    if (isIcecreamSearch(entry) && isWrongIcecream(title)) return false;
    if (isDalgonaSearch(entry) && isWrongDalgona(title)) return false;
    if (isFrozenFruitSearch(entry) && isWrongFrozenFruit(title)) return false;
    if (isPlainYogurtSearch(entry) && isWrongYogurt(title)) return false;
    if (isMichoSearch(entry) && isWrongMicho(title)) return false;
    if (isCoffeeStickSearch(entry) && isWoodenStirrer(title)) return false;
    if (!matchesFoodKeyword(title, entry)) return false;
    if (!matchesTeaType(title, entry)) return false;
    if (!matchesPackVolume(title, entry)) return false;
    if (!matchesTeaBagCount(title, entry)) return false;
    return true;
  }

  function isPricePlausible(lprice, entry) {
    if (!lprice || lprice <= 0) return false;
    const min = entry?.priceMin;
    const max = entry?.priceMax;
    if (min == null && max == null) return true;
    const floor = min != null ? Math.round(min * 0.75) : 0;
    const ceil = max != null ? Math.round(max * 1.35) : Infinity;
    return lprice >= floor && lprice <= ceil;
  }

  function isValidPriceOverride(override, entry) {
    const title = override?.productName || override?.productTitle || "";
    if (!isRelevantProduct(title, entry)) return false;
    if (override?.price != null && !isPricePlausible(override.price, entry)) return false;
    return true;
  }

  /** 카탈로그 페이지는 API 최저가와 실제 구매가가 다른 경우가 많음 */
  function linkQuality(link) {
    const url = link || "";
    if (/smartstore\.naver\.com|brand\.naver\.com/.test(url)) return 3;
    if (/ssg\.com|emart\.com|11st\.co\.kr|gmarket\.co\.kr|auction\.co\.kr/.test(url)) return 2;
    if (/outlink\/itemdetail|shopping\.naver\.com\/outlink/.test(url)) return 0;
    if (/shopping\.naver\.com\/catalog\//.test(url)) return 0;
    return 1;
  }

  function titleFocusScore(title) {
    const t = title || "";
    let score = 0;
    if (/플레인|무가당|오리지날|plain|오리지널/i.test(t)) score += 3;
    if (isMultiSkuListing(t)) score -= 8;
    if (/외\s*\d+\s*종/.test(t)) score -= 6;
    if ((t.match(/\//g) || []).length >= 2) score -= 4;
    if (/장식|모형|세트\s*컬러|데코덴|파츠|샘플|용기|통\b/i.test(t)) score -= 5;
    return score;
  }

  function pickBestProduct(items, entry) {
    if (!items?.length) return null;

    const relevant = items.filter((item) => isRelevantProduct(item.title, entry));
    if (!relevant.length) return null;

    const inRange = relevant.filter((item) => isPricePlausible(item.lprice, entry));
    let pool = inRange.length ? inRange : relevant;

    const direct = pool.filter((item) => linkQuality(item.link) > 0);
    if (direct.length) pool = direct;

    pool.sort((a, b) => {
      const focus = titleFocusScore(b.title) - titleFocusScore(a.title);
      if (focus !== 0) return focus;
      const qA = linkQuality(a.link);
      const qB = linkQuality(b.link);
      const cheaper = Math.min(a.lprice, b.lprice);
      if (cheaper > 0 && Math.abs(a.lprice - b.lprice) <= cheaper * 0.15 && qA !== qB) {
        return qB - qA;
      }
      if (a.lprice !== b.lprice) return a.lprice - b.lprice;
      return qB - qA;
    });
    return pool[0];
  }

  return {
    PACKAGING_TITLE_PATTERNS,
    NON_FOOD_TITLE_PATTERNS,
    isPackagingProduct,
    isNonFoodProduct,
    isFlavoredVariant,
    isRelevantProduct,
    isPricePlausible,
    isValidPriceOverride,
    matchesPackVolume,
    linkQuality,
    pickBestProduct,
  };
});
