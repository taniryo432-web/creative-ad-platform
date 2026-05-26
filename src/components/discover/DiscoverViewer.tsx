"use client";

/**
 * DiscoverViewer
 *
 * パフォーマンス最適化:
 * - プログレスバー: CSS animation (@keyframes story-fill) + key remount
 *   → setInterval/state 更新による毎フレーム再レンダリングを排除
 * - 進行タイミング: setTimeout 1 本のみ
 * - 次 2 件の画像をプリロード (Image constructor でブラウザキャッシュへ先読み)
 * - 再レンダリング: index / paused / storyKey 変化時のみ
 */

import { useState, useEffect, useRef } from "react";
import { X, Heart, Send, User, RefreshCw } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types";

const STORY_DURATION = 5000;
const PRELOAD_AHEAD = 2; // 次 N 件を先読み

interface DiscoverViewerProps {
  posts: Post[];
  currentUserId?: string;
  initialLikedIds?: string[];
}

export function DiscoverViewer({ posts, currentUserId, initialLikedIds = [] }: DiscoverViewerProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(false);
  const [storyKey, setStoryKey] = useState(0);

  // いいね状態
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds));
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(posts.map((p) => [p.id, p.like_count ?? 0]))
  );
  const [heartAnim, setHeartAnim] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const remainingRef = useRef(STORY_DURATION);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressRef = useRef(false);

  const supabase = createClient();
  const post = posts[index];

  // ---- 次ストーリーへ ----
  const goNext = () => {
    setClosing(true);
    setTimeout(() => {
      if (index < posts.length - 1) {
        setIndex((i) => i + 1);
        setStoryKey((k) => k + 1);
        setClosing(false);
      } else {
        setDone(true);
      }
    }, 260);
  };

  const goPrev = () => {
    setClosing(true);
    setTimeout(() => {
      setIndex((i) => Math.max(0, i - 1));
      setStoryKey((k) => k + 1);
      setClosing(false);
    }, 200);
  };

  // ---- タイマー ----
  const scheduleAdvance = (ms: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startTimeRef.current = performance.now();
    timeoutRef.current = setTimeout(goNext, ms);
  };

  // storyKey / index が変わるたびにタイマーリセット
  useEffect(() => {
    remainingRef.current = STORY_DURATION;
    scheduleAdvance(STORY_DURATION);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [storyKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ポーズ/解除
  useEffect(() => {
    if (paused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const elapsed = performance.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    } else {
      scheduleAdvance(remainingRef.current);
    }
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- 次 N 件の画像をプリロード ----
  useEffect(() => {
    for (let i = 1; i <= PRELOAD_AHEAD; i++) {
      const nextPost = posts[index + i];
      if (nextPost?.image_url) {
        const img = new window.Image();
        img.src = nextPost.image_url;
      }
    }
  }, [index, posts]);

  // ---- いいね ----
  const handleLike = async () => {
    if (!currentUserId || !post || likeLoading) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);

    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);

    const isLiked = likedIds.has(post.id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(post.id);
      else next.add(post.id);
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [post.id]: (prev[post.id] ?? 0) + (isLiked ? -1 : 1),
    }));

    setLikeLoading(true);
    try {
      if (isLiked) {
        await supabase.from("likes").delete().match({ post_id: post.id, user_id: currentUserId });
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: currentUserId });
      }
    } catch {
      // ロールバック
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(post.id);
        else next.delete(post.id);
        return next;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [post.id]: (prev[post.id] ?? 0) + (isLiked ? 1 : -1),
      }));
    } finally {
      setLikeLoading(false);
    }
  };

  // ---- ポインター ----
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
    if (x < rect.width * 0.3) goPrev();
    else goNext();
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

  // ---- 完了画面 ----
  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
        <div className="text-5xl mb-6">✨</div>
        <h2 className="text-xl font-semibold mb-2">すべて見ました</h2>
        <p className="text-gray-500 text-sm mb-8">全 {posts.length} 件のクリエイティブを閲覧</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setDone(false);
              setClosing(false);
              setStoryKey((k) => k + 1);
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
            トップへ
          </Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const username = post.user?.name ?? "advertiser";
  const avatarUrl = post.user?.icon_url;
  const isLiked = likedIds.has(post.id);
  const likeCount = likeCounts[post.id] ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
    >
      <div className="relative w-full h-full md:w-[430px] md:h-[760px] md:rounded-2xl overflow-hidden">

        {/* ぼかし背景 */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "blur(28px)",
              transform: "scale(1.12)",
              opacity: closing ? 0 : 0.55,
              transition: "opacity 0.26s ease",
            }}
            draggable={false}
          />
        )}
        {/* メイン画像：contain でトリミングなし */}
        <div
          className="absolute inset-0"
          style={{ opacity: closing ? 0 : 1, transition: "opacity 0.26s ease" }}
        >
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-900" />
          )}
        </div>

        {/* グラデーション */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/65 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/85 to-transparent pointer-events-none z-10" />

        {/* ステータスバー */}
        <div className="absolute top-0 left-0 right-0 pt-10 md:pt-3 px-5 z-20 pointer-events-none">
          <div className="flex items-center justify-between text-white text-[11px] font-bold">
            <span>9:41</span>
            <div className="flex items-end gap-[2px]">
              {[3, 5, 7, 9].map((h, i) => (
                <div key={i} className="w-[3px] bg-white rounded-[1px]" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* 全体プログレスバー（CSS animation） */}
        <div className="absolute top-16 md:top-8 left-0 right-0 px-2 z-20 pointer-events-none">
          <div className="flex gap-[2px]">
            {posts.map((_, i) => (
              <div key={i} className="flex-1 h-[2px] bg-white/25 rounded-full overflow-hidden">
                {i < index ? (
                  // 完了済み: 静的に 100%
                  <div className="h-full w-full bg-white rounded-full" />
                ) : i === index ? (
                  // 現在: CSS animation (key で再マウント)
                  <div
                    key={storyKey}
                    className="h-full bg-white rounded-full"
                    style={{
                      animation: `story-fill ${STORY_DURATION}ms linear forwards`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* ユーザー情報 */}
        <div className="absolute top-20 md:top-12 left-0 right-0 px-3 z-20 flex items-center pointer-events-none">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 shrink-0 mr-2 ring-[1.5px] ring-white/40 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-gray-300" />
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-[12px] drop-shadow">{username}</p>
            <p className="text-white/60 text-[10px]">{index + 1} / {posts.length}</p>
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
          className="absolute top-20 md:top-12 right-3 p-1.5 z-30"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="w-5 h-5 text-white drop-shadow" />
        </Link>

        {/* ポーズ */}
        {paused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="flex gap-2.5">
              <div className="w-[5px] h-12 bg-white/80 rounded-full" />
              <div className="w-[5px] h-12 bg-white/80 rounded-full" />
            </div>
          </div>
        )}

        {/* いいねボタン（safe area + ホームバー分だけ上げる） */}
        <button
          className="absolute right-4 z-30 flex flex-col items-center gap-1"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 8rem)" }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => { e.stopPropagation(); handleLike(); }}
          disabled={!currentUserId}
        >
          <div
            style={{
              transform: heartAnim ? "scale(1.55)" : "scale(1)",
              transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
          >
            <Heart
              className={`w-8 h-8 drop-shadow-lg transition-colors duration-150 ${
                isLiked ? "fill-red-500 text-red-500" : "text-white"
              }`}
              strokeWidth={isLiked ? 0 : 1.5}
            />
          </div>
          {likeCount > 0 && (
            <span className="text-white text-[11px] font-medium drop-shadow">
              {likeCount.toLocaleString()}
            </span>
          )}
        </button>

        {/* シェア */}
        <button
          className="absolute right-4 z-30"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Send className="w-6 h-6 text-white/70 -rotate-12 drop-shadow" strokeWidth={1.5} />
        </button>

        {/* 下部テキスト */}
        <div
          className="absolute bottom-0 left-0 right-16 px-4 z-20 pointer-events-none"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)" }}
        >
          <p className="text-white font-semibold text-[15px] leading-snug mb-2 drop-shadow-lg line-clamp-2">
            {post.title}
          </p>
          {post.description && (
            <p className="text-white/65 text-[12px] leading-snug line-clamp-2 mb-2">
              {post.description}
            </p>
          )}
          <Link
            href={`/posts/${post.id}`}
            className="inline-flex items-center gap-1 text-white/50 text-[11px] hover:text-white/80 transition-colors pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            詳細を見る →
          </Link>
        </div>
      </div>
    </div>
  );
}
