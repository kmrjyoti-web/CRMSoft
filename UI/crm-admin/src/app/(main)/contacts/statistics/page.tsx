"use client";
import dynamic from "next/dynamic";
const CRMStatisticsPage = dynamic(
  () => import("@/features/contacts/components/CRMDashboard").then((m) => m.CRMStatisticsPage),
  { ssr: false },
);
export default function ContactStatisticsPage() {
  return <CRMStatisticsPage />;
}
