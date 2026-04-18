'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Input, SelectInput, DatePicker, Icon } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useWaTemplatesList } from '../hooks/useWaTemplates';
import { useCreateWaBroadcast, useAddBroadcastRecipients, useStartBroadcast } from '../hooks/useWaBroadcasts';
import { RecipientUploader } from './RecipientUploader';

interface Recipient {
  phone: string;
  name?: string;
}

const STEPS = ['Setup', 'Recipients', 'Preview', 'Confirm'] as const;

export function WaBroadcastWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Setup state
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [throttleRate, setThrottleRate] = useState('');

  // Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const { data: templatesData } = useWaTemplatesList({ status: 'APPROVED' });
  const templates = Array.isArray(templatesData?.data) ? templatesData.data : [];
  const selectedTemplate = templates.find((t: any) => t.id === templateId);

  const createMut = useCreateWaBroadcast();
  const addRecipientsMut = useAddBroadcastRecipients();
  const startMut = useStartBroadcast();

  const handleCreate = async () => {
    const broadcast = await createMut.mutateAsync({
      name,
      templateId,
      scheduledAt: scheduledAt || undefined,
      throttleRate: throttleRate ? Number(throttleRate) : undefined,
    } as any);

    const broadcastId = broadcast?.data?.id ?? broadcast?.id;
    if (broadcastId && recipients.length > 0) {
      await addRecipientsMut.mutateAsync({
        id: broadcastId,
        data: { recipients: recipients.map((r) => ({ phone: r.phone, name: r.name })) } as any,
      });

      if (!scheduledAt) {
        await startMut.mutateAsync(broadcastId);
      }
    }

    router.push('/whatsapp/broadcasts');
  };

  return (
    <div>
      <PageHeader
        title="New Broadcast"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push('/whatsapp/broadcasts')}>
            Cancel
          </Button>
        }
      />

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px 0',
              borderBottom: `3px solid ${i <= step ? '#2563eb' : '#e5e7eb'}`,
              fontSize: 13,
              fontWeight: i === step ? 600 : 400,
              color: i <= step ? '#2563eb' : '#94a3b8',
            }}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {/* Step 1: Setup */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Broadcast Name"
              value={name}
              onChange={setName}
              leftIcon={<Icon name="radio" size={16} />}
            />
            <SelectInput
              label="Template"
              value={templateId}
              onChange={(v) => setTemplateId(v as string)}
              options={templates.map((t: any) => ({ value: t.id, label: `${t.name} (${t.category})` }))}
            />
            <DatePicker
              label="Schedule (optional)"
              value={scheduledAt}
              onChange={setScheduledAt}
            />
            <Input
              label="Throttle Rate (msgs/second, optional)"
              value={throttleRate}
              onChange={setThrottleRate}
              leftIcon={<Icon name="zap" size={16} />}
            />
          </div>
        )}

        {/* Step 2: Recipients */}
        {step === 1 && (
          <RecipientUploader recipients={recipients} onChange={setRecipients} />
        )}

        {/* Step 3: Preview */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
              Preview
            </h3>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <dt style={{ fontSize: 12, color: '#94a3b8' }}>Name</dt>
                <dd style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{name}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 12, color: '#94a3b8' }}>Template</dt>
                <dd style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                  {selectedTemplate?.name ?? templateId}
                </dd>
              </div>
              <div>
                <dt style={{ fontSize: 12, color: '#94a3b8' }}>Recipients</dt>
                <dd style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{recipients.length}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 12, color: '#94a3b8' }}>Schedule</dt>
                <dd style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                  {scheduledAt ? new Date(scheduledAt).toLocaleString() : 'Send Now'}
                </dd>
              </div>
            </dl>

            {selectedTemplate?.body && (
              <div style={{ marginTop: 16 }}>
                <dt style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Template Body</dt>
                <div
                  style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#475569',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedTemplate.body}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Icon name="radio" size={48} color="#2563eb" />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginTop: 12 }}>
              Ready to {scheduledAt ? 'Schedule' : 'Send'}
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
              {scheduledAt
                ? `This broadcast will be scheduled for ${new Date(scheduledAt).toLocaleString()}`
                : `This broadcast will be sent immediately to ${recipients.length} recipients`}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
        >
          Previous
        </Button>
        {step < 3 ? (
          <Button
            variant="primary"
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 0 && (!name || !templateId)) ||
              (step === 1 && recipients.length === 0)
            }
          >
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={createMut.isPending}
          >
            {createMut.isPending ? 'Creating...' : scheduledAt ? 'Schedule Broadcast' : 'Start Broadcast'}
          </Button>
        )}
      </div>
    </div>
  );
}
