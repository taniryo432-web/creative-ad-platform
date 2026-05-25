import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { PostDetailLike } from "@/components/posts/PostDetailLike";
import { PreviewButton } from "@/components/posts/PreviewButton";
import { CommentSection } from "@/components/posts/CommentSection";
import { User } from "lucide-react";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

// showAuthor フラグ（将来の匿名モード対応）
const SHOW_AUTHOR = true;

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(*),
      like_count:likes(count)
    `)
    .eq("id", id)
    .single();

  if (!post) notFound();

  let isLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .single();
    isLiked = !!like;
  }

  const likeCount = post.like_count?.[0]?.count ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* 画像 + Story Preview オーバーレイボタン */}
      {post.image_url && (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-6 group">
          <Image
            src={post.image_url}
            alt={post.title}
            width={1200}
            height={900}
            className="w-full h-auto"
            priority
            unoptimized
          />
          {/* Preview ボタン（画像下部に常設） */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-between">
            <PreviewButton
              post={{
                title: post.title,
                description: post.description,
                image_url: post.image_url,
                user: post.user,
                like_count: likeCount,
              }}
            />
          </div>
        </div>
      )}

      {/* タイトル + いいね */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-lg font-semibold text-gray-900 leading-snug">{post.title}</h1>
        <PostDetailLike
          postId={id}
          currentUserId={user?.id}
          initialLiked={isLiked}
          initialLikeCount={likeCount}
        />
      </div>

      {/* 投稿者 */}
      {SHOW_AUTHOR && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
            {post.user?.icon_url ? (
              <img src={post.user.icon_url} alt={post.user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{post.user?.name ?? "匿名"}</p>
            <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
          </div>
        </div>
      )}

      {/* 説明文 */}
      {post.description && (
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
          {post.description}
        </p>
      )}

      {/* コメント */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <CommentSection postId={id} currentUserId={user?.id} />
      </div>
    </div>
  );
}
