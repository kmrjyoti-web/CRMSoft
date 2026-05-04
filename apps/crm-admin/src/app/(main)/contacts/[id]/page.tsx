import { ContactDetail } from "@/features/contacts/components/ContactDetail";

export default function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ContactDetail contactId={params.id} />;
}
