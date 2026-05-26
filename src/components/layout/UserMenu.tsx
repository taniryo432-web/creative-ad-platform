"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as UserType } from "@/types";

export function UserMenu() {
  const [user, setUser] = useState<UserType | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ── useRef で安定したインスタンスを保持 ──────────────────────────
  // 毎レンダリングで createClient() を呼ぶと autoRefreshToken のタイマーが
  // リセットされ、セッション維持が壊れるため ref で管理する。
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // 初回: Cookie から即時セッション取得（ネットワーク不要）
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("users")
          .select("id, name, icon_url, role, status, created_at")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUser(data));
      }
    });

    // セッション変化（ログイン / ログアウト / トークン更新）を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("users")
          .select("id, name, icon_url, role, status, created_at")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUser(data));
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabaseRef.current.auth.signOut();
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
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                <Shield className="w-4 h-4" />
                ユーザー管理
              </Link>
            )}
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
