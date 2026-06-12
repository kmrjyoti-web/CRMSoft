"use client";
import { SerialDetail } from "@/features/inventory/components/SerialDetail";
export default function SerialDetailPage({ params }: { params: { id: string } }) {
  return <SerialDetail id={params.id} />;
}
