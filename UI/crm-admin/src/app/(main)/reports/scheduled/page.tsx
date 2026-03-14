"use client";
import dynamic from "next/dynamic";
const ScheduledReportsPage = dynamic(
  () => import("@/features/reports/components/ScheduledReportsPage").then((m) => m.ScheduledReportsPage),
  { ssr: false },
);
export default function ScheduledReportsRoute() {
  return <ScheduledReportsPage />;
}
