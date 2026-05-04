'use client';

import { useRouter } from 'next/navigation';

import { TableFull, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useWaTemplatesList, useSyncWaTemplates } from '../hooks/useWaTemplates';
import { TEMPLATE_STATUS_BADGE, CATEGORY_BADGE } from '../utils/wa-status-badges';
import { TEMPLATE_FILTER_CONFIG } from '../utils/wa-filters';

const columns = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }: any) => {
      const s = row.original.status;
      return <Badge variant={TEMPLATE_STATUS_BADGE[s] ?? 'default'}>{s}</Badge>;
    },
  },
  {
    id: 'category',
    header: 'Category',
    accessorKey: 'category',
    cell: ({ row }: any) => {
      const c = row.original.category;
      return <Badge variant={CATEGORY_BADGE[c] ?? 'default'}>{c}</Badge>;
    },
  },
  { id: 'language', header: 'Language', accessorKey: 'language' },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ row }: any) =>
      row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '—',
  },
];

export function WaTemplateList() {
  const router = useRouter();
  const { data, isLoading } = useWaTemplatesList();
  const syncMutation = useSyncWaTemplates();

  const templates = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  return (
    <div>
      <PageHeader
        title="WhatsApp Templates"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? 'Syncing...' : 'Sync from Meta'}
            </Button>
          </div>
        }
      />
      <TableFull
        data={templates}
        columns={columns}
        title="Templates"
        tableKey="wa-templates"
        isLoading={isLoading}
        onCreate={() => router.push('/whatsapp/templates/new')}
        onRowEdit={(row: any) => router.push(`/whatsapp/templates/${row.id}`)}
        defaultViewMode="table"
        defaultDensity="comfortable"
        filterConfig={TEMPLATE_FILTER_CONFIG}
      />
    </div>
  );
}
