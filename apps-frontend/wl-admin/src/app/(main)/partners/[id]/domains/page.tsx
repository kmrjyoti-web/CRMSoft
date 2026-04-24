'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { domainsService } from '@/services/domains.service';
import { CheckCircle, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DomainsPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['domains', id],
    queryFn: () => domainsService.list(id),
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState({ domain: '', domainType: 'PRIMARY' });

  const addMutation = useMutation({
    mutationFn: () => domainsService.add({ ...newDomain, partnerId: id }),
    onSuccess: () => {
      toast.success('Domain added');
      qc.invalidateQueries({ queryKey: ['domains', id] });
      setShowAdd(false);
      setNewDomain({ domain: '', domainType: 'PRIMARY' });
    },
    onError: () => toast.error('Failed to add domain'),
  });
  const verifyMutation = useMutation({
    mutationFn: (domainId: string) => domainsService.verify(domainId),
    onSuccess: () => { toast.success('Domain verified'); qc.invalidateQueries({ queryKey: ['domains', id] }); },
  });
  const removeMutation = useMutation({
    mutationFn: (domainId: string) => domainsService.remove(domainId),
    onSuccess: () => { toast.success('Domain removed'); qc.invalidateQueries({ queryKey: ['domains', id] }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Domains</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
          <Plus size={16} /> Add Domain
        </button>
      </div>
      {showAdd && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add Domain</h2>
          <div className="flex gap-4">
            <input value={newDomain.domain} onChange={(e) => setNewDomain((d) => ({ ...d, domain: e.target.value }))}
              placeholder="app.partner.in"
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none" />
            <select value={newDomain.domainType} onChange={(e) => setNewDomain((d) => ({ ...d, domainType: e.target.value }))}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none">
              {['PRIMARY', 'CRM_ADMIN', 'VENDOR_PANEL', 'MARKETPLACE', 'API'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <button onClick={() => addMutation.mutate()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Domain', 'Type', 'SSL', 'Verified', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : (domains as any[]).map((d) => (
              <tr key={d.id} className="border-b border-gray-800 last:border-0">
                <td className="px-4 py-3 text-sm text-white">{d.domain}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{d.domainType}</span>
                </td>
                <td className="px-4 py-3">
                  {d.sslStatus === 'ACTIVE' ? <CheckCircle size={16} className="text-green-400" /> :
                   d.sslStatus === 'PENDING' ? <Clock size={16} className="text-yellow-400" /> :
                   <AlertCircle size={16} className="text-red-400" />}
                </td>
                <td className="px-4 py-3">
                  {d.isVerified ? <CheckCircle size={16} className="text-green-400" /> : <Clock size={16} className="text-yellow-400" />}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {!d.isVerified && (
                    <button onClick={() => verifyMutation.mutate(d.id)} className="text-xs text-blue-400 hover:text-blue-300">Verify</button>
                  )}
                  <button onClick={() => removeMutation.mutate(d.id)}>
                    <Trash2 size={14} className="text-red-400 hover:text-red-300" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
