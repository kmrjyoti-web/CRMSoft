'use client';

import { useState } from 'react';
import { Icon, Button, SelectInput, NumberInput, Switch } from '@/components/ui';
import {
  RESOURCE_LABELS, RESOURCE_ICONS, ALL_RESOURCE_KEYS,
} from '../utils/subscription-helpers';
import type { UpsertPlanLimitData, LimitType } from '../types/subscription.types';

interface PlanLimitsEditorProps {
  limits: UpsertPlanLimitData[];
  onChange: (limits: UpsertPlanLimitData[]) => void;
}

const LIMIT_TYPE_OPTIONS = [
  { value: 'TOTAL', label: 'Total' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'UNLIMITED', label: 'Unlimited' },
  { value: 'DISABLED', label: 'Disabled' },
];

export function PlanLimitsEditor({ limits, onChange }: PlanLimitsEditorProps) {
  const usedKeys = new Set(limits.map((l) => l.resourceKey));
  const availableKeys = ALL_RESOURCE_KEYS.filter((k) => !usedKeys.has(k));

  const updateLimit = (index: number, updates: Partial<UpsertPlanLimitData>) => {
    const newLimits = [...limits];
    newLimits[index] = { ...newLimits[index], ...updates };
    onChange(newLimits);
  };

  const addLimit = (resourceKey: string) => {
    onChange([
      ...limits,
      { resourceKey, limitType: 'TOTAL' as LimitType, limitValue: 100, isChargeable: false, chargeTokens: 0 },
    ]);
  };

  const removeLimit = (index: number) => {
    onChange(limits.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 130px 100px 90px 100px 40px', gap: '12px', alignItems: 'center' }}
        className="px-3 text-xs font-semibold text-gray-500 uppercase"
      >
        <div>Resource</div>
        <div>Type</div>
        <div>Limit</div>
        <div>Chargeable</div>
        <div>Tokens</div>
        <div></div>
      </div>

      {/* Rows */}
      {limits.map((limit, idx) => (
        <div
          key={limit.resourceKey}
          style={{ display: 'grid', gridTemplateColumns: '180px 130px 100px 90px 100px 40px', gap: '12px', alignItems: 'center' }}
          className="bg-gray-50 rounded-lg px-3 py-3"
        >
          <div className="flex items-center gap-2">
            <Icon
              name={(RESOURCE_ICONS[limit.resourceKey] ?? 'hash') as any}
              size={14}
              className="text-gray-400 flex-shrink-0"
            />
            <span className="text-sm font-medium text-gray-700 truncate">
              {RESOURCE_LABELS[limit.resourceKey] ?? limit.resourceKey}
            </span>
          </div>
          <div>
            <SelectInput
              options={LIMIT_TYPE_OPTIONS}
              value={limit.limitType}
              onChange={(v) => updateLimit(idx, { limitType: v as LimitType })}
            />
          </div>
          <div>
            {limit.limitType !== 'UNLIMITED' && limit.limitType !== 'DISABLED' ? (
              <NumberInput
                value={limit.limitValue}
                onChange={(v) => updateLimit(idx, { limitValue: v ?? 0 })}
                min={0}
              />
            ) : (
              <span className="text-sm text-gray-400 px-2">—</span>
            )}
          </div>
          <div className="flex justify-center">
            <Switch
              checked={limit.isChargeable ?? false}
              onChange={(v) => updateLimit(idx, { isChargeable: v })}
            />
          </div>
          <div>
            {limit.isChargeable ? (
              <NumberInput
                value={limit.chargeTokens ?? 0}
                onChange={(v) => updateLimit(idx, { chargeTokens: v ?? 0 })}
                min={0}
              />
            ) : (
              <span className="text-sm text-gray-400 px-2">—</span>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => removeLimit(idx)}
              className="p-1 rounded hover:bg-red-100"
            >
              <Icon name="trash-2" size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      ))}

      {/* Add button */}
      {availableKeys.length > 0 && (
        <div style={{ maxWidth: '280px' }} className="pt-2">
          <SelectInput
            options={availableKeys.map((k) => ({
              value: k,
              label: RESOURCE_LABELS[k] ?? k,
            }))}
            value=""
            onChange={(v) => v && addLimit(v as string)}
            label="Add resource limit"
          />
        </div>
      )}
    </div>
  );
}
