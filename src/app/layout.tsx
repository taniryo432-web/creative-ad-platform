import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Creative Ad Intelligence",
  description: "広告クリエイティブの知見を蓄積・共有するプラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen bg-[#F7F7F5]">
        <Header />
        <main className="pt-14">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
