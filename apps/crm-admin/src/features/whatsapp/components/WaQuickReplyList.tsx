'use client';

import { useCallback } from 'react';

import { TableFull } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useEntityPanel } from '@/hooks/useEntityPanel';
import { useWaQuickReplies } from '../hooks/useWaQuickReplies';
import { WaQuickReplyForm } from './WaQuickReplyForm';

const columns = [
  { id: 'title', header: 'Title', accessorKey: 'title' },
  { id: 'shortcut', header: 'Shortcut', accessorKey: 'shortcut' },
  {
    id: 'content',
    header: 'Content',
    accessorKey: 'content',
    cell: ({ row }: any) => {
      const text = row.original.content ?? row.original.body ?? '';
      return text.length > 80 ? `${text.slice(0, 80)}...` : text;
    },
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ row }: any) =>
      row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '—',
  },
];

export function WaQuickReplyList() {
  const { data, isLoading } = useWaQuickReplies();
  const { handleCreate } = useEntityPanel({
    entityName: 'Quick Reply',
    FormComponent: WaQuickReplyForm,
    idProp: 'quickReplyId',
  });

  const replies = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  return (
    <div>
      <PageHeader title="Quick Replies" />
      <TableFull
        data={replies}
        columns={columns}
        title="Quick Replies"
        tableKey="wa-quick-replies"
        isLoading={isLoading}
        onCreate={handleCreate}
        defaultViewMode="table"
        defaultDensity="comfortable"
      />
    </div>
  );
}
