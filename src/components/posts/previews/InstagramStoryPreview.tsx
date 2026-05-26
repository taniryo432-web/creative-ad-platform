"use client";

/**
 * InstagramStoryPreview
 *
 * パフォーマンス最適化:
 * - プログレスバーは CSS animation (@keyframes story-fill) で描画
 *   → setInterval/setProgress による秒間 20 回再レンダリングを完全排除
 * - 進行タイミングは setTimeout 1 本のみ
 * - 再レンダリングは paused / closing / storyKey 変化時のみ (最小限)
 */

import { useState, useEffect, useRef } from "react";
import { X, Send, Heart, User } from "lucide-react";

const STORY_DURATION = 5000;

export interface StoryPost {
  title: string;
  description?: string | null;
  image_url?: string | null;
  user?: { name: string; icon_url: string | null } | null;
}

interface InstagramStoryPreviewProps {
  post: StoryPost;
  onClose?: () => void;
}

export function InstagramStoryPreview({ post, onClose }: InstagramStoryPreviewProps) {
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);
  const [storyKey, setStoryKey] = useState(0); // 増加でプログレスバー再マウント

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const remainingRef = useRef(STORY_DURATION);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressRef = useRef(false);

  const username = post.user?.name ?? "advertiser";
  const avatarUrl = post.user?.icon_url;

  const scheduleAdvance = (ms: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startTimeRef.current = performance.now();
    timeoutRef.current = setTimeout(() => {
      setClosing(true);
      setTimeout(() => onClose?.(), 320);
    }, ms);
  };

  // storyKey が変わるたびに（初回・再スタート時）タイマーリセット
  useEffect(() => {
    remainingRef.current = STORY_DURATION;
    setClosing(false);
    scheduleAdvance(STORY_DURATION);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [storyKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ポーズ/解除でタイマー操作
  useEffect(() => {
    if (paused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const elapsed = performance.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    } else {
      scheduleAdvance(remainingRef.current);
    }
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  const doAdvance = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setClosing(true);
    setTimeout(() => onClose?.(), 280);
  };

  const doRestart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStoryKey((k) => k + 1);
  };

  // ---- ポインターインタラクション ----
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    wasLongPressRef.current = false;
    longPressRef.current = setTimeout(() => {
      wasLongPressRef.current = true;
      setPaused(true);
    }, 180);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (wasLongPressRef.current) {
      wasLongPressRef.current = false;
      setPaused(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) doRestart();
    else doAdvance();
  };

  const handlePointerLeave = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (paused) {
      wasLongPressRef.current = false;
      setPaused(false);
    }
  };

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden"
      style={{
        opacity: closing ? 0 : 1,
        transition: "opacity 0.3s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* 背景画像 */}
      {post.image_url ? (
        <img
          src={post.image_url}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-900" />
      )}

      {/* グラデーション */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/65 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

      {/* ステータスバー */}
      <div className="absolute top-0 left-0 right-0 pt-14 px-5 z-20 pointer-events-none">
        <div className="flex items-center justify-between text-white text-[11px] font-bold">
          <span>9:41</span>
          <div className="flex items-end gap-[2px]">
            {[3, 5, 7, 9].map((h, i) => (
              <div key={i} className="w-[3px] bg-white rounded-[1px]" style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>
      </div>

      {/* プログレスバー（CSS animation で描画 → JS 再レンダリングなし） */}
      <div className="absolute top-[72px] left-0 right-0 px-2 z-20 pointer-events-none">
        <div className="flex gap-[3px]">
          <div className="w-5 shrink-0 h-[2.5px] bg-white rounded-full" />
          <div className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
            <div
              key={storyKey}
              className="h-full bg-white rounded-full"
              style={{
                animation: `story-fill ${STORY_DURATION}ms linear forwards`,
                animationPlayState: paused ? "paused" : "running",
              }}
            />
          </div>
          <div className="flex-1 h-[2.5px] bg-white/30 rounded-full" />
        </div>
      </div>

      {/* ユーザー情報 */}
      <div className="absolute top-[80px] left-0 right-0 px-3 z-20 flex items-center pointer-events-none">
        <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shrink-0 mr-2.5">
          <div className="w-full h-full rounded-full p-[1.5px] bg-black">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gray-300" />
              )}
            </div>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-[13px] drop-shadow">{username}</p>
          <p className="text-white/70 text-[11px]">Sponsored · 今</p>
        </div>
      </div>

      {/* タップゾーン */}
      <div
        className="absolute inset-0 z-20"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />

      {/* 閉じるボタン */}
      <button
        className="absolute top-[82px] right-3 p-1.5 z-30"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => { e.stopPropagation(); onClose?.(); }}
      >
        <X className="w-5 h-5 text-white drop-shadow" />
      </button>

      {/* ポーズインジケーター */}
      {paused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="flex gap-2.5">
            <div className="w-[5px] h-12 bg-white/85 rounded-full" />
            <div className="w-[5px] h-12 bg-white/85 rounded-full" />
          </div>
        </div>
      )}

      {/* 下部 UI */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 z-20 pointer-events-none">
        <p className="text-white font-medium text-[14px] leading-snug mb-4 drop-shadow-md line-clamp-2">
          {post.title}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 border border-white/40 rounded-full px-4 py-2">
            <span className="text-white/60 text-[12px]">メッセージを送信...</span>
          </div>
          <Heart className="w-6 h-6 text-white" strokeWidth={1.5} />
          <Send className="w-6 h-6 text-white -rotate-12" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
