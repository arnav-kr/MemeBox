import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import PersonalizedGreeting from "@/app/_components/PersonalizedGreeting";
import HomeMemeGrid from "@/app/_components/HomeMemeGrid";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <Header session={session} />
      <main className="flex min-h-screen flex-col bg-neutral-950 pt-16 text-neutral-50">
        <div className="container mx-auto px-6 py-8 md:px-10 lg:px-16">
          <div className="mb-8 text-center">
            {session ? (
              <PersonalizedGreeting name={session.user?.name} />
            ) : (
              <>
                <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  Welcome to MemeBox 📦
                </h1>
                <p className="mb-6 text-lg text-neutral-400 sm:text-xl">
                  The best place to share and discover hilarious memes
                </p>
                <Link
                  href="/api/auth/signin"
                  className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white no-underline transition hover:bg-blue-500 sm:px-8"
                >
                  Sign in to Get Started
                </Link>
              </>
            )}
          </div>
          <div className="mt-12">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Latest Memes
              </h2>
              <p className="text-neutral-400">
                Check out what the community is sharing
              </p>
            </div>

            <HomeMemeGrid
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.role === "ADMIN"}
            />
          </div>
        </div>
      </main>
      <Footer />
    </HydrateClient>
  );
}
