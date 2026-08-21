"use client";

// 목표 진행바 — 목표 사다리(904 → 1004 → 2026) + 달성 순간 폭죽
import { useCallback, useEffect, useRef, useState } from "react";
import { quizConfig } from "@/config/quiz";
import { artistConfig } from "@/config/artist";
import { fetchMessageCount } from "@/lib/messages";
import { supabase } from "@/lib/supabase";
import { confettiBurst } from "@/lib/confettiBurst";
import { track } from "@/lib/track";

type GoalStep = { count: number; label: string };

function steps(): GoalStep[] {
  const s = (quizConfig as unknown as { goalSteps?: readonly GoalStep[] }).goalSteps;
  if (s && s.length > 0) return [...s].sort((a, b) => a.count - b.count);
  return [{ count: quizConfig.goalCount, label: "" }];
}

export function GoalMeter({ refreshKey }: { refreshKey: number }) {
  const [count, setCount] = useState<number | null>(null);
  const prevRef = useRef<number | null>(null);
  const ladder = steps();

  // 달성 순간 감지 → 폭죽 (라이브로 넘는 순간에만, 첫 로드 제외)
  useEffect(() => {
    const prev = prevRef.current;
    if (count !== null && prev !== null && count > prev) {
      for (const step of ladder) {
        if (prev < step.count && count >= step.count) {
          confettiBurst();
          track("goal_reached", { step: step.count });
          break;
        }
      }
    }
    if (count !== null) prevRef.current = count;
  }, [count, ladder]);

  const load = useCallback(async () => {
    const c = await fetchMessageCount();
    if (c !== null) setCount(c);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60_000); // 보정용 (실시간이 주 채널)
    return () => clearInterval(t);
  }, [load, refreshKey]);

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

  if (count === null) return null;

  const current = ladder.find((s) => count < s.count) ?? ladder[ladder.length - 1];
  const achieved = ladder.filter((s) => count >= s.count);
  const lastAchieved = achieved[achieved.length - 1] ?? null;
  const allDone = count >= ladder[ladder.length - 1].count;
  const pct = allDone ? 100 : Math.min(100, Math.round((count / current.count) * 1000) / 10);

  return (
    <div
      className="w-full max-w-2xl rounded-2xl p-4 sm:p-5 shadow-sm"
      style={
        lastAchieved
          ? { background: "linear-gradient(135deg, #FFF6E5, #FFEFF5)", border: "1px solid var(--artist-accent)" }
          : { backgroundColor: "var(--artist-card)" }
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium" style={{ color: "var(--artist-text)" }}>
          {allDone
            ? `🏆 모든 목표 달성! ${artistConfig.fandomName}의 마음 ${count.toLocaleString()}개`
            : lastAchieved
            ? <>🏆 {lastAchieved.count.toLocaleString()}개 달성! 다음 목표 <b style={{ color: "var(--artist-primary)" }}>{current.count.toLocaleString()}개</b> ({current.label})</>
            : `생일까지 축하 메시지 ${current.count.toLocaleString()}개 모으기`}
        </p>
        {!allDone && (
          <p className="font-display shrink-0 text-lg" style={{ color: "var(--artist-primary)" }}>
            {count.toLocaleString()} <span className="text-xs text-zinc-400">/ {current.count.toLocaleString()}</span>
          </p>
        )}
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
        {allDone ? `${artistConfig.fandomName} 최고 💖` : `${pct}%`}
      </p>
    </div>
  );
}
