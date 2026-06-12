'use client';

import { useRouter } from 'next/navigation';

import { TableFull, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useWaBroadcastsList } from '../hooks/useWaBroadcasts';
import { BROADCAST_STATUS_BADGE } from '../utils/wa-status-badges';
import { BROADCAST_FILTER_CONFIG } from '../utils/wa-filters';

const columns = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }: any) => {
      const s = row.original.status;
      return <Badge variant={BROADCAST_STATUS_BADGE[s] ?? 'default'}>{s}</Badge>;
    },
  },
  { id: 'templateName', header: 'Template', accessorKey: 'templateName' },
  { id: 'totalRecipients', header: 'Recipients', accessorKey: 'totalRecipients' },
  { id: 'sentCount', header: 'Sent', accessorKey: 'sentCount' },
  { id: 'deliveredCount', header: 'Delivered', accessorKey: 'deliveredCount' },
  {
    id: 'scheduledAt',
    header: 'Scheduled',
    accessorKey: 'scheduledAt',
    cell: ({ row }: any) =>
      row.original.scheduledAt
        ? new Date(row.original.scheduledAt).toLocaleString()
        : '—',
  },
];

export function WaBroadcastList() {
  const router = useRouter();
  const { data, isLoading } = useWaBroadcastsList();

  const broadcasts = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  return (
    <div>
      <PageHeader title="Broadcasts" />
      <TableFull
        data={broadcasts}
        columns={columns}
        title="Broadcasts"
        tableKey="wa-broadcasts"
        isLoading={isLoading}
        onCreate={() => router.push('/whatsapp/broadcasts/new')}
        onRowEdit={(row: any) => router.push(`/whatsapp/broadcasts/${row.id}`)}
        defaultViewMode="table"
        defaultDensity="comfortable"
        filterConfig={BROADCAST_FILTER_CONFIG}
      />
    </div>
  );
}
