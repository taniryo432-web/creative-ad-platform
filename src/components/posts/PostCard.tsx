"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Bookmark, User } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [saved, setSaved] = useState(post.is_saved ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [saveCount, setSaveCount] = useState(post.save_count ?? 0);
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

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || loading) return;
    setLoading(true);
    if (saved) {
      await supabase.from("saves").delete().match({ post_id: post.id, user_id: currentUserId });
      setSaved(false);
      setSaveCount((c) => c - 1);
    } else {
      await supabase.from("saves").insert({ post_id: post.id, user_id: currentUserId });
      setSaved(true);
      setSaveCount((c) => c + 1);
    }
    setLoading(false);
  };

  return (
    <div className="group relative">
      {/* メインリンク: 画像 + テキストエリア */}
      <Link href={`/posts/${post.id}`} className="block">
        {/* 画像エリア */}
        <div className="relative overflow-hidden rounded-xl bg-gray-200">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              width={600}
              height={900}
              className="w-full h-auto block"
              unoptimized
            />
          ) : (
            <div className="w-full aspect-[3/4] flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
          {/* デスクトップ: ホバー時の暗いオーバーレイ (pointer-events-none で Link の邪魔をしない) */}
          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-colors duration-200 hidden sm:block pointer-events-none" />
        </div>

        {/* テキストエリア */}
        <div className="pt-2 px-0.5">
          <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
              {post.user?.icon_url ? (
                <img src={post.user.icon_url} alt={post.user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <span className="text-[11px] text-gray-400 truncate">
              {post.user?.name ?? "匿名"}
            </span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag.id} className="text-[10px] text-gray-400">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* デスクトップ用ボタン: Linkの外に配置 (クリックしても遷移しない) */}
      <div
        className={cn(
          "absolute top-2 left-2 right-2",
          "hidden sm:flex items-start justify-between",
          "opacity-0 group-hover:opacity-100",
          "pointer-events-none group-hover:pointer-events-auto",
          "transition-opacity duration-200 z-10"
        )}
      >
        <button
          onClick={handleSave}
          className={cn(
            "px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all shadow-sm",
            saved
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-800 hover:bg-gray-50"
          )}
        >
          {saved ? "保存済み" : "保存"}
        </button>
        <button
          onClick={handleLike}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm",
            liked
              ? "bg-red-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
        </button>
      </div>

      {/* モバイル用ボタン: 画像下に常時表示 */}
      <div className="flex items-center gap-3 mt-1.5 px-0.5 sm:hidden">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1 text-xs font-medium transition-colors",
            liked ? "text-red-500" : "text-gray-400 active:text-red-500"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
          <span>{formatNumber(likeCount)}</span>
        </button>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1 text-xs font-medium transition-colors",
            saved ? "text-gray-800" : "text-gray-400 active:text-gray-800"
          )}
        >
          <Bookmark className={cn("w-3.5 h-3.5", saved && "fill-current")} />
          <span>{formatNumber(saveCount)}</span>
        </button>
      </div>
    </div>
  );
}
