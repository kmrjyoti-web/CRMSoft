"use client";

import dynamic from "next/dynamic";

const SaleMasterList = dynamic(
  () =>
    import("@/features/accounts/components/SaleMasterList").then(
      (m) => m.SaleMasterList
    ),
  { ssr: false }
);

export default function SaleMasterPage() {
  return <SaleMasterList />;
}
