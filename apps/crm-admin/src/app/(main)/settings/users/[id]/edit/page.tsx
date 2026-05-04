import { UserForm } from "@/features/settings/components/UserForm";

export default function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  return <UserForm userId={params.id} />;
}
