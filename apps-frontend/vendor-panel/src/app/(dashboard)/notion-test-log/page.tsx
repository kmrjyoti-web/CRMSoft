'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, RefreshCw, UploadCloud, ExternalLink, Search, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotionTestLogModules, useSyncModuleStatus, useSyncAllModules } from '@/hooks/use-notion-test-log';
import type { ModuleTestStatus, TestLogStatus } from '@/lib/api/notion-test-log';
import { formatDateTime } from '@/lib/utils';

const STATUS_OPTIONS: TestLogStatus[] = ['Not Started', 'In Progress', 'Done', 'Blocked'];

const STATUS_CLASS: Record<string, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done': 'bg-green-100 text-green-700',
  'Blocked': 'bg-red-100 text-red-700',
};

const SYNC_STATE_CLASS: Record<string, string> = {
  synced: 'bg-green-100 text-green-700',
  not_synced: 'bg-gray-100 text-gray-500',
};

function ModuleRow({ mod, onSync }: { mod: ModuleTestStatus; onSync: (data: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<TestLogStatus>((mod.notionStatus as TestLogStatus) ?? 'Not Started');
  const [notes, setNotes] = useState('');

  const handleSync = () => {
    onSync({ moduleId: mod.moduleId, moduleName: mod.moduleName, status, notes });
    setEditing(false);
  };

  return (
    <div className="py-3 px-4 flex items-center gap-4 hover:bg-gray-50">
      {/* Module Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{mod.moduleName}</p>
        {mod.category && <p className="text-xs text-gray-400">{mod.category}</p>}
      </div>

      {/* Status */}
      <div className="w-32 shrink-0">
        {editing ? (
          <select
            className="text-xs border rounded px-2 py-1 bg-white w-full"
            value={status}
            onChange={e => setStatus(e.target.value as TestLogStatus)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CLASS[mod.notionStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            {mod.notionStatus || 'Not Started'}
          </span>
        )}
      </div>

      {/* Sync State */}
      <div className="w-20 shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full ${SYNC_STATE_CLASS[mod.syncState]}`}>
          {mod.syncState === 'synced' ? 'Synced' : 'Not Synced'}
        </span>
      </div>

      {/* Last Synced */}
      <div className="w-28 shrink-0 text-xs text-gray-400">
        {mod.lastSyncedAt ? formatDateTime(mod.lastSyncedAt) : '—'}
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {editing ? (
          <>
            <Input
              className="text-xs h-7 w-32"
              placeholder="Notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Button size="sm" className="h-7 text-xs" onClick={handleSync}>Save</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(true)}>
              Update
            </Button>
            {mod.notionUrl && (
              <a href={mod.notionUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function NotionTestLogPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: res, isLoading, refetch } = useNotionTestLogModules();
  const syncMutation = useSyncModuleStatus();
  const syncAllMutation = useSyncAllModules();

  const allModules: ModuleTestStatus[] = res?.data ?? [];

  const filtered = allModules.filter(m => {
    const matchesSearch = !search || m.moduleName.toLowerCase().includes(search.toLowerCase()) || m.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || m.notionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const doneCount = allModules.filter(m => m.notionStatus === 'Done').length;
  const inProgressCount = allModules.filter(m => m.notionStatus === 'In Progress').length;
  const blockedCount = allModules.filter(m => m.notionStatus === 'Blocked').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Notion Test Log
          </h1>
          <p className="text-sm text-gray-500">Developer checklist — track each module's test status in Notion</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => syncAllMutation.mutate({})}
            disabled={syncAllMutation.isPending}
          >
            <UploadCloud className="h-4 w-4 mr-1" />
            {syncAllMutation.isPending ? 'Syncing...' : 'Sync All to Notion'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Modules', value: allModules.length, class: 'text-gray-700' },
          { label: 'Done', value: doneCount, class: 'text-green-600' },
          { label: 'In Progress', value: inProgressCount, class: 'text-blue-600' },
          { label: 'Blocked', value: blockedCount, class: 'text-red-600' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.class}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notion Config Hint */}
      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700 flex items-center justify-between">
        <span>Configure your Notion integration token and database in Settings → Notion to enable sync.</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-600"
          onClick={() => router.push('/settings')}
        >
          Configure
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search module or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="text-sm border rounded-md px-3 py-2 bg-white text-gray-700"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span className="flex-1">Module</span>
            <span className="w-32">Status</span>
            <span className="w-20">Sync State</span>
            <span className="w-28">Last Synced</span>
            <span className="w-40">Actions</span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No modules found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(mod => (
                <ModuleRow
                  key={mod.moduleId}
                  mod={mod}
                  onSync={data => syncMutation.mutate(data)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
