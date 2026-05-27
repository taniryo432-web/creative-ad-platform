export default function PostLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* 画像 */}
      <div className="aspect-[4/3] w-full bg-gray-200 rounded-xl mb-6" />

      {/* タイトル + いいね */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
      </div>

      {/* 投稿者 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-1">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>

      {/* 説明文 */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  );
}
