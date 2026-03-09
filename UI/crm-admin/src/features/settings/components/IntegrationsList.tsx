'use client';

import { useMemo, useCallback, useState } from 'react';

import toast from 'react-hot-toast';

import { TableFull, Button, Icon, Badge } from '@/components/ui';

import { TableSkeleton } from '@/components/common/TableSkeleton';

import { useEntityPanel } from '@/hooks/useEntityPanel';

import {
  useCredentials,
  useCredentialStatusSummary,
  useRevokeCredential,
  useVerifyCredential,
} from '../hooks/useIntegrations';

import { IntegrationCredentialForm } from './IntegrationCredentialForm';

import type { CredentialItem, CredentialStatus } from '../types/integrations.types';

// ── Columns ──────────────────────────────────────────────

const INTEGRATION_COLUMNS = [
  { id: 'provider', label: 'Provider', visible: true },
  { id: 'instanceName', label: 'Instance', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'linkedAccountEmail', label: 'Linked Email', visible: true },
  { id: 'isPrimary', label: 'Primary', visible: true },
  { id: 'usageCount', label: 'Usage', visible: true },
  { id: 'dailyUsage', label: 'Daily Usage', visible: true },
  { id: 'lastVerifiedAt', label: 'Last Verified', visible: false },
  { id: 'lastUsedAt', label: 'Last Used', visible: false },
  { id: 'description', label: 'Description', visible: false },
  { id: 'createdAt', label: 'Created', visible: false },
];

// ── Status badges ────────────────────────────────────────

const STATUS_VARIANT: Record<CredentialStatus, 'success' | 'warning' | 'danger' | 'default' | 'primary'> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  EXPIRED: 'warning',
  ERROR: 'danger',
  PENDING_SETUP: 'primary',
  REVOKED: 'danger',
};

// ── Provider display names ───────────────────────────────

const PROVIDER_DISPLAY: Record<string, string> = {
  GMAIL: 'Gmail', OUTLOOK: 'Outlook', SMTP: 'SMTP', SENDGRID: 'SendGrid', MAILGUN: 'Mailgun',
  WHATSAPP_BUSINESS: 'WhatsApp',
  RAZORPAY: 'Razorpay', STRIPE: 'Stripe',
  AWS_S3: 'AWS S3', MINIO: 'MinIO', GOOGLE_DRIVE: 'Google Drive', ONEDRIVE: 'OneDrive', DROPBOX: 'Dropbox',
  GOOGLE_MAPS: 'Google Maps',
  EXOTEL: 'Exotel', KNOWLARITY: 'Knowlarity', TWILIO: 'Twilio',
  FIREBASE: 'Firebase', CUSTOM: 'Custom',
};

// ── Provider colors ──────────────────────────────────────

const PROVIDER_COLOR: Record<string, string> = {
  GMAIL: '#EA4335', OUTLOOK: '#0078D4', SMTP: '#6B7280', SENDGRID: '#1A82E2', MAILGUN: '#F06B66',
  WHATSAPP_BUSINESS: '#25D366',
  RAZORPAY: '#2B83EA', STRIPE: '#635BFF',
  AWS_S3: '#FF9900', MINIO: '#C72C48', GOOGLE_DRIVE: '#4285F4', ONEDRIVE: '#0078D4', DROPBOX: '#0061FF',
  GOOGLE_MAPS: '#4285F4',
  EXOTEL: '#3CBC6F', KNOWLARITY: '#FF6600', TWILIO: '#F22F46',
  FIREBASE: '#FFCA28', CUSTOM: '#6B7280',
};

// ── Filter config ────────────────────────────────────────

