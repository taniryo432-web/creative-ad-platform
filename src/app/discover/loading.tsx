// Discover ページのローディング
// Story ビューアーが準備できるまでの間、黒画面+スピナーを即座に表示

export default function DiscoverLoading() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 gap-4">
      {/* プログレスバー風スケルトン */}
      <div className="flex gap-[3px] w-48">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
            {i === 1 && (
              <div
                className="h-full bg-white/50 rounded-full"
                style={{ animation: "story-fill 1.2s linear infinite" }}
              />
            )}
          </div>
        ))}
      </div>
      {/* スピナー */}
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
      <p className="text-white/40 text-[11px]">クリエイティブを準備中...</p>
    </div>
  );
}
