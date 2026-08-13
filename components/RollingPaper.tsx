"use client";

import { useEffect, useState } from "react";
import { supabase, type Message } from "@/lib/supabase";

// 아주 간단한 필터 — Day 19~20(3주차)에 더 촘촘하게 다듬을 예정.
const BLOCKED_PATTERN = /(https?:\/\/|www\.)/i;

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function RollingPaper() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const usingSupabase = Boolean(supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;
    if (BLOCKED_PATTERN.test(content)) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    if (supabase) {
      const { data, error } = await supabase
        .from("messages")
        .insert({ nickname: nickname.trim(), content: content.trim() })
        .select()
        .single();

      if (error) {
        setStatus("error");
        return;
      }
      setMessages((prev) => [data as Message, ...prev]);
    } else {
      // Supabase 키가 아직 없을 때: 로컬 상태로만 동작(새로고침하면 사라짐).
      // 개발 초반 미리보기용이고, .env.local에 키를 넣으면 자동으로 실제 저장으로 전환됨.
      setMessages((prev) => [
        {
          id: makeLocalId(),
          nickname: nickname.trim(),
          content: content.trim(),
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setNickname("");
    setContent("");
    setStatus("idle");
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 sm:p-5"
      >
        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="닉네임"
            className="w-28 sm:w-36 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={300}
            placeholder="축하 메시지를 남겨주세요"
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="self-end rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--artist-primary)" }}
        >
          {status === "loading" ? "남기는 중..." : "메시지 남기기"}
        </button>
        {status === "error" && (
          <p className="text-xs text-red-500">
            링크는 포함할 수 없어요. 메시지를 다시 확인해주세요.
          </p>
        )}
        {!usingSupabase && (
          <p className="text-xs text-zinc-400">
            (지금은 미리보기 모드예요 — Supabase 키를 연결하면 실제로 저장됩니다)
          </p>
        )}
      </form>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: "var(--artist-secondary)" }}
          >
            <p className="whitespace-pre-wrap break-words">{m.content}</p>
            <p className="mt-2 text-xs text-zinc-500">from. {m.nickname}</p>
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
