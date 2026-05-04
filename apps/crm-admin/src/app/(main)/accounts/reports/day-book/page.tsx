"use client";
import dynamic from "next/dynamic";
const DayBookReport = dynamic(
  () => import("@/features/accounts/components/DayBookReport").then((m) => m.DayBookReport),
  { ssr: false },
);
export default function DayBookPage() {
  return <DayBookReport />;
}
