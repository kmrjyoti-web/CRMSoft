import { RoleForm } from "@/features/settings/components/RoleForm";

export default function EditRolePage({
  params,
}: {
  params: { id: string };
}) {
  return <RoleForm roleId={params.id} />;
}
