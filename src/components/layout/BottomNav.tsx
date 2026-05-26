"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

// フルスクリーン表示するページでは非表示
const HIDDEN_PATHS = ["/discover", "/auth", "/pending"];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  const isHome = pathname === "/";
  const isProfile = pathname.startsWith("/profile");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14">

        {/* ホーム */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-0.5 px-5 py-1 min-w-[56px] transition-all",
            isHome ? "text-gray-900" : "text-gray-400 active:text-gray-600"
          )}
        >
          <Home className={cn("w-5 h-5 transition-all", isHome && "fill-gray-900")} />
          <span className="text-[10px] font-medium">ホーム</span>
        </Link>

        {/* Discover（グラデーションアイコンで目立たせる） */}
        <Link
          href="/discover"
          className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] active:scale-95 transition-transform"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
            style={{
              background: "linear-gradient(135deg, #f9d423 0%, #f83600 40%, #c0392b 70%, #8e44ad 100%)",
              boxShadow: "0 4px 12px rgba(248, 54, 0, 0.35)",
            }}
          >
            {/* 再生ボタン風の三角形 */}
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M2 1.5L14 9L2 16.5V1.5Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-gray-700">Discover</span>
        </Link>

        {/* 投稿 */}
        <Link
          href="/posts/new"
          className="flex flex-col items-center gap-0.5 px-5 py-1 min-w-[56px] active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] font-medium text-gray-400">投稿</span>
        </Link>

        {/* プロフィール */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center gap-0.5 px-5 py-1 min-w-[56px] transition-all",
            isProfile ? "text-gray-900" : "text-gray-400 active:text-gray-600"
          )}
        >
          <User className={cn("w-5 h-5 transition-all", isProfile && "fill-gray-900")} />
          <span className="text-[10px] font-medium">プロフィール</span>
        </Link>

      </div>
    </nav>
  );
}
