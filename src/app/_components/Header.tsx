import Link from "next/link";
import React from "react";
import Image from "next/image";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Session } from "next-auth";
import MobileMenu from "./MobileMenu";

export default function Header({
  activePage,
  session,
}: {
  activePage?: string;
  session: Session | null;
}) {
  return (
    <header className="fixed top-0 right-0 left-0 z-[99999999] flex w-full items-center justify-between border-b border-neutral-900 bg-neutral-950 px-6 py-3 text-white">
      <Link href="/">
        <h1 className="text-xl font-semibold">Meme Box 📦</h1>
      </Link>

      <div className="hidden items-center space-x-4 md:flex">
        {session?.user ? (
          <>
            <Link
              href="/leaderboard"
              className={`text-normal leading font-medium text-neutral-300 transition-colors hover:text-white ${
                activePage === "leaderboard" ? "text-white underline" : ""
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/upload"
              className="inline-flex cursor-pointer items-center rounded-full border border-neutral-700 bg-transparent px-4 py-2 text-sm font-semibold text-neutral-300 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
            >
              <PlusIcon className="mr-1.5 h-4 w-4" />
              Upload
            </Link>
            <Link href="/user/me">
              <Image
                src={session.user.image ?? "/default-profile.png"}
                alt={session.user.name ?? "User profile"}
                width={40}
                height={40}
                className="rounded-full"
              />
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              Leaderboard
            </Link>
            <Link
              href="/api/auth/signin"
              className="ease cursor-pointer rounded-lg bg-neutral-800 px-8 py-2 font-semibold no-underline transition duration-100 hover:bg-white/10 active:scale-[99%]"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
      <MobileMenu session={session} />
    </header>
  );
}
