'use client';

import { useState, useEffect, useCallback } from 'react';
import { Palette, Plus, ToggleLeft, ToggleRight, Edit2, Globe, Mail } from 'lucide-react';
import { api } from '@/lib/api';

type BrandConfig = {
  id: string;
  brandCode: string;
  brandName: string;
  displayName: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  contactEmail?: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  logoUrl?: string;
  partners: { partnerCode: string; partnerName: string; isActive: boolean }[];
};

export default function BrandConfigPage() {
  const [configs, setConfigs] = useState<BrandConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BrandConfig | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.brandConfig.list()) as any;
      setConfigs(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = async (brandCode: string) => {
    await api.brandConfig.toggle(brandCode);
    fetchData();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9] flex items-center gap-2">
            <Palette className="w-4 h-4" /> Brand Visual Config
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Configure visual identity for each deployed brand — colors, logos, domains
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Brand
        </button>
      </div>

      {configs.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
          <Palette className="w-8 h-8 text-[#8b949e] mx-auto mb-3" />
          <p className="text-[#8b949e] text-sm">No brand configs yet.</p>
          <p className="text-[#484f58] text-xs mt-1">
            Seed data: run <code className="bg-[#21262d] px-1 rounded">ts-node prisma/seed/platform-console-seed.ts</code>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map(config => (
            <div
              key={config.brandCode}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/40 transition-colors"
            >
              {/* Color swatch + toggle */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ backgroundColor: config.primaryColor ?? '#1976d2' }}
                >
                  {config.brandName[0]}
                </div>
                <button onClick={() => toggle(config.brandCode)} title="Toggle active">
                  {config.isActive
                    ? <ToggleRight className="w-6 h-6 text-green-400" />
                    : <ToggleLeft className="w-6 h-6 text-[#8b949e]" />}
                </button>
              </div>

              <h3 className="font-semibold text-[#c9d1d9]">{config.brandName}</h3>
              <p className="text-xs text-[#8b949e] font-mono mt-0.5">{config.brandCode}</p>

              <div className="mt-3 space-y-1.5 text-xs text-[#8b949e]">
                {config.domain && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    <span>{config.domain}</span>
                  </div>
                )}
                {config.contactEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    <span>{config.contactEmail}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-[#21262d] flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-[#30363d]"
                    style={{ backgroundColor: config.primaryColor ?? '#1976d2' }}
                    title="Primary"
                  />
                  {config.secondaryColor && (
                    <div
                      className="w-4 h-4 rounded-full border border-[#30363d]"
                      style={{ backgroundColor: config.secondaryColor }}
                      title="Secondary"
                    />
                  )}
                  <span className="text-[#484f58] ml-1">
                    {config.partners?.length ?? 0} partners
                  </span>
                </div>
                <button
                  onClick={() => { setEditing(config); setShowForm(true); }}
                  className="p-1 text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {config.isDefault && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-900/50 text-yellow-400 border border-yellow-800 text-xs rounded">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BrandConfigModal
          config={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={() => { setShowForm(false); setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function BrandConfigModal({
  config,
  onClose,
  onSave,
}: {
  config: BrandConfig | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    brandCode: config?.brandCode ?? '',
    brandName: config?.brandName ?? '',
    displayName: config?.displayName ?? '',
    primaryColor: config?.primaryColor ?? '#1976d2',
    secondaryColor: config?.secondaryColor ?? '#dc004e',
    domain: config?.domain ?? '',
    contactEmail: config?.contactEmail ?? '',
    description: config?.description ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.brandCode || !form.brandName || !form.displayName) {
      setError('Brand code, name, and display name are required');
      return;
    }
    setLoading(true);
    try {
      if (config) {
        await api.brandConfig.update(config.brandCode, form as any);
      } else {
        await api.brandConfig.create(form as any);
      }
      onSave();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save brand config');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-base font-semibold text-[#c9d1d9] mb-4">
          {config ? 'Edit' : 'Add'} Brand Config
        </h2>

        <div className="space-y-3">
          {['brandCode', 'brandName', 'displayName', 'domain', 'contactEmail', 'description'].map(key => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#8b949e] mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
                {['brandCode', 'brandName', 'displayName'].includes(key) ? ' *' : ''}
              </label>
              <input
                type={key === 'contactEmail' ? 'email' : 'text'}
                disabled={key === 'brandCode' && !!config}
                className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-sm text-[#c9d1d9] placeholder-[#484f58] disabled:opacity-50 focus:outline-none focus:border-[#58a6ff]"
                value={(form as any)[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {(['primaryColor', 'secondaryColor'] as const).map(key => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#8b949e] mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-10 h-9 rounded border border-[#30363d] bg-[#21262d] cursor-pointer"
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                  <span className="text-xs text-[#8b949e] font-mono">{form[key]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#238636] text-white py-2 rounded text-sm hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : config ? 'Update' : 'Create'}
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
