"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Bookmark, MessageCircle, User } from "lucide-react";
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
    <Link href={`/posts/${post.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
        {post.image_url && (
          <div className="relative w-full overflow-hidden bg-gray-50">
            <Image
              src={post.image_url}
              alt={post.title}
              width={600}
              height={400}
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
              style={{ aspectRatio: "auto" }}
            />
          </div>
        )}

        <div className="p-4">
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-2">
            {post.title}
          </h3>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-md"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {post.user?.icon_url ? (
                  <img src={post.user.icon_url} alt={post.user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <span className="text-xs text-gray-400 truncate max-w-[80px]">
                {post.user?.name ?? "匿名"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-1 text-xs transition-colors",
                  saved ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
                )}
              >
                <Bookmark className={cn("w-3.5 h-3.5", saved && "fill-current")} />
                <span>{formatNumber(saveCount)}</span>
              </button>
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1 text-xs transition-colors",
                  liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
                <span>{formatNumber(likeCount)}</span>
              </button>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{formatNumber(post.comment_count ?? 0)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
