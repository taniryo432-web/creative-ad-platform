"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Tag, SortOption } from "@/types";

interface FilterBarProps {
  tags: Tag[];
  selectedTag?: string;
  currentSort: SortOption;
  currentQuery?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "latest", label: "新着" },
  { value: "popular", label: "人気" },
  { value: "saved", label: "保存数" },
];

export function FilterBar({ tags, selectedTag, currentSort }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="mb-6">
      {/* 横スクロール可能な1行 */}
      <div className="flex items-center gap-1.5 overflow-x-auto scroll-hidden pb-1">
        {/* ソートオプション */}
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("sort", opt.value)}
            className={cn(
              "px-3.5 py-1.5 text-[13px] rounded-full whitespace-nowrap transition-colors shrink-0",
              currentSort === opt.value
                ? "bg-gray-900 text-white font-medium"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {opt.label}
          </button>
        ))}

        {/* 区切り */}
        <div className="w-px h-5 bg-gray-200 shrink-0 mx-1" />

        {/* タグ: すべて */}
        <button
          onClick={() => updateParam("tag", undefined)}
          className={cn(
            "px-3.5 py-1.5 text-[13px] rounded-full whitespace-nowrap transition-colors shrink-0",
            !selectedTag
              ? "bg-gray-900 text-white font-medium"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          )}
        >
          すべて
        </button>

        {/* タグ一覧 */}
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => updateParam("tag", selectedTag === tag.name ? undefined : tag.name)}
            className={cn(
              "px-3.5 py-1.5 text-[13px] rounded-full whitespace-nowrap transition-colors shrink-0",
              selectedTag === tag.name
                ? "bg-gray-900 text-white font-medium"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
