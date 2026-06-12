'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { PortalRoute } from '../types/customer-portal.types';

interface RouteCheckboxTreeProps {
  routes: PortalRoute[];
  selectedRoutes: string[];
  onChange: (routes: string[]) => void;
}

export function RouteCheckboxTree({ routes, selectedRoutes, onChange }: RouteCheckboxTreeProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    if (selectedRoutes.includes(key)) {
      onChange(selectedRoutes.filter((r) => r !== key));
    } else {
      onChange([...selectedRoutes, key]);
    }
  };

  const selectAll = () => onChange(routes.map((r) => r.key));
  const deselectAll = () => onChange([]);
  const toggleSection = (section: string) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  const selectedCount = selectedRoutes.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Routes list */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'grid', gap: 0 }}>
          {routes.map((route) => {
            const checked = selectedRoutes.includes(route.key);
            return (
              <label
                key={route.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  background: checked ? '#f0f9ff' : 'white',
                  transition: 'background 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(route.key)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-primary, #2563eb)' }}
                />
                <span style={{ color: '#6b7280' }}>
                  <Icon name={route.icon as any} size={15} />
                </span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111827' }}>
                  {route.label}
                </span>
                <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                  {route.path}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Counter + bulk actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          <strong style={{ color: '#111827' }}>{selectedCount}</strong> / {routes.length} routes selected
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={selectAll}
            style={{
              fontSize: 12, padding: '4px 10px', borderRadius: 6,
              border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', color: '#374151',
            }}
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAll}
            style={{
              fontSize: 12, padding: '4px 10px', borderRadius: 6,
              border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', color: '#374151',
            }}
          >
            Deselect All
          </button>
        </div>
      </div>
    </div>
  );
}
