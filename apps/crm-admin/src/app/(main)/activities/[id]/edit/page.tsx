import { ActivityForm } from "@/features/activities/components/ActivityForm";

export default function EditActivityPage({
  params,
}: {
  params: { id: string };
}) {
  return <ActivityForm activityId={params.id} />;
}
