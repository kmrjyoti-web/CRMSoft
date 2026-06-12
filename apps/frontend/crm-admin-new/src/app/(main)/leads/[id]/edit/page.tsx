import { LeadForm } from "@/features/leads/components/LeadForm";

export default function EditLeadPage({
  params,
}: {
  params: { id: string };
}) {
  return <LeadForm leadId={params.id} />;
}
