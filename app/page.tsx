import { Countdown } from "@/components/Countdown";
import { RollingPaper } from "@/components/RollingPaper";
import { artistConfig } from "@/config/artist";

export default function Home() {
  return (
    <div
      className="flex flex-1 flex-col items-center px-4 py-12 sm:py-20"
      style={{ backgroundColor: "var(--artist-secondary)" }}
    >
      <main className="flex w-full max-w-2xl flex-1 flex-col items-center gap-10 text-center">
        <div>
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--artist-primary)" }}
          >
            {artistConfig.groupName} · {artistConfig.fandomName}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: artistConfig.themeColor.text }}>
            {artistConfig.name} 생일 축하 페이지 🎂
          </h1>
        </div>

        <Countdown targetISO={artistConfig.birthdayThisYear} />

        <RollingPaper />
      </main>

      <footer className="mt-12 max-w-md text-center text-xs text-zinc-400">
        {artistConfig.disclaimer}
      </footer>
    </div>
  );
}
