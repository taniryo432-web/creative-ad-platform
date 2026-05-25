import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">ユーザー管理</h1>
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
