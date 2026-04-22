import type { Metadata } from 'next';
import { PortalUsers } from '@/features/customer-portal/components/PortalUsers';

export const metadata: Metadata = { title: 'Customer Portal — Users' };

export default function PortalUsersPage() {
  return <PortalUsers />;
}
