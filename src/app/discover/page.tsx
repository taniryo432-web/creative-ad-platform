import { createClient } from "@/lib/supabase/server";
import { fetchRandomPosts } from "@/app/actions/posts";
import { DiscoverViewer } from "@/components/discover/DiscoverViewer";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await fetchRandomPosts(30);

  if (posts.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
        <p className="text-lg font-semibold mb-2">投稿がありません</p>
        <p className="text-gray-500 text-sm">まだクリエイティブが投稿されていません</p>
      </div>
    );
  }

  // ログイン済みユーザーのいいね済みIDを取得
  let likedIds: string[] = [];
  if (user) {
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", posts.map((p) => p.id));
    likedIds = likes?.map((l) => l.post_id) ?? [];
  }

  return (
    <DiscoverViewer
      posts={posts}
      currentUserId={user?.id}
      initialLikedIds={likedIds}
    />
  );
}
