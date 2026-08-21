"use client";

// suspicious 메시지의 2차 심사 호출 — 실패 시 허용 (1차 필터는 통과한 상태)
export async function moderateIfNeeded(content: string, suspicious: boolean | undefined): Promise<{ allow: boolean; reason?: string }> {
  if (!suspicious) return { allow: true };
  try {
    const res = await fetch("/api/moderate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return { allow: true };
    return await res.json();
  } catch {
    return { allow: true };
  }
}
