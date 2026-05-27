import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PostGrid } from "@/components/posts/PostGrid";
import { User } from "lucide-react";
import type { Post } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  const { data: myPosts } = await supabase
    .from("posts")
    .select(`*, user:users(*), like_count:likes(count)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const enrichedPosts: Post[] = (myPosts ?? []).map((p) => ({
    ...p,
    like_count: p.like_count?.[0]?.count ?? 0,
  }));

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-8">プロフィール</h1>

      {/* アイコン */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
          {profile.icon_url ? (
            <img
              src={profile.icon_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{profile.name}</p>
          <p className="text-xs text-gray-400">{profile.email ?? user.email}</p>
        </div>
      </div>

      <ProfileForm
        userId={user.id}
        initialName={profile.name}
        initialBio={profile.bio ?? ""}
      />

      {/* 自分の投稿一覧 */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          投稿
          <span className="text-gray-400 font-normal ml-2">{enrichedPosts.length}</span>
        </h2>
        <PostGrid posts={enrichedPosts} currentUserId={user.id} />
      </div>
    </div>
  );
}
