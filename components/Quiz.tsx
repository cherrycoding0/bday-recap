"use client";

import { useState } from "react";
import Image from "next/image";
import { quizConfig, resolveType, pickPart, type FanType, type SongPart } from "@/config/quiz";
import { artistConfig } from "@/config/artist";
import { getYoutubeThumbnail } from "@/lib/youtube";
import { validateMessage } from "@/lib/filter";
import { insertMessage } from "@/lib/messages";
import { renderCard } from "@/lib/cardImage";

type Step = "intro" | "quiz" | "result" | "card";

export function Quiz({ onMessagePosted }: { onMessagePosted?: () => void }) {
  const [step, setStep] = useState<Step>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [tension, setTension] = useState(0);
  const [social, setSocial] = useState(0);
  const [result, setResult] = useState<FanType | null>(null);
  const [part, setPart] = useState<SongPart | null>(null);

  // 카드 발급용 메시지 폼
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [seq, setSeq] = useState<number | null>(null);

  const questions = quizConfig.questions;

  function answer(t: number, s: number) {
    const nt = tension + t;
    const ns = social + s;
    if (qIndex + 1 < questions.length) {
      setTension(nt);
      setSocial(ns);
      setQIndex(qIndex + 1);
    } else {
      const type = resolveType(nt, ns);
      setResult(type);
      setPart(pickPart(type));
      setStep("result");
    }
  }

  function restart() {
    setStep("intro");
    setQIndex(0);
    setTension(0);
    setSocial(0);
    setResult(null);
    setPart(null);
    setCardUrl(null);
    setSeq(null);
    setFormError("");
  }

  async function handleCardSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!result || !nickname.trim() || !content.trim()) return;

    const filter = validateMessage(nickname, content);
    if (!filter.ok) {
      setFormError(filter.reason);
      return;
    }

    setBusy(true);
    setFormError("");

    const saved = await insertMessage(nickname, content);
    if (!saved.ok) {
      setFormError(saved.reason);
      setBusy(false);
      return;
    }
    onMessagePosted?.();
    const mySeq = saved.message.seq ?? null;
    setSeq(mySeq);

    // AI 한 줄 코멘트 (실패해도 카드 생성은 진행)
    let comment: string | null = null;
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), content: content.trim(), typeName: result.name }),
      });
      if (res.ok) comment = (await res.json()).comment ?? null;
    } catch { /* 폴백: 코멘트 없이 */ }

    const url = await renderCard({ type: result, part, nickname: nickname.trim(), seq: mySeq, comment });
    setCardUrl(url);
    setStep("card");
    setBusy(false);
  }

  function handleShare() {
    const text = `나는 "${result?.name}" ${artistConfig.fandomName}래 🎂 다음은 너 차례!`;
    const url = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.href;
    if (navigator.share) {
      navigator.share({ text: `${text}\n${url}` }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text}\n${url}`);
      alert("공유 문구를 복사했어요! 트위터/위버스에 붙여넣어 주세요.");
    }
  }

  const thumbnail = part
    ? part.customImage || getYoutubeThumbnail(part.fancamUrl)
    : null;

  return (
    <section className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-sm" style={{ backgroundColor: "var(--artist-card)" }}>
      {step === "intro" && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--artist-text)" }}>
            {quizConfig.title}
          </h2>
          <p className="text-sm text-zinc-500">{quizConfig.subtitle}</p>
          <button
            onClick={() => setStep("quiz")}
            className="rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:brightness-95"
            style={{ backgroundColor: "var(--artist-primary)" }}
          >
            테스트 시작하기 ✨
          </button>
        </div>
      )}

      {step === "quiz" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: i <= qIndex ? "var(--artist-primary)" : "#E8E4F5" }}
              />
            ))}
          </div>
          <h3 className="font-display text-xl sm:text-2xl" style={{ color: "var(--artist-text)" }}>
            Q{qIndex + 1}. {questions[qIndex].question}
          </h3>
          <div className="flex flex-col gap-2.5">
            {questions[qIndex].answers.map((a) => (
              <button
                key={a.label}
                onClick={() => answer(a.tension, a.social)}
                className="rounded-xl border border-zinc-200 px-4 py-3.5 text-sm text-left transition-colors hover:border-[var(--artist-primary)] hover:bg-[var(--artist-secondary)]"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--artist-primary)" }}>
            나의 오프 성격 유형은
          </p>
          <h3 className="font-display text-3xl" style={{ color: "var(--artist-text)" }}>
            {result.emoji} {result.name}
          </h3>

          {thumbnail ? (
            <a href={part?.fancamUrl || undefined} target="_blank" rel="noreferrer" className="block w-full max-w-sm overflow-hidden rounded-2xl relative group">
              <Image src={thumbnail} alt={`${result.name} 직캠 썸네일`} width={480} height={360} unoptimized className="w-full transition-transform group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                ▶ 직캠 보러가기
              </span>
            </a>
          ) : (
            <div
              className="w-full max-w-sm rounded-2xl py-10 text-sm text-white/90"
              style={{ background: "linear-gradient(160deg, var(--artist-primary), var(--artist-primary-deep))" }}
            >
              🎬 직캠 준비 중
            </div>
          )}

          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--artist-secondary)" }}>
            {part?.song && part?.lyricLine ? (
              <>
                <p className="font-medium" style={{ color: "var(--artist-text)" }}>“{part.lyricLine}”</p>
                <p className="mt-1 text-xs text-zinc-500">— {part.song}, {artistConfig.name} 파트</p>
              </>
            ) : (
              <p className="text-zinc-600">🎵 어울리는 파트: {result.partHint} <span className="text-zinc-400">(파트 공개 예정!)</span></p>
            )}
          </div>

          <p className="text-sm text-zinc-600 max-w-md">{result.description}</p>

          <div className="flex gap-2">
            {part?.fancamUrl && (
              <a
                href={part.fancamUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-95"
                style={{ backgroundColor: "var(--artist-primary)" }}
              >
                직캠 보러가기 ▶
              </a>
            )}
            {result.parts.filter((p) => p.song || p.fancamUrl).length > 1 && (
              <button
                onClick={() => setPart(pickPart(result, part))}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
                style={{ backgroundColor: "var(--artist-secondary)", color: "var(--artist-primary-deep)" }}
              >
                다른 파트도 보기 🔀
              </button>
            )}
          </div>

          {/* 완성 카드 발급: 메시지를 남겨야 닉네임+순번 카드가 나온다 */}
          <form onSubmit={handleCardSubmit} className="mt-2 w-full max-w-md flex flex-col gap-2.5 rounded-2xl border border-dashed p-4" style={{ borderColor: "var(--artist-primary)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--artist-text)" }}>
              🎂 축하 메시지를 남기면 <b>내 순번이 새겨진 카드</b>를 받아요
            </p>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="닉네임"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[var(--artist-primary)]"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder={`${artistConfig.name}에게 축하 메시지를 남겨주세요`}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none resize-none focus:border-[var(--artist-primary)]"
            />
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <button
              type="submit"
              disabled={busy}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--artist-primary-deep)" }}
            >
              {busy ? "카드 만드는 중..." : "메시지 남기고 카드 받기 🎁"}
            </button>
          </form>

          <button onClick={restart} className="text-xs text-zinc-400 underline">
            테스트 다시 하기
          </button>
        </div>
      )}

      {step === "card" && cardUrl && (
        <div className="flex flex-col items-center gap-4">
          <h3 className="font-display text-2xl" style={{ color: "var(--artist-text)" }}>
            🎉 카드 완성!
          </h3>
          {seq && (
            <p className="text-sm" style={{ color: "var(--artist-primary)" }}>
              당신은 <b>{String(seq).padStart(4, "0")}번째 {artistConfig.fandomName}</b>예요
            </p>
          )}
          {/* img 태그: 모바일에서 꾹 눌러 저장 가능해야 함 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cardUrl} alt="완성 카드" className="w-full max-w-sm rounded-2xl shadow-md" />
          <p className="text-xs text-zinc-400">이미지를 길게 눌러 저장할 수 있어요</p>
          <div className="flex gap-2">
            <a
              href={cardUrl}
              download={`${artistConfig.name}-생일카드.png`}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--artist-primary)" }}
            >
              이미지 저장
            </a>
            <button
              onClick={handleShare}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--artist-primary-deep)" }}
            >
              친구한테 자랑하기 📢
            </button>
          </div>
          <button onClick={restart} className="text-xs text-zinc-400 underline">
            테스트 다시 하기
          </button>
        </div>
      )}
    </section>
  );
}
