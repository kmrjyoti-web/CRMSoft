"use client";
import dynamic from "next/dynamic";
const GSTDashboard = dynamic(
  () => import("@/features/accounts/components/GSTDashboard").then((m) => m.GSTDashboard),
  { ssr: false },
);
export default function GSTPage() {
  return <GSTDashboard />;
}
