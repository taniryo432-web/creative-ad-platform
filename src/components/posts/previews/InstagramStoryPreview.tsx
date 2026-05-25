"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Heart, User } from "lucide-react";

const STORY_DURATION = 5000; // 5秒
const TICK_MS = 50;

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
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);

  // Refs でタイマー状態を管理（再レンダリングに依存しない）
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressRef = useRef(false);

  const username = post.user?.name ?? "advertiser";
  const avatarUrl = post.user?.icon_url;
  const increment = (100 / STORY_DURATION) * TICK_MS;

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (pausedRef.current || completedRef.current) return;
      progressRef.current = Math.min(progressRef.current + increment, 100);
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        completedRef.current = true;
        clearInterval(intervalRef.current!);
        setClosing(true);
        setTimeout(() => onClose?.(), 400);
      }
    }, TICK_MS);
  };

  useEffect(() => {
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const doRestart = () => {
    completedRef.current = false;
    progressRef.current = 0;
    setProgress(0);
    setClosing(false);
    startTimer();
  };

  const doAdvance = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setClosing(true);
    setTimeout(() => onClose?.(), 300);
  };

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
    if (x < rect.width * 0.3) {
      doRestart();
    } else {
      doAdvance();
    }
  };

  const handlePointerLeave = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (pausedRef.current) {
      wasLongPressRef.current = false;
      setPaused(false);
    }
  };

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden"
      style={{
        opacity: closing ? 0 : 1,
        transition: "opacity 0.35s ease",
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

      {/* 上部グラデーション */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-black/65 to-transparent pointer-events-none z-10" />
      {/* 下部グラデーション */}
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

      {/* プログレスバー */}
      <div className="absolute top-[72px] left-0 right-0 px-2 z-20 pointer-events-none">
        <div className="flex gap-[3px]">
          {/* 前のストーリー（完了済み） */}
          <div className="w-5 shrink-0 h-[2.5px] bg-white rounded-full" />
          {/* 現在のストーリー */}
          <div className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* 次のストーリー */}
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

      {/* タップゾーン（全体） */}
      <div
        className="absolute inset-0 z-20"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />

      {/* 閉じるボタン（タップゾーンより前面） */}
      <button
        className="absolute top-[82px] right-3 p-1.5 z-30"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => { e.stopPropagation(); onClose?.(); }}
      >
        <X className="w-5 h-5 text-white drop-shadow" />
      </button>

      {/* 一時停止インジケーター */}
      {paused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="flex gap-2.5">
            <div className="w-[5px] h-12 bg-white/85 rounded-full shadow-lg" />
            <div className="w-[5px] h-12 bg-white/85 rounded-full shadow-lg" />
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

      {/* 左タップヒント（初回のみ薄く表示） */}
      <div className="absolute left-0 top-1/3 bottom-1/3 w-1/3 z-10 pointer-events-none flex items-center justify-start pl-3 opacity-0" />
    </div>
  );
}
