import { QuotationDetail } from "@/features/quotations/components/QuotationDetail";

export default function QuotationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <QuotationDetail quotationId={params.id} />;
}
