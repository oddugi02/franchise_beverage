// 이 파일을 config.js 로 복사한 뒤 운영자 이메일을 입력하세요.
// cp config.example.js config.js
window.SITE_CONFIG = {
  // FormSubmit.co — 첫 요청 시 이 주소로 확인 메일이 옵니다 (한 번만 승인)
  operatorEmail: "your-email@example.com",
  // FormSubmit 활성화 메일에 있는 해시 ID (있으면 이메일 대신 사용, 더 안정적)
  formSubmitEndpoint: "",
  // 배포 URL (끝 슬래시 없이). 비우면 현재 도메인 사용
  siteUrl: "",
  siteName: "홈카페",
  // OG 공유 이미지 (절대 URL 또는 siteUrl 기준 경로)
  ogImage: "/og-image.svg",
  // Supabase — 좋아요 + 네이버 최저가 캐시 (supabase/*.sql 실행 후 입력)
  supabaseUrl: "",
  supabaseAnonKey: "",
  // (선택) Express shopping API — Supabase 대신 server/ 배포 시
  // 예: "https://your-api.railway.app"
  shoppingApiUrl: "",
};
