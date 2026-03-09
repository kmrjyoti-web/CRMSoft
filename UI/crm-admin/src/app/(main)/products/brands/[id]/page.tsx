'use client';

import { BrandDetail } from '@/features/brands/components/BrandDetail';

export default function Page({ params }: { params: { id: string } }) {
  return <BrandDetail brandId={params.id} />;
}
