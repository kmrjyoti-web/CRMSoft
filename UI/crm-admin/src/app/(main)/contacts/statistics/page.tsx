"use client";
import dynamic from "next/dynamic";
const CRMDashboard = dynamic(
  () => import("@/features/contacts/components/CRMDashboard").then((m) => m.CRMDashboard),
  { ssr: false },
);
export default function ContactStatisticsPage() {
  return <CRMDashboard initialTab="statistics" />;
}
