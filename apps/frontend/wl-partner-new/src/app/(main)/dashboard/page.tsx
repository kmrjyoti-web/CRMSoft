'use client';
import { useQuery } from '@tanstack/react-query';
import { partnerService } from '@/services/partner.service';
import { Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['partner-dashboard'],
    queryFn: () => partnerService.getDashboard(),
  });

  const stats = data?.stats || { tenants: 0, monthlyRevenue: 0, activeErrors: 0, testsPassed: 0 };
  const cards = [
    { label: 'Active Tenants', value: stats.tenants, icon: Users, color: 'blue' },
    { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue?.toLocaleString('en-IN') || 0}`, icon: DollarSign, color: 'green' },
    { label: 'Active Errors', value: stats.activeErrors, icon: AlertCircle, color: 'red' },
    { label: 'Tests Passed', value: stats.testsPassed, icon: CheckCircle, color: 'green' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Partner Dashboard</h1>
      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">{label}</span>
                  <Icon size={20} className={`text-${color}-400`} />
                </div>
                <div className="text-3xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Tenants</h2>
              <div className="space-y-3">
                {(data?.recentTenants || []).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-white">{t.companyName}</div>
                      <div className="text-xs text-gray-500">{t.plan}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      t.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                    }`}>{t.status}</span>
                  </div>
                ))}
                {(!data?.recentTenants || data.recentTenants.length === 0) && (
                  <p className="text-sm text-gray-500">No tenants yet</p>
                )}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { label: 'Configure Branding', href: '/branding' },
                  { label: 'Manage Domains', href: '/domains' },
                  { label: 'Set Customer Pricing', href: '/pricing' },
                  { label: 'View Usage Report', href: '/usage' },
                  { label: 'Download Invoice', href: '/billing' },
                ].map(({ label, href }) => (
                  <a key={href} href={href}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm text-gray-300 hover:text-white">
                    {label}
                    <span className="text-gray-500">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
