"use client";

import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Home,
  Search,
  Plus,
  Clapperboard,
  User,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

interface PreviewPost {
  title: string;
  description: string | null;
  image_url: string | null;
  user?: { name: string; icon_url: string | null } | null;
  like_count?: number;
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-14 pb-2 text-[12px] font-semibold bg-white">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        {/* シグナルバー */}
        <div className="flex items-end gap-[2px]">
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              className="w-[3px] bg-gray-900 rounded-[1px]"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        {/* WiFi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#111" />
          <path d="M1.5 5C3.3 3.2 5.3 2 7.5 2s4.2 1.2 6 3" stroke="#111" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M3.5 7.5C4.8 6.2 6 5.5 7.5 5.5S10.2 6.2 11.5 7.5" stroke="#111" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        {/* バッテリー */}
        <div className="flex items-center">
          <div className="w-[22px] h-[11px] border-[1.5px] border-gray-900 rounded-[3px] flex items-center px-[1.5px]">
            <div className="w-[15px] h-[7px] bg-gray-900 rounded-[1px]" />
          </div>
          <div className="w-[2px] h-[4px] bg-gray-600 rounded-r-sm ml-[1px]" />
        </div>
      </div>
    </div>
  );
}

const FAKE_STORIES = ["あなた", "user_a", "user_b", "user_c", "user_d"];

export function InstagramFeedPreview({ post }: { post: PreviewPost }) {
  const username = post.user?.name ?? "advertiser";
  const avatarUrl = post.user?.icon_url;
  const likeCount = post.like_count ?? 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto scroll-hidden">
        <StatusBar />

        {/* Instagramヘッダー */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <span
            className="text-[24px] font-bold tracking-tight select-none"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
          >
            Instagram
          </span>
          <div className="flex items-center gap-5">
            <Heart className="w-[26px] h-[26px]" strokeWidth={1.5} />
            <Send className="w-[26px] h-[26px] -rotate-12" strokeWidth={1.5} />
          </div>
        </div>

        {/* ストーリーズ */}
        <div className="flex gap-3.5 px-3.5 py-3 overflow-x-hidden border-b border-gray-100">
          {FAKE_STORIES.map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-[62px] h-[62px] rounded-full p-[2.5px] ${
                  i === 0
                    ? "border-2 border-gray-200"
                    : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {i === 0 ? (
                      <div className="flex flex-col items-center">
                        <Plus className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <User className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-700 truncate w-[62px] text-center leading-tight">
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* 広告投稿 */}
        <div className="bg-white">
          {/* 投稿ヘッダー */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              {/* アバター */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-100 flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-[13px] font-semibold leading-tight">{username}</p>
                <div className="flex items-center gap-0.5">
                  <span className="text-[11px] text-gray-500">Sponsored</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" strokeWidth={2} />
                </div>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-800" />
          </div>

          {/* 画像（1:1 正方形）*/}
          <div className="w-full" style={{ aspectRatio: "1/1" }}>
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-300 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* アクションバー */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-4">
              <Heart className="w-[26px] h-[26px]" strokeWidth={1.5} />
              <MessageCircle className="w-[26px] h-[26px]" strokeWidth={1.5} />
              <Send className="w-[26px] h-[26px] -rotate-12" strokeWidth={1.5} />
            </div>
            <Bookmark className="w-[26px] h-[26px]" strokeWidth={1.5} />
          </div>

          {/* いいね数 */}
          <div className="px-3 mb-1">
            <span className="text-[13px] font-semibold">
              {likeCount > 0 ? `${likeCount}件のいいね` : "最初にいいね！しよう"}
            </span>
          </div>

          {/* キャプション */}
          <div className="px-3 mb-1.5">
            <span className="text-[13px] font-semibold mr-1.5">{username}</span>
            <span className="text-[13px]">{post.title}</span>
            {post.description && (
              <p className="text-[13px] text-gray-600 mt-0.5 line-clamp-2">
                {post.description}
              </p>
            )}
          </div>

          {/* コメント */}
          <div className="px-3 mb-2">
            <span className="text-[13px] text-gray-400">コメントをすべて見る</span>
          </div>

          {/* 広告CTA */}
          <div className="mx-3 mb-4 border border-gray-200 rounded overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2.5">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">広告</p>
                <p className="text-[13px] font-semibold text-gray-900 mt-0.5">詳細はこちら</p>
              </div>
              <button className="bg-[#0095F6] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg">
                詳しく見る
              </button>
            </div>
          </div>
        </div>

        {/* 次の投稿のヒント（フェード） */}
        <div className="h-8 bg-gradient-to-b from-transparent to-gray-50" />
      </div>

      {/* ボトムナビ（固定） */}
      <div className="bg-white border-t border-gray-200 flex items-center justify-around px-6 pt-2 pb-6 shrink-0">
        <Home className="w-[26px] h-[26px]" strokeWidth={2} />
        <Search className="w-[26px] h-[26px]" strokeWidth={1.5} />
        <div className="w-8 h-8 border-2 border-gray-900 rounded-[8px] flex items-center justify-center">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <Clapperboard className="w-[26px] h-[26px]" strokeWidth={1.5} />
        <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-1 text-gray-300" />
          )}
        </div>
      </div>
    </div>
  );
}
