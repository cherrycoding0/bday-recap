"use client";

import { useState } from "react";
import { artistConfig } from "@/config/artist";

type Recap = {
  headline: string;
  summary: string;
  highlights: string[];
  messageCount: number;
  aiGenerated: boolean;
};

export function RecapCard() {
  const [recap, setRecap] = useState<Recap | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleGenerate() {
    setStatus("loading");
    setErrorText("");
    try {
      const res = await fetch("/api/recap");
      const data = await res.json();
      if (!res.ok) {
        setErrorText(data.error ?? "리캡을 만들지 못했어요.");
        setStatus("error");
        return;
      }
      setRecap(data);
      setStatus("idle");
    } catch {
      setErrorText("리캡을 만들지 못했어요. 잠시 뒤 다시 시도해주세요.");
      setStatus("error");
    }
  }

  function handleCopy() {
    if (!recap) return;
    const text = [
      `🎂 ${recap.headline}`,
      "",
      recap.summary,
      "",
      ...recap.highlights.map((h) => `💌 ${h}`),
      "",
      `${artistConfig.groupName} ${artistConfig.name} 생일 축하 페이지에서 ${recap.messageCount}개의 메시지를 모았어요.`,
    ].join("\n");
    navigator.clipboard?.writeText(text);
  }

  return (
    <section className="w-full max-w-2xl">
      {!recap && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={status === "loading"}
            className="rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-colors hover:brightness-95"
            style={{ backgroundColor: "var(--artist-primary-deep)" }}
          >
            {status === "loading" ? "마음을 모으는 중..." : "✨ AI 리캡 카드 만들기"}
          </button>
          <p className="text-xs text-zinc-400">
            지금까지 쌓인 축하 메시지를 한 장의 카드로 요약해요
          </p>
          {status === "error" && <p className="text-xs text-red-500">{errorText}</p>}
        </div>
      )}

      {recap && (
        <div
          className="rounded-3xl p-6 sm:p-8 text-left shadow-md"
          style={{
            background: `linear-gradient(160deg, var(--artist-primary) 0%, var(--artist-primary-deep) 100%)`,
          }}
        >
          <p className="text-xs font-medium text-white/70 mb-1">
            {artistConfig.groupName} {artistConfig.name} · 생일 리캡
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-white">{recap.headline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90">{recap.summary}</p>

          <ul className="mt-5 flex flex-col gap-2">
            {recap.highlights.map((h, i) => (
              <li
                key={i}
                className="rounded-xl bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-sm"
              >
                💌 {h}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-white/70">
              {recap.messageCount}개의 메시지
              {!recap.aiGenerated && " · 기본 리캡"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="rounded-full bg-white/20 px-4 py-1.5 text-xs text-white hover:bg-white/30 transition-colors"
              >
                텍스트 복사
              </button>
              <button
                onClick={handleGenerate}
                disabled={status === "loading"}
                className="rounded-full bg-white/20 px-4 py-1.5 text-xs text-white hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "..." : "다시 만들기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
