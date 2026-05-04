import { DesignationForm } from "@/features/settings/components/DesignationForm";

export default function EditDesignationPage({
  params,
}: {
  params: { id: string };
}) {
  return <DesignationForm designationId={params.id} />;
}
