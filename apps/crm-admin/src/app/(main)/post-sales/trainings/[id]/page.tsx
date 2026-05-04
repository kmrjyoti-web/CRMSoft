"use client";

import { use } from "react";
import { TrainingDetail } from "@/features/post-sales/components/TrainingDetail";

export default function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TrainingDetail trainingId={id} />;
}
