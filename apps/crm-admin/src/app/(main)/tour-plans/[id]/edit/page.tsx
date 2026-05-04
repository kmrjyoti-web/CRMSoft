import { TourPlanForm } from "@/features/tour-plans/components/TourPlanForm";

export default function EditTourPlanPage({
  params,
}: {
  params: { id: string };
}) {
  return <TourPlanForm tourPlanId={params.id} />;
}
