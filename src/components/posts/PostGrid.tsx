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
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm font-medium">まだ投稿がありません</p>
        <p className="text-gray-300 text-xs mt-1">最初のクリエイティブを投稿してみましょう</p>
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
