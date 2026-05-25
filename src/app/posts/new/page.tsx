import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewPostForm } from "@/components/posts/NewPostForm";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: tags } = await supabase.from("tags").select("*").order("name");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">新しいアイディアを投稿</h1>
      <NewPostForm userId={user.id} tags={tags ?? []} />
    </div>
  );
}
