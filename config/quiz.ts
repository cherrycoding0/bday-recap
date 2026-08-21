// 오프 성격 테스트 설정 — 이 파일만 고치면 문항/유형/파트가 전부 바뀝니다.
// ✏️ 표시: 주리가 채우거나 다듬을 곳. 파트/직캠이 비어 있으면 화면에 "준비 중"으로 표시됩니다.

export type QuizAnswer = {
  label: string;
  tension: number; // 덕질 온도: +1 저세상 텐션 / 0 / -1 차분
  social: number;  // 덕질 스타일: +1 다같이 / 0 / -1 혼자
};

export type QuizQuestion = { question: string; answers: QuizAnswer[] };

export type SongPart = {
  song: string;        // ✏️ 곡명
  lyricLine: string;   // ✏️ 가사 딱 한 줄만! (전체 인용 금지)
  fancamUrl: string;   // ✏️ 직캠 유튜브 링크 (썸네일 자동 추출)
  customImage?: string; // (선택) 썸네일 대신 쓸 이미지 경로
};

export type FanType = {
  id: string;
  name: string;        // ✏️ 원도어 밈으로 교체
  emoji: string;
  description: string; // 결과 화면 설명 2~3줄
  partHint: string;    // 파트 성격 (파트 미정일 때 보여줄 문구)
  traits: string[];    // ✏️ 저격형 특징 3줄 — "어떻게 알았지?!"가 나와야 스샷 찍힘
  matchType: string;   // ✏️ 찰떡궁합 유형 id
  clashType: string;   // ✏️ 티격태격 유형 id
  // ✏️ 유형당 파트 2~3개 — 결과가 나올 때마다 랜덤으로 하나 선택됩니다.
  // 파트가 2개 이상이면 "다른 파트도 보기 🔀" 버튼이 자동으로 생겨요.
  // 예: parts: [
  //   { song: "Viral", lyricLine: "널 붙잡으러 갈거야", fancamUrl: "https://youtu.be/..." },
  //   { song: "...", lyricLine: "...", fancamUrl: "..." },
  // ],
  parts: SongPart[];
};

