"use client";

import { use } from "react";
import { TrainingForm } from "@/features/post-sales/components/TrainingForm";

export default function EditTrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TrainingForm trainingId={id} />;
}
