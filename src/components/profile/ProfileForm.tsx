"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ProfileFormProps {
  userId: string;
  initialName: string;
  initialBio: string;
}

export function ProfileForm({ userId, initialName, initialBio }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("表示名を入力してください");
      return;
    }
    if (trimmed.length > 30) {
      setError("表示名は30文字以内で入力してください");
      return;
    }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("users")
      .update({ name: trimmed, bio: bio.trim() || null })
      .eq("id", userId);

    setLoading(false);

    if (updateError) {
      setError("保存に失敗しました。もう一度お試しください。");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 表示名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          表示名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          placeholder="表示名を入力"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
        />
        <p className="text-xs text-gray-400 mt-1">{name.length}/30</p>
      </div>

      {/* 自己紹介 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          自己紹介
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="自己紹介（任意）"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {loading ? "保存中..." : saved ? "保存しました ✓" : "保存する"}
      </button>
    </form>
  );
}
