// 메시지 필터 (3주차 — 강화판)
// 생일 축하 페이지 특성상 "의심되면 막는" 보수적인 기준을 쓴다.
// 잘못 막힌 경우 사용자는 문구를 조금 바꿔 다시 시도할 수 있으므로 비용이 낮다.

const URL_PATTERN =
  /(https?:\/\/|www\.|[a-z0-9-]+\s*(\.|\(dot\)|점)\s*(com|net|org|kr|co|io|me|ly|gg|link|shop|site|xyz)\b)/i;

// 흔한 비속어/공격 표현 — 공백·특수문자를 끼워넣는 우회를 잡기 위해 정규화 후 검사한다.
// ⚠️ 이 필터는 "부분 문자열" 매칭 — "새끼" 하나면 "개새끼", "좆같은새끼"도 전부 걸립니다.
// 그래서 짧은 어근만 넣으면 됩니다 (변형을 일일이 나열할 필요 없음).
// normalize()가 공백·숫자·특수문자를 제거하므로 "시1발", "시.발", "시 발"도 자동으로 걸립니다.
const BLOCKED_WORDS = [
  // — 욕설 어근 (변형은 부분매칭으로 자동 커버) —
  "시발", "씨발", "씨빨", "시빨", "씨바", "씨벌", "시벌", "쒸발", "썅",
  "병신", "등신", "머저리", "빡대가리",
  "새끼", "씹", "좆", "존나", "졸라",
  "지랄", "염병", "옘병",
  "미친놈", "미친년", "또라이", "돌아이",
  "개년", "개놈", "개자식", "개자지",
  "걸레", "창녀", "창남",
  "닥쳐", "닥치", "아가리", "꺼져", "꺼지라",
  // — 위협·저주 —
  "죽어", "뒤져", "뒤진", "뒈져", "뒈진", "디져", "디진", "죽일", "엿먹",
  // — 패드립 —
  "느금", "니애미", "니에미", "니미럴", "애비없", "에미없",
  // — 혐오 표현 —
  "짱깨", "쪽바리", "홍어", "틀딱", "급식충", "한남충", "김치녀",
  // — 초성 (⚠️ "ㅁㅊ"은 "ㅁㅊ 잘생김" 같은 긍정 드립도 막힘 — 항의 들어오면 빼세요) —
  "ㅅㅂ", "ㅆㅂ", "ㅂㅅ", "ㅄ", "ㅈㄴ", "ㅈㄹ", "ㅁㅊ", "ㄲㅈ", "ㅅㄲ", "ㅗ",
  // — 영타 우회 (한글 욕을 영어 자판으로 친 것) —
  "tlqkf", "tlqk", "qudtls", "wlfkf",
  // — 팬덤 컨텍스트 —
  "탈덕", "안티", "사생",
  // — 영어 (부분매칭 오탐 없는 것만 — 설명은 아래 '일부러 뺀 것' 참고) —
  "fuck", "fck", "fuk", "fcuk", "phuck", "shit", "bitch", "btch", "biatch",
  "bastard", "asshole", "dumbass", "jackass", "dick", "cunt", "whore", "slut",
  "pussy", "nigga", "nigger", "faggot", "retard",
  "kys", "stfu", "gtfo", "killyourself", "gotohell",
];
// 일부러 뺀 것 (부분매칭 오탐 때문 — 필요하면 2차 AI 심사에서 처리):
// "보지"("해보지"), "자지"("일찍 자지마"), "미친"("미친 미모" 긍정 드립),
// "ass"(class/passion), "hoe"(shoes), "hell"(hello), "die"(indie/died), "cock"(cocktail)

// 같은 문자 8회 이상 반복 (ㅋㅋㅋㅋ 는 7회까지 허용)
const REPEAT_PATTERN = /(.)\1{7,}/;

// 전화번호/연락처 유도
const CONTACT_PATTERN = /(01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}|카톡|카카오톡\s*아이디|오픈\s*채팅|텔레그램)/i;

export type FilterResult =
  | { ok: true; suspicious?: boolean } // suspicious: LLM 2차 심사 권장
  | { ok: false; reason: string };

// 오탐 위험 때문에 무조건 차단은 못 하지만, 맥락 심사가 필요한 표현들.
// (아래 '일부러 뺀 것' 목록과 짝을 이룸 — 여기 걸리면 AI가 맥락을 판정)
const SUSPICIOUS_WORDS = [
  "미친", "죽여", "쓰레기", "꺼져라", "역겹", "토나", "극혐",
  "hate", "ugly", "disgusting", "gross",
];

// 메시지 최소 길이 (공백 제외 아님 — trim 후 전체 글자 수 기준)
const MIN_CONTENT_LENGTH = 10;
// "의미 있는 글자"(완성형 한글·영문·숫자) 최소 개수 — "ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ" 같은 자모 도배 방지
const MIN_MEANINGFUL_CHARS = 5;

function normalize(text: string): string {
  // 공백/특수문자를 제거해 "시 발", "시1발" 같은 우회를 잡는다.
  return text.replace(/[\s\d~!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?·ㆍ]/g, "").toLowerCase();
}

export function validateMessage(nickname: string, content: string): FilterResult {
  const trimmed = content.trim();
  if (trimmed.length < MIN_CONTENT_LENGTH) {
    return { ok: false, reason: `메시지는 ${MIN_CONTENT_LENGTH}자 이상 써주세요. 마음을 조금만 더 담아주시면 좋아요 🎂` };
  }
  const meaningful = (trimmed.match(/[가-힣a-zA-Z0-9]/g) ?? []).length;
  if (meaningful < MIN_MEANINGFUL_CHARS) {
    return { ok: false, reason: "자음이나 기호만으로는 등록할 수 없어요. 문장으로 축하해주세요 💜" };
  }

  const fields: Array<[string, string]> = [
    ["닉네임", nickname],
    ["메시지", content],
  ];

  for (const [label, raw] of fields) {
    const text = raw.trim();
    if (!text) continue;

    if (URL_PATTERN.test(text)) {
      return { ok: false, reason: `${label}에 링크는 포함할 수 없어요.` };
    }
    if (CONTACT_PATTERN.test(text)) {
      return { ok: false, reason: `${label}에 연락처/외부 채널 안내는 넣을 수 없어요.` };
    }
    if (REPEAT_PATTERN.test(text)) {
      return { ok: false, reason: `${label}에 같은 글자가 너무 많이 반복됐어요.` };
    }

    const normalized = normalize(text);
    for (const word of BLOCKED_WORDS) {
      if (normalized.includes(word)) {
        return { ok: false, reason: "축하 페이지에 어울리지 않는 표현이 있어요. 문구를 다듬어주세요." };
      }
    }
  }

  // 통과했지만 맥락 심사가 필요한 표현이 있으면 표시 (AI 2차 심사 대상)
  const normalizedContent = normalize(content);
  for (const word of SUSPICIOUS_WORDS) {
    if (normalizedContent.includes(normalize(word))) {
      return { ok: true, suspicious: true };
    }
  }

  return { ok: true };
}
