import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Post } from "@/types";

export default async function RankingPage() {
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

  // 管理者以外はトップへリダイレクト
  if (profile?.role !== "admin") redirect("/");

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(*),
      like_count:likes(count)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  const enriched: Post[] = (posts ?? []).map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count ?? 0,
  }));

  // いいね数でソート
  enriched.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">ランキング</h1>
        <p className="text-sm text-gray-400 mt-1">管理者専用 · いいね数順</p>
      </div>

      <div className="space-y-3">
        {enriched.map((post, i) => (
          <div key={post.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
            <span className={`text-lg font-bold w-8 text-center shrink-0 ${i < 3 ? "text-amber-500" : "text-gray-300"}`}>
              {i + 1}
            </span>
            {post.image_url && (
              <img src={post.image_url} alt={post.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
              <p className="text-xs text-gray-400">{post.user?.name ?? "—"}</p>
            </div>
            <div className="text-sm font-semibold text-gray-700 shrink-0">
              ♡ {post.like_count ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
