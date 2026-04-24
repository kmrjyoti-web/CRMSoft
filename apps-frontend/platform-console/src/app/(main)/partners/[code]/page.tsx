'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users, ArrowLeft, CheckCircle, XCircle, Globe, Mail, Phone,
  Building2, Layers, Key, RefreshCw, ToggleLeft, ToggleRight,
} from 'lucide-react';
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

type Vertical = {
  code: string;
  name: string;
  nameHi: string;
  status: string;
  modulesCount: number;
};

type VerticalAccess = { verticalCode: string; isEnabled: boolean };

export default function PartnerDetailPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [allVerticals, setAllVerticals] = useState<Vertical[]>([]);
  const [verticalAccess, setVerticalAccess] = useState<VerticalAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, verticals, access] = await Promise.all([
        api.partners.get(code) as Promise<Partner>,
        api.verticals.list() as Promise<Vertical[] | { items: Vertical[] }>,
        api.partners.getVerticals(code) as Promise<VerticalAccess[]>,
      ]);
      setPartner(p);
      setAllVerticals(Array.isArray(verticals) ? verticals : (verticals as any).items ?? []);
      setVerticalAccess(Array.isArray(access) ? access : (access as any).items ?? []);
    } catch {
      setPartner(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleVertical = async (verticalCode: string, currentlyEnabled: boolean) => {
    setToggling(verticalCode);
    try {
      if (currentlyEnabled) {
        await api.partners.disableVertical(code, verticalCode);
      } else {
        await api.partners.enableVertical(code, verticalCode);
      }
      await fetchData();
    } finally {
      setToggling(null);
    }
  };

  const regenerateKey = async () => {
    if (!confirm('Regenerate API key? The old key will stop working immediately.')) return;
    await api.partners.regenerateApiKey(code);
    fetchData();
  };

  const isEnabled = (verticalCode: string) =>
    verticalAccess.some(v => v.verticalCode === verticalCode && v.isEnabled);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#161b22] rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-[#161b22] rounded-lg border border-[#30363d]" />
          <div className="lg:col-span-2 h-64 bg-[#161b22] rounded-lg border border-[#30363d]" />
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-16">
        <Users className="w-8 h-8 text-[#8b949e] mx-auto mb-3" />
        <p className="text-[#8b949e]">Partner not found: {code}</p>
        <button onClick={() => router.back()} className="mt-4 text-[#58a6ff] text-sm hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-900/50 text-green-400 border-green-800',
    BETA: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    DEPRECATED: 'bg-red-900/50 text-red-400 border-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9] flex items-center gap-2">
            <Users className="w-4 h-4" /> {partner.partnerName}
          </h2>
          <p className="text-xs text-[#8b949e] font-mono">{partner.partnerCode}</p>
        </div>
        <div className="ml-auto">
          {partner.isActive
            ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
            : <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3.5 h-3.5" /> Inactive</span>
          }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner info card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9]">Partner Info</h3>

          <div className="space-y-2.5 text-xs">
            {partner.legalName && (
              <div className="flex items-start gap-2 text-[#8b949e]">
                <Building2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{partner.legalName}</span>
              </div>
            )}
            <div className="flex items-start gap-2 text-[#8b949e]">
              <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{partner.contactEmail}</span>
            </div>
            {partner.contactPhone && (
              <div className="flex items-start gap-2 text-[#8b949e]">
                <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{partner.contactPhone}</span>
              </div>
            )}
            {(partner.city || partner.state) && (
              <div className="flex items-start gap-2 text-[#8b949e]">
                <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{[partner.city, partner.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          {partner.brand && (
            <div>
              <p className="text-xs text-[#8b949e] mb-1">Brand</p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: (partner.brand.primaryColor ?? '#1976d2') + '20',
                  color: partner.brand.primaryColor ?? '#58a6ff',
                  border: `1px solid ${(partner.brand.primaryColor ?? '#1976d2')}40`,
                }}
              >
                {partner.brand.brandName}
              </span>
            </div>
          )}

          <div>
            <p className="text-xs text-[#8b949e] mb-1">Industry</p>
            <span className="text-xs text-[#c9d1d9] capitalize">{partner.industry ?? '—'}</span>
          </div>

          {partner.onboardedAt && (
            <div>
              <p className="text-xs text-[#8b949e] mb-1">Onboarded</p>
              <span className="text-xs text-[#c9d1d9]">
                {new Date(partner.onboardedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}

          {/* API Key */}
          <div className="pt-3 border-t border-[#21262d]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#8b949e] flex items-center gap-1"><Key className="w-3 h-3" /> API Key</p>
              <button
                onClick={() => setShowApiKey(s => !s)}
                className="text-xs text-[#58a6ff] hover:underline"
              >
                {showApiKey ? 'hide' : 'show'}
              </button>
            </div>
            <p className="text-xs font-mono text-[#c9d1d9] break-all bg-[#0d1117] p-2 rounded">
              {showApiKey ? (partner.apiKey ?? '—') : '••••••••••••••••'}
            </p>
            <button
              onClick={regenerateKey}
              className="mt-1.5 flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          </div>
        </div>

        {/* Vertical access panel */}
        <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#c9d1d9] flex items-center gap-2">
              <Layers className="w-4 h-4" /> Vertical Access
            </h3>
            <p className="text-xs text-[#8b949e]">
              {verticalAccess.filter(v => v.isEnabled).length} of {allVerticals.length} enabled
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allVerticals.length === 0 ? (
              <p className="text-xs text-[#8b949e] col-span-2 text-center py-6">
                No verticals registered. Run the seed script first.
              </p>
            ) : (
              allVerticals.map(v => {
                const enabled = isEnabled(v.code);
                const isToggling = toggling === v.code;
                return (
                  <div
                    key={v.code}
                    className={`border rounded-lg p-3 transition-colors ${
                      enabled
                        ? 'border-green-800 bg-green-900/10'
                        : 'border-[#30363d] bg-[#0d1117]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-[#c9d1d9] font-mono">{v.code}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${STATUS_COLORS[v.status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'}`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#8b949e] mt-0.5 truncate">{v.name}</p>
                        <p className="text-xs text-[#484f58]">{v.nameHi}</p>
                      </div>
                      <button
                        onClick={() => toggleVertical(v.code, enabled)}
                        disabled={isToggling}
                        className="ml-2 flex-shrink-0 disabled:opacity-50"
                        title={enabled ? 'Disable vertical' : 'Enable vertical'}
                      >
                        {isToggling ? (
                          <RefreshCw className="w-5 h-5 text-[#8b949e] animate-spin" />
                        ) : enabled ? (
                          <ToggleRight className="w-5 h-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-[#484f58]" />
                        )}
                      </button>
                    </div>
                    {v.modulesCount > 0 && (
                      <p className="text-xs text-[#484f58] mt-1.5">{v.modulesCount} modules</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
