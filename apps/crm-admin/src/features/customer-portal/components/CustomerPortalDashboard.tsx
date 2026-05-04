'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { usePortalAnalytics, useMenuCategories } from '../hooks/useCustomerPortal';

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: color + '1a', color,
        flexShrink: 0,
      }}>
        <Icon name={icon as any} size={20} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, desc, color }: { href: string; icon: string; label: string; desc: string; color: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', border: '1px solid #e5e7eb', borderRadius: 10,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'box-shadow 0.15s',
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: color + '1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
        }}>
          <Icon name={icon as any} size={18} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{label}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{desc}</div>
        </div>
        <div style={{ marginLeft: 'auto', color: '#9ca3af' }}>
          <Icon name="chevron-right" size={14} />
        </div>
      </div>
    </Link>
  );
}

export function CustomerPortalDashboard() {
  const analyticsQuery = usePortalAnalytics();
  const categoriesQuery = useMenuCategories();

  const analytics = analyticsQuery.data?.data;
  const categories = categoriesQuery.data?.data ?? [];

  if (analyticsQuery.isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: 80, background: '#f3f4f6', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (analyticsQuery.isError) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Icon name="alert-circle" size={40} />
        <div style={{ marginTop: 12, color: '#6b7280' }}>Failed to load analytics</div>
        <Button variant="outline" onClick={() => analyticsQuery.refetch()} style={{ marginTop: 12 }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Portal Users" value={analytics?.total ?? 0} icon="users" color="#2563eb" />
        <StatCard label="Active Users" value={analytics?.active ?? 0} icon="user-check" color="#16a34a" />
        <StatCard label="Inactive Users" value={analytics?.inactive ?? 0} icon="user-x" color="#9ca3af" />
        <StatCard label="Logins Today" value={analytics?.loginsToday ?? 0} icon="log-in" color="#f59e0b" />
        <StatCard label="Menu Categories" value={categories.length} icon="layout-list" color="#7c3aed" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          <QuickAction
            href="/settings/customer-portal/activation"
            icon="unlock"
            label="Activate Portal Users"
            desc="Enable portal access for verified contacts & orgs"
            color="#2563eb"
          />
          <QuickAction
            href="/settings/customer-portal/menu-categories"
            icon="layout-list"
            label="Manage Menu Categories"
            desc="Create and configure access categories"
            color="#7c3aed"
          />
          <QuickAction
            href="/settings/customer-portal/users"
            icon="users"
            label="Manage Portal Users"
            desc="Assign categories, set page overrides"
            color="#16a34a"
          />
        </div>
      </div>

      {/* Recent Logins */}
      {(analytics?.recentLogs?.length ?? 0) > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Recent Activity
          </h3>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>User ID</th>
                  <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                  <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Route</th>
                  <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {analytics!.recentLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
                      {log.customerUserId.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 12,
                        background: log.action === 'LOGIN' ? '#dbeafe' : '#f3f4f6',
                        color: log.action === 'LOGIN' ? '#1d4ed8' : '#374151',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: '#374151' }}>
                      {log.route ?? '—'}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: '#9ca3af' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {analytics?.total === 0 && (
        <div style={{
          background: 'white', border: '1px dashed #d1d5db', borderRadius: 12,
          padding: 40, textAlign: 'center',
        }}>
          <div style={{ color: '#9ca3af', marginBottom: 12 }}>
            <Icon name="lock" size={40} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            No portal users yet
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            Activate portal access for verified contacts and organizations.
          </div>
          <Link href="/settings/customer-portal/activation">
            <Button variant="primary">
              <Icon name="unlock" size={14} /> Activate First User
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
