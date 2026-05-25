"use client";

import { useState, useEffect } from "react";
import { User, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("comments")
      .select("*, user:users(*)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data ?? []));
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newComment.trim() || submitting) return;
    setSubmitting(true);

    const { data } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: currentUserId, content: newComment.trim() })
      .select("*, user:users(*)")
      .single();

    if (data) {
      setComments((prev) => [...prev, data]);
      setNewComment("");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        コメント ({comments.length})
      </h3>

      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {comment.user?.icon_url ? (
                <img src={comment.user.icon_url} alt={comment.user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{comment.user?.name}</span>
                <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを追加..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-400">
          コメントするには
          <a href="/auth/login" className="text-black underline ml-1">ログイン</a>
          してください
        </p>
      )}
    </div>
  );
}
