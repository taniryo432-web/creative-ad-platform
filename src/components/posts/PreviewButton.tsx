"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { PhoneFrame } from "./previews/PhoneFrame";
import { InstagramFeedPreview } from "./previews/InstagramFeedPreview";
import { InstagramReelsPreview } from "./previews/InstagramReelsPreview";

type PreviewMode = "feed" | "reels";

interface PreviewPost {
  title: string;
  description: string | null;
  image_url: string | null;
  user?: { name: string; icon_url: string | null } | null;
  like_count?: number;
}

interface PreviewButtonProps {
  post: PreviewPost;
}

const MODES: { key: PreviewMode; label: string }[] = [
  { key: "feed", label: "Feed" },
  { key: "reels", label: "Reels" },
];

export function PreviewButton({ post }: PreviewButtonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PreviewMode>("feed");

  return (
    <>
      {/* Preview ボタン */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shrink-0"
      >
        <Eye className="w-3.5 h-3.5" />
        Preview
      </button>

      {/* モーダル */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center overflow-y-auto py-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between w-full max-w-md px-4 mb-5 shrink-0">
            <div className="flex items-center gap-1">
              {MODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all ${
                    mode === key
                      ? "bg-white text-gray-900"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-2 text-[11px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                Instagram
              </span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* フォンフレーム */}
          <div className="shrink-0 px-4">
            <PhoneFrame>
              {mode === "feed" ? (
                <InstagramFeedPreview post={post} />
              ) : (
                <InstagramReelsPreview post={post} />
              )}
            </PhoneFrame>
          </div>

          {/* 注釈 */}
          <p className="mt-4 text-gray-600 text-[12px] shrink-0">
            * これは表示イメージです。実際の広告表示とは異なる場合があります。
          </p>
        </div>
      )}
    </>
  );
}
