'use client';

import { Icon, Card } from '@/components/ui';

export function TenantSubscriptionManager() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage tenant subscriptions</p>
      </div>

      <Card className="p-12 text-center">
        <Icon name="building-2" size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-500">Tenant Management</h3>
        <p className="text-sm text-gray-400 mt-2">
          Tenant list with subscription details, usage overview, and wallet balances.
          <br />
          Available via super admin dashboard.
        </p>
      </Card>
    </div>
  );
}
