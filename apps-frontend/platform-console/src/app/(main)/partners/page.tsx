'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Plus, CheckCircle, XCircle, Layers } from 'lucide-react';
import { api } from '@/lib/api';

type Partner = {
  partnerCode: string;
  partnerName: string;
  legalName?: string;
  contactEmail: string;
  contactPhone?: string;
  industry?: string;
  businessType?: string;
  city?: string;
  state?: string;
  isActive: boolean;
  onboardedAt?: string;
  apiKey?: string;
  brand?: { brandCode: string; brandName: string; primaryColor?: string };
  verticalAccess: { verticalCode: string; isEnabled: boolean }[];
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.partners.list()) as any;
      setPartners(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = async (partnerCode: string) => {
    await api.partners.toggle(partnerCode);
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9] flex items-center gap-2">
            <Users className="w-4 h-4" /> Partner Management
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            {partners.length} partner{partners.length !== 1 ? 's' : ''} onboarded
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Onboard Partner
        </button>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0d1117] border-b border-[#30363d]">
            <tr>
              {['Partner', 'Code', 'Brand', 'Industry', 'Contact', 'Verticals', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262d]">
            {partners.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#8b949e]">
                  No partners onboarded yet. Click "Onboard Partner" to add the first one.
                </td>
              </tr>
            ) : partners.map((p) => (
              <tr key={p.partnerCode} className="hover:bg-[#21262d] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/partners/${p.partnerCode}`} className="font-medium text-[#58a6ff] hover:underline">
                    {p.partnerName}
                  </Link>
                  {p.legalName && <div className="text-xs text-[#8b949e]">{p.legalName}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#8b949e]">{p.partnerCode}</td>
                <td className="px-4 py-3">
                  {p.brand ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: (p.brand.primaryColor ?? '#1976d2') + '20',
                        color: p.brand.primaryColor ?? '#58a6ff',
                        border: `1px solid ${(p.brand.primaryColor ?? '#1976d2')}40`,
                      }}
                    >
                      {p.brand.brandName}
                    </span>
                  ) : <span className="text-[#8b949e]">—</span>}
                </td>
                <td className="px-4 py-3 text-[#8b949e] capitalize text-xs">{p.industry ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-[#c9d1d9]">{p.contactEmail}</div>
                  {p.contactPhone && <div className="text-xs text-[#8b949e]">{p.contactPhone}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-[#58a6ff]">
                    <Layers className="w-3 h-3" />
                    {p.verticalAccess?.filter(v => v.isEnabled).length ?? 0} active
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.isActive
                    ? <CheckCircle className="w-4 h-4 text-green-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(p.partnerCode)}
                    className="px-2 py-1 text-xs bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded hover:bg-[#30363d] transition-colors"
                  >
                    {p.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <OnboardPartnerModal
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function OnboardPartnerModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    partnerCode: '', partnerName: '', legalName: '', contactEmail: '',
    contactPhone: '', city: '', state: '', businessType: 'industry-specialist',
    industry: 'general', brandCode: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.partnerCode || !form.partnerName || !form.contactEmail) {
      setError('Partner code, name, and email are required');
      return;
    }
    setLoading(true);
    try {
      await api.partners.create(form as any);
      onSave();
    } catch (e: any) {
      setError(e.message ?? 'Failed to onboard partner');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, placeholder?: string, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-[#8b949e] mb-1">{label}</label>
      <input
        type={type}
        className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold text-[#c9d1d9] mb-4">Onboard New Partner</h2>

        <div className="space-y-3">
          {field('Partner Code *', 'partnerCode', 'e.g., travel-01')}
          {field('Partner Name *', 'partnerName', 'e.g., Travel Solutions')}
          {field('Legal Name', 'legalName', 'Registered company name')}
          {field('Contact Email *', 'contactEmail', 'partner@example.com', 'email')}
          {field('Contact Phone', 'contactPhone', '+91 9876543210')}
          <div className="grid grid-cols-2 gap-3">
            {field('City', 'city')}
            {field('State', 'state')}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Industry</label>
            <select
              className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-sm text-[#c9d1d9]"
              value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value })}
            >
              {['general', 'travel', 'electronics', 'retail', 'restaurant', 'tourism', 'software'].map(v => (
                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
              ))}
            </select>
          </div>
          {field('Brand Code', 'brandCode', 'e.g., partner-travel-1 (optional)')}
          {field('Description', 'description')}
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#238636] text-white py-2 rounded text-sm hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Onboarding...' : 'Onboard Partner'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#21262d] text-[#c9d1d9] py-2 rounded text-sm border border-[#30363d] hover:bg-[#30363d] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
