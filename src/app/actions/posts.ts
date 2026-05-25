"use server";

import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types";

const POSTS_PER_PAGE = 20;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function fetchRandomPosts(count = 30): Promise<Post[]> {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select(`*, user:users(*), like_count:likes(count)`)
    .not("image_url", "is", null)
    .limit(100);

  if (!posts || posts.length === 0) return [];

  return shuffleArray(posts)
    .slice(0, count)
    .map((post) => ({
      ...post,
      like_count: post.like_count?.[0]?.count ?? 0,
    }));
}

export async function fetchMorePosts(offset: number, userId?: string): Promise<Post[]> {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(*),
      like_count:likes(count)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1);

  if (!posts || posts.length === 0) return [];

  let userLikes: string[] = [];
  if (userId) {
    const postIds = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds);
    userLikes = likes?.map((l) => l.post_id) ?? [];
  }

  return posts.map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count ?? 0,
    is_liked: userLikes.includes(post.id),
  }));
}
