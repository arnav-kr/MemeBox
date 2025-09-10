"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import {
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  TrophyIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import type { Session } from "next-auth";

interface MobileMenuProps {
  session: Session | null;
}

export default function MobileMenu({ session }: MobileMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="cursor-pointer p-2 text-neutral-300 transition-colors hover:text-white md:hidden"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[99999998] bg-black/50 md:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed top-0 right-0 z-[99999999] h-full w-80 rounded-l-xl border-l border-neutral-800 bg-neutral-950 md:hidden">
            <div className="p-6">
              <div className="mb-6 flex justify-end">
                <button
                  onClick={closeMobileMenu}
                  className="cursor-pointer rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {session?.user ? (
                  <>
                    <Link
                      href="/user/me"
                      prefetch={true}
                      onClick={closeMobileMenu}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-white transition-colors hover:bg-neutral-800/50"
                    >
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name ?? "User profile"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-neutral-400" />
                      )}
                      <div>
                        <div className="text-sm font-medium">My Account</div>
                        <div className="text-xs text-neutral-400">
                          {session.user.name}
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/leaderboard"
                      prefetch={true}
                      onClick={closeMobileMenu}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white"
                    >
                      <TrophyIcon className="h-5 w-5" />
                      <div className="text-sm font-medium">Leaderboard</div>
                    </Link>
                    <Link
                      href="/upload"
                      prefetch={true}
                      onClick={closeMobileMenu}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <div className="text-sm font-medium">Upload Meme</div>
                    </Link>
                    <Link
                      href="/api/auth/signout"
                      onClick={closeMobileMenu}
                      className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      <div className="text-sm font-medium">Sign Out</div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/leaderboard"
                      onClick={closeMobileMenu}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white"
                    >
                      <TrophyIcon className="h-5 w-5" />
                      <div className="text-sm font-medium">Leaderboard</div>
                    </Link>
                    <Link
                      href="/api/auth/signin"
                      onClick={closeMobileMenu}
                      className="flex cursor-pointer items-center gap-3 rounded-lg bg-neutral-800 px-3 py-2 text-white transition-colors hover:bg-neutral-700"
                    >
                      <UserIcon className="h-5 w-5" />
                      <div className="text-sm font-medium">Sign In</div>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
