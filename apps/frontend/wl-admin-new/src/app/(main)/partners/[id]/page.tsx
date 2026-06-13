'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { partnersService } from '@/services/partners.service';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PartnerDetailPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const { data: partner, isLoading } = useQuery({ queryKey: ['partner', id], queryFn: () => partnersService.getOne(id) });

  const suspendMutation = useMutation({
    mutationFn: () => partnersService.suspend(id, 'Suspended by admin'),
    onSuccess: () => { toast.success('Partner suspended'); qc.invalidateQueries({ queryKey: ['partner', id] }); },
  });
  const activateMutation = useMutation({
    mutationFn: () => partnersService.activate(id),
    onSuccess: () => { toast.success('Partner activated'); qc.invalidateQueries({ queryKey: ['partner', id] }); },
  });

  if (isLoading) return <div className="text-gray-400">Loading...</div>;
  if (!partner) return <div className="text-gray-400">Partner not found</div>;

  const tabs = [
    { label: 'Overview', href: `/partners/${id}` },
    { label: 'Branding', href: `/partners/${id}/branding` },
    { label: 'Domains', href: `/partners/${id}/domains` },
    { label: 'Pricing', href: `/partners/${id}/pricing` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{partner.companyName}</h1>
          <p className="text-gray-400 text-sm mt-1">{partner.partnerCode} · {partner.email}</p>
        </div>
        <div className="flex gap-3">
          {partner.status === 'SUSPENDED' ? (
            <button onClick={() => activateMutation.mutate()} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition">Activate</button>
          ) : (
            <button onClick={() => suspendMutation.mutate()} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition">Suspend</button>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        {tabs.map(({ label, href }) => (
          <Link key={href} href={href} className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-400 hover:text-white transition">{label}</Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Status', partner.status],
          ['Plan', partner.plan],
          ['Contact', partner.contactName],
          ['Phone', partner.phone || '—'],
          ['Max Tenants', partner.maxTenants],
          ['Joined', formatDate(partner.createdAt)],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-sm font-medium text-white">{value as string}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
