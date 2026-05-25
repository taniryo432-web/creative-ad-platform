import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Tag } from "@/types";

interface RelatedPostsProps {
  postId: string;
  tags: Tag[];
}

export async function RelatedPosts({ postId, tags }: RelatedPostsProps) {
  if (tags.length === 0) return null;

  const supabase = await createClient();
  const tagIds = tags.map((t) => t.id);

  const { data: tagPosts } = await supabase
    .from("post_tags")
    .select("post_id")
    .in("tag_id", tagIds)
    .neq("post_id", postId)
    .limit(10);

  if (!tagPosts || tagPosts.length === 0) return null;

  const relatedPostIds = [...new Set(tagPosts.map((tp) => tp.post_id))].slice(0, 4);

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, image_url")
    .in("id", relatedPostIds);

  if (!posts || posts.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-4">関連する投稿</h3>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex gap-3 items-center hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
          >
            {post.image_url ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
            )}
            <p className="text-sm text-gray-700 line-clamp-2 leading-snug">{post.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
