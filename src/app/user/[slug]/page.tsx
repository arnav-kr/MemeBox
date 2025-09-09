import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import UserProfileContent from "@/app/_components/UserProfileContent";
import { redirect } from "next/navigation";

interface UserProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const session = await auth();
  const { slug } = await params;

  if (slug === "me" && !session?.user) {
    redirect("/api/auth/signin");
  }

  if (session?.user) {
    void api.user.profile.prefetch({ slug });
  }

  return (
    <HydrateClient>
      <Header session={session} />
      <main className="flex min-h-screen flex-col items-center bg-neutral-950 pt-16 text-neutral-50">
        <UserProfileContent
          slug={slug}
          currentUser={session?.user ?? null}
          isLoggedIn={!!session?.user}
        />
      </main>
      <Footer />
    </HydrateClient>
  );
}
