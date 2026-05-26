import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/Toaster";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";

// Safe area (ノッチ・ホームバー) を有効化するために必要
export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FFI Creative",
  description: "クリエイティブ共有プラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen bg-[#F7F7F5]">
        <SupabaseProvider>
          <Header />
          {/* モバイル: BottomNav 分の余白 (56px + safe-area)、デスクトップ: 不要 */}
          <main className="pt-14 pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
