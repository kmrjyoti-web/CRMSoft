'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { partnersService } from '@/services/partners.service';
import { Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PartnersPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ['partners'], queryFn: () => partnersService.getAll() });
  const partners = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Partners</h1>
        <Link href="/partners/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Onboard Partner
        </Link>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Company', 'Contact', 'Plan', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : partners.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No partners yet</td></tr>
            ) : partners.map((p: any) => (
              <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => router.push(`/partners/${p.id}`)}>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{p.companyName}</div>
                  <div className="text-xs text-gray-500">{p.partnerCode}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{p.email}</td>
                <td className="px-4 py-3"><span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{p.plan}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.status === 'ACTIVE' ? 'bg-green-900 text-green-300' :
                    p.status === 'TRIAL' ? 'bg-yellow-900 text-yellow-300' :
                    p.status === 'SUSPENDED' ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-400'
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/partners/${p.id}`} onClick={(e) => e.stopPropagation()}
                    className="text-xs text-blue-400 hover:text-blue-300">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
