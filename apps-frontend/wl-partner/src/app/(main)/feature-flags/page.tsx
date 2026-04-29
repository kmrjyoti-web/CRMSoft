'use client';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_partner_token') || '' : '';
const partnerId = typeof window !== 'undefined' ? localStorage.getItem('wl_partner_id') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';

const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts?.headers || {}) } }).then((r) => r.json());

const CATEGORY_COLORS: Record<string, string> = {
  CRM: 'bg-blue-900/40 text-blue-300',
  Finance: 'bg-green-900/40 text-green-300',
  Integrations: 'bg-purple-900/40 text-purple-300',
  Payments: 'bg-yellow-900/40 text-yellow-300',
  Platform: 'bg-indigo-900/40 text-indigo-300',
  Mobile: 'bg-pink-900/40 text-pink-300',
  Analytics: 'bg-orange-900/40 text-orange-300',
  Data: 'bg-teal-900/40 text-teal-300',
  Developer: 'bg-gray-700 text-gray-300',
  Customization: 'bg-red-900/40 text-red-300',
  Automation: 'bg-cyan-900/40 text-cyan-300',
  Storage: 'bg-lime-900/40 text-lime-300',
  Communications: 'bg-violet-900/40 text-violet-300',
  Support: 'bg-amber-900/40 text-amber-300',
  Branding: 'bg-rose-900/40 text-rose-300',
};

type Feature = {
  code: string;
  label: string;
  description: string;
  category: string;
  isEnabled: boolean;
};

export default function FeatureFlagsPage() {
  const { data: flags = [], isLoading } = useQuery<Feature[]>({
    queryKey: ['partner-feature-flags'],
    queryFn: () => apiFetch(`${BASE}/feature-flags/partner/${partnerId}`),
    enabled: !!partnerId,
  });

  const enabled = flags.filter((f) => f.isEnabled);
  const disabled = flags.filter((f) => !f.isEnabled);

  const byCategory = enabled.reduce<Record<string, Feature[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} /> Enabled Features
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {enabled.length} of {flags.length} features are active on your plan
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {Object.entries(byCategory).map(([category, features]) => (
            <div key={category} className="mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map((feature) => (
                  <div key={feature.code} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <span className="text-white text-sm font-medium">{feature.label}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{feature.description}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[feature.category] || 'bg-gray-700 text-gray-300'}`}>
                      {feature.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {enabled.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Zap size={40} className="mx-auto mb-3 opacity-30" />
              <p>No features are enabled yet.</p>
              <p className="text-sm mt-1">Contact your administrator to enable features.</p>
            </div>
          )}

          {disabled.length > 0 && (
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
              <p className="text-gray-500 text-sm font-medium mb-3">Not included in your plan ({disabled.length})</p>
              <div className="flex flex-wrap gap-2">
                {disabled.map((f) => (
                  <span key={f.code} className="text-xs px-2 py-1 bg-gray-700 text-gray-500 rounded">
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
