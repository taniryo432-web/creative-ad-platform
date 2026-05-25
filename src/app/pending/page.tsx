import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Clock } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, status")
    .eq("id", user.id)
    .single();

  // すでに承認済みならトップへ
  if (profile?.status === "approved") redirect("/");
  if (profile?.status === "banned") redirect("/auth/login?error=banned");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          承認待ちです
        </h1>

        <p className="text-sm text-gray-500 mb-2">
          {profile?.name ?? "ユーザー"} さん、登録ありがとうございます。
        </p>
        <p className="text-sm text-gray-500 mb-8">
          管理者が承認するまでしばらくお待ちください。
          承認されると FFI Creative にアクセスできるようになります。
        </p>

        <SignOutButton />
      </div>
    </div>
  );
}
