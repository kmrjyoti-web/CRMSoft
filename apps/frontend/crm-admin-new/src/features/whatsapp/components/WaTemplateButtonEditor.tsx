'use client';

import { Button, Input, SelectInput, Icon } from '@/components/ui';

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

interface WaTemplateButtonEditorProps {
  buttons: TemplateButton[];
  onChange: (buttons: TemplateButton[]) => void;
}

export function WaTemplateButtonEditor({ buttons, onChange }: WaTemplateButtonEditorProps) {
  const addButton = () => {
    if (buttons.length >= 3) return;
    onChange([...buttons, { type: 'QUICK_REPLY', text: '' }]);
  };

  const updateButton = (index: number, updates: Partial<TemplateButton>) => {
    const updated = buttons.map((b, i) => (i === index ? { ...b, ...updates } : b));
    onChange(updated);
  };

  const removeButton = (index: number) => {
    onChange(buttons.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          Buttons ({buttons.length}/3)
        </label>
        <Button variant="outline" size="sm" onClick={addButton} disabled={buttons.length >= 3}>
          Add Button
        </Button>
      </div>

      {buttons.map((btn, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Button {i + 1}</span>
            <button
              onClick={() => removeButton(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Icon name="x" size={14} color="#ef4444" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
            <SelectInput
              label="Type"
              value={btn.type}
              onChange={(v) => updateButton(i, { type: v as TemplateButton['type'] })}
              options={[
                { value: 'QUICK_REPLY', label: 'Quick Reply' },
                { value: 'URL', label: 'URL' },
                { value: 'PHONE_NUMBER', label: 'Phone Number' },
              ]}
            />
            <Input
              label="Button Text"
              value={btn.text}
              onChange={(v) => updateButton(i, { text: v })}
            />
          </div>

          {btn.type === 'URL' && (
            <div style={{ marginTop: 8 }}>
              <Input
                label="URL"
                value={btn.url ?? ''}
                onChange={(v) => updateButton(i, { url: v })}
                leftIcon={<Icon name="external-link" size={16} />}
              />
            </div>
          )}

          {btn.type === 'PHONE_NUMBER' && (
            <div style={{ marginTop: 8 }}>
              <Input
                label="Phone Number"
                value={btn.phoneNumber ?? ''}
                onChange={(v) => updateButton(i, { phoneNumber: v })}
                leftIcon={<Icon name="phone" size={16} />}
              />
            </div>
          )}
        </div>
      ))}

      {buttons.length === 0 && (
        <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 16 }}>
          No buttons added. Click &quot;Add Button&quot; to add up to 3 buttons.
        </p>
      )}
    </div>
  );
}
