"use client";

import { use } from "react";
import { BackupDetailPage } from "@/features/ops/components/BackupDetailPage";

export default function BackupDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BackupDetailPage id={id} />;
}
