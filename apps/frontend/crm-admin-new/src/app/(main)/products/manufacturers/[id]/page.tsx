'use client';

import { ManufacturerDetail } from '@/features/manufacturers/components/ManufacturerDetail';

export default function Page({ params }: { params: { id: string } }) {
  return <ManufacturerDetail manufacturerId={params.id} />;
}
