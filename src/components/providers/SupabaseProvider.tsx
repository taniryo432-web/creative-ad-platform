"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * SupabaseProvider
 *
 * アプリ全体でひとつの Supabase クライアントを保持し、
 * バックグラウンドでトークンを自動更新し続けるプロバイダー。
 *
 * なぜ必要か？
 * - createBrowserClient は autoRefreshToken: true がデフォルトだが、
 *   インスタンスが GC されるとタイマーが止まる。
 * - 各コンポーネントが個別に createClient() するとインスタンスが散在し、
 *   タブを長時間放置するとトークンが期限切れになってログアウトする。
 * - このプロバイダーが常時マウントされることで、
 *   ページを開いている間はセッションが必ず更新され続ける。
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Layout がマウントされている間、同一インスタンスを保持
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // バックグラウンドのトークン自動更新を明示的に開始
    // （autoRefreshToken: true のデフォルト設定を確実に有効化する）
    supabase.auth.startAutoRefresh();

    return () => {
      // タブが閉じられたらタイマーを停止してリソースを解放
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  return <>{children}</>;
}
