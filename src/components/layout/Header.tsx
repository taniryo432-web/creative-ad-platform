"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/UserMenu";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        {/* ロゴ：モバイルでも確実に 44px タップ領域を確保 */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 min-h-[44px] min-w-[44px]"
        >
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[14px] tracking-tight text-gray-900 hidden sm:block">
            FFI Creative
          </span>
        </Link>

        {/* 検索バー */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="クリエイティブを検索..."
              className="w-full pl-8 pr-4 py-2 text-[13px] bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ナビ + アクション */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* デスクトップのみ: ナビリンク */}
          <nav className="hidden md:flex items-center gap-0.5 mr-1">
            <Link
              href="/"
              className={cn(
                "px-3 py-1.5 text-[13px] rounded-lg transition-colors",
                pathname === "/"
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              発見
            </Link>
            <Link
              href="/discover"
              className={cn(
                "px-3 py-1.5 text-[13px] rounded-lg transition-colors",
                pathname === "/discover"
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              Discover
            </Link>
          </nav>

          {/* 投稿ボタン（モバイルは BottomNav に移動済み→デスクトップのみ表示） */}
          <Link
            href="/posts/new"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[13px] font-semibold rounded-full hover:bg-red-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>投稿</span>
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
