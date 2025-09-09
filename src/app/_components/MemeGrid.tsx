"use client";

import MemeCard from "./MemeCard";

interface MemeGridProps {
  memes: Array<{
    id: string;
    title: string;
    imageUrl: string;
    createdAt: Date;
    createdBy: {
      id: string;
      name: string | null;
      image: string | null;
    };
    _count: {
      votes: number;
    };
    voteStats?: {
      upVotes: number;
      downVotes: number;
      total: number;
    };
    userVote?: "UP" | "DOWN" | null;
  }>;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (memeId: string) => void;
  onVoteChange?: (voteDelta: number) => void;
  loading?: boolean;
}

export default function MemeGrid({
  memes,
  currentUserId,
  isAdmin,
  onDelete,
  onVoteChange,
  loading = false,
}: MemeGridProps) {
  if (loading) {
    return (
      <div className="masonry-container columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-4">
        {[...(Array(8) as Array<unknown>)].map((_, i) => (
          <div
            key={i}
            className="masonry-item mb-6 animate-pulse overflow-hidden rounded-xl bg-white/5 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 rounded-full bg-neutral-700/70" />
              <div className="flex-1">
                <div className="mb-1 h-4 rounded bg-neutral-700/50" />
                <div className="h-3 w-20 rounded bg-neutral-800/50" />
              </div>
            </div>

            <div
              className="bg-neutral-700/40"
              style={{
                height: `${200 + (i % 4) * 100}px`,
              }}
            />

            <div className="p-4">
              <div className="mb-3 h-6 rounded bg-neutral-700/50" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-16 rounded-full bg-neutral-700/40" />
                  <div className="h-8 w-8 rounded-full bg-neutral-700/40" />
                </div>
                <div className="h-8 w-8 rounded-full bg-neutral-700/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!memes.length) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
          <svg
            className="h-10 w-10 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="mb-3 text-xl font-semibold text-white">
          No memes found
        </h3>
        <p className="mx-auto max-w-md leading-relaxed text-neutral-400">
          {currentUserId
            ? "Start by uploading your first meme to get the fun started!"
            : "No memes have been shared yet. Check back later!"}
        </p>
      </div>
    );
  }

  return (
    <div className="masonry-container columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-3 2xl:columns-4">
      {memes.map((meme) => (
        <div key={meme.id} className="masonry-item mb-6">
          <MemeCard
            meme={meme}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onDelete={onDelete}
            onVoteChange={onVoteChange}
          />
        </div>
      ))}
    </div>
  );
}
