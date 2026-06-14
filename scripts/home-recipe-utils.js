// 집 레시피 — 컵·숟가락·포크·뚜껑 컵(페트병)만 쓰는 단계로 정리
const { toFriendlyHadaStep } = require("../recipe-step-style");
const MAX_RECIPE_STEPS = 5;

const POOR_KITCHEN_RECIPE_NOTE =
  "컵·숟가락·포크·뚜껑 있는 컵(또는 빈 페트병)만 사용 · 블렌더·믹서기 불필요";

const SHAKER = "뚜껑 있는 컵이나 빈 페트병";

function ensurePeriod(text) {
  const t = text.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function polishHomeStep(text) {
  return toFriendlyHadaStep(
    text
      .replace(/믹서(?:기|로)|블렌더(?:로)?/g, SHAKER)
      .replace(/술로 휘젓기 하듯/g, "숟가락으로")
      .replace(/바 스푼/g, "숟가락")
      .replace(/\d+~?\d*초 갈[^.]*\.?/g, "30초~1분 세게 흔들거나, 포크·숟가락으로 골고루 섞는다")
      .replace(/20~30초 갈기\.?/g, "30초~1분 세게 흔들거나, 숟가락으로 1분 넘게 저어준다")
      .replace(/짧게 갈기\.?/g, "15~20초 흔들거나 숟가락으로 빠르게 저어준다")
      .replace(/스팀/g, "전자레인지로 40초 데운 뒤 숟가락으로")
      .replace(/쉐이킹/g, "뚜껑 닫고 흔든다")
      .replace(/휘핑크림 3\.5바퀴/g, "휘핑크림(없으면 우유를 페트병에 15초 흔든 거품으로 대체)")
      .replace(/전자레인지\+술로 휘젓기/g, "전자레인지 데운 뒤 숟가락으로")
      .trim()
  );
}

function isSingleActionStep(step) {
  return /넣고|흔든다|흔들|섞어|저어|담는다|둘러|우려|제거|갈아|믹싱|쉐이킹/.test(step);
}

function splitLongStep(step) {
  const parts = [];
  let rest = step.trim();

  // 재료 나열 + 한 번에 넣고/흔들기 등은 쪼개지 않음
  if (isSingleActionStep(rest)) {
    return [ensurePeriod(rest)];
  }

  const splitters = [
    /\s+끓인\s+후\s+/,
    /\s+후\s+/,
    /\s+뒤\s+/,
    /\s+그리고\s+/,
    /\s+부어\s+/,
    /\s+채운\s+/,
  ];

  for (const re of splitters) {
    if (rest.length > 45 && re.test(rest)) {
      const chunks = rest.split(re).filter((c) => c.trim().length > 4);
      if (chunks.length > 1) {
        chunks.forEach((c, i) => {
          let piece = c.trim();
          if (i > 0 && !/^(넣|부|채|섞|담|옮|흔|저|녹|우|데|말)/.test(piece)) {
            piece = piece;
          }
          parts.push(piece);
        });
        return parts.map(ensurePeriod);
      }
    }
  }

  if (/(?<=[.!])\s+/.test(rest)) {
    const parts = rest.split(/(?<=[.!])\s+/).filter((p) => p.trim().length > 3);
    while (
      parts.length > 1 &&
      /^\([^)]+\)\.?$/.test(parts[parts.length - 1].trim())
    ) {
      const note = parts.pop().trim().replace(/\.$/, "");
      parts[parts.length - 1] = `${parts[parts.length - 1].replace(/\.$/, "")} ${note}.`;
    }
    return parts.map(ensurePeriod);
  }

  return [ensurePeriod(rest)];
}

function expandHomeSteps(steps) {
  return steps
    .flatMap((step) => splitLongStep(polishHomeStep(step)))
    .filter((s) => s.length > 4);
}

function appendToppingToSteps(steps, topping) {
  if (!topping) return steps;
  const top = topping.startsWith("토핑") ? topping : `토핑: ${topping}`;
  const last = steps[steps.length - 1] || "";
  const compact = (s) => s.replace(/\s/g, "");
  const topWords = top.replace(/^토핑:?\s*/, "").split(/[\s,·]+/).filter((w) => w.length >= 2);
  if (topWords.some((w) => compact(last).includes(compact(w)))) return steps;
  return [...steps, ensurePeriod(top)];
}

