'use client';

import { Icon } from '@/components/ui/Icon';
import type { PortalRoute } from '../types/customer-portal.types';

type OverrideValue = 'none' | 'show' | 'hide';

interface PageOverrideSelectorProps {
  categoryRoutes: string[];
  allRoutes: PortalRoute[];
  overrides: Record<string, boolean>;
  onChange: (overrides: Record<string, boolean>) => void;
}

function getOverrideValue(key: string, overrides: Record<string, boolean>): OverrideValue {
  if (!(key in overrides)) return 'none';
  return overrides[key] ? 'show' : 'hide';
}

function overrideBadge(v: OverrideValue, categoryEnabled: boolean) {
  if (v === 'show') return { bg: '#dcfce7', color: '#16a34a', label: 'Force Show' };
  if (v === 'hide') return { bg: '#fee2e2', color: '#dc2626', label: 'Force Hide' };
  return { bg: '#f3f4f6', color: '#6b7280', label: 'No Override' };
}

export function PageOverrideSelector({
  categoryRoutes,
  allRoutes,
  overrides,
  onChange,
}: PageOverrideSelectorProps) {
  const setOverride = (key: string, value: OverrideValue) => {
    const next = { ...overrides };
    if (value === 'none') {
      delete next[key];
    } else {
      next[key] = value === 'show';
    }
    onChange(next);
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 140px 160px',
        background: '#f9fafb', borderBottom: '2px solid #e5e7eb',
        padding: '8px 14px',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Page
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Category Default
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Override
        </span>
      </div>

      {allRoutes.map((route) => {
        const categoryEnabled = categoryRoutes.includes(route.key);
        const overrideVal = getOverrideValue(route.key, overrides);
        const badge = overrideBadge(overrideVal, categoryEnabled);

        return (
          <div
            key={route.key}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 160px',
              alignItems: 'center', padding: '9px 14px',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            {/* Page name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#6b7280' }}><Icon name={route.icon as any} size={14} /></span>
              <span style={{ fontSize: 13, color: '#374151' }}>{route.label}</span>
            </div>

            {/* Category default */}
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, padding: '2px 8px', borderRadius: 12,
                background: categoryEnabled ? '#dcfce7' : '#fee2e2',
                color: categoryEnabled ? '#16a34a' : '#dc2626',
              }}>
                <Icon name={categoryEnabled ? 'check' : 'x'} size={10} />
                {categoryEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Override selector */}
            <select
              value={overrideVal}
              onChange={(e) => setOverride(route.key, e.target.value as OverrideValue)}
              style={{
                fontSize: 12, padding: '4px 8px', borderRadius: 6,
                border: `1px solid ${badge.bg === '#f3f4f6' ? '#d1d5db' : badge.color}`,
                background: badge.bg, color: badge.color,
                cursor: 'pointer', fontWeight: 500,
              }}
            >
              <option value="none">No Override</option>
              <option value="show">Force Show</option>
              <option value="hide">Force Hide</option>
            </select>
          </div>
        );
      })}
    </div>
  );
}
