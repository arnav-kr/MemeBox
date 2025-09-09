"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import MemeGrid from "./MemeGrid";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

interface MemeGridWithControlsProps {
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (memeId: string) => void;
  onVoteChange?: (voteDelta: number) => void;
  userId?: string;
  showControls?: boolean;
}

export default function MemeGridWithControls({
  currentUserId,
  isAdmin,
  userId,
  showControls = true,
  onDelete,
  onVoteChange,
}: MemeGridWithControlsProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "title">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.meme.list.useInfiniteQuery(
    {
      limit: 20,
      search: search || undefined,
      sortBy,
      sortOrder,
      userId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const memes = data?.pages.flatMap((page) => page.memes) ?? [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortOptions(false);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isLoading &&
          memes.length > 0
        ) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    if (loadMoreRef.current && memes.length > 0 && hasNextPage) {
      observer.observe(loadMoreRef.current);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      observer.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isLoading, memes.length]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleSortChange = (
    newSortBy: "createdAt" | "title",
    newSortOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setShowSortOptions(false);
  };

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-400">
          Failed to load memes. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showControls && (
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
            <div className="relative flex-1 md:max-w-md lg:max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search memes..."
                className="block w-full rounded-lg bg-neutral-900 py-3 pr-4 pl-10 text-white placeholder-neutral-500 transition-colors focus:bg-neutral-800 focus:outline-none"
              />
            </div>

            <div className="relative md:flex-shrink-0" ref={sortRef}>
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-900 px-4 py-3 text-white transition-colors hover:bg-neutral-800"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Sort</span>
              </button>

              {showSortOptions && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
                  <div className="p-3">
                    <div className="mb-3">
                      <p className="mb-3 px-1 text-xs font-medium text-neutral-400">
                        Sort by
                      </p>
                      <div className="space-y-1">
                        <button
                          onClick={() =>
                            handleSortChange("createdAt", sortOrder)
                          }
                          className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                            sortBy === "createdAt"
                              ? "bg-neutral-800 text-white shadow-sm"
                              : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                          }`}
                        >
                          Date Created
                        </button>
                        <button
                          onClick={() => handleSortChange("title", sortOrder)}
                          className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                            sortBy === "title"
                              ? "bg-neutral-800 text-white shadow-sm"
                              : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                          }`}
                        >
                          Title
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-neutral-800 pt-3">
                      <p className="mb-3 px-1 text-xs font-medium text-neutral-400">
                        Order
                      </p>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleSortChange(sortBy, "desc")}
                          className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                            sortOrder === "desc"
                              ? "bg-neutral-800 text-white shadow-sm"
                              : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                          }`}
                        >
                          Newest First
                        </button>
                        <button
                          onClick={() => handleSortChange(sortBy, "asc")}
                          className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                            sortOrder === "asc"
                              ? "bg-neutral-800 text-white shadow-sm"
                              : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                          }`}
                        >
                          Oldest First
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MemeGrid
        memes={memes}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        loading={isLoading}
        onDelete={onDelete}
        onVoteChange={onVoteChange}
      />

      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
          {isFetchingNextPage && (
            <div className="text-neutral-400">Loading more memes...</div>
          )}
        </div>
      )}
    </div>
  );
}
