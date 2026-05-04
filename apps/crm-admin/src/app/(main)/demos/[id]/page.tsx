import { DemoDetail } from "@/features/demos/components/DemoDetail";

export default function DemoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <DemoDetail demoId={params.id} />;
}
