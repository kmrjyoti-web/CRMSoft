import { LookupDetail } from "@/features/settings/components/LookupDetail";

export default function LookupDetailPage({ params }: { params: { id: string } }) {
  return <LookupDetail lookupId={params.id} />;
}
