// 아티스트별 설정을 한 곳에 모아둔 파일.
// 다음 아티스트 생일 페이지를 만들 때는 이 파일만 새로 채우면 됨(엔진 재사용).

export const artistConfig = {
  name: "성호",
  engName: "SUNGHO",
  groupName: "BOYNEXTDOOR",
  fandomName: "ONEDOOR",
  // 실제 생일: 2003-09-04. 페이지에서 카운트다운할 "이번 생일" 날짜(연도는 올해로).
  birthYear: 2003,
  // 케이크 초 개수 — 만 나이(2026 기준 23) vs 세는 나이(24) 중 선택.
  // 이 값을 지우면 만 나이로 자동 계산됩니다.
  candleCount: 24,
  birthdayThisYear: "2026-09-04T00:00:00+09:00",
  // Day 3 확정 팔레트 — 성호의 최애 색 '라이트 퍼플' 기반 라벤더 팔레트.
  // (출처: Melon TMI 인터뷰 — 성호: Light Purple)
  themeColor: {
    primary: "#FF6FA5", // 핑크 — 버튼, 포인트 텍스트
    primaryDeep: "#E44C8C", // 진한 핑크 — 호버, 강조
    secondary: "#FFEFF5", // 아주 연한 핑크 — 페이지 배경
    card: "#FFFFFF", // 카드/타일 배경 (배경 위에서 분리되도록 흰색)
    accent: "#FFC55C", // 골드옐로 포인트 — 핑크와 어울리는 케이크/컨페티 색
    text: "#47202F", // 본문 텍스트 — 딥 로즈 다크
  },
  // 비공식 팬 프로젝트 고지문 — 문구는 자유롭게 다듬어도 되지만 반드시 남겨둘 것
  disclaimer:
    "이 페이지는 팬이 만든 비공식 팬 프로젝트입니다.",
} as const;

export type ArtistConfig = typeof artistConfig;
