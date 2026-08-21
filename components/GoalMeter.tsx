"use client";

// 904 카운터 — "생일까지 축하 메시지 N개 모으기" 진행바
import { useCallback, useEffect, useState } from "react";
import { quizConfig } from "@/config/quiz";
import { artistConfig } from "@/config/artist";
import { fetchMessageCount } from "@/lib/messages";
import { supabase } from "@/lib/supabase";

export function GoalMeter({ refreshKey }: { refreshKey: number }) {
  const [count, setCount] = useState<number | null>(null);
  const goal = quizConfig.goalCount;

  const load = useCallback(async () => {
    const c = await fetchMessageCount();
    if (c !== null) setCount(c);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60_000); // 보정용 5분 주기 (실시간이 주 채널)
    return () => clearInterval(t);
  }, [load, refreshKey]);

  // 실시간 증감
  useEffect(() => {
    if (!supabase) return;
    const ch = supabase
      .channel("goal-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () =>
        setCount((c) => (c === null ? c : c + 1))
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, () =>
        setCount((c) => (c === null || c === 0 ? c : c - 1))
      )
      .subscribe();
    return () => {
      supabase?.removeChannel(ch);
    };
  }, []);

  if (count === null) return null; // 미리보기 모드 등에서는 숨김

  const pct = Math.min(100, Math.round((count / goal) * 1000) / 10);
  const done = count >= goal;

  return (
    <div className="w-full max-w-2xl rounded-2xl p-4 sm:p-5 shadow-sm" style={{ backgroundColor: "var(--artist-card)" }}>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium" style={{ color: "var(--artist-text)" }}>
          {done ? "🎉 목표 달성!" : `생일까지 축하 메시지 ${goal}개 모으기`}
        </p>
        <p className="font-display text-lg" style={{ color: "var(--artist-primary)" }}>
          {count.toLocaleString()} <span className="text-xs text-zinc-400">/ {goal}</span>
        </p>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--artist-secondary)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--artist-primary), var(--artist-accent))",
          }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-zinc-400">
        {done ? `${artistConfig.fandomName}의 마음이 목표를 넘었어요 💜` : `${pct}%`}
      </p>
    </div>
  );
}