const INTEGRATION_FILTER_CONFIG = {
  sections: [
    {
      title: 'Integration Filters',
      defaultOpen: true,
      filters: [
        {
          columnId: 'status',
          label: 'Status',
          filterType: 'master' as const,
          queryParam: 'status',
          options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'EXPIRED', label: 'Expired' },
            { value: 'ERROR', label: 'Error' },
            { value: 'PENDING_SETUP', label: 'Pending Setup' },
          ],
        },
        {
          columnId: 'provider',
          label: 'Provider',
          filterType: 'master' as const,
          queryParam: 'provider',
          options: Object.entries(PROVIDER_DISPLAY).map(([value, label]) => ({ value, label })),
        },
      ],
    },
  ],
};

// ── Component ────────────────────────────────────────────

export function IntegrationsList() {
  const { data: response, isLoading } = useCredentials();
  const { data: summaryData } = useCredentialStatusSummary();
  const revokeMutation = useRevokeCredential();
  const verifyMutation = useVerifyCredential();

  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: 'integration-credential',
    entityLabel: 'Credential',
    FormComponent: IntegrationCredentialForm,
    idProp: 'credentialId',
    editRoute: '/settings/integrations/:id',
    createRoute: '/settings/integrations/new',
    displayField: 'provider',
    panelWidth: 700,
  });

  const records = useMemo(() => {
    const raw = (response as any)?.data ?? response ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [response]);

  const summary = (summaryData as any)?.data ?? summaryData;

  const tableData = useMemo(
    () =>
      records.map((item: CredentialItem) => ({
        id: item.id,
        credentialId: item.id,
        provider: item.provider,
        instanceName: item.instanceName ?? '—',
        status: item.status,
        linkedAccountEmail: item.linkedAccountEmail ?? '—',
        isPrimary: item.isPrimary ? 'Yes' : 'No',
        usageCount: item.usageCount,
        dailyUsage: item.dailyUsageLimit
          ? `${item.dailyUsageCount}/${item.dailyUsageLimit}`
          : String(item.dailyUsageCount),
        lastVerifiedAt: item.lastVerifiedAt
          ? new Date(item.lastVerifiedAt).toLocaleString()
          : '—',
        lastUsedAt: item.lastUsedAt
          ? new Date(item.lastUsedAt).toLocaleString()
          : '—',
        description: item.description ?? '—',
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        // Pass full data for edit form
        _raw: item,
      })),
    [records],
  );

  const handleVerify = useCallback(
    async (row: any) => {
      setVerifyingId(row.id);
      try {
        await verifyMutation.mutateAsync(row.id);
        toast.success('Credential verified');
      } catch {
        toast.error('Verification failed');
      } finally {
        setVerifyingId(null);
      }
    },
    [verifyMutation],
  );

  const handleRevoke = useCallback(
    async (row: any) => {
      if (!window.confirm(`Revoke this ${PROVIDER_DISPLAY[row.provider] ?? row.provider} credential? This cannot be undone.`)) {
        return;
      }
      try {
        await revokeMutation.mutateAsync(row.id);
        toast.success('Credential revoked');
      } catch {
        toast.error('Failed to revoke');
      }
    },
    [revokeMutation],
  );

  if (isLoading) return <TableSkeleton title="Integrations" />;

  return (
    <div className="h-full flex flex-col">
      {/* Summary Cards */}
      {summary && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {summary.total ?? 0}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-green-600">
              {summary.active ?? 0}
            </p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-yellow-600">
              {summary.expired ?? 0}
            </p>
            <p className="text-xs text-gray-500">Expired</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold text-red-600">
              {summary.error ?? 0}
            </p>
            <p className="text-xs text-gray-500">Error</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0">
        <TableFull
          title="Integrations"
          tableKey="integrations-credentials"
          data={tableData}
          columns={INTEGRATION_COLUMNS}
          defaultViewMode="table"
          defaultDensity="comfortable"
          filterConfig={INTEGRATION_FILTER_CONFIG}
          onRowEdit={handleRowEdit}
          onCreate={handleCreate}
          headerActions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreate()}
            >
              <Icon name="plus" size={14} />
              Add Credential
            </Button>
          }
        />
      </div>
    </div>
  );
}
