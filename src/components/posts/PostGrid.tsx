"use client";

import { PostCard } from "@/components/posts/PostCard";
import type { Post } from "@/types";

interface PostGridProps {
  posts: Post[];
  currentUserId?: string;
}

export function PostGrid({ posts, currentUserId }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-gray-400 text-lg">まだ投稿がありません</p>
        <p className="text-gray-300 text-sm mt-1">最初のアイディアを投稿してみましょう</p>
      </div>
    );
  }

  return (
    <div className="masonry">
      {posts.map((post) => (
        <div key={post.id} className="masonry-item">
          <PostCard post={post} currentUserId={currentUserId} />
        </div>
      ))}
    </div>
  );
}
