'use client';

import { useState, useRef } from 'react';

import { Button, Input, Icon } from '@/components/ui';

interface Recipient {
  phone: string;
  name?: string;
}

interface RecipientUploaderProps {
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
}

export function RecipientUploader({ recipients, onChange }: RecipientUploaderProps) {
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const addManual = () => {
    if (!manualPhone.trim()) return;
    onChange([...recipients, { phone: manualPhone.trim(), name: manualName.trim() || undefined }]);
    setManualPhone('');
    setManualName('');
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1); // skip header
      const parsed: Recipient[] = [];
      for (const line of lines) {
        const [phone, name] = line.split(',').map((s) => s.trim().replace(/"/g, ''));
        if (phone) parsed.push({ phone, name: name || undefined });
      }
      onChange([...recipients, ...parsed]);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeRecipient = (index: number) => {
    onChange(recipients.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={14} /> Upload CSV
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleCSV}
        />
      </div>

      {/* Manual Add */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Phone Number"
            value={manualPhone}
            onChange={setManualPhone}
            leftIcon={<Icon name="phone" size={16} />}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input
            label="Name (optional)"
            value={manualName}
            onChange={setManualName}
            leftIcon={<Icon name="user" size={16} />}
          />
        </div>
        <Button variant="primary" size="sm" onClick={addManual} disabled={!manualPhone.trim()}>
          Add
        </Button>
      </div>

      {/* Recipient list */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
        Recipients ({recipients.length})
      </div>
      {recipients.length === 0 ? (
        <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 16 }}>
          No recipients added yet. Upload a CSV or add manually.
        </p>
      ) : (
        <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          {recipients.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                borderBottom: '1px solid #f8fafc',
                fontSize: 13,
              }}
            >
              <span>
                <strong>{r.phone}</strong>
                {r.name && <span style={{ color: '#94a3b8', marginLeft: 8 }}>{r.name}</span>}
              </span>
              <button
                onClick={() => removeRecipient(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              >
                <Icon name="x" size={14} color="#ef4444" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
