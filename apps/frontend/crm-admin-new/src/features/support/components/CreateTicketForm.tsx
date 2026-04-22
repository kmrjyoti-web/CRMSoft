'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Card, Icon, Input, SelectInput, TextareaInput } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useCreateTicket } from '../hooks/useSupport';
import type { CreateTicketPayload } from '../types/support.types';

const CATEGORY_OPTIONS = [
  { label: 'Bug', value: 'BUG' },
  { label: 'Feature Request', value: 'FEATURE_REQUEST' },
  { label: 'Billing', value: 'BILLING' },
  { label: 'Performance', value: 'PERFORMANCE' },
  { label: 'Data Issue', value: 'DATA_ISSUE' },
  { label: 'Security', value: 'SECURITY' },
  { label: 'Other', value: 'OTHER' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export function CreateTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createTicket = useCreateTicket();

  const linkedErrorId = searchParams.get('linkedErrorId') || '';

  const [form, setForm] = useState<CreateTicketPayload>({
    subject: '',
    description: '',
    category: 'BUG',
    priority: 'MEDIUM',
    linkedErrorIds: linkedErrorId ? [linkedErrorId] : [],
  });

  function updateField<K extends keyof CreateTicketPayload>(
    key: K,
    value: CreateTicketPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }

    createTicket.mutate(form, {
      onSuccess: (res) => {
        toast.success('Support ticket created successfully');
        const ticketId = res?.data?.id;
        if (ticketId) {
          router.push(`/support/tickets/${ticketId}`);
        } else {
          router.push('/support/tickets');
        }
      },
      onError: () => {
        toast.error('Failed to create ticket');
      },
    });
  }

  return (
    <div>
      <PageHeader
        title="New Support Ticket"
        subtitle="Report an issue or request a feature"
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/support/tickets')}
          >
            <Icon name="arrow-left" size={16} /> Back to Tickets
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              marginBottom: 20,
            }}
          >
            <SelectInput
              label="Category"
              leftIcon={<Icon name="tag" size={16} />}
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(v) => updateField('category', String(v))}
            />
            <SelectInput
              label="Priority"
              leftIcon={<Icon name="flag" size={16} />}
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(v) => updateField('priority', String(v))}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <Input
              label="Subject"
              leftIcon={<Icon name="type" size={16} />}
              value={form.subject}
              onChange={(v) => updateField('subject', String(v))}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <TextareaInput
              label="Description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={6}
            />
          </div>

          {form.linkedErrorIds && form.linkedErrorIds.length > 0 && (
            <div
              style={{
                marginBottom: 20,
                padding: '10px 14px',
                background: '#fef3c7',
                borderRadius: 6,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="link" size={14} color="#d97706" />
              <span>
                Linked error log(s):{' '}
                <strong>{form.linkedErrorIds.join(', ')}</strong>
              </span>
            </div>
          )}

          <div
            style={{
              padding: '10px 14px',
              background: '#eff6ff',
              borderRadius: 6,
              fontSize: 13,
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
            }}
          >
            <Icon name="info" size={14} />
            Auto-captured context (browser, recent errors, recent actions) will
            be attached automatically.
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push('/support/tickets')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTicket.isPending}>
              {createTicket.isPending ? (
                <>
                  <Icon name="loader" size={16} /> Submitting...
                </>
              ) : (
                <>
                  <Icon name="send" size={16} /> Submit Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
