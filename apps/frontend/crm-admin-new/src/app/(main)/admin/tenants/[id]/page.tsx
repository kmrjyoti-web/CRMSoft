import { TenantDetail } from '@/features/vendor/components/TenantDetail';

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  return <TenantDetail tenantId={params.id} />;
}
