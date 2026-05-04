'use client';

import { useState } from 'react';
import { Database, CheckCircle, XCircle, Clock, Plus, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function useBackups() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: () => apiClient.get('/ops/backup').then(r => (r.data as any).data),
  });
}

function useBackupCheck() {
  return useQuery({
    queryKey: ['backup-check'],
    queryFn: () => apiClient.post('/ops/backup/check').then(r => (r.data as any).data),
    refetchOnWindowFocus: false,
  });
}

function useCreateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dbUrl: string) =>
      apiClient.post('/ops/backup/create', { dbUrl }).then(r => (r.data as any).data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['backups'] }),
  });
}

function useValidateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/ops/backup/validate/${id}`).then(r => (r.data as any).data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['backups'] }),
  });
}

const VALIDATED_BADGE = (
  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
    <CheckCircle className="h-3 w-3" /> Validated
  </span>
);

const UNVALIDATED_BADGE = (
  <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
    <Clock className="h-3 w-3" /> Pending
  </span>
);

export default function DatabasePage() {
  const [dbUrl, setDbUrl] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: backups, isLoading: backupsLoading } = useBackups();
  const { data: backupCheck } = useBackupCheck();
  const createBackup = useCreateBackup();
  const validateBackup = useValidateBackup();

  const backupList = backups?.data ?? [];

  const handleCreate = async () => {
    if (!dbUrl.trim()) {
      toast.error('Enter a database URL');
      return;
    }
    try {
      await createBackup.mutateAsync(dbUrl.trim());
      toast.success('Backup created successfully');
      setDbUrl('');
      setShowCreateForm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create backup');
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await validateBackup.mutateAsync(id);
      toast.success('Backup validated');
    } catch {
      toast.error('Validation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold">Database Backups</h1>
            <p className="text-sm text-gray-500">Manage backups required for safe automated testing</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(v => !v)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Backup
        </Button>
      </div>

      {/* Safety status banner */}
      {backupCheck && (
        <div className={`rounded-lg p-4 flex items-center gap-3 ${backupCheck.hasValidBackup ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          {backupCheck.hasValidBackup ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Valid backup available for safe testing</p>
                <p className="text-xs text-green-600">Database: {backupCheck.dbName} · Backed up: {new Date(backupCheck.createdAt).toLocaleDateString()}</p>
              </div>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">No validated backup — live DB tests are blocked</p>
                <p className="text-xs text-amber-600">Create and validate a backup before running tests against live database.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Create backup form */}
      {showCreateForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Backup via pg_dump</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Database URL</label>
              <Input
                type="password"
                placeholder="postgresql://user:password@host:5432/dbname"
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
              />
              <p className="text-xs text-gray-400">Connection string for the database to back up. Requires pg_dump on server.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={createBackup.isPending}>
                {createBackup.isPending ? 'Creating...' : 'Create Backup'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Backup Records
            <span className="text-sm font-normal text-gray-500">{backupList.length} record(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backupsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : backupList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No backup records. Create a backup to enable safe testing.</p>
            </div>
          ) : (
            <div className="divide-y">
              {backupList.map((backup: any) => (
                <div key={backup.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{backup.dbName}</span>
                      {backup.isValidated ? VALIDATED_BADGE : UNVALIDATED_BADGE}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(backup.createdAt).toLocaleString()} ·{' '}
                      {backup.sizeBytes ? `${Math.round(Number(backup.sizeBytes) / 1024)} KB` : '—'} ·{' '}
                      {backup.tableCount ? `${backup.tableCount} tables` : '—'}
                    </p>
                    {backup.checksum && (
                      <p className="text-xs text-gray-300 font-mono mt-0.5 truncate max-w-xs">
                        SHA-256: {backup.checksum.substring(0, 16)}...
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {!backup.isValidated && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleValidate(backup.id)}
                        disabled={validateBackup.isPending}
                        className="text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info panel */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            DB Safety Protocol
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Automated + Scheduled tests <strong>never</strong> run on live DB — they use isolated test databases</li>
            <li>• Live DB manual tests require a validated backup within the last 24 hours</li>
            <li>• Test databases are automatically cleaned up after 24-hour retention</li>
            <li>• Backup validation verifies SHA-256 checksum integrity before provisioning</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
