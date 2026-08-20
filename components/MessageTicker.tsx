"use client";

// 상단 띠배너 — 등록된 메시지를 랜덤으로 섞어 흐르게 보여준다.
import { useEffect, useState } from "react";
import { supabase, type Message } from "@/lib/supabase";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MessageTicker({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<Message[]>([]);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    async function load() {
      const { data } = await supabase!
        .from("messages")
        .select("id, nickname, content, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (alive && data && data.length > 0) {
        setItems(shuffle(data as Message[]).slice(0, 12));
      }
    }
    load();
    const t = setInterval(load, 120_000); // 2분마다 새로 섞기
    return () => { alive = false; clearInterval(t); };
  }, [refreshKey]);

  if (items.length === 0) return null;

  const chips = items.map((m) => (
    `💌 ${m.nickname}: ${m.content.length > 40 ? m.content.slice(0, 40) + "…" : m.content}`
  ));

  return (
    <div
      className="ticker-wrap w-full overflow-hidden py-2"
      style={{ backgroundColor: "var(--artist-primary)" }}
      aria-hidden
    >
      <div className="ticker-track flex w-max gap-8">
        {/* 매끄러운 무한 루프를 위해 두 벌 렌더 */}
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 gap-8">
            {chips.map((text, i) => (
              <span key={`${dup}-${i}`} className="whitespace-nowrap text-xs text-white/95">
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
