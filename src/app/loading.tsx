// ホームページのスケルトンローダー
// Next.js がデータ取得中にこれを即座に表示することで「白い画面」をなくす

const HEIGHTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]",
                 "aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[2/3]", "aspect-[4/5]"];

export default function HomeLoading() {
  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-5">
      <div className="masonry">
        {HEIGHTS.map((h, i) => (
          <div key={i} className="masonry-item">
            <div className={`${h} bg-gray-100 rounded-xl animate-pulse`} />
            <div className="mt-2 space-y-1.5 px-0.5">
              <div className="h-2.5 bg-gray-100 rounded animate-pulse w-4/5" />
              <div className="h-2 bg-gray-100 rounded animate-pulse w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
