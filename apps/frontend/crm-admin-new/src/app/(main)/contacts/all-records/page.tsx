"use client";
import dynamic from "next/dynamic";
const CRMAllRecordsPage = dynamic(
  () => import("@/features/contacts/components/CRMDashboard").then((m) => m.CRMAllRecordsPage),
  { ssr: false },
);
export default function ContactAllRecordsPage() {
  return <CRMAllRecordsPage />;
}
