"use client";

import { api } from "@/trpc/react";
import MemeCard from "./MemeCard";
import { TrophyIcon } from "@heroicons/react/24/solid";
import { HeartIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";

interface LeaderboardContentProps {
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function LeaderboardContent({
  currentUserId,
  isAdmin,
}: LeaderboardContentProps) {
  const {
    data: memes = [],
    refetch,
    isLoading,
  } = api.meme.leaderboard.useQuery();

  const handleVoteSuccess = (_voteDelta: number) => {
    void refetch();
  };

  const getRankEmoji = (index: number) => {
    return `#${index + 1}`;
  };

  const getRankColor = () => {
    return "text-neutral-300 border-neutral-700";
  };

  return (
    <div className="container mx-auto px-6 pt-24 pb-8 md:px-10 lg:px-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Meme Leaderboard
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-400 sm:text-xl">
          The top 5 most popular memes based on community votes
        </p>
      </div>

      {isLoading ? (
        <div className="mx-auto max-w-4xl space-y-8">
          {[...(Array(5) as Array<unknown>)].map((_, index) => (
            <div key={index} className="relative">
              <div className="absolute top-0 -left-4 z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900">
                <div className="h-4 w-6 animate-pulse rounded bg-neutral-700"></div>
              </div>

              <div className="ml-12 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-lg">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="h-6 animate-pulse rounded bg-neutral-800"></div>
                      <div className="aspect-square animate-pulse rounded-lg bg-neutral-800"></div>
                      <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-800"></div>
                    </div>

                    <div className="mt-6 md:mt-0 md:w-64 md:flex-shrink-0">
                      <div className="space-y-3 rounded-lg bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-700"></div>
                        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-700"></div>
                        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : memes.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
            <TrophyIcon className="h-10 w-10 text-neutral-500" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-white">
            No memes to rank yet
          </h3>
          <p className="mx-auto max-w-md leading-relaxed text-neutral-400">
            Start voting on memes to see the leaderboard come to life!
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-8">
          {memes.map((meme, index) => (
            <div key={meme.id} className="relative">
              <div
                className={`absolute top-0 -left-4 z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-800 font-bold ${getRankColor()} shadow-lg`}
              >
                <span className="text-base">{getRankEmoji(index)}</span>
              </div>

              <div className="ml-12 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-lg">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:gap-8">
                    <div className="flex-1">
                      <MemeCard
                        meme={meme}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        onVoteChange={handleVoteSuccess}
                      />
                    </div>

                    <div className="mt-6 md:mt-0 md:w-64 md:flex-shrink-0">
                      <div className="rounded-lg bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <h4 className="text-sm font-semibold text-white">
                            Vote Statistics
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HeartIcon className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-neutral-300">
                                Upvotes
                              </span>
                            </div>
                            <span className="font-medium text-green-400">
                              {meme.voteStats.upVotes}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HandThumbDownIcon className="h-4 w-4 text-red-400" />
                              <span className="text-sm text-neutral-300">
                                Downvotes
                              </span>
                            </div>
                            <span className="font-medium text-red-400">
                              {meme.voteStats.downVotes}
                            </span>
                          </div>
                          <div className="border-t border-neutral-700 pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-neutral-200">
                                Net Score
                              </span>
                              <div
                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                  meme.voteStats.netScore > 0
                                    ? "bg-green-500/20 text-green-400"
                                    : meme.voteStats.netScore < 0
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-neutral-700/50 text-neutral-400"
                                }`}
                              >
                                {meme.voteStats.netScore > 0 ? "+" : ""}
                                {meme.voteStats.netScore}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
