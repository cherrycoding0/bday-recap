// 아티스트별 설정을 한 곳에 모아둔 파일.
// 다음 아티스트 생일 페이지를 만들 때는 이 파일만 새로 채우면 됨(엔진 재사용).

export const artistConfig = {
  name: "성호",
  groupName: "BOYNEXTDOOR",
  fandomName: "원도어",
  // 실제 생일: 2003-09-04. 페이지에서 카운트다운할 "이번 생일" 날짜(연도는 올해로).
  birthdayThisYear: "2026-09-04T00:00:00+09:00",
  // Day 3(컬러 팔레트 확정) 이후 아래 값을 실제 팔레트로 교체하세요.
  themeColor: {
    primary: "#7C6BEB", // 임시 컬러 — 앨범/컨셉 사진에서 추출한 컬러로 교체
    secondary: "#F5F3FF",
    text: "#1F1B3D",
  },
  // 비공식 팬 프로젝트 고지문 — 문구는 자유롭게 다듬어도 되지만 반드시 남겨둘 것
  disclaimer:
    "이 페이지는 팬이 만든 비공식 팬 프로젝트입니다. 소속사/아티스트 측 요청 시 즉시 비공개 처리합니다.",
} as const;

export type ArtistConfig = typeof artistConfig;
