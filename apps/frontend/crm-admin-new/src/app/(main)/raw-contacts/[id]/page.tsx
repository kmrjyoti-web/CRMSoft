import { RawContactDetail } from "@/features/raw-contacts/components/RawContactDetail";

export default function RawContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <RawContactDetail rawContactId={params.id} />;
}
