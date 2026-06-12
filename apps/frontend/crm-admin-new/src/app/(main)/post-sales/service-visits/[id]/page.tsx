"use client";

import { ServiceVisitDetail } from "@/features/amc-warranty/components/ServiceVisitDetail";

export default function ServiceVisitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ServiceVisitDetail visitId={params.id} />;
}
