'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import {
  useEligibleEntities, useActivatePortal, useMenuCategories,
} from '../hooks/useCustomerPortal';
import { ActivationDialog } from './ActivationDialog';
import type { EligibleEntity, ActivatePortalDto } from '../types/customer-portal.types';

type FilterType = 'ALL' | 'CONTACT' | 'ORGANIZATION';

export function PortalActivation() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<EligibleEntity | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const eligibleQuery = useEligibleEntities();
  const categoriesQuery = useMenuCategories();
  const activateMut = useActivatePortal();

  const eligible = eligibleQuery.data?.data;
  const allEntities: EligibleEntity[] = [
    ...(eligible?.contacts ?? []),
    ...(eligible?.organizations ?? []),
  ];

  const filtered = allEntities.filter((e) => {
    if (filter !== 'ALL' && e.type !== filter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleActivate = async (dto: ActivatePortalDto) => {
    const res = await activateMut.mutateAsync(dto);
    if (res.data?.temporaryPassword) {
      setTempPassword(res.data.temporaryPassword);
    }
  };

  const closeDrawer = () => {
    setSelectedEntity(null);
    setTempPassword(null);
  };

  if (eligibleQuery.isLoading) {
    return (
      <div style={{ padding: 24 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ height: 56, background: '#f3f4f6', borderRadius: 8, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  if (eligibleQuery.isError) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ color: '#6b7280', marginBottom: 12 }}>Failed to load eligible entities</div>
        <Button variant="outline" onClick={() => eligibleQuery.refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['ALL', 'CONTACT', 'ORGANIZATION'] as FilterType[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              border: `1px solid ${filter === f ? 'var(--color-primary, #2563eb)' : '#d1d5db'}`,
              background: filter === f ? 'var(--color-primary, #2563eb)' : 'white',
              color: filter === f ? 'white' : '#374151',
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f === 'ALL' ? 'All' : f === 'CONTACT' ? 'Contacts' : 'Organizations'}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <Icon name="search" size={14} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            style={{
              width: '100%', padding: '7px 12px 7px 32px', fontSize: 13, borderRadius: 8,
              border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, fontSize: 13, color: '#6b7280' }}>
        <span>Total: <strong style={{ color: '#111827' }}>{allEntities.length}</strong></span>
        <span>Activated: <strong style={{ color: '#16a34a' }}>{allEntities.filter(e => e.activated).length}</strong></span>
        <span>Pending: <strong style={{ color: '#f59e0b' }}>{allEntities.filter(e => !e.activated).length}</strong></span>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 120 }}>Type</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 140 }}>Status</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 140 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  {search || filter !== 'ALL' ? 'No matching entities' : 'No verified entities found'}
                </td>
              </tr>
            ) : (
              filtered.map((entity) => (
                <tr key={`${entity.type}-${entity.id}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#9ca3af' }}>
                        <Icon name={entity.type === 'ORGANIZATION' ? 'building-2' : 'user'} size={16} />
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{entity.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 12,
                      background: entity.type === 'CONTACT' ? '#dbeafe' : '#fce7f3',
                      color: entity.type === 'CONTACT' ? '#1d4ed8' : '#9d174d',
                    }}>
                      {entity.type}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {entity.activated ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a' }}>
                        <Icon name="check-circle" size={13} /> Active
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9ca3af' }}>
                        <Icon name="circle" size={13} /> Not activated
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                    {!entity.activated ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedEntity(entity)}
                      >
                        <Icon name="unlock" size={12} /> Activate
                      </Button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>✅ Active</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Activation Drawer */}
      <Drawer
        open={!!selectedEntity}
        onClose={closeDrawer}
        title={tempPassword ? 'Activation Successful' : `Activate Portal — ${selectedEntity?.name}`}
        position="right"
        size="md"
      >
        {selectedEntity && (
          <ActivationDialog
            entity={selectedEntity}
            categories={categoriesQuery.data?.data ?? []}
            onConfirm={handleActivate}
            onCancel={closeDrawer}
            isLoading={activateMut.isPending}
            tempPassword={tempPassword}
          />
        )}
      </Drawer>
    </div>
  );
}
