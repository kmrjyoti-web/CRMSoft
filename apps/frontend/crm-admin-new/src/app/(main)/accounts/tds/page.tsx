"use client";
import dynamic from "next/dynamic";
const TDSList = dynamic(
  () => import("@/features/accounts/components/TDSList").then((m) => m.TDSList),
  { ssr: false },
);
export default function TDSPage() {
  return <TDSList />;
}
