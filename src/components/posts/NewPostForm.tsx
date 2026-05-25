"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NewPostFormProps {
  userId: string;
}

export function NewPostForm({ userId }: NewPostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `posts/${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(path, imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { data: post, error: insertError } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          user_id: userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/posts/${post.id}`);
      router.refresh();
    } catch (err) {
      setError("投稿に失敗しました。もう一度お試しください。");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 画像アップロード */}
      <div>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors",
            imagePreview
              ? "border-gray-200"
              : "border-gray-200 hover:border-gray-300 bg-gray-50"
          )}
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="プレビュー"
                className="w-full h-auto max-h-80 object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Upload className="w-7 h-7 text-gray-300" />
              <p className="text-sm text-gray-400">タップして画像を追加</p>
              <p className="text-xs text-gray-300">PNG, JPG, GIF など</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>

      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="クリエイティブのタイトル"
          required
          maxLength={100}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
        />
      </div>

      {/* 説明文 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          説明文 <span className="text-gray-400 font-normal text-xs">（任意）</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細やポイントを入力..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 resize-none bg-white"
        />
      </div>

      {/* 投稿ボタン */}
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
