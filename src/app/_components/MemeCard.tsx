"use client";

import { useState, memo } from "react";
import { api } from "@/trpc/react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import {
  HeartIcon,
  HandThumbDownIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

interface MemeCardProps {
  meme: {
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
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (memeId: string) => void;
  onVoteChange?: (voteDelta: number) => void;
  priority?: boolean; // Add priority prop for above-fold images
}

function MemeCard({
  meme,
  currentUserId,
  isAdmin,
  onDelete,
  onVoteChange,
  priority = false,
}: MemeCardProps) {
  const [upVotes, setUpVotes] = useState(meme.voteStats?.upVotes ?? 0);
  const [downVotes, setDownVotes] = useState(meme.voteStats?.downVotes ?? 0);
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(
    meme.userVote ?? null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const netScore = upVotes - downVotes;

  const voteMutation = api.meme.vote.useMutation({
    onMutate: async ({ type }) => {
      const previousVote = userVote;
      const previousUpVotes = upVotes;
      const previousDownVotes = downVotes;

      if (previousVote === null) {
        setUserVote(type);
        if (type === "UP") {
          setUpVotes((prev) => prev + 1);
          onVoteChange?.(1);
        } else {
          setDownVotes((prev) => prev + 1);
          onVoteChange?.(1);
        }
      } else if (previousVote === type) {
        setUserVote(null);
        if (type === "UP") {
          setUpVotes((prev) => prev - 1);
          onVoteChange?.(-1);
        } else {
          setDownVotes((prev) => prev - 1);
          onVoteChange?.(-1);
        }
      } else {
        setUserVote(type);
        if (previousVote === "UP" && type === "DOWN") {
          setUpVotes((prev) => prev - 1);
          setDownVotes((prev) => prev + 1);
        } else if (previousVote === "DOWN" && type === "UP") {
          setDownVotes((prev) => prev - 1);
          setUpVotes((prev) => prev + 1);
        }
      }

      return { previousVote, previousUpVotes, previousDownVotes };
    },
    onError: (error, variables, context) => {
      if (context) {
        setUserVote(context.previousVote);
        setUpVotes(context.previousUpVotes);
        setDownVotes(context.previousDownVotes);

        const currentVote = userVote;
        if (context.previousVote === null && currentVote !== null) {
          onVoteChange?.(-1);
        } else if (context.previousVote !== null && currentVote === null) {
          onVoteChange?.(1);
        }
      }
      console.error("Vote failed:", error);
    },
    onSuccess: (data) => {
      const previousVote = userVote;
      setUserVote(data.voteType);

      if (data.action === "created") {
        if (data.voteType === "UP") {
          setUpVotes((prev) => prev + 1);
        } else {
          setDownVotes((prev) => prev + 1);
        }
      } else if (data.action === "removed") {
        if (previousVote === "UP") {
          setUpVotes((prev) => prev - 1);
        } else if (previousVote === "DOWN") {
          setDownVotes((prev) => prev - 1);
        }
      } else if (data.action === "updated") {
        if (previousVote === "UP" && data.voteType === "DOWN") {
          setUpVotes((prev) => prev - 1);
          setDownVotes((prev) => prev + 1);
        } else if (previousVote === "DOWN" && data.voteType === "UP") {
          setDownVotes((prev) => prev - 1);
          setUpVotes((prev) => prev + 1);
        }
      }
    },
  });

  const deleteMutation = api.meme.delete.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        onDelete?.(meme.id);
      }, 300);
    },
  });

  const handleVote = (type: "UP" | "DOWN") => {
    if (!currentUserId) return;

    voteMutation.mutate({
      memeId: meme.id,
      type,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this meme?")) {
      setIsDeleting(true);
      deleteMutation.mutate({ id: meme.id });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        if (navigator.canShare?.({ files: [] })) {
          try {
            const response = await fetch(meme.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `${meme.title}.jpg`, {
              type: blob.type,
            });

            await navigator.share({
              files: [file],
              title: meme.title,
              text: `Check out this meme: ${meme.title}`,
            });
            return;
          } catch (imageError) {
            console.log(
              "Error sharing image, falling back to URL:",
              imageError,
            );
          }
        }

        await navigator.share({
          title: meme.title,
          text: `Check out this meme: ${meme.title}`,
          url: meme.imageUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(meme.imageUrl);
        alert("Image URL copied to clipboard!");
      } catch (error) {
        console.log("Error copying to clipboard:", error);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const canDelete = isAdmin || currentUserId === meme.createdBy.id;

  return (
    <div
      className={`group w-full break-inside-avoid overflow-hidden rounded-xl bg-white/5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isDeleting
          ? "translate-y-2 scale-95 opacity-0"
          : "translate-y-0 scale-100 opacity-100"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {meme.createdBy.image ? (
            <Image
              src={meme.createdBy.image}
              alt={meme.createdBy.name ?? "User"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <Image
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(meme.createdBy.name ?? "Anonymous")}&backgroundColor=8b5cf6,a855f7,d946ef&textColor=ffffff`}
              alt={meme.createdBy.name ?? "User"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-white">
              {meme.createdBy.name}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(meme.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="cursor-pointer rounded-full p-2.5 text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 md:opacity-0 md:group-hover:opacity-100"
            title="Delete meme"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      <div
        className="relative cursor-pointer overflow-hidden"
        onClick={() => setIsModalOpen(true)}
      >
        <Image
          src={meme.imageUrl}
          alt={meme.title}
          width={600}
          height={400}
          className="w-full object-cover transition-transform duration-200 hover:scale-105"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            maxHeight: "600px",
            height: "auto",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-4">
        <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-white">
          {meme.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => handleVote("UP")}
              disabled={voteMutation.isPending || !currentUserId}
              className={`cursor-pointer rounded-full p-2 transition-all duration-200 ${
                userVote === "UP"
                  ? "bg-red-500/20 text-red-400"
                  : "text-gray-400 hover:bg-red-500/10 hover:text-red-400"
              } ${!currentUserId ? "cursor-not-allowed opacity-50" : ""} ${
                voteMutation.isPending ? "animate-pulse opacity-75" : ""
              }`}
            >
              {userVote === "UP" ? (
                <HeartSolidIcon className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </button>

            <div className="min-w-[2.5rem] text-center">
              <span
                className={`text-sm font-bold ${
                  netScore > 0
                    ? "text-green-400"
                    : netScore < 0
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {netScore > 0 ? "+" : ""}
                {netScore}
              </span>
            </div>

            <button
              onClick={() => handleVote("DOWN")}
              disabled={voteMutation.isPending || !currentUserId}
              className={`cursor-pointer rounded-full p-2 transition-all duration-200 ${
                userVote === "DOWN"
                  ? "bg-gray-500/20 text-gray-400"
                  : "text-gray-500 hover:bg-gray-500/10 hover:text-gray-300"
              } ${!currentUserId ? "cursor-not-allowed opacity-50" : ""} ${
                voteMutation.isPending ? "animate-pulse opacity-75" : ""
              }`}
            >
              {userVote === "DOWN" ? (
                <HandThumbDownSolidIcon className="h-5 w-5" />
              ) : (
                <HandThumbDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="cursor-pointer rounded-full p-2 text-gray-400 transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-400"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={meme.imageUrl}
        title={meme.title}
      />
    </div>
  );
}

export default memo(MemeCard);
