"use client";

import dynamic from "next/dynamic";

const SeedLocalMembersButton = dynamic(
  () => import("@/components/SeedLocalMembersButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function SeedLocalMembersClientOnly() {
  return <SeedLocalMembersButton />;
}
