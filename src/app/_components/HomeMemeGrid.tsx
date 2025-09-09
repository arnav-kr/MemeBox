"use client";

import MemeGridWithControls from "./MemeGridWithControls";

interface HomeMemeGridProps {
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function HomeMemeGrid({
  currentUserId,
  isAdmin,
}: HomeMemeGridProps) {
  return (
    <MemeGridWithControls
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      initialLimit={40}
      showControls={true}
    />
  );
}
