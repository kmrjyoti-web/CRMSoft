'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Tier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
  customerGrade?: string;
}

interface PriceTierEditorProps {
  tiers: Tier[];
  onChange: (tiers: Tier[]) => void;
}

export function PriceTierEditor({ tiers, onChange }: PriceTierEditorProps) {
  const addTier = () => {
    onChange([...tiers, { minQty: tiers.length > 0 ? (tiers[tiers.length - 1].maxQty ?? tiers[tiers.length - 1].minQty) + 1 : 10, pricePerUnit: 0 }]);
  };

  const updateTier = (index: number, field: keyof Tier, value: string | number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">B2B Price Tiers</label>
        <Button variant="outline" size="sm" type="button" onClick={addTier}>
          <Plus className="h-3 w-3" />
          Add Tier
        </Button>
      </div>

      {tiers.length === 0 && (
        <p className="text-sm text-gray-400">No tiers yet. Add a tier for bulk/B2B pricing.</p>
      )}

      {tiers.map((tier, index) => (
        <div key={index} className="flex items-end gap-2 p-3 rounded-lg border bg-gray-50">
          <Input
            label="Min Qty"
            type="number"
            value={tier.minQty}
            onChange={(e) => updateTier(index, 'minQty', Number(e.target.value))}
            className="w-24"
          />
          <Input
            label="Max Qty"
            type="number"
            value={tier.maxQty ?? ''}
            onChange={(e) => updateTier(index, 'maxQty', e.target.value ? Number(e.target.value) : undefined as unknown as number)}
            placeholder="Unlimited"
            className="w-24"
          />
          <Input
            label="Price/Unit"
            type="number"
            value={tier.pricePerUnit}
            onChange={(e) => updateTier(index, 'pricePerUnit', Number(e.target.value))}
            className="w-32"
          />
          <Input
            label="Grade"
            value={tier.customerGrade ?? ''}
            onChange={(e) => updateTier(index, 'customerGrade', e.target.value)}
            placeholder="e.g. Gold"
            className="w-28"
          />
          <Button variant="ghost" size="icon" type="button" onClick={() => removeTier(index)} className="text-red-500 shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
