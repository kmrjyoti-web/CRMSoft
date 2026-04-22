"use client";

import dynamic from "next/dynamic";

const MaskingPolicyManager = dynamic(
  () =>
    import("@/features/table-config/components/MaskingPolicyManager").then(
      (m) => m.MaskingPolicyManager,
    ),
  { ssr: false },
);

export default function DataMaskingPage() {
  return <MaskingPolicyManager />;
}
