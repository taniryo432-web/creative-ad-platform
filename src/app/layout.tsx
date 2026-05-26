import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/Toaster";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";

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
          <main className="pt-14">{children}</main>
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
