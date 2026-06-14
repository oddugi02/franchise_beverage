// 네이버 쇼핑 API로 갱신 — node scripts/update-naver-prices.js
// 페이지 로드 시 shopping-prices.js 가 shopping-packs.js 에 덮어씁니다
const SHOPPING_PRICE_UPDATED_AT = "2026-06-14";
const SHOPPING_PRICE_OVERRIDES = {
  "milk500": {
    "link": "https://www.11st.co.kr/connect/Gateway.tmall?method=Xsite&prdNo=8233703082&tid=1000000061",
    "productUrl": "https://www.11st.co.kr/connect/Gateway.tmall?method=Xsite&prdNo=8233703082&tid=1000000061",
    "productTitle": "[매일유업] ESL 우유 500ml",
    "productName": "[매일유업] ESL 우유 500ml",
    "mallName": "11번가",
    "store": "네이버",
    "price": 1820,
    "unitPrice": 4,
    "packUnits": 500
  },
  "milk1L": {
    "link": "https://smartstore.naver.com/main/products/9713844201",
    "productUrl": "https://smartstore.naver.com/main/products/9713844201",
    "productTitle": "믈레코비타 3.5% 멸균우유 1L",
    "productName": "믈레코비타 3.5% 멸균우유 1L",
    "mallName": "LWST",
    "store": "네이버",
    "price": 1300,
    "unitPrice": 1,
    "packUnits": 1000
  },
  "honey500": {
    "link": "https://search.shopping.naver.com/catalog/58076719097",
    "productUrl": "https://search.shopping.naver.com/catalog/58076719097",
    "productTitle": "꽃샘 사양벌꿀 500g, 1개",
    "productName": "꽃샘 사양벌꿀 500g, 1개",
    "mallName": "네이버",
    "store": "네이버",
    "price": 4280,
    "unitPrice": 9,
    "packUnits": 500
  },
  "tapioca1kg": {
    "link": "https://link.gmarket.co.kr/gate/pcs?item-no=4650742194&sub-id=1003&service-code=10000003&lcd=100000036",
    "productUrl": "https://link.gmarket.co.kr/gate/pcs?item-no=4650742194&sub-id=1003&service-code=10000003&lcd=100000036",
    "productTitle": "태향 타피오카펄(블랙) 1kg /냉동",
    "productName": "태향 타피오카펄(블랙) 1kg /냉동",
    "mallName": "G마켓",
    "store": "네이버",
    "price": 7100,
    "unitPrice": 7,
    "packUnits": 1000
  },
  "yogurtDrink150": {
    "link": "https://smartstore.naver.com/main/products/5462014227",
    "productUrl": "https://smartstore.naver.com/main/products/5462014227",
    "productTitle": "산에핀들 산들 임실 친환경 수제 요거트 플레인, 150ml, 1개",
    "productName": "산에핀들 산들 임실 친환경 수제 요거트 플레인, 150ml, 1개",
    "mallName": "네이퍼스",
    "store": "네이버",
    "price": 1400,
    "unitPrice": 9,
    "packUnits": 150
  },
  "pomeloJam1kg": {
    "link": "https://smartstore.naver.com/main/products/13630507634",
    "productUrl": "https://smartstore.naver.com/main/products/13630507634",
    "productTitle": "꽃샘 꿀레드자몽청 1kg 자몽 과일청 과일차 전통차 에이드 카페 음료 주스",
    "productName": "꽃샘 꿀레드자몽청 1kg 자몽 과일청 과일차 전통차 에이드 카페 음료 주스",
    "mallName": "다람쥐 동네",
    "store": "네이버",
    "price": 4500,
    "unitPrice": 5,
    "packUnits": 1000
  },
  "sugarSyrup500": {
    "link": "https://smartstore.naver.com/main/products/13327167877",
    "productUrl": "https://smartstore.naver.com/main/products/13327167877",
    "productTitle": "삼조 비셰프 카페 시럽 1.5L",
    "productName": "삼조 비셰프 카페 시럽 1.5L",
    "mallName": "wholesomefood",
    "store": "네이버",
    "price": 3740,
    "unitPrice": 2,
    "packUnits": 1500
  },
  "tea25": {
    "link": "https://smartstore.naver.com/main/products/6233825966",
    "productUrl": "https://smartstore.naver.com/main/products/6233825966",
    "productTitle": "식전 식후차로 좋은 2tang 블랙티 홍차 티백 25입 총50g",
    "productName": "식전 식후차로 좋은 2tang 블랙티 홍차 티백 25입 총50g",
    "mallName": "티피마트",
    "store": "네이버",
    "price": 1770,
    "unitPrice": 71,
    "packUnits": 25
  },
  "together473": {
    "link": "https://smartstore.naver.com/main/products/6134414755",
    "productUrl": "https://smartstore.naver.com/main/products/6134414755",
    "productTitle": "나우푸드 캐스터 오일 피마자유 100% 퓨어 473mL",
    "productName": "나우푸드 캐스터 오일 피마자유 100% 퓨어 473mL",
    "mallName": "투게더쇼핑몰",
    "store": "네이버"
  },
  "cookiePack": {
    "link": "https://smartstore.naver.com/main/products/10014704750",
    "productUrl": "https://smartstore.naver.com/main/products/10014704750",
    "productTitle": "오레오 쿠키 앤 크림 푸딩 믹스 119g",
    "productName": "오레오 쿠키 앤 크림 푸딩 믹스 119g",
    "mallName": "트조 팬트리",
    "store": "네이버",
    "price": 4900,
    "unitPrice": 41,
    "packUnits": 119
  },
  "toffeeStick20": {
    "link": "https://smartstore.naver.com/main/products/7446687208",
    "productUrl": "https://smartstore.naver.com/main/products/7446687208",
    "productTitle": "다농원 토피넛 라떼 20개입 400g, 1개",
    "productName": "다농원 토피넛 라떼 20개입 400g, 1개",
    "mallName": "코스타마트",
    "store": "네이버",
    "price": 5600,
    "unitPrice": 280,
    "packUnits": 20
  },
  "javaChip200": {
    "link": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=9257723253&ctag=9257723253&lptag=I23931286409&itemId=23931286409&vendorItemId=89623718856&spec=10305199",
    "productUrl": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=9257723253&ctag=9257723253&lptag=I23931286409&itemId=23931286409&vendorItemId=89623718856&spec=10305199",
    "productTitle": "빅트레인 더블 자바칩 파우더  200g  1개입  1개  200g",
    "productName": "빅트레인 더블 자바칩 파우더  200g  1개입  1개  200g",
    "mallName": "쿠팡",
    "store": "네이버"
  },
  "micho500": {
    "link": "https://smartstore.naver.com/main/products/7670344853",
    "productUrl": "https://smartstore.naver.com/main/products/7670344853",
    "productTitle": "형원 오미자홍초 주방세제 찌든때 제거력 친환경 안심세정500ml",
    "productName": "형원 오미자홍초 주방세제 찌든때 제거력 친환경 안심세정500ml",
    "mallName": "사회적경제기업 상생샵",
    "store": "네이버",
    "price": 3900,
    "unitPrice": 8,
    "packUnits": 500
  },
  "grapeJuice1L": {
    "link": "https://smartstore.naver.com/main/products/4712336113",
    "productUrl": "https://smartstore.naver.com/main/products/4712336113",
    "productTitle": "지방이 석고방향제 미니어처 포도쥬스 아침햇살 요구르트 콜라 소주 페리에",
    "productName": "지방이 석고방향제 미니어처 포도쥬스 아침햇살 요구르트 콜라 소주 페리에",
    "mallName": "theshop9",
    "store": "네이버"
  },
  "greenGrapeJuice500": {
    "link": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=8588693834&ctag=8588693834&lptag=P8588693834&itemId=15318668673&vendorItemId=82539004003&spec=10305199",
    "productUrl": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=8588693834&ctag=8588693834&lptag=P8588693834&itemId=15318668673&vendorItemId=82539004003&spec=10305199",
    "productTitle": "데코덴파츠 음료수 드링크 탑로더꾸미기 재료 탑꾸파츠  청포도맛쥬스",
    "productName": "데코덴파츠 음료수 드링크 탑로더꾸미기 재료 탑꾸파츠  청포도맛쥬스",
    "mallName": "쿠팡",
    "store": "네이버"
  },
  "peachJuice200": {
    "link": "https://smartstore.naver.com/main/products/10492136623",
    "productUrl": "https://smartstore.naver.com/main/products/10492136623",
    "productTitle": "[체험팩 1포] 복숭아 착즙주스 시골내음 복숭아원물100% NFC 해외수출 황도주스",
    "productName": "[체험팩 1포] 복숭아 착즙주스 시골내음 복숭아원물100% NFC 해외수출 황도주스",
    "mallName": "서울개미",
    "store": "네이버"
  },
  "cranberryJuice1L": {
    "link": "https://smartstore.naver.com/main/products/13270953670",
    "productUrl": "https://smartstore.naver.com/main/products/13270953670",
    "productTitle": "뱅쇼만들기 1회분 키트 재료모음 시나몬스틱 팔각 정향 히비스커스 한약재 약초 건강차 전통차 재료 부모님 선물",
    "productName": "뱅쇼만들기 1회분 키트 재료모음 시나몬스틱 팔각 정향 히비스커스 한약재 약초 건강차 전통차 재료 부모님 선물",
    "mallName": "그린엘리펀트",
    "store": "네이버",
    "price": 5000,
    "unitPrice": 5,
    "packUnits": 1000
  },
  "aloeDrink500": {
    "link": "https://link.auction.co.kr/gate/pcs?item-no=F456076243&sub-id=1&service-code=10000003",
    "productUrl": "https://link.auction.co.kr/gate/pcs?item-no=F456076243&sub-id=1&service-code=10000003",
    "productTitle": "자연은 웅진 자연은 알로에 180m x 1캔 / 업소용 미니캔 음료",
    "productName": "자연은 웅진 자연은 알로에 180m x 1캔 / 업소용 미니캔 음료",
    "mallName": "옥션",
    "store": "네이버"
  },
  "fruitJellyCup": {
    "link": "https://smartstore.naver.com/main/products/9606266724",
    "productUrl": "https://smartstore.naver.com/main/products/9606266724",
    "productTitle": "천하장사 복숭아 젤리 외 (3종) 뿌띠첼 푸딩 과일젤리 컵젤리 진주햄",
    "productName": "천하장사 복숭아 젤리 외 (3종) 뿌띠첼 푸딩 과일젤리 컵젤리 진주햄",
    "mallName": "푸드 아울렛",
    "store": "네이버",
    "price": 840,
    "unitPrice": 6,
    "packUnits": 130
  },
  "redBean500": {
    "link": "https://smartstore.naver.com/main/products/2423829574",
    "productUrl": "https://smartstore.naver.com/main/products/2423829574",
    "productTitle": "[소분제품] 1171. 팥배기 - 대두 500g",
    "productName": "[소분제품] 1171. 팥배기 - 대두 500g",
    "mallName": "빵수니베이킹",
    "store": "네이버",
    "price": 2800,
    "unitPrice": 6,
    "packUnits": 500
  },
  "yujaTea500": {
    "link": "https://smartstore.naver.com/main/products/10302796876",
    "productUrl": "https://smartstore.naver.com/main/products/10302796876",
    "productTitle": "패턴 접이식 패키지 손잡이 쿠키상자 초콜릿 티라미수 선물상자 유자청 포장",
    "productName": "패턴 접이식 패키지 손잡이 쿠키상자 초콜릿 티라미수 선물상자 유자청 포장",
    "mallName": "사라리스토어",
    "store": "네이버"
  },
  "appleConcentrate500": {
    "link": "https://smartstore.naver.com/main/products/6541527067",
    "productUrl": "https://smartstore.naver.com/main/products/6541527067",
    "productTitle": "오뚜기 사과식초 500ml",
    "productName": "오뚜기 사과식초 500ml",
    "mallName": "엘림GO커머스",
    "store": "네이버"
  },
  "cola355": {
    "link": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=7421898387&ctag=7421898387&lptag=I24629971330&itemId=24629971330&vendorItemId=94660447270&spec=10305199",
    "productUrl": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=7421898387&ctag=7421898387&lptag=I24629971330&itemId=24629971330&vendorItemId=94660447270&spec=10305199",
    "productTitle": "몬스터에너지 망고 로코  355ml  2개",
    "productName": "몬스터에너지 망고 로코  355ml  2개",
    "mallName": "쿠팡",
    "store": "네이버"
  },
  "frozenCranberry200": {
    "link": "https://smartstore.naver.com/main/products/12417464617",
    "productUrl": "https://smartstore.naver.com/main/products/12417464617",
    "productTitle": "100% 우리쌀베이글 no 밀가루/ 플레인, 호두크랜베리 블루베리 참깨",
    "productName": "100% 우리쌀베이글 no 밀가루/ 플레인, 호두크랜베리 블루베리 참깨",
    "mallName": "엔엔엔비 비건",
    "store": "네이버",
    "price": 3800,
    "unitPrice": 19,
    "packUnits": 200
  },
  "limeJuice200": {
    "link": "https://smartstore.naver.com/main/products/9070129498",
    "productUrl": "https://smartstore.naver.com/main/products/9070129498",
    "productTitle": "MS 쥬시 라임즙 200ml 이탈리아 음식 식재료 하이볼",
    "productName": "MS 쥬시 라임즙 200ml 이탈리아 음식 식재료 하이볼",
    "mallName": "마켓 포유",
    "store": "네이버"
  },
  "decafColdBrew1L": {
    "link": "https://www.11st.co.kr/connect/Gateway.tmall?method=Xsite&prdNo=6637659189&tid=1000000061",
    "productUrl": "https://www.11st.co.kr/connect/Gateway.tmall?method=Xsite&prdNo=6637659189&tid=1000000061",
    "productTitle": "[더치커피스토리]콜드브루 더치커피원액 카페인 디카페인 16종 가정용 선물용 카페납품",
    "productName": "[더치커피스토리]콜드브루 더치커피원액 카페인 디카페인 16종 가정용 선물용 카페납품",
    "mallName": "11번가",
    "store": "네이버",
    "price": 5790,
    "unitPrice": 6,
    "packUnits": 1000
  },
  "purpleSweetPotato500": {
    "link": "https://smartstore.naver.com/main/products/8425764677",
    "productUrl": "https://smartstore.naver.com/main/products/8425764677",
    "productTitle": "한끼대신 오트볼 초콜릿 그레인 15곡자색고구마 마시는 오트밀 쉐이크",
    "productName": "한끼대신 오트볼 초콜릿 그레인 15곡자색고구마 마시는 오트밀 쉐이크",
    "mallName": "아이캔스토어",
    "store": "네이버"
  },
  "곡물 파우더": {
    "link": "https://smartstore.naver.com/main/products/13402592314",
    "productUrl": "https://smartstore.naver.com/main/products/13402592314",
    "productTitle": "아임요 미숫가루 파우더 1kg 빙수재료 미숫가루라떼",
    "productName": "아임요 미숫가루 파우더 1kg 빙수재료 미숫가루라떼",
    "mallName": "밀크앤커피",
    "store": "네이버",
    "price": 5700,
    "unitPrice": 6,
    "packUnits": 1000
  },
  "타로 파우더": {
    "link": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=8312695397&ctag=8312695397&lptag=I28639413607&itemId=28639413607&vendorItemId=94576364550&spec=10305199",
    "productUrl": "https://link.coupang.com/re/PCSNAVERPCSDP?pageKey=8312695397&ctag=8312695397&lptag=I28639413607&itemId=28639413607&vendorItemId=94576364550&spec=10305199",
    "productTitle": "다미즐 우롱 타로 밀크티  7개입",
    "productName": "다미즐 우롱 타로 밀크티  7개입",
    "mallName": "쿠팡",
    "store": "네이버",
    "price": 4170,
    "unitPrice": 8,
    "packUnits": 500
  },
  "토피넛 파우더": {
    "link": "https://smartstore.naver.com/main/products/7446687208",
    "productUrl": "https://smartstore.naver.com/main/products/7446687208",
    "productTitle": "다농원 토피넛 라떼 20개입 400g, 1개",
    "productName": "다농원 토피넛 라떼 20개입 400g, 1개",
    "mallName": "코스타마트",
    "store": "네이버",
    "price": 5600,
    "unitPrice": 280,
    "packUnits": 20
  },
  "쿠키베이스": {
    "link": "https://smartstore.naver.com/main/products/10014704750",
    "productUrl": "https://smartstore.naver.com/main/products/10014704750",
    "productTitle": "오레오 쿠키 앤 크림 푸딩 믹스 119g",
    "productName": "오레오 쿠키 앤 크림 푸딩 믹스 119g",
    "mallName": "트조 팬트리",
    "store": "네이버",
    "price": 4900,
    "unitPrice": 41,
    "packUnits": 119
  },
  "sikhye900": {
    "link": "https://smartstore.naver.com/main/products/5505722856",
    "productUrl": "https://smartstore.naver.com/main/products/5505722856",
    "productTitle": "팔도 비락식혜 미드팩 238ml 6캔 (한묶음)",
    "productName": "팔도 비락식혜 미드팩 238ml 6캔 (한묶음)",
    "mallName": "수리상점",
    "store": "네이버",
    "price": 3030,
    "unitPrice": 13,
    "packUnits": 238
  },
};
