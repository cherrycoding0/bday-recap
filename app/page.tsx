"use client";

import { useEffect, useState } from "react";
import { Countdown } from "@/components/Countdown";
import { RollingPaper } from "@/components/RollingPaper";
import { RecapCard } from "@/components/RecapCard";
import { Quiz } from "@/components/Quiz";
import { GoalMeter } from "@/components/GoalMeter";
import { BirthdayMode } from "@/components/BirthdayMode";
import { MessageTicker } from "@/components/MessageTicker";
import { AdminLogin } from "@/components/AdminLogin";
import { PhotoHeart } from "@/components/PhotoHeart";
import { WorldCup } from "@/components/WorldCup";
import { useAdmin } from "@/lib/useAdmin";
import { track } from "@/lib/track";
import { artistConfig } from "@/config/artist";

export default function Home() {
  // 메시지가 등록되면 카운터/목록을 갱신하기 위한 키
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  const admin = useAdmin();

  useEffect(() => {
    track("visit", undefined, true);
  }, []);

  // 사진드컵 또는 유형 테스트를 완주해야 메시지 폼이 열린다.
  // 다시 시작하면 해당 콘텐츠의 완주 상태는 닫힘 (다른 쪽이 완주면 폼 유지).
  const [quizDone, setQuizDone] = useState(false);
  const [cupDone, setCupDone] = useState(false);

  return (
    <div
      className="flex flex-1 flex-col items-center"
      style={{ backgroundColor: "var(--artist-secondary)" }}
    >
      <MessageTicker refreshKey={refreshKey} />
      <div className="flex w-full flex-1 flex-col items-center px-4 py-12 sm:py-16">
      <main className="flex w-full max-w-2xl flex-1 flex-col items-center gap-8 text-center">
        <div>
          <p
            className="text-sm font-semibold mb-2 tracking-wide"
            style={{ color: "var(--artist-primary)" }}
          >
            {artistConfig.groupName} · {artistConfig.fandomName}
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl"
            style={{ color: "var(--artist-text)" }}
          >
            {artistConfig.name} 🎂
          </h1>
        </div>

        <BirthdayMode />

        <Countdown targetISO={artistConfig.birthdayThisYear} />

        <PhotoHeart />

        <WorldCup onCompleted={() => setCupDone(true)} onRestart={() => setCupDone(false)} />

        <Quiz onMessagePosted={bump} onCompleted={() => setQuizDone(true)} onRestart={() => setQuizDone(false)} />

        <RollingPaper
          onMessagePosted={bump}
          refreshKey={refreshKey}
          isAdmin={admin.isAdmin}
          onDelete={admin.deleteMessage}
          showForm={quizDone || cupDone}
          meter={<GoalMeter refreshKey={refreshKey} />}
        />

        <RecapCard />
      </main>

      <footer className="mt-12 flex max-w-md flex-col items-center gap-3 text-center text-xs text-zinc-400">
        <p>{artistConfig.disclaimer}</p>
        <AdminLogin admin={admin} />
      </footer>
      </div>
    </div>
  );
}
