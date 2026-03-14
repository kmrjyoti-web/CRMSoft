'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, Card, Icon, SelectInput } from '@/components/ui';
import { PageHeader, EmptyState, LoadingSpinner, QueryErrorState } from '@/components/common';
import { useMyTickets } from '../hooks/useSupport';
import type { SupportTicket, TicketStatus, TicketPriority } from '../types/support.types';

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'blue',
  IN_PROGRESS: 'yellow',
  WAITING_ON_CUSTOMER: 'orange',
  WAITING_ON_VENDOR: 'purple',
  RESOLVED: 'green',
  CLOSED: 'gray',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_ON_CUSTOMER: 'Waiting on You',
  WAITING_ON_VENDOR: 'Waiting on Vendor',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Waiting on You', value: 'WAITING_ON_CUSTOMER' },
  { label: 'Waiting on Vendor', value: 'WAITING_ON_VENDOR' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TicketList() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useMyTickets({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });

  const tickets: SupportTicket[] = data?.data?.data ?? data?.data ?? [];
  const meta = data?.data?.meta ?? data?.meta;

  if (isLoading) return <LoadingSpinner fullPage />;
  if (isError) return <QueryErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle="View and manage your support requests"
        actions={
          <Button onClick={() => router.push('/support/new')}>
            <Icon name="plus" size={16} /> New Ticket
          </Button>
        }
      />

      <div style={{ marginBottom: 16, maxWidth: 240 }}>
        <SelectInput
          label="Filter by Status"
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(String(v ?? ''));
            setPage(1);
          }}
        />
      </div>

      {tickets.length === 0 ? (
        <Card>
          <EmptyState
            icon="headphones"
            title="No tickets found"
            description={
              statusFilter
                ? 'No tickets match the selected status.'
                : 'You have not raised any support tickets yet.'
            }
            action={
              !statusFilter
                ? {
                    label: 'Create Ticket',
                    onClick: () => router.push('/support/new'),
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'left',
                  }}
                >
                  <th style={thStyle}>Ticket #</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Last Updated</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Messages</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() =>
                      router.push(`/support/tickets/${ticket.id}`)
                    }
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#f9fafb')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>
                        {ticket.ticketNo}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ticket.subject}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>
                        {ticket.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <Badge color={PRIORITY_COLORS[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td style={tdStyle}>
                      <Badge color={STATUS_COLORS[ticket.status]}>
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </Badge>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>
                        {formatDate(ticket.updatedAt)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 13,
                          color: '#6b7280',
                        }}
                      >
                        <Icon name="message-square" size={14} />
                        {ticket._count?.messages ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderTop: '1px solid #e5e7eb',
                fontSize: 13,
                color: '#6b7280',
              }}
            >
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPrevious}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: 14,
};
