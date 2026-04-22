import { QuotationForm } from "@/features/quotations/components/QuotationForm";

export default function EditQuotationPage({
  params,
}: {
  params: { id: string };
}) {
  return <QuotationForm quotationId={params.id} />;
}
