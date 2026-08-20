"use client";

// 사진 큐레이션 도구 — /photo-picker
// 메인 페이지 어디에도 링크되지 않는 관리용 페이지.
// 사진을 클릭해 제외 표시 → "새 설정 코드 복사" → config/photos.ts의 photos 배열에 붙여넣기.
import { useMemo, useState } from "react";
import { photoConfig } from "@/config/photos";

function shortName(url: string): string {
  const m = url.match(/\/media\/([\w-]+)/);
  if (m) return m[1];
  return url.split("/").pop() ?? url;
}

export default function PhotoPicker() {
  const photos = photoConfig.photos;
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState("");

  const kept = useMemo(() => photos.filter((_, i) => !excluded.has(i)), [photos, excluded]);

  function toggle(i: number) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function copyConfig() {
    const lines = kept.map((u) => `    "${u}",`).join("\n");
    const code = `  photos: [\n${lines}\n  ] as string[],`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(`설정 코드 복사됨 (${kept.length}장) — config/photos.ts의 photos: [...] 부분을 통째로 교체하세요`);
      setTimeout(() => setCopied(""), 4000);
    });
  }

  function copyExcludedList() {
    const list = photos.filter((_, i) => excluded.has(i)).map(shortName).join("\n");
    navigator.clipboard.writeText(list).then(() => {
      setCopied(`제외한 ${excluded.size}장의 파일명 복사됨`);
      setTimeout(() => setCopied(""), 4000);
    });
  }

  return (
    <div className="min-h-screen p-4 pb-28" style={{ backgroundColor: "var(--artist-secondary)" }}>
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-2xl mb-1" style={{ color: "var(--artist-text)" }}>
          📸 사진 큐레이션 (관리용)
        </h1>
        <p className="text-sm text-zinc-500 mb-4">
          빼고 싶은 사진을 클릭하세요. 다시 클릭하면 되살아납니다. 다 골랐으면 아래에서 새 설정 코드를 복사해{" "}
          <code className="rounded bg-white px-1">config/photos.ts</code>에 붙여넣으세요.
        </p>

        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {photos.map((url, i) => {
            const out = excluded.has(i);
            return (
              <li key={i}>
                <button onClick={() => toggle(i)} className="group relative block w-full overflow-hidden rounded-lg bg-white text-left shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url.replace("name=large", "name=small")}
                    alt={shortName(url)}
                    loading="lazy"
                    className={`aspect-[3/4] w-full object-cover transition-opacity ${out ? "opacity-25" : ""}`}
                  />
                  {out && (
                    <span className="absolute inset-0 flex items-center justify-center text-4xl">❌</span>
                  )}
                  <span className="block truncate px-1.5 py-1 text-[10px] text-zinc-400">
                    {i + 1}. {shortName(url)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 하단 고정 바 */}
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <p className="text-sm" style={{ color: "var(--artist-text)" }}>
            유지 <b>{kept.length}</b>장 · 제외 <b className="text-red-500">{excluded.size}</b>장
          </p>
          <button
            onClick={copyConfig}
            className="rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--artist-primary)" }}
          >
            새 설정 코드 복사 📋
          </button>
          <button
            onClick={copyExcludedList}
            disabled={excluded.size === 0}
            className="rounded-full px-4 py-2 text-sm disabled:opacity-40"
            style={{ backgroundColor: "var(--artist-secondary)", color: "var(--artist-primary-deep)" }}
          >
            제외 목록만 복사
          </button>
          {copied && <p className="text-xs text-green-600">{copied}</p>}
        </div>
      </div>
    </div>
  );
}
