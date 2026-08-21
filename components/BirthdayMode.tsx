"use client";

// D-day 자정 모드 — 생일 당일(KST 기준 24시간)에 폭죽 + 케이크 초 불기 게임
// 미리보기: 주소 뒤에 ?dday=1 을 붙이면 아무 날에나 볼 수 있다 (테스트용)
import { useCallback, useEffect, useRef, useState } from "react";
import { artistConfig } from "@/config/artist";
import { track } from "@/lib/track";

export function isBirthdayNow(): boolean {
  const start = new Date(artistConfig.birthdayThisYear).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  const now = Date.now();
  return now >= start && now < end;
}

function candleCount(): number {
  // config에 candleCount가 있으면 그 값(세는 나이 등), 없으면 만 나이로 자동 계산
  const override = (artistConfig as { candleCount?: number }).candleCount;
  if (override && override > 0) return override;
  const year = new Date(artistConfig.birthdayThisYear).getFullYear();
  return Math.max(1, year - (artistConfig.birthYear ?? year - 20));
}

export function BirthdayMode() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef<(() => void) | null>(null);

  // 초 불기 게임 상태
  const total = candleCount();
  const [lit, setLit] = useState(total);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("dday") === "1";
    const check = () => setActive(preview || isBirthdayNow());
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      artistConfig.themeColor.primary,
      artistConfig.themeColor.accent,
      "#FFFFFF",
      "#C8BEFF",
    ];

    type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number; burst?: boolean; life?: number };
    const parts: P[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2 * dpr,
      vy: (0.8 + Math.random() * 1.6) * dpr,
      r: (4 + Math.random() * 6) * dpr,
      c: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.15,
    }));

    // 초를 다 끄면 화면 중앙에서 폭죽 버스트
    burstRef.current = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2.5;
      for (let i = 0; i < 80; i++) {
        const ang = (Math.PI * 2 * i) / 80;
        const speed = (3 + Math.random() * 6) * dpr;
        parts.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed - 2 * dpr,
          r: (3 + Math.random() * 5) * dpr,
          c: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          burst: true,
          life: 90,
        });
      }
    };

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.burst) {
          p.vy += 0.12 * dpr; // 중력
          p.life!--;
          if (p.life! <= 0) { parts.splice(i, 1); continue; }
        } else if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.burst ? Math.min(1, p.life! / 30) : 0.85;
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  const blow = useCallback(() => {
    if (done) return;
    setLit((prev) => {
      const next = Math.max(0, prev - (2 + Math.floor(Math.random() * 3))); // 탭당 2~4개
      if (next === 0) {
        setDone(true);
        burstRef.current?.();
        track("candles_blown");
      }
      return next;
    });
  }, [done]);

  if (!active) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50"
        style={{ width: "100vw", height: "100vh" }}
        aria-hidden
      />
      <div className="w-full max-w-2xl rounded-3xl p-6 text-center shadow-md"
        style={{ background: "linear-gradient(160deg, var(--artist-primary), var(--artist-primary-deep))" }}>
        <p className="font-display text-3xl sm:text-4xl text-white">
          🎂 {artistConfig.name}, 생일 축하해!
        </p>
        <p className="mt-2 text-sm text-white/85">
          {artistConfig.fandomName}의 마음이 오늘 하루 종일 도착하고 있어요 💜
        </p>

        {/* 초 불기 게임 */}
        <button
          onClick={blow}
          disabled={done}
          className="mx-auto mt-5 flex w-full max-w-sm flex-col items-center rounded-2xl bg-white/15 px-4 py-4 backdrop-blur-sm transition-transform active:scale-95 disabled:cursor-default"
          aria-label="케이크 초 불기"
        >
          {!done ? (
            <>
              {/* 초: 켜진 것은 🕯️, 꺼진 것은 회색 점 */}
              <div className="flex flex-wrap justify-center gap-0.5 text-lg leading-6">
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className={i < lit ? "candle-lit" : "opacity-30 grayscale"}>
                    🕯️
                  </span>
                ))}
              </div>
              <span className="mt-2 text-4xl">🎂</span>
              <span className="mt-2 text-xs text-white/90">
                연타해서 초를 꺼주세요! ({lit}/{total}개 남음)
              </span>
            </>
          ) : (
            <>
              <span className="text-4xl">🎂✨</span>
              <p className="font-display mt-2 text-lg text-white">
                {total}개의 초를 다 껐어요!
              </p>
              <p className="mt-1 text-xs text-white/90">
                소원은 {artistConfig.name}에게 닿을 거예요 💜
              </p>
            </>
          )}
        </button>
      </div>
    </>
  );
}
