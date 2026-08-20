"use client";

// 메시지 저장/하트 — RollingPaper와 Quiz가 공유하는 로직
import { supabase, type Message } from "@/lib/supabase";

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

let previewSeq = 0; // 미리보기 모드용 순번

export async function insertMessage(
  nickname: string,
  content: string
): Promise<{ ok: true; message: Message } | { ok: false; reason: string }> {
  if (supabase) {
    const { data, error } = await supabase
      .from("messages")
      .insert({ nickname: nickname.trim(), content: content.trim() })
      .select()
      .single();
    if (error) return { ok: false, reason: "저장에 실패했어요. 잠시 뒤 다시 시도해주세요." };
    return { ok: true, message: data as Message };
  }
  // 미리보기 모드
  previewSeq += 1;
  return {
    ok: true,
    message: {
      id: makeLocalId(),
      nickname: nickname.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      seq: previewSeq,
      hearts: 0,
    },
  };
}

export async function heartMessage(id: string): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("heart_message", { mid: id });
  if (error) return null;
  return typeof data === "number" ? data : null;
}

// 브라우저별 하트 중복 방지 (완벽하지 않아도 충분)
const HEART_KEY = "bday-hearted";
export function getHearted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(HEART_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
export function markHearted(id: string) {
  try {
    const s = getHearted();
    s.add(id);
    localStorage.setItem(HEART_KEY, JSON.stringify([...s]));
  } catch {
    // localStorage 불가 환경이면 조용히 무시
  }
}

export async function fetchMessageCount(): Promise<number | null> {
  if (!supabase) return null;
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true });
  return error ? null : count;
}
