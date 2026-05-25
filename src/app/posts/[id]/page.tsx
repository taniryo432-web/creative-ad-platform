import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { PostActions } from "@/components/posts/PostActions";
import { CommentSection } from "@/components/posts/CommentSection";
import { RelatedPosts } from "@/components/posts/RelatedPosts";
import { User, ExternalLink, Sparkles } from "lucide-react";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

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
      tags:post_tags(tag:tags(*)),
      like_count:likes(count),
      save_count:saves(count)
    `)
    .eq("id", id)
    .single();

  if (!post) notFound();

  let isLiked = false;
  let isSaved = false;

  if (user) {
    const [{ data: like }, { data: save }] = await Promise.all([
      supabase.from("likes").select("id").eq("post_id", id).eq("user_id", user.id).single(),
      supabase.from("saves").select("id").eq("post_id", id).eq("user_id", user.id).single(),
    ]);
    isLiked = !!like;
    isSaved = !!save;
  }

  const tags = post.tags?.map((pt: { tag: { id: string; name: string } }) => pt.tag) ?? [];
  const likeCount = post.like_count?.[0]?.count ?? 0;
  const saveCount = post.save_count?.[0]?.count ?? 0;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {post.image_url && (
            <div className="rounded-2xl overflow-hidden bg-gray-50">
              <Image
                src={post.image_url}
                alt={post.title}
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          )}

          {post.video_url && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-black">
              <iframe
                src={post.video_url}
                className="w-full h-full"
                allowFullScreen
                title={post.title}
              />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">{post.title}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {post.user?.icon_url ? (
                  <img src={post.user.icon_url} alt={post.user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{post.user?.name}</p>
                <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag: { id: string; name: string }) => (
                  <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {post.description && (
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            )}
          </div>

          {post.ad_url && (
            <a
              href={post.ad_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 rounded-xl border border-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              広告を見る
            </a>
          )}

          {post.ai_analysis && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-purple-900">AI分析</h3>
              </div>
              <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-wrap">
                {post.ai_analysis}
              </p>
            </div>
          )}

          <CommentSection postId={id} currentUserId={user?.id} />
        </div>

        <div className="space-y-6">
          <PostActions
            postId={id}
            currentUserId={user?.id}
            initialLiked={isLiked}
            initialSaved={isSaved}
            initialLikeCount={likeCount}
            initialSaveCount={saveCount}
          />

          <RelatedPosts postId={id} tags={tags} />
        </div>
      </div>
    </div>
  );
}
