import { createClient } from "@/lib/supabase/server";
import { PostGrid } from "@/components/posts/PostGrid";
import { FilterBar } from "@/components/posts/FilterBar";
import type { Post, SortOption } from "@/types";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    sort?: SortOption;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const { q, tag, sort = "latest" } = params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(`
      *,
      user:users(*),
      tags:post_tags(tag:tags(*)),
      like_count:likes(count),
      save_count:saves(count),
      comment_count:comments(count)
    `)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (sort === "popular") {
    query = query.order("like_count", { ascending: false });
  } else if (sort === "saved") {
    query = query.order("save_count", { ascending: false });
  }

  const { data: posts } = await query.limit(50);

  const { data: allTags } = await supabase
    .from("tags")
    .select("*")
    .order("name");

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
      <FilterBar tags={allTags ?? []} selectedTag={tag} currentSort={sort} currentQuery={q} />
      <PostGrid posts={enrichedPosts} currentUserId={user?.id} />
    </div>
  );
}
