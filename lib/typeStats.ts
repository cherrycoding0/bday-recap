"use client";

// 유형 분포 집계 — type_stats RPC (security definer: 집계 결과만 공개)
// 모듈 레벨 5분 캐시로 결과 화면이 열릴 때마다 호출되지 않게.
import { supabase } from "@/lib/supabase";

export type TypeStats = { total: number; byType: Record<string, number> };

let cache: { data: TypeStats; at: number } | null = null;
const TTL = 5 * 60 * 1000;

export async function fetchTypeStats(): Promise<TypeStats | null> {
  if (!supabase) return null;
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const { data, error } = await supabase.rpc("type_stats");
  if (error || !data) return cache?.data ?? null;
  const byType: Record<string, number> = {};
  let total = 0;
  for (const row of data as { type_id: string; cnt: number }[]) {
    byType[row.type_id] = Number(row.cnt);
    total += Number(row.cnt);
  }
  const result = { total, byType };
  cache = { data: result, at: Date.now() };
  return result;
}
