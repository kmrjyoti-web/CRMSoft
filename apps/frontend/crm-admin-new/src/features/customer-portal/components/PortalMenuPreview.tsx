'use client';

import { Icon } from '@/components/ui/Icon';
import type { PortalRoute } from '../types/customer-portal.types';

interface PortalMenuPreviewProps {
  enabledRoutes: string[];
  overrides?: Record<string, boolean>;
  allRoutes: PortalRoute[];
}

export function PortalMenuPreview({ enabledRoutes, overrides = {}, allRoutes }: PortalMenuPreviewProps) {
  // Resolve final visible routes: category enables it, overrides may force show/hide
  const visibleRoutes = allRoutes.filter((route) => {
    if (route.key in overrides) return overrides[route.key];
    return enabledRoutes.includes(route.key);
  });

  const isForceShown = (key: string) => key in overrides && overrides[key] === true && !enabledRoutes.includes(key);
  const isForcedHidden = (key: string) => key in overrides && overrides[key] === false;

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
      maxWidth: 240, fontSize: 13,
    }}>
      {/* Preview header */}
      <div style={{
        background: 'var(--color-primary, #2563eb)', color: 'white',
        padding: '10px 14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
      }}>
        <Icon name="layout-dashboard" size={13} />
        {' '}Customer Portal Preview
      </div>

      {/* Menu items */}
      <div style={{ background: '#1e293b' }}>
        {visibleRoutes.map((route) => {
          const forced = isForceShown(route.key);
          return (
            <div
              key={route.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderBottom: '1px solid #334155',
                color: '#e2e8f0',
              }}
            >
              <span style={{ color: '#94a3b8' }}><Icon name={route.icon as any} size={14} /></span>
              <span style={{ flex: 1 }}>{route.label}</span>
              {forced && (
                <span style={{ fontSize: 9, background: '#166534', color: '#86efac', padding: '1px 5px', borderRadius: 4 }}>
                  Override
                </span>
              )}
            </div>
          );
        })}

        {visibleRoutes.length === 0 && (
          <div style={{ padding: '16px 14px', color: '#64748b', fontSize: 12, textAlign: 'center' }}>
            No pages enabled
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div style={{ background: '#f8fafc', padding: '8px 14px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 11, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>{visibleRoutes.length} pages visible</span>
          {Object.keys(overrides).length > 0 && (
            <span style={{ color: '#f59e0b' }}>
              {Object.keys(overrides).length} override{Object.keys(overrides).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
