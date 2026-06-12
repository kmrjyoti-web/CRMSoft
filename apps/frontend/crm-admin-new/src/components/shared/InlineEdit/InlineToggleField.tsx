'use client';

interface InlineToggleFieldProps {
  label: string;
  value?: boolean;
  onSave: (v: boolean) => void;
  description?: string;
}

export function InlineToggleField({ label, value, onSave, description }: InlineToggleFieldProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: '#6b7280' }}>{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onSave(!value)}
        style={{
          width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
          background: value ? '#2563eb' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
        aria-checked={value}
        role="switch"
      >
        <span style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}
