"use client";

import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface PostActionsProps {
  postId: string;
  currentUserId?: string;
  initialLiked: boolean;
  initialSaved: boolean;
  initialLikeCount: number;
  initialSaveCount: number;
}

export function PostActions({
  postId,
  currentUserId,
  initialLiked,
  initialSaved,
  initialLikeCount,
  initialSaveCount,
}: PostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [saveCount, setSaveCount] = useState(initialSaveCount);
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

  const handleSave = async () => {
    if (!currentUserId || loading) return;
    setLoading(true);
    if (saved) {
      await supabase.from("saves").delete().match({ post_id: postId, user_id: currentUserId });
      setSaved(false);
      setSaveCount((c) => c - 1);
    } else {
      await supabase.from("saves").insert({ post_id: postId, user_id: currentUserId });
      setSaved(true);
      setSaveCount((c) => c + 1);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
      <h3 className="text-sm font-medium text-gray-500">アクション</h3>
      <button
        onClick={handleSave}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all",
          saved
            ? "bg-blue-50 text-blue-600 border-blue-200"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        )}
      >
        <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
        {saved ? "保存済み" : "保存する"}
        <span className="text-gray-400 font-normal">({formatNumber(saveCount)})</span>
      </button>
      <button
        onClick={handleLike}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all",
          liked
            ? "bg-red-50 text-red-500 border-red-200"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        )}
      >
        <Heart className={cn("w-4 h-4", liked && "fill-current")} />
        {liked ? "いいね済み" : "いいね"}
        <span className="text-gray-400 font-normal">({formatNumber(likeCount)})</span>
      </button>
    </div>
  );
}
