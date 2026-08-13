"use client";

import { useEffect, useState } from "react";

function getRemaining(targetISO: string) {
  const diff = new Date(targetISO).getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { days, hours, minutes, seconds, isOver: diff <= 0 };
}

export function Countdown({ targetISO }: { targetISO: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetISO));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining(targetISO));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetISO]);

  if (remaining.isOver) {
    return (
      <p className="text-2xl font-semibold" style={{ color: "var(--artist-primary)" }}>
        🎉 생일 축하해!
      </p>
    );
  }

  const units = [
    { label: "일", value: remaining.days },
    { label: "시간", value: remaining.hours },
    { label: "분", value: remaining.minutes },
    { label: "초", value: remaining.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[64px]"
          style={{ backgroundColor: "var(--artist-secondary)" }}
        >
          <span
            className="text-2xl sm:text-3xl font-bold tabular-nums"
            style={{ color: "var(--artist-primary)" }}
          >
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-xs sm:text-sm text-zinc-500 mt-1">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
