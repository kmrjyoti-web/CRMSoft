'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import {
  usePortalUsers, useMenuCategories, useAvailableRoutes,
  useUpdatePortalUser, useUpdatePageOverrides, useResetPortalPassword, useDeactivatePortalUser,
} from '../hooks/useCustomerPortal';
import { PageOverrideSelector } from './PageOverrideSelector';
import { PortalMenuPreview } from './PortalMenuPreview';
import type { CustomerUser } from '../types/customer-portal.types';

export function PortalUsers() {
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null | undefined>(undefined);
  const [pendingOverrides, setPendingOverrides] = useState<Record<string, boolean>>({});
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);

  const usersQuery = usePortalUsers();
  const categoriesQuery = useMenuCategories();
  const routesQuery = useAvailableRoutes();
  const updateMut = useUpdatePortalUser();
  const overridesMut = useUpdatePageOverrides();
  const resetPwMut = useResetPortalPassword();
  const deactivateMut = useDeactivatePortalUser();

  const users = usersQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const allRoutes = routesQuery.data?.data ?? [];

  const filtered = users.filter((u) => {
    if (filterActive === 'active' && !u.isActive) return false;
    if (filterActive === 'inactive' && u.isActive) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.linkedEntityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openUser = (user: CustomerUser) => {
    setSelectedUser(user);
    setPendingCategory(user.menuCategoryId ?? null);
    setPendingOverrides(user.pageOverrides ?? {});
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setPendingCategory(undefined);
    setPendingOverrides({});
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    const updates: any[] = [];

    if (pendingCategory !== undefined && pendingCategory !== selectedUser.menuCategoryId) {
      updates.push(
        updateMut.mutateAsync({ id: selectedUser.id, dto: { menuCategoryId: pendingCategory } }),
      );
    }

    if (JSON.stringify(pendingOverrides) !== JSON.stringify(selectedUser.pageOverrides)) {
      updates.push(overridesMut.mutateAsync({ id: selectedUser.id, overrides: pendingOverrides }));
    }

    if (updates.length > 0) await Promise.all(updates);
    closeDrawer();
  };

  const handleDeactivate = async (id: string) => {
    await deactivateMut.mutateAsync(id);
    setDeactivateConfirm(null);
    closeDrawer();
  };

  const selectedCategory = categories.find((c) => c.id === (pendingCategory ?? selectedUser?.menuCategoryId));

  if (usersQuery.isLoading) {
    return (
      <div style={{ padding: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 56, background: '#f3f4f6', borderRadius: 8, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilterActive(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              border: `1px solid ${filterActive === f ? 'var(--color-primary, #2563eb)' : '#d1d5db'}`,
              background: filterActive === f ? 'var(--color-primary, #2563eb)' : 'white',
              color: filterActive === f ? 'white' : '#374151',
              fontWeight: filterActive === f ? 600 : 400,
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? `All (${users.length})` : f === 'active' ? `Active (${users.filter(u => u.isActive).length})` : `Inactive (${users.filter(u => !u.isActive).length})`}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <Icon name="search" size={14} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            style={{
              width: '100%', padding: '7px 12px 7px 32px', fontSize: 13, borderRadius: 8,
              border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Empty state */}
      {users.length === 0 && (
        <div style={{ border: '1px dashed #d1d5db', borderRadius: 12, padding: 40, textAlign: 'center' }}>
          <div style={{ color: '#9ca3af', marginBottom: 12 }}><Icon name="users" size={40} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No portal users yet</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Go to Activation to enable portal access for verified contacts and organizations.
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Entity</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 80 }}>Logins</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 80 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const cat = categories.find((c) => c.id === user.menuCategoryId);
                return (
                  <tr
                    key={user.id}
                    onClick={() => openUser(user)}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: '#dbeafe',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8',
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}>
                          {user.displayName[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{user.displayName}</div>
                          {user.isFirstLogin && (
                            <div style={{ fontSize: 10, color: '#f59e0b' }}>Never logged in</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{user.email}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 12,
                        background: user.linkedEntityType === 'CONTACT' ? '#dbeafe' : '#fce7f3',
                        color: user.linkedEntityType === 'CONTACT' ? '#1d4ed8' : '#9d174d',
                      }}>
                        {user.linkedEntityType}
                      </span>
                      <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 6 }}>{user.linkedEntityName}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {cat ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12,
                          padding: '2px 8px', borderRadius: 12,
                          background: (cat.color ?? '#2563eb') + '1a',
                          color: cat.color ?? '#2563eb',
                        }}>
                          <Icon name={(cat.icon ?? 'layout-list') as any} size={11} />
                          {cat.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>No category</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', fontSize: 13, color: '#374151' }}>
                      {user.loginCount}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <span style={{ color: user.isActive ? '#16a34a' : '#9ca3af' }}>
                        <Icon name={user.isActive ? 'check-circle' : 'x-circle'} size={16} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* User detail drawer */}
      <Drawer
        open={!!selectedUser}
        onClose={closeDrawer}
        title={`Portal User: ${selectedUser?.displayName}`}
        position="right"
        size="lg"
      >
        {selectedUser && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* User info */}
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#374151' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><span style={{ color: '#9ca3af' }}>Email:</span> {selectedUser.email}</div>
                <div><span style={{ color: '#9ca3af' }}>Linked:</span> {selectedUser.linkedEntityType} — {selectedUser.linkedEntityName}</div>
                <div><span style={{ color: '#9ca3af' }}>Logins:</span> {selectedUser.loginCount}</div>
                <div><span style={{ color: '#9ca3af' }}>Last Login:</span> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}</div>
              </div>
            </div>

            {/* Menu Category */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Menu Category
              </label>
              <select
                value={pendingCategory ?? ''}
                onChange={(e) => setPendingCategory(e.target.value || null)}
                style={{
                  width: '100%', padding: '8px 12px', fontSize: 14, borderRadius: 8,
                  border: '1px solid #d1d5db', background: 'white', cursor: 'pointer',
                }}
              >
                <option value="">— No Category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.isDefault ? ' (Default)' : ''}</option>
                ))}
              </select>
            </div>

            {/* Page overrides */}
            {allRoutes.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Page Overrides
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>
                    Override category defaults for this user only
                  </span>
                </div>
                <PageOverrideSelector
                  categoryRoutes={selectedCategory?.enabledRoutes ?? []}
                  allRoutes={allRoutes}
                  overrides={pendingOverrides}
                  onChange={setPendingOverrides}
                />
              </div>
            )}

            {/* Preview */}
            {allRoutes.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Preview</div>
                <PortalMenuPreview
                  enabledRoutes={selectedCategory?.enabledRoutes ?? []}
                  overrides={pendingOverrides}
                  allRoutes={allRoutes}
                />
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetPwMut.mutate(selectedUser.id)}
                disabled={resetPwMut.isPending}
              >
                <Icon name="key" size={13} /> Reset Password
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeactivateConfirm(selectedUser.id)}
              >
                <Icon name="user-x" size={13} /> Deactivate Portal
              </Button>
            </div>

            {/* Save/Cancel */}
            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
              <Button variant="outline" onClick={closeDrawer} style={{ flex: 1 }}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={updateMut.isPending || overridesMut.isPending}
                style={{ flex: 2 }}
              >
                {(updateMut.isPending || overridesMut.isPending) ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Deactivate confirmation */}
      {deactivateConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, maxWidth: 400, width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ color: '#ef4444' }}><Icon name="alert-triangle" size={22} /></span>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Deactivate Portal Access?</div>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              This user will no longer be able to log into the customer portal. This action can be reversed by re-activating.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline" onClick={() => setDeactivateConfirm(null)} style={{ flex: 1 }}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => handleDeactivate(deactivateConfirm)}
                disabled={deactivateMut.isPending}
                style={{ flex: 1 }}
              >
                {deactivateMut.isPending ? 'Deactivating…' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
