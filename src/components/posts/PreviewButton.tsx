"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { X, Smartphone } from "lucide-react";
import { PhoneFrame } from "./previews/PhoneFrame";

const InstagramStoryPreview = dynamic(
  () => import("./previews/InstagramStoryPreview").then((m) => ({ default: m.InstagramStoryPreview })),
  { ssr: false }
);
const InstagramFeedPreview = dynamic(
  () => import("./previews/InstagramFeedPreview").then((m) => ({ default: m.InstagramFeedPreview })),
  { ssr: false }
);
const InstagramReelsPreview = dynamic(
  () => import("./previews/InstagramReelsPreview").then((m) => ({ default: m.InstagramReelsPreview })),
  { ssr: false }
);

type PreviewMode = "story" | "feed" | "reels";

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
  { key: "story", label: "Story" },
  { key: "feed", label: "Feed" },
  { key: "reels", label: "Reels" },
];

export function PreviewButton({ post }: PreviewButtonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PreviewMode>("story");

  return (
    <>
      {/* ============================
          オーバーレイボタン（画像上に表示）
          ============================ */}
      <button
        onClick={() => { setMode("story"); setOpen(true); }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}
      >
        <Smartphone className="w-4 h-4" />
        <span>Story Preview</span>
        <span className="text-white/50 text-xs">→</span>
      </button>

      {/* ============================
          プレビューモーダル
          ============================ */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex flex-col items-center overflow-y-auto py-5"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between w-full max-w-md px-4 mb-5 shrink-0">
            <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
              {MODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-full transition-all ${
                    mode === key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* フォンフレーム */}
          <div className="shrink-0 px-4">
            <PhoneFrame>
              {mode === "story" && (
                <InstagramStoryPreview
                  post={post}
                  onClose={() => {
                    // ループ再生
                    setMode("story");
                  }}
                />
              )}
              {mode === "feed" && <InstagramFeedPreview post={post} />}
              {mode === "reels" && <InstagramReelsPreview post={post} />}
            </PhoneFrame>
          </div>

          <p className="mt-4 text-gray-600 text-[11px] shrink-0 text-center px-4">
            長押しで一時停止 · 右タップで次へ · 左タップで最初から
          </p>
        </div>
      )}
    </>
  );
}
