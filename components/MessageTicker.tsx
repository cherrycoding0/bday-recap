"use client";

// 상단 띠배너 — 등록된 메시지를 랜덤으로 섞어 흐르게 보여준다.
import { useEffect, useRef, useState } from "react";
import { supabase, type Message } from "@/lib/supabase";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MessageTicker({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<Message[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  // iOS 웹킷에서 CSS 키프레임이 멈추는 문제가 있어 JS(requestAnimationFrame)로 굴린다.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) return;
    let x = 0;
    let raf = 0;
    let paused = false;
    let last = performance.now();
    const SPEED = 45; // px/초

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused) {
        x -= SPEED * dt;
        const half = el.scrollWidth / 2;
        if (half > 0 && -x >= half) x += half;
        el.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; last = performance.now(); };
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
    };
  }, [items]);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    async function load() {
      const { data } = await supabase!
        .from("messages")
        .select("id, nickname, content, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (alive && data && data.length > 0) {
        setItems(shuffle(data as Message[]).slice(0, 12));
      }
    }
    load();
    const t = setInterval(load, 120_000); // 2분마다 새로 섞기
    return () => { alive = false; clearInterval(t); };
  }, [refreshKey]);

  if (items.length === 0) return null;

  const chips = items.map((m) => (
    `💌 ${m.nickname}: ${m.content.length > 40 ? m.content.slice(0, 40) + "…" : m.content}`
  ));

  return (
    <div className="w-full px-4 pt-4">
      <div
        className="ticker-wrap mx-auto w-full max-w-2xl overflow-hidden rounded-full py-2"
        style={{ backgroundColor: "var(--artist-primary)" }}
        aria-hidden
      >
      <div ref={trackRef} className="flex w-max gap-8 will-change-transform">
        {/* 매끄러운 무한 루프를 위해 두 벌 렌더 */}
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 gap-8">
            {chips.map((text, i) => (
              <span key={`${dup}-${i}`} className="whitespace-nowrap text-xs text-white/95">
                {text}
              </span>
            ))}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
