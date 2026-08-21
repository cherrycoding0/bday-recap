"use client";

// 폴라로이드 프레임 포토 슬라이드 — config/photos.ts 의 사진을 랜덤 순서로 돌려 보여준다.
// (파일명은 히스토리 유지를 위해 PhotoHeart 그대로 둠)
// 사진이 없으면 아무것도 렌더하지 않는다.
import { useCallback, useEffect, useRef, useState } from "react";
import { photoConfig } from "@/config/photos";
import { artistConfig } from "@/config/artist";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PhotoHeart() {
  const [order, setOrder] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const preloaded = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (photoConfig.photos.length === 0) return;
    setOrder(shuffle(photoConfig.photos));
  }, []);

  const advance = useCallback(() => {
    setIdx((i) => {
      const next = (i + 1) % order.length;
      const upcoming = order[(next + 1) % order.length];
      if (!preloaded.current.has(upcoming)) {
        const img = new Image();
        img.src = upcoming;
        preloaded.current.add(upcoming);
      }
      return next;
    });
    setFadeKey((k) => k + 1);
  }, [order]);

  useEffect(() => {
    if (order.length <= 1) return;
    // fadeKey가 바뀔 때마다(수동 탭 포함) 타이머 리셋 → 탭 직후 바로 또 안 넘어가게
    const t = setInterval(advance, photoConfig.intervalMs);
    return () => clearInterval(t);
  }, [order, advance, fadeKey]);

  if (order.length === 0) return null;

  return (
    <button
      type="button"
      onClick={advance}
      className="polaroid relative bg-white p-3 pb-4 shadow-lg rounded-sm cursor-pointer"
      aria-label="성호 사진 — 탭하면 다음 사진"
    >
      {/* 사진 영역: 3:4 세로 비율 — 세로 사진이 거의 잘리지 않음 */}
      <div className="relative h-72 w-56 sm:h-80 sm:w-60 overflow-hidden bg-[var(--artist-secondary)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={fadeKey}
          src={order[idx]}
          alt="성호 사진"
          className="polaroid-img h-full w-full object-cover"
        />
      </div>
      {/* 캡션 */}
      <p className="mt-2.5 text-center text-sm" style={{ color: "var(--artist-text)" }}>
        {artistConfig.name}야 생일 축하해💖
      </p>
      <p className="mt-0.5 text-center text-[10px] text-zinc-300">탭하면 다음 사진 →</p>
      {/* 모서리 하트 스티커 */}
      <span className="absolute -right-2.5 -top-2.5 rotate-12 text-2xl drop-shadow-sm" aria-hidden>
        💖
      </span>
    </button>
  );
}
