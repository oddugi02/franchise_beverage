/**
 * 만드는 방법 — 친근한 ~한다체로 통일
 * (브라우저·Node 공용)
 */
(function (root) {
  const HADA_END =
    /(?:한다|는다|준다|인다|된다|낸다|든다|둔다|운다|린다|힌다|친다|킨다|닌다|본다|맨다|탄다|산다|긴다|핀다|란다|낀다|끈다|쓴다|올린다|둘러준다|우려낸다|제거한다|식힌다|채운다|헹근다|갈아준다|붓는다|넣는다|섞는다|깐다|풀어준다|버무려 둔다|즐긴다|마신다|완성해준다|마무리해준다)$/;

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

  function splitTrailingNote(text) {
    const m = (text || "").match(/^(.+?)\s*(\([^)]+\))\s*$/);
    if (!m) return { core: (text || "").trim(), note: "" };
    return { core: m[1].trim(), note: m[2].trim() };
  }

  function friendlyNote(note) {
    const body = note.replace(/^\(|\)$/g, "").trim();
    const map = {
      "펄 생략 가능": "펄은 생략 가능",
      선택: "선택 사항",
      "선택 사항": "선택 사항",
    };
    const mapped = map[body] || body.replace(/\bOK\b/g, "괜찮음");
    return `(${mapped})`;
  }

  function hasBatchim(char) {
    if (!char || !/[가-힣]/.test(char)) return true;
    const code = char.charCodeAt(0) - 0xac00;
    if (code < 0 || code > 11171) return true;
    return code % 28 !== 0;
  }

  function particleForPhrase(phrase) {
    const t = (phrase || "").trim();
    const hangul = t.match(/([가-힣])(?=[^가-힣]*$)/);
    if (hangul) return hasBatchim(hangul[1]) ? "을" : "를";
    return "을";
  }

  const AMOUNT =
    /(?:\d+(?:\.\d+)?(?:~\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔|봉|바퀴|스쿱|티백|국자|봉지)|\d+\/\d+컵|0\.\d+컵|적당량|가득|토핑|드리즐|반\s*컵)/;

  const ACTION =
    /(?:넣고|넣는다|넣어|붓고|붓는다|부은|붓은|부어|부어준다|채우고|채운다|채워|섞고|섞는다|섞어|저어|흔들어|흔들거나|흔든다|깔고|깔아|올리고|올려|올린다|뿌리고|뿌려|갈아|갈고|담아|데우고|데워|우려|풀어|만들|따라|옮겨|마무리|완성|제거|헹구|식히|녹이|버무려|빻아|으깨|건져|말아|즐긴|마신)/;

  const ADVERB_TAIL =
    /(?:세게|짧게|부드럽게|시원하게|가볍게|골고루|잘|천천히|빠르게|살짝|진하게|가득|적게|더)$/;

  const SKIP_OBJECT = new Set([
    "뒤",
    "위",
    "안",
    "밖",
    "가운데",
    "이어서",
    "먼저",
    "마지막",
    "상기선",
    "선",
    "라인",
    "정도",
    "분량",
    "컵",
    "잔",
    "페트병",
    "쉐이커",
    "믹서기",
    "블렌더",
    "뚜껑",
    "숟가락",
    "포크",
    "가득",
    "적당량",
    "토핑",
    "드리즐",
    "번",
    "때",
    "취향껏",
    "위에",
  ]);

  function addParticleToPhrase(phrase) {
    let t = (phrase || "").trim();
    if (!t || /(?:을|를)$/.test(t)) return t;

    const gaDeck = t.match(/^(.+?)\s+(가득|적당량)$/);
    if (gaDeck) return `${addParticleToPhrase(gaDeck[1].trim())} ${gaDeck[2]}`;

    const lastWord = t.split(/\s/).pop() || "";
    if (SKIP_OBJECT.has(lastWord) || ADVERB_TAIL.test(lastWord)) return t;
    if (/(?:고|서|며|면|는|된|던|한|인|진|든)$/.test(lastWord)) return t;

    const withAmt = t.match(
      /^(.+?)\s*(\d+(?:\.\d+)?(?:~\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔|봉|바퀴|스쿱|티백|국자|봉지)|\d+\/\d+컵|0\.\d+컵|적당량|토핑|드리즐|반\s*컵)\s*$/
    );
    if (withAmt) {
      const core = `${withAmt[1].trim()} ${withAmt[2].trim()}`;
      return `${core}${particleForPhrase(core)}`;
    }
    if (/^[가-힣A-Za-z][가-힣A-Za-z0-9·\s]{1,}$/.test(t) && t.length >= 2) {
      return `${t}${particleForPhrase(t)}`;
    }
    return t;
  }

  function fixObjectPhrase(objs) {
    const loc = objs.match(/^(.+?(?:컵에|컵이나|바닥에|페트병에|쉐이커에|병에|잔에)\s*)([\s\S]*)$/);
    if (loc && loc[2]) {
      const body = loc[2].trim();
      if (!body) return objs;
      if (/,/.test(body)) return loc[1] + fixIngredientList(body);
      return loc[1] + addParticleToPhrase(body);
    }
    if (/,/.test(objs)) return fixIngredientList(objs);
    return addParticleToPhrase(objs.trim());
  }

  function fixIngredientList(list) {
    const parts = list
      .split(",")
      .map((part) => part.trim().replace(/(?:을|를)$/, ""))
      .filter(Boolean);
    if (parts.length <= 1) return addParticleToPhrase(parts[0] || "");
    const last = parts.pop();
    return [...parts, addParticleToPhrase(last)].join(", ");
  }

  /** 쉼표 나열 중간 항목의 을/를 제거 (마지막 항목만 유지) */
  function dropMidListParticles(text) {
    return (text || "").replace(/(을|를)(\s*,)/g, "$2");
  }

  function fixClause(clause) {
    let c = clause.replace(
      /([가-힣A-Za-z][가-힣A-Za-z0-9·\s]{0,36}?\s*\d+(?:\.\d+)?(?:~\d+)?\s*(?:개|ml|L|g|kg|펌프|컵|입|팩|샷|큰술|스푼|캔|봉|바퀴|스쿱|티백|국자|봉지))(?![을를])(\s+부은|\s+붓은)/g,
      (_full, phrase, tail) => `${addParticleToPhrase(phrase.trim())}${tail}`
    );

    const objVerbRe =
      /\s+(?:넣고|넣는다|넣어|붓고|붓는다|부어|부어준다|부어주는다|채우고|채운다|채워|깔고|깔아|올리고|올려|올린다|올린|뿌리고|뿌려|담아|데우고|데워|우려|흔든다|흔들어|흔들거나|섞고|섞어)(?![가-힣])/g;

    const verbs = [...c.matchAll(objVerbRe)];
    for (let i = verbs.length - 1; i >= 0; i--) {
      const verbStart = verbs[i].index;
      const verb = verbs[i][0];
      const prevEnd = i > 0 ? verbs[i - 1].index + verbs[i - 1][0].length : 0;
      const objs = c.slice(prevEnd, verbStart);
      const trimmed = objs.trim();
      if (/^(?:숟가락|포크|블렌더|믹서|쉐이커)(?:으로|로)?(?:\s|$)/.test(trimmed)) continue;
      if (/^(?:뒤|이어서|그다음|마지막으로)\b/.test(trimmed)) continue;

      const lead = objs.match(/^(\s*,\s*)/);
      const prefix = lead ? lead[1] : objs.match(/^(\s+)/)?.[1] || "";
      const core = objs.slice(prefix.length);
      if (!core.trim()) continue;

      const fixed = prefix + fixObjectPhrase(core.trim());
      c = c.slice(0, prevEnd) + fixed + verb + c.slice(verbStart + verb.length);
    }

    return c.replace(
      /([가-힣A-Za-z][가-힣A-Za-z0-9·\s]{0,36}?)(\s+가득)(?=\s+(?:채우|채|넣))/g,
      (_, n, adv) => `${addParticleToPhrase(n.trim())}${adv}`
    );
  }

  /** 재료·토핑 명사 뒤 목적격 조사(을/를) 보정 */
  function ensureObjectParticles(text) {
    let s = (text || "").trim();
    if (!s) return s;

    s = s
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => fixClause(sentence))
      .join(" ");

    s = s
      .replace(/(으로|에서|까지|부터|처럼|보다|하고|이고|라고|도록|에|로|와|과)를/g, "$1")
      .replace(/(을|를)(?:을|를)+/g, "$1");

    s = s.replace(/얼음(?![을를])(?=\s+(?:채우|채|넣))/g, "얼음을");

    return dropMidListParticles(s.replace(/\s{2,}/g, " ").trim());
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
    ["버무려 두", "버무려 둔다"],
    ["우려내", "우려낸다"],
    ["헹구", "헹근다"],
    ["녹이", "녹인다"],
    ["흔들", "흔든다"],
    ["채우", "채운다"],
    ["만들", "만든다"],
    ["완성", "완성한다"],
    ["마무리", "마무리한다"],
    ["데우", "데운다"],
    ["갈아", "갈아준다"],
    ["넣고 갈", "넣고 갈아준다"],
    ["으깨", "으깬다"],
    ["갈", "갈아준다"],
    ["붓", "붓는다"],
    ["마시", "마신다"],
    ["넣", "넣는다"],
    ["섞", "섞는다"],
    ["담", "담는다"],
    ["따르", "따른다"],
    ["올리", "올린다"],
    ["뿌리", "뿌려준다"],
    ["부어", "붓는다"],
    ["채", "채운다"],
    ["저어", "저어준다"],
    ["깔", "깐다"],
    ["풀", "풀어준다"],
    ["썰", "썰어준다"],
    ["식히", "식힌다"],
  ];

  function giToHada(sentence) {
    if (!sentence.endsWith("기")) return sentence;
    const base = sentence.slice(0, -1);
    for (const [stem, hada] of GI_MAP) {
      if (base.endsWith(stem)) return base.slice(0, -stem.length) + hada;
    }
    if (base.endsWith("우")) return `${base}운다`;
    if (base.endsWith("르")) return `${base}른다`;
    if (base.endsWith("구")) return `${base.slice(0, -1)}군다`;
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
      [/부은$/, "붓는다"],
      [/토핑$/, "토핑으로 올린다"],
      [/데운\s*뒤$/, "데운 뒤 사용한다"],
      [/부은\s*뒤$/, "부은 뒤 섞는다"],
      [/넣은\s*뒤$/, "넣은 뒤 섞는다"],
      [/채운\s*뒤$/, "채운 뒤 이어서 진행한다"],
      [/데운$/, "데운다"],
      [/끓인$/, "끓인다"],
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

    if (
      !looksCompleteHada(s) &&
      /(?:컵|잔|뚜껑|쉐이커|믹싱)/.test(s) &&
      !/(넣|붓|담|채|부|섞|저|흔|깔|둘|우려|제거)/.test(s.slice(-16))
    ) {
      if (/[0-9]+(?:ml|g|개|펌프|큰술|스푼|입|바퀴)/.test(s)) {
        return `${s}${particleForPhrase(s)} 넣는다`;
      }
      return `${s}에 재료를 넣는다`;
    }

    if (!looksCompleteHada(s) && /\d+개$/.test(s)) {
      return `${s}${particleForPhrase(s)} 넣는다`;
    }

    if (!looksCompleteHada(s) && /(?:ml|g|펌프|큰술|스푼)$/.test(s)) {
      return `${s}${particleForPhrase(s)} 넣는다`;
    }

    return s;
  }

  function softenTone(s) {
    return s
      .replace(/가볍게 섞는다$/, "가볍게 섞어준다")
      .replace(/잘 섞는다$/, "잘 섞어준다")
      .replace(/골고루 섞는다$/, "골고루 섞어준다")
      .replace(/완성한다$/, "완성해준다")
      .replace(/마무리한다$/, "마무리해준다")
      .replace(/저어 마무리한다$/, "저어 마무리해준다");
  }

  function polishSentence(sentence) {
    const { core: rawCore, note } = splitTrailingNote(sentence.trim().replace(/\.$/, ""));
    if (!rawCore && note) return ensurePeriod(friendlyNote(note));

    let s = rawCore;
    if (!s) return ensurePeriod("");

    if (/[가-힣]{2,}다\s*\([^)]*\)\s*$/.test(s)) {
      return ensurePeriod(s);
    }

    if (/^\([^)]+\)\s*$/.test(s)) {
      return ensurePeriod(friendlyNote(s));
    }

    s = formalToHada(s);
    s = giToHada(s);
    s = finishFragment(s);

    if (!looksCompleteHada(s)) {
      if (s.endsWith("기")) s = giToHada(s);
      else if (s.endsWith("다")) {
        // already complete
      } else if (/마무리$/.test(s)) s = `${s}한다`;
      else if (/뒤$/.test(s)) s = `${s} 이어서 섞는다`;
      else s = `${s}한다`;
    }

    s = softenTone(s);
    s = ensureObjectParticles(s);
    if (note) s = `${s} ${friendlyNote(note)}`;
    return ensurePeriod(s);
  }

  function toFriendlyHadaStep(text) {
    const raw = (text || "").trim();
    if (!raw) return raw;

    const sentences = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (!sentences.length) return ensurePeriod(polishSentence(raw));

    return sentences.map((s) => polishSentence(s.replace(/\.$/, ""))).join(" ");
  }

  const api = { toFriendlyHadaStep, ensurePeriod, ensureObjectParticles, particleForPhrase };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.toFriendlyHadaStep = toFriendlyHadaStep;
})(typeof globalThis !== "undefined" ? globalThis : this);
