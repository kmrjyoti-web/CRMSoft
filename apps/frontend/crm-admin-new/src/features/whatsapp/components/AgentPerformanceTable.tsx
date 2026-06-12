'use client';

import { TableFull } from '@/components/ui';

import type { WaAgentPerformance } from '../types/analytics.types';

interface AgentPerformanceTableProps {
  data?: WaAgentPerformance[];
  isLoading?: boolean;
}

const columns = [
  { id: 'agentName', header: 'Agent', accessorKey: 'agentName' },
  { id: 'assignedConversations', header: 'Assigned', accessorKey: 'assignedConversations' },
  { id: 'resolvedConversations', header: 'Resolved', accessorKey: 'resolvedConversations' },
  { id: 'avgResponseTime', header: 'Avg Response (min)', accessorKey: 'avgResponseTime' },
  { id: 'messagesSent', header: 'Messages Sent', accessorKey: 'messagesSent' },
  {
    id: 'resolutionRate',
    header: 'Resolution %',
    accessorKey: 'resolvedConversations',
    cell: ({ row }: { row: { original: WaAgentPerformance } }) => {
      const { assignedConversations, resolvedConversations } = row.original;
      const rate = assignedConversations
        ? Math.round((resolvedConversations / assignedConversations) * 100)
        : 0;
      return `${rate}%`;
    },
  },
];

export function AgentPerformanceTable({ data, isLoading }: AgentPerformanceTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
        Agent Performance
      </h3>
      <TableFull
        data={data ?? []}
        columns={columns}
        title=""
        tableKey="wa-agent-performance"
        isLoading={isLoading}
        defaultViewMode="table"
        defaultDensity="compact"
      />
    </div>
  );
}
