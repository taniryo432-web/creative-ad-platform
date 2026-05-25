import { createClient } from "@/lib/supabase/server";
import { PostGrid } from "@/components/posts/PostGrid";
import type { Post } from "@/types";

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(*),
      tags:post_tags(tag:tags(*)),
      like_count:likes(count),
      save_count:saves(count),
      comment_count:comments(count)
    `)
    .order("like_count", { ascending: false })
    .limit(30);

  let userLikes: string[] = [];
  let userSaves: string[] = [];

  if (user && posts) {
    const postIds = posts.map((p) => p.id);
    const [{ data: likes }, { data: saves }] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
      supabase.from("saves").select("post_id").eq("user_id", user.id).in("post_id", postIds),
    ]);
    userLikes = likes?.map((l) => l.post_id) ?? [];
    userSaves = saves?.map((s) => s.post_id) ?? [];
  }

  const enrichedPosts: Post[] = (posts ?? []).map((post) => ({
    ...post,
    tags: post.tags?.map((pt: { tag: { id: string; name: string } }) => pt.tag) ?? [],
    like_count: post.like_count?.[0]?.count ?? 0,
    save_count: post.save_count?.[0]?.count ?? 0,
    comment_count: post.comment_count?.[0]?.count ?? 0,
    is_liked: userLikes.includes(post.id),
    is_saved: userSaves.includes(post.id),
  }));

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">ランキング</h1>
        <p className="text-sm text-gray-400 mt-1">いいね数の多い投稿</p>
      </div>
      <PostGrid posts={enrichedPosts} currentUserId={user?.id} />
    </div>
  );
}
