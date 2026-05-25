"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface PostDetailLikeProps {
  postId: string;
  currentUserId?: string;
  initialLiked: boolean;
  initialLikeCount: number;
}

export function PostDetailLike({
  postId,
  currentUserId,
  initialLiked,
  initialLikeCount,
}: PostDetailLikeProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLike = async () => {
    if (!currentUserId || loading) return;
    setLoading(true);

    if (liked) {
      await supabase.from("likes").delete().match({ post_id: postId, user_id: currentUserId });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: currentUserId });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={!currentUserId}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0",
        liked
          ? "bg-red-50 text-red-500 border border-red-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent",
        !currentUserId && "opacity-50 cursor-default"
      )}
      aria-label="いいね"
    >
      <Heart className={cn("w-4 h-4", liked && "fill-current")} />
      <span>{formatNumber(likeCount)}</span>
    </button>
  );
}
