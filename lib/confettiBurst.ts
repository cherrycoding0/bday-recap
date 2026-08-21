"use client";

// 화면 중앙 폭죽 버스트 — 임시 캔버스를 만들어 ~2.5초 재생 후 스스로 제거.
// 목표 달성 순간 등 일회성 연출용.
export function confettiBurst() {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  const css = getComputedStyle(document.documentElement);
  const colors = [
    css.getPropertyValue("--artist-primary").trim() || "#FF6FA5",
    css.getPropertyValue("--artist-accent").trim() || "#FFC55C",
    "#FFFFFF",
    "#FFC0D9",
  ];

  type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number; life: number };
  const parts: P[] = [];
  const spawn = (cx: number, cy: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.2;
      const speed = (3 + Math.random() * 7) * dpr;
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 2.5 * dpr,
        r: (3 + Math.random() * 6) * dpr,
        c: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 100 + Math.random() * 40,
      });
    }
  };
  spawn(canvas.width / 2, canvas.height / 2.6, 90);
  setTimeout(() => spawn(canvas.width / 3, canvas.height / 3, 50), 350);
  setTimeout(() => spawn((canvas.width / 3) * 2, canvas.height / 3, 50), 700);

  let raf = 0;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.13 * dpr;
      p.rot += p.vr;
      p.life--;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    }
    if (parts.length > 0) raf = requestAnimationFrame(tick);
    else canvas.remove();
  };
  raf = requestAnimationFrame(tick);
  setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 6000);
}
