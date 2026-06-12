import { ContactForm } from "@/features/contacts/components/ContactForm";

export default function EditContactPage({
  params,
}: {
  params: { id: string };
}) {
  return <ContactForm contactId={params.id} />;
}
