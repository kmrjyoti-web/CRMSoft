'use client';

import { PackageForm } from '@/features/products/components/PackageForm';

export default function Page({ params }: { params: { id: string } }) {
  return <PackageForm packageId={params.id} />;
}
