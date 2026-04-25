import { LeadDetail } from "@/features/leads/components/LeadDetail";

export default function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <LeadDetail leadId={params.id} />;
}
