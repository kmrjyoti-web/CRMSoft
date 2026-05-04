"use client";

import dynamic from "next/dynamic";

const PurchaseMasterList = dynamic(
  () =>
    import("@/features/accounts/components/PurchaseMasterList").then(
      (m) => m.PurchaseMasterList
    ),
  { ssr: false }
);

export default function PurchaseMasterPage() {
  return <PurchaseMasterList />;
}
