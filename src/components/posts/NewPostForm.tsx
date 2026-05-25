"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Sparkles, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

interface NewPostFormProps {
  userId: string;
  tags: Tag[];
}

export function NewPostForm({ userId, tags }: NewPostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [adUrl, setAdUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzingAi, setAnalyzingAi] = useState(false);
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

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleAiAnalyze = async () => {
    if (!title && !description) return;
    setAnalyzingAi(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, adUrl }),
      });
      const data = await res.json();
      if (data.analysis) setAiAnalysis(data.analysis);
    } catch {
      setError("AI分析に失敗しました");
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
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
          title,
          description: description || null,
          image_url: imageUrl,
          video_url: videoUrl || null,
          ad_url: adUrl || null,
          ai_analysis: aiAnalysis || null,
          user_id: userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (selectedTags.length > 0) {
        await supabase.from("post_tags").insert(
          selectedTags.map((tagId) => ({ post_id: post.id, tag_id: tagId }))
        );
      }

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画像 <span className="text-gray-400 font-normal">(任意)</span>
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-colors",
            imagePreview ? "border-gray-200" : "border-gray-200 hover:border-gray-300 bg-gray-50"
          )}
        >
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="プレビュー" className="w-full h-auto max-h-64 object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Upload className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400">クリックして画像をアップロード</p>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="広告アイディアのタイトルを入力"
          required
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          説明文 <span className="text-gray-400 font-normal">(任意)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="アイディアの詳細、ターゲット、訴求ポイントなどを記述"
          rows={4}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">動画URL</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">広告URL</label>
          <input
            type="url"
            value={adUrl}
            onChange={(e) => setAdUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full border transition-colors",
                  selectedTags.includes(tag.id)
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                )}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">AI分析</label>
          <button
            type="button"
            onClick={handleAiAnalyze}
            disabled={analyzingAi || (!title && !description)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            AIで分析する
          </button>
        </div>
        <textarea
          value={aiAnalysis}
          onChange={(e) => setAiAnalysis(e.target.value)}
          placeholder="AIによる分析結果が表示されます（手動でも入力可能）"
          rows={4}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 resize-none bg-gray-50"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !title}
        className="w-full py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
