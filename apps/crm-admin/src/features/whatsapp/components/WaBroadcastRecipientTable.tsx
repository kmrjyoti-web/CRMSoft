'use client';

import { TableFull, Badge } from '@/components/ui';
import { BROADCAST_STATUS_BADGE } from '../utils/wa-status-badges';
import { useWaBroadcastRecipients } from '../hooks/useWaBroadcasts';

interface WaBroadcastRecipientTableProps {
  broadcastId: string;
}

const columns = [
  { id: 'phone', header: 'Phone', accessorKey: 'phone' },
  { id: 'contactName', header: 'Name', accessorKey: 'contactName' },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }: any) => {
      const s = row.original.status;
      const variant = s === 'DELIVERED' ? 'success' : s === 'SENT' ? 'primary' : s === 'FAILED' ? 'danger' : 'default';
      return <Badge variant={variant as any}>{s}</Badge>;
    },
  },
  {
    id: 'sentAt',
    header: 'Sent At',
    accessorKey: 'sentAt',
    cell: ({ row }: any) =>
      row.original.sentAt ? new Date(row.original.sentAt).toLocaleString() : '—',
  },
  { id: 'errorMessage', header: 'Error', accessorKey: 'errorMessage' },
];

export function WaBroadcastRecipientTable({ broadcastId }: WaBroadcastRecipientTableProps) {
  const { data, isLoading } = useWaBroadcastRecipients(broadcastId);

  const recipients = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  return (
    <TableFull
      data={recipients}
      columns={columns}
      title="Recipients"
      tableKey="wa-broadcast-recipients"
      isLoading={isLoading}
      defaultViewMode="table"
      defaultDensity="compact"
    />
  );
}
