"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, type Message } from "@/lib/supabase";
import { validateMessage } from "@/lib/filter";
import { insertMessage, heartMessage, getHearted, markHearted } from "@/lib/messages";

type SortMode = "latest" | "hearts";

type AdminProps = {
  isAdmin?: boolean;
  onDelete?: (id: string) => Promise<boolean>;
};

export function RollingPaper({ onMessagePosted, refreshKey, isAdmin, onDelete }: { onMessagePosted?: () => void; refreshKey?: number } & AdminProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorText, setErrorText] = useState("");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    const filter = validateMessage(nickname, content);
    if (!filter.ok) {
      setErrorText(filter.reason);
      setStatus("error");
      return;
    }

    setStatus("loading");
    const saved = await insertMessage(nickname, content);
    if (!saved.ok) {
      setErrorText(saved.reason);
      setStatus("error");
      return;
    }
    setMessages((prev) => [saved.message, ...prev]);
    onMessagePosted?.();
    setNickname("");
    setContent("");
    setErrorText("");
    setStatus("idle");
  }

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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: "var(--artist-card)" }}
      >
        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="닉네임"
            className="w-28 sm:w-36 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[var(--artist-primary)]"
          />
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={300}
            placeholder="축하 메시지를 남겨주세요"
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[var(--artist-primary)]"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="self-end rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors hover:brightness-95"
          style={{ backgroundColor: "var(--artist-primary)" }}
        >
          {status === "loading" ? "남기는 중..." : "메시지 남기기"}
        </button>
        {status === "error" && <p className="text-xs text-red-500">{errorText}</p>}
        {!usingSupabase && (
          <p className="text-xs text-zinc-400">
            (지금은 미리보기 모드예요 — Supabase 키를 연결하면 실제로 저장됩니다)
          </p>
        )}
      </form>

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
            className="rounded-xl p-4 text-sm shadow-sm"
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
                <span>{hearted.has(m.id) ? "💜" : "🤍"}</span>
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
