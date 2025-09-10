"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import MemeGridWithControls from "@/app/_components/MemeGridWithControls";

interface CurrentUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface UserProfileContentProps {
  slug: string;
  currentUser: CurrentUser | null;
  isLoggedIn: boolean;
}

export default function UserProfileContent({
  slug,
  currentUser,
}: UserProfileContentProps) {
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = api.user.profile.useQuery({ slug });

  const [totalVotes, setTotalVotes] = useState(0);
  const [totalMemes, setTotalMemes] = useState(0);

  useEffect(() => {
    if (profile) {
      setTotalVotes(profile.stats.totalVotes);
      setTotalMemes(profile.stats.totalMemes);
    }
  }, [profile]);

  const handleVoteChange = (voteDelta: number) => {
    setTotalVotes((prev) => prev + voteDelta);
  };

  const handleMemeDelete = () => {
    setTotalMemes((prev) => Math.max(0, prev - 1));
  };

  if (profileLoading) {
    return (
      <div className="container px-6 py-8 md:px-10 lg:px-16">
        <div className="animate-pulse">
          <div className="mb-8 flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-neutral-800"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 rounded bg-neutral-800"></div>
              <div className="h-4 w-32 rounded bg-neutral-800"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-neutral-800"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container px-6 py-8 md:px-10 lg:px-16">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-400">
            {profileError.message === "User not found"
              ? "User Not Found"
              : "Error Loading Profile"}
          </h1>
          <p className="mb-6 text-neutral-400">
            {profileError.message === "User not found"
              ? "The user you're looking for doesn't exist."
              : "Something went wrong while loading this profile."}
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-neutral-800 px-6 py-3 transition-colors hover:bg-neutral-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container px-6 py-8 md:px-10 lg:px-16">
      <div className="mb-12">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
            {profile.user.image ? (
              <Image
                src={profile.user.image}
                alt={profile.user.name ?? "User"}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-800 text-2xl font-bold text-neutral-200 md:text-3xl">
                {(profile.user.name ?? "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center lg:text-left">
            <div className="mb-4 flex flex-col items-center gap-4 lg:mb-2 lg:flex-row lg:items-start lg:justify-between">
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {profile.user.name ?? "Anonymous User"}
              </h1>

              {profile.isOwnProfile && (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden cursor-pointer rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white md:flex md:items-center md:gap-2"
                >
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                  Sign Out
                </button>
              )}
            </div>

            <div className="flex flex-row justify-center gap-6 sm:gap-12 lg:justify-start lg:gap-16">
              <div className="text-center lg:text-left">
                <div className="text-xl font-semibold text-white">
                  {totalMemes}
                </div>
                <div className="text-base text-neutral-400">Memes</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-semibold text-white">
                  {totalVotes}
                </div>
                <div className="text-base text-neutral-400">Votes</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-base font-semibold text-neutral-300">
                  {new Date(profile.user.createdAt).toLocaleDateString()}
                </div>
                <div className="text-base text-neutral-400">Joined</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {profile.isOwnProfile
              ? "Your Memes"
              : `${profile.user.name}'s Memes`}
          </h2>
          <span className="text-lg font-medium text-neutral-400">
            {totalMemes} {totalMemes === 1 ? "meme" : "memes"}
          </span>
        </div>

        <MemeGridWithControls
          currentUserId={currentUser?.id}
          isAdmin={profile.isAdmin}
          userId={profile.user.id}
          showControls={true}
          onDelete={handleMemeDelete}
          onVoteChange={handleVoteChange}
        />
      </div>
    </div>
  );
}
