"use client";
import { api } from "@/trpc/react";

export default function PersonalizedGreeting({
  name,
}: {
  name: string | null | undefined;
}) {
  const { data: greeting } = api.user.keyword.useQuery();

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
        Welcome, {name ?? "Meme Explorer"}
      </h1>
      {greeting ? (
        <span className="inline-block rounded-full bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200 sm:px-5 sm:text-base">
          {greeting.keyword}
        </span>
      ) : null}
    </div>
  );
}
