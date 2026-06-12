import { RawContactForm } from "@/features/raw-contacts/components/RawContactForm";

export default function EditRawContactPage({
  params,
}: {
  params: { id: string };
}) {
  return <RawContactForm rawContactId={params.id} />;
}
