'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Industry {
  code: string;
  name: string;
  icon?: string;
}

interface IndustrySelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  showAll?: boolean; // show "All Industries" option
}

export function IndustrySelect({ value, onChange, label = 'Industry', showAll = true }: IndustrySelectProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);

  useEffect(() => {
    apiClient.get('/business-types?activeOnly=false')
      .then(res => {
        const list = res?.data?.data || res?.data || [];
        const items = Array.isArray(list) ? list : [];
        setIndustries(items.map((bt: { typeCode: string; typeName: string; icon?: string }) => ({
          code: bt.typeCode,
          name: bt.typeName,
          icon: bt.icon,
        })));
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <select
        value={value || 'all'}
        onChange={e => onChange(e.target.value === 'all' ? null : e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {showAll && <option value="all">All Industries</option>}
        {industries.map(ind => (
          <option key={ind.code} value={ind.code}>
            {ind.name}
          </option>
        ))}
      </select>
    </div>
  );
}
