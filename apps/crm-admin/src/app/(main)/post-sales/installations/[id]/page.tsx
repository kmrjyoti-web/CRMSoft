"use client";

import { use } from "react";
import { InstallationDetail } from "@/features/post-sales/components/InstallationDetail";

export default function InstallationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InstallationDetail installationId={id} />;
}
