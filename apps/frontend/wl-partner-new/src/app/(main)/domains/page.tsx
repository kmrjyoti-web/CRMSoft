'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { partnerService } from '@/services/partner.service';
import { CheckCircle, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DomainsPage() {
  const qc = useQueryClient();
  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['partner-domains'],
    queryFn: () => partnerService.getDomains(),
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState({ domain: '', domainType: 'PRIMARY' });

  const addMutation = useMutation({
    mutationFn: () => partnerService.addDomain(newDomain),
    onSuccess: () => {
      toast.success('Domain added');
      qc.invalidateQueries({ queryKey: ['partner-domains'] });
      setShowAdd(false);
      setNewDomain({ domain: '', domainType: 'PRIMARY' });
    },
    onError: () => toast.error('Failed to add domain'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => partnerService.verifyDomain(id),
    onSuccess: () => { toast.success('Domain verified'); qc.invalidateQueries({ queryKey: ['partner-domains'] }); },
    onError: () => toast.error('Verification failed'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => partnerService.removeDomain(id),
    onSuccess: () => { toast.success('Domain removed'); qc.invalidateQueries({ queryKey: ['partner-domains'] }); },
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
          <div className="flex gap-4 flex-wrap">
            <input value={newDomain.domain} onChange={(e) => setNewDomain((d) => ({ ...d, domain: e.target.value }))}
              placeholder="app.yourcompany.in"
              className="flex-1 min-w-48 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none" />
            <select value={newDomain.domainType} onChange={(e) => setNewDomain((d) => ({ ...d, domainType: e.target.value }))}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none">
              {['PRIMARY', 'CRM_ADMIN', 'VENDOR_PANEL', 'MARKETPLACE', 'API'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg disabled:opacity-50">Add</button>
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
            ) : (domains as any[]).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No domains configured yet</td></tr>
            ) : (domains as any[]).map((d) => (
              <tr key={d.id} className="border-b border-gray-800 last:border-0">
                <td className="px-4 py-3 text-sm text-white font-mono">{d.domain}</td>
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
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!d.isVerified && (
                      <button onClick={() => verifyMutation.mutate(d.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition">Verify</button>
                    )}
                    <button onClick={() => removeMutation.mutate(d.id)}>
                      <Trash2 size={14} className="text-red-400 hover:text-red-300 transition" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
