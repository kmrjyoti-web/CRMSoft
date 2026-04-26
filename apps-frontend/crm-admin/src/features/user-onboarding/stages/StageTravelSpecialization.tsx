'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { userOnboardingService } from '../user-onboarding.service';

const SPECIALIZATIONS = [
  { code: 'LEISURE', label: 'Leisure & Holiday Packages' },
  { code: 'CORPORATE', label: 'Corporate Travel' },
  { code: 'MICE', label: 'MICE (Meetings, Incentives, Conferences)' },
  { code: 'ADVENTURE', label: 'Adventure & Trekking' },
  { code: 'PILGRIMAGE', label: 'Pilgrimage & Religious Tours' },
  { code: 'LUXURY', label: 'Luxury & Premium Travel' },
  { code: 'BUDGET', label: 'Budget & Backpacker Travel' },
  { code: 'CRUISE', label: 'Cruise Packages' },
];

interface StageProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function StageTravelSpecialization({ onComplete, onSkip }: StageProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (code: string) =>
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await userOnboardingService.completeCustomStage('travel_specialization', {
        specializations: selected,
      });
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    borderRadius: 10,
    border: `2px solid ${active ? 'var(--color-primary, #b8894a)' : 'var(--border-color, rgba(255,255,255,0.12))'}`,
    background: active ? 'var(--color-primary-soft, rgba(184,137,74,0.1))' : 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
    color: active ? 'var(--color-primary, #b8894a)' : 'var(--color-text)',
    transition: 'all 0.15s',
    width: '100%',
  });

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
        Travel Specializations
      </h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', marginBottom: 24 }}>
        Select the types of travel your business specializes in. (Optional — you can update later)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
        {SPECIALIZATIONS.map((sp) => (
          <button key={sp.code} type="button" style={cardStyle(selected.includes(sp.code))} onClick={() => toggle(sp.code)}>
            {sp.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer', padding: 0 }}
          >
            Skip for now
          </button>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <Button onClick={handleSubmit} loading={submitting} variant="primary">
            {selected.length > 0 ? `Continue (${selected.length} selected)` : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
