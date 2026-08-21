// AI 모더레이션 2차 심사
// 1차 필터가 'suspicious'로 분류한 메시지만 이 라우트로 온다 (비용 최소화).
// 판정: LLM이 맥락을 보고 허용/거부. 키가 없으면 허용(현행 동작 유지 — 서비스 연속성 우선).
// 판정 결과는 events 테이블에 남겨 사후 오판율 분석에 사용.
import { createClient } from "@supabase/supabase-js";
import { artistConfig } from "@/config/artist";

const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= RATE_LIMIT) return true;
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

function logVerdict(content: string, verdict: string, aiUsed: boolean) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  const supabase = createClient(url, key);
  // fire-and-forget — 실패해도 무시
  supabase
    .from("events")
    .insert({
      session_id: "moderation",
      event: "moderation_verdict",
      meta: { verdict, aiUsed, excerpt: content.slice(0, 60) },
    })
    .then(() => {});
}

export async function POST(request: Request) {
  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ allow: true });
  }
  const content = (body.content ?? "").slice(0, 300);
  if (!content) return Response.json({ allow: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 키 없음/레이트리밋 → 허용 (1차 필터는 이미 통과한 메시지)
  if ((!anthropicKey && !openaiKey) || rateLimited(ip)) {
    logVerdict(content, "allow-fallback", false);
    return Response.json({ allow: true });
  }

  const prompt = `${artistConfig.groupName} ${artistConfig.name}의 생일 축하 페이지에 올라온 팬 메시지야.

<message>${content}</message>

이 메시지가 축하 페이지에 게시되기에 적절한지 판정해줘.
- 팬덤 특유의 과장 표현("미친 미모", "심장 죽었다" 등)은 애정 표현이므로 허용
- 아티스트나 타인을 향한 실제 비하·조롱·혐오·위협은 거부
- 애매하면 허용 쪽으로 (축하 페이지의 즐거움이 우선)
반드시 "ALLOW" 또는 "REJECT" 한 단어로만 답해.`;

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
          max_tokens: 10,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      text = (await res.json()).content?.[0]?.text ?? "";
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: process.env.RECAP_MODEL ?? "gpt-4o-mini",
          max_tokens: 10,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      text = (await res.json()).choices?.[0]?.message?.content ?? "";
    }
    const allow = !text.trim().toUpperCase().includes("REJECT");
    logVerdict(content, allow ? "allow" : "reject", true);
    return Response.json({
      allow,
      reason: allow ? undefined : "축하 페이지에 어울리지 않는 표현이 있어요. 문구를 다듬어주세요.",
    });
  } catch {
    logVerdict(content, "allow-error", false);
    return Response.json({ allow: true }); // AI 장애가 팬을 막지 않게
  }
}
