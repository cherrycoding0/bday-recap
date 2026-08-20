// AI 리캡 카드 생성
// 롤링페이퍼 메시지를 모아 따뜻한 요약 카드를 만든다.
// - ANTHROPIC_API_KEY 또는 OPENAI_API_KEY 가 있으면 AI 요약
// - 둘 다 없으면 통계 기반 기본 리캡으로 폴백 (키 없이도 항상 동작)
// 비용 방어 (v1.5):
// - 1시간 인메모리 캐시: 방문자가 아무리 눌러도 AI 호출은 시간당 최대 1회
// - IP당 분당 5회 레이트리밋
import { createClient } from "@supabase/supabase-js";
import { artistConfig } from "@/config/artist";

type RecapPayload = {
  headline: string;
  summary: string;
  highlights: string[];
  messageCount: number;
  aiGenerated: boolean;
};

// ---- 캐시 & 레이트리밋 (서버리스 인스턴스별 인메모리) ----
const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간
let cache: { payload: RecapPayload; at: number; count: number } | null = null;

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

const RECAP_PROMPT = (messagesText: string) => `다음은 ${artistConfig.groupName} ${artistConfig.name}의 생일을 축하하는 팬들의 롤링페이퍼 메시지야.

<messages>
${messagesText}
</messages>

이 메시지들을 바탕으로 생일 리캡 카드 내용을 만들어줘. 규칙:
- 전체적으로 따뜻하고 애정이 느껴지는 톤, 한국어
- headline: 15자 이내의 카드 제목 (이모지 1개까지 허용)
- summary: 팬들이 남긴 마음을 2~3문장으로 요약
- highlights: 실제 메시지 중 특히 마음이 담긴 것 3개를 골라 원문 그대로 (각 60자 이내로 자르기)
- 메시지에 없는 내용을 지어내지 마
- 반드시 아래 JSON 형식으로만 답해: {"headline": "...", "summary": "...", "highlights": ["...", "...", "..."]}`;

function fallbackRecap(messages: { nickname: string; content: string }[]): RecapPayload {
  const highlights = [...messages]
    .sort((a, b) => a.content.length - b.content.length)
    .slice(0, 3)
    .map((m) => `${m.content.slice(0, 60)} — ${m.nickname}`);
  return {
    headline: `${artistConfig.name}에게 도착한 마음 💌`,
    summary: `${messages.length}명의 ${artistConfig.fandomName}가 축하 메시지를 남겼어요. 한 글자 한 글자에 담긴 마음을 모아 전합니다.`,
    highlights,
    messageCount: messages.length,
    aiGenerated: false,
  };
}

function extractJson(text: string): { headline: string; summary: string; highlights: string[] } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.headline === "string" && typeof parsed.summary === "string" && Array.isArray(parsed.highlights)) {
      return parsed;
    }
  } catch {
    // JSON 파싱 실패 → 폴백
  }
  return null;
}

async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.RECAP_MODEL ?? "claude-haiku-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.RECAP_MODEL ?? "gpt-4o-mini",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    if (cache) return Response.json(cache.payload);
    return Response.json({ error: "요청이 너무 많아요. 잠시 뒤 다시 시도해주세요." }, { status: 429 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return Response.json(
      { error: "Supabase가 아직 연결되지 않았어요. 미리보기 모드에서는 리캡을 만들 수 없습니다." },
      { status: 503 }
    );
  }

  const supabase = createClient(url, key);
  const { data: messages, error } = await supabase
    .from("messages")
    .select("nickname, content")
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    return Response.json({ error: "메시지를 불러오지 못했어요." }, { status: 500 });
  }
  if (!messages || messages.length === 0) {
    return Response.json({ error: "아직 메시지가 없어요. 메시지가 쌓이면 리캡을 만들 수 있어요." }, { status: 404 });
  }

  // 캐시 히트: 메시지 수가 크게 달라지지 않았으면 그대로 반환
  if (cache && Date.now() - cache.at < CACHE_TTL_MS && Math.abs(messages.length - cache.count) < 20) {
    return Response.json(cache.payload);
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey || openaiKey) {
    try {
      const messagesText = messages.map((m) => `- ${m.nickname}: ${m.content}`).join("\n");
      const prompt = RECAP_PROMPT(messagesText);
      const raw = anthropicKey
        ? await callAnthropic(prompt, anthropicKey)
        : await callOpenAI(prompt, openaiKey as string);
      const parsed = extractJson(raw);
      if (parsed) {
        const payload: RecapPayload = {
          headline: parsed.headline,
          summary: parsed.summary,
          highlights: parsed.highlights.slice(0, 3).map((h) => String(h).slice(0, 80)),
          messageCount: messages.length,
          aiGenerated: true,
        };
        cache = { payload, at: Date.now(), count: messages.length };
        return Response.json(payload);
      }
    } catch {
      // AI 호출 실패 → 아래 폴백으로 진행 (페이지가 죽는 것보다 기본 리캡이 낫다)
    }
  }

  const payload = fallbackRecap(messages);
  cache = { payload, at: Date.now(), count: messages.length };
  return Response.json(payload);
}
