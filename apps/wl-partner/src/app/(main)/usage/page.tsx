'use client';
import { useQuery } from '@tanstack/react-query';
import { partnerService } from '@/services/partner.service';
import { formatCurrency } from '@/lib/utils';

export default function UsagePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['partner-usage'],
    queryFn: () => partnerService.getUsage(),
  });

  const usage: any[] = data?.usage || [];
  const summary = data?.summary || { totalCostToPartner: 0, totalChargedToCustomers: 0, totalProfit: 0 };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Usage Report</h1>
        <p className="text-sm text-gray-400 mt-1">Current billing month — {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Cost to You', value: formatCurrency(+summary.totalCostToPartner), color: 'text-red-300' },
          { label: 'Charged to Customers', value: formatCurrency(+summary.totalChargedToCustomers), color: 'text-yellow-300' },
          { label: 'Your Profit', value: formatCurrency(+summary.totalProfit), color: 'text-green-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-500 mb-2">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Service', 'Units Used', 'Cost to You', 'Charged to Customers', 'Your Profit'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : usage.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No usage data for this period</td></tr>
            ) : usage.map((row: any) => {
              const profit = (+row.chargedToCustomers || 0) - (+row.costToPartner || 0);
              return (
                <tr key={row.serviceCode} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{row.serviceName}</div>
                    <div className="text-xs text-gray-500">{row.unitDescription}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{row.unitsUsed?.toLocaleString('en-IN') || 0}</td>
                  <td className="px-4 py-3 text-sm text-red-300">{formatCurrency(+row.costToPartner || 0)}</td>
                  <td className="px-4 py-3 text-sm text-yellow-300">{formatCurrency(+row.chargedToCustomers || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
