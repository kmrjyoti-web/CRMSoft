"use client";
import dynamic from "next/dynamic";
const CRMDashboardPage = dynamic(
  () => import("@/features/contacts/components/CRMDashboard").then((m) => m.CRMDashboardPage),
  { ssr: false },
);
export default function ContactDashboardPage() {
  return <CRMDashboardPage />;
}
