import { DepartmentForm } from "@/features/settings/components/DepartmentForm";

export default function EditDepartmentPage({
  params,
}: {
  params: { id: string };
}) {
  return <DepartmentForm departmentId={params.id} />;
}
