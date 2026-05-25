import { fetchRandomPosts } from "@/app/actions/posts";
import { DiscoverViewer } from "@/components/discover/DiscoverViewer";

export default async function DiscoverPage() {
  const posts = await fetchRandomPosts(30);

  if (posts.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
        <p className="text-lg font-semibold mb-2">投稿がありません</p>
        <p className="text-gray-500 text-sm">まだクリエイティブが投稿されていません</p>
      </div>
    );
  }

  return <DiscoverViewer posts={posts} />;
}
