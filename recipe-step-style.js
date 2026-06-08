/**
 * 만드는 방법 — 친근한 ~한다체로 통일
 * (브라우저·Node 공용)
 */
(function (root) {
  const HADA_END =
    /(?:한다|는다|준다|인다|된다|간다|낸다|든다|둔다|운다|린다|힌다|친다|킨다|닌다|본다|맨다|탄다|산다|긴다|핀다|란다|낀다|끈다|쓴다|올린다|둘러준다|우려낸다|제거한다|싞힌다|채운다)$/;

  function looksCompleteHada(sentence) {
    return (
      HADA_END.test(sentence) ||
      /[가-힣]{2,}다$/.test(sentence) ||
      /[가-힣]{2,}다\s*\([^)]*\)\s*$/.test(sentence)
    );
  }

  function ensurePeriod(text) {
    const t = (text || "").trim();
    if (!t) return t;
    return /[.!?]$/.test(t) ? t : `${t}.`;
  }

  const GI_MAP = [
    ["넣고 섞", "넣고 섞는다"],
    ["넣고 물 소량으로 녹이", "넣고 물 소량으로 녹인다"],
    ["넣고 소량 뜨거운 물로 녹이", "넣고 소량 뜨거운 물로 녹인다"],
    ["넣고 뜨거운 물 소량으로 녹이", "넣고 뜨거운 물 소량으로 녹인다"],
    ["부어 액상스틱을 녹이", "부어 액상스틱을 녹인다"],
    ["부어 시럽을 녹이", "부어 시럽을 녹인다"],
    ["가볍게 섞", "가볍게 섞는다"],
    ["흔들어 섞", "흔들어 섞는다"],
    ["골고루 섞", "골고루 섞는다"],
    ["빠르게 저어", "빠르게 저어준다"],
    ["가볍게 저어", "가볍게 저어준다"],
    ["숟가락으로 저어", "숟가락으로 저어준다"],
    ["우려내", "우려낸다"],
    ["녹이", "녹인다"],
    ["흔들", "흔든다"],
    ["채우", "채운다"],
    ["만들", "만든다"],
    ["완성", "완성한다"],
    ["마무리", "마무리한다"],
    ["데우", "데운다"],
    ["갈", "간다"],
    ["붓", "붓는다"],
    ["넣", "넣는다"],
    ["섞", "섞는다"],
    ["담", "담는다"],
    ["따르", "따른다"],
    ["올리", "올린다"],
    ["뿌리", "뿌려준다"],
    ["부어", "붓는다"],
    ["채", "채운다"],
    ["저어", "저어준다"],
  ];

  function giToHada(sentence) {
    if (!sentence.endsWith("기")) return sentence;
    const base = sentence.slice(0, -1);
    for (const [stem, hada] of GI_MAP) {
      if (base.endsWith(stem)) return base.slice(0, -stem.length) + hada;
    }
    if (base.endsWith("우")) return `${base}운다`;
    if (base.endsWith("르")) return `${base}른다`;
    return `${base}는다`;
  }

  function formalToHada(sentence) {
    return sentence
      .replace(/해\s*주세요$/g, "해준다")
      .replace(/하세요$/g, "한다")
      .replace(/해요$/g, "한다")
      .replace(/만듭니다$/g, "만든다")
      .replace(/뿌립니다$/g, "뿌려준다")
      .replace(/갈아줍니다$/g, "갈아준다")
      .replace(/넣습니다$/g, "넣는다")
      .replace(/준비합니다$/g, "준비한다")
      .replace(/건져냅니다$/g, "건져낸다")
      .replace(/맞춥니다$/g, "맞춘다")
      .replace(/마십니다$/g, "마신다")
      .replace(/즐깁니다$/g, "즐긴다")
      .replace(/됩니다$/g, "된다")
      .replace(/습니다$/g, "한다")
      .replace(/합니다$/g, "한다")
      .replace(/드립니다$/g, "드린다")
      .replace(/립니다$/g, "린다")
      .replace(/줍니다$/g, "준다")
      .replace(/부어줍니다$/g, "부어준다")
      .replace(/부어 줍니다$/g, "부어준다")
      .replace(/저어주면 완성됩니다$/g, "저어주면 완성된다")
      .replace(/섞어 마십니다$/g, "섞어 마신다");
  }

  function finishFragment(sentence) {
    let s = sentence;

    const tailRules = [
      [/부어\s*마무리$/, "부어 마무리한다"],
      [/저어\s*마무리$/, "저어 마무리한다"],
      [/(.+로)\s*마무리$/, "$1 마무리한다"],
      [/마무리$/, "마무리한다"],
      [/부어\s*줘$/, "부어준다"],
      [/부어준$/, "부어준다"],
      [/데운\s*뒤$/, "데운 뒤 사용한다"],
      [/부은\s*뒤$/, "부은 뒤 섞는다"],
      [/넣은\s*뒤$/, "넣은 뒤 섞는다"],
      [/채운\s*뒤$/, "채운 뒤 이어서 진행한다"],
      [/데운$/, "데운다"],
      [/흔들거나$/, "흔들거나 숟가락으로 골고루 섞는다"],
      [/섞거나$/, "섞거나 10초 더 저어준다"],
    ];

    for (const rule of tailRules) {
      if (rule[1] instanceof Function) {
        if (rule[0].test(s)) return s.replace(rule[0], rule[1]);
      } else if (rule[0].test(s)) {
        return s.replace(rule[0], rule[1]);
      }
    }

    // 재료만 있고 동사가 없을 때 (이미 ~다로 끝나면 건너뜀)
    if (
      !looksCompleteHada(s) &&
      /(?:컵|잔|뚜껑|쉐이커|믹싱)/.test(s) &&
      !/(넣|붓|담|채|부|섞|저|흔|깔|둘|우려|제거)/.test(s.slice(-16))
    ) {
      if (/[0-9]+(?:ml|g|개|펌프|큰술|스푼|입|바퀴)/.test(s)) return `${s}을 넣는다`;
      return `${s}에 재료를 넣는다`;
    }

    if (!looksCompleteHada(s) && /\d+개$/.test(s)) {
      return `${s}를 넣는다`;
    }

    if (!looksCompleteHada(s) && /(?:ml|g|펌프|큰술|스푼)$/.test(s)) {
      return `${s}을 넣는다`;
    }

    return s;
  }

  function polishSentence(sentence) {
    let s = sentence.trim().replace(/\.$/, "");
    if (!s) return s;

    if (/[가-힣]{2,}다\s*\([^)]*\)\s*$/.test(s)) {
      return ensurePeriod(s);
    }

    if (/^\([^)]+\)\s*$/.test(s)) {
      return ensurePeriod(s);
    }

    s = formalToHada(s);
    s = giToHada(s);
    s = finishFragment(s);

    if (!looksCompleteHada(s)) {
      if (s.endsWith("기")) s = giToHada(s);
      else if (s.endsWith("다")) {
        // bare adjective-like ending
      } else if (/마무리$/.test(s)) s = `${s}한다`;
      else if (/뒤$/.test(s)) s = `${s} 이어서 섞는다`;
      else s = `${s}한다`;
    }

    // 친근한 톤: 마무리·섞기 단계는 ~해준다
    s = s
      .replace(/가볍게 섞는다$/, "가볍게 섞어준다")
      .replace(/잘 섞는다$/, "잘 섞어준다")
      .replace(/골고루 섞는다$/, "골고루 섞어준다")
      .replace(/완성한다$/, "완성해준다")
      .replace(/마무리한다$/, "마무리해준다")
      .replace(/저어 마무리한다$/, "저어 마무리해준다");

    return ensurePeriod(s);
  }

  function toFriendlyHadaStep(text) {
    const raw = (text || "").trim();
    if (!raw) return raw;

    const sentences = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (!sentences.length) return ensurePeriod(polishSentence(raw));

    return sentences.map((s) => polishSentence(s.replace(/\.$/, ""))).join(" ");
  }

  const api = { toFriendlyHadaStep, ensurePeriod };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.toFriendlyHadaStep = toFriendlyHadaStep;
})(typeof globalThis !== "undefined" ? globalThis : this);
