/**
 * 마트 실판매가 대비 집 재료 원가 감사
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_PATH = path.join(__dirname, "../data.js");
const code = fs.readFileSync(DATA_PATH, "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code + "\nthis.MENUS = MENUS;", ctx);

// label 패턴 → { min, max, note } (2025~2026 이마트·쿠팡 기준)
const HOME_EXPECT = [
  [/자몽청 2스푼/, { min: 350, max: 480, note: "1kg 9,000~11,000원, 2큰술(~40g)" }],
  [/투게더 3스푼/, { min: 350, max: 480, note: "473ml 3,500~4,500원, 3큰술" }],
  [/투게더\(150g\)/, { min: 1200, max: 1800, note: "473ml 3,980원, 150g/400g" }],
  [/죠리퐁/, { min: 250, max: 350, note: "108g 1,500~2,000원, 0.5컵" }],
  [/냉동 망고$/, { min: 800, max: 1100, note: "1kg 5,500~6,500원, 150g" }],
  [/냉동 딸기/, { min: 600, max: 850, note: "1kg 6,000~7,500원, 100g" }],
  [/냉동 블루베리/, { min: 750, max: 1000, note: "1kg 8,000~10,000원, 100g" }],
  [/복숭아 국물/, { min: 300, max: 450, note: "통조림 820g 2,500~3,200원, 국물 60ml" }],
  [/망고 주스/, { min: 220, max: 320, note: "200ml 850~950원, 60ml" }],
  [/포멜로$/, { min: 2000, max: 4000, note: "자몽·포멜로 1개 2,500~3,500원" }],
  [/코코넛 밀크/, { min: 500, max: 650, note: "400ml 1,180~1,580원, 150ml" }],
  [/드링킹 요거트/, { min: 450, max: 650, note: "150ml 480~620원" }],
  [/요거트 젤라또/, { min: 450, max: 650, note: "1스쿱 480~620원" }],
  [/콜드브루 원액/, { min: 600, max: 850, note: "1L 4,500~5,500원, 130ml" }],
  [/토피넛 라떼 스틱/, { min: 200, max: 280, note: "20입 4,000~4,800원" }],
  [/^시럽$/, { min: 150, max: 220, note: "시럽 3펌프" }],
  [/딸기소스/, { min: 150, max: 220, note: "딸기소스 3펌프" }],
  [/^설탕 시럽$/, { min: 50, max: 90, note: "시럽 1펌프" }],
  [/^바닐라 시럽$/, { min: 200, max: 280, note: "바닐라 15ml" }],
  [/^헤이즐넛 시럽$/, { min: 220, max: 320, note: "500ml 8,000~9,500원, 1큰술" }],
  [/^초콜릿 시럽$/, { min: 70, max: 110, note: "15ml 드리즐" }],
  [/^아몬드 시럽$/, { min: 55, max: 85, note: "10ml" }],
  [/설탕$|설탕 1큰술/, { min: 8, max: 20, note: "설탕 1큰술" }],
  [/초코 파우더/, { min: 250, max: 350, note: "코코아 20~30g" }],
  [/복숭아 아이스티 파우더/, { min: 200, max: 320, note: "65g 1회분" }],
  [/우롱찻잎/, { min: 100, max: 180, note: "티백 2개+물" }],
  [/티백$|홍차 티백/, { min: 80, max: 200, note: "홍차 티백" }],
  [/콩가루/, { min: 250, max: 350, note: "인절미 가루 2큰술(20g)" }],
  [/두유$/, { min: 380, max: 480, note: "두유 175~200ml" }],
  [/망고$/, { min: 850, max: 1100, note: "냉동 망고 200g" }],
  [/바닐라 아이스크림$/, { min: 300, max: 420, note: "3~4큰술" }],
  [/휘핑크림/, { min: 200, max: 450, note: "40~65g" }],
  [/생크림$/, { min: 250, max: 550, note: "50~80ml" }],
  [/타로 파우더/, { min: 250, max: 350, note: "타로가루 3큰술" }],
  [/곡물 파우더/, { min: 200, max: 280, note: "60g" }],
  [/파우더 5스푼/, { min: 400, max: 550, note: "테너 5스푼(35g)" }],
  [/달고나$/, { min: 130, max: 220, note: "시판 달고나" }],
  [/우유 0\.5컵|우유 100ml/, { min: 230, max: 280, note: "100ml @ 2.5원/ml" }],
  [/우유 1컵|우유 200ml/, { min: 480, max: 520, note: "200ml @ 2.5원/ml" }],
  [/커피믹스/, { min: 100, max: 130, note: "믹스 3봉" }],
  [/에스프레소 액상스틱/, { min: 180, max: 220, note: "2개" }],
];

const issues = [];

ctx.MENUS.forEach((menu) => {
  (menu.recipe?.homeIngredients || []).forEach((item) => {
    if (typeof item !== "object" || !item.cost) return;
    for (const [re, exp] of HOME_EXPECT) {
      if (re.test(item.label)) {
        if (item.cost < exp.min || item.cost > exp.max) {
          issues.push({
            menu: menu.name,
            label: item.label,
            cost: item.cost,
            expect: `${exp.min}~${exp.max}`,
            note: exp.note,
          });
        }
        break;
      }
    }
  });
});

console.log("=== 집 재료 마트가 범위 이탈 ===");
console.log(`총 ${issues.length}건\n`);
issues.forEach((i) => {
  console.log(`[${i.menu}] ${i.label}`);
  console.log(`  현재: ${i.cost}원 | 기대: ${i.expect}원 | ${i.note}\n`);
});
