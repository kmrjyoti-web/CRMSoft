'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { partnerService } from '@/services/partner.service';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const qc = useQueryClient();
  const { data: pricing = [], isLoading } = useQuery({
    queryKey: ['partner-pricing'],
    queryFn: () => partnerService.getPricing(),
  });
  const [editing, setEditing] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (serviceCode: string) => {
      await partnerService.setCustomerPricing({
        serviceCode,
        customerPrice: +editing[serviceCode],
      });
    },
    onSuccess: () => {
      toast.success('Customer pricing saved');
      qc.invalidateQueries({ queryKey: ['partner-pricing'] });
    },
    onError: () => toast.error('Failed to save — ensure price meets minimum'),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Customer Pricing</h1>
        <p className="text-sm text-gray-400 mt-1">Customer price must be at or above your minimum (what you pay).</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Service', 'Your Cost (Min)', 'Your Customer Price', 'Margin', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : (pricing as any[]).map((s) => {
              const ed = editing[s.serviceCode];
              const margin = s.customerPrice && s.partnerPrice
                ? (((+s.customerPrice - +s.partnerPrice) / +s.partnerPrice) * 100).toFixed(1)
                : null;
              return (
                <tr key={s.serviceCode} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{s.serviceName}</div>
                    <div className="text-xs text-gray-500">{s.unitDescription}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-red-300">{formatCurrency(+s.partnerPrice)}</td>
                  <td className="px-4 py-3">
                    {ed !== undefined ? (
                      <input type="number" value={ed}
                        onChange={(e) => setEditing((p) => ({ ...p, [s.serviceCode]: e.target.value }))}
                        className="w-28 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none" />
                    ) : (
                      <span className="text-sm text-green-300">
                        {s.customerPrice ? formatCurrency(+s.customerPrice) : <span className="text-gray-500">Not set</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {margin ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-900 text-green-300">+{margin}%</span>
                    ) : <span className="text-gray-500 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {ed !== undefined ? (
                        <>
                          <button onClick={() => mutation.mutate(s.serviceCode)}
                            className="text-xs text-green-400 hover:text-green-300">Save</button>
                          <button onClick={() => setEditing((p) => { const n = { ...p }; delete n[s.serviceCode]; return n; })}
                            className="text-xs text-gray-400 hover:text-white">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setEditing((p) => ({ ...p, [s.serviceCode]: s.customerPrice?.toString() || s.partnerPrice?.toString() || '' }))}
                          className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                      )}
                    </div>
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
