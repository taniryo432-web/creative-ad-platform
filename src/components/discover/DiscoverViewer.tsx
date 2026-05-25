"use client";

import { useState, useEffect, useRef } from "react";
import { X, Heart, Send, User, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/types";

const STORY_DURATION = 5000;
const TICK_MS = 50;

interface DiscoverViewerProps {
  posts: Post[];
}

export function DiscoverViewer({ posts }: DiscoverViewerProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(false);

  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressRef = useRef(false);

  const increment = (100 / STORY_DURATION) * TICK_MS;
  const post = posts[index];

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    completedRef.current = false;
    intervalRef.current = setInterval(() => {
      if (pausedRef.current || completedRef.current) return;
      progressRef.current = Math.min(progressRef.current + increment, 100);
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        completedRef.current = true;
        clearInterval(intervalRef.current!);
        goNext();
      }
    }, TICK_MS);
  };

  const goNext = () => {
    setClosing(true);
    setTimeout(() => {
      if (index < posts.length - 1) {
        setIndex((i) => i + 1);
        progressRef.current = 0;
        setProgress(0);
        setClosing(false);
        setTimeout(startTimer, 50);
      } else {
        setDone(true);
      }
    }, 280);
  };

  const goPrev = () => {
    setClosing(true);
    setTimeout(() => {
      if (index > 0) {
        setIndex((i) => i - 1);
      }
      progressRef.current = 0;
      setProgress(0);
      setClosing(false);
      setTimeout(startTimer, 50);
    }, 200);
  };

  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

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
      goPrev();
    } else {
      goNext();
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

  // 完了画面
  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
        <div className="text-5xl mb-6">✨</div>
        <h2 className="text-xl font-semibold mb-2">すべて見ました</h2>
        <p className="text-gray-400 text-sm mb-8">全 {posts.length} 件のクリエイティブを閲覧しました</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setDone(false);
              progressRef.current = 0;
              setProgress(0);
              setClosing(false);
              setTimeout(startTimer, 100);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-full text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            もう一度
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-full text-sm font-medium border border-white/20"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const username = post.user?.name ?? "advertiser";
  const avatarUrl = post.user?.icon_url;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
    >
      {/* コンテンツエリア（スマホ比率に制限） */}
      <div
        className="relative w-full h-full md:max-w-[440px] md:h-auto overflow-hidden"
        style={{ aspectRatio: window.innerWidth >= 768 ? "9/16" : undefined }}
      >
        {/* 背景画像 */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: closing ? 0 : 1 }}
        >
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <span className="text-gray-600 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* グラデーション */}
        <div className="absolute top-0 left-0 right-0 h-52 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10" />

        {/* ステータスバー */}
        <div className="absolute top-0 left-0 right-0 pt-10 sm:pt-4 px-5 z-20 pointer-events-none">
          <div className="flex items-center justify-between text-white text-[11px] font-bold">
            <span>9:41</span>
            <div className="flex items-end gap-[2px]">
              {[3, 5, 7, 9].map((h, i) => (
                <div key={i} className="w-[3px] bg-white rounded-[1px]" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* 全体プログレス（上部） */}
        <div className="absolute top-16 sm:top-8 left-0 right-0 px-2 z-20 pointer-events-none">
          <div className="flex gap-[3px]">
            {posts.map((_, i) => (
              <div key={i} className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-none"
                  style={{
                    width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ユーザー情報 */}
        <div className="absolute top-20 sm:top-12 left-0 right-0 px-3 z-20 flex items-center pointer-events-none">
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
            <p className="text-white/70 text-[11px]">{index + 1} / {posts.length}</p>
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
        <Link
          href="/"
          className="absolute top-20 sm:top-12 right-3 p-1.5 z-30"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="w-5 h-5 text-white drop-shadow" />
        </Link>

        {/* ポーズUI */}
        {paused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="flex gap-2.5">
              <div className="w-[5px] h-12 bg-white/85 rounded-full" />
              <div className="w-[5px] h-12 bg-white/85 rounded-full" />
            </div>
          </div>
        )}

        {/* 下部情報 */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 z-20 pointer-events-none">
          <p className="text-white font-semibold text-[16px] leading-snug mb-3 drop-shadow-lg line-clamp-2">
            {post.title}
          </p>
          {post.description && (
            <p className="text-white/70 text-[13px] leading-snug mb-3 line-clamp-2">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 border border-white/40 rounded-full px-4 py-2">
              <span className="text-white/60 text-[12px]">メッセージを送信...</span>
            </div>
            <Heart className="w-6 h-6 text-white" strokeWidth={1.5} />
            <Send className="w-6 h-6 text-white -rotate-12" strokeWidth={1.5} />
          </div>
        </div>

        {/* 投稿詳細へのリンク */}
        <Link
          href={`/posts/${post.id}`}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 text-white/50 text-[11px] hover:text-white/70 transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
        >
          詳細を見る
        </Link>
      </div>
    </div>
  );
}
