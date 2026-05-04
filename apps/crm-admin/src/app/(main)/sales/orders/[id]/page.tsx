import { SaleOrderForm } from "@/features/sales/components/SaleOrderForm";

export default function SaleOrderEditPage({ params }: { params: { id: string } }) {
  return <SaleOrderForm soId={params.id} />;
}
