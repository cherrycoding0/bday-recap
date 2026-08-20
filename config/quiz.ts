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
  // ✏️ 유형당 파트 2~3개 — 결과가 나올 때마다 랜덤으로 하나 선택됩니다.
  // 파트가 2개 이상이면 "다른 파트도 보기 🔀" 버튼이 자동으로 생겨요.
  // 예: parts: [
  //   { song: "Viral", lyricLine: "널 붙잡으러 갈거야", fancamUrl: "https://youtu.be/..." },
  //   { song: "...", lyricLine: "...", fancamUrl: "..." },
  // ],
  parts: SongPart[];
};

export const quizConfig = {
  title: "나의 오프 성격 유형은?", // ✏️
  subtitle: "나에게 어울리는 성호 파트 찾기",
  goalCount: 904, // ✏️ 생일까지 모을 메시지 목표 (9월 4일 → 904)

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
      description: "성호의 행복이 곧 나의 행복. 현장에 있어야 직성이 풀리고, 그 에너지를 다같이 나눠야 완성되는 타입.",
      partHint: "시원하게 지르는 고음 · 하이라이트 파트",
      parts: [{ song: "ADIOS!", lyricLine: "좋아 날뛰고픈 밤", fancamUrl: "https://youtu.be/W2pVVwfniMY"}],
    },
    {
      id: "frontrow",
      name: "앞자리 눈맞춤 승부사형", // ✏️
      emoji: "🎯",
      description: "덕질은 진심 승부. 목표가 생기면 직진하고, 성호와의 눈맞춤 한 번을 위해 모든 걸 겁니다.",
      partHint: "킬링파트 · 직진 가사 파트",
      parts: [
  { song: "Viral", lyricLine: "널 붙잡으러 갈거야", fancamUrl: "https://youtu.be/GrdHtesFQig"},
  { song: "Nice Guy", lyricLine: "Look at my eyes", fancamUrl: "https://youtu.be/UZNPMOPDaes" },
],
    },
    {
      id: "spreader",
      name: "단톡방 전파왕형", // ✏️
      emoji: "📢",
      description: "좋은 건 나눠야 제맛. 성호의 모든 순간을 실시간으로 퍼 나르는, 팬덤의 소문난 마당발.",
      partHint: "다같이 떼창하는 후렴 파트",
      parts: [{ song: "Hollywood Action", lyricLine: "I'm him 네가 아는 걔", fancamUrl: "https://youtu.be/sqPLHubw47g" }],
    },
    {
      id: "homebody",
      name: "홈파티 집순이형", // ✏️
      emoji: "🏠",
      description: "덕질은 아늑하게. 내 방이 최고의 콘서트장. 좋아하는 마음의 깊이는 누구에게도 지지 않아요.",
      partHint: "편안하고 다정한 벌스 파트",
      parts: [
        { song: "Nice Guy", lyricLine: "Look at my eyes Look at my line", fancamUrl: "https://youtu.be/UZNPMOPDaes" },
      ],
    },
    {
      id: "quiettears",
      name: "숨스밍 눈물샘형", // ✏️
      emoji: "🌙",
      description: "조용히, 그러나 누구보다 깊게. 스밍 기록이 곧 내 마음의 기록. 가사 한 줄에 밤새 울 수 있는 타입.",
      partHint: "잔잔한 발라드 · 브릿지 파트",
      parts: [{ song: "123-78", lyricLine: "비가 주르륵 내린 다음", fancamUrl: "https://youtu.be/ZOcjNJz-hXo" }],
    },
    {
      id: "propro",
      name: "현생도 덕질도 프로형", // ✏️
      emoji: "⚖️",
      description: "일할 땐 일하고 덕질할 땐 확실하게. 균형 잡힌 덕질의 정석. 오래, 꾸준히, 단단하게 좋아합니다.",
      partHint: "안정감 있는 도입 · 마무리 파트",
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
