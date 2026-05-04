"use client";
import dynamic from "next/dynamic";

const SerialTrackingReport = dynamic(
  () => import("@/features/inventory/components/SerialTrackingReport").then((m) => m.SerialTrackingReport),
  { ssr: false },
);

export default function SerialTrackingPage() {
  return <SerialTrackingReport />;
}
