'use client';
import { useQuery } from '@tanstack/react-query';
import { pricingService } from '@/services/pricing.service';
import { formatCurrency } from '@/lib/utils';

export default function ServicePricingPage() {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => pricingService.listServices(),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Global Service Pricing</h1>
      <p className="text-sm text-gray-400 mb-6">Base costs per service — used as minimum floor for partner pricing.</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Service', 'Unit', 'Base Cost', 'Default Partner', 'Default Customer', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : (services as any[]).map((s) => (
              <tr key={s.serviceCode} className="border-b border-gray-800 last:border-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{s.serviceName}</div>
                  <div className="text-xs text-gray-500">{s.serviceCode}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{s.unitDescription}</td>
                <td className="px-4 py-3 text-sm text-red-300 font-medium">{formatCurrency(+s.baseCostPerUnit)}</td>
                <td className="px-4 py-3 text-sm text-yellow-300">{formatCurrency(+s.defaultPartnerPrice)}</td>
                <td className="px-4 py-3 text-sm text-green-300">{formatCurrency(+s.defaultCustomerPrice)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${s.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
