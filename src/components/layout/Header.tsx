"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/UserMenu";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:block">
            Creative Intel
          </span>
        </Link>

        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="アイディアを検索..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                pathname === "/"
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              発見
            </Link>
            <Link
              href="/ranking"
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                pathname === "/ranking"
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              ランキング
            </Link>
          </nav>

          <Link
            href="/posts/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:block">投稿</span>
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
