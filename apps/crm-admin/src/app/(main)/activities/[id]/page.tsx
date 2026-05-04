import { ActivityDetail } from "@/features/activities/components/ActivityDetail";

export default function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ActivityDetail activityId={params.id} />;
}
