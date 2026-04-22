"use client";
import dynamic from "next/dynamic";
const ReportPicker = dynamic(
  () => import("@/features/accounts/components/ReportPicker").then((m) => m.ReportPicker),
  { ssr: false },
);
export default function AccountReportsPage() {
  return <ReportPicker />;
}
