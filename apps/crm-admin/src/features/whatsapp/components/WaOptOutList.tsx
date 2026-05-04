'use client';

import { TableFull, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useEntityPanel } from '@/hooks/useEntityPanel';
import { useWaOptOuts, useOptInContact } from '../hooks/useWaOptOuts';
import { WaOptOutForm } from './WaOptOutForm';

export function WaOptOutList() {
  const { data, isLoading } = useWaOptOuts();
  const optInMut = useOptInContact();
  const { handleCreate } = useEntityPanel({
    entityName: 'Opt Out',
    FormComponent: WaOptOutForm,
    idProp: 'optOutId',
  });

  const optOuts = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  const columns = [
    { id: 'phone', header: 'Phone', accessorKey: 'phone' },
    { id: 'contactName', header: 'Name', accessorKey: 'contactName' },
    { id: 'reason', header: 'Reason', accessorKey: 'reason' },
    {
      id: 'optedOutAt',
      header: 'Opted Out',
      accessorKey: 'optedOutAt',
      cell: ({ row }: any) =>
        row.original.optedOutAt
          ? new Date(row.original.optedOutAt).toLocaleDateString()
          : row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : '—',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            optInMut.mutate({ phone: row.original.phone } as any);
          }}
          disabled={optInMut.isPending}
        >
          Opt In
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Opt-out Management" />
      <TableFull
        data={optOuts}
        columns={columns}
        title="Opted-out Contacts"
        tableKey="wa-opt-outs"
        isLoading={isLoading}
        onCreate={handleCreate}
        defaultViewMode="table"
        defaultDensity="comfortable"
      />
    </div>
  );
}
