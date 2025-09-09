import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import UploadForm from "@/app/_components/UploadForm";

export default async function UploadPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/upload");
  }

  return (
    <HydrateClient>
      <Header />
      <main className="flex min-h-screen flex-col bg-neutral-950 pt-16 text-neutral-50">
        <div className="container mx-auto max-w-2xl px-6 py-8 md:px-10 lg:px-16">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Upload a Meme</h1>
            <p className="mt-2 text-neutral-400">
              Share your favorite meme with the community!
            </p>
          </div>
          <UploadForm />
        </div>
      </main>
      <Footer />
    </HydrateClient>
  );
}
