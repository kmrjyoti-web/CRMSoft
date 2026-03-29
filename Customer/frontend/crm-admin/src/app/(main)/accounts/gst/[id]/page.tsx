"use client";
import dynamic from "next/dynamic";
const GSTReturnDetail = dynamic(
  () => import("@/features/accounts/components/GSTReturnDetail").then((m) => m.GSTReturnDetail),
  { ssr: false },
);
export default function GSTReturnDetailPage({ params }: { params: { id: string } }) {
  return <GSTReturnDetail id={params.id} />;
}
