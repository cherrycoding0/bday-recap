"use client";

// D-day 자정 모드 — 생일 당일(KST 기준 24시간)에 폭죽 연출
import { useEffect, useRef, useState } from "react";
import { artistConfig } from "@/config/artist";

export function isBirthdayNow(): boolean {
  const start = new Date(artistConfig.birthdayThisYear).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  const now = Date.now();
  return now >= start && now < end;
}

export function BirthdayMode() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setActive(isBirthdayNow());
    const t = setInterval(() => setActive(isBirthdayNow()), 30_000);
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

    type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number };
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

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.85;
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
      </div>
    </>
  );
}
