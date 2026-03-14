"use client";

import dynamic from "next/dynamic";

const LedgerList = dynamic(
  () =>
    import("@/features/accounts/components/LedgerList").then(
      (m) => m.LedgerList
    ),
  { ssr: false }
);

export default function LedgerPage() {
  return <LedgerList />;
}
