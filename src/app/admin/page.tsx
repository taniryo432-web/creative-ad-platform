import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BarChart2 } from "lucide-react";
import { AdminUserTable } from "@/components/admin/AdminUserTable";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // admin チェック（middlewareでもやっているが念のため）
  const { data: self } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (self?.role !== "admin") redirect("/");

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">Admin</h1>

      {/* ナビゲーション */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-gray-900 text-white rounded-xl p-4 flex items-center gap-3">
          <Users className="w-5 h-5 shrink-0 opacity-80" />
          <div>
            <p className="text-sm font-semibold">ユーザー管理</p>
            <p className="text-xs opacity-50 mt-0.5">{users?.length ?? 0}人</p>
          </div>
        </div>
        <Link
          href="/admin/analytics"
          className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <BarChart2 className="w-5 h-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Analytics</p>
            <p className="text-xs text-gray-400 mt-0.5">投稿・いいね分析</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">ユーザー一覧</h2>
        <span className="text-xs text-gray-400">{users?.length ?? 0}人</span>
      </div>

      {/* ステータス別サマリー */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(["pending", "approved", "banned"] as const).map((s) => {
          const count = users?.filter((u) => u.status === s).length ?? 0;
          const labels = { pending: "承認待ち", approved: "承認済み", banned: "BAN" };
          const colors = {
            pending: "bg-amber-50 text-amber-700",
            approved: "bg-green-50 text-green-700",
            banned: "bg-red-50 text-red-600",
          };
          return (
            <div key={s} className={`rounded-xl p-3 text-center ${colors[s]}`}>
              <p className="text-2xl font-semibold">{count}</p>
              <p className="text-xs mt-0.5">{labels[s]}</p>
            </div>
          );
        })}
      </div>

      <AdminUserTable users={users ?? []} currentUserId={user.id} />
    </div>
  );
}
