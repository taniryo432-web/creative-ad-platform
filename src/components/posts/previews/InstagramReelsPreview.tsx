"use client";

import {
  Heart,
  MessageCircle,
  Send,
  User,
  MoreVertical,
  Music,
  ArrowLeft,
  ChevronRight,
  Plus,
  Home,
  Search,
  Clapperboard,
  Bookmark,
} from "lucide-react";

interface PreviewPost {
  title: string;
  description: string | null;
  image_url: string | null;
  user?: { name: string; icon_url: string | null } | null;
  like_count?: number;
}

export function InstagramReelsPreview({ post }: { post: PreviewPost }) {
  const username = post.user?.name ?? "advertiser";
  const avatarUrl = post.user?.icon_url;
  const likeCount = post.like_count ?? 0;

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden">
      {/* スクリーン全体 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 背景画像 */}
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        {/* ステータスバー */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14 pb-1 text-white text-[12px] font-semibold z-20">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[2px]">
              {[3, 5, 7, 9].map((h, i) => (
                <div key={i} className="w-[3px] bg-white rounded-[1px]" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>

        {/* トップバー */}
        <div className="absolute top-20 left-0 right-0 flex items-center justify-between px-4 z-20">
          <ArrowLeft className="w-6 h-6 text-white drop-shadow-md" />
          <span className="text-white font-semibold text-[16px] drop-shadow-md">リール</span>
          <MoreVertical className="w-6 h-6 text-white drop-shadow-md" />
        </div>

        {/* リール切り替えタブ */}
        <div className="absolute top-32 left-0 right-0 flex justify-center gap-6 z-20">
          <button className="text-white/60 text-[14px] font-medium">フォロー中</button>
          <div className="flex flex-col items-center gap-0.5">
            <button className="text-white text-[14px] font-semibold">おすすめ</button>
            <div className="w-4 h-[2px] bg-white rounded-full" />
          </div>
        </div>

        {/* プログレスバー */}
        <div className="absolute top-24 left-3 right-3 flex gap-1 z-20">
          <div className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
            <div className="h-full w-[60%] bg-white rounded-full" />
          </div>
          <div className="flex-1 h-[2px] bg-white/30 rounded-full" />
          <div className="flex-1 h-[2px] bg-white/30 rounded-full" />
        </div>

        {/* 右サイドアクション */}
        <div className="absolute right-3 bottom-36 flex flex-col items-center gap-5 z-20">
          {/* アバター + フォロー */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-2 text-gray-300" />
              )}
            </div>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#0095F6] rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* いいね */}
          <div className="flex flex-col items-center gap-0.5 mt-1">
            <Heart className="w-7 h-7 text-white drop-shadow" strokeWidth={1.5} />
            <span className="text-white text-[11px] drop-shadow">{likeCount > 0 ? likeCount.toLocaleString() : "0"}</span>
          </div>

          {/* コメント */}
          <div className="flex flex-col items-center gap-0.5">
            <MessageCircle className="w-7 h-7 text-white drop-shadow" strokeWidth={1.5} />
            <span className="text-white text-[11px] drop-shadow">0</span>
          </div>

          {/* シェア */}
          <div className="flex flex-col items-center gap-0.5">
            <Send className="w-7 h-7 text-white -rotate-12 drop-shadow" strokeWidth={1.5} />
            <span className="text-white text-[11px] drop-shadow">シェア</span>
          </div>

          {/* 保存 */}
          <div className="flex flex-col items-center gap-0.5">
            <Bookmark className="w-7 h-7 text-white drop-shadow" strokeWidth={1.5} />
          </div>

          {/* 音楽ディスク */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "conic-gradient(#555 0%, #888 50%, #555 100%)",
              animation: "spin 4s linear infinite",
            }}
          >
            <div className="w-3.5 h-3.5 bg-gray-900 rounded-full border-2 border-gray-700" />
          </div>
        </div>

        {/* 左下情報 */}
        <div className="absolute bottom-28 left-3 right-20 z-20">
          {/* Sponsored バッジ */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-white/70 text-[11px] bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
              Sponsored
            </span>
          </div>

          {/* ユーザー名 */}
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-white font-semibold text-[14px] drop-shadow">
              @{username}
            </span>
            <button className="text-white text-[12px] border border-white/70 rounded-md px-2.5 py-0.5 font-medium">
              フォロー
            </button>
          </div>

          {/* キャプション */}
          <p className="text-white text-[13px] leading-snug mb-2 line-clamp-2 drop-shadow">
            {post.title}
            {post.description && (
              <span className="text-white/70"> {post.description}</span>
            )}
          </p>

          {/* 音楽 */}
          <div className="flex items-center gap-1.5">
            <Music className="w-3 h-3 text-white/80" />
            <span className="text-white/80 text-[12px]">オリジナルオーディオ • {username}</span>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="absolute bottom-14 left-3 right-3 z-20">
          <button className="w-full bg-white text-gray-900 font-semibold text-[14px] py-2.5 rounded-xl flex items-center justify-between px-4 shadow-lg">
            <span>詳しく見る</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ボトムナビ */}
      <div className="bg-black border-t border-white/10 flex items-center justify-around px-6 pt-2 pb-6 shrink-0 z-20">
        <Home className="w-[26px] h-[26px] text-white" strokeWidth={1.5} />
        <Search className="w-[26px] h-[26px] text-white" strokeWidth={1.5} />
        <div className="w-8 h-8 border-2 border-white rounded-[8px] flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <Clapperboard className="w-[26px] h-[26px] text-white/60" strokeWidth={1.5} />
        <div className="w-7 h-7 rounded-full bg-gray-700 overflow-hidden border border-white/30">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-1 text-gray-400" />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
