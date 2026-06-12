'use client';

import { useState } from 'react';

import { Button, Input, Icon } from '@/components/ui';
import { useOptOutContact } from '../hooks/useWaOptOuts';

interface WaOptOutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WaOptOutForm({ onSuccess, onCancel }: WaOptOutFormProps) {
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const optOutMut = useOptOutContact();

  const handleSubmit = () => {
    if (!phone.trim()) return;
    optOutMut.mutate(
      { phone: phone.trim(), reason: reason.trim() || undefined } as any,
      { onSuccess: () => onSuccess?.() },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <Input
        label="Phone Number"
        value={phone}
        onChange={setPhone}
        leftIcon={<Icon name="phone" size={16} />}
      />
      <Input
        label="Reason (optional)"
        value={reason}
        onChange={setReason}
        leftIcon={<Icon name="info" size={16} />}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!phone.trim() || optOutMut.isPending}
        >
          {optOutMut.isPending ? 'Processing...' : 'Opt Out'}
        </Button>
      </div>
    </div>
  );
}
