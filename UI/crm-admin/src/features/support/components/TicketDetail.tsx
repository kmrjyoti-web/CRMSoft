'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Badge, Card, Icon, Input, TextareaInput } from '@/components/ui';
import { PageHeader, LoadingSpinner, QueryErrorState } from '@/components/common';
import {
  useTicket,
  useAddMessage,
  useCloseTicket,
  useRateTicket,
} from '../hooks/useSupport';
import type {
import { formatDate } from "@/lib/format-date";
  TicketStatus,
  TicketPriority,
  TicketMessage,
} from '../types/support.types';

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


interface TicketDetailProps {
  ticketId: string;
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useTicket(ticketId);
  const addMessage = useAddMessage();
  const closeTicket = useCloseTicket();
  const rateTicket = useRateTicket();

  const [replyText, setReplyText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  if (isLoading) return <LoadingSpinner fullPage />;
  if (isError) return <QueryErrorState onRetry={refetch} />;

  const ticket = data?.data;
  if (!ticket) {
    return <QueryErrorState message="Ticket not found" onRetry={refetch} />;
  }

  const messages = ticket.messages ?? [];
  const canClose = ticket.status === 'RESOLVED';
  const canReply = ticket.status !== 'CLOSED';
  const showRatingForm =
    (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') &&
    !ticket.satisfactionRating;

  function handleSendReply() {
    if (!replyText.trim()) {
      toast.error('Please enter a message');
      return;
    }
    addMessage.mutate(
      { ticketId, message: replyText.trim() },
      {
        onSuccess: () => {
          toast.success('Reply sent');
          setReplyText('');
        },
        onError: () => toast.error('Failed to send reply'),
      },
    );
  }

  function handleClose() {
    closeTicket.mutate(ticketId, {
      onSuccess: () => toast.success('Ticket closed'),
      onError: () => toast.error('Failed to close ticket'),
    });
  }

  function handleRate() {
    if (ratingValue < 1 || ratingValue > 5) {
      toast.error('Please select a rating (1-5)');
      return;
    }
    rateTicket.mutate(
      { id: ticketId, rating: ratingValue, comment: ratingComment || undefined },
      {
        onSuccess: () => toast.success('Thank you for your feedback!'),
        onError: () => toast.error('Failed to submit rating'),
      },
    );
  }

  return (
    <div>
      <PageHeader
        title={`Ticket ${ticket.ticketNo}`}
        subtitle={ticket.subject}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {canClose && (
              <Button
                color="danger"
                variant="outline"
                onClick={handleClose}
                disabled={closeTicket.isPending}
              >
                <Icon name="x-circle" size={16} /> Close Ticket
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/support/tickets')}
            >
              <Icon name="arrow-left" size={16} /> Back
            </Button>
          </div>
        }
      />

      {/* Ticket Info */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: 20 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <InfoItem
              label="Category"
              value={ticket.category.replace(/_/g, ' ')}
            />
            <InfoItem
              label="Priority"
              value={
                <Badge color={PRIORITY_COLORS[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              }
            />
            <InfoItem
              label="Status"
              value={
                <Badge color={STATUS_COLORS[ticket.status]}>
                  {STATUS_LABELS[ticket.status] ?? ticket.status}
                </Badge>
              }
            />
            <InfoItem label="Created" value={formatDate(ticket.createdAt)} />
            {ticket.assignedToName && (
              <InfoItem label="Assigned To" value={ticket.assignedToName} />
            )}
            {ticket.slaBreached && (
              <InfoItem
                label="SLA"
                value={<Badge color="red">Breached</Badge>}
              />
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#6b7280',
                marginBottom: 4,
              }}
            >
              Description
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#1f2937',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {ticket.description}
            </div>
          </div>

          {ticket.linkedErrorIds && ticket.linkedErrorIds.length > 0 && (
            <div
              style={{
                padding: '8px 12px',
                background: '#fef3c7',
                borderRadius: 6,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="link" size={14} color="#d97706" />
              Linked errors: {ticket.linkedErrorIds.join(', ')}
            </div>
          )}
        </div>
      </Card>

      {/* Auto Context */}
      {ticket.autoContext && Object.keys(ticket.autoContext).length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ padding: 20 }}>
            <h3
              style={{
                margin: '0 0 12px',
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="cpu" size={16} /> Auto-Captured Context
            </h3>
            <div
              style={{
                background: '#f9fafb',
                padding: 12,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(ticket.autoContext, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}

      {/* Message Thread */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: 20 }}>
          <h3
            style={{
              margin: '0 0 16px',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="message-square" size={16} /> Messages (
            {messages.length})
          </h3>

          {messages.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 0',
                color: '#9ca3af',
                fontSize: 14,
              }}
            >
              No messages yet. Start the conversation below.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 16,
                maxHeight: 500,
                overflowY: 'auto',
                padding: '0 4px',
              }}
            >
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}

          {/* Reply Form */}
          {canReply && (
            <div
              style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: 16,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
              }}
            >
              <div style={{ flex: 1 }}>
                <TextareaInput
                  label="Reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSendReply}
                disabled={addMessage.isPending || !replyText.trim()}
              >
                {addMessage.isPending ? (
                  <Icon name="loader" size={16} />
                ) : (
                  <Icon name="send" size={16} />
                )}
                Send
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Resolution Info */}
      {ticket.resolution && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ padding: 20 }}>
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#16a34a',
              }}
            >
              <Icon name="check-circle" size={16} /> Resolution
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
              {ticket.resolution}
            </p>
            {ticket.resolvedAt && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af' }}>
                Resolved on {formatDate(ticket.resolvedAt)}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Rating Form */}
      {showRatingForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ padding: 20 }}>
            <h3
              style={{
                margin: '0 0 12px',
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="star" size={16} /> Rate this Support Experience
            </h3>

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 12,
              }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingValue(n)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Icon
                    name="star"
                    size={28}
                    color={n <= ratingValue ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <Input
                label="Comment (optional)"
                leftIcon={<Icon name="message-circle" size={16} />}
                value={ratingComment}
                onChange={(v) => setRatingComment(String(v))}
              />
            </div>

            <Button
              onClick={handleRate}
              disabled={rateTicket.isPending || ratingValue < 1}
            >
              {rateTicket.isPending ? (
                <Icon name="loader" size={16} />
              ) : (
                <Icon name="check" size={16} />
              )}{' '}
              Submit Rating
            </Button>
          </div>
        </Card>
      )}

      {/* Already rated */}
      {ticket.satisfactionRating && (
        <Card>
          <div
            style={{
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}
            >
              Your Rating:
            </span>
            {[1, 2, 3, 4, 5].map((n) => (
              <Icon
                key={n}
                name="star"
                size={20}
                color={
                  n <= (ticket.satisfactionRating ?? 0)
                    ? '#f59e0b'
                    : '#d1d5db'
                }
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── Helper Components ── */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>
        {value}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isCustomer = message.senderType === 'CUSTOMER';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isCustomer ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '10px 14px',
          borderRadius: 12,
          background: isCustomer ? '#2563eb' : '#f3f4f6',
          color: isCustomer ? '#ffffff' : '#1f2937',
          borderBottomRightRadius: isCustomer ? 4 : 12,
          borderBottomLeftRadius: isCustomer ? 12 : 4,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 4,
            opacity: 0.8,
          }}
        >
          {message.senderName ?? (isCustomer ? 'You' : 'Support Agent')}
          {message.isInternal && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 10,
                background: 'rgba(0,0,0,0.15)',
                padding: '1px 5px',
                borderRadius: 4,
              }}
            >
              Internal
            </span>
          )}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          {message.message}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              display: 'flex',
              gap: 4,
              alignItems: 'center',
              opacity: 0.8,
            }}
          >
            <Icon name="paperclip" size={12} />
            {message.attachments.length} attachment(s)
          </div>
        )}
        <div
          style={{
            fontSize: 11,
            marginTop: 4,
            opacity: 0.6,
            textAlign: 'right',
          }}
        >
          {formatDate(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
