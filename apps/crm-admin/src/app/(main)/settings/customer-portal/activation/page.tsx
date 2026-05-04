import type { Metadata } from 'next';
import { PortalActivation } from '@/features/customer-portal/components/PortalActivation';

export const metadata: Metadata = { title: 'Customer Portal — Activation' };

export default function PortalActivationPage() {
  return <PortalActivation />;
}
