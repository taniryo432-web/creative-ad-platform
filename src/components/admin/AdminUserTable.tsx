"use client";

import { useState, useTransition } from "react";
import { approveUser, banUser, updateUserName, updateUserRole } from "@/app/actions/admin";
import { Check, Ban, Pencil, Shield, User } from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
};

interface AdminUserTableProps {
  users: AdminUser[];
  currentUserId: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  banned: "BAN",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  banned: "bg-red-50 text-red-600 border-red-200",
};

function UserRow({
  user,
  currentUserId,
}: {
  user: AdminUser;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const isSelf = user.id === currentUserId;

  const handleApprove = () => {
    startTransition(() => approveUser(user.id));
  };

  const handleBan = () => {
    if (!confirm(`${user.name} をBANしますか？`)) return;
    startTransition(() => banUser(user.id));
  };

  const handleNameSave = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    startTransition(() => updateUserName(user.id, trimmed));
    setEditingName(false);
  };

  const handleRoleToggle = () => {
    const newRole = user.role === "admin" ? "member" : "admin";
    if (!confirm(`${user.name} を ${newRole === "admin" ? "管理者" : "メンバー"} に変更しますか？`)) return;
    startTransition(() => updateUserRole(user.id, newRole));
  };

  return (
    <tr className={`border-b border-gray-50 ${isPending ? "opacity-50" : ""}`}>
      {/* ユーザー情報 */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            {user.role === "admin" ? (
              <Shield className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <User className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  maxLength={30}
                  autoFocus
                  className="w-32 px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none"
                />
                <button onClick={handleNameSave} className="text-xs text-green-600 hover:underline">
                  保存
                </button>
                <button onClick={() => setEditingName(false)} className="text-xs text-gray-400 hover:underline">
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-800 truncate">{user.name}</span>
                <button
                  onClick={() => setEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 truncate">{user.email ?? "—"}</p>
          </div>
        </div>
      </td>

      {/* ロール */}
      <td className="py-3 pr-4 hidden sm:table-cell">
        <button
          onClick={handleRoleToggle}
          disabled={isSelf}
          title={isSelf ? "自分のロールは変更できません" : "クリックでロールを切り替え"}
          className={`text-xs px-2 py-0.5 rounded border transition-colors ${
            user.role === "admin"
              ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          } ${isSelf ? "opacity-50 cursor-default" : "cursor-pointer"}`}
        >
          {user.role === "admin" ? "管理者" : "メンバー"}
        </button>
      </td>

      {/* ステータス */}
      <td className="py-3 pr-4">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[user.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
        >
          {STATUS_LABEL[user.status] ?? user.status}
        </span>
      </td>

      {/* アクション */}
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* 名前編集ボタン（モバイル用） */}
          <button
            onClick={() => setEditingName(true)}
            disabled={editingName}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="名前を変更"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {user.status !== "approved" && (
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
              title="承認する"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {user.status !== "banned" && !isSelf && (
            <button
              onClick={handleBan}
              disabled={isPending}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              title="BANする"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AdminUserTable({ users, currentUserId }: AdminUserTableProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "banned">("all");

  const filtered = filter === "all" ? users : users.filter((u) => u.status === filter);

  return (
    <div>
      {/* フィルタータブ */}
      <div className="flex gap-1 mb-4">
        {(["all", "pending", "approved", "banned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "すべて" : STATUS_LABEL[f]}
            <span className="ml-1.5 opacity-70">
              {f === "all" ? users.length : users.filter((u) => u.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">ユーザー</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 hidden sm:table-cell">ロール</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">ステータス</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-sm text-gray-400">
                  ユーザーがいません
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                  {/* ユーザー情報 */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        {user.role === "admin" ? (
                          <Shield className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <NameCell user={user} />
                        <p className="text-xs text-gray-400 truncate">{user.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>

                  {/* ロール */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <RoleCell user={user} isSelf={user.id === currentUserId} />
                  </td>

                  {/* ステータス */}
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[user.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {STATUS_LABEL[user.status] ?? user.status}
                    </span>
                  </td>

                  {/* アクション */}
                  <td className="py-3 px-4 text-right">
                    <ActionButtons user={user} isSelf={user.id === currentUserId} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 名前セル（インライン編集）
function NameCell({ user }: { user: AdminUser }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(user.name);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await updateUserName(user.id, trimmed);
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          maxLength={30}
          autoFocus
          className="w-28 px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none"
        />
        <button onClick={save} disabled={isPending} className="text-xs text-green-600 hover:underline">
          保存
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:underline">
          キャンセル
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-gray-800 truncate">{user.name}</span>
      <button onClick={() => setEditing(true)}>
        <Pencil className="w-3 h-3 text-gray-300 hover:text-gray-500 transition-colors" />
      </button>
    </div>
  );
}

// ロールセル（クリックで切り替え）
function RoleCell({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const newRole = user.role === "admin" ? "member" : "admin";
    if (!confirm(`${user.name} を${newRole === "admin" ? "管理者" : "メンバー"}に変更しますか？`)) return;
    startTransition(() => updateUserRole(user.id, newRole as "admin" | "member"));
  };

  return (
    <button
      onClick={toggle}
      disabled={isSelf || isPending}
      title={isSelf ? "自分のロールは変更できません" : "クリックで切り替え"}
      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
        user.role === "admin"
          ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      } ${isSelf || isPending ? "opacity-50 cursor-default" : "cursor-pointer"}`}
    >
      {user.role === "admin" ? "管理者" : "メンバー"}
    </button>
  );
}

// アクションボタン（承認・BAN）
function ActionButtons({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(() => approveUser(user.id));
  };

  const handleBan = () => {
    if (!confirm(`${user.name} をBANしますか？`)) return;
    startTransition(() => banUser(user.id));
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {user.status !== "approved" && (
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
          title="承認する"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
      {user.status !== "banned" && !isSelf && (
        <button
          onClick={handleBan}
          disabled={isPending}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          title="BANする"
        >
          <Ban className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
