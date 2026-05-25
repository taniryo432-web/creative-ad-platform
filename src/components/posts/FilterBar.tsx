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

export function FilterBar({ tags, selectedTag, currentSort, currentQuery }: FilterBarProps) {
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
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">並び替え</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("sort", opt.value)}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-colors",
              currentSort === opt.value
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">タグ</span>
          <button
            onClick={() => updateParam("tag", undefined)}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-colors",
              !selectedTag
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            すべて
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => updateParam("tag", selectedTag === tag.name ? undefined : tag.name)}
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-colors",
                selectedTag === tag.name
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
