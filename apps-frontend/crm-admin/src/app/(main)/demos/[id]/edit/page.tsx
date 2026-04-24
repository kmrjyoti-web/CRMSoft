import { DemoForm } from "@/features/demos/components/DemoForm";

export default function EditDemoPage({
  params,
}: {
  params: { id: string };
}) {
  return <DemoForm demoId={params.id} />;
}
