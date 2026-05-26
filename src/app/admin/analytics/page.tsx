import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // 統計データを並行取得
  const [
    { count: totalPosts },
    { count: totalUsers },
    { count: totalLikes },
    { data: rawPosts },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("likes").select("*", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select(`id, title, image_url, created_at, user:users(name), like_count:likes(count)`)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("users")
      .select("id, name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const posts = (rawPosts ?? [])
    .map((p) => ({ ...p, like_count: p.like_count?.[0]?.count ?? 0 }))
    .sort((a, b) => b.like_count - a.like_count);

  const top3 = posts.slice(0, 3);
  const ranking = posts.slice(0, 20);

  const MEDAL = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "総投稿数", value: totalPosts ?? 0, suffix: "件" },
          { label: "総ユーザー数", value: totalUsers ?? 0, suffix: "人" },
          { label: "総いいね数", value: totalLikes ?? 0, suffix: "" },
        ].map(({ label, value, suffix }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center"
          >
            <p className="text-2xl font-bold text-gray-900">
              {value.toLocaleString()}
              <span className="text-sm font-normal text-gray-400 ml-0.5">{suffix}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* TOP3 ハイライト */}
      {top3.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">TOP 3</h2>
          <div className="grid grid-cols-3 gap-2">
            {top3.map((post, i) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square block hover:opacity-90 transition-opacity"
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-lg leading-none">{MEDAL[i]}</p>
                  <p className="text-white text-[11px] font-medium truncate mt-0.5">{post.title}</p>
                  <p className="text-white/70 text-[10px]">♡ {post.like_count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ランキングテーブル */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">人気投稿ランキング</h2>
          <span className="text-xs text-gray-400">いいね数順</span>
        </div>
        <div className="divide-y divide-gray-50">
          {ranking.map((post, i) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span
                className={`text-sm font-bold w-6 text-center shrink-0 ${
                  i === 0
                    ? "text-amber-400"
                    : i === 1
                    ? "text-gray-400"
                    : i === 2
                    ? "text-amber-700"
                    : "text-gray-200"
                }`}
              >
                {i + 1}
              </span>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                <p className="text-xs text-gray-400">{(post.user as { name: string } | null)?.name ?? "—"}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-600 shrink-0">
                <span className="text-red-400">♡</span>
                <span>{post.like_count}</span>
              </div>
            </Link>
          ))}
          {ranking.length === 0 && (
            <p className="text-center py-8 text-sm text-gray-400">データがありません</p>
          )}
        </div>
      </div>

      {/* 最近の登録ユーザー */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">最近の登録ユーザー</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentUsers ?? []).map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-400">{formatDate(u.created_at)}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  u.status === "approved"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : u.status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {u.status === "approved" ? "承認済み" : u.status === "pending" ? "承認待ち" : "BAN"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
