'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { pricingService } from '@/services/pricing.service';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PartnerPricingPage() {
  const { id } = useParams() as { id: string };
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => pricingService.listServices() });
  const { data: partnerPricing = [] } = useQuery({
    queryKey: ['partner-pricing', id],
    queryFn: () => pricingService.getPartnerPricing(id),
  });
  const [editing, setEditing] = useState<Record<string, { partner: string; customer: string }>>({});

  const mutation = useMutation({
    mutationFn: async (serviceCode: string) => {
      const vals = editing[serviceCode];
      await pricingService.setPartnerPricing({
        partnerId: id,
        serviceCode,
        pricePerUnit: +vals.partner,
        customerMinPrice: +vals.customer,
      });
    },
    onSuccess: () => toast.success('Pricing saved'),
    onError: () => toast.error('Failed to save pricing'),
  });

  const getPartnerPrice = (code: string) => (partnerPricing as any[]).find((p) => p.serviceCode === code);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">3-Tier Pricing</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Service', 'Base Cost (Your Cost)', 'Partner Price (You Charge)', 'Customer Min Price', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(services as any[]).map((s) => {
              const pp = getPartnerPrice(s.serviceCode);
              const ed = editing[s.serviceCode];
              return (
                <tr key={s.serviceCode} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{s.serviceName}</div>
                    <div className="text-xs text-gray-500">{s.unitDescription}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatCurrency(+s.baseCostPerUnit)}</td>
                  <td className="px-4 py-3">
                    {ed ? (
                      <input type="number" value={ed.partner}
                        onChange={(e) => setEditing((prev) => ({ ...prev, [s.serviceCode]: { ...prev[s.serviceCode], partner: e.target.value } }))}
                        className="w-24 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none" />
                    ) : (
                      <span className="text-sm text-white">
                        {pp ? formatCurrency(+pp.pricePerUnit) : <span className="text-gray-500">Not set</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {ed ? (
                      <input type="number" value={ed.customer}
                        onChange={(e) => setEditing((prev) => ({ ...prev, [s.serviceCode]: { ...prev[s.serviceCode], customer: e.target.value } }))}
                        className="w-24 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none" />
                    ) : (
                      <span className="text-sm text-white">
                        {pp?.customerMinPrice ? formatCurrency(+pp.customerMinPrice) : <span className="text-gray-500">Not set</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {ed ? (
                      <>
                        <button onClick={() => mutation.mutate(s.serviceCode)} className="text-xs text-green-400 hover:text-green-300">Save</button>
                        <button onClick={() => setEditing((p) => { const n = { ...p }; delete n[s.serviceCode]; return n; })}
                          className="text-xs text-gray-400 hover:text-white">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditing((p) => ({
                        ...p,
                        [s.serviceCode]: {
                          partner: pp?.pricePerUnit?.toString() || s.defaultPartnerPrice,
                          customer: pp?.customerMinPrice?.toString() || s.defaultCustomerPrice,
                        },
                      }))} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    )}
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