/** 만드는 방법 — 행동 단계만, 최대 5단계 */
function limitRecipeSteps(steps, max = MAX_RECIPE_STEPS) {
  if (!steps?.length || steps.length <= max) return steps;

  const normalized = steps
    .map((s) => {
      if (typeof s === "string") return { title: "", body: ensurePeriod(s) };
      return { title: s.title || "", body: ensurePeriod(s.body || "") };
    })
    .filter((s) => s.body && !s.body.startsWith("재료:"));

  const result = [...normalized];
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

function limitStepBodies(bodies, max = MAX_RECIPE_STEPS) {
  return limitRecipeSteps(bodies.map((body) => ({ title: "", body })), max).map((s) => s.body);
}

function alignStepToIngredients(text, labels = []) {
  if (!text || !labels.length) return text;
  let t = text;
  const has = (name) => labels.some((l) => l.includes(name) || name.includes(l));

  if (has("사이다")) {
    t = t.replace(/탄산수(\([^)]*\))?/g, "사이다");
    t = t.replace(/사이다\s+1캔\(또는\s+사이다\)/g, "사이다 1캔");
  }
  if (has("자몽청")) {
    t = t.replace(/자몽청·오렌지[^.]*?(?=을|를|과|와|\s)/g, "자몽청");
    t = t.replace(/자몽퓨레/g, "자몽청");
    t = t.replace(/자몽시럽/g, "자몽청");
    t = t.replace(/(자몽청[·,]\s*)+자몽청/g, "자몽청");
  }
  if (has("레몬즙") || has("레몬 베이스")) {
    t = t.replace(/레몬퓨레/g, labels.find((l) => l.includes("레몬")) || "레몬즙");
  }
  if (has("블루 레몬 시럽")) t = t.replace(/블루큐라소 시럽/g, "블루 레몬 시럽");
  if (has("설탕시럽")) {
    t = t.replace(/흑설탕 시럽/g, "설탕시럽");
    t = t.replace(/(?<!바닐라 |헤이즐넛 |카라멜 |초코 |설탕|자몽|체리|블루 )시럽/g, "설탕시럽");
  }
  if (has("녹차 가루")) t = t.replace(/녹차 파우더/g, "녹차 가루");
  if (has("코코아 파우더")) {
    t = t.replace(/초코 파우더/g, "코코아 파우더");
    t = t.replace(/다크컬스 초콜릿(\([^)]*\))?/g, "코코아 파우더");
  }
  if (has("콜드브루 원액")) t = t.replace(/콜드브루 원액(\([^)]*\))?/g, "콜드브루 원액");
  if (has("플레인 요거트")) t = t.replace(/요거트 파우더/g, "플레인 요거트");
  if (has("오레오")) t = t.replace(/오레오초코/g, "오레오");
  if (has("블루 레몬 시럽")) t = t.replace(/블루 레몬 시럽 베이스/g, "블루 레몬 시럽");
  if (has("홍차 티백")) t = t.replace(/홍차 티백(\([^)]*\))?/g, "홍차 티백");
  if (has("뜨거운 물") && has("차가운 물")) {
    t = t.replace(/(?<!뜨거운 |차가운 )물(?=\s*\d)/g, "뜨거운 물");
  } else if (has("뜨거운 물") && has("물") && !labels.includes("물")) {
    t = t.replace(/(?<!뜨거운 )물(?=\s*\d)/g, "뜨거운 물");
  }
  return t;
}

function stepsFromManualHome(manual, homeIngredients = []) {
  if (!manual?.home?.length) {
    return ["재료를 컵에 넣고 숟가락으로 섞어 완성"];
  }
  const labels = homeIngredients.map((i) => i.label).filter(Boolean);
  const expanded = expandHomeSteps(manual.home).map((s) =>
    alignStepToIngredients(polishHomeStep(s), labels)
  );
  return limitStepBodies(appendToppingToSteps(expanded, manual.topping));
}

// ── 빽다방 등: 블렌더 메뉴 → 컵·숟가락·흔들기 ──

function stepsShakeDrink({ dissolve = [], mix = [], shake = true, serve = [], topping }) {
  const prep = [...dissolve, ...mix].map(ensurePeriod);
  const out = [];
  if (prep.length) {
    out.push(prep.join(" "));
  }
  if (shake) {
    out.push(`${SHAKER}에 재료를 모두 넣고 뚜껑을 닫은 뒤 30초~1분 세게 흔든다.`);
  }
  serve.forEach((s) => out.push(ensurePeriod(s)));
  return limitStepBodies(appendToppingToSteps(out, topping));
}

function stepsMashJuice({ fruit, fruitG, extras = [], topping }) {
  const out = [
    `${fruit} ${fruitG}을 살짝 녹인 뒤 컵에 넣고 포크로 으깬다.`,
    [...extras.map(ensurePeriod), "숟가락으로 1분 넘게 저어 골고루 섞는다."].filter(Boolean).join(" "),
    "얼음을 가득 채운 컵에 섞어 둔 주스를 붓는다.",
  ];
  return limitStepBodies(appendToppingToSteps(out, topping));
}

function stepsDissolvePowderLatte({ powder, powderAmt, warmMl = 30, milkMl = 300, extra = [], topping }) {
  const out = [
    `컵 바닥에 우유 2~3큰술과 ${powder} ${powderAmt}을 넣고, 뜨거운 물 ${warmMl}ml로 숟가락에 가루가 안 남을 때까지 녹인다.`,
    [`나머지 우유를 넣어 ${milkMl}ml 선까지 채우고`, ...extra.map(ensurePeriod), "숟가락으로 10초 더 저어준다."]
      .filter(Boolean)
      .join(" "),
    "얼음을 가득 채운다.",
  ];
  return limitStepBodies(appendToppingToSteps(out, topping));
}

function stepsSimpleAde({ base, baseAmt, topping }) {
  const out = [
    `컵에 ${base} ${baseAmt}을 넣는다.`,
    "얼음을 컵 상기선까지 채운다.",
    "사이다 1캔을 부어준다.",
    "숟가락으로 3~4번 가볍게 저어준다.",
  ];
  return appendToppingToSteps(out, topping);
}

module.exports = {
  MAX_RECIPE_STEPS,
  POOR_KITCHEN_RECIPE_NOTE,
  SHAKER,
  polishHomeStep,
  expandHomeSteps,
  appendToppingToSteps,
  limitRecipeSteps,
  limitStepBodies,
  alignStepToIngredients,
  stepsFromManualHome,
  stepsShakeDrink,
  stepsMashJuice,
  stepsDissolvePowderLatte,
  stepsSimpleAde,
  ensurePeriod,
};
