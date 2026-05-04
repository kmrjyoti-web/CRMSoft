'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Database,
  Search,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Play,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDate, formatNumber } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── types ───────────────────────────────────────────────────────────
type DbStrategy = 'GLOBAL' | 'INDEPENDENT';
type DbStatus = 'HEALTHY' | 'NEEDS_REPAIR' | 'MIGRATING';

interface TenantDb {
  id: string;
  tenantName: string;
  strategy: DbStrategy;
  sizeMb: number;
  lastBackup: string;
  migrationsApplied: number;
  migrationsPending: number;
  status: DbStatus;
}

// ── constants ───────────────────────────────────────────────────────
const STRATEGY_COLOR: Record<DbStrategy, 'info' | 'default'> = {
  GLOBAL: 'info',
  INDEPENDENT: 'default',
};

const STATUS_STYLE: Record<DbStatus, string> = {
  HEALTHY: 'bg-green-100 text-green-800',
  NEEDS_REPAIR: 'bg-red-100 text-red-800',
  MIGRATING: 'bg-yellow-100 text-yellow-800',
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'HEALTHY', label: 'Healthy' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
  { value: 'MIGRATING', label: 'Migrating' },
];

// ── mock data ───────────────────────────────────────────────────────
const mockDbs: TenantDb[] = [
  { id: '1', tenantName: 'Acme Corp', strategy: 'INDEPENDENT', sizeMb: 2450, lastBackup: '2026-03-09T06:00:00Z', migrationsApplied: 48, migrationsPending: 0, status: 'HEALTHY' },
  { id: '2', tenantName: 'TechFlow Inc', strategy: 'GLOBAL', sizeMb: 890, lastBackup: '2026-03-09T06:00:00Z', migrationsApplied: 48, migrationsPending: 0, status: 'HEALTHY' },
  { id: '3', tenantName: 'GreenLeaf', strategy: 'GLOBAL', sizeMb: 620, lastBackup: '2026-03-08T06:00:00Z', migrationsApplied: 46, migrationsPending: 2, status: 'NEEDS_REPAIR' },
  { id: '4', tenantName: 'DataBridge', strategy: 'INDEPENDENT', sizeMb: 3100, lastBackup: '2026-03-09T06:00:00Z', migrationsApplied: 47, migrationsPending: 1, status: 'MIGRATING' },
  { id: '5', tenantName: 'SkyHigh SaaS', strategy: 'GLOBAL', sizeMb: 540, lastBackup: '2026-03-09T06:00:00Z', migrationsApplied: 48, migrationsPending: 0, status: 'HEALTHY' },
  { id: '6', tenantName: 'PulseWave', strategy: 'INDEPENDENT', sizeMb: 1870, lastBackup: '2026-03-09T06:00:00Z', migrationsApplied: 48, migrationsPending: 0, status: 'HEALTHY' },
  { id: '7', tenantName: 'NovaEdge', strategy: 'GLOBAL', sizeMb: 380, lastBackup: '2026-03-07T06:00:00Z', migrationsApplied: 45, migrationsPending: 3, status: 'NEEDS_REPAIR' },
  { id: '8', tenantName: 'ZenithLabs', strategy: 'INDEPENDENT', sizeMb: 1650, lastBackup: '2026-03-09T06:00:00Z', migrationsApplied: 48, migrationsPending: 0, status: 'HEALTHY' },
];

const topBySize = [...mockDbs]
  .sort((a, b) => b.sizeMb - a.sizeMb)
  .slice(0, 10)
  .map((d) => ({ tenant: d.tenantName, sizeMb: d.sizeMb }));

// ── component ───────────────────────────────────────────────────────
export default function DbAdminPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = mockDbs.filter((db) => {
    if (debouncedSearch && !db.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (statusFilter && db.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: mockDbs.length,
    healthy: mockDbs.filter((d) => d.status === 'HEALTHY').length,
    needsRepair: mockDbs.filter((d) => d.status === 'NEEDS_REPAIR').length,
    migrating: mockDbs.filter((d) => d.status === 'MIGRATING').length,
  };

  const handleAction = (action: string, tenantName: string) => {
    if (!confirm(`${action} database for ${tenantName}?`)) return;
    toast.success(`${action} initiated for ${tenantName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Database Administration</h1>
        <p className="text-sm text-gray-500">Monitor and manage tenant databases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Databases', value: stats.total, icon: Database, color: 'text-blue-600 bg-blue-50' },
          { label: 'Healthy', value: stats.healthy, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Needs Repair', value: stats.needsRepair, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Migrating', value: stats.migrating, icon: RotateCcw, color: 'text-yellow-600 bg-yellow-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Database} title="No databases found" description="No databases match your filters" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="p-3 font-medium">Tenant</th>
                    <th className="p-3 font-medium">Strategy</th>
                    <th className="p-3 font-medium text-right">Size (MB)</th>
                    <th className="p-3 font-medium">Last Backup</th>
                    <th className="p-3 font-medium text-center">Migrations</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((db) => (
                    <tr key={db.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{db.tenantName}</td>
                      <td className="p-3">
                        <Badge variant={STRATEGY_COLOR[db.strategy]}>{db.strategy}</Badge>
                      </td>
                      <td className="p-3 text-right font-mono">{formatNumber(db.sizeMb)}</td>
                      <td className="p-3 text-gray-500">{formatDate(db.lastBackup)}</td>
                      <td className="p-3 text-center">
                        <span className="font-mono">{db.migrationsApplied}</span>
                        {db.migrationsPending > 0 && (
                          <Badge variant="warning" className="ml-1">{db.migrationsPending} pending</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[db.status]}`}>
                          {db.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          {db.migrationsPending > 0 && (
                            <Button size="sm" variant="outline" onClick={() => handleAction('Run Migration', db.tenantName)}>
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {db.status === 'NEEDS_REPAIR' && (
                            <Button size="sm" variant="outline" onClick={() => handleAction('Repair', db.tenantName)}>
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleAction('Backup', db.tenantName)}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-gray-400" />
            Top Tenants by Database Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topBySize}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tenant" fontSize={11} angle={-15} textAnchor="end" height={60} />
              <YAxis fontSize={12} tickFormatter={(v: number) => `${v} MB`} />
              <Tooltip formatter={((v: number) => `${formatNumber(v)} MB`) as never} />
              <Bar dataKey="sizeMb" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Size (MB)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
