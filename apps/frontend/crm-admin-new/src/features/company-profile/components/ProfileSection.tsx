'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui';

interface Props {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ProfileSection({ title, icon, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: 'white', borderRadius: 12, border: '1px solid #e5e7eb',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', borderBottom: open ? '1px solid #f3f4f6' : 'none',
        }}
      >
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name={icon as any} size={16} color="#2563eb" />
          </div>
        )}
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111827' }}>{title}</span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={14} color="#6b7280" />
      </button>
      {open && <div style={{ padding: '16px 20px' }}>{children}</div>}
    </div>
  );
}
