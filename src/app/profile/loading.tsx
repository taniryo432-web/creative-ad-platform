export default function ProfileLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-6 w-24 bg-gray-200 rounded mb-8" />

      {/* アイコン */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-40 bg-gray-100 rounded" />
        </div>
      </div>

      {/* フォーム */}
      <div className="space-y-3">
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-10 bg-gray-100 rounded-lg" />
        <div className="h-24 bg-gray-100 rounded-lg" />
      </div>

      {/* 投稿グリッド */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
        <div className="masonry">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div
                className="w-full bg-gray-200 rounded-xl"
                style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