export const quizConfig = {
  title: "성호 파트 찾기", // ✏️
  subtitle: "나에게 어울리는 성호 파트 찾기",
  goalCount: 904, // ✏️ 1차 목표 (9월 4일 → 904)
  // 목표 사다리 — 앞 목표를 달성하면 자동으로 다음 목표가 열립니다 (연장전).
  goalSteps: [
    { count: 904, label: "9월 4일" },
    { count: 1004, label: "천사 성호" },
    { count: 2026, label: "2026 최종 목표" },
  ],

  questions: [
    {
      question: "성호 생일에 난?",
      answers: [
        { label: "혼자서 생카 투어 간다", tension: 1, social: -1 },
        { label: "친구들이랑 성호 생파!", tension: 1, social: 1 },
        { label: "위버스 라이브 보면서 축하", tension: 0, social: -1 },
      ],
    },
    {
      question: "바쁜데 성호가 라방을 한다! 나는?",
      answers: [
        { label: "라방이 중요하지 일단 라방을 본다", tension: 1, social: 0 },
        { label: "그래도 할건 해야지.. 내 할일부터 한다", tension: -1, social: 0 },
        { label: "멀티 가능! 라방 들으며 할일 한다", tension: -1, social: 1 },
      ],
    },
    {
      question: "보넥도 신곡이 나왔다. 나는?",
      answers: [
        { label: "숨스밍 돌리면서 감동의 눈물", tension: -1, social: -1 },
        { label: "트위터에 실시간 감상글 쓰기", tension: 1, social: 1 },
        { label: "친구 불러서 같이 뮤비 정주행", tension: 0, social: 1 },
      ],
    },
    {
      question: "보넥도 콘서트 티켓팅 성공! 내 자리는?",
      answers: [
        { label: "어디든 입성만 하면 돼", tension: -1, social: 0 },
        { label: "무조건 앞자리, 아이컨택 노린다", tension: 1, social: -1 },
        { label: "친구랑 같이 앉는 게 제일 중요!", tension: 0, social: 1 },
      ],
    },
    {
      question: "성호가 위버스에 글을 올렸다. 나는?",
      answers: [
        { label: "백만 번 다시 읽고 사진 저장!", tension: -1, social: -1 },
        { label: "오늘도 첫댓 노린다! 바로 댓글 작성", tension: 1, social: 0 },
        { label: "친구들한테 공유부터 한다", tension: 0, social: 1 },
      ],
    },
  ] as QuizQuestion[],

  types: [
    {
      id: "allcon",
      name: "저세상 텐션 올콘형", // ✏️
      emoji: "🔥",
      description: "현장이 답이다. 소리 지를 수 있는 곳이면 어디든 가고, 이 텐션은 나눠야 두 배가 되는 타입.",
      partHint: "시원하게 지르는 고음 · 하이라이트 파트",
      traits: [ // ✏️
        "콘서트 끝나면 현타 오기 전에 다음 티켓팅부터 알아봄",
        "응원봉 여분 배터리까지 챙기는 프로 준비러",
        "목이 쉬어도 후회는 없다, 그게 올콘의 낭만",
      ],
      matchType: "spreader",
      clashType: "quiettears",
      parts: [{ song: "ADIOS!", lyricLine: "좋아 날뛰고픈 밤", fancamUrl: "https://youtu.be/W2pVVwfniMY"}],
    },
    {
      id: "frontrow",
      name: "앞자리 눈맞춤 승부사형", // ✏️
      emoji: "🎯",
      description: "티켓팅도 눈맞춤도 전부 실전. 목표가 생기면 뒤도 안 돌아보고 직진하는 타입.",
      partHint: "킬링파트 · 직진 가사 파트",
      traits: [ // ✏️
        "티켓팅 오픈 10초 전부터 심장이 뛰기 시작함",
        "눈맞춤 한 번이면 한 달을 버틸 수 있음",
        "포기라는 단어는 내 사전에 없음",
      ],
      matchType: "allcon",
      clashType: "homebody",
      parts: [
  { song: "Viral", lyricLine: "널 붙잡으러 갈거야", fancamUrl: "https://youtu.be/GrdHtesFQig"},
  { song: "Nice Guy", lyricLine: "Look at my eyes", fancamUrl: "https://youtu.be/UZNPMOPDaes" },
],
    },
    {
      id: "spreader",
      name: "단톡방 전파왕형", // ✏️
      emoji: "📢",
      description: "좋은 건 못 참지. 성호의 모든 순간을 단톡방에 퍼 나르는 비공식 홍보대사.",
      partHint: "다같이 떼창하는 후렴 파트",
      traits: [ // ✏️
        "성호 떴다 하면 단톡방 3개에 동시 전송",
        "친구를 입덕시켜야 직성이 풀림",
        "내 리트윗이 곧 홍보다",
      ],
      matchType: "homebody",
      clashType: "frontrow",
      parts: [{ song: "Hollywood Action", lyricLine: "I'm him 네가 아는 걔", fancamUrl: "https://youtu.be/sqPLHubw47g" }],
    },
    {
      id: "homebody",
      name: "홈파티 집순이형", // ✏️
      emoji: "🏠",
      description: "내 방이 곧 콘서트장. 이불 속에서 조용히, 근데 누구보다 진심으로 파는 타입.",
      partHint: "편안하고 다정한 벌스 파트",
      traits: [ // ✏️
        "콘서트 가고 싶은데 나가기는 싫음",
        "이불 속에서 직캠 보다가 새벽 3시",
        "근데 스밍 순위는 내가 1등",
      ],
      matchType: "spreader",
      clashType: "allcon",
      parts: [
        { song: "Nice Guy", lyricLine: "Look at my eyes Look at my line", fancamUrl: "https://youtu.be/UZNPMOPDaes" },
      ],
    },
    {
      id: "quiettears",
      name: "숨스밍 눈물샘형", // ✏️
      emoji: "🌙",
      description: "스밍 기록이 곧 내 마음. 가사 한 줄에 새벽 두 시 감성 터지는 타입.",
      partHint: "잔잔한 발라드 · 브릿지 파트",
      traits: [ // ✏️
        "가사 한 줄에 새벽 감성 폭발",
        "말없이 스밍 돌리는 조용한 실세",
        "울면서도 반복재생 버튼 누르는 중",
      ],
      matchType: "propro",
      clashType: "allcon",
      parts: [{ song: "123-78", lyricLine: "비가 주르륵 내린 다음", fancamUrl: "https://youtu.be/ZOcjNJz-hXo" }],
    },
    {
      id: "propro",
      name: "현생도 덕질도 프로형", // ✏️
      emoji: "⚖️",
      description: "현생도 덕질도 둘 다 잡는다. 조용히 오래가는 찐팬이 바로 나.",
      partHint: "안정감 있는 도입 · 마무리 파트",
      traits: [ // ✏️
        "출근길엔 스밍, 퇴근길엔 직캠",
        "덕질 지출도 계획적으로 관리하는 타입",
        "조용히 오래가는 게 진짜라는 걸 앎",
      ],
      matchType: "quiettears",
      clashType: "frontrow",
      parts: [{ song: "오늘만 I LOVE YOU", lyricLine: "그날 이후로 난 이렇게 살아", fancamUrl: "https://youtu.be/N8XBTlOiQCc" }],
    },
  ] as FanType[],
} as const;

// 유형에서 파트 하나를 랜덤으로 뽑는다 (없으면 null)
export function pickPart(type: FanType, exclude?: SongPart | null): SongPart | null {
  const pool = type.parts.filter((p) => p.song || p.fancamUrl);
  if (pool.length === 0) return null;
  const candidates = exclude && pool.length > 1 ? pool.filter((p) => p !== exclude) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// 점수 → 유형 매핑: 각 유형의 "전형적인 점수"(대표점)에 가장 가까운 유형으로 분류.
// 대표점만 조정하면 결과 분포가 바뀝니다. 현재 값은 모든 답 조합(243개) 시뮬레이션 기준
// 유형별 12~19%로 균등하게 맞춘 상태 (2026-08-20).
const TYPE_PROTOTYPES: [number, number][] = [
  [2, 2],   // 올콘형: 텐션↑ 다같이
  [2, -1],  // 승부사형: 텐션↑ 혼자
  [0, 3],   // 전파왕형: 다같이 최우선
  [-1, -2], // 집순이형: 차분하게 혼자
  [-3, -1], // 눈물샘형: 아주 차분, 깊게
  [1, 0],   // 프로형: 균형
];

export function resolveType(tension: number, social: number): FanType {
  let bestIdx = 0;
  let bestDist = Infinity;
  TYPE_PROTOTYPES.forEach(([pt, ps], i) => {
    const d = (tension - pt) ** 2 + (social - ps) ** 2;
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  });
  return quizConfig.types[bestIdx];
}
