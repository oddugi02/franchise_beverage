// 매장 ingredients: 프랜차이즈 B2B·업체용 재료(알바 제보·원가 추정)
// 집 recipe.homeIngredients: 마트·쿠팡 등 소비자 실판매가 기준 1회 분량 (2025~2026)
//
// [매장 B2B 단가 기준]
// - 우유 ~1,500원/L (1.5원/ml) · 원두 에스프레소 ~68원/샷(7g)
// - 시럽·농축액 ~7원/ml · 파우더·베이스 ~9원/g · 과일퓨레 ~3.5원/g
// - 타피오카·펄 ~3.8원/g · 휘핑·크림 ~5.5원/g · 컵 95~115원 · 얼음 25원
//
// [집 마트 실판매가 기준]
// - 우유 1L 2,480~2,980원 (2.5원/ml) · 액상스틱 99원/개 · 커피스틱 45원/개
// - 얼음 1잔 50원 · 투게더 3스푼 400원 · 죠리퐁 0.5컵 290원
// - 냉동망고 150g 900원 · 황도통조림 국물 60ml 360원 · 자몽청 2스푼 400원
// - 설탕시럽 3펌프 180원 · 헤이즐넛시럽 1큰술 270원 · 포멜로 1개 2,800원
const MENUS = [
  {
    id: "mega-pong",
    brand: "메가커피",
    name: "플레인퐁크러쉬",
    category: "프라페·프라푸치노",
    price: 3900,
    emoji: "🧇",
    photoBg: "#FFF8E1",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "0.5컵", cost: 150 },
      { name: "프라페 베이스 시럽", amount: "35ml", cost: 245 },
      { name: "와플 크럼", amount: "30g", cost: 240 },
      { name: "휘핑크림", amount: "30g", cost: 165 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "0.5컵", cost: 250, replaces: "우유" },
        { label: "투게더", amount: "3스푼", cost: 400, replaces: ["프라페 베이스 시럽", "휘핑크림"] },
        { label: "얼음", amount: "5개", cost: 50, replaces: "얼음" },
        { label: "죠리퐁", amount: "0.5컵", cost: 290, replaces: "와플 크럼" },
      ],
      steps: [
        { title: "재료 넣기", body: "믹서기에 우유 0.5컵, 투게더 3스푼, 얼음 5개, 죠리퐁 0.5컵을 넣습니다." },
        { title: "블렌딩", body: "처음엔 가장 강한 3단으로 갈다가, 1~2단으로 줄여 살짝만 갈아줍니다." },
        { title: "맛 조절", body: "맛을 보고 취향에 맞게 재료를 자유롭게 추가합니다." },
        { title: "토핑", body: "마지막으로 음료 위에 죠리퐁을 올려 마무리합니다." },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "블렌더 강도를 줄이면 죠리퐁 식감이 더 살아납니다",
    },
  },
  {
    id: "mega-hal",
    brand: "메가커피",
    name: "할메가커피",
    category: "커피",
    price: 2100,
    emoji: "☕",
    photoBg: "#E8F5E9",
    recipeReady: true,
    ingredients: [
      { name: "원두(에스프레소)", amount: "21g (3샷)", cost: 204 },
      { name: "물", amount: "1.5컵", cost: 5 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "커피믹스", amount: "3봉", cost: 114, replaces: "원두(에스프레소)" },
        { label: "프림", amount: "1~2스푼", cost: 40, replaces: "원두(에스프레소)" },
        { label: "설탕", amount: "1스푼", cost: 10, replaces: "원두(에스프레소)" },
        { label: "뜨거운 물", amount: "0.5컵", cost: 5, replaces: "물" },
        { label: "찬물", amount: "나머지", cost: 5, replaces: "물" },
        { label: "우유", amount: "나머지", cost: 375, replaces: "물" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "커피 베이스", body: "큰 컵에 커피믹스, 설탕, 프림을 넣고 뜨거운 물 0.5컵을 부어 완전히 녹여줍니다." },
        { title: "얼음 채우기", body: "마실 잔에 얼음을 가득 채웁니다." },
        { title: "완성", body: "녹여 둔 커피 베이스를 붓고, 나머지 공간을 찬물이나 우유로 채워 잘 저어 마십니다." },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "달달한 다방 커피를 대용량으로 즐기는 홈카페 레시피",
    },
  },
  {
    id: "mega-unicorn",
    brand: "메가커피",
    name: "유니콘 프라페",
    category: "프라페·프라푸치노",
    price: 4800,
    emoji: "🦄",
    photoBg: "#F3E5F5",
    discontinued: true,
    recipeReady: true,
    ingredients: [
      { name: "쿠키 베이스(업체용)", amount: "100ml", cost: 280 },
      { name: "우유", amount: "100ml", cost: 150 },
      { name: "유니콘 파우더·시럽", amount: "2펌프", cost: 140 },
      { name: "레몬주스", amount: "3~4펌프", cost: 120 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "휘핑크림", amount: "40g", cost: 220 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "쿠키베이스", amount: "100ml", cost: 260, replaces: "쿠키 베이스(업체용)" },
        { label: "우유", amount: "100ml", cost: 250, replaces: "우유" },
        { label: "유니콘 파우더", amount: "2펌프", cost: 340, replaces: "유니콘 파우더·시럽" },
        { label: "레몬주스", amount: "컵 벽면 1바퀴", cost: 160, replaces: "레몬주스" },
        { label: "얼음", amount: "적당량", cost: 50, replaces: "얼음" },
        { label: "휘핑크림", amount: "토핑", cost: 232, replaces: "휘핑크림" },
      ],
      steps: [
        { title: "블렌딩", body: "블렌더에 쿠키베이스 100ml, 우유 100ml, 유니콘 파우더 2펌프, 얼음을 넣고 갈아줍니다." },
        { title: "컵 코팅", body: "컵 벽면에 레몬주스를 한 바퀴 둘러 상큼한 베이스를 만듭니다." },
        { title: "담기", body: "갈아 둔 프라페를 컵에 부어줍니다." },
        { title: "토핑", body: "휘핑크림을 올리거나, 바닐라 아이스크림으로 바꿔 더 달콤하게 즐깁니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "단종 메뉴 · 유니콘 파우더 없으면 색 시럽으로 대체",
    },
  },
  {
    id: "gongcha-black",
    brand: "공차",
    name: "블랙 밀크티 + 펄",
    category: "버블티·밀크티",
    price: 5100,
    emoji: "🧋",
    photoBg: "#EFEBE9",
    recipeReady: true,
    ingredients: [
      { name: "블랙티 농축 베이스", amount: "50ml", cost: 315 },
      { name: "우유", amount: "0.75컵", cost: 225 },
      { name: "흑당·과당 시럽", amount: "25ml", cost: 175 },
      { name: "타피오카 펄", amount: "80g", cost: 304 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "티백", amount: "1~2개", cost: 90, replaces: "블랙티 농축 베이스" },
        { label: "물", amount: "0.75컵", cost: 5, replaces: "블랙티 농축 베이스" },
        { label: "우유", amount: "0.75컵", cost: 375, replaces: "우유" },
        { label: "설탕", amount: "1~2스푼", cost: 10, replaces: "흑당·과당 시럽" },
        { label: "타피오카 펄", amount: "40~80g", cost: 200, replaces: "타피오카 펄" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "홍차 우려내기", body: "물 0.75컵을 끓인 후 티백을 넣고 3~5분간 진하게 우려냅니다." },
        { title: "밀크티 완성", body: "우려낸 홍차에 우유 0.75컵과 설탕(또는 꿀)을 넣어 잘 저어줍니다." },
        { title: "펄 추가", body: "타피오카 펄을 끓는 물에 15분간 삶은 뒤 헹궈 컵 바닥에 깔고, 밀크티를 부어줍니다." },
        { title: "얼음", body: "얼음을 가득 넣어 시원하게 즐깁니다." },
      ],
      difficulty: 2,
      time: "약 25분",
      note: "펄 없이 밀크티만 만들어도 OK · Large 1잔 기준",
    },
  },
  {
    id: "gongcha-taro",
    brand: "공차",
    name: "타로 밀크티 + 펄",
    category: "버블티·밀크티",
    price: 5200,
    emoji: "🫧",
    photoBg: "#EDE7F6",
    recipeReady: true,
    ingredients: [
      { name: "타로 파우더(업체용)", amount: "35g", cost: 315 },
      { name: "우유", amount: "0.75컵", cost: 225 },
      { name: "과당 시럽", amount: "20ml", cost: 140 },
      { name: "타피오카 펄", amount: "80g", cost: 304 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "타피오카 펄", amount: "40g", cost: 200, replaces: "타피오카 펄" },
        { label: "타로 파우더", amount: "3큰술", cost: 290, replaces: "타로 파우더(업체용)" },
        { label: "뜨거운 물", amount: "0.25컵", cost: 5, replaces: "타로 파우더(업체용)" },
        { label: "설탕", amount: "1큰술", cost: 10, replaces: "과당 시럽" },
        { label: "우유", amount: "0.75컵", cost: 375, replaces: "우유" },
        { label: "얼음", amount: "적당량", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "펄 삶기", body: "물 1컵을 끓인 후 타피오카 펄 40g을 넣어 15분간 저어가며 삶고, 불을 끈 뒤 5분 뜸 드립니다. 찬물에 헹궈 물기를 뺍니다." },
        { title: "타로 베이스", body: "뜨거운 물 0.25컵에 타로 파우더 3큰술과 설탕 1큰술을 넣어 덩어리 없이 풀어줍니다." },
        { title: "완성", body: "컵에 펄과 얼음을 넣고, 타로 물을 붓은 뒤 우유 0.75컵을 부어 잘 저어 마십니다." },
      ],
      difficulty: 2,
      time: "약 25분",
      note: "펄은 선택 · 타로 파우더는 마트·온라인에서 구매",
    },
  },
  {
    id: "gongcha-mango",
    brand: "공차",
    name: "망고 요구르트 + 화이트 펄",
    category: "스무디·쉐이크",
    price: 5800,
    emoji: "🥭",
    photoBg: "#FFF9C4",
    recipeReady: true,
    ingredients: [
      { name: "망고 퓨레(업체용)", amount: "120g", cost: 420 },
      { name: "요거트 베이스(업체용)", amount: "150ml", cost: 315 },
      { name: "화이트 펄(업체용)", amount: "70g", cost: 266 },
      { name: "망고 시럽(업체용)", amount: "20ml", cost: 140 },
      { name: "얼음", amount: "0.5컵", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "냉동 망고", amount: "150g", cost: 900, replaces: "망고 퓨레(업체용)" },
        { label: "드링킹 요거트", amount: "150ml", cost: 550, replaces: "요거트 베이스(업체용)" },
        { label: "화이트 펄", amount: "적당량", cost: 230, replaces: "화이트 펄(업체용)" },
        { label: "얼음", amount: "선택", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "화이트 펄 준비", body: "화이트 펄을 체에 밭쳐 물기를 빼고, 설탕물이나 시럽에 살짝 버무려 둡니다." },
        { title: "망고 베이스", body: "냉동 망고를 컵 바닥에 깔거나, 믹서에 망고·얼음을 넣어 걸쭉하게 갈아 준비합니다." },
        { title: "요구르트 층", body: "망고 베이스 위에 드링킹 요거트를 천천히 부어 층을 만듭니다." },
        { title: "마무리", body: "화이트 펄을 올려 마무리합니다. 얼음을 넣고 갈아 스무디로 만들어도 OK." },
      ],
      difficulty: 2,
      time: "약 10분",
      note: "화이트 펄 대신 곤약·타피오카 펄 사용 가능",
    },
  },
  {
    id: "compose-shake",
    brand: "컴포즈커피",
    name: "커피 밀크쉐이크",
    category: "스무디·쉐이크",
    price: 5500,
    emoji: "🥛",
    photoBg: "#EFEBE9",
    recipeReady: true,
    ingredients: [
      { name: "테너 파우더 밀크쉐이크", amount: "5스푼", cost: 100 },
      { name: "우유", amount: "1컵", cost: 300 },
      { name: "원두(에스프레소)", amount: "2샷 (60ml)", cost: 136 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "1컵", cost: 500, replaces: "우유" },
        { label: "파우더", amount: "5스푼", cost: 460, replaces: "테너 파우더 밀크쉐이크" },
        { label: "커피 스틱", amount: "5개", cost: 225, replaces: "원두(에스프레소)" },
        { label: "얼음", amount: "액체 높이만큼", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "커피 베이스", body: "커피 스틱 5개를 물에 녹여 진한 커피 베이스를 만듭니다." },
        { title: "재료 넣기", body: "블렌더에 우유 1컵, 파우더 5스푼, 커피 베이스를 넣습니다." },
        { title: "얼음 추가", body: "액체 재료 높이만큼 얼음을 넣습니다." },
        { title: "블렌딩", body: "고르게 갈아 컵에 담으면 컴포즈 커피 밀크쉐이크 완성!" },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "매일유업 테너 파우더 사용 · 커피 4스틱은 밀크쉐이크 맛, 5.5~6스푼은 더 달게",
    },
  },
  {
    id: "compose-vanilla",
    brand: "컴포즈커피",
    name: "바닐라라떼",
    category: "라떼",
    price: 2500,
    emoji: "☕",
    photoBg: "#FFF8E1",
    recipeReady: true,
    ingredients: [
      { name: "원두(에스프레소)", amount: "2샷 (60ml)", cost: 136 },
      { name: "우유", amount: "1컵", cost: 300 },
      { name: "바닐라 시럽(업체용)", amount: "3~4펌프", cost: 140 },
      { name: "바닐라 빈 파우더", amount: "0.5티스푼", cost: 225 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "에스프레소 액상스틱", amount: "2개", cost: 198, replaces: "원두(에스프레소)" },
        { label: "바닐라 시럽", amount: "3~4펌프", cost: 240, replaces: "바닐라 시럽(업체용)" },
        { label: "바닐라 빈 파우더", amount: "0.5티스푼", cost: 90, replaces: "바닐라 빈 파우더" },
        { label: "우유", amount: "1컵", cost: 500, replaces: "우유" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "바닐라 베이스", body: "에스프레소 액상스틱에 바닐라 시럽과 바닐라 빈 파우더를 넣어 덩어리 없이 잘 저어줍니다." },
        { title: "얼음·우유", body: "얼음을 가득 담은 컵에 우유를 부어줍니다." },
        { title: "완성", body: "바닐라 에스프레소 베이스를 우유 위에 부어 층을 만듭니다. 마실 때 빨대로 저어 드세요." },
      ],
      difficulty: 1,
      time: "약 3분",
      note: "파우더 없으면 시럽 1펌프 추가 · 더 진하게는 액상스틱 1개 더",
    },
  },
  {
    id: "compose-grain",
    brand: "컴포즈커피",
    name: "곡물라떼",
    category: "라떼",
    price: 3300,
    emoji: "🌾",
    photoBg: "#F5F5DC",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "250ml", cost: 375 },
      { name: "곡물라떼 파우더(업체용)", amount: "60g", cost: 360 },
      { name: "과당 시럽", amount: "15g (1.5펌프)", cost: 105 },
      { name: "얼음", amount: "8개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "250ml", cost: 625, replaces: "우유" },
        { label: "곡물 파우더", amount: "60g", cost: 230, replaces: "곡물라떼 파우더(업체용)" },
        { label: "설탕 시럽", amount: "1.5펌프", cost: 60, replaces: "과당 시럽" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "블렌딩", body: "블렌더에 우유, 곡물 파우더, 설탕 시럽을 넣어줍니다." },
        { title: "믹스", body: "내용물이 뭉치지 않고 잘 섞이도록 가볍게 갈아줍니다." },
        { title: "담기", body: "컵에 얼음을 가득 채운 뒤, 잘 섞인 곡물 베이스를 붓어줍니다." },
        { title: "토핑 (선택)", body: "완성된 음료 위에 아몬드 슬라이스를 살짝 뿌리면 매장처럼 고소함을 더할 수 있어요." },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "아몬드 슬라이스는 선택 · 미숫가루로 곡물 파우더 대체 가능",
    },
  },
  {
    id: "twosome-royal",
    brand: "투썸플레이스",
    name: "로얄 밀크티 쉐이크",
    category: "스무디·쉐이크",
    price: 6500,
    emoji: "🍵",
    photoBg: "#EFEBE9",
    recipeReady: true,
    ingredients: [
      { name: "얼그레이 농축액", amount: "150ml", cost: 270 },
      { name: "우유", amount: "200ml", cost: 300 },
      { name: "쉐이크 베이스(바닐라)", amount: "150g", cost: 600 },
      { name: "소프트 아이스크림(토핑)", amount: "60g", cost: 270 },
      { name: "얼음", amount: "6개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "150ml", cost: 375, replaces: "얼그레이 농축액" },
        { label: "홍차 티백", amount: "2개", cost: 180, replaces: "얼그레이 농축액" },
        { label: "투게더", amount: "150g", cost: 1493, replaces: "쉐이크 베이스(바닐라)" },
        { label: "우유", amount: "50ml", cost: 125, replaces: "우유" },
        { label: "얼음", amount: "약간", cost: 50, replaces: "얼음" },
        { label: "아이스크림", amount: "1스쿱", cost: 520, replaces: "소프트 아이스크림(토핑)" },
      ],
      steps: [
        { title: "홍차 우려내기", body: "따뜻하게 데운 우유 150ml에 홍차 티백 2개를 넣고 3~5분간 진하게 우려낸 뒤 티백을 짜서 제거합니다." },
        { title: "쉐이크 블렌딩", body: "믹서기에 진하게 우린 밀크티, 투게더(150g), 우유 50ml, 약간의 얼음을 넣고 부드럽게 갈아줍니다." },
        { title: "농도 조절", body: "너무 묽다면 아이스크림을 추가하고, 너무 되직하다면 우유를 소량 추가하여 농도를 맞춥니다." },
        { title: "완성", body: "완성된 밀크티 쉐이크를 컵에 붓고, 그 위에 아이스크림 1스쿱을 얹어 완성합니다." },
      ],
      difficulty: 2,
      time: "약 15분",
      note: "얼그레이·홍차 티백 사용 · 바닐라 시럽·설탕은 취향껏",
    },
  },
  {
    id: "twosome-applemango",
    brand: "투썸플레이스",
    name: "애플망고 피치 프라페",
    category: "프라페·프라푸치노",
    price: 6800,
    emoji: "🥭",
    photoBg: "#FFF3E0",
    recipeReady: true,
    ingredients: [
      { name: "복숭아 제조 베이스", amount: "120g", cost: 420 },
      { name: "망고 패션후르츠 농축액", amount: "35g", cost: 270 },
      { name: "냉동 애플망고 다이스(업체용)", amount: "50g", cost: 275 },
      { name: "정수 물", amount: "40g", cost: 5 },
      { name: "얼음", amount: "190g", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "얼음", amount: "적당량", cost: 50, replaces: "얼음" },
        { label: "냉동 망고", amount: "150g", cost: 900, replaces: "냉동 애플망고 다이스(업체용)" },
        { label: "복숭아 국물", amount: "60ml", cost: 360, replaces: "복숭아 제조 베이스" },
        { label: "망고 주스", amount: "60ml", cost: 270, replaces: "망고 패션후르츠 농축액" },
        { label: "물", amount: "적당량", cost: 10, replaces: "정수 물" },
      ],
      steps: [
        { title: "재료 넣기", body: "믹서기에 얼음과 냉동 망고를 먼저 넣습니다." },
        { title: "베이스 추가", body: "복숭아 국물(혹은 피치 시럽)과 망고 주스를 붓어줍니다." },
        { title: "블렌딩", body: "모든 재료가 부드러운 슬러시 형태가 될 때까지 곱게 갈아줍니다." },
        { title: "레이어링 (선택)", body: "컵 아래에 복숭아 베이스나 통조림 황도 조각을 깔고 음료를 부으면 층진 비주얼을 낼 수 있어요." },
      ],
      difficulty: 2,
      time: "약 5분",
      note: "피치 시럽으로 복숭아 국물 대체 가능 · 농도는 물·우유로 조절",
    },
  },
  {
    id: "paik-cookie",
    brand: "빽다방",
    name: "쿠키크런치 빽스치노",
    category: "프라페·프라푸치노",
    price: 3800,
    emoji: "🍪",
    photoBg: "#EFEBE9",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "200ml", cost: 300 },
      { name: "빽스치노 베이스 파우더", amount: "2큰술", cost: 315 },
      { name: "쿠키 크럼(업체용)", amount: "35g", cost: 280 },
      { name: "초코 크럼 토핑", amount: "30g", cost: 240 },
      { name: "바닐라·슈가 시럽", amount: "3~4펌프", cost: 140 },
      { name: "얼음", amount: "290g (1컵)", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "200ml", cost: 500, replaces: "우유" },
        { label: "바닐라 파우더", amount: "2큰술", cost: 100, replaces: "빽스치노 베이스 파우더" },
        { label: "시럽", amount: "3~4펌프", cost: 180, replaces: "바닐라·슈가 시럽" },
        { label: "얼음", amount: "1컵", cost: 50, replaces: "얼음" },
        { label: "초코 쿠키", amount: "3개", cost: 250, replaces: "쿠키 크럼(업체용)" },
        { label: "초코 크런치", amount: "3큰술", cost: 190, replaces: "초코 크럼 토핑" },
      ],
      steps: [
        { title: "베이스 넣기", body: "블렌더에 우유 200ml, 바닐라 파우더 2큰술, 시럽, 얼음을 넣어줍니다." },
        { title: "쿠키 추가", body: "초코 쿠키 3개를 대충 부숴서 블렌더에 함께 넣습니다." },
        { title: "블렌딩", body: "얼음과 쿠키가 곱게 갈릴 때까지 갈아줍니다." },
        { title: "크런치 식감", body: "초코 크런치 3큰술을 넣고 스푼으로 가볍게 섞거나, 블렌더를 2~3초만 돌려 크런치 식감을 살려줍니다." },
        { title: "토핑 (선택)", body: "컵에 붓고, 소프트 아이스크림·초코 크런치·통 쿠키를 올리면 매장 스타일로 즐길 수 있어요." },
      ],
      difficulty: 2,
      time: "약 5분",
      note: "바닐라 파우더 대신 바닐라 아이스크림·시럽 가능 · 토핑은 선택",
    },
  },
  {
    id: "paik-ashot",
    brand: "빽다방",
    name: "아샷추",
    category: "커피",
    price: 3800,
    emoji: "☕",
    photoBg: "#FFF9C4",
    recipeReady: true,
    ingredients: [
      { name: "복숭아 아이스티 원액", amount: "300ml", cost: 400 },
      { name: "원두(에스프레소)", amount: "1샷 (15ml)", cost: 68 },
      { name: "얼음", amount: "컵 가득", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "복숭아 아이스티 파우더", amount: "65g", cost: 240, replaces: "복숭아 아이스티 원액" },
        { label: "따뜻한 물", amount: "50ml", cost: 5, replaces: "복숭아 아이스티 원액" },
        { label: "차가운 물", amount: "250ml", cost: 10, replaces: "복숭아 아이스티 원액" },
        { label: "얼음", amount: "컵 상기선", cost: 50, replaces: "얼음" },
        { label: "에스프레소", amount: "1샷", cost: 99, replaces: "원두(에스프레소)" },
      ],
      steps: [
        { title: "아이스티 베이스", body: "따뜻한 물 50ml에 복숭아 아이스티 파우더 65g을 완전히 녹여줍니다." },
        { title: "얼음 채우기", body: "큰 컵(약 600~700ml)에 얼음을 컵 상기선까지 넉넉하게 채웁니다." },
        { title: "아이스티 완성", body: "녹여 둔 아이스티 베이스를 얼음 컵에 붓고, 차가운 물 250ml를 더합니다." },
        { title: "샷 추가", body: "에스프레소 1샷을 아이스티 위에 부으면 아샷추 완성! 빨대로 가볍게 저어 드세요." },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "립톤 등 복숭아 아이스티 파우더 사용",
    },
  },
  {
    id: "paik-strawberry",
    brand: "빽다방",
    name: "딸기 빽스치노",
    category: "프라페·프라푸치노",
    price: 4000,
    emoji: "🍓",
    photoBg: "#FCE4EC",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "200ml", cost: 300 },
      { name: "딸기 퓨레(업체용)", amount: "100g", cost: 350 },
      { name: "딸기 시럽", amount: "3펌프", cost: 140 },
      { name: "바나나 베이스 파우더", amount: "2스푼", cost: 225 },
      { name: "과당 시럽", amount: "1펌프", cost: 140 },
      { name: "얼음", amount: "200g", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "200ml", cost: 500, replaces: "우유" },
        { label: "냉동 딸기", amount: "100g", cost: 700, replaces: "딸기 퓨레(업체용)" },
        { label: "딸기소스", amount: "3펌프", cost: 180, replaces: "딸기 시럽" },
        { label: "설탕 시럽", amount: "1펌프", cost: 60, replaces: "과당 시럽" },
        { label: "바나나 파우더", amount: "2스푼", cost: 100, replaces: "바나나 베이스 파우더" },
        { label: "얼음", amount: "200g", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "재료 넣기", body: "블렌더에 우유, 냉동 딸기, 딸기소스, 설탕 시럽, 바나나 파우더를 순서대로 넣어줍니다." },
        { title: "얼음 추가", body: "준비한 얼음을 마지막에 넣어줍니다." },
        { title: "블렌딩", body: "얼음이 잘게 갈리고 모든 재료가 부드럽게 섞이도록 충분히 갈아줍니다." },
        { title: "마무리 (선택)", body: "컵에 담고, 취향에 따라 생크림이나 아이스크림을 얹은 뒤 딸기 소스를 뿌려 완성합니다." },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "딸기청으로 딸기소스 대체 가능 · 토핑은 선택",
    },
  },
  {
    id: "mammoth-honey-coffee",
    brand: "매머드익스프레스",
    name: "꿀 커피",
    category: "커피",
    price: 2300,
    emoji: "🍯",
    photoBg: "#FFF8E1",
    recipeReady: true,
    ingredients: [
      { name: "원두(에스프레소)", amount: "1~2샷 (30ml)", cost: 102 },
      { name: "꿀 시럽(업체용)", amount: "15~20g", cost: 240 },
      { name: "물", amount: "200ml", cost: 5 },
      { name: "얼음", amount: "5개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "꿀", amount: "1~1.5큰술", cost: 200, replaces: "꿀 시럽(업체용)" },
        { label: "에스프레소", amount: "1~2샷", cost: 149, replaces: "원두(에스프레소)" },
        { label: "찬물", amount: "적당량", cost: 5, replaces: "물" },
        { label: "얼음", amount: "적당량", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "꿀 담기", body: "따뜻한 잔에 꿀을 먼저 담아줍니다." },
        { title: "에스프레소 섞기", body: "준비한 에스프레소를 꿀 위에 붓고 잘 저어 꿀을 완전히 녹여줍니다." },
        { title: "아이스", body: "얼음을 채운 잔에 찬물이나 얼음물을 붓고, 꿀을 녹인 에스프레소를 그 위에 부어 섞어줍니다." },
        { title: "핫", body: "따뜻하게 즐길 경우, 따뜻한 물만 적당량 부어 잘 저어주면 완성됩니다." },
      ],
      difficulty: 1,
      time: "약 3분",
      note: "꿀 양은 취향에 맞게 · 카누 등 인스턴트 커피 1스틱으로 대체 가능",
    },
  },
  {
    id: "mammoth-honey-latte",
    brand: "매머드익스프레스",
    name: "꿀 라떼",
    category: "라떼",
    price: 3300,
    emoji: "🍯",
    photoBg: "#FFF8E1",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "150ml", cost: 225 },
      { name: "원두(에스프레소)", amount: "1~2샷 (30ml)", cost: 102 },
      { name: "꿀 시럽(업체용)", amount: "15~20g", cost: 240 },
      { name: "얼음", amount: "5개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "꿀", amount: "1~1.5큰술", cost: 200, replaces: "꿀 시럽(업체용)" },
        { label: "에스프레소", amount: "1~2샷", cost: 149, replaces: "원두(에스프레소)" },
        { label: "우유", amount: "150ml", cost: 375, replaces: "우유" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "꿀·에스프레소", body: "잔에 꿀과 에스프레소 샷을 넣고 꿀이 잘 녹도록 저어줍니다." },
        { title: "우유", body: "얼음을 가득 채운 다른 잔에 준비한 우유(또는 식물성 음료)를 부어줍니다." },
        { title: "완성", body: "꿀과 섞인 에스프레소를 우유 위에 살포시 부어 층을 만들거나, 잘 저어서 섞어 마십니다." },
        { title: "핫", body: "따뜻한 꿀 라떼를 원할 때는 우유를 데운 뒤 꿀+에스프레소와 섞어주면 됩니다." },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "오트우유·아몬드브리즈·두유로 고소함 UP",
    },
  },
  {
    id: "chabaek-mango",
    brand: "차백도",
    name: "망고 포멜로 사고",
    category: "에이드·과일",
    price: 6900,
    emoji: "🥭",
    photoBg: "#FFF9C4",
    recipeReady: true,
    ingredients: [
      { name: "망고 퓨레(업체용)", amount: "150g", cost: 525 },
      { name: "사고(사가)", amount: "35g", cost: 280 },
      { name: "포멜로·자몽 과육(냉동)", amount: "80g", cost: 440 },
      { name: "코코넛밀크(농축)", amount: "150ml", cost: 330 },
      { name: "우유", amount: "50ml", cost: 75 },
      { name: "연유", amount: "15ml", cost: 120 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "사고 펄", amount: "35g", cost: 290, replaces: "사고(사가)" },
        { label: "망고", amount: "1.5개", cost: 980, replaces: "망고 퓨레(업체용)" },
        { label: "코코넛 밀크", amount: "150ml", cost: 555, replaces: "코코넛밀크(농축)" },
        { label: "우유", amount: "50ml", cost: 125, replaces: "우유" },
        { label: "연유", amount: "1~2큰술", cost: 95, replaces: "연유" },
        { label: "포멜로", amount: "적당량", cost: 2800, replaces: "포멜로·자몽 과육(냉동)" },
      ],
      steps: [
        { title: "사고 펄 삶기", body: "끓는 물에 사고 펄을 넣고 10~15분간 삶아줍니다. 가운데 하얀 심지가 살짝 남았을 때 불을 끄고 뚜껑을 덮어 10분간 뜸을 들입니다." },
        { title: "사고 펄 헹구기", body: "다 익은 사고 펄은 찬물에 여러 번 헹궈 전분기를 빼고 쫀득한 식감을 살려줍니다." },
        { title: "망고 베이스", body: "망고 1.5개 분량과 코코넛 밀크, 우유, 연유(또는 알룰로스)를 믹서기에 넣고 부드럽게 갈아줍니다. 남은 망고 0.5개는 깍둑썰기해 둡니다." },
        { title: "마무리", body: "컵에 사고 펄, 깍둑썰기한 망고, 포멜로(또는 자몽) 과육을 넣고 갈아 둔 망고 베이스를 부어줍니다. 냉장고 2~3시간 숙성하면 풍미가 더 깊어져요." },
      ],
      difficulty: 3,
      time: "약 40분",
      note: "사고 펄은 작은 타피오카로 대체 가능 · 숙성은 선택",
    },
  },
  {
    id: "chabaek-soybean",
    brand: "차백도",
    name: "소이빈 밀크티",
    category: "버블티·밀크티",
    price: 6200,
    emoji: "🫘",
    photoBg: "#EFEBE9",
    recipeReady: true,
    ingredients: [
      { name: "우롱차 농축액", amount: "150ml", cost: 270 },
      { name: "두유 베이스(매장용)", amount: "175ml", cost: 245 },
      { name: "소이빈 파우더(업체용)", amount: "2큰술", cost: 315 },
      { name: "과당·연유 시럽", amount: "1큰술", cost: 140 },
      { name: "찰떡·인절미 토핑", amount: "30g", cost: 210 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "뜨거운 물", amount: "150ml", cost: 5, replaces: "우롱차 농축액" },
        { label: "우롱찻잎", amount: "티백 1~2개", cost: 130, replaces: "우롱차 농축액" },
        { label: "설탕", amount: "1~2스푼", cost: 10, replaces: "과당·연유 시럽" },
        { label: "연유", amount: "1큰술", cost: 95, replaces: "과당·연유 시럽" },
        { label: "두유", amount: "175ml", cost: 420, replaces: "두유 베이스(매장용)" },
        { label: "콩가루", amount: "2큰술", cost: 280, replaces: "소이빈 파우더(업체용)" },
        { label: "찰떡", amount: "30g", cost: 263, replaces: "찰떡·인절미 토핑" },
      ],
      steps: [
        { title: "차 우리기", body: "뜨거운 물 150ml에 우롱찻잎(또는 티백)을 넣고 4~5분간 진하게 우려낸 후 찻잎을 건져냅니다." },
        { title: "달콤함", body: "우려낸 우롱차에 설탕이나 연유를 넣고 완전히 녹여줍니다." },
        { title: "두유 섞기", body: "따뜻하거나 시원하게 데운 두유를 우롱차와 섞어줍니다." },
        { title: "마무리", body: "컵에 담고 콩가루를 솔솔 뿌려줍니다. 찰떡이나 인절미를 넣으면 식감을 살릴 수 있어요." },
      ],
      difficulty: 2,
      time: "약 15분",
      note: "검은콩 두유·베지밀 추천 · 토핑은 선택",
    },
  },
  {
    id: "ediya-toffee",
    brand: "이디야",
    name: "토피넛 라떼",
    category: "라떼",
    price: 4500,
    emoji: "🌰",
    photoBg: "#FFF8E1",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "200ml", cost: 300 },
      { name: "원두(에스프레소)", amount: "2샷 (30ml)", cost: 136 },
      { name: "토피·헤이즐넛 시럽", amount: "25ml", cost: 175 },
      { name: "얼음", amount: "5개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "땅콩버터", amount: "1큰술", cost: 115, replaces: "" },
        { label: "토피넛 라떼 스틱", amount: "1개", cost: 225, replaces: ["토피·헤이즐넛 시럽", "원두(에스프레소)"] },
        { label: "우유", amount: "50ml", cost: 125, replaces: "우유" },
        { label: "우유", amount: "150ml", cost: 375, replaces: "우유" },
        { label: "땅콩", amount: "토핑", cost: 55, replaces: "" },
      ],
      steps: [
        { title: "베이스 섞기", body: "잔에 땅콩버터와 토피넛 라떼 스틱(또는 파우더)을 넣고, 우유 50ml를 부어 잘 섞습니다." },
        { title: "우유 거품", body: "나머지 우유 150ml를 따뜻하게 데워 거품을 내어 올립니다." },
        { title: "토핑", body: "다진 땅콩을 올려 마무리합니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "스틱·파우더에 커피 맛이 포함돼 별도 에스프레소 없이도 OK",
    },
  },
  {
    id: "ediya-flat",
    brand: "이디야",
    name: "토피넛 플랫치노",
    category: "프라페·프라푸치노",
    price: 4700,
    emoji: "🥤",
    photoBg: "#E8F5E9",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "100ml", cost: 150 },
      { name: "토피·헤이즐넛 시럽", amount: "25ml", cost: 175 },
      { name: "원두(에스프레소)", amount: "2샷 (30ml)", cost: 136 },
      { name: "연유(업체용)", amount: "15ml", cost: 120 },
      { name: "휘핑크림(업체용)", amount: "35g", cost: 193 },
      { name: "얼음", amount: "1.5컵", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "토피넛 파우더", amount: "3~4큰술", cost: 230, replaces: "원두(에스프레소)" },
        { label: "우유", amount: "150ml", cost: 375, replaces: "우유" },
        { label: "연유", amount: "1큰술", cost: 95, replaces: "연유(업체용)" },
        { label: "헤이즐넛 시럽", amount: "1큰술", cost: 270, replaces: "토피·헤이즐넛 시럽" },
        { label: "얼음", amount: "1.5컵", cost: 50, replaces: "얼음" },
        { label: "휘핑크림", amount: "토핑", cost: 232, replaces: "휘핑크림(업체용)" },
        { label: "견과류", amount: "토핑", cost: 290, replaces: "휘핑크림(업체용)" },
      ],
      steps: [
        { title: "블렌더에 재료 넣기", body: "토피넛 파우더(또는 스틱), 우유, 연유, 헤이즐넛 시럽을 블렌더에 넣습니다." },
        { title: "얼음 추가 및 블렌딩", body: "얼음을 넣고 얼음이 곱게 갈릴 때까지 갈아줍니다." },
        { title: "컵에 담기", body: "완성된 음료를 컵에 붓습니다." },
        { title: "토핑", body: "휘핑크림을 듬뿍 올린 뒤, 잘게 부순 견과류를 뿌려 마무리합니다." },
      ],
      difficulty: 2,
      time: "약 5분",
      note: "견과류는 땅콩·아몬드 등 취향대로",
    },
  },
  {
    id: "hasamdong-dalgona",
    brand: "하삼동커피",
    name: "달고나 카페라떼",
    category: "라떼",
    price: 4000,
    emoji: "🍮",
    photoBg: "#FFF8E1",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "200ml", cost: 300 },
      { name: "원두(에스프레소)", amount: "2샷 (30ml)", cost: 136 },
      { name: "달고나 토핑(업체용)", amount: "15g", cost: 225 },
      { name: "얼음", amount: "5개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "달고나", amount: "15~30g", cost: 160, replaces: "달고나 토핑(업체용)" },
        { label: "흰 우유", amount: "컵 80%", cost: 500, replaces: "우유" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
        { label: "에스프레소 샷", amount: "1샷 (선택)", cost: 99, replaces: "원두(에스프레소)" },
      ],
      steps: [
        { title: "달고나 준비", body: "달고나를 잘게 부숴 가루와 작은 조각을 준비합니다. 시판 달고나를 쓰거나 설탕·베이킹소다로 직접 만들어도 됩니다." },
        { title: "베이스 채우기", body: "컵에 얼음을 가득 채우고 흰 우유를 컵의 80% 정도까지 붓습니다. 커피 맛을 원하면 이때 에스프레소 샷을 추가합니다." },
        { title: "토핑", body: "우유 거품이나 크림을 살짝 올린 뒤, 준비해 둔 달고나 가루와 조각을 듬뿍 얹습니다." },
        { title: "마무리", body: "달고나가 우유에 천천히 녹으면서 달콤함이 퍼질 때까지 잘 저어 마십니다." },
      ],
      difficulty: 2,
      time: "약 10분",
      note: "에스프레소는 선택 · 달고나 토핑량이 핵심",
    },
  },
  {
    id: "hasamdong-salt",
    brand: "하삼동커피",
    name: "히말라야 소금커피",
    category: "커피",
    price: 3700,
    emoji: "🧂",
    photoBg: "#E3F2FD",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "180ml", cost: 270 },
      { name: "원두(에스프레소)", amount: "2샷 (30ml)", cost: 136 },
      { name: "히말라야 소금 크림(업체용)", amount: "40g", cost: 220 },
      { name: "얼음", amount: "5개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "생크림", amount: "80ml", cost: 512, replaces: "히말라야 소금 크림(업체용)" },
        { label: "연유", amount: "1큰술", cost: 95, replaces: "히말라야 소금 크림(업체용)" },
        { label: "히말라야 핑크솔트", amount: "1꼬집", cost: 15, replaces: "히말라야 소금 크림(업체용)" },
        { label: "우유", amount: "125ml", cost: 313, replaces: "우유" },
        { label: "에스프레소", amount: "1~2샷", cost: 198, replaces: "원두(에스프레소)" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "소금 크림 만들기", body: "차갑게 준비한 생크림에 연유(또는 설탕)와 히말라야 핑크솔트를 넣고, 전동 거품기로 크림이 살짝 흘러내릴 정도(70~80%)로 부드럽게 휘핑합니다." },
        { title: "커피 베이스", body: "잔에 얼음을 채우고 차가운 우유와 에스프레소 샷을 부어 잘 섞습니다. 달콤함을 원하면 바닐라·카라멜 시럽을 살짝 추가해도 됩니다." },
        { title: "크림 올리기", body: "완성된 커피 위에 미리 만들어 둔 짭조름한 소금 크림을 잔 가득 얹어 마무리합니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "소금 크림 농도가 핵심 · 에스프레소는 액체스틱으로 대체 가능",
    },
  },
  {
    id: "sb-javachip",
    brand: "스타벅스",
    name: "자바칩 프라푸치노",
    category: "프라페·프라푸치노",
    price: 6500,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "150ml", cost: 225 },
      { name: "프라푸치노 로스트(커피)", amount: "1샷", cost: 68 },
      { name: "자바칩 토핑(업체용)", amount: "30g", cost: 270 },
      { name: "모카·초코 프라푸 시럽", amount: "20ml", cost: 140 },
      { name: "휘핑크림(업체용)", amount: "40g", cost: 220 },
      { name: "얼음", amount: "5개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "얼음", amount: "적당량", cost: 50, replaces: "얼음" },
        { label: "우유", amount: "150ml", cost: 375, replaces: "우유" },
        { label: "자바칩 파우더", amount: "2~3큰술", cost: 290, replaces: "모카·초코 프라푸 시럽" },
        { label: "에스프레소", amount: "1샷", cost: 99, replaces: "프라푸치노 로스트(커피)" },
        { label: "바닐라 아이스크림", amount: "3~4큰술", cost: 340, replaces: "모카·초코 프라푸 시럽" },
        { label: "통자바칩", amount: "2~3큰술", cost: 130, replaces: "자바칩 토핑(업체용)" },
        { label: "휘핑크림", amount: "토핑", cost: 232, replaces: "휘핑크림(업체용)" },
        { label: "초콜릿 시럽", amount: "토핑", cost: 85, replaces: "휘핑크림(업체용)" },
      ],
      steps: [
        { title: "얼음과 베이스", body: "믹서기에 얼음을 넣고 우유를 붓습니다." },
        { title: "초코·커피 추가", body: "자바칩 파우더(또는 초코가루)와 에스프레소(커피)를 넣어줍니다." },
        { title: "블렌딩", body: "바닐라 아이스크림을 함께 넣고 얼음이 잘게 갈릴 때까지 고속으로 블렌딩합니다." },
        { title: "자바칩 식감", body: "통자바칩(초코칩)을 넣고 아주 짧게 살짝만 갈아 씹는 맛을 살려줍니다." },
        { title: "토핑", body: "컵에 붓고 휘핑크림이나 초콜릿 시럽을 뿌려 마무리합니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "에스프레소는 액체스틱으로 대체 · 자바칩은 마지막에 짧게만 갈기",
    },
  },
  {
    id: "sb-grapefruit",
    brand: "스타벅스",
    name: "자몽 허니 블랙티",
    category: "에이드·과일",
    price: 5900,
    emoji: "🍊",
    photoBg: "#FCE4EC",
    recipeReady: true,
    ingredients: [
      { name: "자몽 원액(농축)", amount: "100ml", cost: 450 },
      { name: "블랙티 농축 베이스", amount: "150ml", cost: 315 },
      { name: "허니 시럽(업체용)", amount: "15g", cost: 105 },
      { name: "얼음", amount: "5개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "자몽청", amount: "2스푼", cost: 399, replaces: ["자몽 원액(농축)", "허니 시럽(업체용)"] },
        { label: "홍차", amount: "150ml", cost: 130, replaces: "블랙티 농축 베이스" },
        { label: "얼음", amount: "가득", cost: 50, replaces: "얼음" },
      ],
      steps: [
        { title: "홍차 우리기", body: "홍차를 진하게 우려 150ml를 준비합니다." },
        { title: "베이스", body: "컵에 자몽청 2스푼과 홍차 150ml를 넣고 잘 섞습니다." },
        { title: "얼음 채우기", body: "나머지 공간을 얼음으로 채워 완성합니다." },
      ],
      difficulty: 1,
      time: "약 5분",
      note: "자몽청에 단맛이 포함돼 별도 꿀 불필요",
    },
  },
  {
    id: "sb-coldbrew",
    brand: "스타벅스",
    name: "바닐라 크림 콜드브루",
    category: "커피",
    price: 5800,
    emoji: "🌿",
    photoBg: "#E8F5E9",
    recipeReady: true,
    ingredients: [
      { name: "콜드브루 농축액", amount: "130ml", cost: 234 },
      { name: "우유", amount: "55ml", cost: 83 },
      { name: "바닐라 크림(업체용)", amount: "50g", cost: 275 },
      { name: "얼음", amount: "8~10개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "적당량", cost: 100, replaces: "바닐라 크림(업체용)" },
        { label: "생크림", amount: "50g", cost: 320, replaces: "바닐라 크림(업체용)" },
        { label: "바닐라 시럽", amount: "15~20ml", cost: 240, replaces: "바닐라 크림(업체용)" },
        { label: "얼음", amount: "8~10개", cost: 50, replaces: "얼음" },
        { label: "콜드브루 원액", amount: "130ml", cost: 680, replaces: "콜드브루 농축액" },
      ],
      steps: [
        { title: "바닐라 크림 만들기", body: "우유, 생크림, 바닐라 시럽을 볼에 넣고 거품기로 가볍게 섞어줍니다." },
        { title: "얼음 채우기", body: "다른 컵에 얼음을 8~10개 정도 채워줍니다." },
        { title: "커피 붓기", body: "얼음이 담긴 컵에 콜드브루 원액을 붓습니다." },
        { title: "크림 올리기", body: "콜드브루 위에 만들어 둔 바닐라 크림을 부어줍니다." },
        { title: "완성", body: "취향에 맞게 살짝 저어 맛있게 즐깁니다." },
      ],
      difficulty: 2,
      time: "약 5분",
      note: "콜드브루는 전날 우려두면 편함",
    },
  },
  {
    id: "d39-cream",
    brand: "디저트39",
    name: "시그니처 크림라떼 (220ml)",
    category: "라떼",
    price: 2900,
    emoji: "🥛",
    photoBg: "#E8F5E9",
    recipeReady: true,
    ingredients: [
      { name: "우유", amount: "110ml", cost: 165 },
      { name: "원두(에스프레소)", amount: "1~2샷 (40~60ml)", cost: 102 },
      { name: "크림 베이스(업체용)", amount: "65g", cost: 390 },
      { name: "얼음", amount: "4~5개", cost: 25 },
      { name: "컵·뚜껑", amount: "1세트", cost: 95 },
    ],
    recipe: {
      homeIngredients: [
        { label: "휘핑크림", amount: "65g", cost: 377, replaces: "크림 베이스(업체용)" },
        { label: "설탕", amount: "4g", cost: 10, replaces: "크림 베이스(업체용)" },
        { label: "아몬드 시럽", amount: "10ml", cost: 65, replaces: "크림 베이스(업체용)" },
        { label: "얼음", amount: "4~5개", cost: 50, replaces: "얼음" },
        { label: "우유", amount: "110ml", cost: 275, replaces: "우유" },
        { label: "에스프레소", amount: "1~2샷", cost: 149, replaces: "원두(에스프레소)" },
      ],
      steps: [
        { title: "크림 만들기", body: "볼에 휘핑크림, 설탕, 아몬드 시럽을 넣고 주르륵 흐르는 질감이 될 때까지 휘핑합니다." },
        { title: "라떼 베이스", body: "컵에 얼음을 채우고 우유를 부어줍니다." },
        { title: "크림 올리기", body: "우유 베이스 위에 미리 만들어 둔 크림을 조심스럽게 부어 층을 만듭니다." },
        { title: "커피 붓기", body: "에스프레소를 크림 가운데에 천천히 부어 크림을 뚫고 우유층과 만나도록 연출합니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "220ml 소형 · 크림→우유→에스프레소 순으로 층 쌓기",
    },
  },
  {
    id: "pascucci-java",
    brand: "파스쿠찌",
    name: "그라니따 자바칩초코",
    category: "프라페·프라푸치노",
    price: 6900,
    emoji: "🍫",
    photoBg: "#EFEBE9",
    recipeReady: true,
    ingredients: [
      { name: "원두(에스프레소)", amount: "1샷 (30~40ml)", cost: 68 },
      { name: "우유", amount: "115ml", cost: 173 },
      { name: "초코 시럽(업체용)", amount: "25ml", cost: 175 },
      { name: "자바칩 토핑(업체용)", amount: "30g", cost: 270 },
      { name: "휘핑크림(업체용)", amount: "30g", cost: 165 },
      { name: "얼음", amount: "10~12개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "에스프레소", amount: "1샷", cost: 99, replaces: "원두(에스프레소)" },
        { label: "우유", amount: "115ml", cost: 288, replaces: "우유" },
        { label: "초코 파우더", amount: "2~3큰술", cost: 290, replaces: "초코 시럽(업체용)" },
        { label: "얼음", amount: "10~12개", cost: 50, replaces: "얼음" },
        { label: "자바칩", amount: "30g", cost: 380, replaces: "자바칩 토핑(업체용)" },
        { label: "휘핑크림", amount: "1스쿱", cost: 232, replaces: "휘핑크림(업체용)" },
      ],
      steps: [
        { title: "베이스 넣기", body: "믹서기에 에스프레소, 우유, 초코 파우더(소스)를 넣습니다." },
        { title: "얼음·자바칩", body: "얼음과 자바칩(일부는 갈고 일부는 씹는 맛을 위해 남겨둠)을 함께 넣습니다." },
        { title: "블렌딩", body: "얼음이 곱게 갈리고 텍스처가 살아날 때까지 충분히 갈아줍니다." },
        { title: "담기·토핑", body: "잔에 붓고 휘핑크림이나 아이스크림을 한 스쿱 올립니다." },
        { title: "마무리", body: "남겨둔 자바칩을 토핑 위에 살짝 뿌려 마무리합니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "자바칩은 일부만 갈고 일부는 토핑으로 · 그라니따는 얼음을 잘게",
    },
  },
  {
    id: "pascucci-yogurt",
    brand: "파스쿠찌",
    name: "그라니따 플레인요거트",
    category: "스무디·쉐이크",
    price: 6300,
    emoji: "🫙",
    photoBg: "#FFF9C4",
    recipeReady: true,
    ingredients: [
      { name: "요거트 그라니따 베이스(업체용)", amount: "45g", cost: 405 },
      { name: "우유", amount: "100ml", cost: 150 },
      { name: "요거트 젤라또(토핑)", amount: "1스쿱", cost: 270 },
      { name: "얼음", amount: "10~12개", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "100ml", cost: 250, replaces: "우유" },
        { label: "요거트 파우더", amount: "45g", cost: 180, replaces: "요거트 그라니따 베이스(업체용)" },
        { label: "플레인 요거트", amount: "2~3큰술", cost: 140, replaces: "요거트 그라니따 베이스(업체용)" },
        { label: "얼음", amount: "10~12개", cost: 50, replaces: "얼음" },
        { label: "요거트 젤라또", amount: "1스쿱", cost: 520, replaces: "요거트 젤라또(토핑)" },
      ],
      steps: [
        { title: "믹서에 넣기", body: "믹서기에 우유, 요거트 파우더, 플레인 요거트(선택), 얼음을 모두 넣습니다." },
        { title: "블렌딩", body: "얼음이 완전히 갈리면서 슬러시 형태(그라니따)가 될 때까지 강하게 갈아줍니다." },
        { title: "담기", body: "완성된 음료를 잔에 예쁘게 붓습니다." },
        { title: "토핑", body: "요거트 젤라또를 한 스쿱 듬뿍 올려 완성합니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "요거트 파우더 없으면 플레인 요거트+설탕으로 대체",
    },
  },
  {
    id: "pascucci-blueberry",
    brand: "파스쿠찌",
    name: "그라니따 블루베리요거트",
    category: "스무디·쉐이크",
    price: 6900,
    emoji: "🫐",
    photoBg: "#E8EAF6",
    recipeReady: true,
    ingredients: [
      { name: "블루베리 퓨레(업체용)", amount: "70g", cost: 245 },
      { name: "요거트 그라니따 베이스(업체용)", amount: "35g", cost: 315 },
      { name: "우유", amount: "110ml", cost: 165 },
      { name: "요거트 젤라또(토핑)", amount: "1스쿱", cost: 270 },
      { name: "얼음", amount: "180g", cost: 25 },
      { name: "컵·뚜껑·빨대", amount: "1세트", cost: 115 },
    ],
    recipe: {
      homeIngredients: [
        { label: "우유", amount: "110ml", cost: 275, replaces: "우유" },
        { label: "요거트 파우더", amount: "35g", cost: 180, replaces: "요거트 그라니따 베이스(업체용)" },
        { label: "얼음", amount: "180g", cost: 50, replaces: "얼음" },
        { label: "냉동 블루베리", amount: "100g", cost: 900, replaces: "블루베리 퓨레(업체용)" },
        { label: "요거트 젤라또", amount: "1스쿱", cost: 520, replaces: "요거트 젤라또(토핑)" },
      ],
      steps: [
        { title: "베이스 블렌딩", body: "블렌더에 우유, 요거트 파우더, 얼음, 냉동 블루베리를 넣고 곱게 갈아줍니다." },
        { title: "담기", body: "완성된 음료를 컵에 70~80% 정도 따릅니다." },
        { title: "토핑", body: "요거트 젤라또나 아이스크림을 한 스쿱 올립니다." },
        { title: "마무리", body: "리얼 블루베리나 블루베리 소스를 젤라또 위에 살짝 뿌려 완성합니다." },
      ],
      difficulty: 2,
      time: "약 7분",
      note: "냉동 블루베리를 블렌딩에 넣으면 색·맛이 진해짐",
    },
  },
];

const CATEGORIES = ["전체", "커피", "라떼", "프라페·프라푸치노", "버블티·밀크티", "에이드·과일", "스무디·쉐이크"];

const BRANDS = [
  { id: "mega", name: "메가커피", logo: "☕", logoBg: "#FFD100", logoColor: "#333" },
  { id: "gongcha", name: "공차", logo: "🧋", logoBg: "#1a1a1a", logoColor: "#fff" },
  { id: "compose", name: "컴포즈커피", logo: "C", logoBg: "#1B3A6B", logoColor: "#fff" },
  { id: "twosome", name: "투썸플레이스", logo: "2", logoBg: "#C8102E", logoColor: "#fff" },
  { id: "paik", name: "빽다방", logo: "PAIK", logoBg: "#FFD700", logoColor: "#1a1a1a" },
  { id: "mammoth", name: "매머드익스프레스", logo: "🦣", logoBg: "#5D4037", logoColor: "#fff" },
  { id: "chabaek", name: "차백도", logo: "🍵", logoBg: "#2E7D32", logoColor: "#fff" },
  { id: "ediya", name: "이디야", logo: "E", logoBg: "#6A1B9A", logoColor: "#fff" },
  { id: "hasamdong", name: "하삼동커피", logo: "H", logoBg: "#E65100", logoColor: "#fff" },
  { id: "starbucks", name: "스타벅스", logo: "★", logoBg: "#00704A", logoColor: "#fff" },
  { id: "d39", name: "디저트39", logo: "39", logoBg: "#F48FB1", logoColor: "#fff" },
  { id: "pascucci", name: "파스쿠찌", logo: "P", logoBg: "#B71C1C", logoColor: "#fff" },
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

function getHomeIngredients(menu) {
  return (menu.recipe?.homeIngredients || []).map((item) =>
    typeof item === "string"
      ? { label: item, amount: "", cost: 0, replaces: "" }
      : item
  );
}

function getHomePrice(menu) {
  const items = getHomeIngredients(menu);
  const sum = items.reduce((s, item) => s + (item.cost || 0), 0);
  return sum > 0 ? sum : 0;
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
  return MENUS.filter((m) => m.brand === brand).length;
}

function getRecipeReadyCount() {
  return MENUS.filter((m) => m.recipeReady).length;
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
