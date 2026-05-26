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

  const isHome     = pathname === "/";
  const isDiscover = pathname.startsWith("/discover");
  const isProfile  = pathname.startsWith("/profile");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14">

        {/* ホーム */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-0.5 px-5 py-1 min-w-[56px] transition-colors",
            isHome ? "text-gray-900" : "text-gray-400"
          )}
        >
          <Home className={cn("w-5 h-5", isHome && "fill-gray-900")} />
          <span className="text-[10px] font-medium">ホーム</span>
        </Link>

        {/* ───── Discover（存在感を高める・グラデーションなし） ───── */}
        <Link
          href="/discover"
          className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[64px] active:scale-95 transition-transform"
        >
          {/* 再生アイコン：アクティブ時は黒塗り、非アクティブは淡いグレー円 */}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isDiscover ? "bg-gray-900" : "bg-gray-100"
            )}
          >
            {/* 三角形 play アイコン（SVG直書きで細かく調整） */}
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <path
                d="M1.5 1.5L12.5 8L1.5 14.5V1.5Z"
                fill={isDiscover ? "white" : "#9CA3AF"}
                stroke={isDiscover ? "white" : "#9CA3AF"}
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className={cn(
            "text-[10px] font-semibold",
            isDiscover ? "text-gray-900" : "text-gray-500"
          )}>
            Discover
          </span>
        </Link>

        {/* 投稿（黒円・シンプル） */}
        <Link
          href="/posts/new"
          className="flex flex-col items-center gap-0.5 px-5 py-1 min-w-[56px] active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-gray-400">投稿</span>
        </Link>

        {/* プロフィール */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center gap-0.5 px-5 py-1 min-w-[56px] transition-colors",
            isProfile ? "text-gray-900" : "text-gray-400"
          )}
        >
          <User className={cn("w-5 h-5", isProfile && "fill-gray-900")} />
          <span className="text-[10px] font-medium">プロフィール</span>
        </Link>

      </div>
    </nav>
  );
}
