'use client';

import { useMemo, useCallback } from 'react';

import toast from 'react-hot-toast';

import { TableFull } from '@/components/ui';

import { TableSkeleton } from '@/components/common/TableSkeleton';
import { HelpButton } from '@/components/common/HelpButton';

import { useEntityPanel } from '@/hooks/useEntityPanel';

import {
  useEmailAccounts,
  useDisconnectEmail,
  useSyncEmail,
} from '../hooks/useEmailConfig';

import { EmailConfigForm } from './EmailConfigForm';
import { EmailConfigUserHelp } from '../help/EmailConfigUserHelp';
import { EmailConfigDevHelp } from '../help/EmailConfigDevHelp';

import type { EmailAccount } from '../types/email-config.types';

// ── Columns ──────────────────────────────────────────────

const EMAIL_COLUMNS = [
  { id: 'emailAddress', label: 'Email', visible: true },
  { id: 'provider', label: 'Provider', visible: true },
  { id: 'displayName', label: 'Display Name', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'totalSent', label: 'Sent', visible: true },
  { id: 'totalReceived', label: 'Received', visible: true },
  { id: 'lastSyncAt', label: 'Last Sync', visible: true },
  { id: 'isDefault', label: 'Default', visible: false },
  { id: 'createdAt', label: 'Created', visible: false },
];

// ── Status colors ────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: '#E8F8EE', text: '#16A34A' },
  DISCONNECTED: { bg: '#F3F4F6', text: '#6B7280' },
  ERROR: { bg: '#FDE8E8', text: '#DC2626' },
  TOKEN_EXPIRED: { bg: '#FEF3C7', text: '#D97706' },
  SYNCING: { bg: '#EBF5FF', text: '#2563EB' },
};

// ── Provider labels ──────────────────────────────────────

const PROVIDER_LABELS: Record<string, string> = {
  GMAIL: 'Gmail',
  OUTLOOK: 'Outlook',
  IMAP_SMTP: 'IMAP/SMTP',
  ORGANIZATION_SMTP: 'Org SMTP',
};

// ── Filter config ────────────────────────────────────────

const EMAIL_FILTER_CONFIG = {
  sections: [
    {
      title: 'Email Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'DISCONNECTED', label: 'Disconnected' },
            { value: 'ERROR', label: 'Error' },
            { value: 'TOKEN_EXPIRED', label: 'Token Expired' },
          ],
        },
        {
          columnId: 'provider',
          label: 'Provider',
          filterType: 'master' as const,
          queryParam: 'provider',
          options: [
            { value: 'GMAIL', label: 'Gmail' },
            { value: 'OUTLOOK', label: 'Outlook' },
            { value: 'IMAP_SMTP', label: 'IMAP/SMTP' },
          ],
        },
      ],
    },
  ],
};

// ── Component ────────────────────────────────────────────

export function EmailConfigList() {
  const { data: response, isLoading } = useEmailAccounts();
  const disconnectMutation = useDisconnectEmail();
  const syncMutation = useSyncEmail();

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: 'email-config',
    entityLabel: 'Email Account',
    FormComponent: EmailConfigForm,
    idProp: 'emailAccountId',
    editRoute: '/settings/email/:id',
    createRoute: '/settings/email/new',
    displayField: 'emailAddress',
  });

  const records = useMemo(() => {
    const raw = (response as any)?.data ?? response ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [response]);

  const tableData = useMemo(
    () =>
      records.map((acc: EmailAccount) => ({
        id: acc.id,
        emailAddress: acc.emailAddress,
        provider: PROVIDER_LABELS[acc.provider] ?? acc.provider,
        displayName: acc.displayName ?? '—',
        status: acc.status,
        totalSent: acc.totalSent,
        totalReceived: acc.totalReceived,
        lastSyncAt: acc.lastSyncAt
          ? new Date(acc.lastSyncAt).toLocaleString()
          : '—',
        isDefault: acc.isDefault ? 'Yes' : 'No',
        createdAt: acc.createdAt
          ? new Date(acc.createdAt).toLocaleDateString()
          : '—',
      })),
    [records],
  );

  const handleDisconnect = useCallback(
    async (row: any) => {
      if (!confirm(`Disconnect email account "${row.emailAddress}"?`)) return;
      try {
        await disconnectMutation.mutateAsync(row.id);
        toast.success('Email account disconnected');
      } catch {
        toast.error('Failed to disconnect');
      }
    },
    [disconnectMutation],
  );

  const handleSync = useCallback(
    async (row: any) => {
      try {
        await syncMutation.mutateAsync(row.id);
        toast.success('Sync triggered');
      } catch {
        toast.error('Failed to trigger sync');
      }
    },
    [syncMutation],
  );

  if (isLoading) return <TableSkeleton title="Email Accounts" />;

  return (
    <TableFull
      title="Email Accounts"
      tableKey="email-accounts"
      data={tableData}
      columns={EMAIL_COLUMNS}
      defaultViewMode="table"
      defaultDensity="comfortable"
      filterConfig={EMAIL_FILTER_CONFIG}
      onRowEdit={handleRowEdit}
      onRowDelete={handleDisconnect}
      onCreate={handleCreate}
      headerActions={
        <HelpButton
          panelId="email-config-help"
          title="Email Config — Help"
          userContent={<EmailConfigUserHelp />}
          devContent={<EmailConfigDevHelp />}
        />
      }
    />
  );
}
