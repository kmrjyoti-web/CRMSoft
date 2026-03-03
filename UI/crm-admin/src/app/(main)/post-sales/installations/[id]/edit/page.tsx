"use client";

import { use } from "react";
import { InstallationForm } from "@/features/post-sales/components/InstallationForm";

export default function EditInstallationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InstallationForm installationId={id} />;
}
