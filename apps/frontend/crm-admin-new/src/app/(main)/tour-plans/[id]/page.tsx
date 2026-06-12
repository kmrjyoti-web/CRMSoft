import { TourPlanDetail } from "@/features/tour-plans/components/TourPlanDetail";

export default function TourPlanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TourPlanDetail tourPlanId={params.id} />;
}
