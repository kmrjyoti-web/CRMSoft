"use client";
import dynamic from "next/dynamic";

const StartProductionForm = dynamic(
  () => import("@/features/inventory/components/StartProductionForm").then((m) => m.StartProductionForm),
  { ssr: false },
);

export default function NewProductionPage() {
  return <StartProductionForm />;
}
