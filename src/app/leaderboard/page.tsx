import { auth } from "@/server/auth";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import LeaderboardContent from "@/app/_components/LeaderboardContent";

export default async function LeaderboardPage() {
  const session = await auth();

  return (
    <>
      <Header activePage="leaderboard" />
      <main className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
        <LeaderboardContent
          currentUserId={session?.user?.id}
          isAdmin={session?.user?.role === "ADMIN"}
        />
      </main>
      <Footer />
    </>
  );
}
