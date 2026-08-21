"use client";

// 참여 퍼널 이벤트 수집 — fire-and-forget.
// 실패해도 조용히 무시: 측정이 사용자 경험을 절대 방해하지 않는다.
import { supabase } from "@/lib/supabase";

const SID_KEY = "bday-sid";

function sessionId(): string {
  try {
    let s = localStorage.getItem(SID_KEY);
    if (!s) {
      s = crypto.randomUUID();
      localStorage.setItem(SID_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

const onceMemory = new Set<string>();

/**
 * track("quiz_start")                          — 단순 기록
 * track("quiz_complete", { type: "allcon" })   — 메타 포함
 * track("visit", undefined, true)              — 세션당 1회만
 */
export function track(event: string, meta?: Record<string, unknown>, oncePerSession = false) {
  if (!supabase) return;
  if (oncePerSession) {
    const k = `bday-ev-${event}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {
      if (onceMemory.has(event)) return;
      onceMemory.add(event);
    }
  }
  supabase
    .from("events")
    .insert({ session_id: sessionId(), event, meta: meta ?? null })
    .then(() => { /* fire-and-forget */ });
}
