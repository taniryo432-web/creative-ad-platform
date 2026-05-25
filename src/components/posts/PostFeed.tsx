"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PostCard } from "@/components/posts/PostCard";
import { fetchMorePosts } from "@/app/actions/posts";
import type { Post } from "@/types";

const POSTS_PER_PAGE = 20;

interface PostFeedProps {
  initialPosts: Post[];
  currentUserId?: string;
  showAuthor?: boolean;
}

export function PostFeed({ initialPosts, currentUserId, showAuthor = true }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= POSTS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const newPosts = await fetchMorePosts(posts.length, currentUserId);
      if (newPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
      if (newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, posts.length, currentUserId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm font-medium">まだ投稿がありません</p>
        <p className="text-gray-300 text-xs mt-1">最初のクリエイティブを投稿してみましょう</p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry">
        {posts.map((post) => (
          <div key={post.id} className="masonry-item">
            <PostCard post={post} currentUserId={currentUserId} showAuthor={showAuthor} />
          </div>
        ))}
      </div>

      {/* 無限スクロール センチネル */}
      <div ref={sentinelRef} className="py-8 flex justify-center">
        {loading && (
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        )}
        {!hasMore && posts.length >= POSTS_PER_PAGE && (
          <p className="text-[11px] text-gray-300">すべての投稿を表示しました</p>
        )}
      </div>
    </>
  );
}
