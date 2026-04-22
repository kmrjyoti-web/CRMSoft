'use client';

import { useRouter } from 'next/navigation';

import { TableFull, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useWaChatbotFlows, useToggleChatbotFlow } from '../hooks/useWaChatbot';
import { CHATBOT_STATUS_BADGE } from '../utils/wa-status-badges';
import { CHATBOT_FILTER_CONFIG } from '../utils/wa-filters';

export function ChatbotFlowList() {
  const router = useRouter();
  const { data, isLoading } = useWaChatbotFlows();
  const toggleMut = useToggleChatbotFlow();

  const flows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  const columns = [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => {
        const s = row.original.status;
        return <Badge variant={CHATBOT_STATUS_BADGE[s] ?? 'default'}>{s}</Badge>;
      },
    },
    {
      id: 'triggerKeywords',
      header: 'Keywords',
      accessorKey: 'triggerKeywords',
      cell: ({ row }: any) => {
        const kw = row.original.triggerKeywords;
        return Array.isArray(kw)
          ? kw.map((k: string, i: number) => (
              <Badge key={i} variant="outline" style={{ marginRight: 4 }}>{k}</Badge>
            ))
          : '—';
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => {
        const { id, status } = row.original;
        const nextStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleMut.mutate({ id, status: nextStatus });
            }}
            disabled={toggleMut.isPending}
          >
            {status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Chatbot Flows" />
      <TableFull
        data={flows}
        columns={columns}
        title="Chatbot Flows"
        tableKey="wa-chatbot-flows"
        isLoading={isLoading}
        onCreate={() => router.push('/whatsapp/chatbot/new')}
        onRowEdit={(row: any) => router.push(`/whatsapp/chatbot/${row.id}`)}
        defaultViewMode="table"
        defaultDensity="comfortable"
        filterConfig={CHATBOT_FILTER_CONFIG}
      />
    </div>
  );
}
