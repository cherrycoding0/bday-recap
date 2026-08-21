import type { Metadata } from "next";
import "./globals.css";
import { artistConfig } from "@/config/artist";

// 폰트: Neo둥근모 (SIL OFL, https://github.com/neodgm/neodgm) — 전체 적용.
// @font-face는 globals.css에 선언 (public/fonts/neodgm.woff2 셀프호스팅).
// 캔버스(카드 이미지)에서도 같은 family 이름을 쓰기 위해 next/font 대신 수동 선언을 사용.

const pageTitle = `${artistConfig.name}야 생일 축하해 🎂 | ${artistConfig.fandomName}`;
const pageDescription = `${artistConfig.groupName} ${artistConfig.name}에게 축하 메시지를 남겨보세요!`;

export const metadata: Metadata = {
  // TODO(배포 시): Vercel에 올라간 실제 주소로 NEXT_PUBLIC_SITE_URL 환경변수를 설정하세요.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    images: ["/og-image.png?v=2"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-image.png?v=2"],
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
          "--artist-primary-deep": artistConfig.themeColor.primaryDeep,
          "--artist-secondary": artistConfig.themeColor.secondary,
          "--artist-card": artistConfig.themeColor.card,
          "--artist-accent": artistConfig.themeColor.accent,
          "--artist-text": artistConfig.themeColor.text,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
