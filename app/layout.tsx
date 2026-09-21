import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "엠제이 운영 관리 | MJE Demo",
  description: "학사 일정, 토요 보강, 상담 기록을 관리하는 엠제이 어학원 공유용 데모입니다.",
  robots: { index: false, follow: false },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
