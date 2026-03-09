'use client';

import { ProductForm } from '@/features/products/components/ProductForm';

export default function Page({ params }: { params: { id: string } }) {
  return <ProductForm productId={params.id} />;
}
