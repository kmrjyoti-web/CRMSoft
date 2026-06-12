import type { Metadata } from 'next';
import { MenuCategories } from '@/features/customer-portal/components/MenuCategories';

export const metadata: Metadata = { title: 'Customer Portal — Menu Categories' };

export default function MenuCategoriesPage() {
  return <MenuCategories />;
}
