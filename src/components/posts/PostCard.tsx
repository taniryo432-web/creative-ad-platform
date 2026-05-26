"use client";

import { useState, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, User } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  showAuthor?: boolean; // 将来の匿名モード切替用フラグ
}

function PostCardInner({ post, currentUserId, showAuthor = true }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || loading) return;
    setLoading(true);

    if (liked) {
      await supabase.from("likes").delete().match({ post_id: post.id, user_id: currentUserId });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ post_id: post.id, user_id: currentUserId });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
    setLoading(false);
  };

  return (
    <div className="group relative">
      {/* カード全体リンク */}
      <Link href={`/posts/${post.id}`} className="block cursor-pointer">
        {/* 画像エリア */}
        <div className="relative overflow-hidden rounded-xl bg-gray-100">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              width={600}
              height={900}
              className="w-full h-auto block"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full aspect-[3/4] flex items-center justify-center bg-gray-100">
              <span className="text-gray-300 text-xs">No Image</span>
            </div>
          )}
          {/* デスクトップ: ホバー時オーバーレイ */}
          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors duration-200 hidden sm:block pointer-events-none" />
        </div>

        {/* テキストエリア */}
        <div className="pt-2 px-0.5 pb-1">
          <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {post.title}
          </h3>

          {/* 投稿者表示 (showAuthor フラグで制御) */}
          {showAuthor && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                {post.user?.icon_url ? (
                  <img src={post.user.icon_url} alt={post.user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-2.5 h-2.5 text-gray-400" />
                )}
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                {post.user?.name ?? "匿名"}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* デスクトップ: ホバー時のいいねボタン (Link の外に配置) */}
      <button
        onClick={handleLike}
        className={cn(
          "absolute top-2 right-2 z-10",
          "hidden sm:flex items-center justify-center",
          "w-9 h-9 rounded-full shadow-sm transition-all duration-150",
          "opacity-0 group-hover:opacity-100",
          "pointer-events-none group-hover:pointer-events-auto",
          liked
            ? "bg-red-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        )}
        aria-label="いいね"
      >
        <Heart className={cn("w-4 h-4", liked && "fill-current")} />
      </button>

      {/* モバイル: 常時表示のいいねボタン */}
      <div className="flex items-center gap-1.5 mt-1 px-0.5 sm:hidden">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1 text-xs font-medium transition-colors active:scale-95",
            liked ? "text-red-500" : "text-gray-400"
          )}
          aria-label="いいね"
        >
          <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
          <span>{formatNumber(likeCount)}</span>
        </button>
      </div>
    </div>
  );
}

export const PostCard = memo(PostCardInner);
