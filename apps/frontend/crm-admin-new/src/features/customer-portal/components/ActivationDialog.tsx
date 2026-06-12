'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import type { EligibleEntity, CustomerMenuCategory, ActivatePortalDto } from '../types/customer-portal.types';

interface ActivationDialogProps {
  entity: EligibleEntity;
  categories: CustomerMenuCategory[];
  onConfirm: (dto: ActivatePortalDto) => void;
  onCancel: () => void;
  isLoading: boolean;
  tempPassword?: string | null;
}

export function ActivationDialog({
  entity, categories, onConfirm, onCancel, isLoading, tempPassword,
}: ActivationDialogProps) {
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState(categories.find(c => c.isDefault)?.id ?? '');
  const [emailError, setEmailError] = useState('');

  const validate = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Valid email required');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm({
      linkedEntityType: entity.type,
      linkedEntityId: entity.id,
      linkedEntityName: entity.name,
      email,
      displayName: entity.name,
      menuCategoryId: categoryId || undefined,
    });
  };

  // Show success state with temp password
  if (tempPassword) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>✅</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Portal Activated!</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{entity.name} can now log in to the customer portal.</div>
          </div>
        </div>

        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8,
          padding: '12px 16px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 6 }}>
            Temporary Password (share with customer):
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <code style={{ fontSize: 18, fontWeight: 700, color: '#15803d', letterSpacing: 2 }}>
              {tempPassword}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(tempPassword)}
              style={{ fontSize: 11, padding: '2px 8px', border: '1px solid #86efac', borderRadius: 4, background: 'white', cursor: 'pointer', color: '#16a34a' }}
            >
              Copy
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
            The customer must change this on first login.
          </div>
        </div>

        <Button variant="primary" onClick={onCancel} style={{ width: '100%' }}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Entity info */}
      <div style={{
        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
        padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ color: '#6b7280' }}>
          <Icon name={entity.type === 'ORGANIZATION' ? 'building-2' : 'user'} size={20} />
        </span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{entity.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{entity.type}</div>
        </div>
      </div>

      {/* Email input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Login Email *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          placeholder="customer@email.com"
          style={{
            width: '100%', padding: '8px 12px', fontSize: 14, borderRadius: 8,
            border: `1px solid ${emailError ? '#ef4444' : '#d1d5db'}`,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        {emailError && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{emailError}</div>}
      </div>

      {/* Menu category */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Menu Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', fontSize: 14, borderRadius: 8,
            border: '1px solid #d1d5db', background: 'white', cursor: 'pointer',
          }}
        >
          <option value="">— Use Default —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.isDefault ? ' (Default)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Info banner */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8,
        padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#1d4ed8',
        display: 'flex', gap: 8,
      }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}><Icon name="info" size={14} /></span>
        <span>A temporary password will be generated. Share it with the customer — they must change it on first login.</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="outline" onClick={onCancel} style={{ flex: 1 }} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading} style={{ flex: 2 }}>
          {isLoading ? 'Activating…' : 'Activate & Generate Password'}
        </Button>
      </div>
    </div>
  );
}
