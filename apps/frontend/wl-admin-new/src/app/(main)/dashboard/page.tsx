'use client';
import { useQuery } from '@tanstack/react-query';
import { partnersService } from '@/services/partners.service';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => partnersService.getDashboard() });

  const stats = data?.stats || { total: 0, active: 0, trial: 0, suspended: 0 };
  const cards = [
    { label: 'Total Partners', value: stats.total, icon: Users, color: 'blue' },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
    { label: 'Trial', value: stats.trial, icon: Clock, color: 'yellow' },
    { label: 'Suspended', value: stats.suspended, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Partners</h2>
            <div className="space-y-3">
              {(data?.recentPartners || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{p.companyName}</div>
                    <div className="text-xs text-gray-500">{p.email}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.status === 'ACTIVE' ? 'bg-green-900 text-green-300' :
                    p.status === 'TRIAL' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
