"use client";

// 완성 카드 이미지 생성 — 캔버스로 1080x1350(4:5) PNG를 그린다.
// 외부 이미지 없이 팔레트+타이포만 사용 (저작권 안전 + CORS 무관)
import { artistConfig } from "@/config/artist";
import type { FanType, SongPart } from "@/config/quiz";

const W = 1080;
const H = 1350;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = [...text];
  const lines: string[] = [];
  let line = "";
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch === " " ? "" : ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderCard(opts: {
  type: FanType;
  part: SongPart | null; // 랜덤 선택된 파트
  nickname: string;
  seq: number | null;
  comment: string | null; // AI 한 줄 코멘트
}): Promise<string> {
  // 폰트 로드 대기 (BMJUA/Pretendard가 캔버스에 적용되도록)
  try {
    await document.fonts.load('60px "NeoDunggeunmo"');
    await document.fonts.ready;
  } catch { /* 폰트 로드 실패해도 시스템 폰트로 진행 */ }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const c = artistConfig.themeColor;

  // 배경 그라데이션
  const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
  grad.addColorStop(0, c.primary);
  grad.addColorStop(1, c.primaryDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 은은한 빛 원
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath(); ctx.arc(W - 100, 120, 320, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(80, H - 140, 260, 0, Math.PI * 2); ctx.fill();

  // 컨페티
  const seeds = [7, 13, 29, 41, 53, 67, 83, 97, 113, 131, 149, 167, 181, 199, 223, 241];
  const confColors = [c.accent, "#FFFFFF", "#FFC0D9", "#FFE3A3"];
  seeds.forEach((s, i) => {
    const x = ((s * 97) % W);
    const y = ((s * 173) % H);
    if (y > 300 && y < 1100) return; // 본문 영역 피함
    ctx.fillStyle = confColors[i % 4] + "CC";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((s % 360) * Math.PI / 180);
    if (i % 2) ctx.fillRect(-7, -4, 14, 8);
    else { ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  });

  const jua = (size: number) => `${size}px "NeoDunggeunmo", sans-serif`;
  const pre = (size: number, weight = 400) => `${weight} ${size}px "NeoDunggeunmo", sans-serif`;

  ctx.textAlign = "center";

  // 상단: 그룹 · 팬덤
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = pre(34, 600);
  ctx.fillText(`${artistConfig.groupName} ${artistConfig.name} 생일 축하 🎂`, W / 2, 130);

  // 유형 이모지 + 이름
  ctx.font = "120px sans-serif";
  ctx.fillText(opts.type.emoji, W / 2, 330);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = jua(88);
  ctx.fillText(opts.type.name, W / 2, 470);

  // 파트 (가사 한 줄 + 곡명) — 없으면 파트 성격 문구
  const hasPart = Boolean(opts.part?.song && opts.part?.lyricLine);
  ctx.font = pre(40, 500);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  const partText = hasPart
    ? `“${opts.part!.lyricLine}”`
    : opts.type.partHint;
  const partLines = wrapText(ctx, partText, W - 240);
  let py = 580;
  partLines.slice(0, 2).forEach((l) => { ctx.fillText(l, W / 2, py); py += 56; });
  if (hasPart) {
    ctx.font = pre(32);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(`— ${opts.part!.song}, ${artistConfig.name} 파트`, W / 2, py + 8);
    py += 50;
  }

  // 설명 박스
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(ctx, 100, py + 40, W - 200, 290, 36);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = pre(36);
  const descLines = wrapText(ctx, opts.type.description, W - 300);
  let dy = py + 110;
  descLines.slice(0, 4).forEach((l) => { ctx.fillText(l, W / 2, dy); dy += 54; });

  // AI 코멘트 (있으면)
  if (opts.comment) {
    ctx.font = pre(33);
    ctx.fillStyle = "#FFD9A8";
    const cLines = wrapText(ctx, `💌 ${opts.comment}`, W - 260);
    let cy = py + 380;
    cLines.slice(0, 2).forEach((l) => { ctx.fillText(l, W / 2, cy); cy += 48; });
  }

  // 하단: 닉네임 + 순번 배지
  const badgeY = H - 250;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  roundRect(ctx, W / 2 - 300, badgeY, 600, 96, 48);
  ctx.fill();
  ctx.fillStyle = c.primaryDeep;
  ctx.font = jua(44);
  const seqText = opts.seq
    ? `${String(opts.seq).padStart(4, "0")}번째 ${artistConfig.fandomName}, ${opts.nickname}`
    : opts.nickname;
  ctx.fillText(seqText, W / 2, badgeY + 62);

  // URL
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = pre(28);
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "");
  ctx.fillText(site || "성호 생일 축하 페이지", W / 2, H - 80);

  return canvas.toDataURL("image/png");
}
