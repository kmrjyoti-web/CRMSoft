'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Shield } from 'lucide-react';
import { api } from '@/lib/api';

type Partner = {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  description?: string;
  ownerEmail: string;
  licenseLevel?: string;
  licenseExpiry?: string;
  isActive: boolean;
};

export default function GovernancePartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.pcConfig.partners() as Partner[];
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
          <Users className="w-4 h-4 text-[#58a6ff]" />
          Partners
        </h2>
        <p className="text-xs text-console-muted mt-0.5">
          Layer 1 of the cascade — top-level license holders
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No partners found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Owner Email</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">License</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr key={p.id} className={i < partners.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#58a6ff] px-1.5 py-0.5 rounded">{p.code}</span>
                    <span className="ml-1.5 text-xs text-console-muted">/{p.shortCode}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-console-muted">
                      <Mail className="w-3 h-3" />{p.ownerEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.licenseLevel ? (
                      <span className="flex items-center gap-1 text-xs text-console-muted">
                        <Shield className="w-3 h-3" />{p.licenseLevel}
                      </span>
                    ) : (
                      <span className="text-xs text-console-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
