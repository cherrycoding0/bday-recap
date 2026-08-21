"use client";

// 성호 사진드컵 🏆 — 16강 이상형 월드컵
// 매 판 사진 16장을 랜덤으로 뽑아 토너먼트. 우승 사진 = "내 원픽".
// 우승 기록은 events에 쌓여 명예의 전당(TOP 3)으로 집계된다.
import { useEffect, useMemo, useState } from "react";
import { photoConfig } from "@/config/photos";
import { artistConfig } from "@/config/artist";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/track";

type Step = "intro" | "play" | "result";
type Rank = { photo: string; wins: number };

const ROUND_NAMES: Record<number, string> = { 16: "16강", 8: "8강", 4: "준결승", 2: "결승" };
const MIN_GAMES_FOR_RANKS = 10; // 이 판수 이상 쌓여야 명예의 전당 표시

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 게임 화면용 작은 이미지 (X만 축소판 지원 — 위버스는 원본 그대로)
function small(url: string): string {
  return url.replace("name=large", "name=small");
}

export function WorldCup() {
  const [step, setStep] = useState<Step>("intro");
  const [pool, setPool] = useState<string[]>([]); // 현재 라운드 대기열
  const [nextRound, setNextRound] = useState<string[]>([]); // 승자들
  const [roundSize, setRoundSize] = useState(16);
  const [matchIdx, setMatchIdx] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [ranks, setRanks] = useState<Rank[] | null>(null);
  const [totalGames, setTotalGames] = useState(0);
  const [copied, setCopied] = useState(false);

  const canPlay = photoConfig.photos.length >= 16;

  // 명예의 전당 로드
  useEffect(() => {
    if (!supabase) return;
    supabase.rpc("worldcup_ranks").then(({ data }) => {
      if (data) {
        const rs = (data as Rank[]).map((r) => ({ photo: r.photo, wins: Number(r.wins) }));
        setRanks(rs);
        setTotalGames(rs.reduce((s, r) => s + r.wins, 0));
      }
    });
  }, [step === "result"]); // 결과가 나오면 갱신

  function start() {
    const picked = shuffle(photoConfig.photos).slice(0, 16);
    setPool(picked);
    setNextRound([]);
    setRoundSize(16);
    setMatchIdx(0);
    setWinner(null);
    setStep("play");
    track("worldcup_start");
    // 첫 두 라운드 이미지 미리 로드
    picked.slice(0, 8).forEach((u) => { const i = new Image(); i.src = small(u); });
  }

  function pick(chosen: string) {
    const winners = [...nextRound, chosen];
    const nextMatch = matchIdx + 1;

    if (nextMatch * 2 >= pool.length) {
      // 라운드 종료
      if (winners.length === 1) {
        setWinner(winners[0]);
        setStep("result");
        track("worldcup_complete", { winner: winners[0] });
        return;
      }
      setPool(winners);
      setNextRound([]);
      setRoundSize(winners.length);
      setMatchIdx(0);
      winners.slice(0, 4).forEach((u) => { const i = new Image(); i.src = small(u); });
    } else {
      setNextRound(winners);
      setMatchIdx(nextMatch);
      // 다다음 경기 미리 로드
      pool.slice((nextMatch + 1) * 2, (nextMatch + 2) * 2).forEach((u) => { const i = new Image(); i.src = small(u); });
    }
  }

  async function saveCard() {
    if (!winner) return;
    // X 사진만 캔버스 저장 가능 (위버스는 브라우저 보안 정책상 불가 → 공유 문구로 안내)
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = winner;
        setTimeout(rej, 8000);
      });
      const W = 1080, H = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      const c = artistConfig.themeColor;
      const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
      grad.addColorStop(0, c.primary);
      grad.addColorStop(1, c.primaryDeep);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // 폴라로이드 프레임
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(90, 150, 900, 1010);
      // 사진 (3:4 crop cover)
      const pw = 840, ph = 860, px = 120, py = 180;
      const scale = Math.max(pw / img.width, ph / img.height);
      const sw = pw / scale, sh = ph / scale;
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, px, py, pw, ph);
      try { await document.fonts.load('60px "NeoDunggeunmo"'); } catch { /* 폴백 */ }
      ctx.textAlign = "center";
      ctx.fillStyle = c.primaryDeep;
      ctx.font = '52px "NeoDunggeunmo", sans-serif';
      ctx.fillText(`나의 원픽 ${artistConfig.name} 🏆`, W / 2, py + ph + 80);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = '34px "NeoDunggeunmo", sans-serif';
      ctx.fillText(`${artistConfig.name} 사진드컵 · ${artistConfig.fandomName}`, W / 2, H - 90);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `내원픽-${artistConfig.name}.png`;
      a.click();
      track("worldcup_card_saved");
    } catch {
      alert("이 사진(위버스 출처)은 보안 정책상 카드로 저장할 수 없어요. 사진을 길게 눌러 직접 저장해주세요!");
    }
  }

  function share() {
    track("worldcup_share");
    const text = `${artistConfig.name} 사진드컵 🏆 내 원픽을 골랐어! 너의 원픽은?`;
    const url = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.href;
    if (navigator.share) navigator.share({ text: `${text}\n${url}` }).catch(() => {});
    else {
      navigator.clipboard?.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const matchup = useMemo(
    () => [pool[matchIdx * 2], pool[matchIdx * 2 + 1]],
    [pool, matchIdx]
  );

  if (!canPlay) return null;

  return (
    <section className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-sm" style={{ backgroundColor: "var(--artist-card)" }}>
      {step === "intro" && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--artist-text)" }}>
            {artistConfig.name} 사진드컵 🏆
          </h2>
          <p className="text-sm text-zinc-500">둘 중 하나만 고를 수 있다면? 16강 토너먼트로 내 원픽 찾기</p>
          <button
            onClick={start}
            className="rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:brightness-95"
            style={{ backgroundColor: "var(--artist-primary)" }}
          >
            16강 시작하기 🔥
          </button>

          {ranks && ranks.length >= 3 && totalGames >= MIN_GAMES_FOR_RANKS && (
            <div className="mt-2 w-full">
              <p className="mb-2 text-xs font-semibold" style={{ color: "var(--artist-primary)" }}>
                👑 명예의 전당 — {artistConfig.fandomName}가 가장 많이 고른 원픽
              </p>
              <div className="flex justify-center gap-3">
                {ranks.slice(0, 3).map((r, i) => (
                  <div key={r.photo} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={small(r.photo)} alt={`${i + 1}위`} className="h-24 w-20 rounded-lg object-cover shadow-sm" />
                    <span className="absolute -left-1.5 -top-1.5 rounded-full bg-white px-1.5 text-sm shadow">
                      {["🥇", "🥈", "🥉"][i]}
                    </span>
                    <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1 text-[10px] text-white">
                      {r.wins}승
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === "play" && matchup[0] && matchup[1] && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-display text-lg" style={{ color: "var(--artist-primary)" }}>
            {ROUND_NAMES[roundSize] ?? `${roundSize}강`} · {matchIdx + 1} / {pool.length / 2}
          </p>
          <div className="grid w-full grid-cols-2 gap-3">
            {matchup.map((url) => (
              <button key={url} onClick={() => pick(url)} className="group overflow-hidden rounded-2xl shadow-sm transition-transform active:scale-95">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={small(url)} alt="후보 사진" className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105" />
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400">더 마음이 가는 쪽을 탭!</p>
        </div>
      )}

      {step === "result" && winner && (
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-display text-2xl" style={{ color: "var(--artist-text)" }}>
            👑 당신의 원픽
          </h3>
          <div className="polaroid !rotate-0 relative bg-white p-3 pb-4 shadow-lg rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={winner} alt="원픽 사진" className="h-80 w-64 object-cover" />
            <p className="mt-2.5 text-center text-sm" style={{ color: "var(--artist-text)" }}>
              나의 원픽 {artistConfig.name} 🏆
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={saveCard} className="rounded-full px-5 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--artist-primary)" }}>
              카드 저장 📸
            </button>
            <button onClick={share} className="rounded-full px-5 py-2.5 text-sm font-medium text-white" style={{ backgroundColor: "var(--artist-primary-deep)" }}>
              {copied ? "복사됨! ✅" : "자랑하기 📢"}
            </button>
            <button onClick={start} className="rounded-full px-5 py-2.5 text-sm" style={{ backgroundColor: "var(--artist-secondary)", color: "var(--artist-primary-deep)" }}>
              다시 하기 🔀
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
