import type { Metadata } from 'next';
import { CustomerPortalDashboard } from '@/features/customer-portal/components/CustomerPortalDashboard';

export const metadata: Metadata = { title: 'Customer Portal' };

export default function CustomerPortalPage() {
  return <CustomerPortalDashboard />;
}
