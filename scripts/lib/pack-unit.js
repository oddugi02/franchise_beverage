/**
 * 장보기 팩 규격 파싱 · 개당 원가 계산 (Node / 브라우저 공용)
 */

function parsePackUnit(buyText) {
  const t = buyText || "";
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
  const ea = t.match(/(\d+)\s*개/);
  if (ea) return { kind: "ea", amount: parseInt(ea[1], 10) };
  return null;
}

function parseUsageUnit(amount, label) {
  const a = amount || "";
  const ml = a.match(/([\d.]+)\s*ml/i);
  if (ml) return { kind: "ml", amount: parseFloat(ml[1]) };
  if (/0\.25컵/.test(a)) return { kind: "ml", amount: 50 };
  if (/0\.5컵/.test(a)) return { kind: "ml", amount: 100 };
  if (/0\.75컵/.test(a)) return { kind: "ml", amount: 150 };
  if (/1\.5컵/.test(a)) return { kind: "ml", amount: 300 };
  if (/1컵/.test(a)) return { kind: "ml", amount: 200 };
  const g = a.match(/([\d.]+)\s*g/i);
  if (g) return { kind: "g", amount: parseFloat(g[1]) };
  const sticks = a.match(/(\d+(?:\.\d+)?)\s*(?:개|입|샷|스틱|펌프|스푼|큰술|티백|캔)/);
  if (sticks) return { kind: "ea", amount: parseFloat(sticks[1]) };
  if (/1~2|1-2/.test(a)) return { kind: "ea", amount: 1.5 };
  if (/3샷|3입/.test(a)) return { kind: "ea", amount: 3 };
  if (/2샷|2입|2개|2스틱/.test(a)) return { kind: "ea", amount: 2 };
  if (/1샷|1입|1개|1스틱|1펌프|1큰술|1티백/.test(a)) return { kind: "ea", amount: 1 };
  if (/티백/.test(label || "") && !a) return { kind: "ea", amount: 1 };
  return null;
}

/** 팩 전체가 ÷ 규격 → 개당(또는 ml/g당) 원가 */
function calcPackEconomics(packPrice, buyText) {
  const unit = parsePackUnit(buyText);
  if (!unit || unit.amount <= 0 || !packPrice) {
    return { packPrice, packUnits: null, unitKind: null, unitPrice: null };
  }
  return {
    packPrice,
    packUnits: unit.amount,
    unitKind: unit.kind,
    unitPrice: Math.max(1, Math.round(packPrice / unit.amount)),
  };
}

/** 1회 사용량 기준 원가 */
function calcPortionCost(packPrice, buyText, amount, label) {
  const packUnit = parsePackUnit(buyText);
  const usageUnit = parseUsageUnit(amount, label);
  if (!packUnit || !usageUnit || packUnit.kind !== usageUnit.kind) return null;
  if (packUnit.amount <= 0 || usageUnit.amount <= 0) return null;
  return Math.max(1, Math.round((packPrice / packUnit.amount) * usageUnit.amount));
}

const api = { parsePackUnit, parseUsageUnit, calcPackEconomics, calcPortionCost };

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
