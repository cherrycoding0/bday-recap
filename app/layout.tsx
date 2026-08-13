import type { Metadata } from "next";
import "./globals.css";
import { artistConfig } from "@/config/artist";

// TODO(Day 3): 눈누(noonnu.cc)에서 고른 한글 폰트를 next/font/local 로 여기에 연결하세요.
// 지금은 시스템 기본 폰트로 동작 — 네트워크로 구글 폰트를 받아올 필요가 없어서 배포 환경에 상관없이 안정적으로 빌드됩니다.

const pageTitle = `${artistConfig.name} 생일 축하 페이지 🎂 | ${artistConfig.fandomName}`;
const pageDescription = `${artistConfig.groupName} ${artistConfig.name}의 생일을 축하하는 팬 프로젝트 페이지. 축하 메시지를 남겨보세요!`;

export const metadata: Metadata = {
  // TODO(배포 시): Vercel에 올라간 실제 주소로 NEXT_PUBLIC_SITE_URL 환경변수를 설정하세요.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    // TODO(3주차): 실제 OG 이미지로 교체 — /public/og-image.png 에 1200x630 이미지를 넣고 아래 경로 확인
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className="h-full antialiased font-sans"
      style={
        {
          "--artist-primary": artistConfig.themeColor.primary,
          "--artist-secondary": artistConfig.themeColor.secondary,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
