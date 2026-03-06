import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UMU Proposal Pilot | AI提案支援SaaS",
  description: "UMU専用AI提案書生成システム。ヒアリングメモから3プランの提案書を瞬時に生成。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
