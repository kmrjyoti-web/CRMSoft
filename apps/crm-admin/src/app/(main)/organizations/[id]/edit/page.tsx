import { OrganizationForm } from "@/features/organizations/components/OrganizationForm";

export default function EditOrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrganizationForm organizationId={params.id} />;
}
