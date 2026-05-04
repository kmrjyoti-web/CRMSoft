"use client";
import dynamic from "next/dynamic";

const ScrapList = dynamic(
  () => import("@/features/inventory/components/ScrapList").then((m) => m.ScrapList),
  { ssr: false },
);

export default function ScrapPage() {
  return <ScrapList />;
}
