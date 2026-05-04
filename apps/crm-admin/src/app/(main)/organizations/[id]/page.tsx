import { OrganizationDetail } from "@/features/organizations/components/OrganizationDetail";

export default function OrganizationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrganizationDetail organizationId={params.id} />;
}
