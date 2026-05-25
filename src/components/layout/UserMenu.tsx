"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as UserType } from "@/types";

export function UserMenu() {
  const [user, setUser] = useState<UserType | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setUser(data));
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        ログイン
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors"
      >
        {user.icon_url ? (
          <img src={user.icon_url} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <User className="w-4 h-4" />
              プロフィール
            </Link>
            <Link
              href="/profile/saves"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Bookmark className="w-4 h-4" />
              保存済み
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  );
}
