/** 만드는 방법 토핑/드리즐 → homeIngredients (장보기) 보강 */
const { consumerHome: home } = require("./consumer-home");

const DEFAULT_HOME = {
  caramelDrizzle: 85,
  chocoDrizzle: 80,
  espressoDrizzle: 200,
  coldBrewDrizzle: 50,
  whipTopping: 350,
};

function hasLabel(labels, pattern) {
  return labels.some((l) => pattern.test(l || ""));
}

/** @param {string} topping @param {object} HOME @param {string[]} existingLabels */
function toppingHomeIngredients(topping, HOME = {}, existingLabels = []) {
  if (!topping) return [];
  const H = { ...DEFAULT_HOME, ...HOME };
  const t = topping.replace(/^토핑:?\s*/, "");
  const labels = [...existingLabels];
  const out = [];

  const push = (entry) => {
    out.push(entry);
    labels.push(entry.label);
  };

  if (/카라멜(?:\s*소스)?\s*드리즐|드리즐.*카라멜|초코\s*·\s*카라멜\s*드리즐/.test(t)) {
    push(home("카라멜 시럽", "드리즐", H.caramelDrizzle, "카라멜 드리즐"));
  }
  if (/초코(?:\s*·|\s*·\s*)?카라멜\s*드리즐|초코.*드리즐|드리즐.*초코/.test(t)) {
    push(home("초코 시럽", "드리즐", H.chocoDrizzle, "초코 드리즐"));
  }
  if (/식힌\s*샷\s*드리즐|샷\s*드리즐/.test(t)) {
    push(home("에스프레소 액상스틱", "드리즐", H.espressoDrizzle, "식힌 샷 드리즐"));
  }
  if (/원조(?:커피)?\s*원액\s*드리즐|콜드브루.*드리즐|드리즐.*콜드브루/.test(t)) {
    push(home("콜드브루 원액", "드리즐", H.coldBrewDrizzle, "원조커피 원액 드리즐"));
  }
  if (/휘핑/.test(t) && !hasLabel(labels, /휘핑/)) {
    push(home("휘핑크림", "토핑", H.whipTopping, "휘핑크림"));
  }

  return out;
}

module.exports = { toppingHomeIngredients, DEFAULT_HOME };
