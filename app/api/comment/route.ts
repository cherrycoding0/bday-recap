// AI 한 줄 코멘트 — 완성 카드에 들어갈 개인화 문장 1개.
// 키가 없으면 유형별 템플릿으로 폴백 (항상 동작, 비용 0)
// 비용 방어: IP당 분당 3회 레이트리밋 (인메모리 — 서버리스 인스턴스별이지만 어뷰징 완화엔 충분)

const RATE_LIMIT = 3;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= RATE_LIMIT) return true;
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // 메모리 방어
  return false;
}

const FALLBACK: Record<string, string> = {
  "저세상 텐션 올콘형": "이 텐션, 성호도 분명 느끼고 있을 거예요!",
  "앞자리 눈맞춤 승부사형": "그 진심, 언젠가 꼭 눈맞춤으로 돌아올 거예요.",
  "단톡방 전파왕형": "당신 덕분에 오늘도 성호의 소식이 널리 퍼져요.",
  "홈파티 집순이형": "아늑한 마음으로 보내는 축하가 제일 오래 남아요.",
  "숨스밍 눈물샘형": "조용한 마음이 가장 깊게 닿는 법이에요.",
  "현생도 덕질도 프로형": "꾸준한 마음이야말로 최고의 선물이에요.",
};

export async function POST(request: Request) {
  let body: { nickname?: string; content?: string; typeName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const { nickname, content, typeName } = body;
  if (!nickname || !content || !typeName) {
    return Response.json({ error: "필수 값 누락" }, { status: 400 });
  }

  const fallback = FALLBACK[typeName] ?? "당신의 마음이 카드에 담겼어요.";

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ comment: fallback, aiGenerated: false });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!anthropicKey && !openaiKey) {
    return Response.json({ comment: fallback, aiGenerated: false });
  }

  const prompt = `팬이 아이돌 생일 축하 페이지에 남긴 메시지야.
닉네임: ${nickname.slice(0, 20)}
유형: ${typeName}
메시지: ${content.slice(0, 300)}

이 팬에게 건네는 따뜻한 한 줄(25자 이내, 한국어, 이모지 없이)을 만들어줘.
메시지의 내용을 살짝 반영하면 좋아. 반드시 그 한 줄만 답해.`;

  try {
    let text = "";
    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.RECAP_MODEL ?? "claude-haiku-4-5",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      text = data.content?.[0]?.text ?? "";
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: process.env.RECAP_MODEL ?? "gpt-4o-mini",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      text = data.choices?.[0]?.message?.content ?? "";
    }
    const comment = text.trim().split("\n")[0].slice(0, 40);
    return Response.json({ comment: comment || fallback, aiGenerated: Boolean(comment) });
  } catch {
    return Response.json({ comment: fallback, aiGenerated: false });
  }
}
