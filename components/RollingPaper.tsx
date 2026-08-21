"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, type Message } from "@/lib/supabase";
import { heartMessage, getHearted, markHearted } from "@/lib/messages";

type SortMode = "latest" | "hearts";

type AdminProps = {
  isAdmin?: boolean;
  onDelete?: (id: string) => Promise<boolean>;
};

export function RollingPaper({ onMessagePosted, refreshKey, isAdmin, onDelete, meter }: { onMessagePosted?: () => void; refreshKey?: number; meter?: React.ReactNode } & AdminProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sort, setSort] = useState<SortMode>("latest");
  const [hearted, setHearted] = useState<Set<string>>(new Set());
  const usingSupabase = Boolean(supabase);

  const load = useCallback(async () => {
    if (!supabase) return;
    const query = supabase.from("messages").select("*");
    const { data } =
      sort === "hearts"
        ? await query.order("hearts", { ascending: false }).order("created_at", { ascending: false })
        : await query.order("created_at", { ascending: false });
    if (data) setMessages(data as Message[]);
  }, [sort]);

  useEffect(() => {
    setHearted(getHearted());
    load();
  }, [load, refreshKey]);

  // 실시간: 다른 팬의 메시지가 새로고침 없이 나타난다 (관리자 삭제도 실시간 반영)
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!supabase) return;
    const ch = supabase
      .channel("messages-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [m, ...prev]));
        setLiveIds((prev) => new Set(prev).add(m.id));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (payload) => {
        const oldId = (payload.old as { id?: string })?.id;
        if (oldId) setMessages((prev) => prev.filter((x) => x.id !== oldId));
      })
      .subscribe();
    return () => {
      supabase?.removeChannel(ch);
    };
  }, []);

  async function handleDelete(m: Message) {
    if (!onDelete) return;
    if (confirmingId !== m.id) {
      setConfirmingId(m.id); // 첫 탭: 확인 상태로
      setTimeout(() => setConfirmingId((c) => (c === m.id ? null : c)), 3000);
      return;
    }
    setConfirmingId(null);
    const ok = await onDelete(m.id);
    if (ok) {
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
      onMessagePosted?.(); // 카운터 갱신
    }
  }

  async function handleHeart(m: Message) {
    if (hearted.has(m.id)) return;
    markHearted(m.id);
    setHearted(new Set([...hearted, m.id]));
    // 낙관적 업데이트
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, hearts: (x.hearts ?? 0) + 1 } : x)));
    await heartMessage(m.id);
  }

  return (
    <div className="w-full max-w-2xl">
      {meter && (
        <div>
          {meter}
          <p className="mt-2 text-center text-xs text-zinc-400">
            💌 위의 <b style={{ color: "var(--artist-primary)" }}>사진드컵</b>이나 <b style={{ color: "var(--artist-primary)" }}>유형 테스트</b>를 마치고 메시지를 남겨주세요
          </p>
        </div>
      )}

      {usingSupabase && messages.length > 0 && (
        <div className="mt-5 flex gap-1.5">
          {([["latest", "최신순"], ["hearts", "하트순"]] as [SortMode, string][]).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
              style={
                sort === mode
                  ? { backgroundColor: "var(--artist-primary)", color: "white" }
                  : { backgroundColor: "var(--artist-card)", color: "var(--artist-text)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-xl p-4 text-sm shadow-sm ${liveIds.has(m.id) ? "rt-new" : ""}`}
            style={{ backgroundColor: "var(--artist-card)" }}
          >
            {isAdmin && (
              <button
                onClick={() => handleDelete(m)}
                className="float-right ml-2 rounded-full px-2 py-0.5 text-xs transition-colors"
                style={
                  confirmingId === m.id
                    ? { backgroundColor: "#EF4444", color: "white" }
                    : { backgroundColor: "var(--artist-secondary)", color: "#EF4444" }
                }
              >
                {confirmingId === m.id ? "정말 삭제?" : "삭제"}
              </button>
            )}
            <p className="whitespace-pre-wrap break-words">{m.content}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--artist-primary)" }}>
                from. {m.nickname}
                {m.seq ? <span className="text-zinc-300"> · #{String(m.seq).padStart(4, "0")}</span> : null}
              </p>
              <button
                onClick={() => handleHeart(m)}
                disabled={hearted.has(m.id)}
                className="flex items-center gap-1 text-xs text-zinc-400 transition-transform active:scale-125 disabled:cursor-default"
                aria-label="하트 보내기"
              >
                <span>{hearted.has(m.id) ? "💖" : "🤍"}</span>
                <span>{m.hearts ?? 0}</span>
              </button>
            </div>
          </li>
        ))}
        {messages.length === 0 && (
          <li className="text-sm text-zinc-400 col-span-full text-center py-8">
            아직 남겨진 메시지가 없어요. 첫 메시지를 남겨보세요 🎂
          </li>
        )}
      </ul>
    </div>
  );
}
